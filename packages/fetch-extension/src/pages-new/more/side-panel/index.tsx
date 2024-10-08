import React from "react";
import { ToggleSwitchButton } from "@components-v2/buttons/toggle-switch-button";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { SetSidePanelEnabledMsg } from "@keplr-wallet/background";

interface SidePanelProps {
  sidePanelEnabled: boolean;
  setSidePanelEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SidePanelToggle: React.FC<SidePanelProps> = ({
  sidePanelEnabled,
  setSidePanelEnabled,
}) => {
  const toggleSidePanel = () => {
    const msg = new SetSidePanelEnabledMsg(!sidePanelEnabled);
    new InExtensionMessageRequester()
      .sendMessage(BACKGROUND_PORT, msg)
      .then((res) => {
        setSidePanelEnabled(res.enabled);

        if (res.enabled) {
          if (
            typeof chrome !== "undefined" &&
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            typeof chrome.sidePanel !== "undefined"
          ) {
            (async () => {
              const selfCloseId = Math.random() * 100000;
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              window.__self_id_for_closing_view_side_panel = selfCloseId;
              // side panel을 열고 나서 기존의 popup view를 모두 지워야한다
              const viewsBefore = browser.extension.getViews();

              try {
                const activeTabs = await browser.tabs.query({
                  active: true,
                  currentWindow: true,
                });
                if (activeTabs.length > 0) {
                  const id = activeTabs[0].id;
                  if (id != null) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    await chrome.sidePanel.open({
                      tabId: id,
                    });
                  }
                }
              } catch (e) {
                console.log(e);
              } finally {
                for (const view of viewsBefore) {
                  if (
                    // 자기 자신은 제외해야한다.
                    // 다른거 끄기 전에 자기가 먼저 꺼지면 안되기 때문에...
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    window.__self_id_for_closing_view_side_panel !== selfCloseId
                  ) {
                    view.window.close();
                  }
                }

                window.close();
              }
            })();
          } else {
            window.close();
          }
        } else {
          const selfCloseId = Math.random() * 100000;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          window.__self_id_for_closing_view_side_panel = selfCloseId;
          // side panel을 모두 닫아야한다.
          const views = browser.extension.getViews();

          for (const view of views) {
            if (
              // 자기 자신은 제외해야한다.
              // 다른거 끄기 전에 자기가 먼저 꺼지면 안되기 때문에...
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              window.__self_id_for_closing_view_side_panel !== selfCloseId
            ) {
              view.window.close();
            }
          }

          window.close();
        }
      });
  };

  return (
    <ToggleSwitchButton checked={sidePanelEnabled} onChange={toggleSidePanel} />
  );
};
