import { 
  Card, 
  ElementType, 
  GameState, 
  Player, 
  DiscardedCard, 
  StackMode,
  GameEvent
} from '../types/game';

export const getElementalAdvantage = (attacker: ElementType, defender: ElementType): 'win' | 'lose' | 'neutral' => {
  const advantages = {
    fire: ['plant'],
    water: ['fire'], 
    plant: ['water'],
    thunder: ['plant']
  };
  
  if (advantages[attacker].includes(defender)) return 'win';
  if (advantages[defender].includes(attacker)) return 'lose';
  return 'neutral';
};

export const getPlayerPositionFromPOV = (playerIndex: number, humanPlayerIndex: number): 'bottom' | 'left' | 'top' | 'right' => {
  const positions: ('bottom' | 'left' | 'top' | 'right')[] = ['bottom', 'left', 'top', 'right'];
  const relativeIndex = (playerIndex - humanPlayerIndex + 4) % 4;
  return positions[relativeIndex];
};

export const calculateFinalCardPosition = (
  playedByPlayerIndex: number,
  humanPlayerIndex: number,
  cardId: string,
  discardIndex: number
): { x: number; y: number; rotation: number } => {
  const playerPosition = getPlayerPositionFromPOV(playedByPlayerIndex, humanPlayerIndex);
  
  const cardHash = cardId.split('').reduce((acc, char, index) => {
    return acc + char.charCodeAt(0) * (index + 1);
  }, 0);
  
  const combinedSeed = (cardHash + discardIndex * 31) % 10000;
  const normalizedSeed = combinedSeed / 10000;
  
  const baseX = ((discardIndex % 7) - 3) * 2.2 + (normalizedSeed - 0.5) * 6;
  const baseY = ((discardIndex % 5) - 2) * 1.5 + ((normalizedSeed * 1000) % 100 / 100 - 0.5) * 4;
  
  let rotation: number;
  
  switch (playerPosition) {
    case 'bottom':
      rotation = -5 + normalizedSeed * 45;
      rotation = Math.max(-5, Math.min(40, rotation));
      break;
    case 'top':
      rotation = 135 + normalizedSeed * 45;
      rotation = Math.max(135, Math.min(180, rotation));
      break;
    case 'left':
      rotation = 45 + normalizedSeed * 45;
      rotation = Math.max(45, Math.min(90, rotation));
      break;
    case 'right':
      rotation = 225 + normalizedSeed * 45;
      rotation = Math.max(225, Math.min(270, rotation));
      break;
    default:
      rotation = 0;
  }
  
  return { 
    x: baseX, 
    y: baseY, 
    rotation 
  };
};

export const createDiscardedCard = (
  card: Card, 
  playedByPlayerIndex: number, 
  discardIndex: number,
  humanPlayerIndex: number
): DiscardedCard => {
  const finalPosition = calculateFinalCardPosition(
    playedByPlayerIndex,
    humanPlayerIndex,
    card.id,
    discardIndex
  );
  
  return {
    ...card,
    playedByPlayerIndex,
    discardIndex,
    discardedAt: Date.now(),
    finalPosition
  };
};

export const createGameEvent = (
  type: GameEvent['type'],
  playerId: string,
  playerName: string,
  message: string,
  details?: any
): GameEvent => {
  return {
    id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    playerId,
    playerName,
    message,
    details,
    timestamp: Date.now()
  };
};

