import React, { useState } from "react";
import style from "./style.module.scss";
import { useStore } from "../../../stores";
import { useHistory } from "react-router";
import { mintDomain } from "../../../name-service/fns-apis";
import { AppCurrency } from "@keplr-wallet/types";
import { TooltipForDomainNames } from "./index";
import { useNotification } from "@components/notification";
import { useLanguage } from "../../../languages";
import { CoinPretty } from "@keplr-wallet/unit";
import { shortenNumber } from "../../activity/native/activity-row";
type MintProps = {
  domainPrice: any;
  domainName: string;
  setError: (value: boolean) => void;
  setShowCard: (value: boolean) => void;
};

export const Mint: React.FC<MintProps> = ({ domainPrice, domainName }) => {
  const { chainStore, accountStore, priceStore } = useStore();
  const current = chainStore.current;
  const account = accountStore.getAccount(current.chainId);
  const history = useHistory();
  const language = useLanguage();
  const fiatCurrency = language.fiatCurrency;
  const notification = useNotification();

  const [showPopUp, setShowPopUp] = useState(false);
  const [mintingPrice, setmintingPrice] = useState("");

  const getAmount = ({ amount, denom }: { denom: string; amount: string }) => {
    const amountCurrency = chainStore.current.currencies.find(
      (currency: AppCurrency) => currency.coinMinimalDenom === denom
    );

    if (amountCurrency) {
      const amountCoin = new CoinPretty(amountCurrency, amount);
      const amountPrice = priceStore.calculatePrice(amountCoin, fiatCurrency);

      if (amountPrice)
        return `${amountCoin
          .shrink(true)
          .trim(true)
          .maxDecimals(6)
          .toString()} (${amountPrice?.toString()})`;
      else {
        const amountValue = shortenNumber(amount, amountCurrency?.coinDecimals);
        return `${amountValue}${amountCurrency.coinDenom}`;
      }
    } else return `${amount} ${denom}`;
  };

  const handleMintButtonClick = async () => {
    if (domainPrice.result.Success) {
      const priceDenom = domainPrice.result.Success.pricing;
      const amount = getAmount(priceDenom);
      setmintingPrice(amount);
    } else {
      setmintingPrice("Not Available");
    }

    setShowPopUp(true);
  };

  const handleContinueButtonClick = async () => {
    try {
      await mintDomain(
        current.chainId,
        account,
        domainName,
        domainPrice.result.Success.pricing
      );
      notification.push({
        placement: "top-center",
        type: "primary",
        duration: 2,
        content: `transaction braodcasted!`,
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
    } catch (error) {
      console.error("Error minting domain:", error);
      notification.push({
        placement: "top-center",
        type: "warning",
        duration: 2,
        content: `transaction failed!`,
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
    }
    history.push("/fetch-name-service");
  };

  const handleCancelButtonClick = () => {
    setShowPopUp(false);
  };

  return (
    <React.Fragment>
      <div className={style.buttonGroup}>
        <button
          className={style.mint}
          color="primary"
          onClick={handleMintButtonClick}
        >
          MINT
          <span style={{ color: "purple" }}>
            <TooltipForDomainNames domainName={domainName} />
          </span>
        </button>
      </div>

      {showPopUp && (
        <div className={style.popupCard}>
          <div
            style={{
              display: "flex",
              textAlign: "center",
              flexDirection: "column",
              gap: "5px",
            }}
          >
            <div>Price of minting is </div>
            {mintingPrice}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={handleContinueButtonClick}
                disabled={mintingPrice === "Not Available"}
              >
                Continue
              </button>
              <button onClick={handleCancelButtonClick}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};
