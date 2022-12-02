import classnames from "classnames";
import React, { useEffect, useState } from "react";
import { Container } from "reactstrap";
import deliveredIcon from "../../public/assets/icon/delivered.png";
import seenIcon from "../../public/assets/icon/seenStatus.png";
import { decryptMessage } from "../../utils/decrypt-message";
import style from "./style.module.scss";
import { isToday, isYesterday, format } from "date-fns";

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return format(date, "p");
};

export const ChatMessage = ({
  chainId,
  message,
  isSender,
  timestamp,
  showDate,
  lastTimeStamp,
}: {
  chainId: string;
  isSender: boolean;
  message: string;
  timestamp: number;
  showDate: boolean;
  lastTimeStamp: string | undefined | null;
}) => {
  const [decryptedMessage, setDecryptedMessage] = useState("");

  useEffect(() => {
    decryptMessage(chainId, message, isSender)
      .then((message) => {
        setDecryptedMessage(message);
      })
      .catch((e) => {
        setDecryptedMessage(e.message);
      });
  }, [chainId, isSender, message]);

  const getDate = (timestamp: number): string => {
    const d = new Date(timestamp);
    if (isToday(d)) {
      return "Today";
    }
    if (isYesterday(d)) {
      return "Yesterday";
    }
    return format(d, "dd MMMM yyyy");
  };

  return (
    <>
      <div className={style.currentDateContainer}>
        {" "}
        {showDate ? (
          <span className={style.currentDate}>{getDate(timestamp)}</span>
        ) : null}
      </div>
      <div className={isSender ? style.senderAlign : style.receiverAlign}>
        <Container
          fluid
          className={classnames(style.messageBox, {
            [style.senderBox]: isSender,
          })}
        >
          {!decryptedMessage ? (
            <i className="fas fa-spinner fa-spin ml-1" />
          ) : (
            <div className={style.message}>{decryptedMessage}</div>
          )}
          <div className={style.timestamp}>
            {formatTime(timestamp)}
            {console.log(isSender)}
            {isSender &&
              (!lastTimeStamp || !(Number(lastTimeStamp) > timestamp)) && (
                <img alt="seen" src={seenIcon} />
              )}
            {/* {isSender && <div>seen</div>} */}
            {isSender && Number(lastTimeStamp) > timestamp && (
              <img alt="delivered" src={deliveredIcon} />
            )}
            {/* {isSender && <img alt="delivered Icon" src={deliveredIcon} />} */}
          </div>
        </Container>
      </div>
    </>
  );
};
