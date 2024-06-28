import { CardModal } from "modals/card";
import React, { FunctionComponent } from "react";
import { IconWithText } from "components/new/icon-with-text/icon-with-text";
import { ErrorNetworkIcon } from "components/new/icon/error-network";

export const NetworkErrorModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = ({ isOpen, close }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <React.Fragment>
      <CardModal isOpen={isOpen} close={close}>
        <IconWithText
          icon={<ErrorNetworkIcon />}
          title={"Network error"}
          subtitle={"Please make sure your device has internet connection."}
        />
      </CardModal>
    </React.Fragment>
  );
};
