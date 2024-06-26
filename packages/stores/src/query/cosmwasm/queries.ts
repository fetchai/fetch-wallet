import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../common";
import { KVStore } from "@keplr-wallet/common";
import { ObservableQueryCw20ContractInfo } from "./cw20-contract-info";
import { DeepReadonly } from "utility-types";
import { ObservableQueryCw20BalanceRegistry } from "./cw20-balance";
import { ObservableQueryNativeFetCosmosBridge } from "./native-fet-bridge";
import { ObservableQueryBridgeHistory } from "./bridge-history";
import { ObservableQueryBridgeReverseSwapHash } from "./bridge-reverse-swap-hash";

export interface CosmwasmQueries {
  cosmwasm: CosmwasmQueriesImpl;
}

export const CosmwasmQueries = {
  use(): (
    queriesSetBase: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) => CosmwasmQueries {
    return (
      queriesSetBase: QueriesSetBase,
      kvStore: KVStore,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        cosmwasm: new CosmwasmQueriesImpl(
          queriesSetBase,
          kvStore,
          chainId,
          chainGetter
        ),
      };
    };
  },
};

export class CosmwasmQueriesImpl {
  public readonly querycw20ContractInfo: DeepReadonly<ObservableQueryCw20ContractInfo>;
  public readonly queryNativeFetBridge: DeepReadonly<ObservableQueryNativeFetCosmosBridge>;
  public readonly queryBridgeHistory: DeepReadonly<ObservableQueryBridgeHistory>;
  public readonly queryBridgeReverseSwapHash: DeepReadonly<ObservableQueryBridgeReverseSwapHash>;

  constructor(
    base: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    base.queryBalances.addBalanceRegistry(
      new ObservableQueryCw20BalanceRegistry(kvStore)
    );

    this.querycw20ContractInfo = new ObservableQueryCw20ContractInfo(
      kvStore,
      chainId,
      chainGetter
    );

    this.queryNativeFetBridge = new ObservableQueryNativeFetCosmosBridge(
      kvStore,
      chainGetter
    );

    this.queryBridgeHistory = new ObservableQueryBridgeHistory(
      kvStore,
      chainGetter,
      this.queryNativeFetBridge
    );

    this.queryBridgeReverseSwapHash = new ObservableQueryBridgeReverseSwapHash(
      kvStore,
      chainGetter,
      this.queryNativeFetBridge
    );
  }
}