// ✅ FIXED: Infinite draw pile - reshuffle when empty
export const createDeck = (includeBombCards: boolean = false): Card[] => {
  const elements: ElementType[] = ['fire', 'water', 'plant', 'thunder'];
  const cards: Card[] = [];
  
  elements.forEach(element => {
    for (let value = 1; value <= 9; value++) {
      for (let i = 0; i < 2; i++) {
        cards.push({
          id: `${element}-${value}-${i}`,
          element,
          type: 'number',
          value
        });
      }
    }
    
    // Special cards: Skip, Reverse, Stack
    ['skip', 'reverse', 'stack'].forEach(type => {
      for (let i = 0; i < 2; i++) {
        cards.push({
          id: `${element}-${type}-${i}`,
          element,
          type: type as any
        });
      }
    });

    // Add Strike cards (2 per element)
    for (let i = 0; i < 2; i++) {
      cards.push({
        id: `${element}-strike-${i}`,
        element,
        type: 'strike'
      });
    }

    if (includeBombCards) {
      cards.push({
        id: `${element}-bomb-0`,
        element,
        type: 'bomb'
      });
    }
  });
  
  // Add Void cards (4 total)
  for (let i = 0; i < 4; i++) {
    cards.push({
      id: `void-${i}`,
      element: 'fire',
      type: 'void'
    });
  }
  
  return shuffleDeck(cards);
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const canPlayCard = (card: Card, topCard: Card, voidActive?: boolean, voidSelectedColor?: ElementType): boolean => {
  if (card.type === 'void') return true;
  
  if (voidActive && voidSelectedColor) {
    return card.element === voidSelectedColor;
  }
  
  if (card.element === topCard.element) return true;
  if (card.type === topCard.type && card.type !== 'number') return true;
  if (card.type === 'number' && topCard.type === 'number' && card.value === topCard.value) return true;
  
  // Special case for Strike cards - can be played on another Strike regardless of element
  if (card.type === 'strike' && topCard.type === 'strike') return true;
  
  return false;
};

export const dealCards = (deck: Card[], numPlayers: number, cardsPerPlayer: number): { playerHands: Card[][], remainingDeck: Card[] } => {
  const playerHands: Card[][] = Array(numPlayers).fill(null).map(() => []);
  let deckIndex = 0;
  
  for (let i = 0; i < cardsPerPlayer; i++) {
    for (let player = 0; player < numPlayers; player++) {
      playerHands[player].push(deck[deckIndex++]);
    }
  }
  
  return {
    playerHands,
    remainingDeck: deck.slice(deckIndex)
  };
};

export const processStackCard = (
  stackCard: Card, 
  discardPile: DiscardedCard[], 
  currentPlayerCards: Card[],
  mode: StackMode
): { 
  remainingDiscardPile: DiscardedCard[], 
  playerCardsToDiscard: Card[] 
} => {
  const playerCardsToDiscard: Card[] = [];
  
  currentPlayerCards.forEach(card => {
    if (card.element === stackCard.element && card.id !== stackCard.id) {
      playerCardsToDiscard.push(card);
    }
  });
  
  let remainingDiscardPile: DiscardedCard[] = [];
  
  if (mode === 'destroy-weak') {
    remainingDiscardPile = discardPile.filter(card => {
      if (card.type === 'void') return true;
      
      if (card.element === stackCard.element) return false;
      
      const advantage = getElementalAdvantage(stackCard.element, card.element);
      if (advantage === 'win') return false;
      
      return true;
    });
  } else if (mode === 'destroy-same') {
    remainingDiscardPile = discardPile.filter(card => {
      if (card.type === 'void') return true;
      return card.element !== stackCard.element;
    });
  }
  
  return { remainingDiscardPile, playerCardsToDiscard };
};

export const getNextPlayerIndex = (currentIndex: number, direction: number, numPlayers: number): number => {
  const next = currentIndex + direction;
  if (next >= numPlayers) return 0;
  if (next < 0) return numPlayers - 1;
  return next;
};

export const formatCardForDisplay = (card: Card | DiscardedCard): string => {
  const elementShort = {
    fire: 'r',
    water: 'b', 
    plant: 'g',
    thunder: 'y'
  };
  
  if (card.type === 'void') return 'void';
  if (card.type === 'bomb') return `bomb${elementShort[card.element]}`;
  if (card.type === 'number') return `${card.value}${elementShort[card.element]}`;
  if (card.type === 'strike') return `strike${elementShort[card.element]}`;
  return `${card.type.charAt(0)}${elementShort[card.element]}`;
};

export const sortCards = (cards: Card[]): Card[] => {
  const elementOrder = { fire: 0, water: 1, plant: 2, thunder: 3 };
  
  return [...cards].sort((a, b) => {
    const elementDiff = elementOrder[a.element] - elementOrder[b.element];
    if (elementDiff !== 0) return elementDiff;
    
    if (a.type === 'number' && b.type !== 'number') return -1;
    if (a.type !== 'number' && b.type === 'number') return 1;
    
    if (a.type === 'number' && b.type === 'number') {
      return (a.value || 0) - (b.value || 0);
    }
    
    return a.type.localeCompare(b.type);
  });
};

export const calculateCardScore = (card: Card): number => {
  if (card.type === 'number') return card.value || 0;
  if (card.type === 'void') return 50;
  if (card.type === 'bomb') return 30;
  return 20;
};

export const calculatePlayerScore = (player: Player): number => {
  return player.cards.reduce((total, card) => total + calculateCardScore(card), 0);
};

export const getRankings = (players: Player[]): { player: Player; rank: number; score: number }[] => {
  const playersWithScores = players.map(player => ({
    player,
    score: calculatePlayerScore(player)
  }));
  
  playersWithScores.sort((a, b) => a.score - b.score);
  
  return playersWithScores.map((item, index) => ({
    ...item,
    rank: index + 1
  }));
};