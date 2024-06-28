import React, { FunctionComponent } from "react";
import { PageWithScrollViewInBottomTabView } from "components/page";
import { Right, SettingItem, SettingSectionTitle } from "./components";
import { useSmartNavigation } from "navigation/smart-navigation";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/index";
import { canShowPrivateData } from "./screens/view-private-data";
import { useStyle } from "styles/index";
import { Platform, Text, View, ViewStyle } from "react-native";
import { ATIcon } from "components/new/icon/at-icon";
import { CoinsIcon } from "components/new/icon/coins";
import { ShieldIcon } from "components/new/icon/shield";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CurrencyIcon } from "components/new/icon/currency";
import { BranchIcon } from "components/new/icon/branch-icon";
import { SignOutIcon } from "components/new/icon/sign-out";
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from "@react-navigation/native";

export const SettingScreen: FunctionComponent = observer(() => {
  const {
    chainStore,
    keychainStore,
    keyRingStore,
    tokensStore,
    priceStore,
    analyticsStore,
  } = useStore();

  const style = useStyle();

  const safeAreaInsets = useSafeAreaInsets();

  const smartNavigation = useSmartNavigation();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const showPrivateData = canShowPrivateData(keyRingStore.keyRingType);
  const showManageTokenButton = (() => {
    if (!chainStore.current.features) {
      return false;
    }

    if (chainStore.current.features.includes("cosmwasm")) {
      return true;
    }
  })();

  return (
    <PageWithScrollViewInBottomTabView
      backgroundMode="image"
      isTransparentHeader={true}
      style={style.flatten(["padding-x-page"]) as ViewStyle}
      contentContainerStyle={{
        paddingTop: Platform.OS === "ios" ? safeAreaInsets.top + 10 : 48,
      }}
      containerStyle={style.flatten(["overflow-scroll"]) as ViewStyle}
    >
      <Text
        style={
          style.flatten([
            "h1",
            "font-normal",
            "color-white",
            "margin-top-16",
            "margin-bottom-20",
          ]) as ViewStyle
        }
      >
        More
      </Text>
      <SettingSectionTitle title="Account" />
      <SettingItem
        label="Currency"
        left={<CurrencyIcon size={16} />}
        right={<Right paragraph={priceStore.defaultVsCurrency.toUpperCase()} />}
        onPress={() => {
          navigation.navigate("Setting", {
            screen: "Setting.Currency",
          });
          // smartNavigation.navigateSmart("Setting.Currency", {});
          analyticsStore.logEvent("currency_click", {
            pageName: "More",
          });
        }}
      />
      {showManageTokenButton ? (
        <SettingItem
          label="Manage tokens"
          left={<CoinsIcon size={16} />}
          right={
            <Right
              paragraph={tokensStore
                .getTokensOf(chainStore.current.chainId)
                .tokens.length.toString()}
            />
          }
          onPress={() => {
            navigation.navigate("Setting", {
              screen: "Setting.ManageTokens",
            });
            analyticsStore.logEvent("manage_tokens_click", {
              pageName: "More",
            });
          }}
        />
      ) : null}
      <SettingItem
        left={<ATIcon size={16} />}
        label="Address book"
        onPress={() => {
          navigation.navigate("AddressBooks", {
            screen: "AddressBook",
            params: {},
          });
          analyticsStore.logEvent("address_book_click", {
            pageName: "More",
          });
        }}
      />
      {showPrivateData ||
      keychainStore.isBiometrySupported ||
      keychainStore.isBiometryOn ? (
        <SettingItem
          label="Security & privacy"
          left={<ShieldIcon size={16} />}
          onPress={() => {
            navigation.navigate("Setting", {
              screen: "Setting.SecurityAndPrivacy",
            });
            analyticsStore.logEvent("security_and_privacy_click", {
              pageName: "More",
            });
          }}
        />
      ) : null}
      <SettingSectionTitle title="Others" />
      <SettingItem
        label="Fetch Wallet version"
        left={<BranchIcon size={16} />}
        onPress={() => {
          navigation.navigate("Setting", {
            screen: "Setting.Version",
          });
        }}
      />
      <SettingItem
        label="Sign out"
        left={<SignOutIcon size={16} />}
        onPress={async () => {
          await keyRingStore.lock();
          smartNavigation.reset({
            index: 0,
            routes: [
              {
                name: "Unlock",
              },
            ],
          });
        }}
      />
      {/* Mock element for padding bottom */}
      <View style={style.get("height-32") as ViewStyle} />
    </PageWithScrollViewInBottomTabView>
  );
});
