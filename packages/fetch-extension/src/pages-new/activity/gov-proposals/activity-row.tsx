// import { formatActivityHash } from "@utils/format";
import React from "react";
import style from "./style.module.scss";
import { observer } from "mobx-react-lite";
import { StatusButton } from "@components-v2/status-button";
import { useStore } from "../../../stores";

const cardStatus = (status: string) => {
  switch (status) {
    case "ABSTAIN":
      return "Pending";

    case "NO":
      return "Failed";

    case "YES":
      return "Success";

    case "NO_WITH_VETO":
      return "Failed";

    default:
      return "Active";
  }
};

const cardStatusTitle = (details: string) => {
  switch (details) {
    case "ABSTAIN":
      return "Abstain";

    case "NO":
      return "No";

    case "YES":
      return "Yes";

    case "NO_WITH_VETO":
      return "No With Veto";

    default:
      return "Active";
  }
};

// const getHash = (proposal: any) => {
//   if (proposal && proposal.id) {
//     return formatActivityHash(proposal.id);
//   }
//   return null;
// };

const getProposalIdFromLogs = (logs: string) => {
  let proposalId = "";
  const parsedLogs = JSON.parse(logs);
  let log = [];

  if (Array.isArray(parsedLogs) && parsedLogs.length) {
    log = parsedLogs?.[0]?.events || [];
  }

  const attributes =
    log
      .map((item: any) => {
        if (item.type && item.type === "proposal_vote") {
          return item?.attributes;
        }
      })
      .find((item: any) => item) || [];

  if (Array.isArray(attributes) && attributes.length) {
    proposalId = attributes.find(
      (item: any) => item.key === "proposal_id"
    ).value;
  }

  return proposalId;
};

export const ActivityRow = observer(({ node }: { node: any }) => {
  const details = node.option;
  // const hash = getHash(node);
  const { status, id, log } = node.transaction;
  const proposalId = getProposalIdFromLogs(log);
  const { queriesStore, chainStore } = useStore();

  const current = chainStore.current;
  const queries = queriesStore.get(current.chainId);
  const proposal = queries.cosmos.queryGovernance.getProposal(proposalId || "");

  return (
    <React.Fragment>
      <a
        href={`https://www.mintscan.io/fetchai/tx/${id}`}
        target="_blank"
        rel="noreferrer"
      >
        <div className={style["activityRow"]}>
          <div className={style["middle"]}>
            <div className={style["activityCol"]}>
              {proposal?.raw.content.title}
            </div>
            <div className={style["rowSubtitle"]}>
              <div>PROPOSAL #{proposalId}</div>
              <div style={{ fontSize: "14px" }}>●</div>
              <div>{status === "Success" ? "Confirmed" : "Failed"}</div>
            </div>
          </div>
          <div
            style={{
              justifyContent: "center",
              display: "flex",
              alignItems: "center",
            }}
          >
            <StatusButton
              status={cardStatus(details)}
              title={cardStatusTitle(details)}
            />
          </div>
        </div>
      </a>
      <div className={style["hr"]} />
    </React.Fragment>
  );
});
