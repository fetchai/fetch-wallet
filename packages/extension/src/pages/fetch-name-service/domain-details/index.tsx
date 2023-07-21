import domainImage from "@assets/icon/domain-image.png";
import { HeaderLayout } from "../../../new-layouts";
import React, { useEffect, useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { formatDomain } from "@utils/format";
import {
  getDomainData,
  getDomainPrice,
  getDomainStatus,
} from "../../../name-service/fns-apis";
import { useStore } from "../../../stores";
import { BuyOrBid } from "./buy-or-bid";
import { Mint } from "./mint";
import style from "./style.module.scss";
import { Update } from "./update";
import { FNS_CONFIG } from "../../../config.ui.var";
import { ToolTip } from "@components/tooltip";

export const TooltipForDomainNames = ({
  domainName,
}: {
  domainName: string;
}) => {
  return domainName.length >= 15 ? (
    <ToolTip
      tooltip={(() => {
        return domainName;
      })()}
      trigger="hover"
      options={{
        placement: "top",
      }}
    >
      <div>{formatDomain(domainName)}</div>
    </ToolTip>
  ) : (
    <div>{formatDomain(domainName)}</div>
  );
};

export const DomainDetails = () => {
  const match = useRouteMatch<{ domain: string }>();
  const history = useHistory();
  const domainName = match.params.domain;
  const { accountStore, chainStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const sender = accountInfo.bech32Address;

  const [domainData, setDomainData] = useState<any>({});
  const [domainPrice, setDomainPrice] = useState<any>(null);
  const [isMinted, setIsMinted] = useState<any>(null);
  const [isOwned, setIsOwned] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    const fetchDomainData = async () => {
      try {
        setIsLoading(true);
        const fetchedDomainData = await getDomainData(
          current.chainId,
          domainName
        );
        setDomainData(fetchedDomainData.domain_data || {});
        const isDomainMinted = await getDomainStatus(
          current.chainId,
          domainName
        );
        const fetchDomainPrice = await getDomainPrice(
          current.chainId,
          domainName
        );
        setDomainPrice(fetchDomainPrice);
        const domainStatus = isDomainMinted?.domain_status;
        if (domainStatus) {
          if (
            typeof domainStatus === "object" &&
            domainStatus.Owned.owner === sender
          ) {
            setIsMinted(true);
            setIsOwned(true);
          } else if (
            typeof domainStatus === "object" &&
            domainStatus.Owned.owner !== sender
          ) {
            setIsMinted(true);
            setIsOwned(false);
          } else if (
            typeof domainStatus === "string" &&
            domainStatus === "Available"
          ) {
            setIsMinted(false);
            setIsOwned(false);
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching domain data:", error);
      }
    };

    fetchDomainData();
  }, [domainName]);

  const properties = [
    "address",
    "email",
    "github",
    "website",
    "twitter",
    "background",
  ];

  const handleCancelClick = () => {
    setShowCard(false);
  };

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={formatDomain(domainName)}
      onBackButton={() => {
        history.goBack();
      }}
      rightRenderer={
        <a
          href={`https://www.fetns.domains/domains/${domainName}`}
          target="_blank"
          rel="noreferrer"
        >
          <i className="fas fa-external-link-alt" style={{ color: "white" }} />
        </a>
      }
      showBottomMenu={true}
    >
      <div style={{ fontFamily: "monospace" }}>
        <div className={style.header}>PROPERTIES</div>

        {isLoading ? (
          <div className={style.loader}>
            Loading Domain Info <i className="fas fa-spinner fa-spin ml-2" />
          </div>
        ) : (
          <React.Fragment>
            <div className={style.domainIntro}>
              <img
                style={{ height: "130px" }}
                src={domainData.background || domainImage}
                alt="Domain Image"
              />
              {!domainData.background && (
                <div className={style.imageText}>
                  <TooltipForDomainNames domainName={domainName} />
                </div>
              )}

              <div className={style.availability}>
                {isMinted ? (isOwned ? "OWNED" : "BUY") : "AVAILABLE"}
              </div>
              <div className={style.description}>
                {domainData?.description || "Description hasn't been set"}
              </div>
            </div>
            <div className={style.domainInfoGroup}>
              {Object.keys(domainData)
                .filter((key: string) => properties.includes(key))
                .map((property) => (
                  <div className={style.domainInfo} key={property}>
                    <div className={style.keys}>{property}</div>
                    <input
                      disabled={
                        !isOwned || !FNS_CONFIG[current.chainId].isEditable
                      }
                      className={style.values}
                      value={domainData[property]}
                      onDragStart={(e) => e.preventDefault()}
                      placeholder="Not Set"
                      onChange={(e) => {
                        setDomainData({
                          ...domainData,
                          [property]: e.target.value,
                        });
                      }}
                    />
                  </div>
                ))}
            </div>

            {!isLoading &&
              (isOwned ? (
                <Update
                  domainName={domainName}
                  domainPrice={domainPrice}
                  domainData={domainData}
                />
              ) : isMinted ? (
                <BuyOrBid domainName={domainName} />
              ) : (
                <Mint
                  domainPrice={domainPrice}
                  domainName={domainName}
                  setError={setError}
                  setShowCard={setShowCard}
                />
              ))}
          </React.Fragment>
        )}
      </div>

      {showCard && error && (
        <React.Fragment>
          <div
            className={style.errorCard}
            onClick={() => handleCancelClick()}
          />
          <div className={style.popupCard}>
            <div className={style.errorText}>
              <h3 style={{ color: "white" }}>Transaction Failed!</h3>
            </div>
            <button type="button" onClick={() => handleCancelClick()}>
              cancel
            </button>
          </div>
        </React.Fragment>
      )}
    </HeaderLayout>
  );
};
