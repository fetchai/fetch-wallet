import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const SortIcon: FunctionComponent<{
  size?: number;
  color?: string;
}> = ({ size = 12, color = "white" }) => {
  return (
    <Svg
      width={size}
      height={size}
      color={color}
      viewBox="0 0 9 11"
      style={{
        width: size,
        height: size,
      }}
      fill="none"
    >
      <Path
        d="M4.21094 0.484375C4.49219 0.179688 4.98438 0.179688 5.26562 0.484375L8.26562 3.48438C8.47656 3.69531 8.54688 4.02344 8.42969 4.30469C8.3125 4.58594 8.05469 4.77344 7.75 4.77344H1.75C1.44531 4.77344 1.16406 4.58594 1.04688 4.30469C0.929688 4.02344 1 3.69531 1.21094 3.48438L4.21094 0.484375ZM4.21094 10.5391L1.21094 7.53906C1 7.32812 0.929688 7 1.04688 6.71875C1.16406 6.4375 1.44531 6.25 1.75 6.25H7.75C8.03125 6.25 8.3125 6.4375 8.42969 6.71875C8.54688 7 8.47656 7.32812 8.26562 7.53906L5.26562 10.5391C4.98438 10.8438 4.49219 10.8438 4.21094 10.5391Z"
        fill={color}
      />
    </Svg>
  );
};
