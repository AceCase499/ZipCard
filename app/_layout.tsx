//import { getTutorialActive } from "@/components/Storage";
import { getZSTrialTime } from "@/components/IAP";
import { Stack, /* useFocusEffect */ } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
let BannerAd: React.ComponentType<any> | undefined;
let BannerAdSize: any;
if (Platform.OS !== 'web') {
  const googleMobileAds = require('react-native-google-mobile-ads');
  BannerAd = googleMobileAds.BannerAd;
  BannerAdSize = googleMobileAds.BannerAdSize;
}

export default function RootLayout() {
  const [trialTime, setTrialTime] = useState(0);
  
    useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.ERROR);

    if (Platform.OS === 'ios') {
       Purchases.configure({apiKey: `${process.env.EXPO_PUBLIC_RevCatAPIkey}`});
    } else if (Platform.OS === 'android') {
       Purchases.configure({apiKey: ""});

      // OR: if building for Amazon, be sure to follow the installation instructions then:
       Purchases.configure({ apiKey: "", useAmazon: true });
    }
    //getCustomerInfo();
    //getOfferings();
    (async () => {
      const time = await getZSTrialTime();
      //console.log(`ZTT REMAINING: ${time}`)
      setTrialTime(time);
    })();
  }, []);

  async function getCustomerInfo(){
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      console.log("📢customer info", JSON.stringify(customerInfo, null, 2))
    } catch (e) {
      console.log("Something went wrong :( -->", e)
    }
  }
  async function getOfferings(){
    const offerings = await Purchases.getOfferings();
    if(offerings.current !== null && offerings.current.availablePackages.length !== 0){
      console.log("📢offerings", JSON.stringify(offerings, null, 2))
    }
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{headerShown: false}}/>
        <Stack.Screen name="Screens/EditDeck/page" options={{headerShown: false/* , gestureEnabled: !ta */}}/>
        <Stack.Screen name="Screens/DeckList/page" options={{headerShown: false}}/>
        <Stack.Screen name="Screens/Quiz/page" options={{headerShown: false, gestureEnabled: false}}/>
      </Stack>
      {trialTime <= 0 && Platform.OS !== 'web' && BannerAd && BannerAdSize && (
        <BannerAd
          unitId={`${process.env.EXPO_PUBLIC_ApUnitID}`}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
            networkExtras: { collapsible: "bottom" }
          }}
        />
      )}
    </>
  )
}