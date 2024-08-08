import React, { FunctionComponent, useState } from "react";
import { useStore } from "stores/index";
import { Text, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { useSmartNavigation } from "navigation/smart-navigation";
import { BlurBackground } from "components/new/blur-background/blur-background";
import { Button } from "components/button";
import { GradientButton } from "components/new/button/gradient-button";
import Toast from "react-native-toast-message";
import { useNetInfo } from "@react-native-community/netinfo";
import LinearGradient from "react-native-linear-gradient";
import { Dec } from "@keplr-wallet/unit";
import { TransactionModal } from "modals/transaction";
import { ClaimRewardsModal } from "components/new/claim-reward-model";
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from "@react-navigation/native";
import { txType } from "components/new/txn-status.tsx";

export const DelegatedCard: FunctionComponent<{
  containerStyle?: ViewStyle;

  validatorAddress: string;
}> = ({ containerStyle, validatorAddress }) => {
  const { chainStore, queriesStore, accountStore, analyticsStore } = useStore();

  const [isSendingTx, setIsSendingTx] = useState(false);
  const [showTransectionModal, setTransectionModal] = useState(false);
  const [txnHash, setTxnHash] = useState<string>("");
  const [showClaimModel, setClaimModel] = useState(false);

  const netInfo = useNetInfo();
  const networkIsConnected =
    typeof netInfo.isConnected !== "boolean" || netInfo.isConnected;

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const smartNavigation = useSmartNavigation();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const style = useStyle();

  const staked = queries.cosmos.queryDelegations
    .getQueryBech32Address(account.bech32Address)
    .getDelegationTo(validatorAddress);

  const stakableReward = queries.cosmos.queryRewards
    .getQueryBech32Address(account.bech32Address)
    .getStakableRewardOf(validatorAddress);

  const handleClaim = async () => {
    if (!networkIsConnected) {
      Toast.show({
        type: "error",
        text1: "No internet connection",
      });
      return;
    }
    const tx = account.cosmos.makeWithdrawDelegationRewardTx([
      validatorAddress,
    ]);

    setIsSendingTx(true);

    try {
      analyticsStore.logEvent("claim_click", {
        pageName: "Validator Details",
      });
      let gas =
        account.cosmos.msgOpts.withdrawRewards.gas * validatorAddress.length;

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
      setClaimModel(false);
      Toast.show({
        type: "success",
        text1: "claim in process",
      });
      await tx.send(
        { amount: [], gas: gas.toString() },
        "",
        {},
        {
          onBroadcasted: (txHash) => {
            analyticsStore.logEvent("claim_txn_broadcasted", {
              chainId: chainStore.current.chainId,
              chainName: chainStore.current.chainName,
              pageName: "Validator Details",
            });
            setTxnHash(Buffer.from(txHash).toString("hex"));
            setTransectionModal(true);
          },
        }
      );
    } catch (e) {
      analyticsStore.logEvent("claim_txn_broadcasted_fail", {
        chainId: chainStore.current.chainId,
        chainName: chainStore.current.chainName,
        pageName: "Validator Details",
      });
      if (
        e?.message === "Request rejected" ||
        e?.message === "Transaction rejected"
      ) {
        Toast.show({
          type: "error",
          text1: "Transaction rejected",
        });
        return;
      } else {
        Toast.show({
          type: "error",
          text1: e?.message,
        });
      }
      console.log(e);
      navigation.navigate("Home", {});
    } finally {
      setClaimModel(false);
      setIsSendingTx(false);
    }
  };

  return (
    <React.Fragment>
      <LinearGradient
        colors={["#F9774B", "#CF447B"]}
        start={{ y: 0.0, x: 1.0 }}
        end={{ y: 1.0, x: 0.0 }}
        style={
          [
            style.flatten(["border-radius-12", "flex-row"]),
            containerStyle,
            { padding: 1.85 },
          ] as ViewStyle
        }
      >
        <BlurBackground
          borderRadius={10}
          blurIntensity={16}
          containerStyle={
            style.flatten([
              "padding-14",
              "flex-1",
              "background-color-indigo-900",
            ]) as ViewStyle
          }
        >
          <View
            style={
              style.flatten([
                "flex-row",
                "justify-between",
                "margin-bottom-4",
              ]) as ViewStyle
            }
          >
            <Text
              style={style.flatten(["body3", "color-white@60%"]) as ViewStyle}
            >
              Staked amount
            </Text>
            <Text
              style={style.flatten(["color-white", "subtitle3"]) as ViewStyle}
            >
              {`${
                staked
                  .trim(true)
                  .shrink(true)
                  .maxDecimals(10)
                  .toString()
                  .split(" ")[0]
              } ${staked.trim(true).shrink(true).toString().split(" ")[1]}`}
            </Text>
          </View>
          <View
            style={
              style.flatten([
                "flex-row",
                "justify-between",
                "margin-bottom-4",
              ]) as ViewStyle
            }
          >
            <Text
              style={style.flatten(["body3", "color-white@60%"]) as ViewStyle}
            >
              Earned rewards
            </Text>
            <Text
              style={style.flatten(["color-white", "subtitle3"]) as ViewStyle}
            >
              {`${
                stakableReward
                  .trim(true)
                  .shrink(true)
                  .maxDecimals(10)
                  .toString()
                  .split(" ")[0]
              } ${
                stakableReward.trim(true).shrink(true).toString().split(" ")[1]
              }`}
            </Text>
          </View>
          {/* <View
        style={
          style.flatten([
            "flex-row",
            "justify-between",
            "margin-y-2",
          ]) as ViewStyle
        }
      >
        <Text style={style.flatten(["color-gray-200"]) as ViewStyle}>
          Claimable rewards
        </Text>
        <Text style={style.flatten(["color-white", "h7"]) as ViewStyle}>
          {"123 FET"}
        </Text>
      </View> */}
          <Button
            text="Unstake"
            mode="outline"
            size="small"
            containerStyle={
              style.flatten([
                "border-radius-32",
                "margin-top-12",
                "border-color-white@40%",
              ]) as ViewStyle
            }
            textStyle={style.flatten(["body3", "color-white"]) as ViewStyle}
            onPress={() => {
              analyticsStore.logEvent("unstake_click", {
                chainId: chainStore.current.chainId,
                chainName: chainStore.current.chainName,
                pageName: "Validator Detail",
              });
              if (
                account.txTypeInProgress === "undelegate" ||
                account.txTypeInProgress === "redelegate" ||
                account.txTypeInProgress === "delegate"
              ) {
                Toast.show({
                  type: "error",
                  text1: `${txType[account.txTypeInProgress]} in progress`,
                });
                return;
              }
              smartNavigation.navigateSmart("Undelegate", {
                validatorAddress,
              });
            }}
          />
          {!(
            !networkIsConnected ||
            !account.isReadyToSendTx ||
            stakableReward.toDec().equals(new Dec(0))
          ) ? (
            <GradientButton
              text="Claim rewards"
              size="small"
              containerStyle={
                style.flatten([
                  "border-radius-32",
                  "margin-top-12",
                ]) as ViewStyle
              }
              textStyle={style.flatten(["body3"]) as ViewStyle}
              onPress={() => {
                if (account.txTypeInProgress === "withdrawRewards") {
                  Toast.show({
                    type: "error",
                    text1: `${txType[account.txTypeInProgress]} in progress`,
                  });
                  return;
                }
                analyticsStore.logEvent("claim_staking_reward_click", {
                  pageName: "Validator Details",
                });
                setClaimModel(true);
              }}
              loading={isSendingTx}
            />
          ) : null}
        </BlurBackground>
      </LinearGradient>
      <TransactionModal
        isOpen={showTransectionModal}
        close={() => {
          setTransectionModal(false);
        }}
        txnHash={txnHash}
        chainId={chainStore.current.chainId}
        buttonText="Go to activity screen"
        onHomeClick={() => navigation.navigate("ActivityTab", {})}
        onTryAgainClick={handleClaim}
      />
      <ClaimRewardsModal
        isOpen={showClaimModel}
        close={() => setClaimModel(false)}
        earnedAmount={stakableReward.trim(true).shrink(true).toString()}
        onPress={handleClaim}
        buttonLoading={
          isSendingTx || account.txTypeInProgress === "withdrawRewards"
        }
      />
    </React.Fragment>
  );
};
