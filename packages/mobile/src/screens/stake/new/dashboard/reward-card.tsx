import React, { FunctionComponent, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { Text, View, ViewStyle } from "react-native";
import { BlurBackground } from "components/new/blur-background/blur-background";
import { useStyle } from "styles/index";
import { GradientButton } from "components/new/button/gradient-button";
import { useStore } from "stores/index";
import { useSmartNavigation } from "navigation/smart-navigation";
import { useNetInfo } from "@react-native-community/netinfo";
import { separateNumericAndDenom } from "utils/format/format";
import { Dec } from "@keplr-wallet/unit";
import Toast from "react-native-toast-message";
import { ChevronDownIcon } from "components/new/icon/chevron-down";
import { Button } from "components/button";
import { ValidatorThumbnail } from "components/thumbnail";
import { Staking } from "@keplr-wallet/stores";
import { TouchableOpacity } from "react-native-gesture-handler";
import { ChevronUpIcon } from "components/new/icon/chevron-up";
import { TransactionModal } from "modals/transaction";
import { ClaimRewardsModal } from "components/new/claim-reward-model";
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from "@react-navigation/native";
import { SlideDownAnimation } from "components/new/animations/slide-down";
import { AnimatedNumber } from "components/new/animations/animated-number";
import { txType } from "components/new/txn-status.tsx";
import { VectorCharacter } from "components/vector-character";

interface ClaimData {
  reward: string;
  validatorAddress: string;
}

export const MyRewardCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const style = useStyle();

  const { chainStore, accountStore, queriesStore, priceStore, analyticsStore } =
    useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const queryReward = queries.cosmos.queryRewards.getQueryBech32Address(
    account.bech32Address
  );
  const queryStakable = queries.queryBalances.getQueryBech32Address(
    account.bech32Address
  ).stakable;
  const stakable = queryStakable.balance;

  const pendingStakableReward =
    queries.cosmos.queryRewards.getQueryBech32Address(
      account.bech32Address
    ).stakableReward;

  const queryDelegations =
    queries.cosmos.queryDelegations.getQueryBech32Address(
      account.bech32Address
    );
  const delegations = queryDelegations.delegations;

  const smartNavigation = useSmartNavigation();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const [showRewars, setShowRewards] = useState(false);
  const [isSendingTx, setIsSendingTx] = useState(false);
  const [showTransectionModal, setTransectionModal] = useState(false);
  const [txnHash, setTxnHash] = useState<string>("");
  const [showClaimModel, setClaimModel] = useState(false);

  const netInfo = useNetInfo();
  const networkIsConnected =
    typeof netInfo.isConnected !== "boolean" || netInfo.isConnected;

  const pendingStakableRewardUSD = priceStore.calculatePrice(
    pendingStakableReward.shrink(true).maxDecimals(6).trim(true)
  );

  const { numericPart: totalNumber, denomPart: totalDenom } =
    separateNumericAndDenom(
      pendingStakableReward.shrink(true).maxDecimals(6).trim(true).toString()
    );

  const handleAllClaim = async () => {
    if (!networkIsConnected) {
      Toast.show({
        type: "error",
        text1: "No internet connection",
      });
      return;
    }
    const validatorAddresses =
      queryReward.getDescendingPendingRewardValidatorAddresses(8);
    const tx =
      account.cosmos.makeWithdrawDelegationRewardTx(validatorAddresses);

    setIsSendingTx(true);

    try {
      analyticsStore.logEvent("claim_click", {
        pageName: "Stake",
      });
      let gas =
        account.cosmos.msgOpts.withdrawRewards.gas * validatorAddresses.length;

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
              pageName: "Stake",
            });
            setTxnHash(Buffer.from(txHash).toString("hex"));
            setTransectionModal(true);
          },
        }
      );
    } catch (e) {
      if (
        e?.message === "Request rejected" ||
        e?.message === "Transaction rejected"
      ) {
        Toast.show({
          type: "error",
          text1: "Transaction rejected",
        });
        return;
      }
      console.log(e);
      analyticsStore.logEvent("claim_txn_broadcasted_fail", {
        chainId: chainStore.current.chainId,
        chainName: chainStore.current.chainName,
        pageName: "Stake",
      });
      smartNavigation.navigateSmart("Home", {});
    } finally {
      setClaimModel(false);
      setIsSendingTx(false);
    }
  };

  return (
    <BlurBackground
      borderRadius={12}
      blurIntensity={20}
      containerStyle={
        [style.flatten(["padding-18"]), containerStyle] as ViewStyle
      }
    >
      <View
        style={
          style.flatten([
            "flex-row",
            "justify-evenly",
            "items-center",
          ]) as ViewStyle
        }
      >
        <View style={style.flatten(["flex-3"]) as ViewStyle}>
          <Text
            style={
              style.flatten([
                "body3",
                "padding-bottom-6",
                "color-white@60%",
              ]) as ViewStyle
            }
          >
            Staking rewards
          </Text>
          <View style={style.flatten(["flex-row"])}>
            <AnimatedNumber
              numberForAnimated={
                pendingStakableRewardUSD
                  ? pendingStakableRewardUSD
                      .shrink(true)
                      .maxDecimals(6)
                      .trim(true)
                      .toString()
                  : totalNumber
              }
              includeComma={true}
              decimalAmount={2}
              gap={0}
              colorValue={"white"}
              fontSizeValue={14}
              hookName={"withTiming"}
              withTimingProps={{
                durationValue: 1000,
                easingValue: "linear",
              }}
            />
            <Text
              style={
                [
                  style.flatten(["body3", "padding-left-4", "color-gray-300"]),
                  { lineHeight: 16 },
                ] as ViewStyle
              }
            >
              {pendingStakableRewardUSD
                ? priceStore.defaultVsCurrency.toUpperCase()
                : totalDenom}
            </Text>
          </View>
        </View>
        {!(
          !networkIsConnected ||
          !account.isReadyToSendTx ||
          pendingStakableReward.toDec().equals(new Dec(0)) ||
          stakable.toDec().lte(new Dec(0)) ||
          queryReward.pendingRewardValidatorAddresses.length === 0
        ) ? (
          <GradientButton
            text={"Claim all"}
            color1={"#F9774B"}
            color2={"#CF447B"}
            rippleColor="black@50%"
            size="small"
            containerStyle={
              style.flatten(["border-radius-64", "height-32"]) as ViewStyle
            }
            buttonStyle={style.flatten(["padding-x-4"]) as ViewStyle}
            textStyle={style.flatten(["body3"]) as ViewStyle}
            onPress={() => {
              if (account.txTypeInProgress === "withdrawRewards") {
                Toast.show({
                  type: "error",
                  text1: `${txType[account.txTypeInProgress]} in progress`,
                });
                return;
              }
              analyticsStore.logEvent("claim_all_staking_reward_click", {
                pageName: "Stake",
              });
              setClaimModel(true);
            }}
            loading={isSendingTx}
            disabled={
              !account.isReadyToSendTx ||
              pendingStakableReward.toDec().equals(new Dec(0)) ||
              queryReward.pendingRewardValidatorAddresses.length === 0
            }
          />
        ) : null}
      </View>
      {!(
        pendingStakableReward.toDec().equals(new Dec(0)) ||
        stakable.toDec().lte(new Dec(0)) ||
        queryReward.pendingRewardValidatorAddresses.length === 0 ||
        delegations.length === 0
      ) ? (
        <TouchableOpacity
          onPress={() => setShowRewards(!showRewars)}
          style={
            style.flatten([
              "margin-top-16",
              "flex-row",
              "items-center",
            ]) as ViewStyle
          }
        >
          <Text
            style={
              [
                style.flatten(["color-indigo-250", "text-caption2"]),
                { lineHeight: 15 },
              ] as ViewStyle
            }
          >
            {!showRewars ? "View rewards" : "Hide rewards"}
          </Text>
          <View style={style.flatten(["margin-left-6"]) as ViewStyle}>
            {!showRewars ? (
              <ChevronDownIcon color="#BFAFFD" size={12} />
            ) : (
              <ChevronUpIcon color="#BFAFFD" size={12} />
            )}
          </View>
        </TouchableOpacity>
      ) : null}
      {showRewars && (
        <SlideDownAnimation>
          <DelegateReward />
        </SlideDownAnimation>
      )}
      <ClaimRewardsModal
        isOpen={showClaimModel}
        close={() => setClaimModel(false)}
        earnedAmount={pendingStakableReward
          .shrink(true)
          .maxDecimals(10)
          .trim(true)
          .toString()}
        onPress={handleAllClaim}
        buttonLoading={
          isSendingTx || account.txTypeInProgress === "withdrawRewards"
        }
      />
      <TransactionModal
        isOpen={showTransectionModal}
        close={() => {
          setTransectionModal(false);
        }}
        txnHash={txnHash}
        chainId={chainStore.current.chainId}
        buttonText="Go to stakescreen"
        onHomeClick={() => navigation.navigate("Stake", {})}
        onTryAgainClick={handleAllClaim}
      />
    </BlurBackground>
  );
});

