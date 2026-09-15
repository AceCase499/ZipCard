//"use jsx";
//import zsIcon from "@/assets/images/zsIcon.png";
import { useScale } from "@/components/autoElementScaling";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  //ImageBackground,
  Modal,
  ModalProps,
  Platform,
  Pressable,
  TouchableOpacity,
  View
} from "react-native";
import Purchases, { PURCHASES_ERROR_CODE } from "react-native-purchases";
import AutoScalingText from "./autoScalingText";
import { handlePurchase, storeItems, videoAdReward } from "./IAP";
let RewardedInterstitialAd: any, AdEventType: any, RewardedAdEventType: any;
if (Platform.OS !== 'web') {
  const googleMobileAds = require('react-native-google-mobile-ads');
  RewardedInterstitialAd = googleMobileAds.RewardedInterstitialAd;
  AdEventType = googleMobileAds.AdEventType;
  RewardedAdEventType = googleMobileAds.RewardedAdEventType;
}

type PROPS = ModalProps & {
  isOpen: boolean;
  closeAction: Function;
};

export const StoreModal = ({ isOpen, closeAction, ...rest }: PROPS) => {
  const [infoGUI, tggInfoGUI] = useState(false);
  const [rewardedInterstitialLoaded, setRewardedInterstitialLoaded] = useState(false);
  const flatListRef = useRef<FlatList | null>(null);
  const { scaleElement } = useScale();

    const rewardedInterstitial =
      Platform.OS !== 'web' && RewardedInterstitialAd
        ? RewardedInterstitialAd.createForAdRequest(
            `${process.env.EXPO_PUBLIC_myRIunitID}`, {
              requestNonPersonalizedAdsOnly: true
            })
        : undefined;

  useEffect(() => {
      // Clean up listeners on unmount
      return () => {
        rewardedInterstitial.removeAllListeners();
      };
    }, [rewardedInterstitial]);

  function handleClose() {
    closeAction();
  }

  function setupRewardedInterstitialListenersAndLoad() {
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
        () => {
        }
      );
      rewardedInterstitial.load();
      return () => {
        unsubscribeLoaded();
        unsubscribeClosed();
        unsubscribeEarned();
      };
    }

  async function handleStoreItem(storeID: string) {
    if (storeID == "vidCred"){
      if(Platform.OS == "web"){
        alert("This feature is not available on web")
        return
      }
      console.log("Playing video ad")
      setupRewardedInterstitialListenersAndLoad();
      //
      return;
    }
    try {
      const offerings = await Purchases.getOfferings();
      // 1. Get the zipstore offering
      const zipstoreOffering = offerings.all.zipstore;

      if (!zipstoreOffering) {
        Alert.alert('Offering "zipstore" not found');
        return;
      }
      // 2. Find the package containing input product id
      const targetPackage = zipstoreOffering.availablePackages.find(
        (pkg) => pkg.product.identifier === storeID,
      );

      if (!targetPackage) {
        Alert.alert("Product not found. Please try again later.");
        return;
      }

      // 3. Trigger native purchase prompt
      const { customerInfo } = await Purchases.purchasePackage(targetPackage);

      switch (storeID) {
        case "smallCred":
          handlePurchase("smolder");
          break;
        case "medCred":
          handlePurchase("marvelous");
          break;
        case "largeCred":
          handlePurchase("leave");
          break;
        case "bulkCred":
          handlePurchase("binoculars");
          break;
        case "supCred":
          handlePurchase("suave");
          break;
        case "zipService":
          handlePurchase("zebra");
          break;
      }
      if (storeID == 'zipService'){
        Alert.alert(`🎉Purchase successful!\n⚙️To start your subscription, please restart the app now.`);
      } else{
        Alert.alert("Purchase successful 🎉");
        handleClose();
      }
    } catch (e: any) {
      if (e.code !== PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      Alert.alert("Purchase failed", e.message || "An unknown error occurred");
      handleClose();
    }
    }
  }

  const renderStoreItem = ({ item }: any) => (
    <Pressable
      onPress={() => handleStoreItem(item.id)}
      style={({ pressed }) => [{
        opacity: pressed ? 0.5 : 1,
        width: "48%",
        height: "120%",
        backgroundColor: "#1230d7ff",
        borderRadius: 16,
        padding: 12,
        marginVertical: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 4,
      }]}
    >
      {/* Credits */}
      <AutoScalingText baseSize={16}
        style={{
          color: "gold",
          fontWeight: "800",
          padding: 6,
          textAlign: "center",
        }}>
        ✪{item.credits}
      </AutoScalingText>
      {/* Price */}
      <AutoScalingText baseSize={12}
        style={{
          color: "white",
          textAlign: "center",
          marginTop: 6,
          fontWeight: "200",
        }}
      >
        {item.price.toFixed(2) == "0.00" ? `▶️ Watch Ad` : `$${item.price.toFixed(2)}`}
        {/* ${item.price.toFixed(2)} */}
      </AutoScalingText>
    </Pressable>
  );

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      statusBarTranslucent
      {...rest}
    >
      {/* Overlay close touch */}
      <TouchableOpacity
        onPress={handleClose}
        style={{ width: "100%", height: "100%" }}
      />
      {/* Modal content */}
      <View
        style={{
          height: "85%",
          width: "95%",
          backgroundColor: "#273193ff",
          borderTopLeftRadius: 50,
          borderTopRightRadius: 50,
          top: "15%",
          position: "absolute",
          zIndex: 3,
          alignSelf: "center",
          padding: 10,
          shadowColor: "#000000ff",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 99,
          elevation: 12,
        }}
      >
        {/*<AutoScalingText baseSize={12}
          style={{
            color: "gold",
            fontWeight: "400",
            textAlign: "center",
          }}
        >
          ⎣Featured⎤
        </AutoScalingText>*/}

        {/* <TouchableOpacity
        onPress={() => handleStoreItem("zipService")}
          style={{
            backgroundColor: "#1230d7ff",
            borderTopStartRadius: 16,
            borderTopEndRadius: 16,
            padding: 12,
            marginTop: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.5,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
        <View 
        style={{      
          alignItems:"center",
          alignContent:"center",
          justifyContent:"space-between", 
          flexDirection: "row", 
          width:"100%", 
        }}>        
          <ImageBackground
            source={zsIcon}
            resizeMode="contain"
            style={{
              width: scaleElement(30),
              height: scaleElement(30),
              shadowColor: "#FFD700", // gold glow
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.7,
              shadowRadius: 5,
              elevation: 12, // Android glow
            }}/>
          <AutoScalingText baseSize={14}
            style={{
              color: "gold",
              fontWeight: "bold",
              paddingTop: scaleElement(3),
              textAlign: "center",
            }}>
            Zip Student Service
          </AutoScalingText>
          <ImageBackground
            source={zsIcon}
            resizeMode="contain"
            style={{
              width: scaleElement(30),
              height: scaleElement(30),
              shadowColor: "#FFD700", // gold glow
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.7,
              shadowRadius: 5,
              elevation: 12, // Android glow
            }}/>
        </View>
          
          <AutoScalingText baseSize={12}
            style={{
              color: "white",
              fontWeight: "500",
              textAlign: "center",
            }}
          >
            {`Remove ads and get unlimited credits`}
          </AutoScalingText>
          <AutoScalingText baseSize={12}
          style={{
            textDecorationLine: 'underline',
            color:"white",
            textAlign:"center",
            margin:scaleElement(4),
            marginBottom:scaleElement(10)
          }}>
            Start Subscription
          </AutoScalingText>
        </TouchableOpacity>
        <TouchableOpacity hitSlop={20} onPress={()=>tggInfoGUI(true)}
          style={{
            backgroundColor:"#00a2ff", 
            borderBottomStartRadius:16,
            borderBottomEndRadius:16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.5,
            shadowRadius: 4,
            elevation: 4,
            }}>
          <AutoScalingText baseSize={11}
              style={{
                color: "blue",
                fontWeight: "600",
                textAlign: "center",
                textDecorationLine: 'underline',
                marginVertical: scaleElement(5)
              }}>
              Learn more
            </AutoScalingText>
        </TouchableOpacity> */}

        <AutoScalingText baseSize={13} 
        style={{
          color:"gold",
          fontWeight:"bold",
          textAlign:"center",
          marginTop: scaleElement(6)
        }}>
            Buy Credits
        </AutoScalingText>

        <FlatList
          data={storeItems}
          ref={flatListRef}
          style={{ marginTop: 8 }}
          renderItem={renderStoreItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        />

      </View>
      {infoGUI == true && (
        <View
          style={{
            width: "95%",
            top: "20%",
            backgroundColor: "#6c94e9",
            borderRadius: 40,
            borderWidth: scaleElement(5),
            borderColor:"gold",
            position: "absolute",
            zIndex: 6,
            alignSelf: "center",
            padding: 10,
          }}
        >
          <AutoScalingText baseSize={16}
            style={{
              textAlign: "center",
              marginTop: scaleElement(5),
              fontWeight: "bold",
            }}
          >
            Zip Student Service
          </AutoScalingText>
          <AutoScalingText baseSize={12}
            style={{ 
              paddingHorizontal: "10%", 
              paddingTop: "3%", 
              textAlign:"center" 
              }}>
            {`◦ 7-day subscription\n`}
            {`◦ Ad-free experience\n`}
            {`◦ UNLIMITED credits\n`}
            {`$6.99`}
          </AutoScalingText>
          <View 
          style={{
            height: scaleElement(2),
            width: "50%",
            backgroundColor: "gold",
            alignSelf: "center",
            marginVertical: scaleElement(7)
          }}></View>
          <View 
          style={{
            width: "88%", 
            alignSelf: "center",
            }}>
            <AutoScalingText baseSize={12}
              style={{
                fontWeight: "bold",
                textDecorationLine: 'underline',
                textAlign: "center",
                marginBottom: scaleElement(6),
               }}>
              {`✭ Unique Subscription System ✭`}
            </AutoScalingText>
            <AutoScalingText baseSize={12}
              style={{
                fontWeight: "bold",
                textAlign: "center",
               }}>
              {`Trial time counts down when the app is open, and pauses after you close it.\nNo trial time wasted!`}
            </AutoScalingText>
          </View>
          <TouchableOpacity hitSlop={45} onPress={() => tggInfoGUI(false)}>
            <AutoScalingText baseSize={12}
              style={{
                textAlign: "center",
                fontWeight: "900",
                margin: scaleElement(12),
                color:"blue"
              }}
            >
              OK
            </AutoScalingText>
          </TouchableOpacity>
        </View>
      )}
    </Modal>
  );
};

export default StoreModal;
