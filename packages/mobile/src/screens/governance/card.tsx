import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/index";
import { useStyle } from "styles/index";
import { Governance } from "@keplr-wallet/stores";
import { Chip } from "components/chip";
import { Text, View, ViewStyle } from "react-native";
import { LoadingSpinner } from "components/spinner";
import { useSmartNavigation } from "navigation/smart-navigation";
import { RectButton } from "components/rect-button";
import { BlurButton } from "components/new/button/blur-button";
import moment from "moment";

export const GovernanceProposalStatusChip: FunctionComponent<{
  status: Governance.ProposalStatus;
}> = ({ status }) => {
  const style = useStyle();
  switch (status) {
    case Governance.ProposalStatus.DEPOSIT_PERIOD:
      return <Chip text="Deposit period" color="primary" mode="outline" />;
    case Governance.ProposalStatus.VOTING_PERIOD:
      return (
        <BlurButton
          text={"Avtive"}
          backgroundBlur={false}
          borderRadius={4}
          textStyle={
            style.flatten([
              "text-caption2",
              "font-medium",
              "color-indigo-900",
              "margin-y-4",
              "margin-x-8",
            ]) as ViewStyle
          }
          containerStyle={style.flatten(["background-color-white"])}
        />
      );
    case Governance.ProposalStatus.PASSED:
      return (
        <BlurButton
          text={"Passed"}
          backgroundBlur={false}
          borderRadius={4}
          textStyle={
            style.flatten([
              "text-caption2",
              "font-medium",
              "color-indigo-900",
              "margin-y-4",
              "margin-x-8",
            ]) as ViewStyle
          }
          containerStyle={
            style.flatten(["background-color-vibrant-green-500"]) as ViewStyle
          }
        />
      );
    case Governance.ProposalStatus.REJECTED:
      return (
        <BlurButton
          text={"Rejected"}
          backgroundBlur={false}
          borderRadius={4}
          textStyle={
            style.flatten([
              "text-caption2",
              "font-medium",
              "color-white",
              "margin-y-4",
              "margin-x-8",
            ]) as ViewStyle
          }
          containerStyle={style.flatten(["background-color-vibrant-red-500"])}
        />
      );
    case Governance.ProposalStatus.FAILED:
      return (
        <BlurButton
          text={"Failed"}
          backgroundBlur={false}
          borderRadius={4}
          textStyle={
            style.flatten([
              "text-caption2",
              "font-medium",
              "color-white",
              "margin-y-4",
              "margin-x-8",
            ]) as ViewStyle
          }
          containerStyle={style.flatten(["background-color-vibrant-red-500"])}
        />
      );
    default:
      return (
        <BlurButton
          text={"Unspecified"}
          backgroundBlur={false}
          borderRadius={4}
          textStyle={
            style.flatten([
              "text-caption2",
              "font-medium",
              "color-white",
              "margin-y-4",
              "margin-x-8",
            ]) as ViewStyle
          }
          containerStyle={style.flatten(["background-color-vibrant-red-500"])}
        />
      );
  }
};

export const GovernanceCardBody: FunctionComponent<{
  proposalId: string;
}> = observer(({ proposalId }) => {
  const { chainStore, queriesStore } = useStore();

  const navigation = useSmartNavigation();

  const style = useStyle();

  const queries = queriesStore.get(chainStore.current.chainId);
  const queryGovernance = queries.cosmos.queryGovernance;
  const proposal = queryGovernance.getProposal(proposalId);

  return proposal ? (
    <RectButton
      style={style.flatten(["padding-18"]) as ViewStyle}
      onPress={() => {
        navigation.navigateSmart("Governance.Details", {
          proposalId: proposal.id,
        });
      }}
    >
      <Text
        style={
          style.flatten([
            "text-caption2",
            "color-white@60%",
            "margin-bottom-6",
          ]) as ViewStyle
        }
      >{`PROPOSAL #${proposal.id}`}</Text>
      {/* <View style={style.flatten(["flex-1"])} />
        <GovernanceProposalStatusChip status={proposal.proposalStatus} /> */}
      <Text style={style.flatten(["body3", "color-white"]) as ViewStyle}>
        {proposal.title}
      </Text>
      <View
        style={
          style.flatten([
            "flex-row",
            "items-center",
            "margin-top-16",
            "justify-between",
            "flex-wrap",
          ]) as ViewStyle
        }
      >
        <View
          style={
            style.flatten([
              "flex-row",
              "items-center",
              "margin-right-16",
            ]) as ViewStyle
          }
        >
          <View style={style.flatten(["margin-right-16"]) as ViewStyle}>
            <Text
              style={
                style.flatten([
                  "text-caption2",
                  "color-white@60%",
                  "margin-bottom-6",
                ]) as ViewStyle
              }
            >
              Voting start time
            </Text>
            <Text
              style={
                style.flatten(["text-caption2", "color-white"]) as ViewStyle
              }
            >
              {moment(proposal.raw.voting_start_time)
                .utc()
                .format("ddd, DD MMM")}
            </Text>
          </View>
          <View>
            <Text
              style={
                style.flatten([
                  "text-caption2",
                  "color-white@60%",
                  "margin-bottom-6",
                ]) as ViewStyle
              }
            >
              Voting end time
            </Text>
            <Text
              style={
                style.flatten(["text-caption2", "color-white"]) as ViewStyle
              }
            >
              {moment(proposal.raw.voting_end_time).utc().format("ddd, DD MMM")}
            </Text>
          </View>
        </View>
        <GovernanceProposalStatusChip status={proposal.proposalStatus} />
      </View>
    </RectButton>
  ) : (
    <View
      style={
        style.flatten([
          "height-governance-card-body-placeholder",
          "justify-center",
          "items-center",
        ]) as ViewStyle
      }
    >
      <LoadingSpinner
        color={style.get("color-loading-spinner").color}
        size={22}
      />
    </View>
  );
});
