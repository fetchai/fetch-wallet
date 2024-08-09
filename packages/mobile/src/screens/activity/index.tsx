import React, { ReactElement, useState } from "react";
import { PageWithViewInBottomTabView } from "components/page";
import { Platform, ScrollView, Text, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChipButton } from "components/new/chip";
import { FilterIcon } from "components/new/icon/filter-icon";
import { ChatSection } from "screens/inbox/chat-section";
import { ActivityNativeTab } from "screens/activity/activity-transaction";
import { useStore } from "stores/index";
import { observer } from "mobx-react-lite";
import { isFeatureAvailable } from "utils/index";

export interface FilterItem {
  icon: ReactElement;
  isSelected: boolean;
  title: string;
  value: string;
}

enum ActivityEnum {
  Transactions = "Transactions",
  GovProposals = "Gov Proposals",
}

export const ActivityScreen = observer(() => {
  const style = useStyle();
  const [selectedId, _setSelectedId] = useState(ActivityEnum.Transactions);
  const safeAreaInsets = useSafeAreaInsets();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const { analyticsStore, chainStore } = useStore();

  return (
    <PageWithViewInBottomTabView
      backgroundMode={"image"}
      isTransparentHeader={true}
      style={{
        paddingTop: Platform.OS === "ios" ? safeAreaInsets.top + 10 : 48,
        flexGrow: 1,
      }}
    >
      {isFeatureAvailable(chainStore.current.chainId) && (
        <View
          style={style.flatten(["items-end", "margin-x-page"]) as ViewStyle}
        >
          <ChipButton
            text="Filter"
            icon={<FilterIcon />}
            iconStyle={style.get("padding-top-2") as ViewStyle}
            containerStyle={
              style.flatten([
                "border-width-1",
                "border-color-gray-300",
                "width-90",
              ]) as ViewStyle
            }
            backgroundBlur={false}
            onPress={() => {
              setIsOpenModal(true);
              analyticsStore.logEvent("filter_click", {
                tabName: "Transactions",
                pageName: "Activity",
              });
            }}
          />
        </View>
      )}
      <Text
        style={
          style.flatten([
            "h1",
            "color-white",
            "margin-x-18",
            "margin-y-16",
            "font-normal",
          ]) as ViewStyle
        }
      >
        Activity
      </Text>
      {/*<TabBarView*/}
      {/*  listItem={ActivityEnum}*/}
      {/*  selected={selectedId}*/}
      {/*  setSelected={setSelectedId}*/}
      {/*  containerStyle={style.flatten(["margin-x-20"]) as ViewStyle}*/}
      {/*/>*/}
      <ScrollView
        indicatorStyle={"white"}
        contentContainerStyle={
          style.flatten(["margin-y-16", "flex-grow-1"]) as ViewStyle
        }
      >
        {selectedId === ActivityEnum.Transactions && (
          <View
            style={
              style.flatten(["height-full", "justify-center"]) as ViewStyle
            }
          >
            <ActivityNativeTab
              isOpenModal={isOpenModal}
              setIsOpenModal={setIsOpenModal}
            />
          </View>
        )}
        {selectedId === ActivityEnum.GovProposals && <ChatSection />}
      </ScrollView>
    </PageWithViewInBottomTabView>
  );
});
