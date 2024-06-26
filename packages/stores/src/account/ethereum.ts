import { AccountSetBaseSuper, WalletStatus } from "./base";
import { EvmQueries, IQueriesStore, QueriesSetBase } from "../query";
import {
  ChainGetter,
  erc20MetadataInterface,
  nativeFetBridgeInterface,
} from "../common";
import { DenomHelper, LocalKVStore } from "@keplr-wallet/common";
import { Dec, DecUtils } from "@keplr-wallet/unit";
import {
  AppCurrency,
  EthSignType,
  KeplrSignOptions,
  StdFee,
} from "@keplr-wallet/types";
import { DeepReadonly } from "utility-types";
import { Buffer } from "buffer/";
import { CosmosAccount } from "./cosmos";
import { txEventsWithPreOnFulfill } from "./utils";
import Axios, { AxiosInstance } from "axios";
import { MakeTxResponse, ITxn } from "./types";
import {
  JsonRpcProvider,
  TransactionReceipt,
  TransactionRequest,
} from "@ethersproject/providers";

import { isAddress } from "@ethersproject/address";
import { KVStore } from "@keplr-wallet/common";
import { BigNumber } from "@ethersproject/bignumber";

export interface EthereumAccount {
  ethereum: EthereumAccountImpl;
}

export const EthereumAccount = {
  use(options: {
    queriesStore: IQueriesStore<EvmQueries>;
  }): (
    base: AccountSetBaseSuper & CosmosAccount,
    chainGetter: ChainGetter,
    chainId: string
  ) => EthereumAccount {
    return (base, chainGetter, chainId) => {
      return {
        ethereum: new EthereumAccountImpl(
          base,
          chainGetter,
          chainId,
          options.queriesStore
        ),
      };
    };
  },
};

export class EthereumAccountImpl {
  public broadcastMode: "sync" | "async" | "block" = "sync";
  protected kvStore: KVStore;
  constructor(
    protected readonly base: AccountSetBaseSuper & CosmosAccount,
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: IQueriesStore<EvmQueries>
  ) {
    this.base.registerMakeSendTokenFn(this.processMakeSendTokenTx.bind(this));
    this.kvStore = new LocalKVStore("Transactions");
  }

  get instance(): AxiosInstance {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    return Axios.create({
      ...{
        baseURL: chainInfo.rpc,
      },
    });
  }

  get ethersInstance(): JsonRpcProvider {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    return new JsonRpcProvider(chainInfo.rpc);
  }

  protected processMakeSendTokenTx(
    amount: string,
    currency: AppCurrency,
    recipient: string
  ) {
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);

    const actualAmount = `0x${(() => {
      let dec = new Dec(amount);
      dec = dec.mul(DecUtils.getPrecisionDec(currency.coinDecimals));
      return dec.truncate().toBigNumber().toString(16);
    })()}`;

