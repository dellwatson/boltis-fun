import React from "react";
import { motion } from "framer-motion";
import { Card as CardType } from "../types/game";
import Card from "./Card";

interface CardStackProps {
  cards: CardType[];
  type: "draw" | "discard";
  className?: string;
}

// Generate random but consistent positions for discard pile cards
const calculateDiscardPosition = (index: number, total: number) => {
  // Generate a unique but consistent seed for this card position
  const seed = index * 10 + total;

  // Helper to generate a random but consistent number
  const random = (min: number, max: number) => {
    const x = Math.sin(seed * 1000) * 10000;
    return (x - Math.floor(x)) * (max - min) + min;
  };

  // More spread for cards further down the stack
  const spread = 1 - (index / total) * 0.8; // 0.2 to 1.0

  // Random position within a circular area
  const angle = random(0, Math.PI * 2);
  const distance = random(0, 40) * spread;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance * 0.7; // Slightly more horizontal spread

  // Random rotation with more variation for cards further down
  const rotation = random(-25, 25) * spread;

  // Slight scale decrease for cards further down
  const scale = 1 - (total - index - 1) * 0.02;

  return {
    x,
    y,
    rotation,
    zIndex: index + 1,
    scale,
  };
};

const CardStack: React.FC<CardStackProps> = ({
  cards,
  type,
  className = "",
}) => {
  const stackSize = cards.length;
  // Show multiple cards in discard pile with random positions
  const maxVisibleCards = type === "draw" ? 3 : 12;
  const visibleCards = Math.min(stackSize, maxVisibleCards);

  // Generate the stack of cards with random offsets and rotations for discard pile
  const cardElements = [];
  const startIndex =
    type === "draw" ? 0 : Math.max(0, stackSize - maxVisibleCards);

  for (let i = 0; i < visibleCards; i++) {
    const cardIndex = type === "draw" ? i : cards.length - visibleCards + i;

    const cardStyle =
      type === "draw"
        ? {
            // Draw pile - neat stack
            x: i * 1.5,
            y: i * 1.5,
            rotation: i % 2 === 0 ? -i * 0.3 : i * 0.3,
            zIndex: i + 1,
            scale: 1.0,
          }
        : calculateDiscardPosition(i, visibleCards);

    // For discard pile, only show the top card face up
    const currentCard = type === "draw" ? null : cards[cardIndex];
    const isTopCard = i === visibleCards - 1;
    const showCardBack = type === "draw" || !isTopCard;

    cardElements.push(
      <motion.div
        key={currentCard?.id || `card-${i}`}
        className={`absolute transition-all duration-300 ${
          type === "discard" && i === visibleCards - 1
            ? "hover:z-50 hover:scale-110"
            : ""
        }`}
        style={{
          zIndex: cardStyle.zIndex,
          y: cardStyle.y,
          x: cardStyle.x,
          rotate: cardStyle.rotation,
          scale: cardStyle.scale || 1.0,
          transformOrigin: "center center",
          filter: type === "discard" && !isTopCard ? "brightness(0.9)" : "none",
          opacity: type === "discard" ? 1 - (visibleCards - i - 1) * 0.03 : 1,
        }}
        initial={{ y: 0, x: 0, rotate: 0, opacity: 0, scale: 0.9 }}
        animate={{
          y: cardStyle.y,
          x: cardStyle.x,
          rotate: cardStyle.rotation,
          scale: cardStyle.scale || 1.0,
          opacity: 1,
        }}
        whileHover={
          type === "discard" && i === visibleCards - 1
            ? {
                y: cardStyle.y - 15,
                scale: (cardStyle.scale || 1.0) * 1.1,
                transition: { duration: 0.2 },
              }
            : {}
        }
        transition={{
          type: "spring",
          stiffness: type === "discard" ? 100 : 300,
          damping: 20,
          delay: (i - startIndex) * 0.03,
          opacity: { duration: 0.2 },
        }}
      >
        {showCardBack ? (
          <Card
            card={{
              id: `card-back-${i}`,
              element: "fire", // Doesn't matter for card back
              type: "number",
              value: 0,
            }}
            isCardBack={true}
            size="medium"
            animate={false}
          />
        ) : currentCard ? (
          <Card
            card={currentCard}
            size={
              type === "discard" && i === visibleCards - 1 ? "medium" : "small"
            }
            animate={false}
          />
        ) : null}
      </motion.div>,
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative w-24 h-36">{cardElements}</div>
      {/* <div className="mt-2 text-center">
        <h4 className="font-bold text-white capitalize">{type === 'draw' ? 'Draw Pile' : 'Discard Pile'}</h4>
        <p className="text-sm text-white/60">{stackSize} card{stackSize !== 1 ? 's' : ''}</p>
      </div> */}
    </div>
  );
};

export default CardStack;
