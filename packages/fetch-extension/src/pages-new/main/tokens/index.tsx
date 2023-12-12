import React, { FunctionComponent, useEffect, useState } from "react";
import styleToken from "./style.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { useNavigate } from "react-router";
import { Hash } from "@keplr-wallet/crypto";
import { UncontrolledTooltip } from "reactstrap";
import { WrongViewingKeyError } from "@keplr-wallet/stores";
import { useNotification } from "@components/notification";
import { useLoadingIndicator } from "@components/loading-indicator";
import { CoinPretty, Dec, Int } from "@keplr-wallet/unit";
import { DenomHelper } from "@keplr-wallet/common";
import { Card } from "@components-v2/card";
import { ToolTip } from "@components/tooltip";
import { formatTokenName } from "@utils/format";
import { useLanguage } from "../../../languages";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { AppCurrency } from "@keplr-wallet/types";

export const TokensView: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, tokensStore, priceStore } =
    useStore();
  const [nativeToken, setNativeToken] = useState<any>("");
  const current = chainStore.current;
  const separateNumericAndDenom = (value: string) => {
    const [numericPart, denomPart] = value.split(" ");
    return { numericPart, denomPart };
  };
  const isEvm = chainStore.current.features?.includes("evm") ?? false;

  const accountInfo = accountStore.getAccount(current.chainId);

  const queries = queriesStore.get(current.chainId);

  const balanceQuery = queries.queryBalances.getQueryBech32Address(
    accountInfo.bech32Address
  );
  useEffect(() => {
    setNativeToken(balanceQuery.balances[0]);
  }, []);
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
  const total = stakable.add(stakedSum).add(stakableReward);
  const language = useLanguage();
  const fiatCurrency = language.fiatCurrency;
  const tokens = queriesStore
    .get(current.chainId)
    .queryBalances.getQueryBech32Address(accountInfo.bech32Address)
    .unstakables.filter((bal) => {
      if (
        chainStore.current.features &&
        chainStore.current.features.includes("terra-classic-fee")
      ) {
        const denom = new DenomHelper(bal.currency.coinMinimalDenom);
        if (denom.type !== "native" || denom.denom.startsWith("ibc/")) {
          return false;
        }
        if (denom.type === "native") {
          return bal.balance.toDec().gt(new Dec("0"));
        }
      }

      return true;
    })
    .sort((a, b) => {
      const aDecIsZero = a.balance.toDec().isZero();
      const bDecIsZero = b.balance.toDec().isZero();

      if (aDecIsZero && !bDecIsZero) {
        return 1;
      }
      if (!aDecIsZero && bDecIsZero) {
        return -1;
      }

      return a.currency.coinDenom < b.currency.coinDenom ? -1 : 1;
    });

  const navigate = useNavigate();
  console.log("nativeToken", balanceQuery.balances);
  const notification = useNotification();
  const loadingIndicator = useLoadingIndicator();

  const convertToUsd = (currency: any) => {
    const value = priceStore.calculatePrice(currency, fiatCurrency);
    const inUsd = value && value.shrink(true).maxDecimals(6).toString();
    return inUsd;
  };
  const { numericPart: _totalNumber, denomPart: totalDenom } =
    separateNumericAndDenom(
      total.shrink(true).trim(true).maxDecimals(6).toString()
    );
  const totalPrice = priceStore.calculatePrice(total, fiatCurrency);
  return (
    <div className={styleToken["tokenContainnerInner"]}>
      <div>
        {isEvm ? (
          <Card
            subheadingStyle={{ fontSize: "14px", color: "rgb(128, 141, 160)" }}
            style={{ background: "rgba(255,255,255,0.1)", marginBottom: "8px" }}
            leftImage={
              nativeToken
                ? nativeToken.currency.coinGeckoId
                : totalDenom.toUpperCase()[0]
            }
            heading={totalDenom}
            subheading={total.shrink(true).trim(true).maxDecimals(6).toString()}
            rightContent={totalPrice && ` ${totalPrice.toString()} USD`}
            onClick={() => {
              navigate({
                pathname: "/asset",
                search: `?defaultDenom=${totalDenom}`,
              });
            }}
          />
        ) : (
          <Card
            subheadingStyle={{ fontSize: "14px", color: "rgb(128, 141, 160)" }}
            style={{ background: "rgba(255,255,255,0.1)", marginBottom: "8px" }}
            leftImage={
              nativeToken
                ? nativeToken.currency.coinGeckoId
                : totalDenom.toUpperCase()[0]
            }
            heading={totalDenom}
            subheading={total.shrink(true).trim(true).maxDecimals(6).toString()}
            onClick={() => {
              navigate({
                pathname: "/asset",
                search: `?defaultDenom=${totalDenom}`,
              });
            }}
            rightContent={
              totalPrice && (
                <div>
                  {totalPrice.toString()}{" "}
                  <span style={{ color: "rgba(255,255,255,0.6" }}>USD</span>{" "}
                </div>
              )
            }
          />
        )}

        {tokens.map((token) => {
          const error = token.error;
          const validSelector = Buffer.from(
            Hash.sha256(Buffer.from(token.balance.currency.coinMinimalDenom))
          )
            .toString("hex")
            .replace(/\d+/g, "")
            .slice(0, 20);
          const createViewingKey = async (): Promise<string | undefined> => {
            if (
              "type" in token.balance.currency &&
              token.balance.currency.type === "secret20"
            ) {
              const contractAddress = token.balance.currency.contractAddress;
              return new Promise((resolve) => {
                accountInfo.secret
                  .createSecret20ViewingKey(
                    contractAddress,
                    "",
                    {},
                    {},
                    (_, viewingKey) => {
                      loadingIndicator.setIsLoading(
                        "create-veiwing-key",
                        false
                      );

                      resolve(viewingKey);
                    }
                  )
                  .then(() => {
                    loadingIndicator.setIsLoading("create-veiwing-key", true);
                  });
              });
            }
          };
          const tokenInfo = token.balance.currency;
          const amountInNumber =
            parseFloat(
              token.balance.maxDecimals(6).hideDenom(false).toString()
            ) *
            10 ** token.currency.coinDecimals;

          const inputValue = new CoinPretty(
            tokenInfo,
            new Int(tokenInfo ? amountInNumber : 0)
          );
          const tokenInUsd = convertToUsd(inputValue);
          console.log("aaaaa", tokenInfo.coinImageUrl);
          return (
            <React.Fragment key={token.currency.coinDenom}>
              <Card
                leftImage={
                  tokenInfo.coinImageUrl
                    ? tokenInfo.coinImageUrl
                    : tokenInfo.coinDenom[0].toUpperCase()
                }
                heading={
                  <ToolTip
                    trigger="hover"
                    tooltip={tokenInfo.coinDenom.toUpperCase()}
                  >
                    {formatTokenName(tokenInfo.coinDenom.toUpperCase())}
                  </ToolTip>
                }
                subheading={
                  token.isFetching ? (
                    <i className="fas fa-spinner fa-spin ml-1" />
                  ) : (
                    token.balance.maxDecimals(6).hideDenom(false).toString()
                  )
                }
                subheadingStyle={{ fontSize: "14px", color: "#808da0" }}
                rightContent={tokenInUsd ? tokenInUsd : ""}
                style={{
                  background: "rgba(255, 255, 255, 0.12)",
                  height: "78px",
                  marginBottom: "6px",
                  padding: "18px",
                }}
                onClick={() => {
                  navigate({
                    pathname: "/send",
                    search: `?defaultDenom=${token.currency.coinMinimalDenom}`,
                  });
                }}
              />
              {error ? (
                <div style={{ paddingRight: "10px" }}>
                  <i
                    className="fas fa-exclamation-circle text-danger"
                    id={validSelector}
                  />
                  <UncontrolledTooltip target={validSelector}>
                    {error.message}
                  </UncontrolledTooltip>
                </div>
              ) : null}
              {error?.data && error.data instanceof WrongViewingKeyError ? (
                <div
                  style={{ paddingRight: "10px" }}
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (
                      "type" in token.balance.currency &&
                      token.balance.currency.type === "secret20"
                    ) {
                      const viewingKey = await createViewingKey();
                      if (!viewingKey) {
                        notification.push({
                          placement: "top-center",
                          type: "danger",
                          duration: 2,
                          content: "Failed to create the viewing key",
                          canDelete: true,
                          transition: {
                            duration: 0.25,
                          },
                        });
                        return;
                      }
                      const tokenOf = tokensStore.getTokensOf(current.chainId);
                      await tokenOf.addToken({
                        ...token.balance.currency,
                        viewingKey,
                      });
                      navigate({
                        pathname: "/",
                      });
                    }
                  }}
                >
                  {accountInfo.isSendingMsg === "createSecret20ViewingKey" ? (
                    <i className="fa fa-spinner fa-spin fa-fw" />
                  ) : (
                    <i className="fas fa-wrench" />
                  )}
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
});
