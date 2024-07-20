import React, { useState } from "react";
import style from "../style.module.scss";
import { Doughnut } from "react-chartjs-2";
import { separateNumericAndDenom } from "@utils/format";
import { useStore } from "../../../stores";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { AppCurrency } from "@keplr-wallet/types";
import { ButtonV2 } from "@components-v2/buttons/button";
import { DefaultGasMsgWithdrawRewards } from "../../../config.ui";
import { useNavigate } from "react-router";
import { useNotification } from "@components/notification";
import { TXNTYPE } from "../../../config";
import { Dropdown } from "@components-v2/dropdown";
import { observer } from "mobx-react-lite";
import { WalletStatus } from "@keplr-wallet/stores";
import { Skeleton } from "@components-v2/skeleton-loader";

export const Stats = observer(
  ({
    isClaimRewardsOpen,
    setIsClaimRewardsOpen,
  }: {
    isClaimRewardsOpen: boolean;
    setIsClaimRewardsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }) => {
    const navigate = useNavigate();
    const notification = useNotification();

    const [_isWithdrawingRewards, setIsWithdrawingRewards] = useState(false);

    const {
      chainStore,
      accountStore,
      queriesStore,
      analyticsStore,
      priceStore,
      activityStore,
    } = useStore();
    const current = chainStore.current;
    const queries = queriesStore.get(current.chainId);
    const accountInfo = accountStore.getAccount(current.chainId);
    const balanceQuery = queries.queryBalances.getQueryBech32Address(
      accountInfo.bech32Address
    );
    const balanceStakableQuery = balanceQuery.stakable;

    const isNoble =
      ChainIdHelper.parse(chainStore.current.chainId).identifier === "noble";
    const hasUSDC = chainStore.current.currencies.find(
      (currency: AppCurrency) => currency.coinMinimalDenom === "uusdc"
    );

    const stakable = (() => {
      if (isNoble && hasUSDC) {
        return balanceQuery.getBalanceFromCurrency(hasUSDC);
      }

      return balanceStakableQuery.balance;
    })();

    const delegated = queries.cosmos.queryDelegations
      .getQueryBech32Address(accountInfo.bech32Address)
      .total.upperCase(true);

    const unbonding = queries.cosmos.queryUnbondingDelegations
      .getQueryBech32Address(accountInfo.bech32Address)
      .total.upperCase(true);

    const rewards = queries.cosmos.queryRewards.getQueryBech32Address(
      accountInfo.bech32Address
    );

    const stakableReward = rewards.stakableReward;
    const stakedSum = delegated.add(unbonding);
    const stakableBal = stakable.toString();
    const stakedBal = stakedSum.toString();
    const rewardsBal = stakableReward.toString();

    const { numericPart: stakableBalNumber, denomPart: stakableDenom } =
      separateNumericAndDenom(stakableBal);
    const { numericPart: stakedBalNumber, denomPart: stakedDenom } =
      separateNumericAndDenom(stakedBal);
    const { numericPart: rewardsBalNumber, denomPart: rewardDenom } =
      separateNumericAndDenom(rewardsBal);

    const stakableBalInUI = parseFloat(stakableBalNumber);
    const stakedBalInUI = parseFloat(stakedBalNumber);
    const rewardsBalInUI = parseFloat(rewardsBalNumber);

    const total = stakableBalInUI + stakedBalInUI + rewardsBalInUI;

    const stakablePercentage = total ? (stakableBalInUI / total) * 100 : 0;
    const stakedPercentage = total ? (stakedBalInUI / total) * 100 : 0;
    const rewardsPercentage = total ? (rewardsBalInUI / total) * 100 : 0;

    const stakableInUSD = priceStore.calculatePrice(stakable)?.toString();
    const stakedInUSD = priceStore.calculatePrice(stakedSum)?.toString();
    const rewardsInUSD = priceStore.calculatePrice(stakableReward)?.toString();

    const doughnutData = {
      labels: ["Balance", "Staked", "Rewards"],
      datasets: [
        {
          data: [
            parseFloat(stakableBalNumber),
            parseFloat(stakedBalNumber),
            parseFloat(rewardsBalNumber),
          ],
          backgroundColor: ["#CFC3FE", "#5F38FB", "#F9774B"],
          hoverBackgroundColor: ["#CFC3FE", "#5F38FB", "#F9774B"],
          borderColor: "transparent",
        },
      ],
      options: {
        legend: {
          display: false,
        },
        tooltips: {
          enabled: false,
        },
      },
    };
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

                analyticsStore.logEvent("Claim reward tx broadcasted", {
                  chainId: chainStore.current.chainId,
                  chainName: chainStore.current.chainName,
                });
              },
              onFulfill: () => {
                notification.push({
                  type: "success",
                  placement: "top-center",
                  duration: 5,
                  content: `Transaction Completed`,
                  canDelete: true,
                  transition: {
                    duration: 0.25,
                  },
                });
              },
            }
          );
          setTimeout(() => {
            navigate("/activity", { replace: true });
          }, 200);
        } catch (e) {
          navigate("/portfolio", { replace: true });
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
        }
      }
    };

    const isLoaded =
      accountInfo.walletStatus === WalletStatus.Loaded &&
      accountInfo.bech32Address &&
      !rewards.isFetching;

    return (
      <div className={style["card"]}>
        <div className={style["heading"]}>STAKING</div>
        <div
          style={{
            display: "flex",
            position: "relative",
          }}
        >
          <div>
            <div className={style["legends"]}>
              <div className={style["legend"]}>
                <img
                  src={
                    stakableInUSD !== undefined && stakableInUSD > "$0"
                      ? require("@assets/svg/wireframe/legend-light-purple-long.svg")
                      : require("@assets/svg/wireframe/legend-light-purple.svg")
                  }
                  alt=""
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                  }}
                >
                  <div className={style["label"]}>Available</div>
                  {isLoaded ? (
                    <div className={style["value"]}>
                      {stakableBalInUI.toFixed(2)} {` ${stakableDenom} `}
                      <span className={style["label"]}>
                        ({stakablePercentage.toFixed(1)}%)
                      </span>
                    </div>
                  ) : (
                    <Skeleton height="17.5px" />
                  )}
                  {isLoaded ? (
                    stakableInUSD !== undefined && stakableInUSD > "$0" ? (
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 400,
                          color: "rgba(255,255,255,0.6)",
                        }}
                      >
                        {stakableInUSD}
                      </div>
                    ) : null
                  ) : (
                    <Skeleton height="21px" />
                  )}
                </div>
              </div>
              <div className={style["legend"]}>
                <img
                  src={
                    stakedInUSD !== undefined && stakedInUSD > "$0"
                      ? require("@assets/svg/wireframe/legend-purple-long.svg")
                      : require("@assets/svg/wireframe/legend-purple.svg")
                  }
                  alt=""
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                  }}
                >
                  <div className={style["label"]}>Staked</div>
                  {isLoaded ? (
                    <div className={style["value"]}>
                      {stakedBalInUI.toFixed(2)} {` ${stakedDenom} `}
                      <span className={style["label"]}>
                        ({stakedPercentage.toFixed(1)}
                        %)
                      </span>
                    </div>
                  ) : (
                    <Skeleton height="17.5px" />
                  )}
                  {isLoaded ? (
                    stakedInUSD !== undefined && stakedInUSD > "$0" ? (
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 400,
                          color: "rgba(255,255,255,0.6)",
                        }}
                      >
                        {stakedInUSD}
                      </div>
                    ) : null
                  ) : (
                    <Skeleton height="21px" />
                  )}
                </div>
              </div>
              <div className={style["legend"]}>
                <img
                  src={
                    rewardsInUSD !== undefined && rewardsInUSD > "$0"
                      ? require("@assets/svg/wireframe/legend-orange-long.svg")
                      : require("@assets/svg/wireframe/legend-orange.svg")
                  }
                  alt=""
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                  }}
                >
                  <div className={style["label"]}>Staking rewards</div>
                  {isLoaded ? (
                    <div className={style["value"]}>
                      {rewardsBalInUI.toFixed(2)} {` ${rewardDenom} `}
                      <span className={style["label"]}>
                        ({rewardsPercentage.toFixed(1)}%)
                      </span>
                    </div>
                  ) : (
                    <Skeleton height="17.5px" />
                  )}
                  {isLoaded ? (
                    rewardsInUSD !== undefined && rewardsInUSD > "$0" ? (
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 400,
                          color: "rgba(255,255,255,0.6)",
                        }}
                      >
                        {rewardsInUSD}
                      </div>
                    ) : null
                  ) : (
                    <Skeleton height="21px" />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className={style["doughnut-graph"]}>
            <Doughnut data={doughnutData} options={doughnutData.options} />
          </div>
        </div>
        <ButtonV2
          onClick={() => setIsClaimRewardsOpen(true)}
          styleProps={{
            background: "linear-gradient(269deg, #F9774B 0%, #CF447B 99.29%)",
            color: "white",
            marginTop: "24px",
          }}
          text="Claim rewards"
          disabled={
            rewardsBal === "0.000000000000000000 FET" ||
            activityStore.getPendingTxnTypes[TXNTYPE.withdrawRewards]
          }
        >
          {activityStore.getPendingTxnTypes[TXNTYPE.withdrawRewards] && (
            <i className="fas fa-spinner fa-spin ml-2 mr-2" />
          )}
        </ButtonV2>

        <Dropdown
          setIsOpen={isClaimRewardsOpen}
          isOpen={isClaimRewardsOpen}
          title=""
          closeClicked={() => setIsClaimRewardsOpen(false)}
          showTopNav={false}
          showCloseIcon={false}
        >
          <div className={style["claim-rewards-dropdown-container"]}>
            <img
              src={require("@assets/svg/wireframe/ic_claimrewards.png")}
              alt=""
            />
            <div className={style["claim-rewards-dropdown-text-container"]}>
              <div className={style["claim-rewards-dropdown-title"]}>
                Claim rewards
              </div>
              <div className={style["claim-rewards-dropdown-subtitle"]}>
                Transaction has been broadcasted to blockchain and pending
                confirmation
              </div>
            </div>

            <div className={style["claim-rewards-reward"]}>
              <div
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "17.5px",
                }}
              >
                You’ve earned
              </div>
              <div style={{ fontWeight: 500, lineHeight: "17.5px" }}>
                {parseFloat(rewardsBalNumber).toFixed(2)} {` ${rewardDenom} `}
              </div>
            </div>

            <ButtonV2
              onClick={handleClaimRewards}
              styleProps={{
                background:
                  "linear-gradient(269deg, #F9774B 0%, #CF447B 99.29%)",
                color: "white",
                height: "56px",
              }}
              text="Claim my rewards"
              disabled={
                rewardsBal === "0.000000000000000000 FET" ||
                activityStore.getPendingTxnTypes[TXNTYPE.withdrawRewards] ||
                _isWithdrawingRewards
              }
            >
              {(activityStore.getPendingTxnTypes[TXNTYPE.withdrawRewards] ||
                _isWithdrawingRewards) && (
                <i className="fas fa-spinner fa-spin ml-2 mr-2" />
              )}
            </ButtonV2>
          </div>
        </Dropdown>
      </div>
    );
  }
);
