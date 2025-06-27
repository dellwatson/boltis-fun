import { 
  GameState, 
  Player, 
  Card, 
  ElementType, 
  GameSettings,
  PlayerTimer,
  DEFAULT_GAME_SETTINGS,
  GameModeConfig,
  DEFAULT_GAME_MODE_CONFIG,
  GameEvent
} from '../types/game';
import { 
  createDeck, 
  dealCards, 
  canPlayCard, 
  processStackCard,
  getNextPlayerIndex,
  sortCards,
  getRankings,
  createDiscardedCard,
  createGameEvent,
  shuffleDeck
} from '../utils/gameLogic';
import { timerService } from './TimerService';

export class GameEngine {
  private state: GameState;
  private onStateChange: (state: GameState) => void;
  private matchTimer: NodeJS.Timeout | null = null;
  private colorSelectionTimer: NodeJS.Timeout | null = null;
  private strikeActive: boolean = false;
  private strikeCounter: number = 0;

  constructor(onStateChange: (state: GameState) => void) {
    this.onStateChange = onStateChange;
    this.state = this.createInitialState();
  }

  private createInitialState(): GameState {
    return {
      gameId: `game-${Date.now()}`,
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
      settings: { ...DEFAULT_GAME_SETTINGS },
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
      voidAnimationPhase: null
    };
  }

  private addGameEvent(
    type: GameEvent['type'],
    playerId: string,
    playerName: string,
    message: string,
    details?: any
  ): void {
    const event = createGameEvent(type, playerId, playerName, message, details);
    this.state.gameEvents.unshift(event);
    
    if (this.state.gameEvents.length > 50) {
      this.state.gameEvents = this.state.gameEvents.slice(0, 50);
    }
  }

  // ✅ FIXED: Infinite draw pile - reshuffle when empty
  private reshuffleDrawPile(): void {
    if (this.state.drawPile.length > 0) return;
    
    console.log('🔄 Draw pile empty - reshuffling deck');
    
    const newDeck = createDeck(this.state.settings.gameMode.includeBombCards);
    this.state.drawPile = newDeck;
    
    this.addGameEvent(
      'special_effect',
      'system',
      'System',
      'Draw pile reshuffled - infinite cards available',
      { newDeckSize: newDeck.length }
    );
  }

  initializeGame(gameMode?: GameModeConfig): void {
    console.log('🎮 Initializing new game with mode:', gameMode);
    
    const config = gameMode || DEFAULT_GAME_MODE_CONFIG;
    const deck = createDeck(config.includeBombCards);
    const { playerHands, remainingDeck } = dealCards(deck, config.maxPlayers, 7);

    const players: Player[] = [];
    
    players.push({
      id: 'human',
      name: 'You',
      cards: sortCards(playerHands[0]),
      playerType: 'human',
      totalTimeBank: config.timerMode === 'time-bank' ? config.playerTimeBank : undefined,
      remainingTimeBank: config.timerMode === 'time-bank' ? config.playerTimeBank : undefined,
      isEliminated: false
    });

    const botNames = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Echo', 'Foxtrot', 'Golf'];
    const difficulties: ('easy' | 'medium' | 'hard')[] = ['medium', 'hard', 'easy', 'medium', 'hard', 'easy', 'medium'];
    
    for (let i = 1; i < config.maxPlayers; i++) {
      players.push({
        id: `bot${i}`,
        name: `Bot ${botNames[i - 1]}`,
        cards: sortCards(playerHands[i]),
        playerType: 'bot',
        difficulty: difficulties[i - 1],
        totalTimeBank: config.timerMode === 'time-bank' ? config.playerTimeBank : undefined,
        remainingTimeBank: config.timerMode === 'time-bank' ? config.playerTimeBank : undefined,
        isEliminated: false
      });
    }

    let topCardIndex = 0;
    while (
      remainingDeck[topCardIndex].type !== 'number' &&
      topCardIndex < remainingDeck.length - 1
    ) {
      topCardIndex++;
    }

    const topCard = remainingDeck[topCardIndex];
    const drawPile = [
      ...remainingDeck.slice(0, topCardIndex),
      ...remainingDeck.slice(topCardIndex + 1)
    ];

    const randomStartingPlayer = Math.floor(Math.random() * config.maxPlayers);

    const playerTimers: PlayerTimer[] = players.map((player, index) => ({
      playerId: player.id,
      timeRemaining: index === randomStartingPlayer ? 
        (config.timerMode === 'turn-based' ? this.state.settings.playerTurnTimeLimit : 0) : 0,
      totalTime: config.timerMode === 'turn-based' ? this.state.settings.playerTurnTimeLimit : 0,
      isActive: index === randomStartingPlayer,
      startTime: index === randomStartingPlayer ? Date.now() : 0,
      timeBankRemaining: player.remainingTimeBank,
      totalTimeBank: player.totalTimeBank
    }));

    const updatedSettings: GameSettings = {
      ...this.state.settings,
      gameMode: config
    };

    const firstDiscardedCard = createDiscardedCard(
      topCard,
      -1,
      0,
      0
    );

    this.state = {
      ...this.state,
      players,
      currentPlayerIndex: randomStartingPlayer,
      direction: 1,
      allDiscardedCards: [firstDiscardedCard],
      drawPile,
      gamePhase: 'playing',
      playerTimers,
      gameStartTime: Date.now(),
      humanPlayerIndex: 0,
      settings: updatedSettings,
      matchDuration: config.matchDuration || 0,
      matchTimeRemaining: config.matchDuration || 0,
      isPaused: false,
      gameEvents: [],
      voidCard: null,
      voidSelectedColor: null,
      voidAnimationPhase: null
    };

    this.addGameEvent(
      'game_start',
      'system',
      'System',
      `Game started! ${players[randomStartingPlayer].name} goes first`,
      { startingPlayer: randomStartingPlayer, gameMode: config.mode }
    );

    this.startPlayerTimer(randomStartingPlayer);
    if (config.matchDuration && config.matchDuration > 0) {
      this.startMatchTimer();
    }

    this.notifyStateChange();
    console.log(`🎮 Game started! ${players[randomStartingPlayer].name} goes first`);
  }

