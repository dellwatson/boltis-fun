import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Timer, Eye, Settings, Layers, Clock, Zap, Palette, Shuffle, Plus, User, Bot, Car as Cards, Maximize2, Minimize2 } from 'lucide-react';
import { GameSettings, Card, ElementType, CardType } from '../types/game';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  // New props for card management
  players?: any[];
  onAddCardToPlayer?: (playerIndex: number, card: Card) => void;
  gamePhase?: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  players = [],
  onAddCardToPlayer,
  gamePhase
}) => {
  const [activeTab, setActiveTab] = useState<'game' | 'cards'>('game');
  const [selectedElement, setSelectedElement] = useState<ElementType>('fire');
  const [selectedCardType, setSelectedCardType] = useState<CardType>('number');
  const [selectedValue, setSelectedValue] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: isFullscreen ? 1 : 0.8,
      y: isFullscreen ? 0 : 50
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
    },
    exit: {
      opacity: 0,
      scale: isFullscreen ? 1 : 0.8,
      y: isFullscreen ? 0 : 50,
      transition: { duration: 0.3 }
    }
  };

  const createCard = (): Card => {
    return {
      id: `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      element: selectedElement,
      type: selectedCardType,
      value: selectedCardType === 'number' ? selectedValue : undefined
    };
  };

  const handleAddCard = (playerIndex: number) => {
    if (onAddCardToPlayer) {
      const newCard = createCard();
      onAddCardToPlayer(playerIndex, newCard);
    }
  };

  const getCardTypeOptions = (): CardType[] => {
    return ['number', 'skip', 'reverse', 'stack', 'void'];
  };

  const getElementColor = (element: ElementType) => {
    const colors = {
      fire: 'bg-red-500',
      water: 'bg-blue-500',
      plant: 'bg-green-500',
      thunder: 'bg-yellow-500'
    };
    return colors[element];
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div 
            className={`bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
              isFullscreen 
                ? 'w-full h-full max-w-none max-h-none rounded-none' 
                : 'max-w-6xl w-full max-h-[90vh]'
            }`}
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            layout
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">
                    Game Settings {isFullscreen && '(Fullscreen)'}
                  </h2>
                  {gamePhase && (
                    <p className="text-white/80 text-sm">Game is paused while settings are open</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-5 h-5" />
                  ) : (
                    <Maximize2 className="w-5 h-5" />
                  )}
                </motion.button>
                <motion.button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <motion.button
                onClick={() => setActiveTab('game')}
                className={`flex-1 py-4 px-6 font-medium transition-colors ${
                  activeTab === 'game' 
                    ? 'bg-white text-purple-600 border-b-2 border-purple-600' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Settings className="w-5 h-5" />
                  Game Settings
                </div>
              </motion.button>
              <motion.button
                onClick={() => setActiveTab('cards')}
                className={`flex-1 py-4 px-6 font-medium transition-colors ${
                  activeTab === 'cards' 
                    ? 'bg-white text-purple-600 border-b-2 border-purple-600' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Cards className="w-5 h-5" />
                  Card Management
                </div>
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className={`p-6 ${isFullscreen ? 'p-8' : ''}`}>
                {activeTab === 'game' && (
                  <div className={`grid gap-8 ${isFullscreen ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : ''}`}>
                    {/* Player Timer Settings */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-6 h-6 text-red-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Player Timer</h3>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Turn Time Limit: <span className="font-bold text-purple-600">{settings.playerTurnTimeLimit}s</span>
                          </label>
                          <input
                            type="range"
                            min="3"
                            max="15"
                            step="1"
                            value={settings.playerTurnTimeLimit}
                            onChange={(e) => onUpdateSettings({ playerTurnTimeLimit: parseInt(e.target.value) })}
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>3s (Fast)</span>
                            <span>15s (Relaxed)</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Timeout Penalty: <span className="font-bold text-purple-600">{settings.timeoutPenaltyCards} cards</span>
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            step="1"
                            value={settings.timeoutPenaltyCards}
                            onChange={(e) => onUpdateSettings({ timeoutPenaltyCards: parseInt(e.target.value) })}
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>1 card</span>
                            <span>5 cards</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bot Settings */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Timer className="w-6 h-6 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Bot Settings</h3>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Min Decision Time: <span className="font-bold text-purple-600">{settings.botMinDecisionTime}s</span>
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="2"
                            step="0.1"
                            value={settings.botMinDecisionTime}
                            onChange={(e) => onUpdateSettings({ botMinDecisionTime: parseFloat(e.target.value) })}
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Max Decision Time: <span className="font-bold text-purple-600">{settings.botMaxDecisionTime}s</span>
                          </label>
                          <input
                            type="range"
                            min="0.5"
                            max="5"
                            step="0.1"
                            value={settings.botMaxDecisionTime}
                            onChange={(e) => onUpdateSettings({ botMaxDecisionTime: parseFloat(e.target.value) })}
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Animation Settings */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-6 h-6 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Animation Settings</h3>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            General Animation Speed: <span className="font-bold text-purple-600">{settings.animationDuration}x</span>
                          </label>
                          <input
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.1"
                            value={settings.animationDuration}
                            onChange={(e) => onUpdateSettings({ animationDuration: parseFloat(e.target.value) })}
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>0.5x (Fast)</span>
                            <span>3x (Slow)</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Controls card drawing and regular card play animations
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Void Card Flying Speed: <span className="font-bold text-purple-600">{settings.voidCardFlySpeed}x</span>
                          </label>
                          <input
                            type="range"
                            min="0.3"
                            max="2.5"
                            step="0.1"
                            value={settings.voidCardFlySpeed}
                            onChange={(e) => onUpdateSettings({ voidCardFlySpeed: parseFloat(e.target.value) })}
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>0.3x (Very Fast)</span>
                            <span>2.5x (Very Slow)</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Speed of void card flying to discard pile area
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Void Color Change Speed: <span className="font-bold text-purple-600">{settings.voidColorChangeSpeed}x</span>
                          </label>
                          <input
                            type="range"
                            min="0.2"
                            max="2"
                            step="0.1"
                            value={settings.voidColorChangeSpeed}
                            onChange={(e) => onUpdateSettings({ voidColorChangeSpeed: parseFloat(e.target.value) })}
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>0.2x (Instant)</span>
                            <span>2x (Slow)</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Speed of void card color transformation animation
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Color Selection Time Limit: <span className="font-bold text-purple-600">{settings.colorSelectionTimeLimit}s</span>
                          </label>
                          <input
                            type="range"
                            min="2"
                            max="10"
                            step="1"
                            value={settings.colorSelectionTimeLimit}
                            onChange={(e) => onUpdateSettings({ colorSelectionTimeLimit: parseInt(e.target.value) })}
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>2s (Fast)</span>
                            <span>10s (Relaxed)</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Time limit for void card color selection (auto-random after timeout)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Visual Settings */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Eye className="w-6 h-6 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Visual Settings</h3>
                      </div>
                      
                      <motion.label 
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <Eye className="w-5 h-5 text-gray-600" />
                          <div>
                            <span className="font-medium text-gray-700">Show Bot Cards</span>
                            <p className="text-sm text-gray-500">Reveal bot cards for debugging</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.realTimeSettings.showBotCards}
                          onChange={(e) => onUpdateSettings({ 
                            realTimeSettings: { 
                              ...settings.realTimeSettings, 
                              showBotCards: e.target.checked 
                            } 
                          })}
                          className="w-6 h-6 text-purple-600 rounded focus:ring-purple-500"
                        />
                      </motion.label>
                    </div>

                    {/* Game Rules */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Layers className="w-6 h-6 text-orange-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Game Rules</h3>
                      </div>
                      
                      <motion.label 
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <Layers className="w-5 h-5 text-gray-600" />
                          <div>
                            <span className="font-medium text-gray-700">Advanced Stack Mode</span>
                            <p className="text-sm text-gray-500">
                              {settings.gameMode.stackMode === 'destroy-weak' ? 'Destroy same/weak elements' : 'Destroy same element cards only'}
                            </p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.gameMode.stackMode === 'destroy-weak'}
                          onChange={(e) => onUpdateSettings({ 
                            gameMode: { 
                              ...settings.gameMode, 
                              stackMode: e.target.checked ? 'destroy-weak' : 'destroy-same' 
                            } 
                          })}
                          className="w-6 h-6 text-purple-600 rounded focus:ring-purple-500"
                        />
                      </motion.label>
                    </div>
                  </div>
                )}

                {activeTab === 'cards' && (
                  <div className={`space-y-8 ${isFullscreen ? 'max-w-none' : ''}`}>
                    {/* Card Creator */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200">
                      <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                        <Plus className="w-6 h-6 text-purple-600" />
                        Card Creator & Management
                      </h3>
                      
                      <div className={`grid gap-6 mb-8 ${isFullscreen ? 'grid-cols-1 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
                        {/* Element Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Element</label>
                          <div className="grid grid-cols-2 gap-3">
                            {(['fire', 'water', 'plant', 'thunder'] as ElementType[]).map((element) => (
                              <motion.button
                                key={element}
                                onClick={() => setSelectedElement(element)}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                  selectedElement === element
                                    ? 'border-purple-500 bg-purple-50 shadow-lg'
                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <div className={`w-6 h-6 rounded-full mx-auto mb-2 ${getElementColor(element)}`} />
                                <span className="text-sm font-medium capitalize">{element}</span>
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        {/* Card Type Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Card Type</label>
                          <select
                            value={selectedCardType}
                            onChange={(e) => setSelectedCardType(e.target.value as CardType)}
                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                          >
                            {getCardTypeOptions().map((type) => (
                              <option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Value Selection (for number cards) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Value {selectedCardType !== 'number' && '(N/A)'}
                          </label>
                          <select
                            value={selectedValue}
                            onChange={(e) => setSelectedValue(parseInt(e.target.value))}
                            disabled={selectedCardType !== 'number'}
                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Card Preview */}
                        {isFullscreen && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Preview</label>
                            <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                              <div className={`w-16 h-20 rounded-lg ${getElementColor(selectedElement)} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                                {selectedCardType === 'number' ? selectedValue : selectedCardType.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-800">
                                  {selectedCardType === 'number' 
                                    ? `${selectedValue} ${selectedElement.charAt(0).toUpperCase() + selectedElement.slice(1)}`
                                    : `${selectedCardType.charAt(0).toUpperCase() + selectedCardType.slice(1)} ${selectedElement.charAt(0).toUpperCase() + selectedElement.slice(1)}`
                                  }
                                </div>
                                <div className="text-sm text-gray-500">
                                  {selectedCardType === 'number' ? 'Number Card' : 'Special Card'}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Preview for non-fullscreen */}
                      {!isFullscreen && (
                        <div className="mb-8">
                          <label className="block text-sm font-medium text-gray-700 mb-3">Preview</label>
                          <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
                            <div className={`w-12 h-16 rounded ${getElementColor(selectedElement)} flex items-center justify-center text-white font-bold text-sm`}>
                              {selectedCardType === 'number' ? selectedValue : selectedCardType.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">
                                {selectedCardType === 'number' 
                                  ? `${selectedValue} ${selectedElement.charAt(0).toUpperCase() + selectedElement.slice(1)}`
                                  : `${selectedCardType.charAt(0).toUpperCase() + selectedCardType.slice(1)} ${selectedElement.charAt(0).toUpperCase() + selectedElement.slice(1)}`
                                }
                              </div>
                              <div className="text-sm text-gray-500">
                                {selectedCardType === 'number' ? 'Number Card' : 'Special Card'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Player List */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-6">Add Card to Player</h3>
                      <div className={`grid gap-4 ${isFullscreen ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
                        {players.map((player, index) => (
                          <motion.div
                            key={player.id}
                            className="p-6 bg-white rounded-xl border border-gray-200 hover:border-purple-300 transition-all shadow-sm hover:shadow-md"
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {player.playerType === 'human' ? (
                                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-600" />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-gray-600" />
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium text-gray-800">{player.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {player.cards.length} cards • {player.playerType}
                                    {player.difficulty && ` (${player.difficulty})`}
                                  </div>
                                </div>
                              </div>
                              <motion.button
                                onClick={() => handleAddCard(index)}
                                className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl transition-colors shadow-md hover:shadow-lg"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={!onAddCardToPlayer}
                              >
                                <Plus className="w-5 h-5" />
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Warning */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-yellow-800 text-sm font-bold">!</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-yellow-800 mb-2">Admin Feature</h4>
                          <p className="text-sm text-yellow-700 leading-relaxed">
                            This feature allows you to add cards to any player for testing purposes. 
                            Cards will be animated from the draw pile to the selected player with the same 
                            animation system used for drawing cards.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {isFullscreen ? 'Press ESC or click minimize to exit fullscreen' : 'Click maximize for fullscreen view'}
                </div>
                <motion.button
                  onClick={onClose}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Close Settings
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;