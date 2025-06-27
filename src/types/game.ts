export type ElementType = 'fire' | 'water' | 'plant' | 'thunder';
export type CardType = 'number' | 'skip' | 'reverse' | 'stack' | 'void' | 'bomb' | 'strike' | 'mirror' | 'locked';
export type PlayerType = 'human' | 'bot' | 'network';
export type GamePhase = 'setup' | 'playing' | 'ended' | 'color-selection' | 'paused';
export type GameMode = 'classic' | 'time-bank' | 'blitz' | 'tournament';
export type TimerMode = 'turn-based' | 'time-bank';
export type StackMode = 'destroy-weak' | 'destroy-same';

export interface Card {
  id: string;
  element: ElementType;
  type: CardType;
  value?: number; // For number cards (1-9)
}

export interface DiscardedCard extends Card {
  playedByPlayerIndex: number;
  discardIndex: number;
  discardedAt: number;
  finalPosition: {
    x: number;
    y: number;
    rotation: number;
  };
}

export interface Player {
  id: string;
  name: string;
  cards: Card[];
  playerType: PlayerType;
  difficulty?: 'easy' | 'medium' | 'hard';
  score?: number;
  isConnected?: boolean;
  connectionId?: string;
  latency?: number;
  totalTimeBank?: number;
  remainingTimeBank?: number;
  isEliminated?: boolean;
}

export interface PlayerTimer {
  playerId: string;
  timeRemaining: number;
  totalTime: number;
  isActive: boolean;
  startTime: number;
  timeBankRemaining?: number;
  totalTimeBank?: number;
}

export interface GameModeConfig {
  mode: GameMode;
  timerMode: TimerMode;
  matchDuration?: number; // in seconds, 0 = infinite
  playerTimeBank?: number; // in seconds for time-bank mode
  eliminationRules: boolean;
  pauseEnabled: boolean;
  stackMode: StackMode;
  includeBombCards: boolean;
  maxPlayers: number;
}

export interface GameSettings {
  playerTurnTimeLimit: number;
  timeoutPenaltyCards: number;
  botMinDecisionTime: number;
  botMaxDecisionTime: number;
  animationDuration: number;
  showBotCards: boolean;
  
  // ✅ NEW: All void animation settings
  voidCardFlySpeed: number; // Speed of void card flying to discard pile
  voidDiscardMoveSpeed: number; // Speed of discard pile moving to player
  voidColorChangeSpeed: number; // Speed of void card color transformation
  colorSelectionTimeLimit: number; // Time limit for color selection (seconds)
  
  gameMode: GameModeConfig;
  realTimeSettings: {
    showBotCards: boolean;
    animationSpeed: number;
    soundEnabled: boolean;
  };
}

export interface GameEvent {
  id: string;
  type: 'card_played' | 'card_drawn' | 'penalty_applied' | 'special_effect' | 'turn_change' | 'game_start' | 'game_end';
  playerId: string;
  playerName: string;
  message: string;
  details?: any;
  timestamp: number;
}

export interface GameState {
  gameId: string;
  players: Player[];
  currentPlayerIndex: number;
  direction: 1 | -1;
  allDiscardedCards: DiscardedCard[];
  drawPile: Card[];
  gamePhase: GamePhase;
  skipNext: boolean;
  voidActive: boolean;
  pendingColorSelection: boolean;
  gameStartTime: number;
  totalGameTime: number;
  matchDuration: number;
  matchTimeRemaining: number;
  isPaused: boolean;
  playerTimers: PlayerTimer[];
  settings: GameSettings;
  winner?: string;
  rankings?: { player: Player; rank: number; score: number }[];
  eliminatedPlayers?: string[];
  discardCounter: number;
  currentCardPlayedBy: number;
  humanPlayerIndex: number;
  isProcessing: boolean;
  drawingAnimation: {
    playerIndex: number;
    cardId: string;
    isActive?: boolean;
    phase?: 'flying' | 'revealing' | 'sorting';
    drawnCard?: Card;
  } | null;
  gameEvents: GameEvent[];
  events: GameEvent[];
  
  // ✅ VOID CARD STATE
  voidCard: Card | null; // Visible void card (not in discard array)
  voidSelectedColor: ElementType | null; // Selected color for playability
  
  // ✅ VOID ANIMATION PHASES
  voidAnimationPhase: 'none' | 'card_flying' | 'color_selecting' | 'color_changing' | 'discard_moving' | null;
}

export const ELEMENT_COLORS = {
  fire: '#EF4444',
  water: '#3B82F6', 
  plant: '#10B981',
  thunder: '#EAB308'
} as const;

export const ELEMENT_NAMES = {
  fire: 'Fire',
  water: 'Water',
  plant: 'Plant', 
  thunder: 'Thunder'
} as const;

export const DEFAULT_GAME_MODE_CONFIG: GameModeConfig = {
  mode: 'classic',
  timerMode: 'turn-based',
  matchDuration: 180,
  playerTimeBank: 90,
  eliminationRules: false,
  pauseEnabled: true,
  stackMode: 'destroy-same',
  includeBombCards: false,
  maxPlayers: 4
};

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  playerTurnTimeLimit: 5,
  timeoutPenaltyCards: 2,
  botMinDecisionTime: 0.5,
  botMaxDecisionTime: 2.0,
  animationDuration: 1.5,
  showBotCards: false,
  
  // ✅ NEW: Default void animation settings
  voidCardFlySpeed: 1.0, // 1x speed for void card flying
  voidDiscardMoveSpeed: 1.0, // 1x speed for discard pile movement
  voidColorChangeSpeed: 1.0, // 1x speed for color transformation
  colorSelectionTimeLimit: 3, // 3 seconds for color selection
  
  gameMode: { ...DEFAULT_GAME_MODE_CONFIG },
  realTimeSettings: {
    showBotCards: false,
    animationSpeed: 1.0,
    soundEnabled: true
  }
};