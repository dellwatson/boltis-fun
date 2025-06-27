import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Clock, 
  Timer, 
  Layers, 
  Bomb, 
  Users, 
  Zap,
  Settings,
  Play,
  Info,
  Target,
  Flame
} from 'lucide-react';
import { GameModeConfig, DEFAULT_GAME_MODE_CONFIG, TimerMode, StackMode } from '../types/game';

interface GameModeSelectorProps {
  onClose: () => void;
  onStartGame: (config: GameModeConfig) => void;
}

const GameModeSelector: React.FC<GameModeSelectorProps> = ({ onClose, onStartGame }) => {
  const [config, setConfig] = useState<GameModeConfig>({ 
    ...DEFAULT_GAME_MODE_CONFIG,
    matchDuration: 180, // 3 minutes default
    stackMode: 'destroy-same', // Default to destroy same elements
    timerMode: 'turn-based', // Disable time-bank for now
    eliminationRules: false // Disable elimination for now
  });
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'preview'>('basic');

  const updateConfig = (updates: Partial<GameModeConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleStartGame = () => {
    console.log('🎮 Starting game with config:', config);
    onStartGame(config);
  };

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

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
        variants={modalVariants}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Game Mode Setup</h2>
                <p className="text-white/80">Configure your bot battle experience</p>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 bg-white/10 rounded-lg p-1">
            {[
              { id: 'basic', label: 'Basic Rules', icon: Target },
              { id: 'advanced', label: 'Advanced', icon: Zap },
              { id: 'preview', label: 'Preview', icon: Info }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'basic' && (
              <motion.div
                key="basic"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                {/* Timer Mode - DISABLED FOR NOW */}
                <div className="space-y-4 opacity-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-800">Timer System (Coming Soon)</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50 text-blue-800">
                      <Timer className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">Turn-Based Timer</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Each turn has a time limit that resets
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border-2 border-gray-200 opacity-50">
                      <Clock className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">Time Bank (Disabled)</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Personal time bank - Coming soon
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stack Mode */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-800">Stack Card Behavior</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.button
                      onClick={() => updateConfig({ stackMode: 'destroy-same' })}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        config.stackMode === 'destroy-same'
                          ? 'border-purple-500 bg-purple-50 text-purple-800'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Target className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">Destroy Same Elements</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Remove cards of the same element only (Default)
                      </div>
                    </motion.button>

                    <motion.button
                      onClick={() => updateConfig({ stackMode: 'destroy-weak' })}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        config.stackMode === 'destroy-weak'
                          ? 'border-orange-500 bg-orange-50 text-orange-800'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Flame className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">Destroy Weak Elements</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Remove cards weak against stack element
                      </div>
                    </motion.button>
                  </div>
                </div>

                {/* Match Duration */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold text-gray-800">Match Duration</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {config.matchDuration === 0 ? 'Infinite' : `${Math.floor(config.matchDuration / 60)}:${(config.matchDuration % 60).toString().padStart(2, '0')}`}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="600"
                      step="30"
                      value={config.matchDuration}
                      onChange={(e) => updateConfig({ matchDuration: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Infinite</span>
                      <span>10min</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'advanced' && (
              <motion.div
                key="advanced"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                {/* Special Features */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    Special Features
                  </h3>
                  
                  <div className="space-y-3">
                    <motion.label 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-not-allowed opacity-50"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center gap-3">
                        <Bomb className="w-5 h-5 text-red-600" />
                        <div>
                          <span className="font-medium text-gray-700">Include Bomb Cards</span>
                          <p className="text-sm text-gray-500">Add explosive special cards (Coming Soon)</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => {}}
                        className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                        disabled
                      />
                    </motion.label>

                    <motion.label 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-not-allowed opacity-50"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-purple-600" />
                        <div>
                          <span className="font-medium text-gray-700">Elimination Rules (Disabled)</span>
                          <p className="text-sm text-gray-500">Players eliminated when time bank runs out</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => {}}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        disabled
                      />
                    </motion.label>

                    <motion.label 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <div>
                          <span className="font-medium text-gray-700">Pause Enabled</span>
                          <p className="text-sm text-gray-500">Allow pausing during bot games</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.pauseEnabled}
                        onChange={(e) => updateConfig({ pauseEnabled: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </motion.label>
                  </div>
                </div>

                {/* Player Count */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    Player Count
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Players: {config.maxPlayers}
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="8"
                      step="1"
                      value={config.maxPlayers}
                      onChange={(e) => updateConfig({ maxPlayers: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>2 players</span>
                      <span>8 players</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'preview' && (
              <motion.div
                key="preview"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  Game Configuration Preview
                </h3>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Game Mode:</span>
                        <span className="font-medium capitalize">{config.mode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Timer Mode:</span>
                        <span className="font-medium">Turn-Based</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Players:</span>
                        <span className="font-medium">{config.maxPlayers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stack Mode:</span>
                        <span className="font-medium">{config.stackMode === 'destroy-weak' ? 'Destroy Weak' : 'Destroy Same'}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Match Duration:</span>
                        <span className="font-medium">
                          {config.matchDuration === 0 ? 'Infinite' : `${Math.floor(config.matchDuration / 60)}:${(config.matchDuration % 60).toString().padStart(2, '0')}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Elimination:</span>
                        <span className="font-medium">Disabled</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pause:</span>
                        <span className="font-medium">{config.pauseEnabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bomb Cards:</span>
                        <span className="font-medium">Coming Soon</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Settings Summary */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">✅ Ready to Play</h4>
                  <div className="space-y-1 text-sm text-green-700">
                    <div>• {config.maxPlayers} players (1 human + {config.maxPlayers - 1} bots)</div>
                    <div>• {config.matchDuration === 0 ? 'Infinite match time' : `${Math.floor(config.matchDuration / 60)} minute match`}</div>
                    <div>• Stack cards {config.stackMode === 'destroy-same' ? 'destroy same elements' : 'destroy weak elements'}</div>
                    <div>• Turn-based timer with penalties</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer with START GAME Button - FIXED POSITIONING */}
        <div className="border-t border-gray-200 p-6 bg-white flex-shrink-0">
          <div className="flex gap-3 justify-end">
            <motion.button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={handleStartGame}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-bold flex items-center gap-2 text-lg shadow-lg"
              whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.98 }}
            >
              <Play className="w-5 h-5" />
              START GAME
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GameModeSelector;