import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { PageWithScrollViewInBottomTabView } from "components/page";
import { observer } from "mobx-react-lite";
import { PortfolioStakingCard } from "components/new/staking/portfolio-staking-card";
import { ScrollView, Text, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";

import { NativeTokensSection } from "screens/portfolio/native-tokens-section";
import { TokensSection } from "screens/portfolio/tokens-section";
import { TabBarView } from "components/new/tab-bar/tab-bar";
import { useStore } from "stores/index";
import { RowFrame } from "components/new/icon/row-frame";
import { EmptyView } from "components/new/empty";

enum AssetsSectionEnum {
  Tokens = "Tokens",
  Stats = "Stats",
}

export const PortfolioScreen: FunctionComponent = observer(() => {
  const style = useStyle();
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [selectedId, setSelectedId] = useState(AssetsSectionEnum.Tokens);
  const { analyticsStore, chainStore } = useStore();
  const isEvm = chainStore.current.features?.includes("evm") ?? false;

  useEffect(() => {
    analyticsStore.logEvent(`${selectedId.toLowerCase()}_tab_click`, {
      pageName: "Portfolio",
    });
  }, [analyticsStore, selectedId]);

  return (
    <PageWithScrollViewInBottomTabView
      backgroundMode={"image"}
      style={style.flatten(["padding-x-page", "overflow-scroll"]) as ViewStyle}
      contentContainerStyle={style.get("flex-grow-1")}
      ref={scrollViewRef}
    >
      <Text
        style={
          style.flatten([
            "h1",
            "color-white",
            "margin-y-10",
            "font-normal",
          ]) as ViewStyle
        }
      >
        Portfolio
      </Text>
      <TabBarView
        listItem={AssetsSectionEnum}
        selected={selectedId}
        setSelected={setSelectedId}
      />
      {selectedId === AssetsSectionEnum.Tokens && (
        <View style={style.flatten(["margin-y-10"]) as ViewStyle}>
          <NativeTokensSection />
          <TokensSection />
        </View>
      )}
      {selectedId === AssetsSectionEnum.Stats &&
        (isEvm ? (
          <EmptyView
            icon={<RowFrame />}
            text="Feature not available on this network"
            textStyle={style.flatten(["h3"]) as ViewStyle}
            containerStyle={style.flatten(["flex-1"])}
          />
        ) : (
          <View style={style.flatten(["margin-y-14"]) as ViewStyle}>
            <PortfolioStakingCard />
          </View>
        ))}
    </PageWithScrollViewInBottomTabView>
  );
});
