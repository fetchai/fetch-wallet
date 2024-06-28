import React, { FunctionComponent } from "react";
import { Platform, Text, View, ViewStyle } from "react-native";
import { IconWithText } from "components/new/icon-with-text/icon-with-text";
import { useStyle } from "styles/index";
import { RowFrame } from "components/new/icon/row-frame";
import { PageWithViewInBottomTabView } from "components/page";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const ActivityComingSoonView: FunctionComponent = () => {
  const style = useStyle();
  const safeAreaInsets = useSafeAreaInsets();
  return (
    <PageWithViewInBottomTabView
      backgroundMode={"image"}
      isTransparentHeader={true}
      style={{
        paddingTop: Platform.OS === "ios" ? safeAreaInsets.top + 10 : 48,
        flexGrow: 1,
      }}
    >
      <View style={style.flatten(["flex-1", "justify-center"]) as ViewStyle}>
        <IconWithText
          title={"Activity"}
          subtitle={"This feature will be available\nin the next releases"}
          icon={<RowFrame />}
          isComingSoon={true}
          titleStyle={style.flatten(["h3", "font-normal"]) as ViewStyle}
        >
          <Text
            style={
              style.flatten([
                "body2",
                "color-gray-200",
                "padding-y-8",
                "text-center",
                "font-medium",
              ]) as ViewStyle
            }
          >
            {"You can use this feature in your\nbrowser extension."}
          </Text>
        </IconWithText>
      </View>
    </PageWithViewInBottomTabView>
  );
};
