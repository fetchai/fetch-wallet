import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const AutoLockTimer: FunctionComponent<{
  size?: number;
  color?: any;
}> = ({ size = 24, color = "white" }) => {
  return (
    <Svg
      width={size}
      height={size}
      color={color}
      viewBox="0 0 24 24"
      style={{
        width: size,
        height: size,
      }}
      fill="none"
    >
      <Path
        d="M12 4.75C15.8555 4.75 19 7.89453 19 11.75C19 15.6328 15.8555 18.75 12 18.75C8.11719 18.75 5 15.6328 5 11.75C5 10.3008 5.4375 8.96094 6.20312 7.83984C6.39453 7.53906 6.80469 7.45703 7.10547 7.64844C7.40625 7.86719 7.48828 8.27734 7.26953 8.57812C6.66797 9.48047 6.3125 10.5742 6.3125 11.75C6.3125 14.8945 8.85547 17.4375 12 17.4375C15.1172 17.4375 17.6875 14.8945 17.6875 11.75C17.6875 8.85156 15.4727 6.44531 12.6562 6.11719V7.59375C12.6562 7.97656 12.3555 8.25 12 8.25C11.6172 8.25 11.3438 7.97656 11.3438 7.59375V5.40625C11.3438 5.05078 11.6172 4.75 12 4.75ZM10.2773 9.09766L12.4648 11.2852C12.7109 11.5586 12.7109 11.9688 12.4648 12.2148C12.1914 12.4883 11.7812 12.4883 11.5352 12.2148L9.34766 10.0273C9.07422 9.78125 9.07422 9.37109 9.34766 9.09766C9.59375 8.85156 10.0039 8.85156 10.2773 9.09766Z"
        fill={color}
      />
    </Svg>
  );
};
