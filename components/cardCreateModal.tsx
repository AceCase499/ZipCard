import { useScale } from "@/components/autoElementScaling";
import AutoScalingText from "@/components/autoScalingText";
import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  ModalProps, Platform,
  Modal as RNModel,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import FlipCard from "./FlipCard";

type PROPS = ModalProps & {
  isOpen: boolean;
  tutorialActive: boolean;
  closeAction: Function;
  submitAction: (front: string, back: string, color: string) => void; // precise
};

export const CardCreateModal = ({isOpen, tutorialActive, closeAction, children, submitAction, ...rest}: PROPS) => {
    const [selectedColor, setSelectedColor] = useState('white');
    const [front, setFront] = useState('');
    const [back, setBack] = useState('');
    const colors = [
        { name: 'white', bg: 'white', border: 'black' },
        { name: 'red', bg: 'red', border: 'black' },
        { name: 'yellow', bg: '#fff700ff', border: 'black' },
        { name: 'green', bg: '#37ef1eff', border: 'black' },
        { name: 'blue', bg: 'blue', border: '#00eaff' },
    ];
    const { scaleElement } = useScale();

    function emptyFields(){
        setFront("")
        setBack("")
    }

    useEffect(() => {
        emptyFields()
      }, [isOpen]);

    function getCardColor(clr: string, side: boolean) {
      const c = (clr ?? "white").toLowerCase();
      if (c.includes("white")) return side ? "#c2c2c2" : "#ffffff";
      if (c.includes("red"))   return side ? "#b80000ff" : "#ff2e2eff";
      if (c.includes("green")) return side ? "#0fda00ff" : "#65ff5aff";
      if (c.includes("yellow"))return side ? "#e3c400ff" : "#ffe640ff";
      if (c.includes("blue"))  return side ? "#008de5ff" : "#73c9ffff";
      return side ? "#c2c2c2" : "#ffffff";
    }

   function getBorderColor(colorName: string, colorBG: string, colorBorder: string){
        if(selectedColor == colorName){
            return colorBorder;
        } else {
          if (colorName == "white"){
            return "gray";
          } else{
            return colorBG;
          }
        }
   }

   function handleClose(){
    if (tutorialActive ==true) return;
    setSelectedColor("white");
    closeAction();
   }
    
  return (
    <RNModel 
    visible={isOpen}
    transparent
    animationType="fade"
    statusBarTranslucent
    {...rest}>
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={{alignItems: "center", justifyContent: "center", flex: 1, padding: 3, backgroundColor: "#00000080"}}>
                {tutorialActive==true&&
                <AutoScalingText baseSize={14} style={{padding: "5%",color:"white", textAlign:"center", fontWeight:"bold"}}>
                    {`‼️(Provide text for both sides of your Zip Card.)\n🎨(Use the colored dots to set your card's color.)`}</AutoScalingText>}
                {tutorialActive==false &&
                <FlipCard
                  frontSide={front ?? "Front"}
                  backSide={back ?? "Back"}
                  fColor={getCardColor(selectedColor ?? "white", false)} //false: get front side color
                  bColor={getCardColor(selectedColor ?? "white", true)} //true: get back side color
                  demo={false}>
                </FlipCard>
                }
            <View
                style={{
                    width: "95%", 
                    backgroundColor: "white", 
                    borderRadius: 50, 
                    alignSelf: "center", 
                    padding: 4
                    }}>
                <AutoScalingText baseSize={13} style={{color: "blue", fontWeight: "bold", textAlign: "center", margin: 15}}>
                    ⎣ New Card ⎤</AutoScalingText>
                <View style={{flexDirection: "row"}}>
                    <TextInput
                        style={{
                            width: "80%", 
                            backgroundColor:"#ffffffa4",
                            padding: 3, 
                            borderWidth: 1, 
                            borderColor: "gray", 
                            marginHorizontal: 5,
                            fontSize: scaleElement(12)
                        }}
                        value={front}
                        onChangeText={setFront}
                        placeholder='Front side text...'
                        maxLength={400}
                        multiline
                        numberOfLines={6}/>
                    <TouchableOpacity onPress={Keyboard.dismiss}>
                        <AutoScalingText baseSize={11} style={{fontWeight: "bold", color: "#00000079"}}>
                            Close</AutoScalingText>
                    </TouchableOpacity>
                </View>
                <View style={{flexDirection: "row", paddingVertical: 5}}>
                    <TextInput
                        style={{
                            width: "80%", 
                            backgroundColor:"#ffffffa4",
                            padding: 3, 
                            borderWidth: 1, 
                            borderColor: "gray", 
                            marginHorizontal: 5, 
                            margin: 5,
                            fontSize: scaleElement(12)
                        }}
                        value={back}
                        onChangeText={setBack}
                        placeholder='Back side text...'
                        maxLength={400}
                        multiline
                        numberOfLines={6}/>
                    <TouchableOpacity onPress={Keyboard.dismiss}>
                        <AutoScalingText baseSize={11} style={{fontWeight: "bold", color: "#00000079"}}>Close</AutoScalingText>
                    </TouchableOpacity>
                </View>
                <View style={{flexDirection: "row", justifyContent: "space-between", width: "100%", padding: scaleElement(20)}}>
                    <AutoScalingText baseSize={11} 
                    style={{
                      fontWeight:"bold",
                      alignSelf:"center",
                      }}>
                        Card Color</AutoScalingText>
                    {colors.map((color) => (
                        <TouchableOpacity
                        //hitSlop={30}
                        key={color.name}
                        onPress={() => setSelectedColor(color.name)}
                        style={{alignItems: "center", justifyContent: "center"}}>
                            <View 
                            style={{
                                width: scaleElement(25), 
                                height: scaleElement(25), 
                                borderRadius: 99, 
                                backgroundColor: `${color.bg}`, 
                                borderWidth: scaleElement(2), 
                                borderColor: getBorderColor(color.name, color.bg, color.border)
                              }}/>
                        </TouchableOpacity>
                    ))}
                    </View>
                    <View style={{justifyContent: "center", gap:"3%", margin: 10, flexDirection: "row"}}>
                        <TouchableOpacity onPress={()=>{submitAction(front, back, selectedColor); setFront(""); setBack(""); setSelectedColor("white");}}
                            style={{backgroundColor: "blue", borderRadius: 99, paddingHorizontal: 20}}>
                            <AutoScalingText baseSize={14} style={{textAlign: "center", fontWeight: "bold", color: "white", paddingHorizontal: 6}}>
                                {tutorialActive==true ? 
                                `Create` : `Create (-1✪)`}</AutoScalingText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleClose}
                            style={{borderRadius: 99, paddingHorizontal: 20, borderWidth: 3}}>
                            <AutoScalingText baseSize={14} style={{textAlign: "center", fontWeight: "bold", paddingHorizontal: 6}}>
                                Cancel</AutoScalingText>
                        </TouchableOpacity>
                    </View>
            </View>
        </KeyboardAvoidingView>
    </RNModel>
  )
}
