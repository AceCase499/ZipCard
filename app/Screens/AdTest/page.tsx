import AutoScalingText from "@/components/autoScalingText";
import { videoAdReward } from '@/components/IAP';
import React, { useEffect, useRef } from 'react';
import { Platform, Pressable, View } from "react-native";
let AdEventType: any, RewardedAdEventType: any, RewardedInterstitialAd: any, TestIds: any;
if (Platform.OS !== 'web') {
  const googleMobileAds = require('react-native-google-mobile-ads');
  AdEventType = googleMobileAds.AdEventType;
  RewardedAdEventType = googleMobileAds.RewardedAdEventType;
  RewardedInterstitialAd = googleMobileAds.RewardedInterstitialAd;
  TestIds = googleMobileAds.TestIds;
}

export default function AdTest(){
  const rewardedInterstitial = useRef(
    Platform.OS !== 'web' && RewardedInterstitialAd && TestIds
      ? RewardedInterstitialAd.createForAdRequest(
          TestIds.REWARDED_INTERSTITIAL,
          { requestNonPersonalizedAdsOnly: true }
        )
      : undefined
  ).current;

  useEffect(() => {
    // Clean up listeners on unmount
    return () => {
      if (rewardedInterstitial) {
        rewardedInterstitial.removeAllListeners();
      }
    };
  }, [rewardedInterstitial]);

  function setupRewardedInterstitialListenersAndLoad() {
    if (Platform.OS === 'web' || !rewardedInterstitial) {
      alert('This feature is not available on web.');
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

  return (
    <View>
      <Pressable
        onPress={setupRewardedInterstitialListenersAndLoad}
        style={({ pressed }) => [{
          opacity: pressed ? 0.5 : 1,
          fontWeight: 500,
          padding: 5,
          borderRadius: 99,
          backgroundColor: "gray",
        }]}
      >
        <AutoScalingText baseSize={13}
          style={{
            color: "gold",
            textAlign: "center",
          }}>
          Watch Ad
        </AutoScalingText>
      </Pressable>
    </View>
  );
}