import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const FileIcon: FunctionComponent<{
  size?: number;
  color?: string;
}> = ({ size = 16, color = "white" }) => {
  return (
    <Svg
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
      }}
      viewBox="0 0 12 16"
      fill="none"
    >
      <Path
        d="M1.5 14C1.5 14.2812 1.71875 14.5 2 14.5H10C10.25 14.5 10.5 14.2812 10.5 14V5H8C7.4375 5 7 4.5625 7 4V1.5H2C1.71875 1.5 1.5 1.75 1.5 2V14ZM2 0H7.15625C7.6875 0 8.1875 0.21875 8.5625 0.59375L11.4062 3.4375C11.7812 3.8125 12 4.3125 12 4.84375V14C12 15.125 11.0938 16 10 16H2C0.875 16 0 15.125 0 14V2C0 0.90625 0.875 0 2 0ZM3 3H5.5C5.75 3 6 3.25 6 3.5C6 3.78125 5.75 4 5.5 4H3C2.71875 4 2.5 3.78125 2.5 3.5C2.5 3.25 2.71875 3 3 3ZM3 5H5.5C5.75 5 6 5.25 6 5.5C6 5.78125 5.75 6 5.5 6H3C2.71875 6 2.5 5.78125 2.5 5.5C2.5 5.25 2.71875 5 3 5ZM4.6875 11.9375C4.5 12.5938 3.90625 13 3.25 13H3C2.71875 13 2.5 12.7812 2.5 12.5C2.5 12.25 2.71875 12 3 12H3.25C3.46875 12 3.65625 11.875 3.71875 11.6562L4.1875 10.125C4.28125 9.75 4.625 9.5 5 9.5C5.34375 9.5 5.6875 9.75 5.78125 10.0938L6.125 11.2812C6.34375 11.0938 6.59375 11 6.875 11C7.28125 11 7.65625 11.25 7.84375 11.625L8.03125 12H9C9.25 12 9.5 12.25 9.5 12.5C9.5 12.7812 9.25 13 9 13H7.75C7.5625 13 7.375 12.9062 7.28125 12.75L6.96875 12.0625C6.9375 12.0312 6.90625 12 6.875 12C6.8125 12 6.78125 12.0312 6.75 12.0625L6.4375 12.75C6.34375 12.9062 6.15625 13.0312 5.9375 13C5.75 13 5.5625 12.8438 5.5 12.6562L5 10.9062L4.6875 11.9375Z"
        fill={color}
      />
    </Svg>
  );
};
