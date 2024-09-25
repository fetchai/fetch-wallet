import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/index";
import {
  Platform,
  StyleSheet,
  Switch,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { useStyle } from "styles/index";
import FastImage from "react-native-fast-image";
import { VectorCharacter } from "components/vector-character";
import { BlurBackground } from "components/new/blur-background/blur-background";
import { PageWithScrollView } from "components/page";
import { SearchIcon } from "components/new/icon/search-icon";
import { EmptyView } from "components/new/empty";
import { titleCase } from "utils/format/format";
import { InputCardView } from "components/new/card-view/input-card";
import { TabBarView } from "components/new/tab-bar/tab-bar";
import { NetworkEnum } from "components/drawer";
import { ChainInfoInner } from "@keplr-wallet/stores";
import { ChainInfoWithCoreTypes } from "@keplr-wallet/background";
import { Button } from "components/button/button";
import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  StackActions,
  useNavigation,
  useRoute,
} from "@react-navigation/native";

export const SettingChainListScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          selectedTab?: NetworkEnum;
        }
      >,
      any
    >
  >();
  const { chainStore } = useStore();
  const style = useStyle();
  const selectedTab = route.params.selectedTab;
  const [selectedOnTab, setSelectedOnTab] = useState(selectedTab);
  const isTestnetEnabled = useCallback(() => {
    const testnetList = chainStore.chainInfosWithUIConfig.filter(
      (item) => item.chainInfo.isTestnet
    );
    const testnetDisabledList = testnetList.filter((item) => !item.disabled);
    return testnetList.length === testnetDisabledList.length;
  }, [chainStore.chainInfosWithUIConfig]);
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [isEnabled, setIsEnabled] = useState(isTestnetEnabled);
  const [search, setSearch] = useState("");
  const [filterChainInfos, setFilterChainInfos] = useState(
    chainStore.chainInfosWithUIConfig
  );

  const mainChainList = chainStore.chainInfosWithUIConfig.filter(
    (chain) =>
      !chain.chainInfo.beta && !chain.chainInfo.features?.includes("evm")
  );
  const evmChainList = chainStore.chainInfosWithUIConfig.filter((chain) =>
    chain.chainInfo.features?.includes("evm")
  );

  useEffect(() => {
    const searchTrim = search.trim().toLowerCase();
    const filteredChains =
      selectedOnTab == NetworkEnum.Cosmos
        ? mainChainList.filter((chain) =>
            chain.chainInfo.chainName.toLowerCase().includes(searchTrim)
          )
        : evmChainList.filter((chain) =>
            chain.chainInfo.chainName.toLowerCase().includes(searchTrim)
          );
    setFilterChainInfos(filteredChains);
  }, [chainStore.chainInfosWithUIConfig, search, selectedOnTab]);

  useEffect(() => {
    setIsEnabled(isTestnetEnabled);
  }, [isTestnetEnabled]);

  return (
    <PageWithScrollView
      backgroundMode="image"
      contentContainerStyle={
        [
          style.flatten(["flex-grow-1"]),
          {
            height: filterChainInfos.length === 0 ? "100%" : undefined,
          },
        ] as ViewStyle
      }
      style={style.flatten(["padding-x-page", "padding-y-page"]) as ViewStyle}
    >
      <TabBarView
        listItem={NetworkEnum}
        selected={selectedOnTab}
        setSelected={setSelectedOnTab}
        containerStyle={style.flatten(["margin-y-20"]) as ViewStyle}
      />
      <View
        style={
          style.flatten([
            "flex-row",
            "items-center",
            "justify-between",
            "margin-bottom-24",
          ]) as ViewStyle
        }
      >
        <Text
          style={StyleSheet.flatten([
            style.flatten([
              "body3",
              "color-platinum-100",
              "margin-right-18",
            ]) as ViewStyle,
          ])}
        >
          Show testnets
        </Text>
        <Switch
          trackColor={{
            false: "#767577",
            true: Platform.OS === "ios" ? "#ffffff00" : "#767577",
          }}
          thumbColor={isEnabled ? "#5F38FB" : "#D0BCFF66"}
          style={[
            {
              borderRadius: 16,
              borderWidth: 1,
              // transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
            },
            style.flatten(["border-color-pink-light@40%"]),
          ]}
          onValueChange={(isToggleOn) => {
            chainStore.toggleMultipleChainInfoInUI(
              chainStore.chainInfosWithUIConfig
                .filter((chainInfoUI) => {
                  return chainInfoUI.chainInfo.isTestnet;
                })
                .map((chainInfoUI) => chainInfoUI.chainInfo.chainId),
              isToggleOn
            );
            setIsEnabled(isToggleOn);
          }}
          value={isEnabled}
        />
      </View>
      <InputCardView
        placeholder="Search"
        placeholderTextColor={"white"}
        value={search}
        onChangeText={(text: string) => {
          setSearch(text);
        }}
        rightIcon={<SearchIcon size={12} />}
        containerStyle={style.flatten(["margin-bottom-24"]) as ViewStyle}
      />
      {filterChainInfos.length === 0 ? (
        <EmptyView />
      ) : (
        <SettingChainListScreenElement chainInfos={filterChainInfos} />
      )}
      {selectedTab === NetworkEnum.EVM && (
        <View style={style.flatten(["margin-y-24"]) as ViewStyle}>
          <Button
            text="Add custom network"
            size="default"
            mode="outline"
            textStyle={
              style.flatten(
                ["body3", "items-center"],
                ["color-white"]
              ) as ViewStyle
            }
            containerStyle={
              style.flatten(
                ["border-radius-32", "margin-left-6"],
                ["border-color-white@40%"]
              ) as ViewStyle
            }
            onPress={() => {
              navigation.dispatch(
                StackActions.push("ChainList", {
                  screen: "Setting.AddEvmChain",
                })
              );
            }}
          />
        </View>
      )}
      <View style={style.flatten(["height-page-double-pad"]) as ViewStyle} />
    </PageWithScrollView>
  );
});

