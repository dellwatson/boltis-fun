import { Card, ElementType, CardType } from "../types/game";

const ELEMENTS: ElementType[] = ["fire", "water", "plant", "thunder"];
const CARD_TYPES: CardType[] = [
  "number",
  "number",
  "number",
  "number", // Higher chance for number cards
  "skip",
  "reverse",
  "stack",
  "void",
  "bomb",
  "strike",
  "mirror",
  "locked",
];

/**
 * Generates a single random card
 */
const generateRandomCard = (id: string): Card => {
  const element = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
  const type = CARD_TYPES[Math.floor(Math.random() * CARD_TYPES.length)];

  const card: Card = {
    id: `${element}-${id}`,
    element,
    type,
  };

  // Add value for number cards
  if (type === "number") {
    card.value = Math.floor(Math.random() * 9) + 1; // 1-9
  }

  return card;
};

/**
 * Generates an array of random cards
 * @param count Number of cards to generate
 * @returns Array of random cards
 */
export const generateRandomCards = (count: number): Card[] => {
  return Array.from({ length: count }, (_, i) =>
    generateRandomCard(`card-${i}-${Math.random().toString(36).substr(2, 9)}`),
  );
};

/**
 * Generates a standard deck of cards (4 of each number + special cards)
 */
export const generateStandardDeck = (): Card[] => {
  const cards: Card[] = [];

  // Generate number cards (1-9 of each element)
  ELEMENTS.forEach((element) => {
    for (let i = 1; i <= 9; i++) {
      // Add 4 of each number
      for (let j = 0; j < 4; j++) {
        cards.push({
          id: `${element}-${i}-${j}`,
          element,
          type: "number",
          value: i,
        });
      }
    }
  });

  // Add special cards (2 of each type per element)
  const specialTypes: CardType[] = [
    "skip",
    "reverse",
    "stack",
    "void",
    "bomb",
    "strike",
    "mirror",
    "locked",
  ];
  ELEMENTS.forEach((element) => {
    specialTypes.forEach((type) => {
      for (let i = 0; i < 2; i++) {
        cards.push({
          id: `${element}-${type}-${i}`,
          element,
          type,
        });
      }
    });
  });

  return cards;
};
