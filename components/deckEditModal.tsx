import { useScale } from "@/components/autoElementScaling";
import React, { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, ModalProps, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated from "react-native-reanimated";
import AutoScalingText from './autoScalingText';

type PROPS = ModalProps & {
  DeckNAME: string
  isOpen: boolean //is the modal open? t/f
  tutorialActive: boolean
  openAction: Function
  closeAction: Function
  renameAction: Function
  deleteAction: Function
}

export const DeckEditModal = ({isOpen, tutorialActive, DeckNAME, openAction, closeAction, renameAction, deleteAction, ...rest}: PROPS) => {
  const [modalMode, setModalMode] = useState("menu");
  const [newTitle, setNewTitle] = useState(DeckNAME);
  const { scaleElement } = useScale();
  
  function handleClose(){//needed so compiler won't complain
    setModalMode("menu");
    setNewTitle("");
    closeAction();
  }
  function handleOpen(){//needed so compiler won't complain
    openAction();
  }

  return (
    <Modal 
    visible={isOpen}
    transparent
    animationType="fade"
    statusBarTranslucent
    {...rest}>
    <View 
      onPointerLeave={Keyboard.dismiss}
      style={{width: "100%", height: "100%", position: "absolute", zIndex: 10}}>
      <TouchableOpacity onPress={handleClose} style={{backgroundColor: "#00000080", width: "100%", height: "100%", position: "absolute", zIndex: 15}}/>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ width: "95%", backgroundColor: "white", borderRadius: 50, top: "25%", position: "absolute", zIndex: 20, alignSelf: "center", padding: 4}}>
          {modalMode == "menu" && 
          <View>
            {tutorialActive==true &&
              <Animated.View 
                style={{flexDirection: "row", justifyContent: "space-between", position:"absolute", top:"29%", right:"25%",
                  animationName: {'75%': {transform: [{translateX: 35}]}},
                  animationIterationCount: "infinite",
                  animationDuration: '1s',
                  animationTimingFunction: 'ease-in-out'}}>
                <AutoScalingText baseSize={15}>
                  👈</AutoScalingText>
                        </Animated.View>}
                    <AutoScalingText baseSize={18} style={{fontWeight: "bold", color: "blue", textAlign: "center", marginBottom: "5%"}}>{DeckNAME}</AutoScalingText>
                    <View style={{alignItems: "center", justifyContent: "center", gap: 10}} className="items-center justify-center gap-y-4">
                        <TouchableOpacity onPress={handleOpen}>
                            <AutoScalingText baseSize={14} style={{width:"50%", backgroundColor: "rgb(27, 227, 27)", borderRadius: 99, padding: 8, fontWeight: "bold", color: "white", paddingHorizontal: 20, textAlign: "center"}}>Open</AutoScalingText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>{setModalMode("rename");}}>
                        <AutoScalingText baseSize={14} style={{width:"50%", backgroundColor: "gray", borderRadius: 99, padding: 8, fontWeight: "bold", color: "white", paddingHorizontal: 20, textAlign: "center"}}>Rename</AutoScalingText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>setModalMode("delete")}>
                        <AutoScalingText baseSize={14} style={{width:"50%", backgroundColor: "#ea3e3eff", borderRadius: 99, padding: 8, marginBottom:"5%", fontWeight: "bold", color: "white", paddingHorizontal: 20, textAlign: "center"}}>Delete</AutoScalingText>
                        </TouchableOpacity>
                    </View>
                </View>}
                {modalMode == "rename" && 
                    <View>
                    <AutoScalingText baseSize={13} style={{textAlign: "center", fontWeight: "bold", paddingVertical: 15}}>
                      ⎣ Rename Deck ⎤</AutoScalingText>
                    <TextInput
                        style={{margin: scaleElement(16), fontSize: scaleElement(16), marginHorizontal: 15, marginBottom: 25, borderBottomWidth: 1}}
                        value={newTitle}
                        onChangeText={setNewTitle}
                        placeholder={DeckNAME}
                        maxLength={30}/>
                        <TouchableOpacity onPress={async ()=>{ await renameAction(newTitle); setModalMode("menu"); setNewTitle("");}} 
                        style={{
                            backgroundColor: "#2762e2ff", 
                            borderRadius: 99, 
                            marginVertical: 10, 
                            width:"50%",
                            alignSelf:"center",
                            justifyContent: "center", 
                            padding: 7
                            }}>
                            <AutoScalingText baseSize={14} style={{textAlign: "center", color: "white", fontWeight: "bold"}}>
                              Rename</AutoScalingText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>{setModalMode("menu");}} style={{position: "absolute", top: "7%", left: "5%"}}>
                            <AutoScalingText baseSize={18} style={{fontWeight: "bold"}}>
                              ←</AutoScalingText>
                        </TouchableOpacity>
                    </View>}
              {modalMode == "delete" &&
                <View>
                    <TouchableOpacity onPress={()=>{setModalMode("menu");}} style={{position: "absolute", top: "7%", left: "5%", zIndex: 50}}>
                        <AutoScalingText baseSize={18} style={{fontWeight: "bold"}}>←</AutoScalingText>
                    </TouchableOpacity>
                    <AutoScalingText baseSize={18} style={{textAlign: "center", color: "red", paddingVertical: 15, fontWeight: "bold"}}>Delete '{DeckNAME}'?</AutoScalingText>
                  <AutoScalingText baseSize={16} style={{paddingHorizontal: 5, fontWeight: "bold", textAlign: "center"}}>
                    This deck will be removed from your deck list<Text style={{color:"red"}}>{' '}permanently</Text>. 
                    Deleted decks<Text style={{color:"red"}}>{' '}cannot{' '}</Text>be recovered.</AutoScalingText>
                  <TouchableOpacity onPress={async ()=>{ await deleteAction(); setModalMode("menu"); }} style={{margin: 25}}>
                    <AutoScalingText baseSize={14} style={{ textAlign: "center", color: "white", backgroundColor: "#f22b2bff", padding: 6, borderRadius: 99}}>Delete Forever</AutoScalingText>
                  </TouchableOpacity>
                </View>}
            </KeyboardAvoidingView>
        </View>
    </Modal>
  )
}
export default DeckEditModal;