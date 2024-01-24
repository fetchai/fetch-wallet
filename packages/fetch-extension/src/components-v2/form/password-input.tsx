import React, { forwardRef, useRef, useState } from "react";
import { Input, InputProps } from "./input";
import stylePasswordInput from "./password-input.module.scss";
import { Tooltip } from "reactstrap";
import { FormattedMessage } from "react-intl";

// eslint-disable-next-line react/display-name
export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<
    InputProps & React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "onKeyUp" | "onKeyDown"
  >
>((props, ref) => {
  const otherRef = useRef<HTMLInputElement | null>(null);

  const [isOnCapsLock, setIsOnCapsLock] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <React.Fragment>
      <div className={stylePasswordInput["text"]}>Password</div>
      <div className={stylePasswordInput["password-input-container"]}>
        <Input
          style={{
            width: "285px",
            margin: "none",
            display: "flex",
            top: "12px",
          }}
          className={stylePasswordInput["input"]}
          {...props}
          type={isPasswordVisible ? "text" : "password"}
          ref={(argRef) => {
            otherRef.current = argRef;
            if (ref) {
              if ("current" in ref) {
                ref.current = argRef;
              } else {
                ref(argRef);
              }
            }
          }}
          onKeyUp={(e) => {
            if (e.getModifierState("CapsLock")) {
              setIsOnCapsLock(true);
            } else {
              setIsOnCapsLock(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.getModifierState("CapsLock")) {
              setIsOnCapsLock(true);
            } else {
              setIsOnCapsLock(false);
            }
          }}
        />
        <img
          className={stylePasswordInput["eye"]}
          src={
            isPasswordVisible
              ? require("@assets/svg/wireframe/eye-2.svg")
              : require("@assets/svg/wireframe/eye.svg")
          }
          alt=""
          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
        />
      </div>
      {otherRef.current && (
        <Tooltip
          arrowClassName={stylePasswordInput["capslockTooltipArrow"]}
          placement="top-start"
          isOpen={isOnCapsLock}
          target={otherRef.current}
          fade
        >
          <FormattedMessage id="lock.alert.capslock" />
        </Tooltip>
      )}
    </React.Fragment>
  );
});
