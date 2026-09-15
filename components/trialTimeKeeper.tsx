import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, StyleSheet, View } from "react-native";
import { getZSTrialTime, setZSTrialTime, updateWarnings, ZSSWarnings } from "./IAP";
import ZsExpiredModal from "./zsExpiredModal";
import ZsWarningModal from "./zsWarningModal";

export default function TimerScreen() {
  const [localTrialTime, setLocalTrialTime] = useState(0); // total seconds left in current trial, saved locally
  const [elapsedTime, setElapsedTime] = useState(0); // seconds counted up
  const [expiredOpen, tggExpiredOpen] = useState(false);
  const [warningOpen, tggWarningOpen] = useState(false);
  const [reminderTitle, setReminderTitle] = useState("");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appState = useRef(AppState.currentState);
  const elapsedRef = useRef(0);

  /* ------------------ TIMER CONTROL ------------------ */

  const startTimer = () => {
    if (intervalRef.current || localTrialTime <= 0) return;

    intervalRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsedTime(elapsedRef.current);

        const remaining = localTrialTime - elapsedRef.current;

        timeCheckNotif(remaining);

        if (remaining <= 0) {
        stopTimerAndPersist(true);
        }
  }, 1000);
};


    async function stopTimerAndPersist(expired = false) {
        if (!intervalRef.current) return;

        clearInterval(intervalRef.current);
        intervalRef.current = null;

        const consumed = elapsedRef.current;

        if (consumed > 0) {
            await setZSTrialTime(consumed);
            const updated = await getZSTrialTime();
            setLocalTrialTime(updated);

        if (expired || updated <= 0) {
        tggExpiredOpen(true);
        }
     }
}


  /* ------------------ GET TRIAL TIME ------------------ */

    useEffect(() => {
        (async () => {
            const timeFromServer = await getZSTrialTime();
            setLocalTrialTime(timeFromServer);
        })();
    }, []);

/* ------------------ FOCUSEFFECT TIMER STARTER ------------------ */

    useFocusEffect(
        useCallback(() => {
            elapsedRef.current = 0;
            setElapsedTime(0);

        if (localTrialTime > 0) startTimer();

        return () => {
        stopTimerAndPersist();
        };
  }, [localTrialTime])
);

/* ------------------ APPSTATE TIMER STARTER/STOPPER ------------------ */

    useEffect(() => {
        const sub = AppState.addEventListener("change", (nextState) => {
            if (nextState === "active") {
                if (!intervalRef.current && localTrialTime > 0) {
                    startTimer();
                }
            } else {
                stopTimerAndPersist();
            }
        });
        return () => sub.remove();
    }, [localTrialTime]);

  /* ------------------ WARNINGS ------------------ */

  function timeCheckNotif(timeLeft: number) {
    if (timeLeft <= 0) return;
    if(timeLeft <= 600) {
        if(ZSSWarnings.M10 == true) return;
        setReminderTitle("Less Than 10 Minutes Left");
        tggWarningOpen(true);
        let tempWarn = ZSSWarnings;
        tempWarn.M10 = true;
        updateWarnings(tempWarn);
        return;}
    if(timeLeft <= 1800) {
        if(ZSSWarnings.M30 == true) return;
        setReminderTitle("Less Than 30 Minutes Left");
        tggWarningOpen(true);
        let tempWarn = ZSSWarnings;
        tempWarn.M30 = true;
        updateWarnings(tempWarn);
        return;}
    if(timeLeft <= 3600) {
        if(ZSSWarnings.H1 == true) return;
        setReminderTitle("Less Than 1 Hour Left");
        tggWarningOpen(true);
        let tempWarn = ZSSWarnings;
        tempWarn.H1 = true;
        updateWarnings(tempWarn);
        return;}
    if(timeLeft <= 28800) {
        if(ZSSWarnings.H8 == true) return;
        setReminderTitle("Less Than 8 Hours Left");
        tggWarningOpen(true);
        let tempWarn = ZSSWarnings;
        tempWarn.H8 = true;
        updateWarnings(tempWarn);
        return;}
    if(timeLeft <= 86400) {
        if(ZSSWarnings.D1 == true) return;
        setReminderTitle("Less Than One Day Left");
        tggWarningOpen(true);
        let tempWarn = ZSSWarnings;
        tempWarn.D1 = true;
        updateWarnings(tempWarn);
        return;}
  }
  /* ------------------ UI ------------------ */

  //return null;
  return (
    <View style={{ padding: 20 }}>
        {/* <AutoScalingText baseSize={12} style={{color:"white", textAlign:"center"}}>
        Elapsed: {elapsedTime}s / {localTrialTime}s
        </AutoScalingText>

      <TouchableOpacity
        onPress={() => console.log("Elapsed:", elapsedTime)}
      >
        <AutoScalingText baseSize={12} style={{color:"blue", textAlign:"center"}}>
        Print current time 
        </AutoScalingText>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => console.log("Time Remaining:", localTrialTime)}
      >
        <AutoScalingText baseSize={12} style={{color:"blue", textAlign:"center"}}>
        Remaining Trial Time
        </AutoScalingText>
      </TouchableOpacity> */}

      <ZsWarningModal
        title={reminderTitle}
        isOpen={warningOpen}
        closeAction={() => tggWarningOpen(false)}
      />
      <ZsExpiredModal
        isOpen={expiredOpen}
        closeAction={()=>tggExpiredOpen(false)
        }
      />
    </View>
  );
}

/* ------------------ STYLES ------------------ */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});