  // ✅ NEW: Add card to player function for admin features
  addCardToPlayer(playerIndex: number, card: Card): void {
    if (playerIndex < 0 || playerIndex >= this.state.players.length) {
      console.error('Invalid player index:', playerIndex);
      return;
    }

    const player = this.state.players[playerIndex];
    console.log(`🎯 Admin: Adding ${card.type === 'number' ? `${card.value}${card.element}` : `${card.type}-${card.element}`} to ${player.name}`);

    // Use the same animation system as drawing cards
    this.state.isProcessing = true;
    this.state.drawingAnimation = {
      playerIndex,
      cardId: card.id,
      isActive: true,
      phase: 'flying',
      drawnCard: card
    };

    this.addGameEvent(
      'card_drawn',
      player.id,
      player.name,
      `Admin added ${card.type === 'number' ? `${card.value}${card.element}` : `${card.type}-${card.element}`} to ${player.name}`,
      { adminAction: true, cardType: card.type, element: card.element }
    );

    this.notifyStateChange();

    // Animation timeline
    setTimeout(() => {
      if (playerIndex === 0) {
        this.state.drawingAnimation = {
          playerIndex,
          cardId: card.id,
          isActive: true,
          phase: 'revealing',
          drawnCard: card
        };
        this.notifyStateChange();
      }
    }, this.state.settings.animationDuration * 700);

    setTimeout(() => {
      if (playerIndex === 0) {
        this.state.drawingAnimation = {
          playerIndex,
          cardId: card.id,
          isActive: true,
          phase: 'sorting',
          drawnCard: card
        };
        this.notifyStateChange();
      }
    }, this.state.settings.animationDuration * 1100);

    setTimeout(() => {
      // Add card to player's hand
      this.state.players[playerIndex].cards = sortCards([
        ...this.state.players[playerIndex].cards,
        card
      ]);
      
      this.state.drawingAnimation = null;
      this.state.isProcessing = false;
      this.notifyStateChange();
    }, this.state.settings.animationDuration * 1500);
  }

  private startMatchTimer(): void {
    if (this.matchTimer) {
      clearInterval(this.matchTimer);
    }

    this.matchTimer = setInterval(() => {
      if (this.state.isPaused) return;

      this.state.matchTimeRemaining--;
      
      if (this.state.matchTimeRemaining <= 0) {
        this.endGameByTime();
        return;
      }

      this.notifyStateChange();
    }, 1000);
  }

