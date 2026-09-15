//                              Getting & Setting Credits and IAP's

import AsyncStorage from "@react-native-async-storage/async-storage";
//import { Alert } from 'react-native';

const KEYS = {
  CREDITS: `${process.env.EXPO_PUBLIC_CREDITS}`,
  DAILY_REWARD_STATUS: `${process.env.EXPO_PUBLIC_DAILY_REWARD_STATUS}`,
  LATEST_DR_CLAIM_DATE: `${process.env.EXPO_PUBLIC_LATEST_DR_CLAIM_DATE}`,
  ZIP_SERVICE: `${process.env.EXPO_PUBLIC_ZIP_SERVICE}`,
  ZWARNINGS: `${process.env.EXPO_PUBLIC_ZWARNINGS}`,
};
export let ZSSWarnings = { M10: false, M30: false, H1: false, H8: false, D1: false };

export const storeItems = [
  { id: "smallCred", title: "Small Pack", credits: 25, price: 0.99 },
  { id: "medCred", title: "Medium Pack", credits: 70, price: 1.99 },
  { id: "largeCred", title: "Large Pack", credits: 180, price: 4.99 },
  { id: "bulkCred", title: "Bulk Pack", credits: 400, price: 9.99 },
  { id: "supCred", title: "Super Pack", credits: 750, price: 14.99 },
  { id: "vidCred", title: "Free Pack", credits: 3, price: 0.00 },
  //{ id: "zipService", title: "Zip Student Service", credits: 0, price: 6.99},
];

export function formatCredits(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return amount.toString();
}

export async function setZSTrialTime(elapsedTime: number): Promise<void> {
  try {
    const savedTrailTime = await getZSTrialTime();
    let newValue
    if (elapsedTime >= savedTrailTime) {console.log("All remaining time was consumed."); newValue = 0;} 
    else {console.log("Trial time was consumed, but some trial time remains."); newValue = savedTrailTime - elapsedTime;}
    await AsyncStorage.setItem(KEYS.ZIP_SERVICE, newValue.toString());
  } catch (error) {
    console.error("Error saving Zip Student Service trial time:", error);
  }
}

export async function getZSTrialTime(): Promise<number> {///////////////////////////////////////
  try {
    const value = await AsyncStorage.getItem(KEYS.ZIP_SERVICE);
    if (value !== null) {
      const parsed = parseInt(value, 10); //parse the string as a base 10 number
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;//add a number here to grant free trial time (for testing only)
  } catch (error) {
    console.error("Error loading Zip Service trial time:", error);
    return 0;
  }
}

export async function updateWarnings(warnings: object){
  try {
    await AsyncStorage.setItem(KEYS.ZWARNINGS, JSON.stringify(warnings));
  } catch (error) {
    console.error("Error saving credits:", error);
  }
}

export async function resetWarnings(){
  try {
    const rsWarn = { M10: false, M30: false, H1: false, H8: false, D1: false };
    await AsyncStorage.setItem(KEYS.ZWARNINGS, JSON.stringify(rsWarn));
  } catch (error) {
    console.error("Error saving credits:", error);
  }
}

export async function getCredits(): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(KEYS.CREDITS);
    if (value !== null) {
      const parsed = parseInt(value, 10); //parse the string as a base 10 number
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  } catch (error) {
    console.error("Error loading credits:", error);
    return 0;
  }
}

export async function tutorialReward() {
  try {
    const value = (await getCredits()) + 15;
    await AsyncStorage.setItem(KEYS.CREDITS, value.toString());
  } catch (error) {
    console.error("Error saving credits:", error);
  }
}
export async function quizReward() {
  try {
    const value = (await getCredits()) + 10;
    await AsyncStorage.setItem(KEYS.CREDITS, value.toString());
  } catch (error) {
    console.error("Error saving credits:", error);
  }
}
export async function videoAdReward(){
  try {
    const value = (await getCredits()) + 3;
    await AsyncStorage.setItem(KEYS.CREDITS, value.toString());
  } catch (error) {
    console.error("Error saving credits:", error);
  }
}

