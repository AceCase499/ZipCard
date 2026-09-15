import BG from "@/assets/images/home.png";
import { useScale } from "@/components/autoElementScaling";
import AutoScalingText from "@/components/autoScalingText";
import CreditsCounter from "@/components/creditCounter";
import CreditWarning from "@/components/creditWarning";
import DeckCreateModal from "@/components/deckCreateModal";
import DeckEditModal from "@/components/deckEditModal";
import {
  getCredits,
  getDrClaimStatus,
  getZSTrialTime,
  newDeckCharge
} from "@/components/IAP";
import {
  deleteDeck,
  getTutorialActive,
  loadDeckList,
  renameDeck,
  saveDecks,
  setRecents,
} from "@/components/Storage";
import StoreModal from "@/components/storeModal";
import TimerScreen from "@/components/trialTimeKeeper";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View
} from "react-native";
import Animated from "react-native-reanimated";

const DeckList = () => {
  const [tutPhase, setTutPhase] = useState(1);
  const [editDeckModalOpen, tggEditDeck] = useState(false);
  const [newDeckModal, tggNewDeckModal] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState({});
  const [ta, setTa] = useState(true);
  const [currentCred, setCred] = useState(0);
  const [drClaimed, setDrClaimed] = useState(false);
  const [credWarning, tggCredWarning] = useState(false);
  const [storeModalOpen, tggStoreModalOpen] = useState(false);
  const [testState, tggTestState] = useState(false);

  const [Decks, setDecks] = useState([]);
  const router = useRouter();
  const { scaleElement } = useScale();

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        try {
          //await setCredits(0);
          //await clearRecents();
          //setTutorialActive(true);
          let temp = await getDrClaimStatus();
          setDrClaimed(temp);
          setCred(await getCredits());
          let TA = await getTutorialActive();
          setTa(TA);
          const list = await loadDeckList();
          setDecks(list);
        } catch (err) {
          console.error("Failed to load recently opened:", err);
          setDecks([]);
        }
      })();
    }, [newDeckModal, editDeckModalOpen]),
  );

  function goOpenDeck(deck) {
    tggEditDeck(false);
    setRecents(deck);
    router.push({
      pathname: "/Screens/EditDeck/page",
      params: { DeckID: deck.DeckID, DeckNAME: deck.DeckNAME },
    });
  }

  async function createDeck(deckName) {
    if (!deckName.trim()) return;
    const ztt = await getZSTrialTime();
    /* 
    tut complete, zss active -- do not charge
    tut not complete, zss inactive -- do not charge
    tut complete, zss inactive -- charge
    tut not complete, zss active -- do not charge
    */
    if (ta == false && ztt <= 0) {
      //only charge the user if they completed the tutorial..
      //AND if they have ZSS trial time available
      let currentCred = await getCredits();
      if (currentCred - 3 < 0) {
        tggCredWarning(true);
        return;
      } else {
        let temp = currentCred - 3;
        setCred(temp); //update frontend credit value
        newDeckCharge(); //update backend credit value
      }
    }
    // 1. Load existing decks
    const decks = await loadDeckList();

    // 2. Generate a unique random deckId
    let deckId;
    do {
      deckId = Math.floor(Math.random() * 9999); // You can adjust the range as needed
    } while (decks.some((deck) => deck.DeckID === deckId));

    // 3. Initialize new deck
    const newDeck = {
      userId: 1,
      DeckID: deckId,
      DeckORDER: decks.length + 1,
      DeckNAME: deckName,
      cards: [],
    };
    // 4. Save new deck to AsyncStorage
    await saveDecks([...decks, newDeck]);
    // 5. Update frontend
    setDecks([...decks, newDeck]);

    setTutPhase(tutPhase + 1);
    tggNewDeckModal(false);
    return;
  }

  async function renameThisDeck(NewTitle) {
    if (ta == true) {
      alert("You may do this action after the tutorial is complete.");
      return;
    }
    if (!NewTitle.trim()) return;
    await renameDeck(selectedDeck.DeckID, NewTitle);

    const list = await loadDeckList();
    setDecks(list);
    alert("New Deck Name Set");//make a custom ui instead
    tggEditDeck(false);
  }

  async function deleteThisDeck() {
    if (ta == true) {
      alert("You may do this action after the tutorial is complete.");
      return;
    }
    await deleteDeck(selectedDeck.DeckID);
    alert(`'${selectedDeck.DeckNAME}' was deleted.`);
    setSelectedDeck({});
    const list = await loadDeckList();
    setDecks(list);
    tggEditDeck(false);
  }

  async function openNewDeckMenu() {
    const ztt = await getZSTrialTime();
    if (ta == false && currentCred - 3 < 0 && ztt <= 0) {
      tggCredWarning(true);
      return;
    } else {
      tggNewDeckModal(true);
    }
  }

  function closeWarningOpenStore() {
    tggCredWarning(false);
    tggStoreModalOpen(true);
  }

  return (
    <ImageBackground
      source={BG}
      resizeMode="stretch"
      style={{ height: "100%" }}
    >
      <Pressable
        onPress={() => router.push({ pathname: "../" })}
        hitSlop={45}
        style={({pressed})=>[{
          opacity: pressed ? 0.5 : 1,// Mimics TouchableOpacity
          marginTop:scaleElement(35),
          paddingTop:scaleElement(4),
        }]}>
        <AutoScalingText baseSize={25} /* Circular Button */
        style={{ 
          padding: 2,
          fontWeight: "bold",
          width:"16%",
          borderRadius: 99,
          textAlign:"center",
          backgroundColor: "white",
          shadowColor: "#000",
          shadowOffset: { width: 2, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 4,
          elevation: 5,
          }}>
          ←</AutoScalingText>
      </Pressable>

      {ta == false && (
        <CreditsCounter/>
      )}

      <AutoScalingText baseSize={17} 
      style={{
          textAlign: "center",
          paddingTop: scaleElement(5),
          fontWeight: "bold",
          color: "blue",
      }}>Select a Deck</AutoScalingText>

      <View>
        {ta == true && tutPhase == 1 && (
          <AutoScalingText baseSize={14}
            style={{
              fontWeight: "bold",
              textAlign: "center",
              marginVertical: 20,
              shadowColor: "#FFD700", // gold glow
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 1,
              shadowRadius: 6,
              elevation: 12, // Android glow
            }}
          >{`Organize your Zip Cards with decks.\nTap the button to create a deck.`}</AutoScalingText>
        )}
      </View>

      <View
        style={{
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TouchableOpacity onPress={openNewDeckMenu}>
          <AutoScalingText baseSize={12}
            style={{
              margin: 10,
              textAlign: "center",
              fontWeight: "bold",
              textDecorationLine: "underline",
              color: "white",
              backgroundColor: "blue",
              padding: 4,
              borderRadius: 99,
              paddingHorizontal: 25,
            }}
          >
            New Deck
          </AutoScalingText>
        </TouchableOpacity>
        {ta == true && tutPhase == 1 && (
          <Animated.View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              animationName: { "75%": { transform: [{ translateY: 35 }] } },
              animationIterationCount: "infinite",
              animationDuration: "1s",
              animationTimingFunction: "ease-in-out",
            }}
          >
            <AutoScalingText baseSize={30}>👆</AutoScalingText>
          </Animated.View>
        )}
      </View>

      <ScrollView>
        {Decks.map((deck, index) => (
          <View
            key={deck.DeckID}
            id={index.toString()}
            style={{
              flexDirection: "row",
              paddingHorizontal: 4,
              alignItems: "center",
              justifyContent: "space-between",
            }}>
            <View>
              <TouchableOpacity
                style={{
                  padding: 6,
                  paddingHorizontal: "2%",
                  marginHorizontal: 15,
                  marginBottom:"5%",
                  borderRadius: 99,
                  backgroundColor: "gray",
                }}
                onPress={() => {
                  setSelectedDeck({
                    userId: deck.userId,
                    DeckID: deck.DeckID,
                    DeckORDER: deck.DeckORDER,
                    DeckNAME: deck.DeckNAME,
                    cards: deck.cards,
                  });
                  tggEditDeck(true);
                }}
              >
                <AutoScalingText baseSize={15}
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}>
                  {deck.DeckNAME}
                </AutoScalingText>
              </TouchableOpacity>
              {ta == true && tutPhase == 2 && (
                <Animated.View
                  style={{
                    paddingHorizontal: 20,
                    animationName: { "75%": { transform: [{ translateY: 35 }] } },
                    animationIterationCount: "infinite",
                    animationDuration: "1s",
                    animationTimingFunction: "ease-in-out",
                  }}>
                  <AutoScalingText baseSize={30} style={{ justifyContent:"center", textAlign:"center" }}>👆</AutoScalingText>
                </Animated.View>
              )}
            </View>
            <TouchableOpacity
                onPress={() => goOpenDeck(deck)}
              style={{
                marginBottom: "5%",
              }}>
              <AutoScalingText baseSize={20}
                style={{
                  borderRadius: 99,
                  padding: 2,
                  backgroundColor: "white",
                  aspectRatio:1,
                  fontWeight: "bold",
                  textAlign: "center",
                }}>
                ▷{/* ➠⏵ Circular Button */}
              </AutoScalingText>
            </TouchableOpacity>
          </View>

          //
        ))}
        
        {ta == true && tutPhase == 2 && (
          <AutoScalingText baseSize={13}
            style={{
              paddingTop: "6%",
              fontWeight: "bold",
              textAlign: "center",
              shadowColor: "#FFD700", // gold glow
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 1,
              shadowRadius: 6,
              elevation: 12, // Android glow
            }}>
            Tap your deck to open it.
          </AutoScalingText>
        )}
      </ScrollView>

      <DeckCreateModal
        visible={newDeckModal}
        tutorialActive={ta}
        submitAction={createDeck}
        closeAction={() => {tggNewDeckModal(false)}}
      />

      <DeckEditModal
        isOpen={editDeckModalOpen}
        DeckNAME={selectedDeck.DeckNAME}
        openAction={() => goOpenDeck(selectedDeck)}
        renameAction={renameThisDeck}
        deleteAction={deleteThisDeck}
        closeAction={() => {
          if (ta == false) tggEditDeck(false);
        }}
        tutorialActive={ta}
      />

      <CreditWarning
        isOpen={credWarning}
        closeAction={() => tggCredWarning(false)}
        openAction={closeWarningOpenStore}
      ></CreditWarning>
      <StoreModal isOpen={storeModalOpen} closeAction={()=>tggStoreModalOpen(false)}></StoreModal>
      
      {/* {!testState && 
      <TouchableOpacity onPress={()=>tggTestState(!testState)}>
          <AutoScalingText baseSize={12}
            style={{
              margin: 10,
              textAlign: "center",
              fontWeight: "bold",
              textDecorationLine: "underline",
              color: "white",
              backgroundColor: "#e02d2d",
              padding: 4,
              borderRadius: 99,
              paddingHorizontal: 25,
            }}>
            Test #1
          </AutoScalingText>
      </TouchableOpacity>} */}

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

      <TimerScreen/>
    </ImageBackground>
  );
};

export default DeckList;
