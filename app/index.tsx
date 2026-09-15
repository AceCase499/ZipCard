"use jsx";
import BG from "@/assets/images/homepage.png";
import { useScale } from "@/components/autoElementScaling";
import AutoScalingText from "@/components/autoScalingText";
import CreditCounter from "@/components/creditCounter";
import { getCredits, getDrClaimStatus, getZSTrialTime } from "@/components/IAP";
import Notif from "@/components/Notif";
import type { Card } from "@/components/Storage";
import {
  Deck,
  getTutorialActive,
  loadRecentlyOpened,
  setRecents,
} from "@/components/Storage";
import TimerScreen from "@/components/trialTimeKeeper";
//import { clearDeckList, clearRecents, Deck, getCredits, getDrClaimStatus, getTutorialActive, loadRecentlyOpened, resetDR, setCredits, setRecents, setTutorialActive } from "@/components/Storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ImageBackground,
  Pressable,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import Animated from "react-native-reanimated";
import Styling from "./MainStyling.js";

type NotifItem = { id: number; message: string };

type RecentlyOpenedDeck = {
  userId: number;
  DeckID: number;
  DeckORDER: number;
  DeckNAME: string;
  cards: Card[];
};

export default function Index() {
  const [notifs, setNotifs] = useState<NotifItem[]>([]);
  const now = new Date();
  const currentHour = now.getHours();
  const [ro, setRO] = useState<RecentlyOpenedDeck[]>([]);
  const [ta, setTa] = useState(true);
  const [currentCred, setCred] = useState(0);
  const [trialTime, setTrialTime] = useState(0);
  const [drClaimed, setDrClaimed] = useState(false);

  const { width, height, fontScale } = useWindowDimensions();
  const router = useRouter();
  const responsiveFontSize = (height / 30) * fontScale;
  const { scaleElement } = useScale();

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        try {
          //await setCredits(0);await clearRecents();await clearDeckList();setTutorialActive(true); await resetDR();
          let temp = await getDrClaimStatus();
          setDrClaimed(temp);
          setCred(await getCredits());
          let TA = await getTutorialActive();
          setTa(TA);
          const list = await loadRecentlyOpened();
          const ZStt = await getZSTrialTime();
          setTrialTime(ZStt);
          // If loadRecentlyOpened might return null/undefined, coerce to empty array:
          setRO(list ?? []);
        } catch (err) {
          console.error("Failed to load recently opened:", err);
          setRO([]);
        }
      })();
    }, []),
  );

  function runFakeNotifs() {
    setNotifs((prev) => [
      ...prev,
      { id: Date.now(), message: "NiceKitty001 reached a 30-day Quiz Streak!" },
    ]);
  }

  function goToDeckList() {
      router.push({
        pathname: "/Screens/DeckList/page",
      });
    }
  
    function goToAdTest() {
      router.push({
        pathname: "/Screens/AdTest/page",
      });
    }

  function goOpenDeck(deck: Deck) {
    setRecents(deck);
    router.push({
      pathname: "/Screens/EditDeck/page",
      params: {
        DeckID: deck.DeckID,
        DeckNAME: deck.DeckNAME,
      },
    } as any);
  }

  function getGreeting() {
    if (ta == true) return "Welcome!";

    if (currentHour >= 6 && currentHour < 12) return "Good Morning";
    if (currentHour >= 12 && currentHour < 14) {
      return `Let's Study\nDuring Lunchtime!`;
    }
    if (currentHour >= 14 && currentHour < 17) {
      return "Good Afternoon";
    }
    if (currentHour >= 17 && currentHour < 23) {
      return "Good Evening";
    }
    if (currentHour >= 0 && currentHour < 6) {
      return `Late Night\nStudy Session`;
    }
    return "Hi, Notetaker!";
  }

  return (
    <ImageBackground source={BG} style={Styling.centerMyChildren}>
      {ta == false && (<CreditCounter/>)}
      <View
        style={{
          maxWidth: "90%"
        }}>
        <AutoScalingText
        baseSize={22}
        style={[Styling.centerText, {color:"white", fontWeight:700 }]}
        >{getGreeting()}
        </AutoScalingText>

        <AutoScalingText
        baseSize={25}
        style={[Styling.title, { marginBottom: "15%" }]}
        >⎣ ZipCard ⎤
        </AutoScalingText>

        {ro.map((deck) => (
          <TouchableOpacity
            style={{ 
              marginBottom: 15,
            }}
            onPress={() => goOpenDeck(deck)}
            key={deck.DeckID}>
            <AutoScalingText
            baseSize={13}
            style={{
                fontWeight: 500,
                padding: 5,
                textAlign: "center",
                borderRadius: 99,
                backgroundColor: "gray",
                color: "white"
              }}
            >Load: {deck.DeckNAME}
            </AutoScalingText>
          </TouchableOpacity>
        ))}

        <Pressable
        onPress={goToDeckList}
          style={({pressed})=>[{
            opacity: pressed ? 0.5 : 1,// Mimics TouchableOpacity
            fontWeight: 500,
            padding: 5,            
            borderRadius: 99,
            backgroundColor: "gray",
          }]}>
            <AutoScalingText baseSize={13}
            style={{
              color: "gold",
              textAlign: "center",
            }}>
              {ta == true ? "Get Started" : "View Your Card Decks"}
            </AutoScalingText>
        </Pressable>

        {ta == true && (
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
            <AutoScalingText baseSize={15}>👆</AutoScalingText>
            <AutoScalingText baseSize={15}>👆</AutoScalingText>
            <AutoScalingText baseSize={15}>👆</AutoScalingText>
          </Animated.View>
        )}
        <View
          style={{
            backgroundColor: "#00ff84",
            position: "absolute",
            left: "3%",
            top: "15%",
            zIndex: 1,
          }}
        ></View>
        <TimerScreen/>

        {/* <TouchableOpacity style={{padding:"7%"}} onPress={goToAdTest}>
          <AutoScalingText baseSize={15} style={{color:"blue"}}>
            Test Video Ads
          </AutoScalingText>
        </TouchableOpacity> */}
        
        {/* Example button to add a fake notification */}
        {/* <TouchableOpacity onPress={runFakeNotifs}>
          <Text>Tap Me</Text>
        </TouchableOpacity> */}

        {/* <Link
          style={[gStyle.centerText, {color: "white", fontSize: 18, padding: 15}]}
          href={"/Screens/LatexTest/page"}>
          Latex Test
        </Link> */}
      </View>

      {notifs.map((notif) => (
        <Notif key={notif.id} message={notif.message} />
      ))}
    </ImageBackground>
  );
}
