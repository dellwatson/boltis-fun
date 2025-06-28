import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target,
  Sparkles,
  Clock,
  Trophy,
  Star,
  Crown,
  Zap,
  Layers,
  RotateCcw,
  SkipForward,
  CircleOff,
  Cuboid as Void,
  Plus,
  Sword
} from 'lucide-react';
import Card from './Card';
import { Card as CardType } from '../types/game';

interface HowToPlayContentProps {
  className?: string;
}

const HowToPlayContent: React.FC<HowToPlayContentProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'basics' | 'cards' | 'modes' | 'scoring'>('basics');

  // Sample cards for demonstration
  const sampleCards: CardType[] = [
    { id: 'fire-5', element: 'fire', type: 'number', value: 5 },
    { id: 'water-7', element: 'water', type: 'number', value: 7 },
    { id: 'plant-3', element: 'plant', type: 'number', value: 3 },
    { id: 'thunder-9', element: 'thunder', type: 'number', value: 9 },
    { id: 'fire-skip', element: 'fire', type: 'skip' },
    { id: 'water-reverse', element: 'water', type: 'reverse' },
    { id: 'plant-stack', element: 'plant', type: 'stack' },
    { id: 'void-1', element: 'fire', type: 'void' },
    { id: 'fire-strike', element: 'fire', type: 'strike' }
  ];

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/50 to-blue-600/50 p-8 text-white">
        <div className="flex items-center gap-4 mb-6">
          <Target className="w-10 h-10 text-green-400" />
          <div>
            <h2 className="text-4xl font-bold">Master the Game</h2>
            <p className="text-white/80 text-xl">Learn the rules and dominate the arena</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/10 rounded-lg p-1">
          {[
            { id: 'basics', label: 'Game Basics', icon: Target },
            { id: 'cards', label: 'Card Types', icon: Sparkles },
            { id: 'modes', label: 'Game Modes', icon: Clock },
            { id: 'scoring', label: 'Scoring', icon: Trophy }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-all duration-200 ${
                activeTab === tab.id 
                  ? 'bg-white text-purple-600 shadow-sm' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'basics' && (
            <motion.div
              key="basics"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <Target className="w-8 h-8 text-green-400" />
                <h3 className="text-3xl font-bold text-white">Objective</h3>
              </div>
              
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Be the first to empty your hand or have the lowest score when time runs out. Match colors, numbers, or use special cards to outplay your opponents.
              </p>

              <div className="mb-8">
                <h4 className="text-2xl font-bold text-white mb-6">Winning Conditions:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-green-500/20 rounded-2xl border border-green-400/30">
                    <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h5 className="text-xl font-bold text-green-400 mb-2">Empty Hand</h5>
                    <p className="text-white/80">First to play all cards wins instantly</p>
                  </div>
                  
                  <div className="text-center p-6 bg-yellow-500/20 rounded-2xl border border-yellow-400/30">
                    <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <h5 className="text-xl font-bold text-yellow-400 mb-2">Lowest Score</h5>
                    <p className="text-white/80">When time runs out, lowest points wins</p>
                  </div>
                  
                  <div className="text-center p-6 bg-red-500/20 rounded-2xl border border-red-400/30">
                    <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h5 className="text-xl font-bold text-red-400 mb-2">Elimination</h5>
                    <p className="text-white/80">Last player standing in time-bank mode</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-8 rounded-2xl border border-purple-400/30">
                <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  Elements
                </h4>
                
                {/* Basic Elements Note */}
                <div className="mb-6 p-4 bg-white/10 rounded-xl border border-white/20">
                  <p className="text-white/90 text-center">
                    <span className="font-semibold text-yellow-400">🌟 Basic Elements:</span> Start with 4 core elements. 
                    <span className="text-white/70"> Future expansions may include Wind, Rock, Ice, and more based on community preference!</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {/* Basic 4 Elements */}
                  {sampleCards.slice(0, 4).map((card, index) => (
                    <div key={card.id} className="flex flex-col items-center gap-3">
                      <Card card={card} size="medium" animate={false} />
                      <span className="font-semibold text-white capitalize">{card.element}</span>
                    </div>
                  ))}
                  
                  {/* Expansion Card */}
                  <div className="flex flex-col items-center gap-3">
                    <motion.div
                      className="w-16 h-24 rounded-lg border-2 border-dashed border-white/40 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-cyan-500/20 flex flex-col items-center justify-center relative overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                      animate={{
                        borderColor: [
                          'rgba(255,255,255,0.4)',
                          'rgba(236,72,153,0.6)',
                          'rgba(168,85,247,0.6)',
                          'rgba(6,182,212,0.6)',
                          'rgba(255,255,255,0.4)'
                        ]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {/* Animated background gradient */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-cyan-500/30"
                        animate={{
                          background: [
                            'linear-gradient(135deg, rgba(236,72,153,0.3), rgba(168,85,247,0.3), rgba(6,182,212,0.3))',
                            'linear-gradient(135deg, rgba(6,182,212,0.3), rgba(236,72,153,0.3), rgba(168,85,247,0.3))',
                            'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(6,182,212,0.3), rgba(236,72,153,0.3))'
                          ]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      
                      {/* Plus icon */}
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 180, 360]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Plus className="w-8 h-8 text-white relative z-10" />
                      </motion.div>
                      
                      {/* Sparkle effects */}
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-white rounded-full"
                          style={{
                            left: `${20 + i * 30}%`,
                            top: `${30 + (i % 2) * 40}%`
                          }}
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.5
                          }}
                        />
                      ))}
                    </motion.div>
                    <div className="text-center">
                      <span className="font-semibold text-white">More Soon</span>
                      <p className="text-xs text-white/60 mt-1">Wind • Rock • Ice</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'cards' && (
            <motion.div
              key="cards"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <Sparkles className="w-8 h-8 text-purple-400" />
                <h3 className="text-3xl font-bold text-white">Card Types</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Number Cards */}
                <div className="space-y-6">
                  <h4 className="text-2xl font-bold text-white">Number Cards</h4>
                  <div className="grid grid-cols-4 gap-4">
                    {sampleCards.slice(0, 4).map((card) => (
                      <div key={card.id} className="flex flex-col items-center gap-2">
                        <Card card={card} size="medium" animate={false} />
                        <span className="text-sm text-white/80 capitalize">{card.element}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-white/80">
                    Match by color, number, or element. Each element has cards numbered 1-9.
                  </p>
                </div>

                {/* Special Cards */}
                <div className="space-y-6">
                  <h4 className="text-2xl font-bold text-white">Special Cards</h4>
                  <div className="space-y-4">
                    {/* Skip Card */}
                    <div className="flex items-center gap-4 p-4 bg-purple-500/20 rounded-xl border border-purple-400/30">
                      <Card card={sampleCards[4]} size="small" animate={false} />
                      <div>
                        <h5 className="font-bold text-white">Skip</h5>
                        <p className="text-white/80 text-sm">Next player loses their turn</p>
                      </div>
                    </div>

                    {/* Reverse Card */}
                    <div className="flex items-center gap-4 p-4 bg-orange-500/20 rounded-xl border border-orange-400/30">
                      <Card card={sampleCards[5]} size="small" animate={false} />
                      <div>
                        <h5 className="font-bold text-white">Reverse</h5>
                        <p className="text-white/80 text-sm">Changes play direction</p>
                      </div>
                    </div>

                    {/* Stack Card */}
                    <div className="flex items-center gap-4 p-4 bg-green-500/20 rounded-xl border border-green-400/30">
                      <Card card={sampleCards[6]} size="small" animate={false} />
                      <div>
                        <h5 className="font-bold text-white">Stack</h5>
                        <p className="text-white/80 text-sm">Removes matching cards and weak elements from discard pile</p>
                      </div>
                    </div>

                    {/* Strike Card */}
                    <div className="flex items-center gap-4 p-4 bg-red-500/20 rounded-xl border border-red-400/30">
                      <Card card={sampleCards[8]} size="small" animate={false} />
                      <div>
                        <h5 className="font-bold text-white">Strike</h5>
                        <p className="text-white/80 text-sm">
                          Next player must draw 2 cards (from discard then draw pile), 
                          counter with same/stronger element, or play a stronger Strike.
                          Void cards can also counter.
                        </p>
                        <div className="mt-2 text-xs bg-black/30 p-2 rounded">
                          <div className="font-semibold text-red-300">Element Hierarchy:</div>
                          <div>🔥 Fire {'>'} 🌱 Plant {'>'} ⚡ Thunder {'>'} 💧 Water {'>'} 🔥</div>
                        </div>
                      </div>
                    </div>

                    {/* Void Card */}
                    <div className="flex items-center gap-4 p-4 bg-gray-500/20 rounded-xl border border-gray-400/30">
                      <Card card={sampleCards[7]} size="small" animate={false} />
                      <div>
                        <h5 className="font-bold text-white">Void</h5>
                        <p className="text-white/80 text-sm">Transfers discard pile to next player and changes color</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Game Modes */}
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-6 rounded-2xl border border-yellow-400/30">
                <h4 className="text-xl font-bold text-white mb-4">🚀 Additional Card Types (Coming Soon)</h4>
                <div className="space-y-3 text-white/90">
                  <div><strong>Locked Element Card:</strong> Locks the current element for several turns</div>
                  <div><strong>Mirror Card:</strong> Copies the effect of the last played special card</div>
                  <div><strong>Remove Stack:</strong> Removes all cards of a specific type from the discard pile</div>
                  <div><strong>Bomb-Time:</strong> Having bomb card to play fast before explosion</div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'modes' && (
            <motion.div
              key="modes"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <Clock className="w-8 h-8 text-blue-400" />
                <h3 className="text-3xl font-bold text-white">Game Modes</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-500/20 p-6 rounded-2xl border border-blue-400/30">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">Classic</h4>
                  <p className="text-white/80 mb-4">Traditional gameplay with turn timers</p>
                  <ul className="text-sm text-white/70 space-y-1">
                    <li>• 5-second turn limit</li>
                    <li>• Penalty cards for timeouts</li>
                    <li>• Standard rules</li>
                  </ul>
                </div>
                
                <div className="bg-purple-500/20 p-6 rounded-2xl border border-purple-400/30">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">Time Bank</h4>
                  <p className="text-white/80 mb-4">Personal time bank with elimination</p>
                  <ul className="text-sm text-white/70 space-y-1">
                    <li>• 90-second time bank</li>
                    <li>• Elimination when time runs out</li>
                    <li>• Strategic time management</li>
                  </ul>
                </div>
                
                <div className="bg-red-500/20 p-6 rounded-2xl border border-red-400/30">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-4">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">Blitz</h4>
                  <p className="text-white/80 mb-4">Fast-paced with shorter timers</p>
                  <ul className="text-sm text-white/70 space-y-1">
                    <li>• 3-second turn limit</li>
                    <li>• Quick decision making</li>
                    <li>• High-intensity gameplay</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'scoring' && (
            <motion.div
              key="scoring"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <h3 className="text-3xl font-bold text-white">Scoring System</h3>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-8 rounded-2xl border border-yellow-400/30">
                <h4 className="text-2xl font-bold text-yellow-400 mb-6">Card Values</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">1-9</div>
                    <p className="text-white font-medium">Number Cards</p>
                    <p className="text-yellow-400 text-sm">Face value points</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">20</div>
                    <p className="text-white font-medium">Special Cards</p>
                    <p className="text-yellow-400 text-sm">Skip, Reverse, Stack, Strike</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">50</div>
                    <p className="text-white font-medium">Void Cards</p>
                    <p className="text-yellow-400 text-sm">Highest penalty</p>
                  </div>
                </div>
              </div>

              <div className="text-center bg-green-500/20 p-8 rounded-2xl border border-green-400/30">
                <h4 className="text-3xl font-bold text-green-400 mb-4">🏆 Lowest Total Score Wins! 🏆</h4>
                <p className="text-xl text-white/90">Empty your hand first or have the fewest points when time runs out</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-500/20 p-6 rounded-xl border border-blue-400/30">
                  <h5 className="text-lg font-bold text-blue-400 mb-3">Strategy Tips</h5>
                  <ul className="space-y-2 text-white/90">
                    <li>• Play high-value cards early</li>
                    <li>• Save special cards for key moments</li>
                    <li>• Watch opponents' card counts</li>
                    <li>• Use void cards strategically</li>
                  </ul>
                </div>
                
                <div className="bg-purple-500/20 p-6 rounded-xl border border-purple-400/30">
                  <h5 className="text-lg font-bold text-purple-400 mb-3">Penalty System</h5>
                  <ul className="space-y-2 text-white/90">
                    <li>• Timeout: +2 penalty cards</li>
                    <li>• Invalid move: Warning</li>
                    <li>• Disconnection: Auto-draw</li>
                    <li>• Time bank depletion: Elimination</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HowToPlayContent;