import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "components/page";
import { View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { Button } from "components/button";
import { AddressInput } from "components/input";
import { observer } from "mobx-react-lite";
import { useRecipientConfig } from "@keplr-wallet/hooks";
import { useStore } from "stores/index";
import { useNavigation } from "@react-navigation/native";
import { InputCardView } from "components/new/card-view/input-card";

export const SettingAddTokenScreen: FunctionComponent = observer(() => {
  const { chainStore, queriesStore, tokensStore } = useStore();

  const navigation = useNavigation();

  const style = useStyle();

  const recipientConfig = useRecipientConfig(
    chainStore,
    chainStore.current.chainId
  );

  const queryTokenInfo = queriesStore
    .get(chainStore.current.chainId)
    .cosmwasm.querycw20ContractInfo.getQueryContract(recipientConfig.recipient);

  return (
    <PageWithScrollView
      backgroundMode="image"
      contentContainerStyle={style.get("flex-grow-1")}
      style={style.flatten(["padding-x-page"]) as ViewStyle}
    >
      <View style={style.flatten(["height-page-pad"]) as ViewStyle} />
      <AddressInput
        label="Contract Address"
        recipientConfig={recipientConfig}
        disableAddressBook={true}
      />
      <InputCardView
        label="Name"
        editable={false}
        value={queryTokenInfo.tokenInfo?.name ?? ""}
      />
      <InputCardView
        label="Symbol"
        editable={false}
        value={queryTokenInfo.tokenInfo?.symbol ?? ""}
      />
      <InputCardView
        label="Decimals"
        editable={false}
        value={queryTokenInfo.tokenInfo?.decimals.toString() ?? ""}
      />
      <View style={style.get("flex-1")} />
      <Button
        text="Submit"
        size="large"
        containerStyle={style.flatten(["border-radius-32"]) as ViewStyle}
        disabled={!queryTokenInfo.tokenInfo || queryTokenInfo.error != null}
        loading={!queryTokenInfo.tokenInfo && queryTokenInfo.isFetching}
        onPress={async () => {
          if (queryTokenInfo.tokenInfo) {
            await tokensStore.getTokensOf(chainStore.current.chainId).addToken({
              type: "cw20",
              contractAddress: recipientConfig.recipient,
              coinMinimalDenom: queryTokenInfo.tokenInfo.name,
              coinDenom: queryTokenInfo.tokenInfo.symbol,
              coinDecimals: queryTokenInfo.tokenInfo.decimals,
            });

            if (navigation.canGoBack()) {
              navigation.goBack();
            }
          }
        }}
      />
      <View style={style.flatten(["height-page-pad"]) as ViewStyle} />
    </PageWithScrollView>
  );
});
