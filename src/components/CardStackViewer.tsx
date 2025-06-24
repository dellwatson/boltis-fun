import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardType } from '../types/game';
import { formatCardForDisplay } from '../utils/gameLogic';
import Card from './Card';
import { X, List, Grid3X3 } from 'lucide-react';

interface CardStackViewerProps {
  cards: CardType[];
  side: 'left' | 'right';
  viewMode: 'list' | 'grid';
  onClose: () => void;
}

const CardStackViewer: React.FC<CardStackViewerProps> = ({ 
  cards, 
  side, 
  viewMode, 
  onClose 
}) => {
  const sideVariants = {
    hidden: {
      x: side === 'left' ? -400 : 400,
      opacity: 0
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    },
    exit: {
      x: side === 'left' ? -400 : 400,
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  const cardListVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2
      }
    }
  };

  const cardItemVariants = {
    hidden: { 
      opacity: 0, 
      x: side === 'left' ? -20 : 20,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200
      }
    }
  };

  return (
    <motion.div
      className={`
        fixed top-0 ${side === 'left' ? 'left-0' : 'right-0'} h-full w-80 
        bg-white/95 backdrop-blur-sm shadow-2xl z-40 
        flex flex-col border-l-2 border-gray-200
      `}
      variants={sideVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between p-4 border-b border-gray-200 bg-white/90"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2">
          {viewMode === 'list' ? <List className="w-5 h-5" /> : <Grid3X3 className="w-5 h-5" />}
          <h3 className="font-bold text-gray-800">All Played Cards</h3>
          <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">
            {cards.length}
          </span>
        </div>
        <motion.button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-4 h-4" />
        </motion.button>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === 'grid' ? (
          /* Grid View - Visual Cards */
          <motion.div 
            className="grid grid-cols-4 gap-2"
            variants={cardListVariants}
            initial="hidden"
            animate="visible"
          >
            {cards.map((card, index) => (
              <motion.div
                key={`${card.id}-${index}`}
                variants={cardItemVariants}
                whileHover={{ 
                  scale: 1.1, 
                  zIndex: 10,
                  transition: { duration: 0.2 }
                }}
              >
                <Card
                  card={card}
                  size="small"
                  className={`
                    ${index === cards.length - 1 ? 'ring-2 ring-blue-400' : 'opacity-75'}
                    hover:opacity-100 transition-opacity
                  `}
                  animate={false}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* List View - Text Format */
          <motion.div 
            className="space-y-2"
            variants={cardListVariants}
            initial="hidden"
            animate="visible"
          >
            {cards.map((card, index) => (
              <motion.div
                key={`${card.id}-${index}`}
                variants={cardItemVariants}
                className={`
                  flex items-center gap-3 p-2 rounded-lg border
                  ${index === cards.length - 1 
                    ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }
                  transition-colors cursor-pointer
                `}
              >
                <div className="flex-shrink-0">
                  <Card
                    card={card}
                    size="small"
                    className="opacity-90"
                    animate={false}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm font-semibold text-gray-800">
                    {formatCardForDisplay(card)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {card.type === 'number' 
                      ? `${card.value} ${card.element}` 
                      : `${card.type} ${card.element}`
                    }
                  </div>
                </div>
                <div className="text-xs text-gray-400 font-mono">
                  #{index + 1}
                </div>
                {/* {index === cards.length - 1 && (
                  <motion.div
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    CURRENT
                  </motion.div>
                )} */}
              </motion.div>
            ))}
          </motion.div>
        )}

        {cards.length === 0 && (
          <motion.div 
            className="text-center text-gray-500 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-4xl mb-2">🃏</div>
            <p>No cards played yet</p>
          </motion.div>
        )}
      </div>

      {/* Footer with summary */}
      <motion.div 
        className="border-t border-gray-200 p-4 bg-white/90"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="text-xs text-gray-600">
          <div className="font-semibold mb-1">Summary:</div>
          <div className="font-mono bg-gray-100 p-2 rounded text-xs break-words">
            [{cards.map(formatCardForDisplay).join(', ')}]
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CardStackViewer;