import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardType, ElementType } from '../types/game';
import { canPlayCard } from '../utils/gameLogic';
import Card from './Card';

interface PlayerHandProps {
  cards: CardType[];
  onCardPlay: (cardId: string) => void;
  canPlay: boolean;
  topCard: CardType;
  isHuman?: boolean;
  position?: 'top' | 'left' | 'right' | 'bottom';
  showBotCards?: boolean;
  drawingAnimation?: {
    playerIndex: number;
    cardId: string;
    isActive?: boolean;
    phase?: string;
    drawnCard?: CardType;
  } | null;
  // ✅ NEW: Void state props
  voidActive?: boolean;
  voidSelectedColor?: ElementType | null;
}

const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  onCardPlay,
  canPlay,
  topCard,
  isHuman = false,
  position = 'bottom',
  showBotCards = true,
  drawingAnimation,
  voidActive = false,
  voidSelectedColor = null,
}) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleCardClick = (card: CardType) => {
    if (!canPlay || !isHuman) return;

    // ✅ FIXED: Check playability against void color or top card
    let isPlayable = false;
    if (voidActive && voidSelectedColor) {
      // Check against void selected color
      isPlayable = card.element === voidSelectedColor || card.type === 'void';
    } else {
      // Check against current top card
      isPlayable = canPlayCard(card, topCard);
    }
    
    if (!isPlayable) return;

    if (selectedCard === card.id) {
      onCardPlay(card.id);
      setSelectedCard(null);
    } else {
      setSelectedCard(card.id);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const getCardSpacing = () => {
    const maxCards = cards.length;
    if (isHuman) {
      if (maxCards <= 5) return 80;
      if (maxCards <= 8) return 60;
      if (maxCards <= 12) return 45;
      return 35;
    } else {
      if (maxCards <= 3) return 40;
      if (maxCards <= 8) return 32;
      if (maxCards <= 12) return 26;
      return 20;
    }
  };

  const spacing = getCardSpacing();

  if (!isHuman) {
    const containerWidth = Math.max(cards.length * spacing + 80, 300);

    return (
      <motion.div
        className="rounded-lg p-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ width: `${containerWidth}px` }}
      >
        <div className="relative flex items-center" style={{ height: '80px' }}>
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              className="absolute"
              style={{
                left: `${index * spacing}px`,
                zIndex: cards.length - index,
              }}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Card
                card={card}
                size="medium"
                className="opacity-90 hover:opacity-100 transition-opacity"
                animate={false}
                isCardBack={!showBotCards}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  const totalCards = cards.length;
  const maxArcAngle = Math.min(60, totalCards * 8);
  const angleStep = totalCards > 1 ? maxArcAngle / (totalCards - 1) : 0;
  const startAngle = -maxArcAngle / 2;

  return (
    <motion.div
      className="relative overflow-visible"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        width: '100vw',
        height: '150px',
        marginBottom: -40,
        marginLeft: -60,
      }}
    >
      <div className="relative w-full h-full flex items-end justify-center">
        {cards.map((card, index) => {
          // ✅ FIXED: Check playability against void color or top card
          let isPlayable = false;
          if (voidActive && voidSelectedColor) {
            // Check against void selected color
            isPlayable = canPlay && (card.element === voidSelectedColor || card.type === 'void');
          } else {
            // Check against current top card
            isPlayable = canPlay && canPlayCard(card, topCard);
          }
          
          const isSelected = selectedCard === card.id;

          const angle = startAngle + index * angleStep;
          const radians = (angle * Math.PI) / 180;

          const arcRadius = 300;
          const x = Math.sin(radians) * arcRadius;
          const y = Math.cos(radians) * arcRadius - arcRadius + 40;

          return (
            <motion.div
              key={card.id}
              className="absolute"
              style={{
                left: `calc(50% + ${x}px)`,
                bottom: `${y}px`,
                transform: `translateX(-50%) rotate(${angle}deg)`,
                zIndex: isSelected ? 100 : totalCards - index,
                transformOrigin: 'center bottom',
              }}
              initial={{
                opacity: 0,
                scale: 0.8,
                y: 100,
                rotate: angle + 20,
              }}
              animate={{
                opacity: 1,
                scale: isSelected ? 1.1 : 1,
                y: isSelected ? -30 : 0,
                rotate: angle,
              }}
              transition={{
                duration: 0.4,
                type: 'spring',
                stiffness: 150,
                delay: index * 0.05,
              }}
              whileHover={
                !isSelected
                  ? {
                      scale: 1.05,
                      y: -8,
                      transition: { duration: 0.2 },
                    }
                  : undefined
              }
            >
              <Card
                card={card}
                isPlayable={isPlayable}
                isSelected={isSelected}
                onClick={() => handleCardClick(card)}
                size="medium"
                className={`
                  ${!isPlayable && canPlay ? 'opacity-60' : ''}
                  transition-all duration-200 shadow-xl
                  ${isPlayable ? 'hover:shadow-2xl' : ''}
                `}
                index={index}
                animate={false}
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default PlayerHand;