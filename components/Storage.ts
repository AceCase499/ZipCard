//                              Add / Edit Cards & Decks

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export type Card = { cardId: number; order: number; front: string; back: string; color: string; };
export type Deck = { userId: number; DeckID: number; DeckORDER: number; DeckNAME: string; cards: Card[] };

const KEYS = {
  DECK_LIST: `${process.env.EXPO_PUBLIC_DECK_LIST}`,
  //CARDS: 'flash.cards.cards.v1',
  TUTORIAL_ACTIVE: `${process.env.EXPO_PUBLIC_TUTORIAL_ACTIVE}`,
  RECENTS: `${process.env.EXPO_PUBLIC_RECENTS}`,
};

export async function setTutorialActive(value: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.TUTORIAL_ACTIVE, JSON.stringify(value));
  } catch (err) {
    console.error("Failed to save tutorialActive:", err);
  }
}

export async function getTutorialActive(): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(KEYS.TUTORIAL_ACTIVE);
    if (stored !== null) {
      return JSON.parse(stored); // safely parse "true"/"false"
    }
  } catch (err) {
    console.error("Failed to load tutorialActive:", err);
  }
  // Default value if not found or error
  return true;
}

/**
 * Add a Deck to the RecentlyOpened array in AsyncStorage.
 * Keeps only the 3 most recent decks.
 */
export async function setRecents(deck: Deck): Promise<void> {
  let recents: Deck[] = [];
  const raw = await AsyncStorage.getItem(KEYS.RECENTS);
  if (raw) {
    recents = JSON.parse(raw);
    // Remove any deck with the same DeckID
    recents = recents.filter(d => String(d.DeckID) !== String(deck.DeckID));
  }
  // Add the incoming deck to the front
  recents.unshift(deck);
  // Keep only the 3 most recent
  if (recents.length > 3) recents = recents.slice(0, 3);
  await AsyncStorage.setItem(KEYS.RECENTS, JSON.stringify(recents));
}

/**
 * Load the RecentlyOpened decks from AsyncStorage.
 */
export async function loadRecentlyOpened(): Promise<Deck[]> {
  const raw = await AsyncStorage.getItem(KEYS.RECENTS);
  return raw ? JSON.parse(raw) : [];
}

export async function clearRecents() {//NEVER USE THIS, FOR TESTING ONLY
  await AsyncStorage.setItem(KEYS.RECENTS, "");
}

export async function loadDeckList(): Promise<Deck[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.DECK_LIST);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to parse deck list:", e);
    return [];
  }
}
export async function saveDecks(items: Deck[]) {
  await AsyncStorage.setItem(KEYS.DECK_LIST, JSON.stringify(items));
}

export async function getDeckById(DeckID: number): Promise<Deck | null> {
  const decks = await loadDeckList();
  return decks.find(d => String(d.DeckID) === String(DeckID)) ?? null;
}

export async function getCardsForDeck(DeckID: number): Promise<Card[]> {
  return (await getDeckById(DeckID))?.cards ?? [];
}

/** Rename a deck by its deckId */
export async function renameDeck(DeckID: number, newName: string): Promise<void> {
  const decks = await loadDeckList();
  const idx = decks.findIndex(d => String(d.DeckID) === String(DeckID));
  if (idx === -1) throw new Error(`Deck with ID ${DeckID} not found`);
  decks[idx].DeckNAME = newName;
  await saveDecks(decks);
  //CHECK IF THIS DECK IS STORED IN RECENTS, IF SO DELETE IT FROM RECENTS
  const recents = await loadRecentlyOpened();
  const filtered2= recents.filter(r => String(r.DeckID) !== String(DeckID));
  await AsyncStorage.setItem(KEYS.RECENTS, JSON.stringify(filtered2));
}

