import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Bot, Clock, Zap, Crown, Search, CheckCircle, Play } from 'lucide-react';
import { GameModeConfig } from '../types/game';

interface MatchmakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (gameMode: GameModeConfig) => void;
  gameType: 'quick-play' | 'quick-learn' | 'custom';
}

interface MatchmakingState {
  phase: 'searching' | 'found' | 'starting';
  playersFound: number;
  maxPlayers: number;
  estimatedWait: number;
  matchId?: string;
}

const MatchmakingModal: React.FC<MatchmakingModalProps> = ({ 
  isOpen, 
  onClose, 
  onStartGame, 
  gameType 
}) => {
  const [matchmaking, setMatchmaking] = useState<MatchmakingState>({
    phase: 'searching',
    playersFound: 1, // Always include current player
    maxPlayers: 4,
    estimatedWait: 30
  });

  const [searchTime, setSearchTime] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setMatchmaking({
        phase: 'searching',
        playersFound: 1,
        maxPlayers: 4,
        estimatedWait: 30
      });
      setSearchTime(0);
      return;
    }

    // Simulate matchmaking process
    const interval = setInterval(() => {
      setSearchTime(prev => prev + 1);
      
      // Simulate finding players
      if (matchmaking.phase === 'searching') {
        // For bot games, simulate quick "matchmaking" with bots
        if (gameType === 'quick-learn' || gameType === 'custom') {
          setTimeout(() => {
            setMatchmaking(prev => ({
              ...prev,
              phase: 'found',
              playersFound: prev.maxPlayers
            }));
          }, 2000);
        } else {
          // For quick-play, simulate finding real players (but actually use bots for now)
          const shouldFindPlayer = Math.random() > 0.7; // 30% chance per second
          if (shouldFindPlayer && matchmaking.playersFound < matchmaking.maxPlayers) {
            setMatchmaking(prev => ({
              ...prev,
              playersFound: Math.min(prev.playersFound + 1, prev.maxPlayers)
            }));
          }
          
          // Auto-start with bots after 10 seconds
          if (searchTime >= 10) {
            setMatchmaking(prev => ({
              ...prev,
              phase: 'found',
              playersFound: prev.maxPlayers
            }));
          }
        }
      }
      
      // Auto-start game when enough players found
      if (matchmaking.phase === 'found') {
        setTimeout(() => {
          setMatchmaking(prev => ({ ...prev, phase: 'starting' }));
          
          // Start the actual game
          setTimeout(() => {
            const gameMode: GameModeConfig = {
              mode: 'classic',
              timerMode: 'turn-based',
              matchDuration: gameType === 'quick-learn' ? 300 : 180, // 5 min for learn, 3 min for play
              playerTimeBank: 90,
              eliminationRules: false,
              pauseEnabled: true,
              stackMode: 'destroy-same',
              includeBombCards: false,
              maxPlayers: matchmaking.maxPlayers
            };
            
            onStartGame(gameMode);
          }, 2000);
        }, 1000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, matchmaking.phase, matchmaking.playersFound, searchTime, gameType, onStartGame]);

  const getGameTypeInfo = () => {
    switch (gameType) {
      case 'quick-play':
        return {
          title: 'Quick Play',
          description: 'Fast-paced matches against skilled opponents',
          icon: Zap,
          color: 'from-green-500 to-green-600'
        };
      case 'quick-learn':
        return {
          title: 'Quick Learn',
          description: 'Practice with friendly bots and learn the game',
          icon: Bot,
          color: 'from-blue-500 to-blue-600'
        };
      case 'custom':
        return {
          title: 'Custom Game',
          description: 'Custom rules and settings',
          icon: Crown,
          color: 'from-purple-500 to-purple-600'
        };
    }
  };

  const gameInfo = getGameTypeInfo();

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 200, damping: 20 }
    },
    exit: { opacity: 0, scale: 0.8, y: 50, transition: { duration: 0.3 } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            variants={modalVariants}
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${gameInfo.color} p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <gameInfo.icon className="w-6 h-6" />
                  <h2 className="text-xl font-bold">{gameInfo.title}</h2>
                </div>
                <motion.button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              <p className="text-white/80 mt-2">{gameInfo.description}</p>
            </div>

            {/* Content */}
            <div className="p-6">
              {matchmaking.phase === 'searching' && (
                <div className="text-center space-y-6">
                  <motion.div
                    className="w-20 h-20 mx-auto"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Search className="w-full h-full text-blue-500" />
                  </motion.div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Finding Players...</h3>
                    <p className="text-gray-600">
                      {gameType === 'quick-learn' || gameType === 'custom' 
                        ? 'Preparing bot opponents...'
                        : 'Searching for players in your skill range...'
                      }
                    </p>
                  </div>

                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Players Found</span>
                      <span className="text-sm font-bold text-gray-800">
                        {matchmaking.playersFound}/{matchmaking.maxPlayers}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-blue-500 h-2 rounded-full"
                        initial={{ width: '25%' }}
                        animate={{ 
                          width: `${(matchmaking.playersFound / matchmaking.maxPlayers) * 100}%` 
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    <div>Search time: {searchTime}s</div>
                    {gameType === 'quick-play' && searchTime < 10 && (
                      <div>Estimated wait: {Math.max(0, matchmaking.estimatedWait - searchTime)}s</div>
                    )}
                  </div>
                </div>
              )}

              {matchmaking.phase === 'found' && (
                <motion.div
                  className="text-center space-y-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <motion.div
                    className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: 2 }}
                  >
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </motion.div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Match Found!</h3>
                    <p className="text-gray-600">
                      {gameType === 'quick-learn' 
                        ? 'Ready to learn with friendly bots'
                        : gameType === 'custom'
                        ? 'Custom game ready to start'
                        : 'Found skilled opponents for you'
                      }
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-center gap-2 text-green-700">
                      <Users className="w-5 h-5" />
                      <span className="font-medium">
                        {matchmaking.maxPlayers} Players Ready
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {matchmaking.phase === 'starting' && (
                <motion.div
                  className="text-center space-y-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <motion.div
                    className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Play className="w-12 h-12 text-purple-500" />
                  </motion.div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Starting Game...</h3>
                    <p className="text-gray-600">Preparing the battlefield</p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="text-purple-700 font-medium">
                      Get ready to master the elements!
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Cancel Button */}
              {matchmaking.phase === 'searching' && (
                <motion.button
                  onClick={onClose}
                  className="w-full mt-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel Search
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MatchmakingModal;