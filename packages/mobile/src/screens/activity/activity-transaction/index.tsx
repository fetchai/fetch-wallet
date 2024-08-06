import React, { FunctionComponent, useEffect, useState } from "react";
import {
  View,
  Text,
  ViewStyle,
  FlatList,
  ActivityIndicator,
} from "react-native";
import moment from "moment";
import { useStore } from "stores/index";
import { useStyle } from "styles/index";
import { CardDivider } from "components/card";
import { FilterItem } from "screens/activity";
import { ActivityRow } from "./activity-row";
import { observer } from "mobx-react-lite";
import { NoActivityView } from "screens/activity/activity-transaction/no-activity-view";
import { isFeatureAvailable } from "utils/index";
import { ActivityFilterView } from "../filter/activity-filter";
import { txOptions } from "screens/activity/utils";

const processFilters = (filters: FilterItem[]) => {
  let result: any[] = [];
  filters
    .filter((filter) => filter.isSelected)
    .map((data) => {
      result = result.concat(data.value.split(","));
    });
  return result;
};

export const ActivityNativeTab: FunctionComponent<{
  isOpenModal: boolean;
  setIsOpenModal: any;
}> = observer(({ isOpenModal, setIsOpenModal }) => {
  const style = useStyle();
  const { chainStore, accountStore, activityStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);

  const [_date, setDate] = useState("");
  const [activities, setActivities] = useState<unknown[]>([]);

  const [filters, setFilters] = useState<FilterItem[]>(txOptions);
  const [isLoading, setIsLoading] = useState(true);

  const accountOrChainChanged =
    activityStore.getAddress !== accountInfo.bech32Address ||
    activityStore.getChainId !== current.chainId;

  useEffect(() => {
    // this is required because accountInit sets the nodes on reload, so we wait for accountInit to set the node and then setActivities
    // else activityStore.getNodes will be empty
    setIsLoading(true);
    const timeout = setTimeout(() => {
      setActivities(activityStore.sortedNodes);
    }, 3000);
    setIsLoading(false);

    return () => {
      clearTimeout(timeout);
    };
  }, [activityStore.sortedNodes]);

  useEffect(() => {
    setFilters(txOptions);
  }, [accountOrChainChanged]);

  useEffect(() => {
    setIsLoading(true);
    if (activityStore.checkIsNodeUpdated) {
      setActivities(activityStore.sortedNodes);
      activityStore.setIsNodeUpdated(false);
      setIsLoading(false);
    }
  }, [activityStore.checkIsNodeUpdated]);

  useEffect(() => {
    if (accountOrChainChanged) {
      activityStore.setAddress(accountInfo.bech32Address);
      activityStore.setChainId(current.chainId);
    }

    //accountInit is required because in case of a reload, this.nodes becomes empty and should be updated with KVstore's saved nodes
    if (accountInfo.bech32Address !== "") {
      activityStore.accountInit();
    }
  }, [
    accountInfo.bech32Address,
    accountOrChainChanged,
    activityStore,
    current.chainId,
  ]);

  const handleFilterChange = (selectedFilters: FilterItem[]) => {
    setFilters(selectedFilters);
    setIsOpenModal(false);
  };

  const renderList = (nodes: [s: string] | unknown[]) => {
    return (
      <FlatList
        data={nodes}
        scrollEnabled={false}
        renderItem={({ item, index }: { item: any; index: number }) => {
          const isLastPos = index == nodes.length - 1;
          const currentDate = moment(item.block.timestamp).format(
            "MMMM DD, YYYY"
          );
          const previousNode: any = index > 0 ? nodes[index - 1] : null;
          const previousDate = previousNode
            ? moment(previousNode.block.timestamp).format("MMMM DD, YYYY")
            : null;
          const shouldDisplayDate = currentDate !== previousDate;

          return (
            <React.Fragment key={index}>
              {!shouldDisplayDate && (
                <View style={style.flatten(["height-1"]) as ViewStyle} />
              )}
              {shouldDisplayDate && (
                <Text
                  style={
                    style.flatten([
                      "color-gray-300",
                      "margin-left-16",
                      "body3",
                      "margin-bottom-12",
                    ]) as ViewStyle
                  }
                >
                  {currentDate}
                </Text>
              )}
              <ActivityRow setDate={setDate} node={item} />
              {isLastPos && (
                <View style={style.get("height-page-pad") as ViewStyle} />
              )}
            </React.Fragment>
          );
        }}
        keyExtractor={(_item, index) => index.toString()}
        ItemSeparatorComponent={() => (
          <CardDivider style={style.flatten(["margin-y-16"]) as ViewStyle} />
        )}
      />
    );
  };

  const data = activities.filter((node: any) =>
    processFilters(filters).includes(node.transaction.messages.nodes[0].typeUrl)
  );

  return (
    <React.Fragment>
      {isFeatureAvailable(current.chainId) &&
      data.length > 0 &&
      activities.length > 0 ? (
        renderList(data)
      ) : activities.length == 0 && isLoading ? (
        <ActivityIndicator
          size="large"
          color={style.get("color-white").color}
        />
      ) : (
        <NoActivityView />
      )}
      <ActivityFilterView
        isOpen={isOpenModal}
        filters={filters}
        handleFilterChange={handleFilterChange}
        close={() => setIsOpenModal(false)}
        activityFilterOptions={txOptions}
      />
    </React.Fragment>
  );
});
