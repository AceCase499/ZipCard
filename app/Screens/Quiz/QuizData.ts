import { getCardsForDeck } from "@/components/Storage";

export type Card = { 
  cardId: number; 
  order: number; 
  front: string; 
  back: string; 
  color: string; 
};

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

// Create quiz questions from a deck
export function generateQuizFromDeck(
  deck: Card[],
  numOptions: number = 4,
  maxQuestions: number = 5
) {
  const questions = [];

  for (const card of deck) {// Pick distractors (wrong answers)
    const otherCards = deck.filter(c => c.cardId !== card.cardId);
    const distractors = shuffle(otherCards)
      .slice(0, numOptions - 1)
      .map(c => c.back);

    // Insert correct answer in a random position
    const correctAnswer = card.back;
    const allAnswers = shuffle([...distractors, correctAnswer]);
    const correctIndex = allAnswers.indexOf(correctAnswer);

    questions.push({
      Question: card.front,
      Answers: allAnswers,
      CorrectAnswerIndex: correctIndex,
    });
  }
  // shuffle all questions and only take maxQuestions
  return shuffle(questions).slice(0, maxQuestions);
}

export async function proto(deckID: number){
  const currentCards = await getCardsForDeck(deckID);
  if (!currentCards) {
        console.error("Deck not found:", deckID);
        return;
      }
  console.log(currentCards)
  console.log(currentCards.length)
  return("hello")
}

export default generateQuizFromDeck;
/* 
[
{Question: "What is the largest planet in our solar system?", Answers: ["Earth","Saturn","Jupiter","Neptune"], CorrectAnswerIndex: 2},
{Question: "Which galaxy is Earth located in?", Answers: ["Andromeda","Milky Way","Triangulum","Whirlpool"], CorrectAnswerIndex: 1},
{Question: "What is the main gas found in the Sun?", Answers: ["Carbon","Oxygen","Hydrogen","Nitrogen"], CorrectAnswerIndex: 2},
{Question: "Which planet is known as the “Red Planet”?", Answers: ["Venus","Mars","Mercury","Uranus"], CorrectAnswerIndex: 1},
{Question: "What is the name of the first human-made satellite to orbit Earth?", Answers: ["Sputnik 1","Hubble","Apollo 11","Voyager 1"], CorrectAnswerIndex: 0},
]
*/