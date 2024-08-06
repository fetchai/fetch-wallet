import React, { FunctionComponent, useEffect, useState } from "react";
import { View, ViewStyle, FlatList, ActivityIndicator } from "react-native";
import { useStore } from "stores/index";
import { useStyle } from "styles/index";
import { CardDivider } from "components/card";
import { FilterItem } from "screens/activity";
import { observer } from "mobx-react-lite";
import { NoActivityView } from "screens/activity/activity-transaction/no-activity-view";
import { isFeatureAvailable } from "utils/index";
import { ActivityFilterView } from "../filter/activity-filter";
import { GovActivityRow } from "screens/activity/gov-proposals/activity-row";
import { fetchGovProposalTransactions } from "src/graphQL/activity-api";
import { govOptions } from "screens/activity/utils";

const processFilters = (filters: FilterItem[]) => {
  let result: any[] = [];
  filters
    .filter((filter) => filter.isSelected)
    .map((data) => {
      result = result.concat(data.value.split(","));
    });
  return result;
};

export const GovProposalsTab: FunctionComponent<{
  isOpenModal: boolean;
  setIsOpenModal: any;
  latestBlock: any;
}> = observer(({ isOpenModal, setIsOpenModal, latestBlock }) => {
  const style = useStyle();
  const { chainStore, accountStore, activityStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);

  const [filters, setFilters] = useState<FilterItem[]>(govOptions);
  const [isLoading, setIsLoading] = useState(true);

  const [nodes, setNodes] = useState<any>({});
  const [pageInfo, setPageInfo] = useState<any>();

  const accountOrChainChanged =
    activityStore.getAddress !== accountInfo.bech32Address ||
    activityStore.getChainId !== current.chainId;

  const fetchNodes = async (cursor: any) => {
    setIsLoading(true);
    try {
      const fetchedData = await fetchGovProposalTransactions(
        current.chainId,
        cursor,
        accountInfo.bech32Address,
        filters.map((option) => option.value)
      );
      if (fetchedData) {
        const nodeMap: any = {};
        fetchedData.nodes.map((node: any) => {
          nodeMap[node.id] = node;
        });

        setPageInfo(fetchedData.pageInfo);
        setNodes({ ...nodes, ...nodeMap });
      }
    } catch (error) {
      console.log("Error:", error);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchNodes("");
  }, []);

  useEffect(() => {
    fetchNodes("");
  }, [filters, latestBlock]);

  useEffect(() => {
    setFilters(govOptions);
  }, [accountOrChainChanged]);

  const handleFilterChange = (selectedFilters: FilterItem[]) => {
    setFilters(selectedFilters);
    fetchNodes(pageInfo.endCursor);
    setIsOpenModal(false);
  };

  const renderList = (nodes: [s: string] | unknown[]) => {
    return (
      <FlatList
        data={nodes}
        scrollEnabled={false}
        renderItem={({ item, index }: { item: any; index: number }) => {
          const isLastPos = index == nodes.length - 1;
          return (
            <React.Fragment key={index}>
              <GovActivityRow node={item} />
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

  const data = Object.values(nodes).filter((node: any) =>
    processFilters(filters).includes(node.option)
  );

  return (
    <React.Fragment>
      {isFeatureAvailable(current.chainId) &&
      data.length > 0 &&
      Object.values(nodes).length > 0 ? (
        renderList(data)
      ) : Object.values(nodes).length == 0 && isLoading ? (
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
        activityFilterOptions={govOptions}
      />
    </React.Fragment>
  );
});
