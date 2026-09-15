import Styling from "@/app/MainStyling";
import zsIcon from "@/assets/images/zsIcon.png";
import { useScale } from "@/components/autoElementScaling";
import AutoScalingText from "@/components/autoScalingText";
import StoreModal from "@/components/storeModal";
import React, { useState } from 'react';
import { ImageBackground, TouchableOpacity, View } from 'react-native';
import { formatCredits, getCredits, getZSTrialTime } from "./IAP";

export default function CreditsCounter () {
    const [storeModal, tggStoreModal] = useState(false);
    const [zsDesc, tggZsDesc] = useState(false);
    const [zsActive, tggZsActive] = useState(false);
    const { scaleElement } = useScale();

    React.useEffect(() => {
      isZserviceActive().then(tggZsActive);
    }, []);

    async function isZserviceActive(){
      if (await getZSTrialTime() > 0) {
        return true;
      } else {
        return false;
      }
    }

    async function formatZsTime(){
      const ztt = await getZSTrialTime();
      if (ztt <= 0) {
        return "Trial Time Expired";
      }
      const days = Math.floor(ztt / 86400);
      const hours = Math.floor((ztt % 86400) / 3600);
      const minutes = Math.floor((ztt % 3600) / 60);

      const parts: string[] = [];
      if (days > 0) parts.push(`${days}D`);
      if (hours > 0) parts.push(`${hours}H`);
      if (minutes > 0 || parts.length === 0) parts.push(`${minutes}M`);
      return parts.join(" ");
    };

    async function fetchAndFormat(){
        const ztt = await getZSTrialTime();
        if (ztt > 0){
          return "✪Unlimited";
        }
        const cred = await getCredits()
        const formatted = formatCredits(cred);
        return "✪"+formatted;
    }

    async function getFormatted(){
        const cred = await getCredits()
        const formatted = formatCredits(cred);
        return "✪"+formatted;
    }

  return (
    <View 
    style={{
      justifyContent:"space-between", 
      flexDirection: "row", 
      width:"100%", 
      paddingHorizontal:"5%",
      paddingBottom:scaleElement(5)
      }}>

      {zsDesc && <View 
      style={{ 
        position: "absolute",
        right: scaleElement(50),
        top: scaleElement(100),
        zIndex: 3,
        borderRadius: 25,
        backgroundColor:"#000000b0", 
        width:"80%",
        shadowColor: "#FFD700", // gold glow
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 6,
        elevation: 12, // Android glow
        }}>
          <AutoScalingText baseSize={14} 
          style={{
            fontWeight:"bold", 
            color: "gold",
            textAlign:"center",
            marginTop: scaleElement(10)
            }}>
            Zip Student Service Active
          </AutoScalingText>
          <AutoScalingText baseSize={12} 
          style={{
            color: "gold", 
            textAlign:"center", 
            marginTop: scaleElement(9)
            }}>
            {formatZsTime()}
          </AutoScalingText>
          <AutoScalingText baseSize={12} 
          style={{
            color: "gold", 
            textAlign:"center", 
            marginTop: scaleElement(9)
            }}>
            {`Your Credits: `}{getFormatted()}
          </AutoScalingText>
      </View>}

      {zsActive ? 
      <TouchableOpacity 
      onPressIn={()=>tggZsDesc(true)} onPressOut={()=>tggZsDesc(false)}
      hitSlop={45}
      style={{
        paddingHorizontal:"5%",
        borderRadius:35, 
        backgroundColor: "#00000083",
        shadowColor: "#FFD700", // gold glow
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 12, // Android glow
        }}>
        <ImageBackground
          source={zsIcon}
          resizeMode="contain"
          style={{
            width: scaleElement(22),
            height: scaleElement(22),
            shadowColor: "#FFD700", // gold glow
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.7,
            shadowRadius: 5,
            elevation: 12, // Android glow
          }}/>
      </TouchableOpacity>
      :
      <View 
      style={{
        height: scaleElement(5),
        width: scaleElement(5)
      }}/>
      }

        <TouchableOpacity onPress={()=>tggStoreModal(true)} hitSlop={45}>
            <AutoScalingText baseSize={12} style={Styling.creditCtrVizible}>{fetchAndFormat()}</AutoScalingText>
        </TouchableOpacity>
        <StoreModal isOpen={storeModal} closeAction={()=>tggStoreModal(false)}></StoreModal>
    </View>
  )
}