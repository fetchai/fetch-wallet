import React, { FunctionComponent, useEffect } from "react";
import { Animated } from "react-native";

export const SlideDownAnimation: FunctionComponent = (props) => {
  const animated = new Animated.Value(-20);
  const duration = 500;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(animated, {
        toValue: 0,
        duration: duration,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          transform: [{ translateY: animated }],
        },
      ]}
    >
      {props.children}
    </Animated.View>
  );
};
