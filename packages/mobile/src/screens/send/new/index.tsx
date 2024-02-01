import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useSendTxConfig } from "@keplr-wallet/hooks";
import { useStore } from "stores/index";
import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { SendPhase1 } from "./send-phase-1";
import { SendPhase2 } from "./send-phase-2";
import { PageWithScrollView } from "components/page";
import { ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { HeaderBackButtonIcon } from "components/header/icon";
import { useSmartNavigation } from "navigation/smart-navigation";
import { IconButton } from "components/new/button/icon";

export const NewSendScreen: FunctionComponent = observer(() => {
  const [isNext, setIsNext] = useState(false);
  const { chainStore, accountStore, queriesStore } = useStore();
  const style = useStyle();

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

  const chainId = route.params.chainId
    ? route.params.chainId
    : chainStore.current.chainId;

  const account = accountStore.getAccount(chainId);

  const smartNavigation = useSmartNavigation();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const sendConfigs = useSendTxConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainId,
    account.bech32Address,
    {
      allowHexAddressOnEthermint: true,
    }
  );

  useEffect(() => {
    smartNavigation.setOptions({
      headerLeft: () => (
        <IconButton
          icon={<HeaderBackButtonIcon color="white" size={21} />}
          backgroundBlur={false}
          onPress={() => {
            if (isNext) {
              setIsNext(false);
            } else {
              navigation.goBack();
            }
          }}
          iconStyle={
            style.flatten([
              "width-54",
              "border-width-1",
              "border-color-gray-300",
              "padding-x-14",
              "padding-y-6",
              "justify-center",
              "items-center",
              "margin-y-10",
              "margin-left-10",
            ]) as ViewStyle
          }
        />
      ),
    });
  }, [chainId, chainStore, smartNavigation, style]);

  useEffect(() => {
    if (route.params.currency) {
      const currency = sendConfigs.amountConfig.sendableCurrencies.find(
        (cur) => cur.coinMinimalDenom === route.params.currency
      );
      if (currency) {
        sendConfigs.amountConfig.setSendCurrency(currency);
      }
    }
  }, [route.params.currency, sendConfigs.amountConfig]);

  return (
    <PageWithScrollView
      backgroundMode="image"
      contentContainerStyle={style.get("flex-grow-1")}
      style={style.flatten(["padding-x-page"]) as ViewStyle}
    >
      {!isNext && (
        <SendPhase1 setIsNext={setIsNext} sendConfigs={sendConfigs} />
      )}
      {isNext && <SendPhase2 sendConfigs={sendConfigs} setIsNext={setIsNext} />}
    </PageWithScrollView>
  );
});
