import React, { FunctionComponent } from "react";
import { View, Text, TouchableOpacity, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from "@react-navigation/native";
import { BlurButton } from "components/new/button/blur-button";
import { useStore } from "stores/index";

export const GovActivityRow: FunctionComponent<{
  node: any;
}> = ({ node }) => {
  const { queriesStore, chainStore } = useStore();

  const style = useStyle();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const queries = queriesStore.get(chainStore.current.chainId);
  const proposalId = JSON.parse(node.message.json).proposalId.low;
  const proposal = queries.cosmos.queryGovernance.getProposal(
    proposalId.toString()
  );
  const vote = node.option;
  const { status, id } = node.transaction;

  function getVote(vote: string) {
    switch (vote.toUpperCase()) {
      default:
      case "Yes":
        return "yes";

      case "NO":
        return "no";

      case "ABSTAIN":
        return "abstain";

      case "NO_WITH_VETO":
        return "no with veto";
    }
  }

  return (
    <TouchableOpacity
      style={style.flatten(["flex-row", "items-center"]) as ViewStyle}
      onPress={() =>
        navigation.navigate("Others", {
          screen: "WebView",
          params: {
            url: `https://www.mintscan.io/fetchai/tx/${id}`,
          },
        })
      }
    >
      <View style={style.flatten(["flex-1", "margin-left-16"]) as ViewStyle}>
        <Text
          style={
            style.flatten([
              "body3",
              "padding-4",
              "color-white",
              "font-medium",
            ]) as ViewStyle
          }
        >
          {proposal?.title}
        </Text>
        <Text
          style={
            style.flatten([
              "body3",
              "padding-2",
              "color-white@60%",
              "font-medium",
            ]) as ViewStyle
          }
        >
          {`PROPOSAL #${proposalId} . ${
            status === "Success" ? "Confirmed" : "Failed"
          }`}
        </Text>
      </View>

      <View style={style.flatten(["margin-right-16"]) as ViewStyle}>
        <BlurButton
          text={getVote(vote)}
          borderRadius={4}
          backgroundBlur={false}
          textStyle={
            [
              style.flatten(
                ["text-caption2"],
                [
                  vote.toString() == "YES" || vote.toString() == "ABSTAIN"
                    ? "color-indigo-900"
                    : "color-white",
                ]
              ),
              { lineHeight: 14 },
            ] as ViewStyle
          }
          containerStyle={
            style.flatten(
              ["padding-x-8", "margin-y-4"],
              [
                vote === "YES"
                  ? "background-color-vibrant-green-500"
                  : vote === "ABSTAIN"
                  ? "background-color-yellow-500"
                  : vote === "NO"
                  ? "background-color-vibrant-red-600"
                  : "background-color-vibrant-red-500",
              ]
            ) as ViewStyle
          }
        />
      </View>
    </TouchableOpacity>
  );
};
