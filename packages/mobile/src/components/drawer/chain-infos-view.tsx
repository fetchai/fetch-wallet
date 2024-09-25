import React, { FunctionComponent } from "react";
import { Text, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { BlurBackground } from "components/new/blur-background/blur-background";
import { RectButton } from "components/rect-button";
import FastImage from "react-native-fast-image";
import { VectorCharacter } from "components/vector-character";
import { titleCase } from "utils/format/format";
import { CheckIcon } from "components/new/icon/check";
import { ChainInfoWithCoreTypes } from "@keplr-wallet/background";
import { ChainInfoInner } from "@keplr-wallet/stores";
import { useStore } from "stores/index";

interface ChainInfosViewProps {
  chainInfos: ChainInfoInner<ChainInfoWithCoreTypes>[];
  onPress: (chainInfo: ChainInfoInner<ChainInfoWithCoreTypes>) => void;
}
export const ChainInfosView: FunctionComponent<ChainInfosViewProps> = ({
  chainInfos,
  onPress,
}) => {
  const style = useStyle();
  const { chainStore } = useStore();

  function tokenIcon(chainInfo: ChainInfoInner<ChainInfoWithCoreTypes>) {
    if (
      chainInfo.raw.chainSymbolImageUrl &&
      chainInfo.raw.chainSymbolImageUrl.startsWith("http")
    ) {
      return (
        <FastImage
          style={{
            width: 22,
            height: 22,
          }}
          resizeMode={FastImage.resizeMode.contain}
          source={{
            uri: chainInfo.raw.chainSymbolImageUrl,
          }}
        />
      );
    }
    // else if (
    //   chainInfo.raw.chainSymbolImageUrl &&
    //   chainInfo.raw.chainSymbolImageUrl.endsWith("png")
    // ) {
    //   return (
    //     <Image
    //       style={{
    //         width: 22,
    //         height: 22,
    //       }}
    //       source={require(chainInfo.raw.chainSymbolImageUrl)}
    //     />
    //   );
    // }
    else {
      return (
        <VectorCharacter
          char={chainInfo.chainName[0]}
          color="white"
          height={12}
        />
      );
    }
  }

  return (
    <React.Fragment>
      {chainInfos.map((chainInfo) => {
        const selected = chainStore.current.chainId === chainInfo.chainId;

        return (
          <BlurBackground
            key={chainInfo.chainId}
            borderRadius={12}
            blurIntensity={15}
            containerStyle={style.flatten(["margin-y-2"]) as ViewStyle}
          >
            <RectButton
              onPress={() => onPress(chainInfo)}
              style={
                style.flatten(
                  [
                    "flex-row",
                    "height-62",
                    "items-center",
                    "padding-x-12",
                    "justify-between",
                  ],
                  [selected && "background-color-indigo", "border-radius-12"]
                ) as ViewStyle
              }
              activeOpacity={0.5}
              underlayColor={
                style.flatten(["color-gray-50", "dark:color-platinum-500"])
                  .color
              }
            >
              <View
                style={style.flatten(["flex-row", "items-center"]) as ViewStyle}
              >
                <BlurBackground
                  backgroundBlur={true}
                  containerStyle={
                    style.flatten([
                      "width-32",
                      "height-32",
                      "border-radius-64",
                      "items-center",
                      "justify-center",
                      "margin-right-12",
                    ]) as ViewStyle
                  }
                >
                  {tokenIcon(chainInfo)}
                </BlurBackground>
                <Text
                  style={
                    style.flatten(["subtitle3", "color-white"]) as ViewStyle
                  }
                >
                  {titleCase(chainInfo.chainName)}
                </Text>
              </View>
              {selected && <CheckIcon />}
            </RectButton>
          </BlurBackground>
        );
      })}
    </React.Fragment>
  );
};
