import React, { FunctionComponent } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";

export const Card: FunctionComponent<{
  style?: ViewStyle;
}> = ({ style: propStyle, children }) => {
  const style = useStyle();

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten([
          "width-full",
          "background-color-card",
          "overflow-hidden",
        ]) as ViewStyle,
        propStyle,
      ])}
    >
      {children}
    </View>
  );
};
