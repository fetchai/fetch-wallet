import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const GuideIcon: FunctionComponent<{
  size?: number;
  color?: string;
}> = ({ size = 16, color = "white" }) => {
  return (
    <Svg
      width={size}
      height={size}
      color={color}
      viewBox="0 0 12 15"
      style={{
        width: size,
        height: size,
      }}
      fill="none"
    >
      <Path
        d="M9.5 13.4375C9.71875 13.4375 9.9375 13.2461 9.9375 13V5.125H7.75C7.25781 5.125 6.875 4.74219 6.875 4.25V2.0625H2.5C2.25391 2.0625 2.0625 2.28125 2.0625 2.5V13C2.0625 13.2461 2.25391 13.4375 2.5 13.4375H9.5ZM0.75 2.5C0.75 1.54297 1.51562 0.75 2.5 0.75H7.01172C7.47656 0.75 7.91406 0.941406 8.24219 1.26953L10.7305 3.75781C11.0586 4.08594 11.25 4.52344 11.25 4.98828V13C11.25 13.9844 10.457 14.75 9.5 14.75H2.5C1.51562 14.75 0.75 13.9844 0.75 13V2.5Z"
        fill={color}
      />
    </Svg>
  );
};
