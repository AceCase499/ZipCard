import { useScale } from "@/components/autoElementScaling";
import AutoScalingText from "@/components/autoScalingText";
import { CardCreateModal } from "@/components/cardCreateModal";
import { EditCardModal } from "@/components/cardEditModal";
import CreditCounter from "@/components/creditCounter";
import CreditWarning from "@/components/creditWarning";
import FlipCard from "@/components/FlipCard";
import {
  getCredits,
  getDrClaimStatus,
  getZSTrialTime,
  newCardCharge,
  quizCharge,
  tutorialReward,
} from "@/components/IAP";
import { OnboardingModal } from "@/components/onboardingModal";
import QuizModal from "@/components/quizModal";
import {
  deleteCardFromDeck,
  getCardsForDeck,
  getTutorialActive,
    /* resetDR, */ saveToDeck,
  setTutorialActive,
  updateCardInDeck
} from "@/components/Storage";
import StoreModal from "@/components/storeModal";
import TimerScreen from "@/components/trialTimeKeeper";
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  TouchableOpacity,
  View
} from "react-native";
import Animated from "react-native-reanimated";

const EditDeck = () => {
  const [cardDeck, setCardDeck] = useState<Card[]>([]);
  const [openNew, tggOpenNew] = useState(false);
  const [openEdit, tggOpenEdit] = useState(false);
  const [openQuiz, tggQuiz] = useState(false);
  const [deleteDialogue, tggDeleteDialogue] = useState(false); // breifly display 'Card Deleted' popup
  const [openOnboard, tggOnboard] = useState(false);
  const [selCard, setSelCard] = useState<Card>({
    cardId: 0,
    order: 0,
    front: "front",
    back: "back",
    color: "white",
  });
  const [testState, tggTestState] = useState(false);
  const [edittingTextF, editFront] = useState(selCard.front);
  const [edittingTextB, editBack] = useState(selCard.back);
  const [selectedColor, editColor] = useState(selCard.color);
  const flatListRef = useRef<FlatList<Card>>(null);
  const [notifs, setNotifs] = useState<[{ id: number; message: string }]>([
    { id: 0, message: "placeholder" },
  ]);
  const [ta, setTa] = useState(true);
  const [drClaimed, setDrClaimed] = useState(false);
  const [tutPhase, setTutPhase] = useState(1);
  const [credWarning, tggCredWarning] = useState(false);
  const [storeGui, tggStoreGui] = useState(false);
  const router = useRouter();
  const { scaleElement } = useScale();

  type Card = {
    cardId: number;
    order: number;
    front: string;
    back: string;
    color: string;
  };
  type EditDeckParams = {
    DeckID: number;
    DeckNAME: string;
  };

  // Remove useRoute and RouteProp logic
  const params = useLocalSearchParams();
  const DeckID = Number(params.DeckID);
  const DeckNAME = params.DeckNAME ?? "";
  const [FEcred, setFEcred] = useState(0);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      //navigation.getParent()?.setOptions?.({ gestureEnabled: !ta });

      (async () => {
        let temp = await getDrClaimStatus();
        setDrClaimed(temp);
        //await resetDR()
        let ta = await getTutorialActive();
        setTa(ta);
        if (DeckID != null && !isNaN(DeckID)) {
          const cards = await getCardsForDeck(DeckID);
          setCardDeck(cards);
        }
      })();
    }, []),
  );

  async function goToQuiz() {
    if (cardDeck.length < 5) {
      alert("Create 5 or more cards in this deck to start taking a quiz.");
      return;
    }
    const ztt = await getZSTrialTime();
    const creditss = await getCredits();
    if(ztt > 0){
      tggQuiz(false);
      router.push({
        pathname: "/Screens/Quiz/page",
        params: { DeckID: DeckID.toString() },
      });
    }
    if (drClaimed == true && creditss - 6 < 0) {
      tggQuiz(false);
      tggCredWarning(true);
      return;
    }
    if (drClaimed == true) {
      quizCharge();
    }
    tggQuiz(false);
    router.push({
      pathname: "/Screens/Quiz/page",
      params: { DeckID: DeckID.toString() },
    });
  }

  function scrollToBottom() {
    const timer = setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 10);
    return () => clearTimeout(timer);
  }

  async function newCard(front: string, back: string, color: string) {
    //DO NOT CHARGE THE USER FOR CREDITS IF THEY ARE IN TUTORIAL MODE
    //console.log(`create new card\n${front}\n${back}\n${color}\n`)
    if (!front.trim() || !back.trim()) return;

    const currentCred = await getCredits();
    const ztt = await getZSTrialTime();

    if (ta == false && ztt <= 0) {
      if (currentCred - 1 < 0) {
        tggCredWarning(true);
        return;
      } else {
        let temp = currentCred - 1;
        setFEcred(temp); //update frontend credit value
        newCardCharge(); //update backend credit value
      }
    }

    const saved = await saveToDeck(DeckID, front, back, color);
    setCardDeck((prev) => [...prev, saved]);
    tggOpenNew(false);
    scrollToBottom();
    setTutPhase(tutPhase + 1);
  }

  async function editCard(front: string, back: string, color: string) {
  const newCard = {
    ...selCard,
    front,
    back,
    color,
  };
  try {
    await updateCardInDeck(DeckID, newCard);
    // update UI
    setSelCard(newCard);

    const thisDeck = cardDeck;//a temporary CLONE of the current deck
    const thisCardIndex = thisDeck.findIndex(d => String(d.cardId) === String(selCard.cardId));
    if (thisCardIndex === -1) {
      alert(`No deck with ID ${selCard.cardId} exists.`);
      return;
    }
    setCardDeck(prev =>
      prev.map(card => card.cardId === newCard.cardId ? newCard : card));    
    tggOpenEdit(false);
  } catch (err) {
    console.error("Failed to update card on backend:", err);
  }
}

  async function deleteCard() {
    try {
      // call backend first
      await deleteCardFromDeck(DeckID, selCard.cardId);

      // then update frontend state
      setCardDeck((prev) =>
        prev.filter((card) => card.cardId !== selCard.cardId),
      );

      tggOpenEdit(false);
      tggDeleteDialogue(true);
      setTimeout(() => tggDeleteDialogue(false), 2000);
    } catch (err) {
      console.error("Failed to delete card on backend:", err);
      alert("Could not delete card. Please try again.");
    }
  }

  function getCardColor(clr: string, side: boolean) {
    const c = (clr ?? "white").toLowerCase();
    if (c.includes("white")) return side ? "#c2c2c2" : "#ffffff";
    if (c.includes("red")) return side ? "#b80000ff" : "#ff2e2eff";
    if (c.includes("green")) return side ? "#0fda00ff" : "#65ff5aff";
    if (c.includes("yellow")) return side ? "#e3c400ff" : "#ffe640ff";
    if (c.includes("blue")) return side ? "#008de5ff" : "#73c9ffff";
    /* white by default */ return side ? "#c2c2c2" : "#ffffff";
  }

  function getBorderColor(colorName: string, colorBG: string) {
    if (selCard.color == colorName) {
      return "black";
    } else {
      if (colorName == "white") {
        return "gray";
      } else return colorBG;
    }
  }

  async function tutorialComplete() {
    tggOnboard(false);
    tutorialReward();
    await setTutorialActive(false);
    setTa(false);
  }

  async function openCardCreate() {
    let currentCred = await getCredits();
    if (currentCred <= 0 && ta == false) {
      tggCredWarning(true);
      return;
    }
    if (ta == true) {
      setTutPhase(tutPhase + 1);
    }
    tggOpenNew(true);
  }

  function closeWarningOpenStore() {
    tggCredWarning(false);
    tggStoreGui(true);
  }

  function openEditScreen(item: Card){
    //console.log(`${item}\n${item.front}\n${item.back}\n${item.color}\n`)
    setSelCard(item);
    editFront(item.front);
    editBack(item.back);
    editColor(item.color);
    tggOpenEdit(true);
  }
  return (
    <View
      style={{
        backgroundColor: "#c6c6c6ff",
        height: "100%",
        paddingTop: scaleElement(50),
      }}>
      <AutoScalingText
        baseSize={16}
        style={{
          textAlign: "center",
          paddingBottom: scaleElement(3),
          fontWeight: "bold",
          color: "blue",
        }}>
        {DeckNAME}
      </AutoScalingText>
      {ta == false && (<CreditCounter/>)}
      {/* <Text>{`${drClaimed}`}</Text>*/}
      <View
        style={{
          width: "125%",
          flexDirection: "row",
          justifyContent: "space-between",
          padding: scaleElement(6),
        }}>
        <TouchableOpacity
          onPress={() => router.push({ pathname: "../" })}
          hitSlop={45}
          disabled={ta == true ? true : false}
          style={{
            width:"15%",
            justifyContent: "center",
            alignSelf:"center",
            backgroundColor: "white",
            borderRadius: 99,
          }}>
          <AutoScalingText baseSize={25}
            style={{ 
            fontWeight: "bold", 
            textAlign: "center", 
            justifyContent: "center",
            alignSelf:"center",
              }}>
            ←
          </AutoScalingText>
        </TouchableOpacity>

        {cardDeck.length >= 5 ? (
          <TouchableOpacity
            onPress={() => tggQuiz(true)}
            hitSlop={20}
            style={{
              aspectRatio:1,
              backgroundColor: "#FFD700",
              borderRadius: 99,
              padding:"1%",
              top: "20%",
              left: "70%",
              justifyContent: "center",
              position: "absolute",
              shadowColor: "#FFD700", // gold glow
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 16,
              elevation: 12, // Android glow
            }}>
            {drClaimed == false && (
              <View>
                <View
                  style={{
                    width: scaleElement(16),
                    height: scaleElement(16),
                    backgroundColor: "red",
                    borderRadius: 99,
                    position: "absolute",
                    zIndex: 30,
                    top: "-27%",
                    left: "-27%",
                  }}/>
                <Animated.View
                  style={{
                    width: scaleElement(16),
                    height: scaleElement(16),
                    backgroundColor: "red",
                    borderRadius: 99,
                    position: "absolute",
                    zIndex: 30,
                    top: "-27%",
                    left: "-27%",
                    animationName: {
                      "100%": { transform: [{ scale: 2 }], opacity: 0 },
                    },
                    animationIterationCount: "infinite",
                    animationDuration: "1s",
                  }}/>
              </View>
            )}
            <AutoScalingText baseSize={20} 
            style={{ textAlign: "center" }}>
              💡</AutoScalingText>
          </TouchableOpacity>
        ) : (
          <View
            style={{
              position: "absolute",
              left: "43%",
              top: "8%",
              height: "500%",
              width: "60%",
            }}>
            <TouchableOpacity onPress={goToQuiz}>
              <View
                style={{
                  width: "60%",
                  height: "36%",
                  top: "6%",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 10,
                  borderRadius: 99,
                }}>
                <View
                  style={{
                    backgroundColor: "gray",
                    borderRadius: 99,
                    width: "70%",
                  }}>
                  <View
                    style={{
                      borderRadius: 99,
                      backgroundColor: "#3eea3eff",
                      height: "100%",
                      width: `${(Math.min(cardDeck.length, 5) / 5) * 100}%`,
                    }}>
                  </View>
                </View>
                <AutoScalingText baseSize={18}
                  style={{
                    borderRadius: 99,
                    aspectRatio:1,
                    backgroundColor: "gray",
                    textAlign: "center",
                  }}>
                  💡</AutoScalingText>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        data={cardDeck}
        ref={flatListRef}
        style={{ height: "82%" }}
        renderItem={({ item }) => (
          <View style={{ width: "50%" }}>
            <FlipCard
              frontSide={item.front ?? "Front"}
              backSide={item.back ?? "Back"}
              fColor={getCardColor(item.color ?? "white", false)} //false: get front side color
              bColor={getCardColor(item.color ?? "white", true)} //true: get back side color
              demo={false}>
            </FlipCard>
            <Pressable
              //hitSlop={10}
              onPress={()=>openEditScreen(item)}
              style={({pressed})=>[{
                opacity: pressed ? 0.5 : 1,// Mimics TouchableOpacity
                position: "absolute", 
                zIndex: 10,
                justifyContent: "center", 
                height: scaleElement(40),
                width: scaleElement(40),
                bottom: "4%", 
                right: "4%", 
              }]}>
              <AutoScalingText baseSize={17}
                style={
                  ta == true && tutPhase == 4
                    ? {//Icon with Red Circle
                      borderRadius: 99, 
                      borderWidth:6, 
                      borderColor:"red", 
                      textAlign: "center", 
                      }
                    : {//Icon, no highlight
                      borderRadius: 99, 
                      textAlign: "center", 
                      }
                }>
                ✏️{/* //////////////////////////////////////////////✏️✏️✏️///////////////////////// */}
              </AutoScalingText>
            </Pressable>
          </View>
        )}
        keyExtractor={(item) => item.cardId.toString()}
        numColumns={2} // This creates the two-column layout
        columnWrapperStyle={{ justifyContent: "space-between" }} // Optional: for spacing between columns
      />

      {ta == true && tutPhase == 3 && (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            left: "34%",
            top: "42%",
            width: "70%",
            shadowColor: "#FFD700", // gold glow
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 6,
            elevation: 12, // Android glow
          }}
        >
          <AutoScalingText baseSize={16}
            style={{ fontWeight: "bold", textAlign: "center" }}
          >{`Tap your card\nto flip it.\nTry it now!`}</AutoScalingText>
          <TouchableOpacity
            onPress={() => setTutPhase(tutPhase + 1)}
            style={{
              backgroundColor: "#5f92ffff",
              width: "35%",
              borderRadius: 10,
              paddingHorizontal: "3%",
            }}
          >
            <AutoScalingText baseSize={14}
              style={{
                padding: "8%",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Got it
            </AutoScalingText>
          </TouchableOpacity>
        </View>
      )}

      {ta == true && tutPhase == 4 && (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            left: "15%",
            top: "60%",
            width: "70%",
            shadowColor: "#FFD700", // gold glow
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 6,
            elevation: 12, // Android glow
          }}
        >
          <AutoScalingText baseSize={16}
            style={{ fontWeight: "bold", textAlign: "center" }}
          >{`Tap the icon in the corner of a card to enter edit mode.`}</AutoScalingText>
          <TouchableOpacity
            onPress={() => setTutPhase(tutPhase + 1)}
            style={{
              backgroundColor: "#5f92ffff",
              width: "35%",
              borderRadius: 10,
              paddingHorizontal: "3%",
            }}
          >
            <AutoScalingText baseSize={16}
              style={{
                padding: "8%",
                textAlign: "center",
                fontWeight: "bold",
              }}>
              Got it
            </AutoScalingText>
          </TouchableOpacity>
        </View>
      )}

      {ta == true && tutPhase == 5 && (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            left: "30%",
            top: scaleElement(120),
            width: "70%",
            shadowColor: "#FFD700", // gold glow
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 6,
            elevation: 12, // Android glow
          }}>
          <AutoScalingText baseSize={16}
            style={{
              fontWeight: "bold",
              textAlign: "center",
              shadowColor: "#FFD700", // gold glow
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 1,
              shadowRadius: 6,
              elevation: 12, // Android glow
            }}>
            {`👆\nYou can take quizzes\nafter you fill a deck\nwith at least 5 cards.`}</AutoScalingText>
          <TouchableOpacity
            onPress={() => {
              setTutPhase(tutPhase + 1);
              tggOnboard(true);
            }}
            style={{
              backgroundColor: "#5f92ffff",
              width: "35%",
              borderRadius: 10,
              paddingHorizontal: "3%",
            }}
          >
            <AutoScalingText baseSize={14}
              style={{
                padding: "8%",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Got it
            </AutoScalingText>
          </TouchableOpacity>
        </View>
      )}

      {ta == true && tutPhase == 1 && (
        <AutoScalingText baseSize={16}
          style={{
            position: "absolute",
            right: "30%",
            top: "83%",
            fontWeight: "bold",
            shadowColor: "#FFD700", // gold glow
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 6,
            elevation: 12, // Android glow
          }}
        >{`💡Tap here to💡\ncreate a Zip Card`}</AutoScalingText>
      )}
      {ta == true && tutPhase == 1 && (
        <Animated.View
          style={{
            position: "absolute",
            left: "65%",
            top: "92%",
            flexDirection: "row",
            justifyContent: "space-between",
            animationName: { "75%": { transform: [{ translateX: -35 }] } },
            animationIterationCount: "infinite",
            animationDuration: "1s",
            animationTimingFunction: "ease-in-out",
          }}>
          <AutoScalingText baseSize={26}>👉</AutoScalingText>
        </Animated.View>
      )}
      {/*VV CARD+ button */}
      <TouchableOpacity /* Circular Button? */
        onPress={openCardCreate}
        hitSlop={45}
        disabled={ta == true && tutPhase != 1 ? true : false}
        style={{
          position: "absolute",
          right: "7%",
          bottom: "10%",
          zIndex: 3,
          borderRadius: 99,
          backgroundColor: "#63b9ffff",
          shadowColor: "#000",
          shadowOffset: { width: 2, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 4,
          elevation: 5,
        }}>
        <AutoScalingText baseSize={25}
        style={{ 
          color: "#2563eb", 
          textAlign: "center",
          borderRadius: 99,
          padding: "2%",
          aspectRatio:1,
          justifyContent:"center",
          alignSelf:"center",
          }}>
          +
        </AutoScalingText>
      </TouchableOpacity>
      {ta == true && tutPhase == 1 && (
        <Animated.View
          style={{
            backgroundColor: "#2563eb",
            borderRadius: 99,
            position: "absolute",
            zIndex: 1,
            right: "7%",
            bottom: "10%",
            animationName: {
              "100%": { transform: [{ scale: 2 }], opacity: 0 },
            },
            animationIterationCount: "infinite",
            animationDuration: "1s",
          }}>
          <AutoScalingText baseSize={25}
            style={{
              color:"transparent",
              textAlign: "center",
              borderRadius: 99,
              padding: "2%",
              aspectRatio:1,
              justifyContent:"center",
              alignSelf:"center",
            }}
          >+</AutoScalingText>
        </Animated.View>
      )}

      <EditCardModal ///////////////////////////////////EDIT CARD MODAL////////////////////////////////
      isOpen={openEdit}
      submitAction={editCard}
      Front={edittingTextF}
      Back={edittingTextB}
      Color={selectedColor}
      deleteAction={deleteCard}
      closeAction={()=>tggOpenEdit(false)}
      ></EditCardModal>

      {deleteDialogue && (
        <View
          style={{
            backgroundColor: "#ff2222ff",
            padding: "2%",
            position: "absolute",
            zIndex: 30,
            borderRadius: 99,
            alignSelf: "center",
            top: 75,
          }}>
          <AutoScalingText baseSize={15} 
          style={{ color: "white", fontWeight: "bold"}}>
            Card Deleted
          </AutoScalingText>
        </View>
      )}
      <CardCreateModal
        isOpen={openNew}
        tutorialActive={ta}
        closeAction={() => tggOpenNew(false)}
        submitAction={newCard}
      />
      {/* TEST MODAL: Works fine */}
      <Modal 
      visible={testState}
      transparent
      animationType="fade"
      statusBarTranslucent>
        <View
          style={{
          backgroundColor:"white",
          padding:"5%",
          paddingHorizontal:"2%",
          width:"95%",
          alignSelf:"center"
          }}>
          <TouchableOpacity onPress={()=>tggTestState(!testState)}>
            <AutoScalingText baseSize={12}
              style={{
                margin: 10,
                textAlign: "center",
                fontWeight: "bold",
                color: "white",
                backgroundColor: "blue",
                padding: 4,
                borderRadius: 99,
                paddingHorizontal: 25,
              }}>
              Test #2
            </AutoScalingText>
          </TouchableOpacity>
        </View>
      </Modal>
      <QuizModal
        isOpen={openQuiz}
        navAction={goToQuiz}
        closeAction={() => {
          tggQuiz(false);
        }}
      />
      <OnboardingModal isOpen={openOnboard} submitAction={tutorialComplete} />
      <CreditWarning
        isOpen={credWarning}
        openAction={closeWarningOpenStore}
        closeAction={() => tggCredWarning(false)}
        adAction={() => alert("Play a video ad now!")}
      />
      <StoreModal isOpen={storeGui} closeAction={() => tggStoreGui(false)} />
      <TimerScreen/>
    </View>
  );
};

export default EditDeck;