export async function newCardCharge() {//what if the user lied and they cant afford this?
  try {
    const value = (await getCredits()) - 1;
    await AsyncStorage.setItem(KEYS.CREDITS, value.toString());
  } catch (error) {
    console.error("Error saving credits:", error);
  }
}

export async function newDeckCharge() {//what if the user lied and they cant afford this?
  try {
    const value = (await getCredits()) - 3;
    await AsyncStorage.setItem(KEYS.CREDITS, value.toString());
  } catch (error) {
    console.error("Error saving credits:", error);
  }
}

export async function quizCharge() {//what if the user lied and they cant afford this?
  try {
    const value = (await getCredits()) - 6;
    await AsyncStorage.setItem(KEYS.CREDITS, value.toString());
  } catch (error) {
    console.error("Error saving credits:", error);
  }
}

//////////////////////////////   Handle Store Item Purchases  ///////////////////////

export async function handlePurchase(codeName: string) {
  try {
    let value;
    switch (codeName) {
      case "smolder":
        value = (await getCredits()) + 25;
        await AsyncStorage.setItem(KEYS.CREDITS, value.toString());
        break;
      case "marvelous":
        value = (await getCredits()) + 70;
        await AsyncStorage.setItem(KEYS.CREDITS, value.toString());
        break;
      case "leave":
        value = (await getCredits()) + 180;
        await AsyncStorage.setItem(KEYS.CREDITS, value.toString());
        break;
      case "binoculars":
        value = (await getCredits()) + 400;
        await AsyncStorage.setItem(KEYS.CREDITS, value.toString());
        break;
      case "suave":
        value = (await getCredits()) + 750;
        await AsyncStorage.setItem(KEYS.CREDITS, value.toString());
        break;
      case "zebra":
        value = (await getZSTrialTime()) + 604800;
        await AsyncStorage.setItem(KEYS.ZIP_SERVICE, value.toString());
        resetWarnings();
        break;
    }
  } catch (error) {
    console.error("Error saving credits:", error);
  }
}
/////////////////////////////////////   DR and Others   /////////////////////////////

/**
 * Determine if the daily reward has been claimed today.
 * Logic:
 *   1) Retrieve claim date from getDrClaimDate()
 *   2) If null → false
 *   3) Compare claim date with today's midnight:
 *        if claim occurred *after* today's midnight → true
 *        otherwise → false
 */

/**
 * Save the current date & time as the claim timestamp.
 */
export async function setDrClaimDate(): Promise<void> {
  try {
    const now = new Date().toISOString();
    await AsyncStorage.setItem(KEYS.LATEST_DR_CLAIM_DATE, now);
  } catch (err) {
    console.log("Error saving daily reward date:", err);
  }
}

export async function getDrClaimStatus(): Promise<boolean> {
  //true if claimed today, false if not claim yet today
  try {
    const claimDate = await getDrClaimDate();
    if (!claimDate) return false;

    const now = new Date();

    // midnight today
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(), // today
      0,
      0,
      0,
      0,
    );

    // if claim happened after midnight → claimed today
    return claimDate.getTime() >= midnight.getTime();
  } catch (err) {
    console.log("Error checking reward claim status:", err);
    return false;
  }
}

/**
 * Get the saved claim date/time.
 * Returns null if no saved date exists.
 */
export async function getDrClaimDate(): Promise<Date | null> {
  try {
    const saved = await AsyncStorage.getItem(KEYS.LATEST_DR_CLAIM_DATE);

    if (!saved) return null;

    return new Date(saved);
  } catch (err) {
    console.log("Error retrieving daily reward date:", err);
    return null;
  }
}

/**
 * Save the boolean claim status as TRUE.
 */
export async function setDrClaimStatus(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.DAILY_REWARD_STATUS, "true");
  } catch (err) {
    console.log("Error setting reward claim status:", err);
  }
}

/**
 * Reset the daily reward claim status to FALSE and claim date to the first of this year.
 */
export async function resetDR(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.DAILY_REWARD_STATUS, "");
    await AsyncStorage.setItem(KEYS.LATEST_DR_CLAIM_DATE, "");
  } catch (err) {
    console.log("Error setting reward claim status:", err);
  }
}
