import { HeaderLayout } from "@layouts-v2/header-layout";
import React, { useState, useEffect, FunctionComponent } from "react";
import { useStore } from "../../stores";
import style from "./style.module.scss";
// import { CHAINS } from "../../config.axl-brdige.var";
import { Card } from "@components-v2/card";
import { useNavigate } from "react-router";
import { SidePanelToggle } from "./side-panel";
import {
  GetSidePanelEnabledMsg,
  GetSidePanelIsSupportedMsg,
} from "@keplr-wallet/background";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
// import { CHAIN_ID_DORADO, CHAIN_ID_FETCHHUB } from "../../config.ui.var";

export const MorePage: FunctionComponent = () => {
  const [sidePanelSupported, setSidePanelSupported] = useState(false);
  const [sidePanelEnabled, setSidePanelEnabled] = useState(false);

  const { chainStore, analyticsStore, keyRingStore } = useStore();
  const navigate = useNavigate();
  // const isAxlViewVisible = CHAINS.some((chain) => {
  //   return chain.chainId?.toString() === chainStore.current.chainId;
  // });
  useEffect(() => {
    const msg = new GetSidePanelIsSupportedMsg();
    new InExtensionMessageRequester()
      .sendMessage(BACKGROUND_PORT, msg)
      .then((res) => {
        setSidePanelSupported(res.supported);

        const msg = new GetSidePanelEnabledMsg();
        new InExtensionMessageRequester()
          .sendMessage(BACKGROUND_PORT, msg)
          .then((res) => {
            setSidePanelEnabled(res.enabled);
          });
      });
  }, []);

  // const isEvm = chainStore.current.features?.includes("evm") ?? false;
  return (
    <HeaderLayout
      innerStyle={{
        marginTop: "0px",
        marginBottom: "0px",
      }}
      showChainName={true}
      canChangeChainInfo={true}
      showBottomMenu={true}
    >
      <div className={style["title"]}>More</div>
      <div className={style["subTitle"]}>Account</div>
      <Card
        leftImageStyle={{ background: "transparent" }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "6px" }}
        leftImage={require("@assets/svg/wireframe/currency.svg")}
        heading={"Currency"}
        onClick={() => navigate("/more/currency")}
      />
      <Card
        leftImageStyle={{ background: "transparent" }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "6px" }}
        leftImage={require("@assets/svg/wireframe/manage-tokens.svg")}
        heading={"Manage Tokens"}
        onClick={() => navigate("/more/token/manage")}
      />
      <Card
        leftImageStyle={{ background: "transparent", height: "18px" }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "6px" }}
        leftImage={require("@assets/svg/wireframe/at.svg")}
        heading={"Address Book"}
        onClick={() => navigate("/more/address-book")}
      />
      <Card
        leftImageStyle={{ background: "transparent" }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "6px" }}
        leftImage={require("@assets/svg/wireframe/language.svg")}
        heading={"Language"}
        onClick={() => navigate("/more/language")}
      />

      {/* 
       <Card
        leftImageStyle={{ background: "transparent" }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "6px" }}
        leftImage={require("@assets/svg/wireframe/notification.svg")}
        heading={"Notifications"}
        onClick={() => navigate("/more/notifications")}
      /> */}

      <Card
        leftImageStyle={{ background: "transparent" }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "6px" }}
        leftImage={require("@assets/svg/wireframe/security.svg")}
        heading={"Security & privacy"}
        onClick={() => navigate("/more/security-privacy")}
      />

      <Card
        leftImageStyle={{ background: "transparent" }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "6px" }}
        leftImage={require("@assets/svg/wireframe/chain-list-access.svg")}
        heading={"Link ASI Mobile Wallet"}
        onClick={() => navigate("/more/export-to-mobile")}
      />

      <div
        style={{
          marginTop: "12px",
        }}
        className={style["subTitle"]}
      >
        Others
      </div>
      {sidePanelSupported && (
        <Card
          leftImageStyle={{ background: "transparent", height: "16px" }}
          style={{ background: "rgba(255,255,255,0.1)", marginBottom: "8px" }}
          headingStyle={{
            display: "flex",
            alignItems: "center",
          }}
          heading={
            <React.Fragment>
              <div>Switch to Side Panel</div>
              <div
                style={{
                  marginLeft: "10px",
                  background: "blue",
                  color: "white",
                  borderRadius: "4px",
                  fontSize: "12px",
                  paddingLeft: "5px",
                  paddingRight: "5px",
                }}
              >
                Beta
              </div>
            </React.Fragment>
          }
          subheading={"Open ASI Wallet in a sidebar on your screen"}
          rightContent={
            <SidePanelToggle
              sidePanelEnabled={sidePanelEnabled}
              setSidePanelEnabled={setSidePanelEnabled}
            />
          }
          rightContentStyle={{ marginBottom: "15px" }}
        />
      )}
      <Card
        leftImageStyle={{ background: "transparent", height: "16px" }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "8px" }}
        leftImage={require("@assets/svg/wireframe/ibc-transfer-v2.svg")}
        heading={"IBC Transfer"}
        onClick={(e: any) => {
          e.preventDefault();
          analyticsStore.logEvent("ibc_transfer_click", {
            pageName: "More Tab",
          });
          navigate("/ibc-transfer");
        }}
      />
      {chainStore.current.govUrl && (
        <Card
          leftImageStyle={{ background: "transparent" }}
          style={{ background: "rgba(255,255,255,0.1)", marginBottom: "8px" }}
          leftImage={require("@assets/svg/wireframe/proposal.svg")}
          heading={"Proposals"}
          onClick={(e: any) => {
            e.preventDefault();
            analyticsStore.logEvent("proposal_view_click");
            navigate("/proposal");
          }}
        />
      )}
      <Card
        leftImageStyle={{ background: "transparent" }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "8px" }}
        leftImage={require("@assets/svg/wireframe/guide.svg")}
        heading={"Guide"}
        onClick={() =>
          window.open(
            "https://fetch.ai/docs/guides/fetch-network/fetch-wallet/web-wallet/get-started",
            "_blank"
          )
        }
      />

      {/* {(chainStore.current.chainId === CHAIN_ID_FETCHHUB ||
        chainStore.current.chainId === CHAIN_ID_DORADO) && (
        <Card
          leftImageStyle={{ background: "transparent" }}
          style={{ background: "rgba(255,255,255,0.1)", marginBottom: "8px" }}
          leftImage={require("@assets/svg/wireframe/fns.svg")}
          heading={".FET Domains"}
          onClick={() => navigate("/fetch-name-service/explore")}
        />
      )} */}

      {/* 
      {isAxlViewVisible && (
        <Card
          leftImageStyle={{ background: "transparent" }}
          style={{ background: "rgba(255,255,255,0.1)", marginBottom: "8px" }}
          leftImage={require("@assets/svg/wireframe/axl-bridge.svg")}
          heading={"Axelar Bridge"}
          onClick={() =>
            isEvm ? navigate("/axl-bridge-evm") : navigate("/axl-bridge-cosmos")
          }
        />
      )} */}
      {/* <Card
        leftImageStyle={{ background: "transparent" }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "5px" }}
        leftImage={require("@assets/svg/wireframe/wallet-version.svg")}
        heading={"ASI Alliance Wallet version"}
        onClick={() => navigate("/app-version")}
      /> */}

      <Card
        leftImageStyle={{
          background: "transparent",
          height: "16px",
          width: "24px",
        }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "8px" }}
        leftImage={require("@assets/svg/wireframe/sign-out.svg")}
        heading={"Sign out"}
        onClick={() => {
          keyRingStore.lock();
          analyticsStore.logEvent("sign_out_click");
          navigate("/");
        }}
      />
      <div
        style={{
          marginBottom: "40px",
        }}
      />
    </HeaderLayout>
  );
};
