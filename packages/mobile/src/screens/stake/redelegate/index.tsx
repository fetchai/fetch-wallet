import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useStore } from "stores/index";
import { useStyle } from "styles/index";
import { Staking } from "@keplr-wallet/stores";
import { useRedelegateTxConfig } from "@keplr-wallet/hooks";
import { PageWithScrollView } from "components/page";
import { Text, View, ViewStyle } from "react-native";
import { Button } from "components/button";
import { useSmartNavigation } from "navigation/smart-navigation";
import { DropDownCardView } from "components/new/card-view/drop-down-card";
import { ChevronRightIcon } from "components/new/icon/chevron-right";
import { StakeAmountInput } from "components/new/input/stake-amount";
import { UseMaxButton } from "components/new/button/use-max-button";
import { MemoInputView } from "components/new/card-view/memo-input";
import { FeeButtons } from "components/new/fee-button/fee-button-component";
import { TransactionModal } from "modals/transaction";

export const RedelegateScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          validatorAddress: string;
          selectedValidatorAddress: string;
        }
      >,
      string
    >
  >();

  const validatorAddress = route.params.validatorAddress;
  const selectedValidatorAddress = route.params.selectedValidatorAddress
    ? route.params.selectedValidatorAddress
    : "";

  const smartNavigation = useSmartNavigation();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const { chainStore, accountStore, queriesStore, analyticsStore, priceStore } =
    useStore();

  const style = useStyle();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const [isToggleClicked, setIsToggleClicked] = useState<boolean>(false);

  const [inputInUsd, setInputInUsd] = useState<string | undefined>("");
  const [showTransectionModal, setTransectionModal] = useState(false);
  const [txnHash, setTxnHash] = useState<string>("");

  const srcValidator =
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Bonded)
      .getValidator(validatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Unbonding)
      .getValidator(validatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Unbonded)
      .getValidator(validatorAddress);

  const staked = queries.cosmos.queryDelegations
    .getQueryBech32Address(account.bech32Address)
    .getDelegationTo(validatorAddress);

  const sendConfigs = useRedelegateTxConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainStore.current.chainId,
    account.bech32Address,
    validatorAddress
  );

  const dstValidator =
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Bonded)
      .getValidator(selectedValidatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Unbonding)
      .getValidator(selectedValidatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Unbonded)
      .getValidator(selectedValidatorAddress);

  useEffect(() => {
    sendConfigs.recipientConfig.setRawRecipient(selectedValidatorAddress);
  }, [selectedValidatorAddress, sendConfigs.recipientConfig]);

  const sendConfigError =
    sendConfigs.recipientConfig.error ??
    sendConfigs.amountConfig.error ??
    sendConfigs.memoConfig.error ??
    sendConfigs.gasConfig.error ??
    sendConfigs.feeConfig.error;
  const txStateIsValid = sendConfigError == null;

  const convertToUsd = (currency: any) => {
    const value = priceStore.calculatePrice(currency);
    return value && value.shrink(true).maxDecimals(6).toString();
  };
  useEffect(() => {
    const inputValueInUsd = convertToUsd(staked);
    setInputInUsd(inputValueInUsd);
  }, [sendConfigs.amountConfig.amount]);

  const Usd = inputInUsd
    ? ` (${inputInUsd} ${priceStore.defaultVsCurrency.toUpperCase()})`
    : "";

  const availableBalance = `${staked
    .trim(true)
    .shrink(true)
    .maxDecimals(6)
    .toString()}${Usd}`;

  const redelegateAmount = async () => {
    if (account.isReadyToSendTx && txStateIsValid) {
      try {
        analyticsStore.logEvent("redelegate_txn_click", {
          pageName: "Stake Validator",
        });
        await account.cosmos.sendBeginRedelegateMsg(
          sendConfigs.amountConfig.amount,
          sendConfigs.srcValidatorAddress,
          sendConfigs.dstValidatorAddress,
          sendConfigs.memoConfig.memo,
          sendConfigs.feeConfig.toStdFee(),
          {
            preferNoSetMemo: true,
            preferNoSetFee: true,
          },
          {
            onBroadcasted: (txHash) => {
              analyticsStore.logEvent("redelegate_txn_broadcasted", {
                chainId: chainStore.current.chainId,
                chainName: chainStore.current.chainName,
                validatorName: srcValidator?.description.moniker,
                toValidatorName: dstValidator?.description.moniker,
                feeType: sendConfigs.feeConfig.feeType,
              });
              setTxnHash(Buffer.from(txHash).toString("hex"));
              setTransectionModal(true);
            },
          }
        );
      } catch (e) {
        if (e?.message === "Request rejected") {
          return;
        }
        console.log(e);
        analyticsStore.logEvent("redelegate_txn_broadcasted_fail", {
          chainId: chainStore.current.chainId,
          chainName: chainStore.current.chainName,
          feeType: sendConfigs.feeConfig.feeType,
          message: e?.message ?? "",
        });
        smartNavigation.navigateSmart("Home", {});
      }
    }
  };

  return (
    <PageWithScrollView
      backgroundMode="image"
      style={style.flatten(["padding-x-page", "overflow-scroll"]) as ViewStyle}
      contentContainerStyle={style.get("flex-grow-1")}
    >
      <View
        style={
          style.flatten([
            "flex-row",
            "items-center",
            "border-width-1",
            "border-color-white@20%",
            "border-radius-12",
            "padding-12",
            "justify-between",
            "margin-y-16",
          ]) as ViewStyle
        }
      >
        <Text style={style.flatten(["body3", "color-white@60%"]) as ViewStyle}>
          Current staked amount
        </Text>
        <Text style={style.flatten(["subtitle3", "color-white"]) as ViewStyle}>
          {staked.trim(true).shrink(true).maxDecimals(6).toString()}
        </Text>
      </View>
      <Text
        style={
          style.flatten([
            "body3",
            "color-white@60%",
            "margin-bottom-8",
          ]) as ViewStyle
        }
      >
        From
      </Text>
      <View
        style={
          style.flatten([
            "border-width-1",
            "border-color-white@20%",
            "border-radius-12",
            "padding-x-18",
            "padding-y-12",
            "margin-bottom-8",
          ]) as ViewStyle
        }
      >
        <Text style={style.flatten(["body3", "color-white@60%"]) as ViewStyle}>
          {srcValidator ? srcValidator.description.moniker : "..."}
        </Text>
      </View>

      <DropDownCardView
        containerStyle={style.flatten(["margin-bottom-16"]) as ViewStyle}
        mainHeadingrStyle={style.flatten(["body3"]) as ViewStyle}
        headingrStyle={style.flatten(["body3", "color-white@60%"]) as ViewStyle}
        mainHeading="To"
        heading={
          dstValidator ? dstValidator.description.moniker : "Choose validator"
        }
        trailingIcon={<ChevronRightIcon color="white" />}
        onPress={() => {
          smartNavigation.navigateSmart("Validator.List", {
            prevSelectedValidator: srcValidator?.operator_address,
            selectedValidator: dstValidator?.operator_address,
          });
        }}
      />
      <StakeAmountInput
        label="Amount"
        labelStyle={
          style.flatten([
            "body3",
            "color-white@60%",
            "margin-y-0",
            "margin-bottom-8",
          ]) as ViewStyle
        }
        amountConfig={sendConfigs.amountConfig}
        isToggleClicked={isToggleClicked}
      />
      <Text
        style={
          style.flatten([
            "color-white@60%",
            "text-caption2",
            "margin-top-8",
          ]) as ViewStyle
        }
      >{`Available: ${availableBalance}`}</Text>
      <UseMaxButton
        amountConfig={sendConfigs.amountConfig}
        isToggleClicked={isToggleClicked}
        setIsToggleClicked={setIsToggleClicked}
      />
      <MemoInputView
        label="Memo"
        labelStyle={
          style.flatten([
            "body3",
            "color-white@60%",
            "padding-y-0",
            "margin-y-0",
            "margin-bottom-8",
          ]) as ViewStyle
        }
        memoConfig={sendConfigs.memoConfig}
        containerStyle={style.flatten(["margin-bottom-16"]) as ViewStyle}
      />
      <FeeButtons
        label="Fee"
        gasLabel="gas"
        feeConfig={sendConfigs.feeConfig}
        gasConfig={sendConfigs.gasConfig}
      />
      <View style={style.flatten(["flex-1"])} />
      <Button
        text="Confirm"
        disabled={!account.isReadyToSendTx || !txStateIsValid}
        loading={account.txTypeInProgress === "redelegate"}
        containerStyle={
          style.flatten(["margin-top-16", "border-radius-32"]) as ViewStyle
        }
        textStyle={style.flatten(["body2"]) as ViewStyle}
        onPress={redelegateAmount}
      />
      <View style={style.flatten(["height-page-pad"]) as ViewStyle} />
      <TransactionModal
        isOpen={showTransectionModal}
        close={() => {
          setTransectionModal(false);
        }}
        txnHash={txnHash}
        chainId={chainStore.current.chainId}
        buttonText="Go to stakescreen"
        onHomeClick={() => navigation.navigate("StakeTab", {})}
        onTryAgainClick={redelegateAmount}
      />
    </PageWithScrollView>
  );
});
