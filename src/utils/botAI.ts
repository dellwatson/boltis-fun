import { Card, Player, GameState } from '../types/game';
import { canPlayCard, getElementalAdvantage } from './gameLogic';

export const getBotMove = (bot: Player, gameState: GameState): Card | null => {
  // ✅ FIXED: Check against void color or top card
  let playableCards: Card[] = [];
  
  if (gameState.voidActive && gameState.voidSelectedColor) {
    // Check against void selected color
    playableCards = bot.cards.filter(card => 
      card.element === gameState.voidSelectedColor || card.type === 'void'
    );
  } else {
    // Check against current top card
    const currentTopCard = gameState.allDiscardedCards[gameState.allDiscardedCards.length - 1];
    if (!currentTopCard) return null;
    playableCards = bot.cards.filter(card => canPlayCard(card, currentTopCard));
  }
  
  if (playableCards.length === 0) return null;
  
  switch (bot.difficulty) {
    case 'easy':
      return getRandomMove(playableCards);
    case 'medium':
      return getMediumMove(playableCards, gameState);
    case 'hard':
      return getHardMove(playableCards, gameState);
    default:
      return getRandomMove(playableCards);
  }
};

const getRandomMove = (playableCards: Card[]): Card => {
  return playableCards[Math.floor(Math.random() * playableCards.length)];
};

const getMediumMove = (playableCards: Card[], gameState: GameState): Card => {
  // Prioritize special cards
  const specialCards = playableCards.filter(card => card.type !== 'number');
  
  // Prioritize strike cards when opponent has few cards
  const nextPlayerIndex = (gameState.currentPlayerIndex + gameState.direction + 4) % 4;
  const nextPlayer = gameState.players[nextPlayerIndex];
  
  if (nextPlayer && nextPlayer.cards.length <= 3) {
    const strikeCards = specialCards.filter(card => card.type === 'strike');
    if (strikeCards.length > 0) {
      return strikeCards[Math.floor(Math.random() * strikeCards.length)];
    }
  }
  
  if (specialCards.length > 0) {
    return specialCards[Math.floor(Math.random() * specialCards.length)];
  }
  
  // Play highest number card
  const numberCards = playableCards.filter(card => card.type === 'number');
  if (numberCards.length > 0) {
    return numberCards.reduce((highest, card) => 
      (card.value || 0) > (highest.value || 0) ? card : highest
    );
  }
  
  return playableCards[0];
};

const getHardMove = (playableCards: Card[], gameState: GameState): Card => {
  const nextPlayerIndex = (gameState.currentPlayerIndex + gameState.direction + 4) % 4;
  const nextPlayer = gameState.players[nextPlayerIndex];
  
  // If next player has few cards, prioritize disruptive cards
  if (nextPlayer && nextPlayer.cards.length <= 3) {
    // First priority: Strike cards
    const strikeCards = playableCards.filter(card => card.type === 'strike');
    if (strikeCards.length > 0) {
      return strikeCards[0];
    }
    
    // Second priority: Skip or Reverse
    const disruptiveCards = playableCards.filter(card => 
      card.type === 'skip' || card.type === 'reverse'
    );
    if (disruptiveCards.length > 0) {
      return disruptiveCards[0];
    }
  }
  
  // Check if stack card would be effective
  const backgroundCards = gameState.allDiscardedCards.slice(0, -1);
  
  if (backgroundCards.length > 5) {
    const stackCards = playableCards.filter(card => card.type === 'stack');
    if (stackCards.length > 0) {
      return stackCards.reduce((best, card) => {
        const removed = backgroundCards.filter(discardCard => 
          getElementalAdvantage(card.element, discardCard.element) === 'win'
        ).length;
        const bestRemoved = backgroundCards.filter(discardCard => 
          getElementalAdvantage(best.element, discardCard.element) === 'win'
        ).length;
        return removed > bestRemoved ? card : best;
      });
    }
  }
  
  // Use void card when we have many cards
  if (playableCards.some(card => card.type === 'void') && gameState.players[gameState.currentPlayerIndex].cards.length > 8) {
    return playableCards.find(card => card.type === 'void')!;
  }
  
  // Default to medium strategy
  return getMediumMove(playableCards, gameState);
};