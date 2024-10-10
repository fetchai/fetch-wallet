import { ButtonV2 } from "@components-v2/buttons/button";
import React, { FunctionComponent, useMemo, useState } from "react";
import style from "./style.module.scss";

import { GlassCard } from "@components-v2/glass-card";
import { useNotification } from "@components/notification";
import {
  AccountSetBase,
  CosmosAccount,
  CosmwasmAccount,
  EthereumAccount,
  ObservableQueryRewardsInner,
  SecretAccount,
  Staking,
} from "@keplr-wallet/stores";
import { useNavigate } from "react-router";
import { DefaultGasMsgWithdrawRewards } from "../../../../config.ui";
import { useStore } from "../../../../stores";
import { MyValidator } from "./my-validator";
import { observer } from "mobx-react-lite";
import { separateNumericAndDenom } from "@utils/format";
import { Dec } from "@keplr-wallet/unit";
import { TXNTYPE } from "../../../../config";
import { useDropdown } from "@components-v2/dropdown/dropdown-context";
import { useLanguage } from "../../../../languages";
import { navigateOnTxnEvents } from "@utils/navigate-txn-event";

export const MyStakes = observer(
  ({
    rewards,
    accountInfo,
  }: {
    rewards: ObservableQueryRewardsInner;
    accountInfo: AccountSetBase &
      CosmosAccount &
      CosmwasmAccount &
      SecretAccount &
      EthereumAccount;
  }) => {
    const navigate = useNavigate();
    const notification = useNotification();
    const language = useLanguage();

    const fiatCurrency = language.fiatCurrency;

    const [_isWithdrawingRewards, setIsWithdrawingRewards] = useState(false);
    const {
      chainStore,
      analyticsStore,
      accountStore,
      priceStore,
      queriesStore,
      activityStore,
    } = useStore();

    const account = accountStore.getAccount(chainStore.current.chainId);
    const queries = queriesStore.get(chainStore.current.chainId);

    const { setIsDropdownOpen } = useDropdown();

    const queryDelegations =
      queries.cosmos.queryDelegations.getQueryBech32Address(
        account.bech32Address
      );
    const delegations = queryDelegations.delegations;

    const queryReward = queries.cosmos.queryRewards.getQueryBech32Address(
      account.bech32Address
    );
    const queryStakable = queries.queryBalances.getQueryBech32Address(
      account.bech32Address
    ).stakable;
    const stakable = queryStakable.balance;

    const pendingStakableReward =
      queries.cosmos.queryRewards.getQueryBech32Address(
        account.bech32Address
      ).stakableReward;

    const pendingStakableRewardUSD = priceStore.calculatePrice(
      pendingStakableReward.shrink(true).maxDecimals(6).trim(true),
      fiatCurrency
    );

    const { numericPart: totalNumber } = separateNumericAndDenom(
      pendingStakableReward.shrink(true).maxDecimals(6).trim(true).toString()
    );

    const handleClaimRewards = async () => {
      if (accountInfo.isReadyToSendTx) {
        try {
          setIsWithdrawingRewards(true);

          // When the user delegated too many validators,
          // it can't be sent to withdraw rewards from all validators due to the block gas limit.
          // So, to prevent this problem, just send the msgs up to 8.
          const validatorAddresses =
            rewards.getDescendingPendingRewardValidatorAddresses(8);
          const tx =
            accountInfo.cosmos.makeWithdrawDelegationRewardTx(
              validatorAddresses
            );

          let gas: number;
          try {
            // Gas adjustment is 1.5
            // Since there is currently no convenient way to adjust the gas adjustment on the UI,
            // Use high gas adjustment to prevent failure.
            gas = (await tx.simulate()).gasUsed * 1.5;
          } catch (e) {
            console.log(e);

            gas = DefaultGasMsgWithdrawRewards * validatorAddresses.length;
          }

          await tx.send(
            {
              amount: [],
              gas: gas.toString(),
            },
            "",
            undefined,
            {
              onBroadcasted: () => {
                analyticsStore.logEvent("Claim reward tx broadcasted", {
                  chainId: chainStore.current.chainId,
                  chainName: chainStore.current.chainName,
                });
                notification.push({
                  type: "primary",
                  placement: "top-center",
                  duration: 5,
                  content: `Transaction Broadcasted`,
                  canDelete: true,
                  transition: {
                    duration: 0.25,
                  },
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
                    : `Transaction Failed`,
                  canDelete: true,
                  transition: {
                    duration: 0.25,
                  },
                });
              },
            }
          );
        } catch (e) {
          const txnNavigationOptions = {
            redirect: () => {
              navigate("/stake", { replace: true });
            },
            txType: TXNTYPE.withdrawRewards,
            txInProgress: account.txInProgress,
          };
          navigateOnTxnEvents(txnNavigationOptions);
          notification.push({
            type: "warning",
            placement: "top-center",
            duration: 5,
            content: `Fail to withdraw rewards: ${e.message}`,
            canDelete: true,
            transition: {
              duration: 0.25,
            },
          });
        } finally {
          setIsWithdrawingRewards(false);

          const txnNavigationOptions = {
            redirect: () => {
              navigate("/activity", { replace: true });
            },
            txType: TXNTYPE.withdrawRewards,
            txInProgress: account.txInProgress,
          };
          setTimeout(() => {
            navigateOnTxnEvents(txnNavigationOptions);
          }, 200);

          setIsDropdownOpen(false);
        }
      }
    };

    const [showReward, setShowRegard] = useState<boolean>(false);

    return (
      <div className={style["row"]}>
        <ButtonV2
          text="Stake more"
          onClick={() => navigate("/validator/validator-list")}
          styleProps={{
            height: "44px",
            marginTop: "32px",
            marginBottom: "32px",
          }}
        />

        {/* Claim Rewards */}
        <GlassCard>
          <div className={style["reward-row"]}>
            <div className={style["reward-col"]}>
              <div className={style["left-col"]}>
                <span
                  className={style["label"]}
                  style={{
                    fontSize: "14px",
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  Staking rewards
                </span>
                <span style={{ fontWeight: 400 }}>
                  {pendingStakableRewardUSD
                    ? pendingStakableRewardUSD
                        .shrink(true)
                        .maxDecimals(6)
                        .trim(true)
                        .toString()
                    : totalNumber}{" "}
                  <span style={{ color: "#556578" }}>
                    {fiatCurrency.toUpperCase()}
                  </span>
                </span>
              </div>

              {!(
                !account.isReadyToSendTx ||
                pendingStakableReward.toDec().equals(new Dec(0)) ||
                stakable.toDec().lte(new Dec(0)) ||
                queryReward.pendingRewardValidatorAddresses.length === 0
              ) && (
                <ButtonV2
                  styleProps={{
                    width: "91px",
                    padding: "2px 15px",
                    height: "36px",
                    marginTop: "0",
                    fontSize: "14px",

                    background:
                      "linear-gradient(270deg, #F9774B 10.08%, #cf447b 70.82%",
                    color: "white",
                  }}
                  disabled={
                    activityStore.getPendingTxnTypes[TXNTYPE.withdrawRewards] ||
                    _isWithdrawingRewards
                  }
                  text={
                    activityStore.getPendingTxnTypes[TXNTYPE.withdrawRewards] ||
                    _isWithdrawingRewards
                      ? ""
                      : "Claim all"
                  }
                  onClick={() => {
                    if (
                      activityStore.getPendingTxnTypes[
                        TXNTYPE.withdrawRewards
                      ] ||
                      _isWithdrawingRewards
                    )
                      return;
                    handleClaimRewards();
                  }}
                >
                  {(activityStore.getPendingTxnTypes[TXNTYPE.withdrawRewards] ||
                    _isWithdrawingRewards) && (
                    <i className="fas fa-spinner fa-spin ml-2 mr-2" />
                  )}
                </ButtonV2>
              )}
            </div>

            {!(
              pendingStakableReward.toDec().equals(new Dec(0)) ||
              stakable.toDec().lte(new Dec(0)) ||
              queryReward.pendingRewardValidatorAddresses.length === 0 ||
              delegations.length === 0
            ) && (
              <div
                onClick={() => setShowRegard((prev) => !prev)}
                style={{
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "#BFAFFD",
                    paddingRight: "5px",
                  }}
                >
                  {showReward ? "Hide" : "View"} rewards
                </span>
                {showReward ? (
                  <img
                    src={require("@assets/svg/chevron-up.svg")}
                    alt="up icon"
                  />
                ) : (
                  <img
                    src={require("@assets/svg/wireframe/chevron-down-rewards.svg")}
                    alt="down icon"
                  />
                )}
              </div>
            )}

            {showReward && (
              <div className={style["show-rewards"]}>
                <DelegateReward />
              </div>
            )}
          </div>
        </GlassCard>

        <div
          className={style["my-validators-container"]}
          style={{
            marginTop: "24px",
          }}
        >
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <div
              style={{
                color: "#fff",
                opacity: "60%",
                fontSize: "14px",
                fontWeight: 400,
              }}
            >
              Staked balances
            </div>
            <div className={style["stake-count"]}>{delegations.length}</div>
          </div>

          <div
            className={style["my-validators-container"]}
            style={{
              paddingBottom: "30px",
            }}
          >
            <MyValidator />
          </div>
        </div>
      </div>
    );
  }
);

const DelegateReward: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, activityStore } = useStore();

  const navigate = useNavigate();

  const notification = useNotification();
  const [_isWithdrawingRewards, setIsWithdrawingRewards] = useState(false);

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const queryDelegations =
    queries.cosmos.queryDelegations.getQueryBech32Address(
      account.bech32Address
    );
  const delegations = queryDelegations.delegations;

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded
  );
  const unbondingValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Unbonding
  );
  const unbondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Unbonded
  );

  const validators = useMemo(() => {
    return bondedValidators.validators
      .concat(unbondingValidators.validators)
      .concat(unbondedValidators.validators);
  }, [
    bondedValidators.validators,
    unbondingValidators.validators,
    unbondedValidators.validators,
  ]);

  const validatorsMap = useMemo(() => {
    const map: Map<string, Staking.Validator> = new Map();

    for (const val of validators) {
      map.set(val.operator_address, val);
    }

    return map;
  }, [validators]);

  const handleClaim = async (validatorAddress: string) => {
    setIsWithdrawingRewards(true);
    try {
      await account.cosmos.sendWithdrawDelegationRewardMsgs(
        [validatorAddress],
        "",
        undefined,
        undefined,
        {
          onBroadcasted() {
            notification.push({
              type: "primary",
              placement: "top-center",
              duration: 5,
              content: `Transaction Broadcasted`,
              canDelete: true,
              transition: {
                duration: 0.25,
              },
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
                : `Transaction Failed`,
              canDelete: true,
              transition: {
                duration: 0.25,
              },
            });
          },
        }
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsWithdrawingRewards(false);
      const txnNavigationOptions = {
        redirect: () => {
          navigate("/stake");
        },
        txType: TXNTYPE.withdrawRewards,
        txInProgress: account.txInProgress,
      };
      navigateOnTxnEvents(txnNavigationOptions);
    }
  };

  return (
    <React.Fragment>
      {delegations.map((del) => {
        const val = validatorsMap.get(del.delegation.validator_address);
        if (!val) {
          return null;
        }

        const thumbnail =
          bondedValidators.getValidatorThumbnail(val.operator_address) ||
          unbondingValidators.getValidatorThumbnail(val.operator_address) ||
          unbondedValidators.getValidatorThumbnail(val.operator_address);

        // const amount = queryDelegations.getDelegationTo(val.operator_address);
        // const amountUSD = priceStore.calculatePrice(
        //   amount.maxDecimals(5).trim(true).shrink(true)
        // );
        const rewards = queries.cosmos.queryRewards
          .getQueryBech32Address(account.bech32Address)
          .getStakableRewardOf(val.operator_address);

        return parseFloat(rewards.toString().split(" ")[0]) > 0 ? (
          <div
            key={del.delegation.validator_address}
            className={style["reward-container"]}
          >
            {thumbnail ? (
              <img src={thumbnail} alt={"validator"} />
            ) : (
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "rgba(255, 255, 255, 0.1)",
                }}
              >
                {val.description.moniker?.toString()[0].toUpperCase()}
              </div>
            )}

            <div className={style["reward-data"]}>
              <div className={style["reward-title"]}>
                {val.description.moniker?.trim()}
              </div>
              <div className={style["reward-amount"]}>
                {rewards.maxDecimals(4).trim(true).shrink(true).toString()}
              </div>
            </div>
            <ButtonV2
              styleProps={{
                width: "71px",
                padding: "2px 15px",
                height: "36px",
                marginTop: "0",
                fontSize: "14px",
                fontWeight: 400,
                background: "transparent",
                color: "white",
                border: "1px solid rgba(255,255,255,0.4)",
              }}
              disabled={
                activityStore.getPendingTxnTypes[TXNTYPE.withdrawRewards]
              }
              text={
                activityStore.getPendingTxnTypes[TXNTYPE.withdrawRewards]
                  ? ""
                  : "Claim"
              }
              onClick={() => {
                if (activityStore.getPendingTxnTypes[TXNTYPE.withdrawRewards])
                  return;
                handleClaim(val.operator_address);
              }}
            >
              {activityStore.getPendingTxnTypes[TXNTYPE.withdrawRewards] && (
                <i className="fas fa-spinner fa-spin ml-2 mr-2" />
              )}
            </ButtonV2>
          </div>
        ) : null;
      })}
    </React.Fragment>
  );
});