    const isEvm =
      this.chainGetter.getChain(this.chainId).features?.includes("evm") ??
      false;
    if (denomHelper.type === "native" && isEvm) {
      if (!isAddress(recipient)) {
        throw new Error("Invalid receipient address");
      }

      return this.makeEthereumTx(
        "send",
        {
          to: recipient,
          value: actualAmount,
        },
        {
          onBroadcasted: async (txHash) => {
            await this.updateStoredTransactionInfo(
              Buffer.from(txHash).toString(),
              {
                hash: Buffer.from(txHash).toString(),
                status: "pending",
                amount: amount,
                type: "Send",
                symbol: currency.coinDenom,
              }
            );
          },
        }
      );
    } else if (denomHelper.type === "erc20") {
      return this.makeEthereumTx(
        "send",
        {
          to: denomHelper.contractAddress,
          data: erc20MetadataInterface.encodeFunctionData("transfer", [
            recipient,
            actualAmount,
          ]),
        },
        {
          onBroadcasted: async (txHash) => {
            await this.updateStoredTransactionInfo(
              Buffer.from(txHash).toString(),
              {
                hash: Buffer.from(txHash).toString(),
                status: "pending",
                amount: amount,
                type: "Send",
                symbol: currency.coinDenom,
              }
            );
          },
          onFulfill: (tx: TransactionReceipt) => {
            if (tx.status && tx.status === 1) {
              // After succeeding to send token, refresh the balance.
              const queryBalance = this.queries.queryBalances
                .getQueryBech32Address(this.base.bech32Address)
                .balances.find((bal) => {
                  return (
                    bal.currency.coinMinimalDenom === currency.coinMinimalDenom
                  );
                });

              if (queryBalance) {
                queryBalance.fetch();
              }
            }
          },
        }
      );
    }
  }

  makeEthereumTx(
    type: string | "unknown",
    params: TransactionRequest,
    // eslint-disable-next-line @typescript-eslint/ban-types
    preOnTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ): MakeTxResponse {
    return {
      simulate: () => {
        return this.simulateTx(params);
      },
      msgs: async () => {
        return {
          aminoMsgs: [],
          protoMsgs: [],
        };
      },
      send: async (
        fee: StdFee,
        _?: string,
        __?: KeplrSignOptions,
        onTxEvents?:
          | ((tx: any) => void)
          | {
              onBroadcastFailed?: (e?: Error) => void;
              onBroadcasted?: (txHash: Uint8Array) => void;
              onFulfill?: (tx: any) => void;
            }
      ): Promise<void> => {
        return this.sendTx(
          type,
          params,
          fee,
          txEventsWithPreOnFulfill(onTxEvents, preOnTxEvents)
        );
      },
      simulateAndSend: async () => {},
      sendWithGasPrice: async () => {},
    };
  }

  async simulateTx(params: TransactionRequest): Promise<{
    gasUsed: number;
  }> {
    const result = await this.instance.post("", {
      jsonrpc: "2.0",
      id: "1",
      method: "eth_estimateGas",
      params: [{ from: this.base.ethereumHexAddress, ...params }],
    });

    if (result.data.error && result.data.error.message) {
      throw new Error(result.data.error.message);
    }

    if (!result.data.result) {
      throw new Error("Unknown error");
    }

    const gasUsed = parseInt(result.data.result);
    if (Number.isNaN(gasUsed)) {
      throw new Error(`Invalid integer gas: ${result.data.result}`);
    }

    return {
      gasUsed,
    };
  }

  async sendTx(
    type: string | "unknown",
    params: TransactionRequest,
    fee: StdFee,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcastFailed?: (e?: Error) => void;
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ) {
    this.base.setTxTypeInProgress(type);

    let txHash: string, rawTxData: TransactionRequest;
    try {
      ({ txHash, rawTxData } = await this.broadcastTx(params, fee));
      await this.storeTransactionHash(
        {
          hash: Buffer.from(txHash).toString(),
          status: "pending",
          rawTxData: rawTxData,
          lastSpeedUpAt: new Date(),
        },
        this.kvStore
      );
    } catch (e: any) {
      if (
        onTxEvents &&
        "onBroadcastFailed" in onTxEvents &&
        onTxEvents.onBroadcastFailed
      ) {
        onTxEvents.onBroadcastFailed(e);
      }
      this.base.setTxTypeInProgress("");

      throw e;
    }

    let onBroadcasted: ((txHash: Uint8Array) => void) | undefined;
    let onFulfill: ((tx: any) => void) | undefined;

    if (onTxEvents) {
      if (typeof onTxEvents === "function") {
        onFulfill = onTxEvents;
      } else {
        onBroadcasted = onTxEvents.onBroadcasted;
        onFulfill = onTxEvents.onFulfill;
      }
    }

    if (onBroadcasted) {
      onBroadcasted(Uint8Array.from(Buffer.from(txHash)));
    }

    this.base.setTxTypeInProgress("");

    const provider = this.ethersInstance;
    provider.once(txHash, (tx) => {
      for (const feeAmount of fee.amount) {
        const bal = this.queries.queryBalances
          .getQueryBech32Address(this.base.bech32Address)
          .balances.find(
            (bal) => bal.currency.coinMinimalDenom === feeAmount.denom
          );

        if (bal) {
          bal.fetch();
        }
      }

      // Always add the tx hash data.
      if (tx && !tx.hash) {
        tx.hash = txHash;
      }

      if (onFulfill) {
        onFulfill(tx);
      }
    });
  }

  async checkAndUpdateTransactionStatus(
    transactionHash: string
  ): Promise<boolean> {
    try {
      const receipt = await this.instance.post("", {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getTransactionReceipt",
        params: [transactionHash],
      });

      if (receipt && receipt.data && receipt.data.result) {
        if (parseInt(receipt.data.result.status, 16) == 1) {
          await this.updateTransactionStatus(transactionHash, "success");
          return true;
        }

        if (parseInt(receipt.data.result.status, 16) == 0) {
          await this.updateTransactionStatus(transactionHash, "failed");
          return true;
        }
      }

      // Check if nonce exceeded. This can happen due to race condition in speedup
      const txCountResult = await this.instance.post("", {
        jsonrpc: "2.0",
        id: "1",
        method: "eth_getTransactionCount",
        params: [this.base.ethereumHexAddress, "latest"],
      });

      let currentNonce: number | undefined;
      if (txCountResult.data && txCountResult.data.result) {
        currentNonce = parseInt(txCountResult.data.result, 16) - 1;
      }

      const txn = await this.getTx(transactionHash);

      const isSuccessByNonce =
        txn &&
        currentNonce &&
        txn.rawTxData?.nonce &&
        BigNumber.from(txn.rawTxData?.nonce).lte(currentNonce);

      if (isSuccessByNonce) {
        await this.updateTransactionStatus(transactionHash, "success");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error checking transaction receipt:", error);
      return false;
    }
  }

  // Store transaction hash in kvStore
  async storeTransactionHash(transactionInfo: ITxn, kvStore: KVStore) {
    try {
      const key = `${this.base.ethereumHexAddress}-${this.chainId}`;
      const txList: any[] | undefined = await kvStore.get(key);
      if (txList === undefined) {
        await kvStore.set(key, [transactionInfo]);
      } else {
        txList?.push(transactionInfo);
        await kvStore.set(key, txList);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async updateTransactionStatus(hash: string, status: "success" | "failed") {
    try {
      const key = `${this.base.ethereumHexAddress}-${this.chainId}`;
      const txList: ITxn[] | undefined = await this.kvStore.get(key);
      if (txList === undefined || !txList.find((txn) => txn.hash === hash)) {
        return;
      }
      console.log("updateTransactionStatus", status);

      // Find and update the transaction status by hash
      const updatedTxList = txList.map((txn) =>
        txn.hash === hash
          ? {
              ...txn,
              status:
                status === "success" && txn.cancelled ? "cancelled" : status,
            }
          : txn
      );

      if (updatedTxList.length !== 0) {
        await this.kvStore.set(this.base.ethereumHexAddress, updatedTxList);
      }

      await this.kvStore.set(key, updatedTxList);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async updateStoredTransactionInfo(hash: string, txnData: ITxn) {
    try {
      const key = `${this.base.ethereumHexAddress}-${this.chainId}`;
      const txList: ITxn[] | undefined = await this.kvStore.get(key);
      if (txList === undefined || !txList.find((txn) => txn.hash === hash)) {
        return;
      }

      // Find and update the transaction data by hash
      const updatedTxList = txList.map((txn) =>
        txn.hash === hash ? { ...txn, ...txnData } : txn
      );

      await this.kvStore.set(key, updatedTxList);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async broadcastTx(
    params: TransactionRequest,
    fee: StdFee
  ): Promise<{ txHash: string; rawTxData: TransactionRequest }> {
    if (this.base.walletStatus !== WalletStatus.Loaded) {
      throw new Error(`Wallet is not loaded: ${this.base.walletStatus}`);
    }

    const txCountResult = await this.instance.post("", {
      jsonrpc: "2.0",
      id: "1",
      method: "eth_getTransactionCount",
      params: [this.base.ethereumHexAddress, "pending"],
    });

    if (!(txCountResult.data && txCountResult.data.result)) {
      throw new Error("Issue fetching nonce");
    }

    const nonce = parseInt(txCountResult.data.result, 16);
    const gasPrice = BigNumber.from(fee.amount[0].amount).div(
      BigNumber.from(fee.gas)
    );
    const rawTxData = {
      ...params,
      chainId: parseInt(this.chainId),
      nonce,
      gasLimit: parseInt(fee.gas),
    };

    // EIP1995 support only for ethereum as of now
    if (this.chainId === "1") {
      const baseFee = this.queries.evm.queryEthGasFees.base;

      if (!baseFee) {
        throw new Error("Error estimating gas, try later");
      }
      const priorityFee = new Dec(gasPrice.toString())
        .sub(new Dec(baseFee).mul(new Dec("1000000000")))
        .roundUp()
        .toString();
      rawTxData["type"] = 2;
      rawTxData["maxFeePerGas"] = gasPrice.toString();
      rawTxData["maxPriorityFeePerGas"] = priorityFee;
    } else {
      rawTxData["gasPrice"] = gasPrice.toNumber();
    }

    const txHash = await this.signAndSendEthereumTxn(rawTxData);

    return { txHash: txHash as string, rawTxData };
  }

  async getTxList() {
    const key = `${this.base.ethereumHexAddress}-${this.chainId}`;
    const txList: ITxn[] | undefined = await this.kvStore.get(key);

    if (!txList) {
      return [];
    }

    return txList.reverse();
  }

  async getTx(hash: string) {
    const txList = await this.getTxList();

    return txList.find((tx) => {
      return tx.hash === hash;
    });
  }

  makeApprovalTx(amount: string, spender: string, currency: AppCurrency) {
    if (new DenomHelper(currency.coinMinimalDenom).type !== "erc20") {
      throw new Error("Currency needs to be erc20");
    }

    const actualAmount = `0x${(() => {
      let dec = new Dec(amount);
      dec = dec.mul(DecUtils.getPrecisionDec(currency.coinDecimals));
      return dec.truncate().toBigNumber().toString(16);
    })()}`;

    return this.makeEthereumTx(
      "approval",
      {
        to: new DenomHelper(currency.coinMinimalDenom).contractAddress,
        data: erc20MetadataInterface.encodeFunctionData("approve", [
          spender,
          actualAmount,
        ]),
      },
      {
        onBroadcasted: async (txHash) => {
          await this.updateStoredTransactionInfo(
            Buffer.from(txHash).toString(),
            {
              hash: Buffer.from(txHash).toString(),
              status: "pending",
              amount: amount,
              type: "Approve",
              symbol: currency.coinDenom,
            }
          );
        },
        onFulfill: (tx: TransactionReceipt) => {
          if (tx.status && tx.status === 1) {
            // After succeeding to send token, refresh the allowance.
            const queryAllowance =
              this.queries.evm.queryERC20Allowance.getQueryAllowance(
                this.base.bech32Address,
                spender,
                new DenomHelper(currency.coinMinimalDenom).contractAddress
              );

            if (queryAllowance) {
              queryAllowance.fetch();
            }
          }
        },
      }
    );
  }

  makeNativeBridgeTx(amount: string, recipient: string) {
    const actualAmount = `0x${(() => {
      let dec = new Dec(amount);
      dec = dec.mul(DecUtils.getPrecisionDec(18));
      return dec.truncate().toBigNumber().toString(16);
    })()}`;

    return this.makeEthereumTx(
      "nativeBridgeSend",
      {
        to: this.queries.evm.queryNativeFetBridge.nativeBridgeAddress,
        data: nativeFetBridgeInterface.encodeFunctionData("swap", [
          actualAmount,
          recipient,
        ]),
      },
      {
        onBroadcasted: async (txHash) => {
          await this.updateStoredTransactionInfo(
            Buffer.from(txHash).toString(),
            {
              hash: Buffer.from(txHash).toString(),
              status: "pending",
              amount: amount,
              type: "Bridge",
              symbol: "ETH",
            }
          );
        },
        onFulfill: (tx: TransactionReceipt) => {
          if (tx.status && tx.status === 1) {
            // After succeeding to send token, refresh the balance.
            const queryBalance = this.queries.queryBalances
              .getQueryBech32Address(this.base.bech32Address)
              .balances.find((bal) => {
                return bal.currency.coinDenom === "FET";
              });

            if (queryBalance) {
              queryBalance.fetch();
            }
          }
        },
      }
    );
  }

  async cancelTransactionAndBroadcast(hash: string) {
    try {
      const pendingTx = await this.getTx(hash);

      if (!pendingTx || !pendingTx.rawTxData) {
        return;
      }

      // Create a new transaction with the same nonce and the rest of the details
      const newTx: TransactionRequest = {
        ...pendingTx.rawTxData,
        to: this.base.ethereumHexAddress,
        value: 0,
        data: "",
      };

      // Provide 15% more gas
      if (newTx.maxFeePerGas) {
        newTx.maxFeePerGas = new Dec(newTx.maxFeePerGas.toString())
          .mul(new Dec(1.15))
          .roundUp()
          .toString();
      }

      if (newTx.maxPriorityFeePerGas) {
        newTx.maxPriorityFeePerGas = new Dec(
          newTx.maxPriorityFeePerGas.toString()
        )
          .mul(new Dec(1.15))
          .roundUp()
          .toString();
      }

      if (newTx.gasPrice) {
        newTx.gasPrice = new Dec(newTx.gasPrice.toString())
          .mul(new Dec(1.15))
          .roundUp()
          .toBigNumber()
          .toJSNumber();
      }

      // Sign and send the new transaction
      const txHash = await this.signAndSendEthereumTxn(newTx);
      await this.updateStoredTransactionInfo(pendingTx.hash, {
        ...pendingTx,
        hash: txHash,
        cancelled: true,
        lastSpeedUpAt: new Date(),
        rawTxData: newTx,
      });

      const provider = this.ethersInstance;
      const listeners = provider.listeners(pendingTx.hash);
      provider.removeAllListeners(pendingTx.hash).once(txHash, listeners[0]);

      return txHash;
    } catch (error) {
      console.error("Error cancelling transaction:", error);
      throw new Error("Could not cancel transaction");
    }
  }

  async speedUpTransactionAndBroadcast(hash: string) {
    try {
      const pendingTx = await this.getTx(hash);

      if (!pendingTx || !pendingTx.rawTxData) {
        return;
      }

      // Create a new transaction with the same details
      const newTx: TransactionRequest = {
        ...pendingTx.rawTxData,
      };

      // Provide 15% more gas
      if (newTx.maxFeePerGas) {
        newTx.maxFeePerGas = new Dec(newTx.maxFeePerGas.toString())
          .mul(new Dec(1.15))
          .roundUp()
          .toString();
      }

      if (newTx.maxPriorityFeePerGas) {
        newTx.maxPriorityFeePerGas = new Dec(
          newTx.maxPriorityFeePerGas.toString()
        )
          .mul(new Dec(1.15))
          .roundUp()
          .toString();
      }

      if (newTx.gasPrice) {
        newTx.gasPrice = new Dec(newTx.gasPrice.toString())
          .mul(new Dec(1.15))
          .roundUp()
          .toBigNumber()
          .toJSNumber();
      }

      const newHash = await this.signAndSendEthereumTxn(newTx);
      await this.updateStoredTransactionInfo(pendingTx.hash, {
        ...pendingTx,
        hash: newHash,
        rawTxData: newTx,
        lastSpeedUpAt: new Date(),
      });

      const provider = this.ethersInstance;
      const listeners = provider.listeners(pendingTx.hash);
      provider.removeAllListeners(pendingTx.hash).once(newHash, listeners[0]);

      return newHash;
    } catch (error) {
      console.error("Error speeding up transaction:", error);
      throw new Error("Could not speed up transaction");
    }
  }

  async signAndSendEthereumTxn(txData: any) {
    const encoder = new TextEncoder();
    const rawTxn = encoder.encode(JSON.stringify(txData));
    const keplr = (await this.base.getKeplr())!;
    const signResponse = await keplr.signEthereum(
      this.chainId,
      this.base.bech32Address,
      rawTxn,
      EthSignType.TRANSACTION
    );

    const result = await this.instance.post("", {
      jsonrpc: "2.0",
      id: "1",
      method: "eth_sendRawTransaction",
      params: [`0x${Buffer.from(signResponse).toString("hex")}`],
    });

    if (!(result.data && result.data.result)) {
      throw new Error("Issue sending transaction");
    }

    return result.data.result as string;
  }

  protected get queries(): DeepReadonly<QueriesSetBase & EvmQueries> {
    return this.queriesStore.get(this.chainId);
  }
}
