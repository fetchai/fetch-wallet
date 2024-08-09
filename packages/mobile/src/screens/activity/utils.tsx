import { UpDownArrowIcon } from "components/new/icon/up-down-arrow";
import { StakeIcon } from "components/new/icon/stake-icon";
import { UnstakedIcon } from "components/new/icon/unstaked";
import { EditIcon } from "components/new/icon/edit";
import { LeftRightCrossIcon } from "components/new/icon/left-right-cross";
import { ClaimIcon } from "components/new/icon/claim-icon";
import { IbcUpDownIcon } from "components/new/icon/ibc-up-down";
import React from "react";
import { FilterItem } from "screens/activity/index";

export const govOptions: FilterItem[] = [
  { icon: null, value: "YES", title: "Voted Yes", isSelected: true },
  { icon: null, value: "NO", title: "Voted No", isSelected: true },
  {
    icon: null,
    value: "ABSTAIN",
    title: "Voted Abstain",
    isSelected: true,
  },
  {
    icon: null,
    value: "NO_WITH_VETO",
    title: "Voted No With Veto",
    isSelected: true,
  },
];

export const txOptions: FilterItem[] = [
  {
    icon: (
      <UpDownArrowIcon
        size={14}
        color1={"white"}
        color2={"white"}
        color3={"white"}
      />
    ),
    title: "Funds transfers",
    value: "/cosmos.bank.v1beta1.MsgSend",
    isSelected: true,
  },
  {
    icon: <StakeIcon size={14} />,
    title: "Staked Funds",
    value: "/cosmos.staking.v1beta1.MsgDelegate",
    isSelected: true,
  },
  {
    icon: <UnstakedIcon />,
    title: "Unstaked Funds",
    value: "/cosmos.staking.v1beta1.MsgUndelegate",
    isSelected: true,
  },
  {
    icon: <EditIcon />,
    title: "Redelegate Funds",
    value: "/cosmos.staking.v1beta1.MsgBeginRedelegate",
    isSelected: true,
  },
  {
    icon: <LeftRightCrossIcon size={20} />,
    title: "Contract Interactions",
    value:
      "/cosmos.authz.v1beta1.MsgExec,/cosmwasm.wasm.v1.MsgExecuteContract,/cosmos.authz.v1beta1.MsgRevoke",
    isSelected: true,
  },
  {
    icon: <ClaimIcon />,
    title: "Claim Rewards",
    value: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
    isSelected: true,
  },
  {
    icon: <IbcUpDownIcon size={20} />,
    title: "IBC transfers",
    value: "/ibc.applications.transfer.v1.MsgTransfer",
    isSelected: true,
  },
];

export const processFilters = (filters: FilterItem[]) => {
  let result: any[] = [];
  filters
    .filter((filter) => filter.isSelected)
    .map((data) => {
      result = result.concat(data.value.split(","));
    });
  return result;
};