/** Delete a deck by its deckId */
export async function deleteDeck(DeckID: number): Promise<void> {
  const decks = await loadDeckList();
  const filtered = decks.filter(d => String(d.DeckID) !== String(DeckID));
  //CHECK IF THIS DECK IS STORED IN RECENTS, IF SO DELETE IT FROM RECENTS TOO
  const recents = await loadRecentlyOpened();
  const filtered2= recents.filter(r => String(r.DeckID) !== String(DeckID));
  await saveDecks(filtered);
  await AsyncStorage.setItem(KEYS.RECENTS, JSON.stringify(filtered2));
}

export async function clearDeckList() {//NEVER USE THIS, FOR TESTING ONLY
  await AsyncStorage.removeItem(KEYS.DECK_LIST);
}
export async function clearCardsFromDecks(DeckID: number) {
  const decks = await loadDeckList();
  const deckIndex = decks.findIndex(deck => deck.DeckID.toString() === DeckID.toString());
  if (deckIndex === -1) {
    Alert.alert(`No deck with ID ${DeckID} exists.`);
    return;
  }
  decks[deckIndex].cards = [];
  await saveDecks(decks);
}

export async function saveToDeck(
  //Create a new card, add it to the deck, and return a copy for the frontend deck
  //set default color to 'white'
  DeckID: number,
  front: string,
  back: string,
  color: string
): Promise<Card> {
  const decks = await loadDeckList();
  const deckIndex = decks.findIndex(d => String(d.DeckID) === String(DeckID));
  if (deckIndex === -1) { Alert.alert(`No deck with ID ${DeckID} exists.`); throw new Error('Deck not found'); }

  const deck = decks[deckIndex];
  const existingIds = (deck.cards ?? []).map(c => c.cardId);
  let cardId: number; do { cardId = Math.floor(Math.random() * 10000); } while (existingIds.includes(cardId));

  const newCard: Card = {
    cardId,
    order: ((deck.cards ?? []).length) + 1,
    front: front.trim(),
    back:  back.trim(),
    color: (color ?? '').trim() || 'white',
  };

  deck.cards = [...(deck.cards ?? []), newCard];
  decks[deckIndex] = deck;
  await saveDecks(decks);
  return newCard;
}

/**
 * Update a card in a deck by deckID and card.cardId.
 * Alerts if deck or card is not found.
 */
export async function updateCardInDeck(deckID: number, updatedCard: Card): Promise<void> {
  const decks = await loadDeckList();
  const deckIndex = decks.findIndex(d => String(d.DeckID) === String(deckID));
  if (deckIndex === -1) {
    Alert.alert(`No deck with ID ${deckID} exists.`);
    return;
  }
  const deck = decks[deckIndex];
  const cardIndex = (deck.cards ?? []).findIndex(c => c.cardId === updatedCard.cardId);
  if (cardIndex === -1) {
    Alert.alert(`No card with ID ${updatedCard.cardId} exists in deck ${deckID}.`);
    return;
  }
  deck.cards[cardIndex] = { ...deck.cards[cardIndex], ...updatedCard };
  decks[deckIndex] = deck;
  await saveDecks(decks);
}

/**
 * Delete a card from a deck by deckID and cardId.
 * Alerts if deck or card is not found.
 */
export async function deleteCardFromDeck(deckID: number, cardId: number): Promise<void> {
  const decks = await loadDeckList();
  const deckIndex = decks.findIndex(d => String(d.DeckID) === String(deckID));
  if (deckIndex === -1) {
    //Alert.alert(`No deck with ID ${deckID} exists.`);
    Alert.alert("The deck was not found. Please try again later.")
    return;
  }
  const deck = decks[deckIndex];
  const cardIndex = (deck.cards ?? []).findIndex(c => c.cardId === cardId);
  if (cardIndex === -1) {
    //Alert.alert(`No card with ID ${cardId} exists in deck ${deckID}.`);
    Alert.alert("The Zip Card was not found. Please try again later.")
    return;
  }
  deck.cards.splice(cardIndex, 1);
  decks[deckIndex] = deck;
  await saveDecks(decks);
}