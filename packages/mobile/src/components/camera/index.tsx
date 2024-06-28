import React, { FunctionComponent } from "react";
import { Camera, CameraProps } from "expo-camera";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useStyle } from "styles/index";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Svg, { G, Path, Rect } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingSpinner } from "components/spinner";
import { IconButton } from "components/new/button/icon";
import { XmarkIcon } from "components/new/icon/xmark";

interface CameraProp extends CameraProps {
  containerBottom?: React.ReactElement;
  isLoading?: boolean;
}

export const FullScreenCameraView: FunctionComponent<CameraProp> = (props) => {
  const style = useStyle();

  const navigation = useNavigation();

  const isFocused = useIsFocused();

  const { children, containerBottom, isLoading, ...rest } = props;

  return (
    <React.Fragment>
      {isFocused ? (
        <Camera
          style={StyleSheet.flatten([style.flatten(["absolute-fill"])])}
          {...rest}
        />
      ) : null}
      <SafeAreaView style={style.flatten(["absolute-fill", "items-center"])}>
        <View
          style={
            style.flatten([
              "flex-row",
              "margin-top-10",
              "margin-x-16",
              "items-center",
            ]) as ViewStyle
          }
        >
          <View style={style.get("flex-1")} />
          <Text
            style={
              style.flatten([
                "justify-center",
                "color-white",
                "subtitle2",
                "margin-left-32",
              ]) as ViewStyle
            }
          >
            Scan QR Code
          </Text>
          <View style={style.get("flex-1")} />
          {navigation.canGoBack() ? (
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
            >
              <IconButton
                icon={<XmarkIcon color={"white"} />}
                backgroundBlur={false}
                blurIntensity={20}
                borderRadius={50}
                iconStyle={
                  style.flatten([
                    "width-32",
                    "height-32",
                    "items-center",
                    "justify-center",
                    "border-width-1",
                    "border-color-white@20%",
                  ]) as ViewStyle
                }
              />
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={style.get("flex-2")} />
        <View style={style.get("flex-6")}>
          <Svg width="250" height="220" viewBox="0 0 277 277" fill="none">
            <G clipPath="url(#clip0_2489_3885)">
              <Path
                d="M0.5 19.5V8.5C0.5 4.08172 4.08172 0.5 8.5 0.5H21.5"
                stroke="white"
                strokeWidth="3"
              />
              <Path
                d="M275 19.5V8.5C275 4.08172 271.418 0.5 267 0.5H254"
                stroke="white"
                strokeWidth="3"
              />
              <Path
                d="M0.5 256V267C0.5 271.418 4.08172 275 8.5 275H21.5"
                stroke="white"
                strokeWidth="3"
              />
              <Path
                d="M275 256V267C275 271.418 271.418 275 267 275H254"
                stroke="white"
                strokeWidth="3"
              />
            </G>
            <Rect
              x="0.8"
              y="0.8"
              width="275"
              height="273"
              rx="8"
              stroke="white"
            />
          </Svg>
          <Text
            style={
              style.flatten([
                "text-caption2",
                "color-white",
                "margin-top-24",
                "text-center",
              ]) as ViewStyle
            }
          >
            {
              "Send assets or connect to Fetch Wallet\nbrowser extension by scanning a QR code"
            }
          </Text>
          {isLoading ? (
            <View
              style={style.flatten([
                "absolute-fill",
                "items-center",
                "justify-center",
              ])}
            >
              <View
                style={
                  style.flatten([
                    "padding-x-32",
                    "padding-top-48",
                    "padding-bottom-31",
                    "background-color-card",
                    "border-radius-8",
                    "items-center",
                  ]) as ViewStyle
                }
              >
                <LoadingSpinner
                  size={42}
                  color={style.flatten(["color-indigo-900"]).color}
                />
                <Text
                  style={
                    style.flatten([
                      "subtitle1",
                      "color-indigo-900",
                      "margin-top-34",
                    ]) as ViewStyle
                  }
                >
                  Loading...
                </Text>
              </View>
            </View>
          ) : null}
        </View>
        {containerBottom}
        <View style={style.get("flex-1")} />
      </SafeAreaView>
      {children}
    </React.Fragment>
  );
};
