import { CardModal } from "modals/card";
import React, { FunctionComponent } from "react";
import { ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { IconWithText } from "components/new/icon-with-text/icon-with-text";
import { ClaimRewardIcon } from "components/new/icon/claim-reward";
import { Button } from "components/button";

export const AppUpdateModal: FunctionComponent<{
  isOpen: boolean;
  onPress?: () => void;
}> = ({ isOpen, onPress }) => {
  const style = useStyle();

  if (!isOpen) {
    return null;
  }

  return (
    <CardModal isOpen={isOpen} disableGesture={true} showCloseButton={false}>
      <IconWithText
        icon={<ClaimRewardIcon size={64} />}
        iconStyle={style.flatten(["margin-bottom-24"]) as ViewStyle}
        title={"Update"}
        subtitle={
          "Transaction has been broadcasted to\nblockchain and pending confirmation"
        }
        titleStyle={style.flatten(["body1"]) as ViewStyle}
        subtitleStyle={
          style.flatten(["body3", "padding-y-0", "margin-top-6"]) as ViewStyle
        }
      />
      <Button
        containerStyle={
          style.flatten(["border-radius-32", "margin-top-24"]) as ViewStyle
        }
        textStyle={style.flatten(["body3"]) as ViewStyle}
        text={"Update"}
        onPress={onPress}
      />
    </CardModal>
  );
};
