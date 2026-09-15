import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing, Text } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const Notif = ({
  message = "Sample Text",
  duration = 6000, // total travel time
}) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current; // start off-screen at bottom
  const [notifH, setNotifH] = useState(0);

  useEffect(() => {
    if (!notifH) return;
    Animated.timing(translateY, {
      toValue: -notifH, // end off-screen at top
      duration,
      easing: Easing.in(Easing.linear),
      useNativeDriver: true,
    }).start();
  }, [notifH, duration, translateY]);

  return (
    <Animated.View
      // measure height so we can travel fully past the top
      onLayout={(e) => setNotifH(e.nativeEvent.layout.height)}
      // absolute at top; translate controls vertical travel
      style={{
        position: "absolute",
        zIndex: 0,
        top: 0,
        left: 0,
        right: 0,
        transform: [{ translateY }],
        alignItems: "center",
        pointerEvents: "none", // touches pass through
      }}
      className="p-4 max-w-[50%] rounded-3xl bg-teal-300"
    >
      <Text className="font-bold">{message}</Text>
    </Animated.View>
  );
};

export default Notif;