  private endGameByTime(): void {
    console.log('⏰ Match time expired!');
    const rankings = getRankings(this.state.players.filter(p => !p.isEliminated));
    this.endGame(`Time's up! ${rankings[0].player.name} wins with the lowest score!`);
  }

  pauseGame(): void {
    if (!this.state.settings.gameMode.pauseEnabled) return;
    
    this.state.isPaused = true;
    this.state.gamePhase = 'paused';
    timerService.pauseAllTimers();
    
    if (this.matchTimer) {
      clearInterval(this.matchTimer);
    }
    
    if (this.colorSelectionTimer) {
      clearTimeout(this.colorSelectionTimer);
    }
    
    this.notifyStateChange();
    console.log('⏸️ Game paused');
  }

  resumeGame(): void {
    if (!this.state.isPaused) return;
    
    this.state.isPaused = false;
    this.state.gamePhase = this.state.voidActive ? 'color-selection' : 'playing';
    
    const currentPlayer = this.state.players[this.state.currentPlayerIndex];
    const timer = this.state.playerTimers.find(t => t.playerId === currentPlayer.id);
    
    if (timer && timer.timeRemaining > 0 && !this.state.voidActive) {
      this.startPlayerTimer(this.state.currentPlayerIndex);
    }
    
    if (this.state.matchDuration > 0) {
      this.startMatchTimer();
    }
    
    if (this.state.voidActive) {
      this.startColorSelectionTimer();
    }
    
    this.notifyStateChange();
    console.log('▶️ Game resumed');
  }

  // ✅ FIXED: Prevent multiple timers for same player
  private startPlayerTimer(playerIndex: number): void {
    // ✅ CRITICAL: Only start timer if it's actually this player's turn
    if (this.state.currentPlayerIndex !== playerIndex) {
      console.log(`⚠️ Timer start blocked - not ${this.state.players[playerIndex].name}'s turn`);
      return;
    }

    timerService.stopAllTimers();
    
    const player = this.state.players[playerIndex];
    const config = this.state.settings.gameMode;
    
    if (config.timerMode === 'turn-based') {
      const duration = this.state.settings.playerTurnTimeLimit;
      
      this.state.playerTimers = this.state.playerTimers.map((timer, index) => ({
        ...timer,
        timeRemaining: index === playerIndex ? duration : 0,
        totalTime: duration,
        isActive: index === playerIndex,
        startTime: index === playerIndex ? Date.now() : 0
      }));

      timerService.startPlayerTimer(
        player.id,
        duration,
        (playerId) => this.handlePlayerTimeout(playerId),
        (playerId, timeRemaining) => this.handlePlayerTimerTick(playerId, timeRemaining)
      );
    } else if (config.timerMode === 'time-bank') {
      const timeBank = player.remainingTimeBank || 0;
      
      if (timeBank <= 0) {
        if (config.eliminationRules) {
          this.eliminatePlayer(playerIndex);
          return;
        } else {
          this.applyTimeoutPenalty(playerIndex);
          this.moveToNextPlayer();
          return;
        }
      }

      this.state.playerTimers = this.state.playerTimers.map((timer, index) => ({
        ...timer,
        timeRemaining: index === playerIndex ? Math.min(timeBank, 30) : 0,
        totalTime: 30,
        isActive: index === playerIndex,
        startTime: index === playerIndex ? Date.now() : 0,
        timeBankRemaining: index === playerIndex ? timeBank : timer.timeBankRemaining
      }));

      timerService.startPlayerTimer(
        player.id,
        Math.min(timeBank, 30),
        (playerId) => this.handleTimeBankTimeout(playerId),
        (playerId, timeRemaining) => this.handleTimeBankTick(playerId, timeRemaining)
      );
    }

    this.addGameEvent(
      'turn_change',
      player.id,
      player.name,
      `${player.name}'s turn`,
      { playerIndex, timerMode: config.timerMode }
    );

    console.log(`⏰ Timer started for ${player.name}`);
  }

  // ✅ FIXED: Check if it's still the player's turn before applying timeout
  private handlePlayerTimeout(playerId: string): void {
    const playerIndex = this.state.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1 || this.state.currentPlayerIndex !== playerIndex) {
      console.log(`⚠️ Timeout ignored - not ${playerId}'s turn anymore`);
      return;
    }

