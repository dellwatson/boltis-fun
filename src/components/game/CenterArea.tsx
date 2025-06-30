import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardType, ElementType } from '../../types/game';
import CardStack from '../CardStack';
import BackgroundCard from './BackgroundCard';
import ColorSelector from '../ColorSelector';

interface CenterAreaProps {
  drawPile: CardType[];
  discardPile: CardType[];
  voidCard: CardType | null;
  voidSelectedColor: ElementType | null;
  voidAnimationPhase: string | null;
  gamePhase: string;
  onDrawCard: () => void;
  onColorSelect: (color: ElementType) => void;
  className?: string;
}

const CenterArea: React.FC<CenterAreaProps> = ({
  drawPile,
  discardPile,
  voidCard,
  voidSelectedColor,
  voidAnimationPhase,
  gamePhase,
  onDrawCard,
  onColorSelect,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-center gap-8 ${className}`}>
      {/* Draw Pile */}
      <motion.div
        className="relative cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onDrawCard}
      >
        <CardStack cards={drawPile} type="draw" />
        <div className="mt-2 text-center">
          <h4 className="font-bold text-white">Draw Pile</h4>
          <p className="text-sm text-white/60">
            {drawPile.length} card{drawPile.length !== 1 ? 's' : ''}
          </p>
        </div>
      </motion.div>

      {/* Center Play Area */}
      <div className="relative w-32 h-48">
        {/* Background void card */}
        <BackgroundCard
          card={voidCard}
          selectedColor={voidSelectedColor}
          animationPhase={voidAnimationPhase}
        />

        {/* Discard Pile */}
        <motion.div
          className="relative z-10"
          animate={{
            x: voidAnimationPhase === 'discard_moving' ? [0, 100, 0] : 0,
            opacity: voidAnimationPhase === 'discard_moving' ? [1, 0.5, 1] : 1
          }}
          transition={{ duration: 2, ease: "easeInOut" }}
        >
          <CardStack cards={discardPile} type="discard" />
        </motion.div>
      </div>

      {/* Discard Pile Info */}
      <div className="text-center">
        <h4 className="font-bold text-white">Discard Pile</h4>
        <p className="text-sm text-white/60">
          {discardPile.length} card{discardPile.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Color Selection Modal */}
      <AnimatePresence>
        {gamePhase === 'color-selection' && (
          <ColorSelector onColorSelect={onColorSelect} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CenterArea;