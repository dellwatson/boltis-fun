import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { ElementType } from '../types/game';
import PlayerArea from './PlayerArea';
import GameEndModal from './GameEndModal';
import SettingsModal from './SettingsModal';

// Import new modular components
import DebugLog from './game/DebugLog';
import PauseOverlay from './game/PauseOverlay';
import DirectionIndicator from './game/DirectionIndicator';
import CenterArea from './game/CenterArea';
import DrawingAnimation from './game/DrawingAnimation';
import GameControls from './game/GameControls';

interface GameBoardProps {
  onBackToHome: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ onBackToHome }) => {
  const {
    players,
    currentPlayerIndex,
    direction,
    allDiscardedCards,
    drawPile,
    gamePhase,
    voidActive,
    voidSelectedColor,
    voidCard,
    voidAnimationPhase,
    winner,
    rankings,
    isPaused,
    playerTimers,
    settings,
    humanPlayerIndex,
    isProcessing,
    drawingAnimation,
    gameEvents,
    matchTimeRemaining,
    playCard,
    drawCard,
    selectColor,
    updateSettings,
    pauseGame,
    resumeGame,
    initializeGame
  } = useGameStore();

  const [showSettings, setShowSettings] = useState(false);
  const [showDebugLog, setShowDebugLog] = useState(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' && gamePhase === 'playing') {
        e.preventDefault();
        if (isPaused) {
          resumeGame();
        } else {
          pauseGame();
        }
      }
      if (e.key === 'Escape') {
        if (showSettings) {
          setShowSettings(false);
        } else if (isPaused) {
          resumeGame();
        }
      }
      if (e.key === 'd' && e.ctrlKey) {
        e.preventDefault();
        setShowDebugLog(!showDebugLog);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gamePhase, isPaused, showSettings, showDebugLog, pauseGame, resumeGame]);

  const handlePlayAgain = () => {
    initializeGame(settings.gameMode);
  };

  const handleDrawCard = () => {
    if (currentPlayerIndex === humanPlayerIndex && !isProcessing) {
      drawCard();
    }
  };

  const handleToggleBotCards = () => {
    updateSettings({
      realTimeSettings: {
        ...settings.realTimeSettings,
        showBotCards: !settings.realTimeSettings.showBotCards
      }
    });
  };

  const handleAddCardToPlayer = (playerIndex: number, card: any) => {
    // This would be implemented in the game engine
    console.log('Add card to player:', playerIndex, card);
  };

  const currentPlayer = players[currentPlayerIndex];
  const topCard = allDiscardedCards[allDiscardedCards.length - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-green-500 relative overflow-hidden">
      {/* Game Controls */}
      <GameControls
        isPaused={isPaused}
        showBotCards={settings.realTimeSettings.showBotCards}
        gamePhase={gamePhase}
        onPause={pauseGame}
        onResume={resumeGame}
        onSettings={() => setShowSettings(true)}
        onHome={onBackToHome}
        onToggleBotCards={handleToggleBotCards}
        matchTimeRemaining={matchTimeRemaining}
      />

      {/* Direction Indicator */}
      <DirectionIndicator
        direction={direction}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-20"
      />

      {/* Debug Log Toggle */}
      <motion.button
        onClick={() => setShowDebugLog(!showDebugLog)}
        className="fixed bottom-4 left-4 p-2 bg-black/50 text-white rounded-lg text-xs z-30"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {showDebugLog ? 'Hide' : 'Show'} Debug
      </motion.button>

      {/* Debug Log */}
      <DebugLog
        events={gameEvents}
        isVisible={showDebugLog}
        onToggle={() => setShowDebugLog(!showDebugLog)}
      />

      {/* Player Areas */}
      {players.map((player, index) => {
        const timer = playerTimers.find(t => t.playerId === player.id);
        const position = ['bottom', 'left', 'top', 'right'][
          (index - humanPlayerIndex + 4) % 4
        ] as 'bottom' | 'left' | 'top' | 'right';

        return (
          <PlayerArea
            key={player.id}
            player={player}
            position={position}
            isActive={currentPlayerIndex === index}
            isHuman={player.playerType === 'human'}
            canPlay={currentPlayerIndex === index && !isProcessing}
            topCard={topCard}
            onCardPlay={playCard}
            showBotCards={settings.realTimeSettings.showBotCards}
            drawingAnimation={drawingAnimation}
            playerIndex={index}
            timeRemaining={timer?.timeRemaining || 0}
            totalTime={timer?.totalTime || 0}
            timeBankRemaining={timer?.timeBankRemaining}
            totalTimeBank={timer?.totalTimeBank}
            timerMode={settings.gameMode.timerMode}
            voidActive={voidActive}
            voidSelectedColor={voidSelectedColor}
          />
        );
      })}

      {/* Center Play Area */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="pointer-events-auto">
          <CenterArea
            drawPile={drawPile}
            discardPile={allDiscardedCards}
            voidCard={voidCard}
            voidSelectedColor={voidSelectedColor}
            voidAnimationPhase={voidAnimationPhase}
            gamePhase={gamePhase}
            onDrawCard={handleDrawCard}
            onColorSelect={selectColor}
          />
        </div>
      </div>

      {/* Drawing Animation */}
      <DrawingAnimation
        animation={drawingAnimation}
        players={players}
        humanPlayerIndex={humanPlayerIndex}
      />

      {/* Pause Overlay */}
      <AnimatePresence>
        {isPaused && gamePhase === 'paused' && (
          <PauseOverlay
            onResume={resumeGame}
            onSettings={() => setShowSettings(true)}
            onHome={onBackToHome}
          />
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        players={players}
        onAddCardToPlayer={handleAddCardToPlayer}
        gamePhase={gamePhase}
      />

      {/* Game End Modal */}
      <AnimatePresence>
        {gamePhase === 'ended' && rankings && (
          <GameEndModal
            rankings={rankings}
            winner={winner || 'Game Over'}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameBoard;