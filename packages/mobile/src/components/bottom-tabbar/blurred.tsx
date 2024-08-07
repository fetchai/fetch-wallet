import React, { FunctionComponent } from "react";
import { BottomTabBar, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Platform, StyleSheet, View, ViewStyle } from "react-native";
import { BlurView } from "@react-native-community/blur";
import { useFocusedScreen } from "providers/focused-screen";
import { useStyle } from "styles/index";

interface BlurredBottomTabBarProps extends BottomTabBarProps {
  style?: ViewStyle; // Add the 'style' prop to the interface
  enabledScreens?: string[];
}

export const BlurredBottomTabBar: FunctionComponent<
  BlurredBottomTabBarProps
> = (props) => {
  const { style: propStyle, enabledScreens = [], ...rest } = props;

  const style = useStyle();
  const focusedScreen = useFocusedScreen();

  if (Platform.OS === "android") {
    return <AndroidAlternativeBlurredBottomTabBar {...props} />;
  }

  const containerOpacity = (() => {
    if (enabledScreens.length === 0) {
      return style.get("opacity-blurred-tabbar").opacity;
    }

    if (focusedScreen.name && enabledScreens.includes(focusedScreen.name)) {
      return style.get("opacity-blurred-tabbar").opacity;
    }

    return 1;
  })();

  return (
    <BlurView
      style={{
        position: "absolute",
        width: "100%",
        bottom: 0,
      }}
      blurType={style.get("blurred-tabbar-blur-type")}
      blurAmount={style.get("blurred-tabbar-blur-amount")}
      reducedTransparencyFallbackColor={style.get(
        "blurred-tabbar-reducedTransparencyFallbackColor"
      )}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: style.get("color-blurred-tabbar-background").color,
          opacity: containerOpacity,
        }}
      />
      <BottomTabBar
        style={StyleSheet.flatten([
          propStyle,
          {
            backgroundColor: "#FFFFFF00",
          },
        ])}
        {...rest}
      />
    </BlurView>
  );
};

const AndroidAlternativeBlurredBottomTabBar: FunctionComponent<
  BottomTabBarProps
> = (props) => {
  return (
    <View
      style={{
        position: "absolute",
        width: "100%",
        bottom: 0,
      }}
    >
      <BottomTabBar {...props} />
    </View>
  );
};
