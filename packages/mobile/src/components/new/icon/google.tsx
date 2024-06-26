import React, { FunctionComponent } from "react";
import { Svg, Path, Rect, G, Defs, ClipPath } from "react-native-svg";

export const GoogleIcon: FunctionComponent<{
  width?: number;
  height?: number;
}> = ({ width = 32, height = 32 }) => {
  return (
    <Svg
      viewBox="0 0 32 32"
      style={{
        width,
        height,
      }}
    >
      <Rect width="32" height="32" rx="16" fill="white" />
      <G clipPath="url(#clip0_1117_6478)">
        <Path
          d="M22.1598 16.146C22.1598 15.691 22.119 15.2535 22.0432 14.8335H15.9998V17.3185H19.4532C19.3015 18.1177 18.8465 18.7943 18.164 19.2493V20.8652H20.2465C21.4598 19.7452 22.1598 18.1002 22.1598 16.146Z"
          fill="#4285F4"
        />
        <Path
          d="M15.9997 22.4168C17.7322 22.4168 19.1847 21.8451 20.2463 20.8651L18.1638 19.2493C17.5922 19.6343 16.863 19.8676 15.9997 19.8676C14.3313 19.8676 12.9138 18.7418 12.4063 17.2251H10.2713V18.8818C11.3272 20.9759 13.4913 22.4168 15.9997 22.4168Z"
          fill="#34A853"
        />
        <Path
          d="M12.4065 17.2193C12.2782 16.8343 12.2023 16.4259 12.2023 16.0001C12.2023 15.5743 12.2782 15.1659 12.4065 14.7809V13.1243H10.2715C9.83399 13.9876 9.58316 14.9618 9.58316 16.0001C9.58316 17.0384 9.83399 18.0126 10.2715 18.8759L11.934 17.5809L12.4065 17.2193Z"
          fill="#FBBC05"
        />
        <Path
          d="M15.9997 12.1385C16.9447 12.1385 17.7847 12.4652 18.4555 13.0952L20.293 11.2577C19.1788 10.2193 17.7322 9.5835 15.9997 9.5835C13.4913 9.5835 11.3272 11.0243 10.2713 13.1243L12.4063 14.781C12.9138 13.2643 14.3313 12.1385 15.9997 12.1385Z"
          fill="#EA4335"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_1117_6478">
          <Rect
            width="14"
            height="14"
            fill="white"
            transform="translate(9 9)"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
