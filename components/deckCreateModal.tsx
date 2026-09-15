import { useScale } from "@/components/autoElementScaling";
import React, { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, ModalProps, Platform, Modal as RNModel, TextInput, TouchableOpacity, View } from 'react-native';
import AutoScalingText from './autoScalingText';

type PROPS = ModalProps & {
    isOpen: boolean //is the modal open? t/f
    tutorialActive: boolean
    submitAction: Function //what function should run?
    closeAction: Function //what function should run?
}

export const DeckCreateModal = ({isOpen, tutorialActive, submitAction, closeAction, ...rest}: PROPS) => {
    const [deckTitle, setDeckTitle] = useState('');
    const { scaleElement } = useScale();

    function emptyFields(){
        setDeckTitle("")
    }
    function handleClose(){//needed so compiler won't complain
        closeAction();
    }

    useEffect(() => {
            emptyFields()
          }, [isOpen]);

    
  return (
    <RNModel 
    visible={isOpen}
    transparent
    animationType="fade"
    statusBarTranslucent
    {...rest}>
        <View 
            onPointerLeave={Keyboard.dismiss}
            style={{
                width: "100%", 
                height: "100%", 
                position: "absolute", 
                zIndex: 10
                }}>
                <TouchableOpacity onPress={handleClose} style={{backgroundColor: "#00000080", width: "100%", height: "100%", position: "absolute", zIndex: 15}}>
                </TouchableOpacity>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{
                    height: "26%", 
                    width: "95%", 
                    backgroundColor: "white", 
                    borderRadius: 50, 
                    top: "25%", 
                    position: "absolute", 
                    zIndex: 20, 
                    alignSelf: "center", 
                    padding: 4
                    }}>
                    <AutoScalingText baseSize={12} style={{color: "blue", fontWeight: "bold", padding: 15, textAlign: "center"}}>⎣ New Card Deck ⎤</AutoScalingText>
                    <TextInput
                        style={{margin: scaleElement(16), fontSize: scaleElement(16), marginHorizontal: 15, marginBottom: 25, borderBottomWidth: 1}}
                        value={deckTitle}
                        onChangeText={setDeckTitle}
                        placeholder='Name this card deck...'
                        maxLength={30}/>
                    <TouchableOpacity onPress={()=>{submitAction(deckTitle); setDeckTitle("");}}
                        style={{
                            marginTop: scaleElement(9),
                            height: scaleElement(50),
                            alignSelf: "center",
                        }}
                        >
                        <AutoScalingText baseSize={12} 
                        style={{
                            borderRadius: 99, 
                            color: "white", 
                            backgroundColor: "blue", 
                            padding: scaleElement(7), 
                            paddingHorizontal: scaleElement(20), 
                            fontWeight: "bold"
                            }}>
                            {tutorialActive==true ? 
                            `Create Deck` 
                            : 
                            `Create Deck (-3✪)`}</AutoScalingText>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
        </View>
    </RNModel>
  )
}
export default DeckCreateModal;