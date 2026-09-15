import { useScale } from "@/components/autoElementScaling";
import AutoScalingText from "@/components/autoScalingText";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  ModalProps,
  Platform,
  Pressable,
  Share,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import FlipCard from './FlipCard';

type PROPS = ModalProps & {
  isOpen: boolean;
  submitAction: (front: string, back: string, color: string) => void;
  Front: string;
  Back: string; 
  Color: string;
  deleteAction: Function;
  closeAction: Function;
};

export const EditCardModal = ({
  isOpen, children, 
  submitAction, 
  Front, Back, Color,
  deleteAction, closeAction,
  ...rest}: PROPS) => {
  const [selectedColor, setSelectedColor] = useState('white');
  const [frontState, setFrontState] = useState(Front);
  const [backState, setBackState] = useState(Back);
  const [openDelete, tggDelete] = useState(false); // open the 'are you sure you want to delete?' dialogue
  const [showCopied, setShowCopied] = useState(false);

  const { scaleElement } = useScale();
  const colors = [
    { name: 'white', bg: 'white', border: 'black' },
    { name: 'red', bg: 'red', border: 'black' },
    { name: 'yellow', bg: '#fff700ff', border: 'black' },
    { name: 'green', bg: '#37ef1eff', border: 'black' },
    { name: 'blue', bg: 'blue', border: '#00eaff' },
  ];
  function getCardColor(clr: string, side: boolean) {
    const c = (clr ?? "white").toLowerCase();
    if (c.includes("white")) return side ? "#c2c2c2" : "#ffffff";
    if (c.includes("red"))   return side ? "#b80000ff" : "#ff2e2eff";
    if (c.includes("green")) return side ? "#0fda00ff" : "#65ff5aff";
    if (c.includes("yellow"))return side ? "#e3c400ff" : "#ffe640ff";
    if (c.includes("blue"))  return side ? "#008de5ff" : "#73c9ffff";
    return side ? "#c2c2c2" : "#ffffff";
  }

  /* useEffect(() => {
    if (!frontState.trim() && !backState.trim()){
      autofillEdit()
    }
  }); */
    
  useEffect(() => {
    if (isOpen) {
      setFrontState(Front);
      setBackState(Back);
      setSelectedColor(Color);
    }
  }, [isOpen, Front, Back, Color]);

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
    function handleDelete(){
      deleteAction();
      tggDelete(false);
      closeAction();
    }
    function handleClose(){
      setFrontState("");
      setBackState("");
      setSelectedColor("white");
      tggDelete(false);
      closeAction();
    }
    function autofillEdit(){
      setFrontState(Front);
      setBackState(Back);
      setSelectedColor(Color);
    }

    function copyText() {
      Clipboard.setStringAsync(
        `${Front} | ${Back} (Made with Zipcard)`,
      );
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }

    const onShare = async () => {
      try {
        const result = await Share.share({
          message: `${Front} | ${Back} (Made with ZipCard)`,
        });
        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            // shared with activity type of result.activityType
          } else {
            // shared
          }
        } else if (result.action === Share.dismissedAction) {
          // dismissed
        }
      } catch (error) {
        alert(error);
      }
    };
    
  return (
    <Modal 
    visible={isOpen}
    transparent
    animationType="fade"
    statusBarTranslucent
    {...rest}>
      <View 
      style={{
        backgroundColor:"#000000a8",
        width:"100%",
        height:"100%"
      }}>
        <View
        style={{
          marginTop: "30%",
          justifyContent:"center",
          alignItems:"center",
          alignSelf:"center",
          width: "95%",
        }}>
          <FlipCard
            frontSide={frontState ?? "Front"}
            backSide={backState ?? "Back"}
            fColor={getCardColor(selectedColor ?? "white", false)} //false: get front side color
            bColor={getCardColor(selectedColor ?? "white", true)} //true: get back side color
            demo={false}>
          </FlipCard>
        </View>
        <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{
            justifyContent:"center",
            alignItems:"center",
            alignSelf:"center",
            padding: scaleElement(10),
            borderRadius: 25,
            width: "95%",
            backgroundColor:"white"
          }}>
          <View style={{ flexDirection: "row" }}>
            <TextInput
              style={{
                width: "75%",
                backgroundColor:"#ffffffa4",
                borderWidth: scaleElement(1),
                padding: 3,
                marginBottom: 3,
                maxHeight: scaleElement(60),
                fontSize: scaleElement(12)
              }}
              value={frontState}
              onChangeText={setFrontState}
              placeholder={"Front side text..."}
              maxLength={400}
              multiline
              numberOfLines={6}
            />
            <TouchableOpacity onPress={Keyboard.dismiss}>
              <AutoScalingText baseSize={12}
                style={{
                  marginHorizontal: scaleElement(3),
                  color: "#444444",
                  fontWeight: "bold",
                }}>
                Close
              </AutoScalingText>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", paddingTop:scaleElement(2), paddingBottom:scaleElement(15)}}>
            <TextInput
              style={{
                width: "75%",
                backgroundColor:"#ffffffa4",
                borderWidth: scaleElement(1),
                padding: 3,
                marginBottom: 3,
                maxHeight: scaleElement(60),
                fontSize: scaleElement(12)
              }}
              value={backState}
              onChangeText={setBackState}
              placeholder={"Back side text..."}
              maxLength={400}
              multiline
              numberOfLines={6}
            />
            <TouchableOpacity onPress={Keyboard.dismiss}>
              <AutoScalingText baseSize={12}
                style={{
                  marginHorizontal: scaleElement(3),
                  color: "#444444",
                  fontWeight: "bold",
                }}>
                Close
              </AutoScalingText>
            </TouchableOpacity>
          </View>
          <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
            marginBottom:"3%",
            }}>
            <AutoScalingText baseSize={11}
            style={{fontWeight:"bold"}}>
                Card Color</AutoScalingText>
            {colors.map((color) => (
                <TouchableOpacity
                hitSlop={30}
                key={color.name}
                onPress={() => setSelectedColor(color.name)}
                style={{
                  alignItems: "center",
                  justifyContent: "center"
                  }}>
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
                {openDelete == true && (
                  <View>
                    <AutoScalingText baseSize={12}
                      style={{
                        color: "red",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}>
                      Delete this Zip Card?
                    </AutoScalingText>
                    <AutoScalingText baseSize={12}
                    style={{ textAlign: "center", fontWeight: "bold" }}>
                      Deleted cards 
                      <AutoScalingText baseSize={12} style={{color:"red"}}>
                        {" "}cannot{" "}</AutoScalingText>
                        be recovered later!
                    </AutoScalingText>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        paddingHorizontal: 20,
                      }}>
                      <TouchableOpacity
                        onPress={handleDelete}
                        style={{
                          backgroundColor: "#e40000ff",
                          padding: 7,
                          paddingHorizontal: 25,
                          borderRadius: 99,
                        }}>
                        <AutoScalingText baseSize={12} 
                        style={{ color: "white", fontWeight: "bold" }}>
                          Delete
                        </AutoScalingText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => tggDelete(false)}
                        style={{
                          borderWidth: 4,
                          padding: 7,
                          paddingHorizontal: 25,
                          borderRadius: 99,
                        }}>
                        <AutoScalingText baseSize={12} 
                        style={{ fontWeight: "bold" }}>Cancel</AutoScalingText>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
            </KeyboardAvoidingView>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              paddingHorizontal: 5,
              paddingTop: scaleElement(20),
            paddingBottom: scaleElement(1)
            }}>
            <TouchableOpacity
              onPress={async ()=> submitAction(frontState, backState, selectedColor)}
              style={{
                backgroundColor: "#1e00ffff",
                padding: scaleElement(2),
                paddingHorizontal: scaleElement(15),
                borderRadius: 99,
                justifyContent:"center",
                alignItems:"center",
                alignContent:"center",
              }}>
              <AutoScalingText baseSize={15}
              style={{
                textAlign: "center",
                color: "white",
                fontWeight: "bold"
                }}>
                Edit
              </AutoScalingText>
            </TouchableOpacity>
            <TouchableOpacity onPress={copyText}
              style={{
                backgroundColor: "rgb(0, 106, 255)",
                padding: scaleElement(2),
                paddingHorizontal: scaleElement(15),
                borderRadius: 99,
                justifyContent:"center",
                alignItems:"center",
                alignContent:"center",
              }}>
              <AutoScalingText baseSize={15}
                style={{
                  textAlign: "center",
                  fontWeight:"bold",
                  color:"white",
                }}>
                Copy
              </AutoScalingText>
            </TouchableOpacity>

              <TouchableOpacity onPress={onShare}
                style={{
                  backgroundColor: "#b0b0b0ff",
                  padding: scaleElement(2),
                  paddingHorizontal: scaleElement(15),
                  borderRadius: 99,
                }}>
                <AutoScalingText baseSize={18}
                  style={{
                    borderRadius: 6,
                    textAlign: "center",
                  }}>
                  📲
                </AutoScalingText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => tggDelete(true)}
                style={{
                  backgroundColor: "#c20000ff",
                  padding: scaleElement(2),
                  paddingHorizontal: scaleElement(15),
                  borderRadius: 99,
                }}>
                <AutoScalingText baseSize={18} style={{ color: "white", fontWeight: "bold" }}>
                  🗑️
                </AutoScalingText>
              </TouchableOpacity>
          </View>
                <Pressable
                onPress={handleClose}
                style={({pressed})=>[{
                  opacity: pressed ? 0.5 : 1,// Mimics TouchableOpacity
                  paddingTop: scaleElement(10),
                }]}>
                <AutoScalingText baseSize={14}
                  style={{
                    textAlign: "center",
                    paddingVertical: 3,
                    paddingHorizontal: 6,
                    color:"white"
                    }}>
                    Cancel
                </AutoScalingText>
                </Pressable>
                {showCopied && (
                <View
                  style={{
                    position:"absolute",
                    alignSelf:"center",
                    top:scaleElement(55),
                  }}>
                  <AutoScalingText baseSize={15}
                    style={{
                      borderRadius: 99,
                      padding: scaleElement(4),
                      backgroundColor: "#00d420ff",
                      fontWeight: "bold",
                      color: "white",
                      textAlign: "center",
                    }}>
                    ✓ Text Copied!
                  </AutoScalingText>
                </View>
              )}
      </View>
    </Modal>
  )
}
