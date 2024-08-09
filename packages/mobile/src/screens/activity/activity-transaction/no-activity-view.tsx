import React, { FunctionComponent } from "react";
import { ViewStyle } from "react-native";
import { IconWithText } from "components/new/icon-with-text/icon-with-text";
import { useStyle } from "styles/index";
import { RowFrame } from "components/new/icon/row-frame";
import { useStore } from "stores/index";

import { isFeatureAvailable } from "utils/index";

export const NoActivityView: FunctionComponent = () => {
  const style = useStyle();
  const { chainStore } = useStore();

  return (
    <IconWithText
      title={
        isFeatureAvailable(chainStore.current.chainId)
          ? "No activity yet"
          : "Feature not available \non this network"
      }
      subtitle={
        isFeatureAvailable(chainStore.current.chainId)
          ? "Your transaction will appear hear when you\nstart using your wallet "
          : ""
      }
      icon={<RowFrame />}
      isComingSoon={false}
      titleStyle={style.flatten(["h3"]) as ViewStyle}
      containerStyle={style.flatten(["items-center", "justify-center"])}
    />
  );
};
