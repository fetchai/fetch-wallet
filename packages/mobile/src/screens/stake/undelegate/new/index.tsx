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
import { useUndelegateTxConfig } from "@keplr-wallet/hooks";
import { PageWithScrollView } from "components/page";
import { Text, View, ViewStyle } from "react-native";
import { Button } from "components/button";
import { Staking } from "@keplr-wallet/stores";
import { Buffer } from "buffer/";
import { useSmartNavigation } from "navigation/smart-navigation";
import { StakeAmountInput } from "components/new/input/stake-amount";
import { UseMaxButton } from "components/new/button/use-max-button";
import { MemoInputView } from "components/new/card-view/memo-input";
import { FeeButtons } from "components/new/fee-button/fee-button-component";
import { CircleExclamationIcon } from "components/new/icon/circle-exclamation";
import { TransactionModal } from "modals/transaction";

export const NewUndelegateScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          validatorAddress: string;
        }
      >,
      string
    >
  >();

  const validatorAddress = route.params.validatorAddress;

  const { chainStore, accountStore, queriesStore, analyticsStore, priceStore } =
    useStore();

  const style = useStyle();
  const smartNavigation = useSmartNavigation();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const [isToggleClicked, setIsToggleClicked] = useState<boolean>(false);
  const [selection, setSelection] = useState<
    | {
        start: number;
      }
    | undefined
  >({
    start: 0,
  });

  const [inputInUsd, setInputInUsd] = useState<string | undefined>("");
  const [showTransectionModal, setTransectionModal] = useState(false);
  const [txnHash, setTxnHash] = useState<string>("");

  const validator =
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

  const sendConfigs = useUndelegateTxConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainStore.current.chainId,
    account.bech32Address,
    validatorAddress
  );

  useEffect(() => {
    sendConfigs.recipientConfig.setRawRecipient(validatorAddress);
  }, [sendConfigs.recipientConfig, validatorAddress]);

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

  const unstakeBalance = async () => {
    if (account.isReadyToSendTx && txStateIsValid) {
      try {
        await account.cosmos.sendUndelegateMsg(
          sendConfigs.amountConfig.amount,
          sendConfigs.recipientConfig.recipient,
          sendConfigs.memoConfig.memo,
          sendConfigs.feeConfig.toStdFee(),
          {
            preferNoSetMemo: true,
            preferNoSetFee: true,
          },
          {
            onBroadcasted: (txHash) => {
              analyticsStore.logEvent("Undelegate tx broadcasted", {
                chainId: chainStore.current.chainId,
                chainName: chainStore.current.chainName,
                validatorName: validator?.description.moniker,
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
      <StakeAmountInput
        label="Amount"
        labelStyle={
          style.flatten([
            "body3",
            "color-white@60%",
            "padding-y-0",
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
        setSelection={setSelection}
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
      />
      <View
        style={
          style.flatten([
            "margin-y-16",
            "padding-12",
            "background-color-cardColor@25%",
            "flex-row",
            "border-radius-12",
          ]) as ViewStyle
        }
      >
        <View
          style={
            [style.flatten(["margin-top-4", "margin-right-10"])] as ViewStyle
          }
        >
          <CircleExclamationIcon />
        </View>
        <Text
          style={
            style.flatten(["subtitle3", "color-white", "flex-1"]) as ViewStyle
          }
        >
          Your tokens will go through a 21-day unstaking process
        </Text>
      </View>
      <FeeButtons
        label="Fee"
        gasLabel="gas"
        feeConfig={sendConfigs.feeConfig}
        gasConfig={sendConfigs.gasConfig}
      />
      <View style={style.flatten(["flex-1"])} />
      <Button
        text="Unstake"
        disabled={!account.isReadyToSendTx || !txStateIsValid}
        loading={account.txTypeInProgress === "undelegate"}
        containerStyle={
          style.flatten(["margin-top-16", "border-radius-32"]) as ViewStyle
        }
        onPress={unstakeBalance}
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
        onHomeClick={() => navigation.navigate("Stake", {})}
        onTryAgainClick={unstakeBalance}
      />
    </PageWithScrollView>
  );
});
