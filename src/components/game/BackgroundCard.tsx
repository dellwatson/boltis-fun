import React from 'react';
import { motion } from 'framer-motion';
import { Card as CardType, ElementType, ELEMENT_COLORS } from '../../types/game';

interface BackgroundCardProps {
  card: CardType | null;
  selectedColor?: ElementType | null;
  animationPhase?: string | null;
  className?: string;
}

const BackgroundCard: React.FC<BackgroundCardProps> = ({ 
  card, 
  selectedColor, 
  animationPhase,
  className = '' 
}) => {
  if (!card) return null;

  const displayColor = selectedColor || card.element;
  const backgroundColor = ELEMENT_COLORS[displayColor];

  return (
    <motion.div
      className={`absolute inset-0 rounded-2xl border-4 border-white/30 ${className}`}
      style={{ backgroundColor }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 0.3,
        scale: 1,
        backgroundColor: animationPhase === 'color_changing' 
          ? [ELEMENT_COLORS[card.element], backgroundColor, backgroundColor]
          : backgroundColor
      }}
      transition={{
        duration: animationPhase === 'color_changing' ? 1.5 : 0.5,
        ease: "easeInOut"
      }}
    >
      {/* Void card pattern */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-white/20 text-8xl font-bold">
          VOID
        </div>
      </div>
      
      {/* Animated particles */}
      {animationPhase === 'color_changing' && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: ELEMENT_COLORS[displayColor] }}
              initial={{
                x: Math.random() * 100 + '%',
                y: Math.random() * 100 + '%',
                scale: 0,
                opacity: 0
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                y: [Math.random() * 100 + '%', Math.random() * 100 + '%']
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 1
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default BackgroundCard;