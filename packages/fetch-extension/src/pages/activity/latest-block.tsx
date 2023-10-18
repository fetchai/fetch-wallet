import React, { FunctionComponent, useEffect, useState } from "react";
import { fetchLatestBlock, fetchLatestEthBlock } from "@graphQL/activity-api";
import { useStore } from "../../stores";
import style from "./style.module.scss";

export const LatestBlock: FunctionComponent<{
  latestBlock: any;
  setLatestBlock: any;
}> = ({ latestBlock, setLatestBlock }) => {
  const [blockIsLoading, setBlockIsLoading] = useState(true);
  const { chainStore } = useStore();
  const current = chainStore.current;
  const isEvm = current.features?.includes("evm");

  useEffect(() => {
    const initialize = async () => {
      setBlockIsLoading(true);
      const block = isEvm
        ? await fetchLatestEthBlock(current.rpc)
        : await fetchLatestBlock(current.chainId);
      if (latestBlock != block) setLatestBlock(block);
      setBlockIsLoading(false);
    };
    setInterval(() => initialize(), 5000);
  }, [chainStore]);

  return (
    <div className={style["block"]}>
      Latest Block: {latestBlock}{" "}
      {blockIsLoading && <i className="fas fa-spinner fa-spin ml-2" />}
    </div>
  );
};
