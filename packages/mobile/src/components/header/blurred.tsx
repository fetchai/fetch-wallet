import React, { FunctionComponent } from "react";
import {
  Header,
  StackHeaderProps,
  TransitionPresets,
} from "@react-navigation/stack";
import { Animated, Platform, StyleSheet, View, ViewStyle } from "react-native";
import { BlurView } from "@react-native-community/blur";
import { usePageScrollPosition } from "providers/page-scroll-position";
import { useRoute } from "@react-navigation/native";
import { HeaderLeftBackButton, HeaderLeftBackBlurButton } from "./button";
import { useStyle } from "styles/index";
import { BlurBackground } from "components/new/blur-background/blur-background";
import { getPlatformFontFamily } from "styles/builder/utils";

type HeaderBackgroundMode =
  | "gradient"
  | "secondary"
  | "at-secondary"
  | "tertiary";

const getBlurredHeaderScreenOptionsPreset = (
  backgroundMode: HeaderBackgroundMode
) => {
  return {
    headerTitleAlign: "center" as "left" | "center",
    headerStyle: {
      backgroundColor: "transparent",
      elevation: 0,
      shadowOpacity: 0,
    },
    headerBackground: undefined,
    headerBackTitleVisible: false,
    header: (props: any) => {
      return <BlurredHeader {...props} backgroundMode={backgroundMode} />;
    },
    headerLeftContainerStyle: {
      paddingLeft: 20,
    },
    headerRightContainerStyle: {
      paddingRight: 20,
    },
    headerLeft: (props: any) => <HeaderLeftBackButton {...props} />,
    ...TransitionPresets.SlideFromRightIOS,
  };
};

export const HeaderOnGradientScreenOptionsPreset =
  getBlurredHeaderScreenOptionsPreset("gradient");

export const HeaderOnSecondaryScreenOptionsPreset =
  getBlurredHeaderScreenOptionsPreset("secondary");

export const HeaderAtSecondaryScreenOptionsPreset =
  getBlurredHeaderScreenOptionsPreset("at-secondary");

export const HeaderOnTertiaryScreenOptionsPreset =
  getBlurredHeaderScreenOptionsPreset("tertiary");

export const TransparentHeaderOptionsPreset = {
  headerTitleAlign: "center" as "left" | "center",
  headerStyle: {
    backgroundColor: "transparent",
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitleStyle: {
    color: "white",
    fontSize: 16,
    fontFamily: getPlatformFontFamily("400"),
  },
  headerBackground: undefined,
  headerBackTitleVisible: false,
  header: (props: any) => {
    return <TransparentHeader {...props} />;
  },
  headerLeftContainerStyle: {
    paddingLeft: 20,
  },
  headerRightContainerStyle: {
    paddingRight: 20,
  },
  headerLeft: (props: any) => <HeaderLeftBackBlurButton {...props} />,
  ...TransitionPresets.SlideFromRightIOS,
};

export const BlurHeaderOptionsPreset = {
  headerTitleAlign: "center" as "left" | "center",
  headerStyle: {
    backgroundColor: "transparent",
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitleStyle: {
    color: "white",
    fontSize: 16,
    fontFamily: getPlatformFontFamily("400"),
  },
  headerBackground: undefined,
  headerBackTitleVisible: false,
  header: (props: any) => {
    return <BlurHeader {...props} />;
  },
  headerLeftContainerStyle: {
    paddingLeft: 20,
  },
  headerRightContainerStyle: {
    paddingRight: 20,
  },
  headerLeft: (props: any) => <HeaderLeftBackBlurButton {...props} />,
  ...TransitionPresets.SlideFromRightIOS,
};

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const useStyleInfo = (backgroundMode: HeaderBackgroundMode) => {
  const style = useStyle();

  return (() => {
    switch (backgroundMode) {
      case "gradient":
        return style.get("header-on-gradient-screen");
      case "secondary":
        return style.get("header-on-secondary-screen");
      case "at-secondary":
        return style.get("header-at-secondary-screen");
      case "tertiary":
        return style.get("header-on-tertiary-screen");
      default:
        throw new Error(`Unknown header background mode: ${backgroundMode}`);
    }
  })();
};

export const BlurredHeader: FunctionComponent<
  StackHeaderProps & {
    backgroundMode: HeaderBackgroundMode;
  }
> = (props) => {
  const { backgroundMode, ...restProps } = props;

  const styleInfo = useStyleInfo(backgroundMode);
  const route = useRoute();
  const pageScrollPosition = usePageScrollPosition();

  if (Platform.OS !== "ios") {
    return <AndroidAlternativeBlurredHeader {...props} />;
  }

  const scrollY =
    pageScrollPosition.getScrollYValueOf(route.key) ?? new Animated.Value(0);

  return (
    <AnimatedBlurView
      blurType={styleInfo.blurOnIOS.type}
      blurAmount={scrollY.interpolate({
        inputRange: [0, 35],
        outputRange: [0, styleInfo.blurOnIOS.amount],
        extrapolate: "clamp",
      })}
      reducedTransparencyFallbackColor={
        styleInfo.blurOnIOS.reducedTransparencyFallbackColor
      }
    >
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: styleInfo.background,
          opacity: scrollY.interpolate({
            inputRange: [0, 35],
            outputRange: [1, styleInfo.blurOnIOS.minOpacity],
            extrapolate: "clamp",
          }),
        }}
      />
      <Header {...restProps} />
    </AnimatedBlurView>
  );
};

const AndroidAlternativeBlurredHeader: FunctionComponent<
  StackHeaderProps & {
    backgroundMode: HeaderBackgroundMode;
  }
> = (props) => {
  const { backgroundMode, ...restProps } = props;

  const styleInfo = useStyleInfo(backgroundMode);

  return (
    <View>
      <View
        style={StyleSheet.flatten([
          {
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: styleInfo.background,
            borderBottomWidth: styleInfo.bottomBorderOnAndroid.width,
            borderColor: styleInfo.bottomBorderOnAndroid.color,
          },
        ])}
      />
      <Header {...restProps} />
    </View>
  );
};

const TransparentHeader: FunctionComponent<StackHeaderProps> = (props) => {
  const { ...restProps } = props;

  return (
    <View style={{ paddingVertical: 6 }}>
      <View
        style={StyleSheet.flatten([
          {
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(255,255,255,0)",
            borderWidth: 0,
          },
        ])}
      />
      <Header {...restProps} />
    </View>
  );
};

const BlurHeader: FunctionComponent<StackHeaderProps> = (props) => {
  const { ...restProps } = props;
  const style = useStyle();

  return (
    <BlurBackground
      backgroundBlur={true}
      borderRadius={0}
      blurIntensity={40}
      blurType="dark"
      containerStyle={
        style.flatten([
          "padding-y-8",
          "background-color-indigo-900@60%",
        ]) as ViewStyle
      }
    >
      <Header {...restProps} />
    </BlurBackground>
  );
};
