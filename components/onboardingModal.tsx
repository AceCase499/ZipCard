import OBslides from '@/assets/onboardSlides';
import { useScale } from "@/components/autoElementScaling";
import React, { useRef, useState } from 'react';
import { Animated, FlatList, Modal, ModalProps, StyleSheet, TouchableOpacity, useWindowDimensions, View, ViewToken } from 'react-native';
import Animated2 from "react-native-reanimated";
import OnboardingItem from "../assets/onboardItem";
import AutoScalingText from "./autoScalingText";

type PROPS = ModalProps & {
  isOpen: boolean;
  submitAction: () => void; // precise
};

export const OnboardingModal = ({isOpen, children, submitAction, ...rest}: PROPS) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef(null)    
    const { width } = useWindowDimensions();
    const containerWidth = width * 0.95;
    const { scaleElement } = useScale();

    const viewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0) {
        const index = viewableItems[0].index;
        if (index !== null) setCurrentIndex(index);
        }
    }).current;

    const viewConfig = useRef({viewAreaCoveragePercentThreshold: 50}).current

  return (
    <Modal 
    visible={isOpen}
    transparent
    animationType="fade"
    statusBarTranslucent
    {...rest}>

        <View style={{alignItems: "center", justifyContent: "center", flex: 1, padding: 3, backgroundColor: "#00000080"}}>

            <View style={{height: "70%", width: "95%", backgroundColor: "white", borderRadius: 50, alignSelf: "center", padding: 4, marginBottom: scaleElement(30)}}>

                <FlatList
                data={OBslides} 
                renderItem={({item})=> <OnboardingItem item ={item} width={containerWidth}/>} 
                horizontal
                showsHorizontalScrollIndicator
                pagingEnabled
                bounces={false}
                keyExtractor={(item) => item.id}
                onScroll={Animated.event([{nativeEvent: {contentOffset: {x: scrollX}}}],{
                    useNativeDriver: false,
                })}
                scrollEventThrottle={32}
                onViewableItemsChanged={viewableItemsChanged}
                viewabilityConfig={viewConfig}
                ref={slidesRef}
                snapToInterval={containerWidth}
                decelerationRate="fast"
                getItemLayout={(_, index) => ({
                    length: containerWidth,
                    offset: containerWidth * index,
                    index,
                })}
                />
            
                <View {...(currentIndex !== 3 && {pointerEvents: "none"})}
                style={{
                  position:"absolute",
                  bottom:"1%",
                  left: "50%",//truly centered absolute position 1/2
                  transform: [{ translateX: '-50%' }],//truly centered absolute position 2/2
                  justifyContent: "center", 
                  flexDirection: "row",
                  }}>
                  {currentIndex != 3 && (
                    <Animated2.View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        animationName: { "75%": { transform: [{ translateX: -35 }] } },
                        animationIterationCount: "infinite",
                        animationDuration: "1.5s",
                        animationTimingFunction: "ease-in-out",
                      }}>
                      <AutoScalingText baseSize={23}
                      style={{
                        fontStyle:"italic",
                        color:"gray",
                      }}>Swipe 👉</AutoScalingText>
                    </Animated2.View>
                    )}
                    {currentIndex == 3 &&
                    <Animated2.View 
                    style={{
                      animationName: {
                        "0%": { transform: [{ scale: 1 }] },
                        "50%": { transform: [{ scale: 0.9 }] },
                        "100%": { transform: [{ scale: 1 }] },
                      },
                      animationIterationCount: "infinite",
                      animationDuration: "1.5s",
                      animationTimingFunction: "ease-in-out",
                    }}>
                      <TouchableOpacity onPress={submitAction} disabled={currentIndex!=3}
                          style={stylings.btnEnabled}>
                          <AutoScalingText baseSize={17}
                          style={{
                            textAlign: "center",
                            fontWeight: "bold",
                            color: "white",
                            paddingVertical: 3,
                            paddingHorizontal: 6
                            }}>
                              {`Claim (+15✪)`}</AutoScalingText>
                      </TouchableOpacity>
                    </Animated2.View>}
                </View>
            </View>
        </View>
    </Modal>
  )
}

const stylings = StyleSheet.create({
  btnEnabled: {
    backgroundColor: "blue", borderRadius: 99, padding: 8, paddingHorizontal: 20
  },
  btnDisabled: {
    backgroundColor: "#858585ff", borderRadius: 99, padding: 8, paddingHorizontal: 20
  }
});