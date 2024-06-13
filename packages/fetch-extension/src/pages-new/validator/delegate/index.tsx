import { ValidatorCardV2 } from "@components-v2/validator-card";
import { useDelegateTxConfig } from "@keplr-wallet/hooks";
import { Staking } from "@keplr-wallet/stores";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useStore } from "../../../stores";
import { HeaderLayout } from "@layouts-v2/header-layout";
import { Alert, FormGroup } from "reactstrap";
import { StakeInput } from "@components-v2/form/stake-input";
import { UseMaxButton } from "@components-v2/buttons/use-max-button";
import { FeeButtons, MemoInput } from "@components-v2/form";
import style from "./style.module.scss";
import { ButtonV2 } from "@components-v2/buttons/button";
import { useNotification } from "@components/notification";

export const Delegate: FunctionComponent = observer(() => {
  const location = useLocation();
  const validatorAddress = location.pathname.split("/")[2];

  const navigate = useNavigate();

  const { chainStore, accountStore, queriesStore, analyticsStore, priceStore } =
    useStore();

  const [isToggleClicked, setIsToggleClicked] = useState<boolean>(false);

  const [inputInUsd, setInputInUsd] = useState<string | undefined>("");

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const sendConfigs = useDelegateTxConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainStore.current.chainId,
    account.bech32Address
  );

  useEffect(() => {
    sendConfigs.recipientConfig.setRawRecipient(validatorAddress);
  }, [sendConfigs.recipientConfig, validatorAddress]);

  const sendConfigError =
    sendConfigs.recipientConfig.error ??
    sendConfigs.amountConfig.error ??
    sendConfigs.memoConfig.error ??
    sendConfigs.gasConfig.error ??
    sendConfigs.feeConfig.error;
  const txStateIsValid = sendConfigError == null;

  const queryBalances = queriesStore
    .get(sendConfigs.amountConfig.chainId)
    .queryBalances.getQueryBech32Address(sendConfigs.amountConfig.sender);

  const queryBalance = queryBalances.balances.find(
    (bal) =>
      sendConfigs.amountConfig.sendCurrency.coinMinimalDenom ===
      bal.currency.coinMinimalDenom
  );
  const balance = queryBalance
    ? queryBalance.balance
    : new CoinPretty(sendConfigs.amountConfig.sendCurrency, new Int(0));

  const convertToUsd = (currency: any) => {
    const value = priceStore.calculatePrice(currency);
    return value && value.shrink(true).maxDecimals(6).toString();
  };
  useEffect(() => {
    const inputValueInUsd = convertToUsd(balance);
    setInputInUsd(inputValueInUsd);
  }, [sendConfigs.amountConfig.amount]);

  const Usd = inputInUsd
    ? ` (${inputInUsd} ${priceStore.defaultVsCurrency.toUpperCase()})`
    : "";

  const availableBalance = `${balance
    .trim(true)
    .shrink(true)
    .maxDecimals(6)
    .toString()}${Usd}`;

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded
  );

  const unbondingValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Unbonding
  );
  const unbondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Unbonded
  );

  const validator =
    bondedValidators.getValidator(validatorAddress) ||
    unbondingValidators.getValidator(validatorAddress) ||
    unbondedValidators.getValidator(validatorAddress);

  const notification = useNotification();

  const txnResult = {
    onBroadcasted: () => {
      notification.push({
        type: "primary",
        placement: "top-center",
        duration: 2,
        content: `Transaction broadcasted`,
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });

      analyticsStore.logEvent("Stake tx broadcasted", {
        chainId: chainStore.current.chainId,
        chainName: chainStore.current.chainName,
      });
    },
    onFulfill: (tx: any) => {
      const istxnSuccess = tx.code ? false : true;
      notification.push({
        type: istxnSuccess ? "success" : "danger",
        placement: "top-center",
        duration: 5,
        content: istxnSuccess
          ? `Transaction Completed`
          : `Transaction Failed: ${tx.log}`,
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
    },
  };
  const stakeClicked = async () => {
    try {
      await account.cosmos
        .makeDelegateTx(sendConfigs.amountConfig.amount, validatorAddress)
        .send(
          sendConfigs.feeConfig.toStdFee(),
          sendConfigs.memoConfig.memo,
          undefined,
          txnResult
        );
    } catch (e) {
      notification.push({
        type: "danger",
        placement: "top-center",
        duration: 5,
        content: `Transaction Failed`,
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
    } finally {
      navigate("/", { replace: true });
    }
  };

  return (
    <HeaderLayout
      smallTitle={true}
      showTopMenu={true}
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={`Stake`}
      showBottomMenu={false}
      onBackButton={() => navigate(`/validator/${validatorAddress}`)}
    >
      {validator && (
        <div style={{ color: "white" }}>
          <ValidatorCardV2 validator={validator} />

          <FormGroup
            style={{
              borderRadius: "0%",
              marginBottom: "2px",
              marginTop: "16px",
            }}
          >
            <StakeInput
              label="Amount"
              amountConfig={sendConfigs.amountConfig}
              isToggleClicked={isToggleClicked}
            />

            <div
              style={{
                fontSize: "12px",
                fontWeight: 400,
                color: "rgba(255,255,255,0.6)",
                marginTop: "8px",
              }}
            >
              {`Available: ${availableBalance}`}
            </div>

            <UseMaxButton
              amountConfig={sendConfigs.amountConfig}
              isToggleClicked={isToggleClicked}
              setIsToggleClicked={setIsToggleClicked}
            />

            <MemoInput memoConfig={sendConfigs.memoConfig} />

            <Alert className={style["alert"]}>
              <img src={require("@assets/svg/wireframe/alert.svg")} alt="" />
              <div>
                <p className={style["lightText"]}>
                  When you decide to unstake, your assets will be locked for 21
                  days to be liquid again
                </p>
              </div>
            </Alert>

            <FeeButtons
              label="Fee"
              gasLabel="gas"
              feeConfig={sendConfigs.feeConfig}
              gasConfig={sendConfigs.gasConfig}
              priceStore={priceStore}
            />

            <ButtonV2
              text=""
              styleProps={{
                width: "336px",
                padding: "12px",
                height: "56px",
                margin: "0 auto",
                position: "fixed",
                bottom: "15px",
                left: "0px",
                right: "0px",
              }}
              disabled={
                !account.isReadyToSendTx ||
                !txStateIsValid ||
                account.txTypeInProgress === "delegate"
              }
              onClick={() => {
                if (account.txTypeInProgress === "delegate") return;
                stakeClicked();
              }}
              btnBgEnabled={true}
            >
              Confirm
              {account.txTypeInProgress === "delegate" && (
                <i className="fas fa-spinner fa-spin ml-2 mr-2" />
              )}
            </ButtonV2>
          </FormGroup>
        </div>
      )}
    </HeaderLayout>
  );
});
