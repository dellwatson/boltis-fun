import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { GameState, ElementType, GameSettings, GameModeConfig } from '../types/game';
import { GameEngine } from '../services/GameEngine';
import { MatchService } from '../services/MatchService';
import { getBotMove } from '../utils/botAI';
import { usePlayerStore, calculateXPGain } from './playerStore';

interface GameStore extends GameState {
  // Game engine
  gameEngine: GameEngine | null;
  
  // Match tracking
  currentMatchId: string | null;
  
  // Actions
  initializeGame: (gameMode?: GameModeConfig, userId?: string) => void;
  playCard: (cardId: string) => void;
  drawCard: (playerIndex?: number) => void;
  selectColor: (element: ElementType) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  
  // Internal
  setGameState: (state: GameState) => void;
  destroy: () => void;
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => {
    let gameEngine: GameEngine | null = null;

    const store: GameStore = {
      // Initial state - will be overridden by game engine
      gameId: '',
      players: [],
      currentPlayerIndex: 0,
      direction: 1,
      allDiscardedCards: [],
      drawPile: [],
      gamePhase: 'setup',
      skipNext: false,
      voidActive: false,
      pendingColorSelection: false,
      gameStartTime: Date.now(),
      totalGameTime: 180,
      matchDuration: 0,
      matchTimeRemaining: 0,
      isPaused: false,
      playerTimers: [],
      settings: {
        playerTurnTimeLimit: 5,
        timeoutPenaltyCards: 2,
        botMinDecisionTime: 0.5,
        botMaxDecisionTime: 2.0,
        animationDuration: 1.5,
        showBotCards: false,
        voidCardFlySpeed: 1.0,
        voidDiscardMoveSpeed: 1.0,
        voidColorChangeSpeed: 1.0,
        colorSelectionTimeLimit: 3,
        gameMode: {
          mode: 'classic',
          timerMode: 'turn-based',
          matchDuration: 0,
          playerTimeBank: 90,
          eliminationRules: false,
          pauseEnabled: true,
          stackMode: 'destroy-same',
          includeBombCards: false,
          maxPlayers: 4
        },
        realTimeSettings: {
          showBotCards: false,
          animationSpeed: 1.0,
          soundEnabled: true
        }
      },
      discardCounter: 0,
      currentCardPlayedBy: 0,
      humanPlayerIndex: 0,
      isProcessing: false,
      drawingAnimation: null,
      eliminatedPlayers: [],
      events: [],
      gameEvents: [],
      voidCard: null,
      voidSelectedColor: null,
      voidAnimationPhase: null,
      gameEngine: null,
      currentMatchId: null,

      // Actions
      initializeGame: async (gameMode?: GameModeConfig, userId?: string) => {
        if (gameEngine) {
          gameEngine.destroy();
        }
        
        gameEngine = new GameEngine((state: GameState) => {
          set({ ...state, gameEngine });
        });
        
        gameEngine.initializeGame(gameMode);
        
        // Try to create match record in database (works for both authenticated and guest users)
        try {
          const currentState = get();
          const { guestPlayer } = usePlayerStore.getState();
          
          const { matchId, error } = await MatchService.createMatch(
            currentState, 
            userId, // authenticated user ID (if any)
            guestPlayer // guest player data (if any)
          );
          
          if (matchId && !error) {
            set({ currentMatchId: matchId });
            console.log('✅ Match created in database:', matchId);
          } else {
            console.log('⚠️ Playing offline - database not available');
            set({ currentMatchId: null });
          }
        } catch (error) {
          console.log('⚠️ Playing offline - database error:', error);
          set({ currentMatchId: null });
        }
      },

      playCard: (cardId: string) => {
        if (gameEngine) {
          gameEngine.playCard(cardId);
        }
      },

      drawCard: (playerIndex?: number) => {
        if (gameEngine) {
          gameEngine.drawCard(playerIndex);
        }
      },

      selectColor: (element: ElementType) => {
        if (gameEngine) {
          gameEngine.selectColor(element);
        }
      },

      updateSettings: (newSettings: Partial<GameSettings>) => {
        if (gameEngine) {
          gameEngine.updateSettings(newSettings);
        }
      },

      pauseGame: () => {
        if (gameEngine) {
          gameEngine.pauseGame();
        }
      },

      resumeGame: () => {
        if (gameEngine) {
          gameEngine.resumeGame();
        }
      },

      setGameState: (state: GameState) => {
        set(state);
      },

      destroy: () => {
        if (gameEngine) {
          gameEngine.destroy();
          gameEngine = null;
        }
      }
    };

    return store;
  })
);

