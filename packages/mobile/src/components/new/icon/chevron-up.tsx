import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const ChevronUpIcon: FunctionComponent<{
  size?: number;
  color?: string;
}> = ({ size = 14, color = "white" }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 12 7"
      style={{
        width: size,
        height: size,
      }}
      fill="none"
    >
      <Path
        d="M5.60156 0.601562C5.8125 0.390625 6.16406 0.390625 6.375 0.601562L10.8984 5.10156C11.1094 5.33594 11.1094 5.6875 10.8984 5.89844C10.6641 6.13281 10.3125 6.13281 10.1016 5.89844L6 1.79688L1.89844 5.89844C1.66406 6.13281 1.3125 6.13281 1.10156 5.89844C0.867188 5.6875 0.867188 5.33594 1.10156 5.125L5.60156 0.601562Z"
        fill={color}
      />
    </Svg>
  );
};
