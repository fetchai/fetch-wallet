import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
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
import { activityFilterOptions, ActivityFilterView } from "./activity-filter";
import { ActivityRow } from "./activity-row";
import { observer } from "mobx-react-lite";
import { NoActivityView } from "screens/activity/activity-transaction/no-activity-view";
import { CHAIN_ID_FETCHHUB, CHAIN_ID_DORADO } from "../../../config";

const processFilters = (filters: string[]) => {
  let result: any[] = [];
  filters.map((value) => {
    result = result.concat(value.split(","));
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

  const [filters, setFilters] = useState<FilterItem[]>(activityFilterOptions);
  const [isLoading, setIsLoading] = useState(true);

  const filter = useCallback(
    () =>
      filters
        .filter((filter) => filter.isSelected)
        .map((option) => option.value),
    [filters]
  )();

  const accountOrChainChanged =
    activityStore.getAddress !== accountInfo.bech32Address ||
    activityStore.getChainId !== current.chainId;

  useEffect(() => {
    // this is required because accountInit sets the nodes on reload, so we wait for accountInit to set the node and then setActivities
    // else activityStore.getNodes will be empty
    setIsLoading(true);
    const timeout = setTimeout(() => {
      setActivities(activityStore.sortedNodes);
    }, 100);
    setIsLoading(false);

    return () => {
      clearTimeout(timeout);
    };
  }, [activityStore.sortedNodes]);

  useEffect(() => {
    setFilters(activityFilterOptions);
  }, [accountOrChainChanged]);

  useEffect(() => {
    setIsLoading(true);
    if (activityStore.checkIsNodeUpdated) {
      setActivities(activityStore.sortedNodes);
      activityStore.setIsNodeUpdated(false);
      setIsLoading(false);
    }
  }, [activityStore, activityStore.checkIsNodeUpdated]);

  useEffect(() => {
    if (accountOrChainChanged) {
      activityStore.setAddress(accountInfo.bech32Address);
      activityStore.setChainId(current.chainId);
    }
    //accountInit is required because in case of a reload, this.nodes becomes empty and should be updated with KVstore's saved nodes
    activityStore.accountInit();
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
    processFilters(filter).includes(node.transaction.messages.nodes[0].typeUrl)
  );

  return (
    <React.Fragment>
      {(current.chainId === CHAIN_ID_FETCHHUB ||
        current.chainId === CHAIN_ID_DORADO) &&
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
      />
    </React.Fragment>
  );
});
