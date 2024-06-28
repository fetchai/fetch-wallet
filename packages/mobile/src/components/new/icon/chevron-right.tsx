import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const ChevronRightIcon: FunctionComponent<{
  size?: number;
  color?: string;
}> = ({ size = 14, color = "white" }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 8 13"
      style={{
        width: size,
        height: size,
      }}
      fill="none"
    >
      <Path
        opacity="0.6"
        d="M7.10156 5.64844C7.45703 5.97656 7.45703 6.55078 7.10156 6.87891L1.85156 12.1289C1.52344 12.4844 0.949219 12.4844 0.621094 12.1289C0.265625 11.8008 0.265625 11.2266 0.621094 10.8984L5.24219 6.25L0.621094 1.62891C0.265625 1.30078 0.265625 0.726562 0.621094 0.398438C0.949219 0.0429688 1.52344 0.0429688 1.85156 0.398438L7.10156 5.64844Z"
        fill={color}
      />
    </Svg>
  );
};
