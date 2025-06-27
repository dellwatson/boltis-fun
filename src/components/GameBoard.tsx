import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Card as CardType, DiscardedCard, Player, GameEvent } from '../types/game';
import Card from './Card';
import PlayerArea from './PlayerArea';
import ColorSelector from './ColorSelector';
import GameEndModal from './GameEndModal';
import CardStackViewer from './CardStackViewer';
import SettingsModal from './SettingsModal';
import { useGameStore } from '../store/gameStore';
import { FeedbackService } from '../services/FeedbackService';
import {
  Clock,
  Settings,
  List,
  Grid3X3,
  ChevronLeft,
  ChevronRight,
  Home,
  Play,
  Pause,
  MessageCircle,
  Send,
  CheckCircle,
  X,
  Bug,
  Scroll,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
} from 'lucide-react';

interface GameBoardProps {
  onBackToHome: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ onBackToHome }) => {
  const gameState = useGameStore();
  const [showStackViewer, setShowStackViewer] = React.useState(false);
  const [stackViewerSide, setStackViewerSide] = React.useState<
    'left' | 'right'
  >('right');
  const [stackViewMode, setStackViewMode] = React.useState<'list' | 'grid'>(
    'list'
  );
  const [showSettings, setShowSettings] = React.useState(false);
  const [showDebugLog, setShowDebugLog] = React.useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const drawPileRef = React.useRef<HTMLDivElement>(null);
  const discardPileRef = React.useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isHumanTurn =
    gameState.currentPlayerIndex === gameState.humanPlayerIndex;

  const currentTopCard = gameState.allDiscardedCards[gameState.allDiscardedCards.length - 1];
  const backgroundCards = gameState.allDiscardedCards.slice(0, -1);

  // Auto-pause game when settings are opened
  React.useEffect(() => {
    if (showSettings && gameState.gamePhase === 'playing') {
      gameState.pauseGame();
    }
  }, [showSettings]);

  // Handle settings close - resume game if it was paused by settings
  const handleSettingsClose = () => {
    setShowSettings(false);
    if (gameState.gamePhase === 'paused') {
      gameState.resumeGame();
    }
  };

  // Add card to player function
  const handleAddCardToPlayer = (playerIndex: number, card: CardType) => {
    if (gameState.gameEngine) {
      // Use the existing draw card animation system
      gameState.gameEngine.addCardToPlayer(playerIndex, card);
    }
  };

  // ✅ BROWSER FULLSCREEN FUNCTIONALITY
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  // Get player positions for animations
  const getPlayerPosition = (
    playerIndex: number
  ): 'top' | 'left' | 'right' | 'bottom' => {
    const positions: ('bottom' | 'left' | 'top' | 'right')[] = [
      'bottom',
      'left',
      'top',
      'right',
    ];
    const relativeIndex = (playerIndex - gameState.humanPlayerIndex + 4) % 4;
    return positions[relativeIndex];
  };

  const getPlayerTargetPosition = (playerIndex: number) => {
    const position = getPlayerPosition(playerIndex);

    switch (position) {
      case 'bottom':
        return { x: 0, y: 180 };
      case 'top':
        return { x: 0, y: -180 };
      case 'left':
        return { x: -320, y: -20 };
      case 'right':
        return { x: 320, y: -20 };
      default:
        return { x: 0, y: 0 };
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Update card positions when game state changes
  React.useEffect(() => {
    if (gameState.drawingAnimation?.isActive) {
      const animateCardDraw = async () => {
        if (drawPileRef.current) {
          await controls.start({
            scale: [1, 1.1, 1],
            transition: { duration: 0.3 },
          });
        }
      };
      animateCardDraw();
    }
  }, [gameState.drawingAnimation, controls]);

  if (gameState.gamePhase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 mx-auto mb-4 animate-spin">⚡</div>
          <h1 className="text-2xl font-bold">Loading Elemental Cards...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 overflow-hidden">
      {/* Debug Log */}
      {showDebugLog && <DebugLog events={gameState.gameEvents} onToggleVisibility={setShowDebugLog} />}

      {/* In-Game Feedback Widget */}
      <InGameFeedbackWidget showDebugLog={showDebugLog} />

      {/* ✅ COMPLETE VOID CARD ANIMATION SYSTEM */}
      <AnimatePresence>
        {gameState.voidAnimationPhase && (
          <VoidCardAnimationSystem 
            gameState={gameState}
            getPlayerTargetPosition={getPlayerTargetPosition}
          />
        )}
      </AnimatePresence>

      {/* Enhanced Card Drawing Animation */}
      <AnimatePresence>
        {gameState.drawingAnimation && gameState.drawingAnimation.isActive && (
          <motion.div className="fixed inset-0 pointer-events-none z-[100]">
            {gameState.drawingAnimation.phase === 'flying' && (
              <motion.div
                className="absolute"
                initial={() => {
                  const drawPos = { x: -300, y: -200 }; // Simplified for now
                  return {
                    x: drawPos.x,
                    y: drawPos.y,
                    scale: 0.8,
                    opacity: 0.9,
                    rotate: -15,
                  };
                }}
                animate={() => {
                  const targetPos = getPlayerTargetPosition(
                    gameState.drawingAnimation!.playerIndex
                  );
                  return {
                    x: targetPos.x,
                    y: targetPos.y,
                    scale: 1,
                    opacity: 1,
                    rotate: 0,
                  };
                }}
                transition={{
                  duration: gameState.settings.animationDuration * 0.7,
                  type: 'spring',
                  stiffness: 80,
                  damping: 20,
                }}
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <Card
                  card={{
                    id: 'flying',
                    element: 'fire',
                    type: 'number',
                    value: 1,
                  }}
                  size="medium"
                  className="shadow-2xl border-2 border-yellow-400 ring-4 ring-yellow-400/30"
                  animate={false}
                  isCardBack={true}
                />
              </motion.div>
            )}

            {gameState.drawingAnimation.phase === 'revealing' &&
              gameState.drawingAnimation.playerIndex === 0 && (
                <motion.div
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                  initial={() => {
                    const targetPos = getPlayerTargetPosition(0);
                    return {
                      x: targetPos.x,
                      y: targetPos.y,
                      scale: 1,
                    };
                  }}
                >
                  <motion.div
                    animate={{
                      scaleX: [1, 0, 1],
                    }}
                    transition={{
                      duration: gameState.settings.animationDuration * 0.4,
                      times: [0, 0.5, 1],
                      ease: 'easeInOut',
                    }}
                  >
                    <motion.div
                      animate={{
                        opacity: [1, 1, 0, 0, 1, 1],
                      }}
                      transition={{
                        duration: gameState.settings.animationDuration * 0.4,
                        times: [0, 0.4, 0.5, 0.5, 0.6, 1],
                      }}
                    >
                      <Card
                        card={{
                          id: 'revealing-back',
                          element: 'fire',
                          type: 'number',
                          value: 1,
                        }}
                        size="medium"
                        className="shadow-2xl border-2 border-yellow-400"
                        animate={false}
                        isCardBack={true}
                      />
                    </motion.div>

                    <motion.div
                      className="absolute top-0 left-0"
                      animate={{
                        opacity: [0, 0, 0, 0, 1, 1],
                      }}
                      transition={{
                        duration: gameState.settings.animationDuration * 0.4,
                        times: [0, 0.4, 0.5, 0.5, 0.6, 1],
                      }}
                    >
                      <Card
                        card={
                          gameState.drawingAnimation.drawnCard || {
                            id: 'revealing',
                            element: 'fire',
                            type: 'number',
                            value: 1,
                          }
                        }
                        size="medium"
                        className="shadow-2xl border-2 border-green-400 ring-4 ring-green-400/30"
                        animate={false}
                      />
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

            {gameState.drawingAnimation.phase === 'sorting' &&
              gameState.drawingAnimation.playerIndex === 0 && (
                <motion.div
                  className="absolute"
                  initial={() => {
                    const targetPos = getPlayerTargetPosition(0);
                    return {
                      x: targetPos.x,
                      y: targetPos.y,
                      scale: 1,
                      opacity: 1,
                    };
                  }}
                  animate={{
                    x: 0,
                    y: 300,
                    scale: 0.8,
                    opacity: 0,
                  }}
                  transition={{
                    duration: gameState.settings.animationDuration * 0.5,
                    type: 'spring',
                    stiffness: 100,
                  }}
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <Card
                    card={
                      gameState.drawingAnimation.drawnCard || {
                        id: 'sorting',
                        element: 'fire',
                        type: 'number',
                        value: 1,
                      }
                    }
                    size="medium"
                    className="shadow-xl"
                    animate={false}
                  />
                </motion.div>
              )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game center area */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Discard pile - Mobile responsive positioning */}
          <div className={`relative ${
            // Mobile: move discard pile up and make smaller
            window.innerWidth < 768 ? 'transform -translate-y-8 scale-90' : ''
          }`}>
            <div className="relative w-16 h-24 flex items-center justify-center">
              {/* ✅ VOID CARD BACKGROUND LAYER */}
              {gameState.voidCard && gameState.voidSelectedColor && (
                <motion.div
                  className="absolute z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    card={{
                      ...gameState.voidCard,
                      element: gameState.voidSelectedColor,
                      type: 'number',
                      value: 0 // Plain color card
                    }}
                    size="medium"
                    animate={false}
                    className="shadow-lg border border-white/20"
                  />
                </motion.div>
              )}

              {/* Background cards */}
              {backgroundCards.map((discardedCard) => (
                <div
                  key={`discard-${discardedCard.id}-${discardedCard.discardIndex}`}
                  className="absolute pointer-events-none"
                  style={{
                    transform: `translate(${discardedCard.finalPosition.x}px, ${discardedCard.finalPosition.y}px) rotate(${discardedCard.finalPosition.rotation}deg)`,
                    zIndex: discardedCard.discardIndex + 20, // Above void card
                    opacity: 0.75 + discardedCard.discardIndex * 0.02,
                  }}
                >
                  <Card
                    card={discardedCard}
                    size="medium"
                    animate={false}
                    className="shadow-lg border border-white/10"
                  />
                </div>
              ))}

              {/* Current top card */}
              {currentTopCard && (
                <motion.div
                  key={`top-card-${currentTopCard.id}`}
                  className="absolute z-50 pointer-events-none"
                  ref={discardPileRef}
                  initial={() => {
                    if (gameState.discardCounter === 0) {
                      return { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 };
                    }

                    const playerPosition = getPlayerPosition(gameState.currentCardPlayedBy);

                    switch (playerPosition) {
                      case 'bottom':
                        return {
                          x: 0,
                          y: 200,
                          rotate: 0,
                          scale: 0.8,
                          opacity: 0.7,
                        };
                      case 'top':
                        return {
                          x: 0,
                          y: -200,
                          rotate: 180,
                          scale: 0.8,
                          opacity: 0.7,
                        };
                      case 'left':
                        return {
                          x: -300,
                          y: 0,
                          rotate: 90,
                          scale: 0.8,
                          opacity: 0.7,
                        };
                      case 'right':
                        return {
                          x: 300,
                          y: 0,
                          rotate: 270,
                          scale: 0.8,
                          opacity: 0.7,
                        };
                      default:
                        return { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 };
                    }
                  }}
                  animate={{
                    x: currentTopCard.finalPosition.x,
                    y: currentTopCard.finalPosition.y,
                    rotate: currentTopCard.finalPosition.rotation,
                    scale: 1,
                    opacity: 1,
                  }}
                  transition={{
                    duration:
                      gameState.discardCounter === 0
                        ? 0
                        : gameState.settings.animationDuration * 0.5,
                    type: 'spring',
                    stiffness: 100,
                    damping: 15,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Card
                    card={currentTopCard}
                    size="medium"
                    animate={false}
                    className="shadow-2xl border-2 border-white/30"
                  />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Direction indicator */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-0"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.15, scale: 28, y: 3 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <motion.span
          className="text-white font-bold"
          animate={{
            rotate: gameState.direction === 1 ? [0, 360] : [0, -360],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
          }}
        >
          {gameState.direction === 1 ? '↻' : '↺'}
        </motion.span>
      </motion.div>

      {/* Player Areas */}
      <AnimatePresence>
        {gameState.players.map((player, index) => {
          const playerTimer = gameState.playerTimers.find(
            (t) => t.playerId === player.id
          );

          return (
            <PlayerArea
              key={player.id}
              player={player}
              position={getPlayerPosition(index)}
              isActive={index === gameState.currentPlayerIndex}
              isHuman={index === gameState.humanPlayerIndex}
              canPlay={
                index === gameState.currentPlayerIndex &&
                !gameState.drawingAnimation?.isActive &&
                gameState.gamePhase === 'playing'
              }
              topCard={currentTopCard || gameState.allDiscardedCards[0]}
              onCardPlay={gameState.playCard}
              showBotCards={gameState.settings.realTimeSettings.showBotCards}
              drawingAnimation={gameState.drawingAnimation}
              playerIndex={index}
              timeRemaining={playerTimer?.timeRemaining || 0}
              totalTime={
                playerTimer?.totalTime || gameState.settings.playerTurnTimeLimit
              }
              timeBankRemaining={playerTimer?.timeBankRemaining}
              totalTimeBank={playerTimer?.totalTimeBank}
              timerMode={gameState.settings.gameMode.timerMode}
              voidActive={gameState.voidActive}
              voidSelectedColor={gameState.voidSelectedColor}
            />
          );
        })}
      </AnimatePresence>

      {/* Game Info - LEFT SIDE - Mobile responsive */}
      <motion.div
        className={`absolute top-4 left-4 flex flex-col gap-3 ${
          // Mobile: scale down UI elements
          window.innerWidth < 768 ? 'scale-75 origin-top-left' : ''
        }`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="bg-white/90 rounded-lg p-3 backdrop-blur-sm min-w-[200px]">
          <h2 className="font-bold text-lg text-gray-800 mb-2">BOLTIS Cards</h2>

          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-red-600" />
            <span className="font-bold text-gray-700">
              {formatTime(gameState.totalGameTime)}
            </span>
          </div>

          {gameState.matchDuration > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-gray-700">
                Match: {formatTime(gameState.matchTimeRemaining)}
              </span>
            </div>
          )}

          <p className="text-sm text-gray-600 mb-2">
            Current Turn:{' '}
            <motion.span
              className="font-semibold"
              key={currentPlayer?.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {currentPlayer?.name || 'Loading...'}
            </motion.span>
          </p>

          {/* ✅ VOID STATUS DISPLAY */}
          {gameState.voidActive && (
            <div className="text-xs text-purple-600 border-t pt-2">
              <div className="font-semibold">Void Active: {gameState.voidSelectedColor || 'Selecting...'}</div>
            </div>
          )}

          <div className="text-xs text-gray-500 border-t pt-2">
            <div>Mode: {gameState.settings.gameMode.mode}</div>
            <div>Timer: {gameState.settings.gameMode.timerMode}</div>
          </div>
        </div>

        {/* Draw Pile */}
        <motion.div
          className="bg-white/90 rounded-lg p-3 backdrop-blur-sm"
          initial={{ scale: 0, rotateY: -180 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ delay: 0.3, duration: 0.6, type: 'spring' }}
          ref={drawPileRef}
        >
          <motion.button
            onClick={() => {
              if (
                isHumanTurn &&
                !gameState.drawingAnimation?.isActive &&
                gameState.gamePhase === 'playing'
              ) {
                gameState.drawCard(0);
                controls.start({
                  scale: [1, 1.1, 1],
                  transition: { duration: 0.3 },
                });
              }
            }}
            disabled={
              !isHumanTurn ||
              gameState.drawingAnimation?.isActive ||
              gameState.gamePhase !== 'playing'
            }
            className={`
              relative mx-auto block ${
                isHumanTurn &&
                !gameState.drawingAnimation?.isActive &&
                gameState.gamePhase === 'playing'
                  ? 'cursor-pointer'
                  : 'cursor-not-allowed opacity-50'
              }
            `}
            whileHover={
              isHumanTurn &&
              !gameState.drawingAnimation?.isActive &&
              gameState.gamePhase === 'playing'
                ? {
                    scale: 1.05,
                    transition: { type: 'spring', stiffness: 400, damping: 10 },
                  }
                : undefined
            }
            whileTap={
              isHumanTurn &&
              !gameState.drawingAnimation?.isActive &&
              gameState.gamePhase === 'playing'
                ? {
                    scale: 0.95,
                    transition: { type: 'spring', stiffness: 500, damping: 15 },
                  }
                : undefined
            }
            animate={controls}
          >
            <div className="relative">
              {[
                ...Array(Math.min(5, Math.max(1, gameState.drawPile.length))),
              ].map((_, index) => (
                <div
                  key={`stack-${index}`}
                  className="absolute"
                  style={{
                    transform: `translate(${index * 1}px, ${-index * 1}px)`,
                    zIndex: 5 - index,
                    opacity: 0.7 + index * 0.1,
                  }}
                >
                  <Card
                    card={{
                      id: `stack-${index}`,
                      element: 'fire',
                      type: 'number',
                      value: 1,
                    }}
                    size="medium"
                    animate={false}
                    isCardBack={true}
                    className="shadow-md"
                  />
                </div>
              ))}

              <div className="relative z-10">
                <Card
                  card={{
                    id: 'draw-pile-top',
                    element: 'fire',
                    type: 'number',
                    value: 1,
                  }}
                  size="medium"
                  animate={false}
                  isCardBack={true}
                  className="shadow-lg"
                />
              </div>
            </div>

            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-gray-700 text-lg font-bold bg-gray-200 px-3 py-1 rounded-full">
              {gameState.drawPile.length || '∞'}
            </div>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Controls - RIGHT SIDE - Mobile responsive */}
      <motion.div
        className={`absolute top-4 right-4 flex flex-col gap-2 ${
          // Mobile: scale down UI elements
          window.innerWidth < 768 ? 'scale-75 origin-top-right' : ''
        }`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={onBackToHome}
          className="bg-white/90 hover:bg-white rounded-lg p-3 transition-colors duration-200 flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Home className="w-5 h-5" />
          <span className="text-sm font-medium">Home</span>
        </motion.button>

        {/* ✅ BROWSER FULLSCREEN TOGGLE */}
        <motion.button
          onClick={toggleFullscreen}
          className="bg-white/90 hover:bg-white rounded-lg p-3 transition-colors duration-200 flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={isFullscreen ? 'Exit Fullscreen (ESC)' : 'Enter Fullscreen (F11)'}
        >
          {isFullscreen ? (
            <Minimize className="w-5 h-5" />
          ) : (
            <Maximize className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </span>
        </motion.button>

        {gameState.settings.gameMode.pauseEnabled && (
          <motion.button
            onClick={() => {
              if (gameState.isPaused) {
                gameState.resumeGame();
              } else {
                gameState.pauseGame();
              }
            }}
            className="bg-white/90 hover:bg-white rounded-lg p-3 transition-colors duration-200 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {gameState.isPaused ? (
              <Play className="w-5 h-5" />
            ) : (
              <Pause className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">
              {gameState.isPaused ? 'Resume' : 'Pause'}
            </span>
          </motion.button>
        )}

        <motion.button
          onClick={() => setShowSettings(true)}
          className="bg-white/90 hover:bg-white rounded-lg p-3 transition-colors duration-200 flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </motion.button>

        <motion.div
          className="bg-white/90 rounded-lg p-3"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <List className="w-4 h-4" />
            <span className="text-sm font-semibold">Card Stack</span>
          </div>

          <div className="flex gap-1 mb-2">
            <button
              onClick={() => setShowStackViewer(!showStackViewer)}
              className={`text-xs px-2 py-1 rounded ${
                showStackViewer ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              {showStackViewer ? 'Hide' : 'Show'}
            </button>

            {showStackViewer && (
              <>
                <button
                  onClick={() =>
                    setStackViewerSide(
                      stackViewerSide === 'left' ? 'right' : 'left'
                    )
                  }
                  className="text-xs px-2 py-1 rounded bg-gray-200 flex items-center gap-1"
                >
                  {stackViewerSide === 'left' ? (
                    <ChevronRight className="w-3 h-3" />
                  ) : (
                    <ChevronLeft className="w-3 h-3" />
                  )}
                </button>

                <button
                  onClick={() =>
                    setStackViewMode(stackViewMode === 'list' ? 'grid' : 'list')
                  }
                  className="text-xs px-2 py-1 rounded bg-gray-200"
                >
                  {stackViewMode === 'list' ? (
                    <Grid3X3 className="w-3 h-3" />
                  ) : (
                    <List className="w-3 h-3" />
                  )}
                </button>
              </>
            )}
          </div>

          <div className="text-xs text-gray-600">
            {gameState.allDiscardedCards.length} cards played
          </div>
        </motion.div>
      </motion.div>

      {/* ✅ PAUSE OVERLAY WITH LOWER Z-INDEX */}
      <AnimatePresence>
        {gameState.gamePhase === 'paused' && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-8 shadow-2xl text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <Pause className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Game Paused
              </h2>
              <p className="text-gray-600 mb-6">
                Click Resume to continue playing
              </p>
              <button
                onClick={gameState.resumeGame}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
              >
                <Play className="w-5 h-5" />
                Resume Game
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ SETTINGS MODAL WITH HIGHER Z-INDEX */}
      <SettingsModal
        isOpen={showSettings}
        onClose={handleSettingsClose}
        settings={gameState.settings}
        onUpdateSettings={gameState.updateSettings}
        players={gameState.players}
        onAddCardToPlayer={handleAddCardToPlayer}
        gamePhase={gameState.gamePhase}
      />

      {/* Card Stack Viewer */}
      <AnimatePresence>
        {showStackViewer && (
          <CardStackViewer
            cards={gameState.allDiscardedCards}
            side={stackViewerSide}
            viewMode={stackViewMode}
            onClose={() => setShowStackViewer(false)}
          />
        )}
      </AnimatePresence>

      {/* ✅ COLOR SELECTION WITH TIMER */}
      <AnimatePresence>
        {gameState.gamePhase === 'color-selection' &&
          gameState.currentPlayerIndex === gameState.humanPlayerIndex && (
            <ColorSelector 
              onColorSelect={gameState.selectColor}
              timeLimit={gameState.settings.colorSelectionTimeLimit}
            />
          )}
      </AnimatePresence>

      {/* Game End Modal */}
      <AnimatePresence>
        {gameState.gamePhase === 'ended' && gameState.rankings && (
          <GameEndModal
            rankings={gameState.rankings}
            winner={gameState.winner || ''}
            onPlayAgain={() => window.location.reload()}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ✅ COMPLETE VOID CARD ANIMATION SYSTEM COMPONENT
const VoidCardAnimationSystem: React.FC<{
  gameState: any;
  getPlayerTargetPosition: (playerIndex: number) => { x: number; y: number };
}> = ({ gameState, getPlayerTargetPosition }) => {
  
  return (
    <motion.div className="fixed inset-0 pointer-events-none z-[80]">
      {/* ✅ PHASE 1: VOID CARD FLYING TO DISCARD PILE */}
      {gameState.voidAnimationPhase === 'card_flying' && gameState.voidCard && (
        <motion.div
          className="absolute"
          initial={() => {
            const playerPos = getPlayerTargetPosition(gameState.currentCardPlayedBy);
            return {
              x: playerPos.x,
              y: playerPos.y,
              scale: 0.8,
              opacity: 0.9,
              rotate: 0,
            };
          }}
          animate={{
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            rotate: 0,
          }}
          transition={{
            duration: gameState.settings.voidCardFlySpeed * 1.0,
            type: 'spring',
            stiffness: 100,
            damping: 15,
          }}
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Card
            card={gameState.voidCard}
            size="medium"
            className="shadow-2xl border-2 border-purple-500 ring-4 ring-purple-500/30"
            animate={false}
          />
          
          {/* Void effect particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-purple-400 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: [0, Math.cos(i * 45 * Math.PI / 180) * 60],
                  y: [0, Math.sin(i * 45 * Math.PI / 180) * 60],
                  opacity: [1, 0.8, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 0.5
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* ✅ PHASE 2: COLOR TRANSFORMATION ANIMATION */}
      {gameState.voidAnimationPhase === 'color_changing' && gameState.voidCard && gameState.voidSelectedColor && (
        <motion.div
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Card flip animation */}
          <motion.div
            animate={{
              scaleX: [1, 0, 1],
              rotateY: [0, 180, 360],
            }}
            transition={{
              duration: gameState.settings.voidColorChangeSpeed * 1.0,
              times: [0, 0.5, 1],
              ease: 'easeInOut',
            }}
          >
            {/* Original void card (disappears during flip) */}
            <motion.div
              animate={{
                opacity: [1, 1, 0, 0, 1, 1],
              }}
              transition={{
                duration: gameState.settings.voidColorChangeSpeed * 1.0,
                times: [0, 0.4, 0.5, 0.5, 0.6, 1],
              }}
            >
              <Card
                card={gameState.voidCard}
                size="medium"
                className="shadow-2xl border-2 border-purple-500"
                animate={false}
              />
            </motion.div>

            {/* Transformed color card (appears during flip) */}
            <motion.div
              className="absolute top-0 left-0"
              animate={{
                opacity: [0, 0, 0, 0, 1, 1],
              }}
              transition={{
                duration: gameState.settings.voidColorChangeSpeed * 1.0,
                times: [0, 0.4, 0.5, 0.5, 0.6, 1],
              }}
            >
              <Card
                card={{
                  ...gameState.voidCard,
                  element: gameState.voidSelectedColor,
                  type: 'number',
                  value: 0 // Plain color card
                }}
                size="medium"
                className="shadow-2xl border-2 border-green-400 ring-4 ring-green-400/30"
                animate={false}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* ✅ PHASE 3: DISCARD PILE MOVEMENT ANIMATION */}
      {gameState.voidAnimationPhase === 'discard_moving' && (
        <motion.div
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Animate all discard pile cards moving to next player */}
          <motion.div
            className="relative"
            initial={{ scale: 1, opacity: 1 }}
            animate={() => {
              const nextPlayerIndex = (gameState.currentPlayerIndex + gameState.direction + 4) % 4;
              const targetPos = getPlayerTargetPosition(nextPlayerIndex);
              return {
                x: targetPos.x,
                y: targetPos.y,
                scale: 0.3,
                opacity: 0,
              };
            }}
            transition={{
              duration: gameState.settings.voidDiscardMoveSpeed * 2.0,
              ease: 'easeInOut',
            }}
          >
            {/* Stack of cards moving */}
            {gameState.allDiscardedCards.slice(0, Math.min(8, gameState.allDiscardedCards.length)).map((card, index) => (
              <motion.div
                key={`moving-${card.id}-${index}`}
                className="absolute"
                style={{
                  transform: `translate(${index * 2}px, ${-index * 2}px)`,
                  zIndex: 8 - index,
                }}
                animate={{
                  rotate: [0, 90 + index * 30, 180],
                  scale: [1, 0.9, 0.7]
                }}
                transition={{
                  duration: gameState.settings.voidDiscardMoveSpeed * 2.0,
                  delay: index * 0.05,
                  ease: 'easeInOut'
                }}
              >
                <Card
                  card={card}
                  size="medium"
                  animate={false}
                  className="shadow-lg"
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Trailing effect */}
          <motion.div
            className="absolute inset-0 bg-purple-400/20 rounded-lg blur-sm"
            animate={{
              scale: [1, 2, 4],
              opacity: [0.3, 0.1, 0]
            }}
            transition={{
              duration: gameState.settings.voidDiscardMoveSpeed * 1.5,
              ease: 'easeOut'
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

// Debug Log Component
const DebugLog: React.FC<{ 
  events: GameEvent[]; 
  onToggleVisibility: (visible: boolean) => void;
}> = ({ events, onToggleVisibility }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getEventIcon = (type: GameEvent['type']) => {
    switch (type) {
      case 'card_played': return '🃏';
      case 'card_drawn': return '📥';
      case 'penalty_applied': return '⚠️';
      case 'special_effect': return '✨';
      case 'turn_change': return '🔄';
      case 'game_start': return '🎮';
      case 'game_end': return '🏆';
      default: return '📝';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const recentEvents = events.slice(0, 3);

  return (
    <motion.div
      className={`fixed bottom-6 left-6 z-[60] max-w-sm ${
        // Mobile: scale down debug log
        window.innerWidth < 768 ? 'scale-75 origin-bottom-left' : ''
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1 }}
    >
      <motion.div
        className="bg-black/80 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden"
        animate={{ height: isExpanded ? 'auto' : 'auto' }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="p-3 flex items-center justify-between text-white bg-black/60"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-green-400" />
            <span className="font-medium text-sm">Debug Log</span>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
              {events.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Scroll className="w-4 h-4" />
              </motion.div>
            </motion.button>
            <motion.button
              onClick={() => onToggleVisibility(false)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <EyeOff className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>

        {!isExpanded && recentEvents.length > 0 && (
          <div className="p-2 space-y-1">
            {recentEvents.map((event, index) => (
              <motion.div
                key={event.id}
                className="p-2 bg-white/5 rounded text-white text-xs border-l-2 border-green-400/50"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-sm">{getEventIcon(event.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white/90 break-words">
                      {event.message}
                    </div>
                    <div className="text-white/50 text-xs mt-1">
                      {formatTime(event.timestamp)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="max-h-80 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {events.length === 0 ? (
                <div className="p-4 text-white/50 text-sm text-center">
                  No events yet...
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {events.map((event, index) => (
                    <motion.div
                      key={event.id}
                      className="p-2 bg-white/5 rounded text-white text-xs border-l-2 border-green-400/50"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-sm">{getEventIcon(event.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white/90 break-words">
                            {event.message}
                          </div>
                          <div className="text-white/50 text-xs mt-1">
                            {formatTime(event.timestamp)} • {event.playerName}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// In-Game Feedback Widget
const InGameFeedbackWidget: React.FC<{ showDebugLog: boolean }> = ({ showDebugLog }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim() || !email.trim()) return;

    setLoading(true);
    const { success: submitSuccess } = await FeedbackService.submitFeedback({
      type: 'general',
      subject: 'In-Game Feedback',
      message: `Email: ${email}\n\nFeedback: ${feedback}`,
    });

    if (submitSuccess) {
      setSuccess(true);
      setFeedback('');
      setEmail('');
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className={`fixed ${showDebugLog ? 'bottom-32' : 'bottom-6'} right-6 z-[60] transition-all duration-300 ${
      // Mobile: scale down feedback widget
      window.innerWidth < 768 ? 'scale-75 origin-bottom-right' : ''
    }`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="mb-4 bg-white rounded-2xl shadow-2xl p-6 w-80"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            {success ? (
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">Thank You!</h3>
                <p className="text-gray-600 text-sm">
                  Your feedback has been sent.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-800">Quick Feedback</h3>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email (required)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />

                <textarea
                  required
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your thoughts, report bugs, or suggest features..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                  minLength={10}
                  maxLength={500}
                />

                <button
                  type="submit"
                  disabled={loading || !feedback.trim() || !email.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Sending...' : 'Send Feedback'}</span>
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-4 rounded-full shadow-2xl transition-all duration-200"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={isOpen ? { rotate: 45 } : { rotate: 0 }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>
    </div>
  );
};

export default GameBoard;