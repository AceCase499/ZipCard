import { useScale } from "@/components/autoElementScaling";
import { getDrClaimStatus } from "@/components/IAP";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import AutoScalingText from "./autoScalingText";

import {
  Alert,
  Modal,
  ModalProps,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Purchases from "react-native-purchases";
//import { AutoFontScaler } from "./fontAutoScaler";
import { handlePurchase } from "./IAP";

type PROPS = ModalProps & {
  isOpen: boolean; //is the modal open? t/f
  closeAction: Function;
};

export const zsExpiredModal = ({
  isOpen,
  closeAction,
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

  async function purchasePromptZSS() {
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
          (pkg) => pkg.product.identifier === "zipService",
        );
  
        if (!targetPackage) {
          Alert.alert("Product not found. Please try again later.");
          return;
        }
        // 3. Trigger native purchase prompt
        const { customerInfo } = await Purchases.purchasePackage(targetPackage);
        handlePurchase("zebra");

        Alert.alert("Purchase successful 🎉");
        handleClose();
      } catch (e: any) {
        if (!e.userCancelled) {
          Alert.alert("Purchase failed", e.message);
          handleClose();
        }
      }
    }

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      statusBarTranslucent
      {...rest}
    >
      <View
        style={{
          alignItems: "center",
          alignSelf:"center",
          width: "95%",
          backgroundColor: "white",
          borderRadius: 40,
          marginTop:"40%"
        }}
      >
        <View style={{justifyContent: "center",
              alignItems: "center",}}>
          <TouchableOpacity
            onPress={handleClose}
            hitSlop={45}
            style={{ position: "absolute", left: "5%", zIndex: 35 }}
          >
            {/* <Text style={{ fontSize: 40, textAlign: "center" }}>Ⓧ</Text> */}
          </TouchableOpacity>
          <AutoScalingText
            baseSize={14}
            style={{
              width: "65%",
              justifyContent: "center",
              textAlign: "center",
              fontWeight: "bold",
              marginTop: "5%",
            }}
          >
            {`🎓Zip Student Service🎓\nhas Expired`}
          </AutoScalingText>
          <AutoScalingText baseSize={13}
          style={{
            fontWeight:"bold", 
            margin:"5%",
            textAlign:"center",
            }}>
            To continue studying with ZipCard 
            <Text style={{color:"orange", fontWeight:"bold", margin:"5%"}}>
              {" "}Ad-free{" "}</Text>
            with
            <Text style={{color:"orange", fontWeight:"bold", margin:"5%"}}>
              {" "}unlimited credits,{" "}</Text>
              tap the
            <Text style={{color:"blue", fontWeight:"bold", margin:"5%"}}>
              {" "}button{" "}</Text>
            below.
          </AutoScalingText>
          <TouchableOpacity
            hitSlop={15}
            style={{
              justifyContent: "center",
              marginVertical: "3%",
            }}
            onPress={()=>purchasePromptZSS()}>
            <AutoScalingText
              baseSize={12}
              style={{
                textAlign: "center",
                color: "white",
                fontWeight: "bold",
                paddingVertical:"2%",
                paddingHorizontal: "9%",
                backgroundColor: "blue",
                borderRadius: 99,
              }}
            >Extend Zip Student Service
            </AutoScalingText>
          </TouchableOpacity>
          <AutoScalingText baseSize={12}
          style={{
            fontWeight:"bold",
            margin:"5%",
            textAlign:"center",
          }}>
            Otherwise, please restart the app now.
          </AutoScalingText>
        </View>
      </View>
    </Modal>
  );
};
export default zsExpiredModal;