export const SettingChainListScreenElement: FunctionComponent<{
  chainInfos: {
    chainInfo: ChainInfoInner<ChainInfoWithCoreTypes>;
    disabled: boolean;
  }[];
}> = observer(({ chainInfos }) => {
  const { chainStore } = useStore();
  const style = useStyle();
  return (
    <React.Fragment>
      {chainInfos.map((chain) => {
        const chainSymbolImageUrl = chain.chainInfo.raw.chainSymbolImageUrl;
        const chainName = chain.chainInfo.chainName;
        return (
          <BlurBackground
            key={chain.chainInfo.chainId}
            blurIntensity={15}
            borderRadius={12}
            containerStyle={
              style.flatten([
                "flex-row",
                "height-62",
                "items-center",
                "margin-y-2",
                "padding-x-12",
              ]) as ViewStyle
            }
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
              {chainSymbolImageUrl ? (
                <FastImage
                  style={{ width: 22, height: 22 }}
                  resizeMode={FastImage.resizeMode.contain}
                  source={{ uri: chainSymbolImageUrl }}
                />
              ) : (
                <VectorCharacter
                  char={chainName[0]}
                  color="white"
                  height={15}
                />
              )}
            </BlurBackground>

            <View style={style.flatten(["justify-center"]) as ViewStyle}>
              <Text
                style={style.flatten(["subtitle3", "color-white"]) as ViewStyle}
              >
                {titleCase(chain.chainInfo.chainName)}
              </Text>
            </View>
            <View style={style.get("flex-1")} />
            <Switch
              trackColor={{
                false: "#767577",
                true: Platform.OS === "ios" ? "#ffffff00" : "#767577",
              }}
              thumbColor={!chain.disabled ? "#5F38FB" : "#D0BCFF66"}
              style={[
                {
                  borderRadius: 16,
                  borderWidth: 1,
                },
                style.flatten(["border-color-pink-light@40%"]),
              ]}
              onValueChange={() => {
                chainStore.toggleChainInfoInUI(chain.chainInfo.chainId);
              }}
              value={!chain.disabled}
            />
          </BlurBackground>
        );
      })}
    </React.Fragment>
  );
});
