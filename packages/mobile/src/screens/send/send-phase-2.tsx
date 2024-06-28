import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  AmountConfig,
  FeeConfig,
  MemoConfig,
  RecipientConfig,
  SendGasConfig,
} from "@keplr-wallet/hooks";
import { useStore } from "stores/index";
import { Text, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { Button } from "components/button";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Buffer } from "buffer/";
import { AddressInputCard } from "components/new/card-view/address-card";
import { BlurButton } from "components/new/button/blur-button";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { MemoInputView } from "components/new/card-view/memo-input";
import { useSmartNavigation } from "navigation/smart-navigation";
import { useNetInfo } from "@react-native-community/netinfo";
import Toast from "react-native-toast-message";
import { TransactionModal } from "modals/transaction";
import { txType } from "components/new/txn-status.tsx";
import { TransectionFreeModel } from "components/new/fee-modal/transection-fee-modal";
import { GearIcon } from "components/new/icon/gear-icon";
import { IconButton } from "components/new/button/icon";

interface SendConfigs {
  amountConfig: AmountConfig;
  memoConfig: MemoConfig;
  gasConfig: SendGasConfig;
  feeConfig: FeeConfig;
  recipientConfig: RecipientConfig;
}

export const SendPhase2: FunctionComponent<{
  sendConfigs: SendConfigs;
  setIsNext: any;
}> = observer(({ sendConfigs, setIsNext }) => {
  const { chainStore, accountStore, priceStore, analyticsStore } = useStore();

  const [txnHash, setTxnHash] = useState<string>("");
  const [openModal, setOpenModal] = useState(false);
  const [showFeeModal, setFeeModal] = useState(false);

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          currency?: string;
          recipient?: string;
        }
      >,
      string
    >
  >();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const chainId = route.params.chainId
    ? route.params.chainId
    : chainStore.current.chainId;

  const account = accountStore.getAccount(chainId);

  const netInfo = useNetInfo();
  const networkIsConnected =
    typeof netInfo.isConnected !== "boolean" || netInfo.isConnected;

  const convertToUsd = (currency: any) => {
    const value = priceStore.calculatePrice(currency);
    return value && value.shrink(true).maxDecimals(6).toString();
  };

  const decimals = sendConfigs.amountConfig.sendCurrency.coinDecimals;

  const isEvm = chainStore.current.features?.includes("evm") ?? false;
  const feePrice = sendConfigs.feeConfig.getFeeTypePretty(
    sendConfigs.feeConfig.feeType ? sendConfigs.feeConfig.feeType : "average"
  );

  const usdValue = () => {
    const amountConfig = sendConfigs.amountConfig;
    const amount = parseFloat(amountConfig.amount);
    const sendCurrency = amountConfig.sendCurrency;
    return convertToUsd(
      amountConfig
        ? new CoinPretty(
            amountConfig.sendCurrency,
            new Int(amount * 10 ** decimals)
          )
        : new CoinPretty(sendCurrency, new Int(0))
    );
  };
  useEffect(() => {
    if (route.params.recipient) {
      sendConfigs.recipientConfig.setRawRecipient(route.params.recipient);
    }
  }, [route.params.recipient, sendConfigs.recipientConfig]);

  const sendConfigError =
    sendConfigs.recipientConfig.error ??
    sendConfigs.amountConfig.error ??
    sendConfigs.memoConfig.error ??
    sendConfigs.gasConfig.error ??
    sendConfigs.feeConfig.error;
  const txStateIsValid = sendConfigError == null;

  async function onSubmit() {
    if (!networkIsConnected) {
      Toast.show({
        type: "error",
        text1: "No internet connection",
      });
      return;
    }
    if (account.txTypeInProgress === "send") {
      Toast.show({
        type: "error",
        text1: `${txType[account.txTypeInProgress]} in progress`,
      });
      return;
    }

    if (account.isReadyToSendTx && txStateIsValid) {
      try {
        const stdFee = sendConfigs.feeConfig.toStdFee();

        analyticsStore.logEvent("send_txn_click", { pageName: "Send" });
        const tx = account.makeSendTokenTx(
          sendConfigs.amountConfig.amount,
          sendConfigs.amountConfig.sendCurrency,
          sendConfigs.recipientConfig.recipient
        );
        await tx.send(
          stdFee,
          sendConfigs.memoConfig.memo,
          {
            preferNoSetFee: true,
            preferNoSetMemo: true,
          },
          {
            onBroadcasted: (txHash) => {
              setTxnHash(Buffer.from(txHash).toString("hex"));
              setOpenModal(true);
              analyticsStore.logEvent("send_txn_broadcasted", {
                chainId: chainStore.current.chainId,
                chainName: chainStore.current.chainName,
                feeType: sendConfigs.feeConfig.feeType,
              });
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
        } else {
          Toast.show({
            type: "error",
            text1: e?.message,
          });
        }
        console.log(e);
        smartNavigation.navigateSmart("Home", {});
        analyticsStore.logEvent("send_txn_broadcasted_fail", {
          chainId: chainStore.current.chainId,
          chainName: chainStore.current.chainName,
          feeType: sendConfigs.feeConfig.feeType,
          message: e?.message ?? "",
        });
      }
    }
  }

  return (
    <React.Fragment>
      <View style={style.flatten(["height-page-pad"]) as ViewStyle} />
      <View
        style={
          style.flatten([
            "flex-row",
            "border-width-1",
            "border-color-white@20%",
            "border-radius-12",
            "padding-x-14",
            "padding-y-10",
            "items-center",
          ]) as ViewStyle
        }
      >
        <View style={style.flatten(["flex-3", "justify-center"]) as ViewStyle}>
          {usdValue() ? (
            <Text style={style.flatten(["color-white", "body3"]) as ViewStyle}>
              {usdValue()} {`${priceStore.defaultVsCurrency.toUpperCase()}`}
            </Text>
          ) : null}
          <Text
            style={
              style.flatten(["color-white@60%", "text-caption2"]) as ViewStyle
            }
          >
            {`${parseFloat(sendConfigs.amountConfig.amount)
              .toFixed(6)
              .toString()} ${sendConfigs.amountConfig.sendCurrency.coinDenom}`}
          </Text>
        </View>
        <BlurButton
          text={"Edit"}
          borderRadius={32}
          backgroundBlur={false}
          containerStyle={
            style.flatten([
              "border-width-1",
              "border-color-white@40%",
            ]) as ViewStyle
          }
          textStyle={style.flatten(["padding-x-14", "body3"]) as ViewStyle}
          onPress={() => setIsNext(false)}
        />
      </View>

      <View style={style.flatten(["margin-y-20"]) as ViewStyle}>
        <AddressInputCard
          backgroundContainerStyle={
            style.flatten(["margin-bottom-card-gap"]) as ViewStyle
          }
          label="Recipient"
          placeholderText="Wallet address"
          recipientConfig={sendConfigs.recipientConfig}
          memoConfig={sendConfigs.memoConfig}
          pageName="Send"
        />
        <MemoInputView
          label="Memo"
          placeholderText="Optional"
          memoConfig={sendConfigs.memoConfig}
        />
      </View>
      <View style={style.flatten(["flex-1"])} />
      <View
        style={
          style.flatten([
            "flex-row",
            "justify-between",
            "items-center",
            "margin-y-12",
          ]) as ViewStyle
        }
      >
        <Text style={style.flatten(["body3", "color-white@60%"]) as ViewStyle}>
          Transaction fee:
        </Text>
        <View style={style.flatten(["flex-row", "items-center"]) as ViewStyle}>
          <Text
            style={
              style.flatten([
                "body3",
                "color-white",
                "margin-right-6",
              ]) as ViewStyle
            }
          >
            {feePrice.hideIBCMetadata(true).trim(true).toMetricPrefix(isEvm)}
          </Text>
          <IconButton
            backgroundBlur={false}
            icon={<GearIcon />}
            iconStyle={
              style.flatten([
                "width-32",
                "height-32",
                "items-center",
                "justify-center",
                "border-width-1",
                "border-color-white@40%",
              ]) as ViewStyle
            }
            onPress={() => setFeeModal(true)}
          />
        </View>
      </View>
      <Button
        text="Review transaction"
        size="large"
        containerStyle={
          style.flatten(
            ["border-radius-64", "margin-top-20"],
            [
              sendConfigs.amountConfig.amount === "" ||
                sendConfigs.amountConfig.amount == "0",
            ]
          ) as ViewStyle
        }
        textStyle={style.flatten(["body2", "font-normal"]) as ViewStyle}
        rippleColor="black@50%"
        disabled={!account.isReadyToSendTx || !txStateIsValid}
        loading={account.txTypeInProgress === "send"}
        onPress={onSubmit}
      />
      <View style={style.flatten(["height-page-pad"]) as ViewStyle} />
      <TransactionModal
        isOpen={openModal}
        close={() => {
          setOpenModal(false);
        }}
        txnHash={txnHash}
        chainId={chainId}
        onHomeClick={() => {
          smartNavigation.navigateSmart("Home", {});
        }}
        onTryAgainClick={onSubmit}
      />
      <TransectionFreeModel
        isOpen={showFeeModal}
        close={() => setFeeModal(false)}
        title={"Transaction fee"}
        feeConfig={sendConfigs.feeConfig}
        gasConfig={sendConfigs.gasConfig}
      />
    </React.Fragment>
  );
});
