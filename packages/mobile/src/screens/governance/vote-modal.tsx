import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { useSmartNavigation } from "navigation/smart-navigation";
import { ViewStyle, Text } from "react-native";
import { useStore } from "stores/index";
import { useStyle } from "styles/index";
import { RectButton } from "components/rect-button";
import { Button } from "components/button";
import { CardModal } from "modals/card";
import { BlurBackground } from "components/new/blur-background/blur-background";

type VoteType = "Yes" | "No" | "NoWithVeto" | "Abstain" | "Unspecified";

export const GovernanceVoteModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  proposalId: string;

  // Modal can't use the `useSmartNavigation` hook directly.
  // So need to get the props from the parent.
  smartNavigation: ReturnType<typeof useSmartNavigation>;
}> = observer(({ proposalId, close, smartNavigation, isOpen }) => {
  const { chainStore, accountStore, analyticsStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const style = useStyle();

  const [vote, setVote] = useState<VoteType>("Unspecified");

  const [isSendingTx, setIsSendingTx] = useState(false);

  if (!isOpen) {
    return null;
  }

  return (
    <CardModal
      isOpen={isOpen}
      close={() => {
        setVote("Unspecified");
        close();
      }}
      title="Vote"
    >
      <VoteButton
        text={"Yes"}
        select={vote === "Yes"}
        onPress={() => setVote("Yes")}
      />
      <VoteButton
        text={"No"}
        select={vote === "No"}
        onPress={() => setVote("No")}
      />
      <VoteButton
        text={"No with veto"}
        select={vote === "NoWithVeto"}
        onPress={() => setVote("NoWithVeto")}
      />
      <VoteButton
        text={"Abstain"}
        select={vote === "Abstain"}
        onPress={() => setVote("Abstain")}
      />

      <Button
        text="Submit"
        size="large"
        containerStyle={
          style.flatten(["border-radius-64", "margin-top-18"]) as ViewStyle
        }
        textStyle={style.flatten(["body2"]) as ViewStyle}
        disabled={vote === "Unspecified" || !account.isReadyToSendTx}
        loading={isSendingTx || account.txTypeInProgress === "govVote"}
        onPress={async () => {
          if (vote !== "Unspecified" && account.isReadyToSendTx) {
            const tx = account.cosmos.makeGovVoteTx(proposalId, vote);

            setIsSendingTx(true);

            try {
              let gas = account.cosmos.msgOpts.govVote.gas;

              // Gas adjustment is 1.5
              // Since there is currently no convenient way to adjust the gas adjustment on the UI,
              // Use high gas adjustment to prevent failure.
              try {
                gas = (await tx.simulate()).gasUsed * 1.5;
              } catch (e) {
                // Some chain with older version of cosmos sdk (below @0.43 version) can't handle the simulation.
                // Therefore, the failure is expected. If the simulation fails, simply use the default value.
                console.log(e);
              }
              close();
              await tx.send(
                { amount: [], gas: gas.toString() },
                "",
                {},
                {
                  onBroadcasted: (txHash) => {
                    analyticsStore.logEvent("Vote tx broadcasted", {
                      chainId: chainStore.current.chainId,
                      chainName: chainStore.current.chainName,
                    });
                    console.log("Hash", txHash);
                    // smartNavigation.pushSmart("TxPendingResult", {
                    //   txHash: Buffer.from(txHash).toString("hex"),
                    // });
                  },
                }
              );
            } catch (e) {
              if (e?.message === "Request rejected") {
                return;
              }
              console.log(e);
              smartNavigation.navigateSmart("Home", {});
            } finally {
              setIsSendingTx(false);
            }
          }
        }}
      />
    </CardModal>
  );
});

const VoteButton: FunctionComponent<{
  text: string;
  onPress: () => void;
  select: boolean;
}> = ({ text, onPress, select }) => {
  const style = useStyle();
  return (
    <BlurBackground
      borderRadius={12}
      blurIntensity={15}
      containerStyle={style.flatten(["margin-bottom-6"]) as ViewStyle}
    >
      <RectButton
        style={
          style.flatten(
            ["flex-row", "items-center", "justify-between", "padding-18"],
            [select && "background-color-indigo"]
          ) as ViewStyle
        }
        onPress={onPress}
      >
        <Text style={style.flatten(["body3", "color-white"]) as ViewStyle}>
          {text}
        </Text>
      </RectButton>
    </BlurBackground>
  );
};
