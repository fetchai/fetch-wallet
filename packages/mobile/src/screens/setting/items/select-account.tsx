import React, { FunctionComponent } from "react";
import { KeyStoreItem, RightArrow } from "../components";
import { useStyle } from "styles/index";
import { useSmartNavigation } from "navigation/smart-navigation";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/index";
import { View, ViewStyle } from "react-native";
import { getKeyStoreParagraph } from "../screens/select-account";

export const SettingSelectAccountItem: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  const selected = keyRingStore.multiKeyStoreInfo.find(
    (keyStore) => keyStore.selected
  );

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  return (
    <React.Fragment>
      <View
        style={
          style.flatten([
            "height-1",
            "background-color-gray-50",
            "dark:background-color-platinum-500@75%",
          ]) as ViewStyle
        }
      />
      <KeyStoreItem
        containerStyle={style.flatten(["padding-left-10"]) as ViewStyle}
        defaultRightWalletIconStyle={
          style.flatten(["margin-right-2"]) as ViewStyle
        }
        label={
          selected ? selected.meta?.["name"] || "Fetch Account" : "No Account"
        }
        paragraph={selected ? getKeyStoreParagraph(selected) : undefined}
        right={<RightArrow />}
        topBorder={false}
        bottomBorder={false}
        onPress={() => {
          smartNavigation.navigateSmart("SettingSelectAccount", {});
        }}
      />
      <View
        style={
          style.flatten([
            "height-1",
            "background-color-gray-50",
            "dark:background-color-platinum-500@75%",
          ]) as ViewStyle
        }
      />
    </React.Fragment>
  );
});
