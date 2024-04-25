import React, { FunctionComponent } from "react";
import { Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { BlurBackground } from "components/new/blur-background/blur-background";
import { IconButton } from "components/new/button/icon";

export const DropDownCardView: FunctionComponent<{
  trailingIcon?: any;
  mainHeading?: string;
  heading?: string;
  subHeading?: string;
  headingrStyle?: ViewStyle;
  mainHeadingrStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  onPress?: () => void;
}> = ({
  trailingIcon,
  mainHeading,
  heading,
  subHeading,
  containerStyle,
  headingrStyle,
  mainHeadingrStyle,
  onPress,
}) => {
  const style = useStyle();

  return (
    <TouchableOpacity activeOpacity={0.6} onPress={onPress}>
      {mainHeading ? (
        <Text
          style={
            [
              style.flatten(["text-button3", "margin-y-8", "color-white@60%"]),
              mainHeadingrStyle,
            ] as ViewStyle
          }
        >
          {mainHeading}
        </Text>
      ) : null}
      <BlurBackground
        borderRadius={12}
        blurIntensity={16}
        containerStyle={
          [
            style.flatten([
              "flex-row",
              "padding-x-18",
              "padding-y-12",
              "items-center",
            ]),
            containerStyle,
          ] as ViewStyle
        }
      >
        <View style={style.flatten(["flex-3"]) as ViewStyle}>
          {heading ? (
            <Text
              style={[
                  style.flatten([
                  "body2",
                  "padding-bottom-2",
                  "color-white",
              ]) as ViewStyle,
                  headingrStyle,
              ]
              }
            >
              {heading}
            </Text>
          ) : null}
          {subHeading ? (
            <Text
              style={
                style.flatten([
                  "text-caption2",
                  "padding-top-2",
                  "color-gray-200",
                ]) as ViewStyle
              }
            >
              {subHeading}
            </Text>
          ) : null}
        </View>
        <IconButton backgroundBlur={false} icon={trailingIcon} />
      </BlurBackground>
    </TouchableOpacity>
  );
};
