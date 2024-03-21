import { HeaderLayout } from "@layouts-v2/header-layout";
import React, { FunctionComponent } from "react";
import { useStore } from "../../stores";
import style from "./style.module.scss";
import { CHAINS } from "../../config.axl-brdige.var";
import { Card } from "@components-v2/card";
import { useNavigate } from "react-router";

export const MorePageV2: FunctionComponent = () => {
  const { chainStore } = useStore();
  const navigate = useNavigate();
  const isAxlViewVisible = CHAINS.some((chain) => {
    return chain.chainId?.toString() === chainStore.current.chainId;
  });
  const isEvm = chainStore.current.features?.includes("evm") ?? false;
  return (
    <HeaderLayout showChainName={true} canChangeChainInfo={true}>
      <div className={style["title"]}>More</div>
      <div className={style["subTitle"]}>Account</div>
      <Card
        leftImageStyle={{ background: "transparent" }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "5px" }}
        leftImage={require("@assets/svg/wireframe/currency.svg")}
        heading={"Currency"}
        onClick={() => navigate("/more/currency")}
      />
      <Card
        leftImageStyle={{ background: "transparent" }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "5px" }}
        leftImage={require("@assets/svg/wireframe/manage-tokens.svg")}
        heading={"Manage Tokens"}
        onClick={() => navigate("/more/token/manage")}
      />
      <Card
        leftImageStyle={{ background: "transparent", height: "18px" }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "5px" }}
        leftImage={require("@assets/svg/wireframe/at.svg")}
        heading={"Address Book"}
        onClick={() => navigate("/more/address-book")}
      />
      <Card
        leftImageStyle={{ background: "transparent" }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "5px" }}
        leftImage={require("@assets/svg/wireframe/language.svg")}
        heading={"Language"}
        onClick={() => navigate("/more/language")}
      />
      <Card
        leftImageStyle={{ background: "transparent" }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "5px" }}
        leftImage={require("@assets/svg/wireframe/notification.svg")}
        heading={"Notifications"}
        onClick={() => navigate("/more/notifications")}
      />
      <Card
        leftImageStyle={{ background: "transparent" }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "5px" }}
        leftImage={require("@assets/svg/wireframe/security.svg")}
        heading={"Security & privacy"}
        onClick={() => navigate("/more/security-privacy")}
      />

      <div className={style["subTitle"]}>Others</div>
      <Card
        leftImageStyle={{ background: "transparent" }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "5px" }}
        leftImage={require("@assets/svg/wireframe/guide.svg")}
        heading={"Guide"}
        onClick={() =>
          window.open(
            "https://fetch.ai/docs/guides/fetch-network/fetch-wallet/fetch-wallet-getting-started",
            "_blank"
          )
        }
      />
      {(chainStore.current.chainId === "fetchhub-4" ||
        chainStore.current.chainId === "dorado-1") && (
        <Card
          leftImageStyle={{ background: "transparent" }}
          style={{ background: "rgba(255,255,255,0.1)", marginBottom: "5px" }}
          leftImage={require("@assets/svg/wireframe/fns.svg")}
          heading={".FET Domains"}
          onClick={() => navigate("/fetch-name-service/explore")}
        />
      )}
      {isAxlViewVisible && (
        <Card
          leftImageStyle={{ background: "transparent" }}
          style={{ background: "rgba(255,255,255,0.1)", marginBottom: "5px" }}
          leftImage={require("@assets/svg/wireframe/axl-bridge.svg")}
          heading={"Axelar Bridge"}
          onClick={() =>
            isEvm ? navigate("/axl-bridge-evm") : navigate("/axl-bridge-cosmos")
          }
        />
      )}
      <Card
        leftImageStyle={{ background: "transparent" }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "5px" }}
        leftImage={require("@assets/svg/wireframe/wallet-version.svg")}
        heading={"Fetch Wallet version"}
        onClick={() => navigate("")}
      />
    </HeaderLayout>
  );
};
