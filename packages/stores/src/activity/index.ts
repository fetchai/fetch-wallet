import { KVStore, toGenerator } from "@keplr-wallet/common";
import { TendermintTxTracer } from "@keplr-wallet/cosmos";
import { action, flow, makeObservable, observable } from "mobx";
import { updateNodeOnTxnCompleted } from "../account";
import { ChainGetter } from "src/common";

export class ActivityStore {
  @observable
  protected nodes: any = {};

  @observable
  protected address: string = "";

  @observable
  protected chainId: string = "";

  @observable
  protected isNodeUpdated: boolean = false;

  // updates or adds new nodes to the list
  updateNodes(nodes: any) {
    const updatedNodes = { ...this.nodes, ...nodes };
    this.setNodes(updatedNodes);

    this.saveNodes();
  }

  getSortedNodesByTimeStamps() {
    const sortedNodes = Object.values(this.nodes).sort((a: any, b: any) => {
      if (a.block.timestamp < b.block.timestamp) {
        return 1;
      } else if (a.block.timestamp > b.block.timestamp) {
        return -1;
      } else {
        return 0;
      }
    });

    return sortedNodes;
  }

  @flow
  *saveNodes() {
    const currNodes = Object.keys(this.nodes).length > 0 ? this.nodes : {};
    yield this.kvStore.set<any>(
      `extension_activity_nodes-${this.address}-${this.chainId}`,
      currNodes
    );
  }

  @flow
  *saveAddress() {
    yield this.kvStore.set<any>("extension_activity_address", this.address);
  }

  @flow
  *saveChainId() {
    yield this.kvStore.set<any>("extension_activity_chain_id", this.chainId);
  }

  getNode(id: any) {
    return this.nodes[id];
  }

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainGetter: ChainGetter
  ) {
    makeObservable(this);

    this.init();
  }

  @flow
  *init() {
    const savedAddress = yield* toGenerator(
      this.kvStore.get<any>("extension_activity_address")
    );
    this.address = savedAddress;

    const savedChainId = yield* toGenerator(
      this.kvStore.get<any>("extension_activity_chain_id")
    );
    this.chainId = savedChainId;
  }

  @flow
  *accountInit() {
    const savedNodes = yield* toGenerator(
      this.kvStore.get<any>(
        `extension_activity_nodes-${this.address}-${this.chainId}`
      )
    );
    this.nodes = savedNodes !== undefined ? savedNodes : {};

    const txTracer = new TendermintTxTracer(
      this.chainGetter.getChain(this.chainId).rpc,
      "/websocket",
      {}
    );

    Object.values(this.nodes).map((node: any) => {
      const txHash = Uint8Array.from(Buffer.from(node.id, "hex"));
      txTracer.traceTx(txHash).then((tx) => {
        updateNodeOnTxnCompleted(node.type, tx, node.id, this);
      });
    });
  }

  @action
  addNode(node: any) {
    this.updateNodes({ [node.id]: node });
  }

  @action
  resetNodes() {
    this.nodes = {};
    this.saveNodes();
  }

  @action
  setTxnStatus(nodeId: any, status: "Pending" | "Success" | "Failed") {
    this.nodes[nodeId].transaction.status = status;
    this.saveNodes();
  }

  @action
  updateTxnBalance(nodeId: any, amount: number) {
    this.nodes[nodeId].balanceOffset = amount;
    this.saveNodes();
  }

  @action
  updateTxnJson(nodeId: any, index: number, json: string[]) {
    const currentJson = JSON.parse(
      this.nodes[nodeId].transaction.messages.nodes[index].json
    );

    const newJson = {
      delegatorAddress: currentJson.delegatorAddress,
      validatorAddress: currentJson.validatorAddress,
      amount: {
        denom: json[1],
        amount: json[0],
      },
    };

    this.nodes[nodeId].transaction.messages.nodes[index].json =
      JSON.stringify(newJson);

    this.saveNodes();
  }

  @action
  updateTxnGas(nodeId: any, gasUsed: any, gasWanted: any) {
    this.nodes[nodeId].transaction = {
      ...this.nodes[nodeId].transaction,
      gasUsed: gasUsed,
      gasWanted,
    };
    this.saveNodes();
  }

  @action
  setNodes(nodes: any) {
    this.nodes = nodes;
  }

  @action
  setNode(id: any, node: any) {
    this.nodes[id] = node;
  }

  @action
  setAddress(address: string) {
    this.address = address;
    this.saveAddress();
  }

  @action
  setIsNodeUpdated(value: boolean) {
    this.isNodeUpdated = value;
  }

  @action
  setChainId(chainId: string) {
    this.chainId = chainId;
    this.saveChainId();
  }

  get getNodes() {
    return this.nodes;
  }

  get checkIsNodeUpdated() {
    return this.isNodeUpdated;
  }

  get getChainId() {
    return this.chainId;
  }

  get getAddress() {
    return this.address;
  }

  get sortedNodes() {
    return this.getSortedNodesByTimeStamps();
  }
}
