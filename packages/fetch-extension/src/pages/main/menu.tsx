import React, { FunctionComponent } from "react";

import styleMenu from "./menu.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";

import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router";
import amplitude from "amplitude-js";

export const Menu: FunctionComponent = observer(() => {
  const { chainStore, keyRingStore } = useStore();

  const history = useHistory();

  return (
    <div className={styleMenu.container}>
      <div
        className={styleMenu.item}
        onClick={() => {
          amplitude.getInstance().logEvent("Address book viewed", {});
          history.push({
            pathname: "/setting/address-book",
          });
        }}
      >
        <FormattedMessage id="main.menu.address-book" />
      </div>
      <div
        className={styleMenu.item}
        onClick={() => {
          history.push({
            pathname: "/setting",
          });
        }}
      >
        <FormattedMessage id="main.menu.settings" />
      </div>
      <a
        className={styleMenu.item}
        href="https://docs.fetch.ai/fetch-wallet/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FormattedMessage id="main.menu.guide" />
      </a>
      {(chainStore.current.features ?? []).find(
        (feature) => feature === "cosmwasm" || feature === "secretwasm"
      ) ? (
        <div
          className={styleMenu.item}
          onClick={() => {
            history.push({
              pathname: "/setting/token/add",
            });
          }}
        >
          <FormattedMessage id="setting.token.add" />
        </div>
      ) : null}
      {(chainStore.current.features ?? []).find(
        (feature) => feature === "cosmwasm" || feature === "secretwasm"
      ) ? (
        <div
          className={styleMenu.item}
          onClick={() => {
            history.push({
              pathname: "/setting/token/manage",
            });
          }}
        >
          <FormattedMessage id="main.menu.token-list" />
        </div>
      ) : null}
      {/* Empty div for separating last item */}
      <div style={{ flex: 1 }} />
      <div
        className={styleMenu.item}
        onClick={() => {
          keyRingStore.lock();
          history.push("/");
        }}
      >
        <FormattedMessage id="main.menu.sign-out" />
      </div>
      <div>
        <hr className="mx-4 my-1" />
      </div>
      <div className={styleMenu.footer}>
        <a
          className={styleMenu.inner}
          href="https://github.com/fetchai/keplr-extension"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fab fa-github" />
          <FormattedMessage id="main.menu.footer.github" />
        </a>
      </div>
    </div>
  );
});