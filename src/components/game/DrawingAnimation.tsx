import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardType } from '../../types/game';
import Card from '../Card';

interface DrawingAnimationProps {
  animation: {
    playerIndex: number;
    cardId: string;
    isActive?: boolean;
    phase?: 'flying' | 'revealing' | 'sorting';
    drawnCard?: CardType;
  } | null;
  players: any[];
  humanPlayerIndex: number;
}

const DrawingAnimation: React.FC<DrawingAnimationProps> = ({
  animation,
  players,
  humanPlayerIndex
}) => {
  if (!animation || !animation.isActive || !animation.drawnCard) return null;

  const getPlayerPosition = (playerIndex: number) => {
    const positions = ['bottom', 'left', 'top', 'right'];
    const relativeIndex = (playerIndex - humanPlayerIndex + 4) % 4;
    return positions[relativeIndex];
  };

  const getAnimationPath = () => {
    const position = getPlayerPosition(animation.playerIndex);
    
    switch (position) {
      case 'bottom':
        return { x: 0, y: 200 };
      case 'left':
        return { x: -300, y: 0 };
      case 'top':
        return { x: 0, y: -200 };
      case 'right':
        return { x: 300, y: 0 };
      default:
        return { x: 0, y: 0 };
    }
  };

  const animationPath = getAnimationPath();

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ 
            x: -100, 
            y: 0, 
            scale: 0.8,
            rotate: -10
          }}
          animate={{
            x: animation.phase === 'flying' ? animationPath.x : 0,
            y: animation.phase === 'flying' ? animationPath.y : 0,
            scale: animation.phase === 'revealing' ? 1.2 : 1,
            rotate: animation.phase === 'sorting' ? 0 : -10
          }}
          transition={{
            duration: 0.8,
            type: "spring",
            stiffness: 100,
            damping: 20
          }}
        >
          <Card
            card={animation.drawnCard}
            size="medium"
            animate={false}
            isCardBack={animation.playerIndex !== 0 || animation.phase === 'flying'}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DrawingAnimation;