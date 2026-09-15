import TV from "@/assets/images/tv.png";
import { useScale } from "@/components/autoElementScaling";
import AutoScalingText from "@/components/autoScalingText";
import { getDrClaimStatus, videoAdReward } from "@/components/IAP";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ImageBackground,
  Modal,
  ModalProps,
  Platform,
  Pressable,
  TouchableOpacity,
  View
} from "react-native";
let RewardedInterstitialAd: any, AdEventType: any, RewardedAdEventType: any;
if (Platform.OS !== 'web') {
  const googleMobileAds = require('react-native-google-mobile-ads');
  RewardedInterstitialAd = googleMobileAds.RewardedInterstitialAd;
  AdEventType = googleMobileAds.AdEventType;
  RewardedAdEventType = googleMobileAds.RewardedAdEventType;
}

type PROPS = ModalProps & {
  isOpen: boolean; //is the modal open? t/f
  openAction: Function;
  closeAction: Function;
  adAction: Function;
};

export const CreditWarning = ({
  isOpen,
  openAction,
  closeAction,
  adAction,
  ...rest
}: PROPS) => {
  const [drClaimed, setDrClaimed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const { scaleElement } = useScale();
  const [rewardedInterstitialLoaded, setRewardedInterstitialLoaded] = useState(false);
    const rewardedInterstitial =
          Platform.OS !== 'web' && RewardedInterstitialAd
            ? RewardedInterstitialAd.createForAdRequest(
                "ca-app-pub-4790636481679301/8429322493", {
                  requestNonPersonalizedAdsOnly: true
                })
            : undefined;
          //^^REPLACE WITH REAL R.I. UNIT ID AFTER TESTING!!
          //ca-app-pub-4790636481679301/8429322493 --real
          //ca-app-pub-3940256099942544/6978759866 --sample
          //TestIds.REWARDED_INTERSTITIAL
  
  useFocusEffect(
    useCallback(() => {
      (async () => {
        let temp = await getDrClaimStatus();
        setDrClaimed(temp);
        updateTimeLeft();
      })();
    }, []),
  );

  useEffect(() => {
    // Clean up listeners on unmount
    return () => {
      if (rewardedInterstitial) {
        rewardedInterstitial.removeAllListeners();
      }
    };
  }, [rewardedInterstitial]);
  
  function setupRewardedInterstitialListenersAndLoad() {
    if (Platform.OS === "web" || !rewardedInterstitial) {
      alert("This feature is not available on web.");
      return;
    }
    rewardedInterstitial.removeAllListeners();
    const unsubscribeLoaded = rewardedInterstitial.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        rewardedInterstitial.show();
      }
    );
    const unsubscribeEarned = rewardedInterstitial.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => { videoAdReward(); }
    );
    const unsubscribeClosed = rewardedInterstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {}
    );
    rewardedInterstitial.load();
    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeEarned();
    };
  }

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

  function handleOpenStore() {
    openAction();
  }
  function handleClose() {
    closeAction();
  }

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      statusBarTranslucent
      {...rest}>
      <TouchableOpacity
        onPress={handleClose}
        style={{ width: "100%", height: "100%" }}/>
      <View
        style={{
          position: "absolute",
          flex: 1,
          left: "3%",
          alignItems: "center",
          top: "25%",
          zIndex: 1,
          width: "95%",
          paddingVertical: "5%",
          backgroundColor: "white",
          borderRadius: 40,
        }}>
        <TouchableOpacity
          onPress={handleClose}
          hitSlop={45}
          style={{ position: "absolute", left: "5%", zIndex: 35 }}>
          <AutoScalingText baseSize={22}
          style={{ textAlign: "center" }}>Ⓧ</AutoScalingText>
        </TouchableOpacity>
        <AutoScalingText baseSize={16}
          style={{
            width: "65%",
            justifyContent: "center",
            textAlign: "center",
            fontWeight: "bold",
            marginTop: "5%",
            color: "#850000ff",
          }}>
          You do not have enough credits to perform this action.
        </AutoScalingText>
        {Platform.OS !== "web" &&
          <View> 
          <View
            style={{
              marginTop: "5%",
              width: "80%",
              zIndex: 3,
              flexDirection: "row",
              justifyContent: "space-between",
            }}>
            <ImageBackground
              source={TV}
              resizeMode="contain"
              style={{ height: "100%", width: "65%" }}>
              </ImageBackground>
            <Pressable
              hitSlop={36}
              onPress={setupRewardedInterstitialListenersAndLoad}
              style={({pressed})=>[{
                opacity: pressed ? 0.5 : 1,// Mimics TouchableOpacity
                justifyContent: "center",
                flex: 1,
                marginVertical: "10%",
                paddingHorizontal: "2%",
              }]}>
              <AutoScalingText baseSize={11}
                style={{
                  textAlign: "center",
                  color: "white",
                  fontWeight: "bold",
                  padding: "7%",
                  backgroundColor: "blue",
                  borderRadius: 99,
                  shadowColor: "#000",
                  shadowOffset: { width: 2, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 4,
                  elevation: 5,
                }}>
                {`Watch Ad (+3✪)`}
              </AutoScalingText>
            </Pressable>
          </View>
          <AutoScalingText baseSize={14}>
            OR</AutoScalingText>
        </View>}
        <TouchableOpacity
          hitSlop={40}
          style={{
            justifyContent: "center",
            marginVertical: "2%",
            paddingHorizontal: "4%",
          }}
          onPress={handleOpenStore}>
          <AutoScalingText baseSize={14}
            style={{
              textAlign: "center",
              color: "white",
              fontWeight: "bold",
              padding: "2%",
              paddingHorizontal:"3%",
              backgroundColor: "green",
              borderRadius: 99,
              shadowColor: "#000",
              shadowOffset: { width: 2, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 4,
              elevation: 5,
            }}>
            Get More Credits
          </AutoScalingText>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};
export default CreditWarning;
