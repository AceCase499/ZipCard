import JoyMaster from "@/assets/images/JoyMaster.png";
import SadMaster from "@/assets/images/SadMaster.png";
import { useScale } from "@/components/autoElementScaling";
import AutoScalingText from "@/components/autoScalingText";
import CreditCounter from "@/components/creditCounter";
import CreditWarning from "@/components/creditWarning";
import {
  getCredits,
  getDrClaimStatus,
  getZSTrialTime,
  quizCharge,
  quizReward,
  setDrClaimDate,
  setDrClaimStatus,
} from "@/components/IAP";
import { getCardsForDeck } from "@/components/Storage";
import StoreModal from "@/components/storeModal";
import TimerScreen from "@/components/trialTimeKeeper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View
} from "react-native";
import Animated from "react-native-reanimated";
import { generateQuizFromDeck } from "./QuizData";

export type QuizQuestion = {
  Question: string;
  Answers: string[];
  CorrectAnswerIndex: number;
};

const QuizPage = () => {
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [FEcred, setFEcred] = useState(0);
  const [drClaimed, setDrClaimed] = useState(false);
  const [credWarning, tggCredWarning] = useState(false);
  const [storeModal, tggStoreModal] = useState(false);

  const navigation = useNavigation();
  const router = useRouter();
  const { DeckID } = useLocalSearchParams<{ DeckID: string }>();
  const { scaleElement } = useScale();
  const appState = useRef(AppState.currentState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions?.({ gestureEnabled: false });
      prepareQuiz();
      //console.log("✅App was opened")
      return () => {
        navigation.getParent()?.setOptions?.({ gestureEnabled: true });
        //console.log("💔App was closed")
      };
    }, [navigation, DeckID]),
  );

  useEffect(() => {//if the user closes the app, they forfeit their daily reward
    const sub = AppState.addEventListener("change", (nextState) => {
        if (nextState === "active") {
            if (!intervalRef.current) {
                console.log("✅App was opened")
            }
        } else {
            console.log("💔App was closed")
        }
    });
    return () => sub.remove();
}, []);

  async function prepareQuiz() {
    let temp = await getCredits();
    setFEcred(temp);
    let temp2 = await getDrClaimStatus();
    setDrClaimed(temp2);
    try {
      const deck = await getCardsForDeck(Number(DeckID));
      if (!deck || deck.length === 0) {
        console.error("Deck not found or empty:", DeckID);
        setQuiz([]);
        return;
      }
      const newQuiz = generateQuizFromDeck(deck, 4, 5);
      setQuiz(newQuiz);
    } catch (err) {
      console.error("Failed to prepare quiz:", err);
      setQuiz([]);
    } finally {
      setLoading(false);
    }
  }

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === quiz[current].CorrectAnswerIndex) {
      setScore((s) => s + 1);
    }
    setTimeout(() => {
      if (current < quiz.length - 1) {
        setCurrent((c) => c + 1);
        setSelected(null);
      } else {
        setShowResult(true);
      }
    }, 2000);
  };

  const handleExit = () => setShowExitModal(true);
  const cancelExit = () => setShowExitModal(false);

  async function closeQuiz() {
    const rew = await getDrClaimStatus();
    if (score >= 4 && drClaimed == false) {
      await quizReward();
    }
    setDrClaimDate();
    setDrClaimStatus();
    router.push({ pathname: "../" });
  }

  async function restart() {
    const temp = await getCredits();
    const zzt = await getZSTrialTime();
    if (zzt <= 0){
      if (temp - 6 < 0) {
        tggCredWarning(true);
        return;
      }
      await quizCharge();
    }
    await setDrClaimDate();
    await setDrClaimStatus();
    setSelected(null);
    setScore(0);
    setCurrent(0);
    setShowResult(false);
    prepareQuiz();
  }

  function closeWarningOpenStore() {
    tggCredWarning(false);
    tggStoreModal(true);
  }

  // 🌀 Loading view
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          padding: 16,
          backgroundColor: "#ffec82ff",
        }}>
        <AutoScalingText baseSize={14}
          style={{
            textAlign: "center",
            fontWeight: "bold",
            color: "blue",
          }}>
          Loading quiz...
        </AutoScalingText>
        <ActivityIndicator size="large" color="#007AFF" />
        <TimerScreen/>
      </View>
    );
  }

  // 🚫 Fallback if quiz failed or empty
  if (!quiz || quiz.length === 0) {
    return (
      <View style={{ flex: 1, padding: 16, backgroundColor: "#ffec82ff" }}>
        <AutoScalingText baseSize={14}
          style={{
            color: "red",
            marginBottom: 16,
            textAlign: "center",
          }}>
          ⚠️ Unable to load quiz.
        </AutoScalingText>
        <Link
          href="../"
          style={{ backgroundColor: "#007AFF", padding: 12, borderRadius: 8 }}>
          <AutoScalingText baseSize={14}
            style={{ color: "white", fontWeight: "bold", textAlign: "center" }}
          >
            Return to deck
          </AutoScalingText>
        </Link>
        <TimerScreen/>
      </View>
    );
  }

  // ✅ Quiz result view
  if (showResult) {
    return (
      <View style={{ flex: 1, padding: "4%", backgroundColor: "#ffec82ff" }}>
        <View style={{ position: "absolute", top: "7%", right: "6%" }}>
          <CreditCounter/>
        </View>
        <View
          style={{

            paddingTop: "20%",
            flexDirection: "row",
            justifyContent: "space-between",
            paddingLeft:"5%"
          }}
        >
          <Animated.Image
            source={score < 4 ? SadMaster : JoyMaster}
            resizeMode="contain"
            style={{
              animationName: { "50%": { transform: [{ translateY: 20 }] } },
              animationIterationCount: "infinite",
              animationDuration: "2s",
              height: scaleElement(120),
              width: scaleElement(120),
              animationTimingFunction: "ease-in-out",
            }}
          ></Animated.Image>
          <View style={{ justifyContent: "center", flex: 1 }}>
            <AutoScalingText baseSize={22}
              style={
                score < 4
                  ? {
                      fontWeight: "bold",
                      shadowColor: "red",
                      shadowOpacity: 0.8,
                    }
                  : {
                      fontWeight: "bold",
                      shadowColor: "green",
                      shadowOpacity: 0.8,
                    }
              }
            >
              {score < 4 ? "Failure" : "You Pass!"}
            </AutoScalingText>
          </View>
        </View>
        <Modal
          visible={showExitModal}
          transparent
          animationType="fade"
          onRequestClose={cancelExit}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.4)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                padding: 24,
                borderRadius: 12,
                width: 300,
                alignItems: "center",
              }}
            >
              <AutoScalingText baseSize={14}
                style={{ marginBottom: 24, textAlign: "center" }}>
                Are you sure you want to exit this quiz and return to your
                cards?
              </AutoScalingText>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              ></View>
            </View>
          </View>
        </Modal>

        <AutoScalingText baseSize={14}
          style={{
            textAlign: "center",
            fontWeight: "bold",
            color: "blue",
          }}
        >
          Your Score: {score * 20}/100
        </AutoScalingText>
        {score >= 4 &&
          drClaimed == false && ( //PASSED, NO CLAIM
            <View style={{ flex: 1, alignItems: "center" }}>
              <AutoScalingText baseSize={14}
                style={{
                  fontWeight: "bold",
                  textAlign: "center",
                }}>
                {`Good job!\nClaim your reward by tapping the button below.\n\nCome back tomorrow to continue earning free credits. The Free Quiz is available once every day!`}
              </AutoScalingText>
              <TouchableOpacity
                style={{
                  backgroundColor: "blue",
                  margin: "8%",
                  paddingVertical: "2%",
                  paddingHorizontal: "10%",
                  borderRadius: 99,
                }}
                hitSlop={35}
                onPress={closeQuiz}
              >
                <AutoScalingText baseSize={14}
                  style={{
                    fontWeight: "bold",
                    color: "white",
                    textAlign: "center",
                  }}
                >{`Claim (+10✪)`}</AutoScalingText>
              </TouchableOpacity>
            </View>
          )}
        {score < 4 &&
          drClaimed == false && ( //FAILED, NO CLAIM
            <View style={{ flex: 1, alignItems: "center" }}>
              <AutoScalingText baseSize={14}
                style={{
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {`You can take another quiz in exchange for some credits, or return to your cards using the buttons below.\nCome back tomorrow and pass the Free Quiz to earn 10 free credits!`}
              </AutoScalingText>
              <TouchableOpacity
                onPress={restart}
                style={{
                  backgroundColor: "green",
                  paddingVertical: "4%",
                  paddingHorizontal: "10%",
                  margin: "6%",
                  borderRadius: 99,
                }}
              >
                <AutoScalingText baseSize={14}
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >{`Start Over (-6✪)`}</AutoScalingText>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: "white",
                  paddingVertical: "4%",
                  paddingHorizontal: "10%",
                  borderRadius: 99,
                }}
                onPress={closeQuiz}
              >
                <AutoScalingText baseSize={14}
                  style={{
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >{`Return to cards`}</AutoScalingText>
              </TouchableOpacity>
            </View>
          )}

        {score >= 4 &&
          drClaimed == true && ( //PASSED, DR CLAIMED
            <View style={{ flex: 1, alignItems: "center" }}>
              <AutoScalingText baseSize={14}
                style={{
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {`Good job!\nYou can take another quiz in exchange for some credits, or return to your cards using the buttons below.\n\nCome back tomorrow and pass the Free Quiz to earn free credits!`}
              </AutoScalingText>
              <TouchableOpacity
                style={{
                  backgroundColor: "green",
                  paddingVertical: "4%",
                  paddingHorizontal: "10%",
                  margin: "8%",
                  borderRadius: 99,
                }}
                onPress={restart}
              >
                <AutoScalingText baseSize={14}
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >{`Start Over (-6✪)`}</AutoScalingText>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: "white",
                  paddingVertical: "4%",
                  paddingHorizontal: "10%",
                  borderRadius: 99,
                }}
                onPress={closeQuiz}>
                <AutoScalingText baseSize={14}
                  style={{
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >{`Return to cards`}</AutoScalingText>
              </TouchableOpacity>
            </View>
          )}

        {score < 4 &&
          drClaimed == true && ( //FAILED, DR CLAIMED
            <View style={{ flex: 1, alignItems: "center" }}>
              <AutoScalingText baseSize={14}
                style={{
                  fontWeight: "bold",
                  textAlign: "center",
                }}>
                {`You can take another quiz in exchange for some credits, or return to your cards using the buttons below.\n\nCome back tomorrow and pass the Free Quiz to earn 10 free credits!`}
              </AutoScalingText>
              <Pressable
                style={({pressed})=>[{
                  opacity: pressed ? 0.5 : 1,// Mimics TouchableOpacity
                  backgroundColor: "green",
                  paddingVertical: "4%",
                  paddingHorizontal: "10%",
                  margin: "6%",
                  borderRadius: 99,
                }]}
                onPress={restart}>
                <AutoScalingText baseSize={14}
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >{`Start Over (-6✪)`}</AutoScalingText>
              </Pressable>
              <TouchableOpacity
                style={{
                  backgroundColor: "white",
                  paddingVertical: "4%",
                  paddingHorizontal: "10%",
                  borderRadius: 99,
                }}
                onPress={closeQuiz}>
                <AutoScalingText baseSize={14}
                  style={{
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >{`Return to cards`}</AutoScalingText>
              </TouchableOpacity>
            </View>
          )}
        <CreditWarning
          isOpen={credWarning}
          closeAction={() => tggCredWarning(false)}
          openAction={closeWarningOpenStore}
          adAction={()=>alert("handle ad playing service")}>
        </CreditWarning>
        <TimerScreen/>
      </View>
    );
  }

  const q = quiz[current];

  {/* QUIZ SCREEN */}
  return (
    <ScrollView
      style={{ flex: 1, padding: 16 }}
      contentContainerStyle={{ alignItems: "center", justifyContent: "center" }}
    >
      <TouchableOpacity
        style={{
          position: "absolute",
          top: 40,
          right: 20,
          paddingHorizontal:"5%",
          backgroundColor: "#adadad",
          padding: 10,
          borderRadius: 99,
          zIndex: 2,
        }}
        onPress={handleExit}
      >
        <AutoScalingText baseSize={14}
        style={{ fontWeight: "bold", color: "#333" }}>Exit Quiz</AutoScalingText>
      </TouchableOpacity>
      {/* <Text>{`\n${drClaimed}`}</Text> */}
      <AutoScalingText baseSize={17}
        style={{
          paddingTop: "35%",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: 12,
        }}>
        {q.Question}
      </AutoScalingText>
      {q.Answers.map((ans, idx) => {
        let bg = "#9cebff";
        if (selected !== null) {
          if (idx === q.CorrectAnswerIndex) bg = "#40e842";
          else if (idx === selected) bg = "#f03636";
        }
        return (
          <TouchableOpacity
            key={idx}
            style={{
              width: "100%",
              padding: 16,
              marginVertical: 8,
              borderRadius: 8,
              backgroundColor: bg,
            }}
            onPress={() => handleAnswer(idx)}
            disabled={selected !== null}>
            <AutoScalingText baseSize={14}
            style={{ textAlign: "center" }}>{ans}</AutoScalingText>
          </TouchableOpacity>
        );
      })}

      <Modal
        visible={showExitModal}
        transparent
        animationType="fade"
        onRequestClose={cancelExit}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
          }}>
          <View
            style={{
              backgroundColor: "white",
              padding: 24,
              borderRadius: 12,
              width: 300,
              alignItems: "center",
            }}>
            <AutoScalingText baseSize={14}
              style={{ marginBottom: 24, textAlign: "center" }}>
              {`Are you sure you want to exit this quiz and return to your cards?`}
              {`\n‼️Notice‼️\nIf you exit from a Free Quiz before finishing it, you cannot take another one until tomorrow.`}
            </AutoScalingText>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#e33",
                  padding: 12,
                  borderRadius: 99,
                  flex: 1,
                  marginRight: 8,
                }}
                onPress={closeQuiz}
              >
                <AutoScalingText baseSize={14}
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Yes, exit
                </AutoScalingText>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: "#6893B2",
                  padding: 12,
                  borderRadius: 99,
                  flex: 1,
                  marginLeft: 8,
                }}
                onPress={cancelExit}
              >
                <AutoScalingText baseSize={14}
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}>
                  No, stay
                </AutoScalingText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <StoreModal
        isOpen={storeModal}
        closeAction={() => tggStoreModal(false)}>
      </StoreModal>
      <TimerScreen/>
    </ScrollView>
  );
};
export default QuizPage;
