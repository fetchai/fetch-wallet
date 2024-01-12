import React, { FunctionComponent, useEffect, useState } from "react";
import { PageWithView } from "components/page";
import { useStyle } from "styles/index";
import { Image, Text, View, ViewStyle } from "react-native";
import { Button } from "components/button";
import { useSmartNavigation } from "../../../navigation";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/index";
import { Toggle } from "components/toggle";
import delay from "delay";
import { ColorRightArrow } from "components/icon/color-rightt-arrow";
import { LinearGradientText } from "components/svg/linear-gradient-text";

export const RegisterEndScreen: FunctionComponent = observer(() => {
  const { keychainStore, keyRingStore } = useStore();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          password?: string;
        }
      >,
      string
    >
  >();

  const password = route.params?.password;

  const [isBiometricOn, setIsBiometricOn] = useState(false);

  useEffect(() => {
    if (password && keychainStore.isBiometrySupported) {
      setIsBiometricOn(true);
    }
  }, [keychainStore.isBiometrySupported, password]);

  const [isLoading, setIsLoading] = useState(false);

  return (
    <PageWithView
      backgroundMode="image"
      backgroundBlur={true}
      style={style.flatten(["padding-x-20"]) as ViewStyle}
    >
      <View style={style.get("flex-8")} />
      <View style={style.flatten(["items-center"])}>
        {style.theme === "dark" ? (
          <Image
            style={{ width: 400, height: 260, marginRight: -80 }}
            source={require("assets/image/wallet-connection.png")}
            fadeDuration={0}
            resizeMode="stretch"
          />
        ) : (
          <Image
            style={{ width: 400, height: 260, marginRight: -80 }}
            source={require("assets/image/all-set.png")}
            fadeDuration={0}
            resizeMode="contain"
          />
        )}
        <LinearGradientText
          text="You’re all set!"
          color1="#CF447B"
          color2="#F9774B"
        />
        {/* <Text style={style.flatten(["h1", "color-text-middle", "color-linear"]) as ViewStyle}>
          You’re all set!
        </Text> */}
        <Text
          style={
            style.flatten([
              "h4",
              "color-text-low",
              "text-center",
              "margin-top-10",
            ]) as ViewStyle
          }
        >
          Your Fetch journey now begins.
        </Text>
      </View>
      {password && keychainStore.isBiometrySupported ? (
        <View
          style={
            style.flatten([
              "flex-row",
              "margin-top-58",
              "items-center",
            ]) as ViewStyle
          }
        >
          <Text style={style.flatten(["subtitle1", "color-text-middle"])}>
            Enable Biometric
          </Text>
          <View style={style.get("flex-1")} />
          <Toggle
            on={isBiometricOn}
            onChange={(value) => setIsBiometricOn(value)}
          />
        </View>
      ) : null}
      <View style={style.get("flex-8")} />
      <Button
        containerStyle={
          style.flatten([
            "margin-top-44",
            "margin-bottom-20",
            "background-color-white",
            "border-radius-32",
          ]) as ViewStyle
        }
        textStyle={{
          color: "#0B1742",
        }}
        rightIcon={
          <View style={style.flatten(["margin-left-10"]) as ViewStyle}>
            <ColorRightArrow />
          </View>
        }
        size="large"
        text="Continue"
        loading={isLoading}
        onPress={async () => {
          setIsLoading(true);
          try {
            // Because javascript is synchronous language, the loadnig state change would not delivered to the UI thread
            // So to make sure that the loading state changes, just wait very short time.
            await delay(10);

            if (password && isBiometricOn) {
              await keychainStore.turnOnBiometry(password);
            }

            // Definetly, the last key is newest keyring.
            if (keyRingStore.multiKeyStoreInfo.length > 0) {
              await keyRingStore.changeKeyRing(
                keyRingStore.multiKeyStoreInfo.length - 1
              );
            }

            smartNavigation.reset({
              index: 0,
              routes: [
                {
                  name: "MainTabDrawer",
                },
              ],
            });
          } catch (e) {
            console.log(e);
            setIsLoading(false);
          }
        }}
      />
    </PageWithView>
  );
});