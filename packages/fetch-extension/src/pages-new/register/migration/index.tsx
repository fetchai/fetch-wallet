import React, { FunctionComponent, useState } from "react";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { FormattedMessage } from "react-intl";
import { BackButton } from "../index";
import { MigrateMetamaskPrivateKeyPage } from "./metamask-privatekey";
import { ButtonV2 } from "@components-v2/buttons/button";

export const TypeMigrateEth = "migrate-from-eth";

enum MigrationMode {
  SELECT_MODE,
  METAMASK_PRIVATE_KEY,
}

export const MigrateEthereumAddressIntro: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  return (
    <ButtonV2
      onClick={(e: any) => {
        e.preventDefault();

        registerConfig.setType(TypeMigrateEth);
      }}
      text={""}
    >
      <FormattedMessage id="register.eth-migrate.title" />
    </ButtonV2>
  );
});

const MigrationSelectionPage: FunctionComponent<{
  setMode: (mode: MigrationMode) => void;
  onBack: () => void;
}> = (props) => {
  return (
    <div>
      <ButtonV2
        text=""
        onClick={() => props.setMode(MigrationMode.METAMASK_PRIVATE_KEY)}
      >
        <FormattedMessage id="register.eth-migrate.metamask-private-key.title" />
      </ButtonV2>
      <BackButton onClick={props.onBack} />
    </div>
  );
};

export const MigrateEthereumAddressPage: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const [mode, setMode] = useState<MigrationMode>(MigrationMode.SELECT_MODE);

  switch (mode) {
    case MigrationMode.SELECT_MODE:
      return (
        <MigrationSelectionPage
          setMode={setMode}
          onBack={() => registerConfig.clear()}
        />
      );
    case MigrationMode.METAMASK_PRIVATE_KEY:
      return (
        <MigrateMetamaskPrivateKeyPage
          registerConfig={registerConfig}
          onBack={() => setMode(MigrationMode.SELECT_MODE)}
        />
      );
  }
});
