// ✅ DEPRECATED - REPLACED BY ZUSTAND STORE
// This file is kept for reference but all functionality moved to src/store/gameStore.ts

import { useGameStore } from '../store/gameStore';

export const useGame = () => {
  const store = useGameStore();
  
  return {
    gameState: store,
    initializeGame: store.initializeGame,
    playCard: store.playCard,
    drawCard: () => store.drawCard(0), // Human player draw
    selectColor: store.selectColor,
    toggleBotCards: store.toggleBotCards,
    toggleStackMode: store.toggleStackMode,
    isProcessing: store.isProcessing,
    drawingAnimation: store.drawingAnimation,
    botSettings: store.botSettings,
    updateBotSettings: store.updateBotSettings
  };
};