// Bot AI subscription - handles bot moves
useGameStore.subscribe(
  (state) => ({
    currentPlayerIndex: state.currentPlayerIndex,
    gamePhase: state.gamePhase,
    isProcessing: state.isProcessing,
    players: state.players,
    isPaused: state.isPaused,
  }),
  ({ currentPlayerIndex, gamePhase, isProcessing, players, isPaused }) => {
    if (gamePhase !== 'playing' || isProcessing || isPaused) return;

    const currentPlayer = players[currentPlayerIndex];
    if (!currentPlayer || currentPlayer.playerType !== 'bot' || currentPlayer.isEliminated) return;

    const { settings } = useGameStore.getState();
    const randomDelay = (
      settings.botMinDecisionTime +
      Math.random() * (settings.botMaxDecisionTime - settings.botMinDecisionTime)
    ) * 1000;

    setTimeout(() => {
      const state = useGameStore.getState();
      if (state.gamePhase !== 'playing' || state.isProcessing || state.isPaused) return;
      
      const botMove = getBotMove(currentPlayer, state);

      if (botMove) {
        console.log(`🤖 ${currentPlayer.name} plays: ${
          botMove.type === 'number'
            ? `${botMove.value}${botMove.element}`
            : `${botMove.type}-${botMove.element}`
        }`);
        state.playCard(botMove.id);
      } else {
        console.log(`🤖 ${currentPlayer.name} draws a card`);
        state.drawCard(currentPlayerIndex);
      }
    }, randomDelay);
  }
);

// Bot color selection subscription
useGameStore.subscribe(
  (state) => ({
    gamePhase: state.gamePhase,
    currentPlayerIndex: state.currentPlayerIndex,
    players: state.players,
    isProcessing: state.isProcessing,
    isPaused: state.isPaused,
  }),
  ({ gamePhase, currentPlayerIndex, players, isProcessing, isPaused }) => {
    if (gamePhase !== 'color-selection' || isProcessing || isPaused) return;

    const currentPlayer = players[currentPlayerIndex];
    if (!currentPlayer || currentPlayer.playerType !== 'bot' || currentPlayer.isEliminated) return;

    setTimeout(() => {
      const elementCounts = { fire: 0, water: 0, plant: 0, thunder: 0 };
      currentPlayer.cards.forEach((card) => {
        elementCounts[card.element]++;
      });

      const mostCommonElement = Object.entries(elementCounts).reduce((a, b) =>
        elementCounts[a[0] as keyof typeof elementCounts] >
        elementCounts[b[0] as keyof typeof elementCounts]
          ? a
          : b
      )[0] as ElementType;

      console.log(`🤖 ${currentPlayer.name} selects color: ${mostCommonElement}`);
      useGameStore.getState().selectColor(mostCommonElement);
    }, 500);
  }
);

// Game end subscription - save match results and update XP
useGameStore.subscribe(
  (state) => ({
    gamePhase: state.gamePhase,
    winner: state.winner,
    rankings: state.rankings,
    currentMatchId: state.currentMatchId,
    players: state.players,
    gameStartTime: state.gameStartTime,
  }),
  async ({ gamePhase, winner, rankings, currentMatchId, players, gameStartTime }) => {
    if (gamePhase === 'ended' && rankings) {
      const matchDuration = Math.floor((Date.now() - gameStartTime) / 1000);
      const humanPlayer = players.find(p => p.playerType === 'human');
      
      if (humanPlayer) {
        const humanRanking = rankings.find(r => r.player.id === humanPlayer.id);
        const won = humanRanking?.rank === 1;
        const opponentCount = players.length - 1;
        
        // Calculate XP gain
        const xpGained = calculateXPGain(won, matchDuration, opponentCount);
        
        // Update guest player stats
        const { updateGuestStats, guestPlayer } = usePlayerStore.getState();
        updateGuestStats(won, xpGained);
        
        console.log(`🎮 Match ended: ${won ? 'Won' : 'Lost'} | XP gained: ${xpGained}`);

        // Only try to save if we have a match ID (database is available)
        if (currentMatchId) {
          try {
            // Find winner ID for database (could be authenticated user or guest)
            let winnerId = null;
            if (humanRanking?.rank === 1) {
              // Winner is human player - use their ID (authenticated or guest)
              winnerId = humanPlayer.id === 'human' ? guestPlayer?.id : humanPlayer.id;
            }

            // Save match results (works for both authenticated and guest users)
            const { success, error } = await MatchService.completeMatch(
              currentMatchId,
              useGameStore.getState(),
              winnerId,
              guestPlayer // Pass guest player data for stats update
            );

            if (error) {
              console.error('Failed to save match results:', error);
            } else {
              console.log('✅ Match results saved successfully');
            }
          } catch (error) {
            console.error('Error saving match results:', error);
          }
        } else {
          console.log('🎮 Game completed offline - results not saved to database');
        }
      }
    }
  }
);