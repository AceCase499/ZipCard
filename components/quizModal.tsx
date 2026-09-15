import Quizzard from "@/assets/images/QuizMaster.png";
import { useScale } from "@/components/autoElementScaling";
import { getDrClaimStatus } from "@/components/IAP";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Modal,
  ModalProps,
  TouchableOpacity,
  View
} from "react-native";
import Animated from "react-native-reanimated";
import AutoScalingText from "./autoScalingText";

type PROPS = ModalProps & {
  isOpen: boolean;
  closeAction: Function;
  navAction: Function;
};

export const QuizModal = ({
  isOpen,
  closeAction,
  navAction,
  ...rest
}: PROPS) => {
  const [drClaimed, setDrClaimed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  const { scaleElement } = useScale();

  useFocusEffect(
    useCallback(() => {
      (async () => {
        let temp = await getDrClaimStatus();
        setDrClaimed(temp);
        updateTimeLeft();
      })();
    }, []),
  );

  // Calculate time left until midnight
  const updateTimeLeft = () => {
    const now = new Date();
    const midnight = new Date();

    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();

    if (diff <= 0) {
      // it's a new day → reset
      setDrClaimed(false);
      setTimeLeft("");
      return;
    }
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    setTimeLeft(`${hours}hrs, ${minutes}min`);
  };

  function handleClose() {
    closeAction();
  }
  function handleNav() {
    navAction();
  }

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      {...rest}>
      <TouchableOpacity
        style={{ backgroundColor: "#001aff48", width: "100%", height: "100%" }}
        onPress={handleClose}
      />
      <View
        style={{
          position: "absolute",
          left: "3%",
          top: "15%",
          zIndex: 1,
          width: "95%",
          height: "70%",
          backgroundColor: "white",
          borderRadius: 40,
        }}>
      <TouchableOpacity
        onPress={handleClose}
        hitSlop={45}
        style={{
          width:"30%",
          position:"absolute",
          zIndex:5,
        }}>
        <AutoScalingText baseSize={35}>
          ←</AutoScalingText>
      </TouchableOpacity>

      <AutoScalingText baseSize={22}
          style={
            drClaimed == false
              ? {
                  textAlign: "center",
                  fontWeight: "bold",
                  marginTop: 5,
                  color: "blue",
                }
              : {
                  textAlign: "center",
                  fontWeight: "bold",
                  marginTop: 5,
                  color: "green",
                  shadowOpacity: 0.8,
                  shadowColor: "#ffd500ff",
                }
          }>
          {drClaimed == false ? `Free Quiz` : `Paid Quiz`}
        </AutoScalingText>

        <Animated.Image
          source={Quizzard}
          resizeMode="contain"
          style={{
            animationName: { "50%": { transform: [{ translateY: 20 }] } },
            animationIterationCount: "infinite",
            animationDuration: "2s",
            animationTimingFunction: "ease-in-out",
            height: scaleElement(130),
            width: scaleElement(130),
            alignSelf:"center",
            zIndex:3,

          }}>
        </Animated.Image>
        {/* <ImageBackground
        source={Decor}
        pointerEvents="none"
        resizeMode="contain"
        imageStyle={{ opacity: 0.3 }}
        style={{
          top: "-20%",
          left:"3%",
          position: "absolute",
          height:"100%",
          width:"100%",
          zIndex: 1,
        }}/> */}

        <AutoScalingText baseSize={14}
          style={{
            paddingHorizontal: "6%",
            fontWeight: "bold",
            textAlign: "center",
          }}>
          {drClaimed == false
            ? `Your Quizmaster will select 5 cards from this deck at random and scramble their front and back sides.\n\n  Make 4 or more correct matches to earn credits!`
            : `You have already taken a Free Quiz today.\n\nYou can take another quiz by spending some credits.\n\nYou will not earn free credits from a Paid Quiz.`}
        </AutoScalingText>
        {/* {drClaimed == true && <Text style={{ fontWeight: "bold" }}></Text>} */}
        <TouchableOpacity
          hitSlop={45}
          style={
            drClaimed == true
              ? {
                  marginTop: "6%",
                  justifyContent: "center",
                  alignItems: "center",
                }
              : {
                  marginTop: "6%",
                  justifyContent: "center",
                  alignItems: "center",
                }
          }
          onPress={handleNav}>
          <AutoScalingText baseSize={14}
            style={
              drClaimed == false
                ? {
                    backgroundColor: "blue",
                    fontWeight: "bold",
                    color: "white",
                    borderRadius: 99,
                    paddingVertical: "1%",
                    paddingHorizontal: "6%",
                  }
                : {
                    backgroundColor: "green",
                    fontWeight: "bold",
                    color: "white",
                    borderRadius: 99,
                    paddingVertical: "1%",
                    paddingHorizontal: "6%",
                  }
            }>
            {drClaimed == false ? "Start (Free)" : "Start (-6✪)"}
          </AutoScalingText>
        </TouchableOpacity>
        <AutoScalingText baseSize={14}
        style={{ textAlign: "center", margin: 15 }}>
          {drClaimed
            ? `Next reward in: ${timeLeft}`
            : "Daily reward is available!"}
        </AutoScalingText>
      </View>
      
    </Modal>
  );
};
export default QuizModal;

/* 
      

      <View style={{ position: "absolute", zIndex: 4, top: "16%" }}>
        
        <AutoScalingText baseSize={14} style={{ textAlign: "center" }}></AutoScalingText>
        <View style={{ height: "45%" }} />
        
      </View>

*/