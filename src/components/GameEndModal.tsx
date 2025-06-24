import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Award, RotateCcw } from 'lucide-react';
import { Player } from '../types/game';

interface GameEndModalProps {
  rankings: { player: Player; rank: number; score: number }[];
  winner: string;
  onPlayAgain: () => void;
}

const GameEndModal: React.FC<GameEndModalProps> = ({ rankings, winner, onPlayAgain }) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 2: return <Medal className="w-8 h-8 text-gray-400" />;
      case 3: return <Award className="w-8 h-8 text-amber-600" />;
      default: return <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold">{rank}</div>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-100 border-yellow-300';
      case 2: return 'bg-gray-100 border-gray-300';
      case 3: return 'bg-amber-100 border-amber-300';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 50
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  const rankingVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.5
      }
    }
  };

  const rankItemVariants = {
    hidden: { 
      opacity: 0, 
      x: -50,
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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        variants={modalVariants}
      >
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
          >
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Game Over!</h1>
          <motion.p 
            className="text-lg text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {winner}
          </motion.p>
        </motion.div>

        <motion.div 
          className="space-y-3 mb-6"
          variants={rankingVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-xl font-bold text-gray-800 text-center">Final Rankings</h2>
          <AnimatePresence>
            {rankings.map((ranking, index) => (
              <motion.div
                key={ranking.player.id}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 ${getRankColor(ranking.rank)}`}
                variants={rankItemVariants}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
              >
                <motion.div 
                  className="flex-shrink-0"
                  animate={ranking.rank === 1 ? {
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  } : {}}
                  transition={{
                    duration: 1.5,
                    repeat: ranking.rank === 1 ? Infinity : 0,
                    delay: index * 0.2
                  }}
                >
                  {getRankIcon(ranking.rank)}
                </motion.div>
                <div className="flex-grow">
                  <div className="font-semibold text-gray-800">{ranking.player.name}</div>
                  <div className="text-sm text-gray-600">
                    {ranking.player.cards.length} cards • {ranking.score} points
                  </div>
                </div>
                <motion.div 
                  className="text-2xl font-bold text-gray-700"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1, type: "spring" }}
                >
                  #{ranking.rank}
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Scoring System:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>• Number cards (1-9): Face value</div>
              <div>• Special cards (Skip, Reverse, Stack): 20 points</div>
              <div>• Void cards: 50 points</div>
              <div className="font-medium mt-2">Lowest total score wins!</div>
            </div>
          </div>

          <motion.button
            onClick={onPlayAgain}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
            }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <RotateCcw className="w-5 h-5" />
            </motion.div>
            Play Again
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default GameEndModal;