const DelegateReward: FunctionComponent = observer(() => {
  const style = useStyle();

  const { chainStore, accountStore, queriesStore, analyticsStore } = useStore();

  const smartNavigation = useSmartNavigation();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const [isSendingTx, setIsSendingTx] = useState("");
  const [showTransectionModal, setTransectionModal] = useState(false);
  const [txnHash, setTxnHash] = useState<string>("");
  const [showClaimModel, setClaimModel] = useState(false);
  const [claimData, setClaimData] = useState<ClaimData>({
    reward: "",
    validatorAddress: "",
  });

  const netInfo = useNetInfo();
  const networkIsConnected =
    typeof netInfo.isConnected !== "boolean" || netInfo.isConnected;

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const queryDelegations =
    queries.cosmos.queryDelegations.getQueryBech32Address(
      account.bech32Address
    );
  const delegations = queryDelegations.delegations;

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded
  );
  const unbondingValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Unbonding
  );
  const unbondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Unbonded
  );

  const validators = useMemo(() => {
    return bondedValidators.validators
      .concat(unbondingValidators.validators)
      .concat(unbondedValidators.validators);
  }, [
    bondedValidators.validators,
    unbondingValidators.validators,
    unbondedValidators.validators,
  ]);

  const validatorsMap = useMemo(() => {
    const map: Map<string, Staking.Validator> = new Map();

    for (const val of validators) {
      map.set(val.operator_address, val);
    }

    return map;
  }, [validators]);

  const handleClaim = async (operatorAddress: string) => {
    if (!networkIsConnected) {
      Toast.show({
        type: "error",
        text1: "No internet connection",
      });
      return;
    }
    const tx = account.cosmos.makeWithdrawDelegationRewardTx([operatorAddress]);

    setIsSendingTx(operatorAddress);

    try {
      analyticsStore.logEvent("claim_click", {
        pageName: "Stake",
      });
      let gas =
        account.cosmos.msgOpts.withdrawRewards.gas * operatorAddress.length;

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
              pageName: "Stake",
            });
            setTxnHash(Buffer.from(txHash).toString("hex"));
            setTransectionModal(true);
          },
        }
      );
    } catch (e) {
      if (
        e?.message === "Request rejected" ||
        e?.message === "Transaction rejected"
      ) {
        Toast.show({
          type: "error",
          text1: "Transaction rejected",
        });
        return;
      }
      console.log(e);
      analyticsStore.logEvent("claim_txn_broadcasted_fail", {
        chainId: chainStore.current.chainId,
        chainName: chainStore.current.chainName,
        pageName: "Stake",
      });
      smartNavigation.navigateSmart("Home", {});
    } finally {
      setClaimModel(false);
      setIsSendingTx("");
    }
  };

  return (
    <React.Fragment>
      {delegations.map((del) => {
        const val = validatorsMap.get(del.delegation.validator_address);
        if (!val) {
          return null;
        }

        const thumbnail =
          bondedValidators.getValidatorThumbnail(val.operator_address) ||
          unbondingValidators.getValidatorThumbnail(val.operator_address) ||
          unbondedValidators.getValidatorThumbnail(val.operator_address);

        // const amount = queryDelegations.getDelegationTo(val.operator_address);
        // const amountUSD = priceStore.calculatePrice(
        //   amount.maxDecimals(5).trim(true).shrink(true)
        // );
        const rewards = queries.cosmos.queryRewards
          .getQueryBech32Address(account.bech32Address)
          .getStakableRewardOf(val.operator_address);

        return parseFloat(rewards.toString().split(" ")[0]) > 0 ? (
          <View
            key={del.delegation.validator_address}
            style={
              style.flatten([
                "flex-row",
                "justify-evenly",
                "items-center",
                "margin-top-16",
              ]) as ViewStyle
            }
          >
            <View
              style={
                style.flatten([
                  "flex-3",
                  "flex-row",
                  "items-center",
                ]) as ViewStyle
              }
            >
              {thumbnail || val.description.moniker === undefined ? (
                <ValidatorThumbnail
                  size={32}
                  url={thumbnail}
                  style={style.flatten(["margin-right-12"]) as ViewStyle}
                />
              ) : (
                <BlurBackground
                  backgroundBlur={true}
                  blurIntensity={16}
                  containerStyle={
                    style.flatten([
                      "width-32",
                      "height-32",
                      "border-radius-64",
                      "items-center",
                      "justify-center",
                      "margin-right-12",
                    ]) as ViewStyle
                  }
                >
                  <VectorCharacter
                    char={val.description.moniker.trim()[0]}
                    color="white"
                    height={12}
                  />
                </BlurBackground>
              )}
              <View>
                <Text
                  style={
                    style.flatten([
                      "body3",

                      "padding-bottom-2",
                      "color-white",
                    ]) as ViewStyle
                  }
                >
                  {val.description.moniker?.trim()}
                </Text>
                <Text
                  style={
                    style.flatten(["body3", "color-white@60%"]) as ViewStyle
                  }
                >
                  {rewards.maxDecimals(8).trim(true).shrink(true).toString()}
                </Text>
              </View>
            </View>
            {!(!networkIsConnected || !account.isReadyToSendTx) ? (
              <Button
                text={"Claim"}
                rippleColor="black@50%"
                size="small"
                mode="outline"
                containerStyle={
                  style.flatten([
                    "border-radius-64",
                    "border-color-white@40%",
                    "padding-x-6",
                    "height-30",
                  ]) as ViewStyle
                }
                textStyle={style.flatten(["body3", "color-white"]) as ViewStyle}
                onPress={() => {
                  if (account.txTypeInProgress === "withdrawRewards") {
                    Toast.show({
                      type: "error",
                      text1: `${txType[account.txTypeInProgress]} in progress`,
                    });
                    return;
                  }
                  analyticsStore.logEvent("claim_staking_reward_click", {
                    pageName: "Stake",
                  });
                  setClaimData({
                    reward: rewards
                      .maxDecimals(10)
                      .trim(true)
                      .shrink(true)
                      .toString(),
                    validatorAddress: val.operator_address,
                  });
                  setClaimModel(true);
                }}
                disabled={!account.isReadyToSendTx}
                loading={isSendingTx == val.operator_address}
              />
            ) : null}
          </View>
        ) : null;
      })}
      <ClaimRewardsModal
        isOpen={showClaimModel}
        close={() => setClaimModel(false)}
        earnedAmount={claimData.reward}
        onPress={() => handleClaim(claimData.validatorAddress)}
        buttonLoading={isSendingTx == claimData.validatorAddress}
      />
      <TransactionModal
        isOpen={showTransectionModal}
        close={() => setTransectionModal(false)}
        txnHash={txnHash}
        chainId={chainStore.current.chainId}
        buttonText="Go to stakescreen"
        onHomeClick={() => navigation.navigate("Stake", {})}
        onTryAgainClick={() => handleClaim(claimData.validatorAddress)}
      />
    </React.Fragment>
  );
});