    console.log(`💀 TIMEOUT: ${this.state.players[playerIndex].name}`);
    
    this.applyTimeoutPenalty(playerIndex);
    this.moveToNextPlayer();
  }

  private handleTimeBankTimeout(playerId: string): void {
    const playerIndex = this.state.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1 || this.state.currentPlayerIndex !== playerIndex) return;

    console.log(`💀 TIME BANK TIMEOUT: ${this.state.players[playerIndex].name}`);
    
    if (this.state.settings.gameMode.eliminationRules) {
      this.eliminatePlayer(playerIndex);
    } else {
      this.applyTimeoutPenalty(playerIndex);
      this.moveToNextPlayer();
    }
  }

  private handlePlayerTimerTick(playerId: string, timeRemaining: number): void {
    const playerIndex = this.state.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    this.state.playerTimers = this.state.playerTimers.map((timer, index) => 
      index === playerIndex 
        ? { ...timer, timeRemaining }
        : timer
    );

    this.notifyStateChange();
  }

  private handleTimeBankTick(playerId: string, timeRemaining: number): void {
    const playerIndex = this.state.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    const player = this.state.players[playerIndex];
    const timeUsed = Math.min(30, (player.remainingTimeBank || 0)) - timeRemaining;
    
    this.state.players[playerIndex].remainingTimeBank = Math.max(0, (player.remainingTimeBank || 0) - timeUsed);
    
    this.state.playerTimers = this.state.playerTimers.map((timer, index) => 
      index === playerIndex 
        ? { 
            ...timer, 
            timeRemaining,
            timeBankRemaining: this.state.players[playerIndex].remainingTimeBank
          }
        : timer
    );

    this.notifyStateChange();
  }

  private eliminatePlayer(playerIndex: number): void {
    const player = this.state.players[playerIndex];
    player.isEliminated = true;
    this.state.eliminatedPlayers = this.state.eliminatedPlayers || [];
    this.state.eliminatedPlayers.push(player.id);
    
    console.log(`💀 ${player.name} eliminated!`);
    
    const activePlayers = this.state.players.filter(p => !p.isEliminated);
    if (activePlayers.length <= 1) {
      this.endGame(`${activePlayers[0]?.name || 'Unknown'} wins by elimination!`);
      return;
    }
    
    this.moveToNextPlayer();
  }

  private applyTimeoutPenalty(playerIndex: number): void {
    const penaltyAmount = this.state.settings.timeoutPenaltyCards;
    const player = this.state.players[playerIndex];
    
    console.log(`💀 Applying ${penaltyAmount} card penalty to ${player.name}`);

    this.addGameEvent(
      'penalty_applied',
      player.id,
      player.name,
      `${player.name} received ${penaltyAmount} penalty cards for timeout`,
      { penaltyAmount, reason: 'timeout' }
    );

    this.reshuffleDrawPile();

    if (this.state.drawPile.length < penaltyAmount) {
      const availableCards = this.state.drawPile;
      this.state.drawPile = [];
      this.state.players[playerIndex].cards = sortCards([
        ...this.state.players[playerIndex].cards,
        ...availableCards
      ]);
      console.log(`⚠️ Only ${availableCards.length} cards available for penalty`);
    } else {
      const penaltyCards = this.state.drawPile.slice(0, penaltyAmount);
      this.state.drawPile = this.state.drawPile.slice(penaltyAmount);
      
      this.state.players[playerIndex].cards = sortCards([
        ...this.state.players[playerIndex].cards,
        ...penaltyCards
      ]);
    }
  }

  private moveToNextPlayer(): void {
    // Reset strike state if we're moving to the next player
    if (this.strikeActive) {
      this.strikeActive = false;
      this.strikeCounter = 0;
    }
    
    let nextPlayerIndex = getNextPlayerIndex(
      this.state.currentPlayerIndex,
      this.state.direction,
      this.state.players.length
    );

    let attempts = 0;
    while (this.state.players[nextPlayerIndex].isEliminated && attempts < this.state.players.length) {
      nextPlayerIndex = getNextPlayerIndex(
        nextPlayerIndex,
        this.state.direction,
        this.state.players.length
      );
      attempts++;
    }

    if (this.state.skipNext) {
      nextPlayerIndex = getNextPlayerIndex(
        nextPlayerIndex,
        this.state.direction,
        this.state.players.length
      );
      
      attempts = 0;
      while (this.state.players[nextPlayerIndex].isEliminated && attempts < this.state.players.length) {
        nextPlayerIndex = getNextPlayerIndex(
          nextPlayerIndex,
          this.state.direction,
          this.state.players.length
        );
        attempts++;
      }
      
      this.state.skipNext = false;
    }

    this.state.currentPlayerIndex = nextPlayerIndex;
    this.startPlayerTimer(nextPlayerIndex);
    
    console.log(`🔄 Turn changed to: ${this.state.players[nextPlayerIndex].name}`);
  }

  drawCard(playerIndex?: number): void {
    this.reshuffleDrawPile();
    
    if (this.state.drawPile.length === 0) return;

    const targetPlayerIndex = playerIndex !== undefined ? playerIndex : this.state.currentPlayerIndex;
    
    // ✅ FIXED: Prevent human from drawing when it's not their turn
    if (targetPlayerIndex === 0 && this.state.currentPlayerIndex !== 0) {
      console.log(`⚠️ Draw blocked - not human player's turn`);
      return;
    }

    const player = this.state.players[targetPlayerIndex];
    console.log(`🃏 ${player.name} draws a card`);

    // If there's an active strike, draw 2 cards and reset strike state
    let cardsToDraw = 1;
    if (this.strikeActive && targetPlayerIndex === this.state.currentPlayerIndex) {
      cardsToDraw = 2;
      this.strikeActive = false;
      this.strikeCounter = 0;
      
      this.addGameEvent(
        'special_effect',
        player.id,
        player.name,
        `${player.name} drew 2 cards due to Strike effect`,
        { strikeEffect: true, cardsDrawn: 2 }
      );
    } else {
      this.addGameEvent(
        'card_drawn',
        player.id,
        player.name,
        `${player.name} drew a card`,
        { cardsInHand: player.cards.length + 1 }
      );
    }

    timerService.pauseAllTimers();

    this.state.isProcessing = true;
    const drawnCard = this.state.drawPile[0];

    this.state.drawingAnimation = {
      playerIndex: targetPlayerIndex,
      cardId: drawnCard.id,
      isActive: true,
      phase: 'flying',
      drawnCard
    };

    this.notifyStateChange();

    // Draw first card animation
    setTimeout(() => {
      if (targetPlayerIndex === 0) {
        this.state.drawingAnimation = {
          playerIndex: targetPlayerIndex,
          cardId: drawnCard.id,
          isActive: true,
          phase: 'revealing',
          drawnCard
        };
        this.notifyStateChange();
      }
    }, this.state.settings.animationDuration * 700);

    setTimeout(() => {
      if (targetPlayerIndex === 0) {
        this.state.drawingAnimation = {
          playerIndex: targetPlayerIndex,
          cardId: drawnCard.id,
          isActive: true,
          phase: 'sorting',
          drawnCard
        };
        this.notifyStateChange();
      }
    }, this.state.settings.animationDuration * 1100);

    setTimeout(() => {
      // Add first card to player's hand
      this.state.players[targetPlayerIndex].cards = sortCards([
        ...this.state.players[targetPlayerIndex].cards,
        drawnCard
      ]);
      this.state.drawPile = this.state.drawPile.slice(1);
      
      // If we need to draw a second card for strike effect
      if (cardsToDraw > 1 && this.state.drawPile.length > 0) {
        const secondCard = this.state.drawPile[0];
        this.state.players[targetPlayerIndex].cards = sortCards([
          ...this.state.players[targetPlayerIndex].cards,
          secondCard
        ]);
        this.state.drawPile = this.state.drawPile.slice(1);
      }
      
      this.state.drawingAnimation = null;
      this.moveToNextPlayer();
      this.state.isProcessing = false;
      this.notifyStateChange();
    }, this.state.settings.animationDuration * 1500);
  }

  playCard(cardId: string): void {
    if (this.state.gamePhase !== 'playing') return;

    const currentPlayer = this.state.players[this.state.currentPlayerIndex];
    const cardToPlay = currentPlayer.cards.find(card => card.id === cardId);

    let canPlay = false;
    if (this.state.voidActive && this.state.voidSelectedColor) {
      canPlay = cardToPlay?.element === this.state.voidSelectedColor || cardToPlay?.type === 'void';
    } else {
      const currentTopCard = this.state.allDiscardedCards[this.state.allDiscardedCards.length - 1];
      
      // Special case for Strike cards
      if (this.strikeActive && cardToPlay) {
        // Can only play a Strike card or a card of the counter element
        if (cardToPlay.type === 'strike') {
          canPlay = true;
          this.strikeCounter++;
        } else {
          // Check if the card's element counters the strike card's element
          const strikeCard = currentTopCard;
          if (strikeCard.type === 'strike') {
            const advantage = getElementalAdvantage(cardToPlay.element, strikeCard.element);
            canPlay = advantage === 'win';
          }
        }
      } else {
        canPlay = cardToPlay ? canPlayCard(cardToPlay, currentTopCard) : false;
      }
    }
    
    if (!cardToPlay || !canPlay) {
      console.log('❌ Invalid card play');
      return;
    }

    const cardDisplay = cardToPlay.type === 'number' ? `${cardToPlay.value}${cardToPlay.element}` : `${cardToPlay.type}-${cardToPlay.element}`;
    console.log(`🃏 ${currentPlayer.name} plays: ${cardDisplay}`);

    this.addGameEvent(
      'card_played',
      currentPlayer.id,
      currentPlayer.name,
      `${currentPlayer.name} played ${cardDisplay}`,
      { cardType: cardToPlay.type, element: cardToPlay.element, cardsRemaining: currentPlayer.cards.length - 1 }
    );

    timerService.pauseAllTimers();

    this.state.isProcessing = true;
    this.state.currentCardPlayedBy = this.state.currentPlayerIndex;

    if (cardToPlay.type === 'void') {
      this.handleVoidCard(cardToPlay);
      return;
    }

    if (cardToPlay.type === 'stack') {
      this.handleStackCard(cardToPlay);
    } else {
      this.handleRegularCard(cardToPlay);
    }

    // Handle special card effects
    switch (cardToPlay.type) {
      case 'skip':
        this.state.skipNext = true;
        this.addGameEvent(
          'special_effect',
          currentPlayer.id,
          currentPlayer.name,
          `${currentPlayer.name} used Skip - next player is skipped`,
          { effect: 'skip' }
        );
        break;
      case 'reverse':
        this.state.direction *= -1;
        this.addGameEvent(
          'special_effect',
          currentPlayer.id,
          currentPlayer.name,
          `${currentPlayer.name} used Reverse - direction changed`,
          { effect: 'reverse', newDirection: this.state.direction }
        );
        break;
      case 'strike':
        // Activate strike effect for next player
        this.strikeActive = true;
        this.strikeCounter++;
        this.addGameEvent(
          'special_effect',
          currentPlayer.id,
          currentPlayer.name,
          `${currentPlayer.name} used Strike - next player must draw 2, counter, or play another Strike`,
          { effect: 'strike', strikeCounter: this.strikeCounter }
        );
        break;
    }

    if (this.state.players[this.state.currentPlayerIndex].cards.length === 0) {
      this.endGame(`${currentPlayer.name} wins by emptying their hand!`);
      return;
    }

    this.moveToNextPlayer();
    this.state.isProcessing = false;
    this.notifyStateChange();
  }

  private handleRegularCard(cardToPlay: Card): void {
    this.state.players[this.state.currentPlayerIndex].cards = sortCards(
      this.state.players[this.state.currentPlayerIndex].cards.filter(
        card => card.id !== cardToPlay.id
      )
    );

    const newDiscardedCard = createDiscardedCard(
      cardToPlay,
      this.state.currentPlayerIndex,
      this.state.allDiscardedCards.length,
      this.state.humanPlayerIndex
    );
    
    this.state.allDiscardedCards.push(newDiscardedCard);
    this.state.discardCounter++;
    
    // Clear void state when regular card is played
    this.state.voidActive = false;
    this.state.voidCard = null;
    this.state.voidSelectedColor = null;
    this.state.voidAnimationPhase = null;
  }

  private handleStackCard(cardToPlay: Card): void {
    const discardPileForStack = this.state.allDiscardedCards.slice(0, -1);
    
    const { remainingDiscardPile, playerCardsToDiscard } = processStackCard(
      cardToPlay,
      discardPileForStack,
      this.state.players[this.state.currentPlayerIndex].cards,
      this.state.settings.gameMode.stackMode
    );

    const removedFromDiscard = discardPileForStack.length - remainingDiscardPile.length;
    this.addGameEvent(
      'special_effect',
      this.state.players[this.state.currentPlayerIndex].id,
      this.state.players[this.state.currentPlayerIndex].name,
      `Stack card removed ${removedFromDiscard} cards from discard pile and ${playerCardsToDiscard.length} from hand`,
      { 
        effect: 'stack', 
        removedFromDiscard, 
        removedFromHand: playerCardsToDiscard.length,
        stackMode: this.state.settings.gameMode.stackMode
      }
    );

    this.state.players[this.state.currentPlayerIndex].cards = sortCards(
      this.state.players[this.state.currentPlayerIndex].cards.filter(
        card => card.id !== cardToPlay.id && 
        !playerCardsToDiscard.some(discardCard => discardCard.id === card.id)
      )
    );

    const currentTopCard = this.state.allDiscardedCards[this.state.allDiscardedCards.length - 1];
    
    const newStackCard = createDiscardedCard(
      cardToPlay,
      this.state.currentPlayerIndex,
      remainingDiscardPile.length + 1,
      this.state.humanPlayerIndex
    );
    
    this.state.allDiscardedCards = [...remainingDiscardPile, currentTopCard, newStackCard];
    this.state.discardCounter++;
    
    // Clear void state when stack card is played
    this.state.voidActive = false;
    this.state.voidCard = null;
    this.state.voidSelectedColor = null;
    this.state.voidAnimationPhase = null;
  }

  // ✅ COMPLETE VOID CARD TIMELINE IMPLEMENTATION
  private handleVoidCard(cardToPlay: Card): void {
    console.log('🔮 VOID TIMELINE: STEP A - Void card flying to discard pile');
    
    // Remove card from player's hand
    this.state.players[this.state.currentPlayerIndex].cards = sortCards(
      this.state.players[this.state.currentPlayerIndex].cards.filter(
        card => card.id !== cardToPlay.id
      )
    );

    // Start void card flying animation
    this.state.voidAnimationPhase = 'card_flying';
    this.state.isProcessing = true;
    
    this.addGameEvent(
      'special_effect',
      this.state.players[this.state.currentPlayerIndex].id,
      this.state.players[this.state.currentPlayerIndex].name,
      `${this.state.players[this.state.currentPlayerIndex].name} used Void card`,
      { effect: 'void', discardPileSize: this.state.allDiscardedCards.length }
    );
    
    this.notifyStateChange();

    // After flying animation, show void card and start color selection
    setTimeout(() => {
      console.log('🔮 VOID TIMELINE: STEP B - Void card landed, starting color selection');
      
      this.state.voidCard = cardToPlay;
      this.state.voidActive = true;
      this.state.gamePhase = 'color-selection';
      this.state.pendingColorSelection = true;
      this.state.voidAnimationPhase = 'color_selecting';
      this.state.isProcessing = false;
      
      this.startColorSelectionTimer();
      this.notifyStateChange();
    }, this.state.settings.voidCardFlySpeed * 1000);
  }

  private startColorSelectionTimer(): void {
    if (this.colorSelectionTimer) {
      clearTimeout(this.colorSelectionTimer);
    }

    const timeLimit = this.state.settings.colorSelectionTimeLimit * 1000;

    this.colorSelectionTimer = setTimeout(() => {
      if (this.state.gamePhase === 'color-selection') {
        const colors: ElementType[] = ['fire', 'water', 'plant', 'thunder'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        console.log(`⏰ Color selection timeout - auto-selecting: ${randomColor}`);
        this.selectColor(randomColor);
      }
    }, timeLimit);
  }

  // ✅ COMPLETE VOID COLOR SELECTION WITH ALL ANIMATIONS
  selectColor(element: ElementType): void {
    if (this.state.gamePhase !== 'color-selection') return;

    console.log('🎨 VOID TIMELINE: STEP C - Color selected, starting transformation');

    if (this.colorSelectionTimer) {
      clearTimeout(this.colorSelectionTimer);
      this.colorSelectionTimer = null;
    }

    const nextPlayerIndex = getNextPlayerIndex(
      this.state.currentPlayerIndex,
      this.state.direction,
      this.state.players.length
    );

    // Start color transformation animation
    this.state.voidAnimationPhase = 'color_changing';
    this.state.isProcessing = true;
    this.state.gamePhase = 'playing';
    this.state.pendingColorSelection = false;

    this.addGameEvent(
      'special_effect',
      this.state.players[this.state.currentPlayerIndex].id,
      this.state.players[this.state.currentPlayerIndex].name,
      `Color selected: ${element}. ${this.state.players[nextPlayerIndex].name} will receive ${this.state.allDiscardedCards.length} cards`,
      { 
        effect: 'void_color_selection', 
        selectedColor: element, 
        cardsGiven: this.state.allDiscardedCards.length,
        targetPlayer: this.state.players[nextPlayerIndex].name
      }
    );

    this.notifyStateChange();

    // After color change animation, transform void card and start discard pile movement
    setTimeout(() => {
      console.log('🎨 VOID TIMELINE: STEP D - Color transformation complete, starting discard pile movement');
      
      // Transform void card to selected color
      if (this.state.voidCard) {
        this.state.voidCard = {
          ...this.state.voidCard,
          element: element
        };
        this.state.voidSelectedColor = element;
      }

      // Start discard pile movement animation
      this.state.voidAnimationPhase = 'discard_moving';
      this.notifyStateChange();

      // After discard pile movement animation, complete the void effect
      setTimeout(() => {
        console.log('🎨 VOID TIMELINE: STEP E - Discard pile movement complete, giving cards to next player');
        
        // Give all discard pile cards to next player
        const allCardsToGive = this.state.allDiscardedCards.map(discardedCard => ({
          id: discardedCard.id,
          element: discardedCard.element,
          type: discardedCard.type,
          value: discardedCard.value
        } as Card));

        this.state.players[nextPlayerIndex].cards = sortCards([
          ...this.state.players[nextPlayerIndex].cards,
          ...allCardsToGive
        ]);

        // Clear discard pile (void card stays visible as background)
        this.state.allDiscardedCards = [];
        this.state.currentPlayerIndex = nextPlayerIndex;
        this.state.isProcessing = false;
        this.state.voidAnimationPhase = null;

        // Start next player's turn
        this.startPlayerTimer(nextPlayerIndex);
        this.notifyStateChange();
        
        console.log('🎨 VOID TIMELINE COMPLETE - Next player turn started');
      }, this.state.settings.voidDiscardMoveSpeed * 2000);

    }, this.state.settings.voidColorChangeSpeed * 1000);

    console.log(`🎨 Color selected: ${element}. Starting transformation and movement animations`);
  }

  updateSettings(newSettings: Partial<GameSettings>): void {
    this.state.settings = { ...this.state.settings, ...newSettings };
    this.notifyStateChange();
    console.log('⚙️ Settings updated:', newSettings);
  }

  private endGame(reason: string): void {
    timerService.stopAllTimers();
    if (this.matchTimer) {
      clearInterval(this.matchTimer);
      this.matchTimer = null;
    }
    if (this.colorSelectionTimer) {
      clearTimeout(this.colorSelectionTimer);
      this.colorSelectionTimer = null;
    }
    
    const activePlayers = this.state.players.filter(p => !p.isEliminated);
    const rankings = getRankings(activePlayers);
    
    this.state.gamePhase = 'ended';
    this.state.winner = reason;
    this.state.rankings = rankings;

    this.addGameEvent(
      'game_end',
      'system',
      'System',
      reason,
      { rankings: rankings.map(r => ({ name: r.player.name, rank: r.rank, score: r.score })) }
    );
    
    this.notifyStateChange();
    console.log(`🏆 Game ended: ${reason}`);
  }

  getState(): GameState {
    return { ...this.state };
  }

  private notifyStateChange(): void {
    this.onStateChange({ ...this.state });
  }

  destroy(): void {
    timerService.stopAllTimers();
    if (this.matchTimer) {
      clearInterval(this.matchTimer);
      this.matchTimer = null;
    }
    if (this.colorSelectionTimer) {
      clearTimeout(this.colorSelectionTimer);
      this.colorSelectionTimer = null;
    }
    console.log('🎮 Game engine destroyed');
  }
}