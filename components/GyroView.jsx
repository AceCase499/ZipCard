/* import { DeviceMotion } from 'expo-sensors';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const GyroView = ({ children }) => {
  const [rotation, setRotation] = useState({ alpha: 0, beta: 0, gamma: 0 });

  useEffect(() => {
    DeviceMotion.setUpdateInterval(100);

    const subscription = DeviceMotion.addListener(({ rotation }) => {
      setRotation(rotation || { alpha: 0, beta: 0, gamma: 0 });
    });

    return () => subscription.remove();
  }, []);

  // Clamp and swap axes to correct orientation
  const maxAngle = 60;
  const rotateX = `${clamp(-rotation.beta * (180 / Math.PI), -maxAngle, maxAngle)}deg`; // invert gamma for X
  const rotateY = `${clamp(rotation.gamma * (180 / Math.PI), -maxAngle, maxAngle)}deg`;   // beta for Y
  const rotateZ = `${rotation.alpha ? rotation.alpha * (Math.PI) : 0}deg`;

  return (
    <View
      style={[
        styles.container,
        {
          transform: [
            { rotateX },
            { rotateY },
            { rotateZ },
          ],
        },
      ]}
    >
      {children}
      <Text>alpha (z): {rotation.alpha?.toFixed(2)}</Text>
      <Text>beta (x): {rotation.beta?.toFixed(2)}</Text>
      <Text>gamma (y): {rotation.gamma?.toFixed(2)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GyroView;
 */
import React from 'react'
import { View } from 'react-native'

const GyroView = () => {
  return (
    <View>GyroView</View>
  )
}

export default GyroView