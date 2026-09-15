import { useScale } from "@/components/autoElementScaling";
import React, { useState } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import AutoScalingText from "./autoScalingText";

const FlipCard = ({ frontSide, backSide, fColor, bColor, demo }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  const [isFlipped, setIsFlipped] = useState(false);
  const { scaleElement } = useScale();

  React.useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: isFlipped ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [isFlipped]);

  function determineTextSize(textt){
    if(textt.length <= 35){//symbiotic symbiotic symbiotic symbF
      return scaleElement(18)
    }
    if (textt.length > 35 && textt.length < 70){
      return scaleElement(16);
    }
    if(textt.length >= 130){//symbiotic symbiotic symbiotic symbiotic symbiotic symbiotic symbiotic symbiotic symbioticF
      return scaleElement(11)
    }
    if(textt.length >= 70){//symbiotic symbiotic symbiotic symbiotic symbiotic symbiotic symbioticF
      return scaleElement(14)
    }
  }

  const flipToFrontStyle = {
    transform: [
      {
        rotateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
    zIndex: isFlipped ? 0 : 1,
  };

  const flipToBackStyle = {
    transform: [
      {
        rotateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['180deg', '360deg'],
        }),
      },
    ],
    zIndex: isFlipped ? 1 : 0,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  };

  return (
    <TouchableWithoutFeedback onPress={()=>setIsFlipped(!isFlipped)}>
      <View style={{ width: "98%", marginBottom: 8 }}>
        <Animated.View style={[styles.card, { backgroundColor: fColor }, flipToFrontStyle]}>
          <AutoScalingText 
          ellipsizeMode="tail"
          numberOfLines={13}
          style={{ fontWeight:600, fontSize: determineTextSize(frontSide)}}>
            {frontSide}{/* {" ("+frontSide.length+")"} */}</AutoScalingText>
        </Animated.View>
        <Animated.View style={[styles.card, { backgroundColor: bColor, borderWidth: 3, borderColor: fColor, borderStyle: "dashed" }, flipToBackStyle]}>
          <AutoScalingText 
          ellipsizeMode="tail" 
          numberOfLines={13}
          style={{fontWeight:600, color:"white", fontSize: determineTextSize(backSide)}}>
          {backSide}{/* {" ("+backSide.length+")"} */}</AutoScalingText>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
    width: '100%',
    backfaceVisibility: 'hidden',
    position: 'relative',
    padding: 8,
  },
});

export default FlipCard;
