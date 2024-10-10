import { HeaderLayout } from "@layouts-v2/header-layout";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import style from "./style.module.scss";
import { TabsPanel } from "@components-v2/tabs/tabsPanel-2";
import { TokensView } from "../main/tokens";
import { Stats } from "./stats";
import { useStore } from "../../stores";
import { isFeatureAvailable } from "@utils/index";

export const Portfolio = () => {
  const navigate = useNavigate();
  const [isClaimRewardsOpen, setIsClaimRewardsOpen] = useState(false);

  const { chainStore } = useStore();
  const tabs = [
    { id: "Tokens", component: <TokensView /> },
    {
      id: "Stats",
      disabled: !isFeatureAvailable(chainStore.current.chainId),
      component: (
        <Stats
          isClaimRewardsOpen={isClaimRewardsOpen}
          setIsClaimRewardsOpen={setIsClaimRewardsOpen}
        />
      ),
    },
  ];
  return (
    <HeaderLayout
      showBottomMenu={true}
      showTopMenu={true}
      onBackButton={() => navigate("/")}
    >
      <div className={style["title"]}>Portfolio</div>
      <TabsPanel tabHeight="330px" tabs={tabs} />
    </HeaderLayout>
  );
};
