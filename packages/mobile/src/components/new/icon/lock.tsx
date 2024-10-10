import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const LockIcon: FunctionComponent<{
  size?: number;
  color?: string;
}> = ({ size = 11, color = "white" }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 11 12"
      style={{
        width: size,
        height: size,
      }}
      fill="none"
    >
      <Path
        d="M3.375 3V4.5H7.125V3C7.125 1.96875 6.28125 1.125 5.25 1.125C4.19531 1.125 3.375 1.96875 3.375 3ZM2.25 4.5V3C2.25 1.35938 3.58594 0 5.25 0C6.89062 0 8.25 1.35938 8.25 3V4.5H9C9.82031 4.5 10.5 5.17969 10.5 6V10.5C10.5 11.3438 9.82031 12 9 12H1.5C0.65625 12 0 11.3438 0 10.5V6C0 5.17969 0.65625 4.5 1.5 4.5H2.25ZM1.125 6V10.5C1.125 10.7109 1.28906 10.875 1.5 10.875H9C9.1875 10.875 9.375 10.7109 9.375 10.5V6C9.375 5.8125 9.1875 5.625 9 5.625H1.5C1.28906 5.625 1.125 5.8125 1.125 6Z"
        fill={color}
      />
    </Svg>
  );
};
