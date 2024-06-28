import { CardModal } from "modals/card";
import React, { FunctionComponent } from "react";
import { ActivityIndicator, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";

export const LoadingScreenModal: FunctionComponent<{ isOpen: boolean }> = ({
  isOpen,
}) => {
  const style = useStyle();
  return (
    <CardModal
      isOpen={isOpen}
      showCloseButton={false}
      cardStyle={
        style.flatten([
          "background-color-black@60%",
          "min-height-full",
          "max-height-full",
          "border-radius-0",
          "items-center",
          "justify-center",
        ]) as ViewStyle
      }
    >
      <View
        style={
          style.flatten([
            "min-height-full",
            "max-height-full",
            "items-center",
            "justify-center",
          ]) as ViewStyle
        }
      >
        <ActivityIndicator
          size="large"
          color={style.get("color-white").color}
        />
      </View>
    </CardModal>
  );
};
