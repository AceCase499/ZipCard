import { useScale } from "@/components/autoElementScaling";
import { getDrClaimStatus } from "@/components/IAP";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Modal,
  ModalProps,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Purchases from "react-native-purchases";
import AutoScalingText from "./autoScalingText";
import { handlePurchase } from "./IAP";

type PROPS = ModalProps & {
  isOpen: boolean; //is the modal open? t/f
  closeAction: Function;
  title: string;
};

export const zsWarningModal = ({
  isOpen,
  closeAction,
  title,
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
      } catch (e: any) {
        if (!e.userCancelled) {
          Alert.alert("Purchase failed", e.message);
        }
      }
    }

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      statusBarTranslucent
      style={{
        flex:1,
        justifyContent:"center",
        alignItems: "center",
      }}
      {...rest}
    >
      <View
        style={{
          width: "95%",
          height: "45%",
          alignSelf:"center",
          top: scaleElement(200),
          backgroundColor: "white",
          borderRadius: 40,
        }}
      >
        <View>
          <AutoScalingText baseSize={15}
            style={{
              width: "65%",
              alignSelf:"center",
              textAlign: "center",
              fontWeight: "bold",
              marginTop: "5%",
              color: "rgb(255, 119, 0)",
            }}
          >
            {`${title}`}
          </AutoScalingText>
          <AutoScalingText baseSize={12} style={{ fontWeight:"bold", margin:"5%"}}>
              Your
              <Text style={{color:"rgb(255, 119, 0)", /* fontSize: fontSize(28), */ fontWeight:"bold", margin:"5%"}}>{" "}
                Zip Student Service Subscription{" "}</Text>
              is expiring soon. If you want to keep your
              <Text style={{color:"rgb(255, 119, 0)", /* fontSize: fontSize(28), */ fontWeight:"bold", margin:"5%"}}>{" "}
                ad-free experience with unlimited credits</Text>
              , extend your subscription using the button below.
            </AutoScalingText>
          <TouchableOpacity
            hitSlop={45}
            style={{
              paddingHorizontal: scaleElement(30),
            }}
            onPress={()=>purchasePromptZSS()}
          >
            <AutoScalingText
              baseSize={14}
              style={{
                textAlign: "center",
                color: "white",
                fontWeight: "bold",
                //padding: "4%",
                backgroundColor: "blue",
                borderRadius: 99,
              }}
            >Extend Zip Student Service
            </AutoScalingText>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
            style={{
              marginTop: scaleElement(20),              
            }}
            onPress={handleClose}
          >
            <AutoScalingText
              baseSize={12}
              style={{
                textAlign: "center",
                color: "white",
                maxWidth: "50%",
                alignSelf:"center",
                backgroundColor:"#000000a3",
                paddingHorizontal: scaleElement(12),
                borderRadius:99,
              }}
            >Dismiss
            </AutoScalingText>
          </TouchableOpacity>
      </View>
    </Modal>
  );
};
export default zsWarningModal;
