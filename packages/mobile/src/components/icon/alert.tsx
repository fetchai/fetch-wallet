import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const AlertIcon: FunctionComponent<{
  size?: number;
  color?: string;
}> = ({ size = 24, color = "white" }) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 100 100">
      <Path
        stroke={color}
        strokeMiterlimit="10"
        strokeWidth="6.25"
        d="M87.5 50c0-20.703-16.797-37.5-37.5-37.5S12.5 29.297 12.5 50 29.297 87.5 50 87.5 87.5 70.703 87.5 50z"
      />
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4.167"
        d="M48.62 30.329l1.12 23.828 1.12-23.818a1.12 1.12 0 00-1.131-1.172v0a1.12 1.12 0 00-1.11 1.162v0z"
      />
      <Path
        fill={color}
        d="M49.74 69.754a3.906 3.906 0 110-7.812 3.906 3.906 0 010 7.812z"
      />
    </Svg>
  );
};
