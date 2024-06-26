import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../common";
import { KVStore } from "@keplr-wallet/common";
import { ObservableQueryEvmNativeBalanceRegistry } from "./balance";
import { DeepReadonly } from "utility-types";
import {
  ObservableQueryERC20Allowance,
  ObservableQueryERC20Metadata,
} from "./erc20-info";
import { ObservableQueryErc20BalanceRegistry } from "./erc20-balance";
import { ObservableQueryNativeFetEthBrige } from "./native-fet-bridge";
import { ObservableQueryGasFees } from "./eth-gas-fees";
import { ObservableQueryBridgeHistory } from "./bridge-history";
import { ObservableQueryBridgeReverseSwapHash } from "./bridge-reverse-swap-hash";
import { ObservableQueryEvmGasPrice } from "./evm-gas-fees";
import { ObservableQueryLatestBlock } from "./block";

export interface EvmQueries {
  evm: EvmQueriesImpl;
}

export const EvmQueries = {
  use(): (
    queriesSetBase: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) => EvmQueries {
    return (
      queriesSetBase: QueriesSetBase,
      kvStore: KVStore,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        evm: new EvmQueriesImpl(queriesSetBase, kvStore, chainId, chainGetter),
      };
    };
  },
};

export class EvmQueriesImpl {
  public readonly queryErc20Metadata: DeepReadonly<ObservableQueryERC20Metadata>;
  public readonly queryNativeFetBridge: DeepReadonly<ObservableQueryNativeFetEthBrige>;
  public readonly queryERC20Allowance: DeepReadonly<ObservableQueryERC20Allowance>;
  public readonly queryEthGasFees: DeepReadonly<ObservableQueryGasFees>;
  public readonly queryBridgeHistory: DeepReadonly<ObservableQueryBridgeHistory>;
  public readonly queryBridgeReverseSwapHash: DeepReadonly<ObservableQueryBridgeReverseSwapHash>;
  public readonly queryGasPrice: DeepReadonly<ObservableQueryEvmGasPrice>;
  public readonly queryLatestBlock: DeepReadonly<ObservableQueryLatestBlock>;

  constructor(
    base: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    base.queryBalances.addBalanceRegistry(
      new ObservableQueryEvmNativeBalanceRegistry(kvStore)
    );

    base.queryBalances.addBalanceRegistry(
      new ObservableQueryErc20BalanceRegistry(kvStore)
    );

    this.queryErc20Metadata = new ObservableQueryERC20Metadata(
      kvStore,
      chainId,
      chainGetter
    );

    this.queryNativeFetBridge = new ObservableQueryNativeFetEthBrige(
      kvStore,
      chainGetter
    );

    this.queryERC20Allowance = new ObservableQueryERC20Allowance(
      kvStore,
      chainId,
      chainGetter
    );

    this.queryEthGasFees = new ObservableQueryGasFees(kvStore);

    this.queryBridgeHistory = new ObservableQueryBridgeHistory(
      kvStore,
      chainId,
      chainGetter,
      this.queryNativeFetBridge
    );

    this.queryBridgeReverseSwapHash = new ObservableQueryBridgeReverseSwapHash(
      kvStore,
      chainGetter,
      this.queryNativeFetBridge
    );

    this.queryGasPrice = new ObservableQueryEvmGasPrice(
      kvStore,
      chainId,
      chainGetter
    );

    this.queryLatestBlock = new ObservableQueryLatestBlock(
      kvStore,
      chainId,
      chainGetter
    );
  }
}
