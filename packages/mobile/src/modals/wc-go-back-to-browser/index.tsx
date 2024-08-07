import React, { FunctionComponent } from "react";
import { Text, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { CardModal } from "../card";
import Svg, { Circle, Path } from "react-native-svg";

export const WCGoBackToBrowserModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = ({ isOpen, close }) => {
  const style = useStyle();

  if (!isOpen) {
    return null;
  }

  return (
    <CardModal
      isOpen={isOpen}
      close={close}
      childrenContainerStyle={
        style.flatten([
          "padding-top-24",
          "padding-bottom-40",
          "padding-x-0",
        ]) as ViewStyle
      }
    >
      <View style={style.flatten(["items-center"])}>
        <View style={style.flatten(["margin-bottom-20"]) as ViewStyle}>
          <Svg width="42" height="42" fill="none" viewBox="0 0 42 42">
            <Circle
              cx="21"
              cy="21"
              r="21"
              fill={style.get("color-blue-400").color}
            />
            <Path
              stroke="#fff"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M20.25 30l-9-9 9-9m-7.75 9h18.25"
            />
          </Svg>
        </View>
        <Text
          style={style.flatten(["subtitle1", "color-text-middle"]) as ViewStyle}
        >
          Go back to your browser
        </Text>
      </View>
    </CardModal>
  );
};
