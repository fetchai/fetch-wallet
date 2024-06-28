import React, { FunctionComponent } from "react";
import { View, ViewStyle } from "react-native";
import { BlurButton } from "./blur-button";
import { ReloadIcon } from "../icon/reload-icon";
import { useStyle } from "styles/index";
import { IAmountConfig } from "@keplr-wallet/hooks";
import { useStore } from "stores/index";

export const UseMaxButton: FunctionComponent<{
  amountConfig: IAmountConfig;
  isToggleClicked: boolean;
  setIsToggleClicked: any;
  containerStyle?: ViewStyle;
}> = ({
  amountConfig,
  isToggleClicked,
  setIsToggleClicked,
  containerStyle,
}) => {
  const style = useStyle();
  const { priceStore } = useStore();

  return (
    <View
      style={
        [
          style.flatten(["flex-row", "justify-evenly", "margin-y-16"]),
          containerStyle,
        ] as ViewStyle
      }
    >
      <View style={style.flatten(["flex-1"]) as ViewStyle}>
        <BlurButton
          text={`Change to ${
            !isToggleClicked
              ? priceStore.defaultVsCurrency.toUpperCase()
              : amountConfig.sendCurrency.coinDenom
          }`}
          backgroundBlur={false}
          leftIcon={
            <View style={style.flatten(["margin-right-8"]) as ViewStyle}>
              <ReloadIcon
                size={21}
                color={
                  amountConfig.sendCurrency["coinGeckoId"] ? "white" : "#323C4A"
                }
              />
            </View>
          }
          disable={!amountConfig.sendCurrency["coinGeckoId"]}
          borderRadius={32}
          onPress={() => {
            setIsToggleClicked(!isToggleClicked);
          }}
          containerStyle={
            style.flatten([
              "border-width-1",
              "margin-4",
              "padding-6",
              "justify-center",
              amountConfig.sendCurrency["coinGeckoId"]
                ? "border-color-gray-300"
                : "border-color-platinum-400",
            ]) as ViewStyle
          }
          textStyle={
            style.flatten([
              "body3",
              amountConfig.sendCurrency["coinGeckoId"]
                ? "color-white"
                : "color-platinum-400",
            ]) as ViewStyle
          }
        />
      </View>
      <View style={style.flatten(["flex-1"]) as ViewStyle}>
        <BlurButton
          text="Use max available"
          backgroundBlur={false}
          borderRadius={32}
          onPress={() => {
            amountConfig.toggleIsMax();
          }}
          containerStyle={
            style.flatten([
              "border-width-1",
              "border-color-gray-300",
              "padding-6",
              "margin-4",
              "justify-center",
            ]) as ViewStyle
          }
          textStyle={style.flatten(["body3", "color-white"]) as ViewStyle}
        />
      </View>
    </View>
  );
};
