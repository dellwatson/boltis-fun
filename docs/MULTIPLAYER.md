# BOLTIS Multiplayer Documentation

> **Status**: 🚧 In Development - This document outlines planned multiplayer features

## Overview

BOLTIS multiplayer will enable real-time gameplay between players across the internet. The system uses **WebSockets/Colyseus** for real-time communication and **Supabase** as a database for persistent storage, user management, and match records.

## Architecture

### Technology Stack
- **Real-time Communication**: WebSockets via Colyseus game server
- **Database**: Supabase (PostgreSQL) for persistent storage
- **Authentication**: Supabase Auth for user management
- **Matchmaking**: Colyseus room-based system with database integration
- **State Management**: Colyseus state synchronization with database persistence

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client A      │    │   Colyseus      │    │   Client B      │
│                 │    │   Game Server   │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Game Engine │◄┼────┼►│ Room State  │◄┼────┼►│ Game Engine │ │
│ └─────────────┘ │    │ │ Management  │ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ WebSocket   │ │    │ │ Matchmaking │ │    │ │ WebSocket   │ │
│ │ Client      │ │    │ │   System    │ │    │ │ Client      │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Supabase      │
                    │   Database      │
                    │ ┌─────────────┐ │
                    │ │ User Data   │ │
                    │ │ Match Logs  │ │
                    │ │ Statistics  │ │
                    │ │ Leaderboard │ │
                    │ └─────────────┘ │
                    └─────────────────┘
```

## Core Features

### 1. Real-Time Multiplayer

#### Game Flow
1. **Matchmaking**: Players join queue or create rooms via Colyseus
2. **Room Creation**: Colyseus manages game rooms with real-time state
3. **Live Gameplay**: WebSocket communication for instant card plays
4. **State Sync**: All players see moves in real-time
5. **Database Logging**: Match results saved to Supabase for statistics

#### Supported Game Modes
- **Classic Multiplayer**: Standard BOLTIS rules with 2-8 players
- **Blitz Mode**: Fast-paced games with shorter turn timers
- **Tournament Mode**: Bracket-style elimination tournaments
- **Custom Rooms**: Private rooms with custom rules

### 2. Colyseus Room System

#### Room Types
```typescript
interface GameRoom extends Room {
  roomId: string;
  roomName: string;
  hostId: string;
  players: Map<string, Player>;
  maxPlayers: number;
  gameMode: GameModeConfig;
  state: GameRoomState;
  isPrivate: boolean;
  roomCode?: string;
  currentTurn: number;
  gamePhase: 'waiting' | 'starting' | 'playing' | 'finished';
}

class GameRoomState extends Schema {
  @type("string") currentPlayerId: string;
  @type("number") currentTurn: number;
  @type("number") direction: number;
  @type([Card]) discardPile: ArraySchema<Card>;
  @type("boolean") voidActive: boolean;
  @type("string") voidSelectedColor?: ElementType;
  @type({ map: Player }) players: MapSchema<Player>;
}
```

#### Real-Time State Management
```typescript
class GameRoom extends Room<GameRoomState> {
  onCreate(options: any) {
    this.setState(new GameRoomState());
    this.maxClients = options.maxPlayers || 4;
    
    // Initialize game state
    this.state.currentTurn = 0;
    this.state.direction = 1;
    this.state.discardPile = new ArraySchema<Card>();
  }
  
  onJoin(client: Client, options: any) {
    // Add player to room
    const player = new Player();
    player.id = client.sessionId;
    player.name = options.playerName;
    this.state.players.set(client.sessionId, player);
    
    // Start game when room is full
    if (this.state.players.size === this.maxClients) {
      this.startGame();
    }
  }
  
  onMessage(client: Client, message: any) {
    switch (message.type) {
      case 'play_card':
        this.handleCardPlay(client, message.cardId);
        break;
      case 'draw_card':
        this.handleCardDraw(client);
        break;
      case 'select_color':
        this.handleColorSelection(client, message.color);
        break;
    }
  }
}
```

### 3. WebSocket Communication

#### Client-Side Integration
```typescript
import { Client, Room } from 'colyseus.js';

class MultiplayerService {
  private client: Client;
  private room: Room<GameRoomState> | null = null;
  
  async connect() {
    this.client = new Client('ws://localhost:2567');
  }
  
  async joinRoom(roomId?: string) {
    if (roomId) {
      this.room = await this.client.joinById(roomId);
    } else {
      this.room = await this.client.joinOrCreate('game_room');
    }
    
    this.setupEventListeners();
  }
  
  private setupEventListeners() {
    this.room?.onStateChange((state) => {
      // Update local game state
      this.updateGameState(state);
    });
    
    this.room?.onMessage('card_played', (message) => {
      // Handle card play animations
      this.animateCardPlay(message);
    });
    
    this.room?.onMessage('game_ended', (message) => {
      // Handle game end
      this.handleGameEnd(message);
    });
  }
  
  playCard(cardId: string) {
    this.room?.send('play_card', { cardId });
  }
  
  drawCard() {
    this.room?.send('draw_card');
  }
}
```

### 4. Database Integration

#### Match Persistence
```typescript
// Save match results to Supabase after game ends
class MatchPersistence {
  async saveMatchResult(roomState: GameRoomState, matchDuration: number) {
    const matchData = {
      game_mode: roomState.gameMode,
      total_duration: matchDuration,
      is_bot_match: false, // Multiplayer games
      status: 'completed'
    };
    
    const { data: match } = await supabase
      .from('matches')
      .insert(matchData)
      .select()
      .single();
    
    // Save participant data
    const participants = Array.from(roomState.players.values()).map((player, index) => ({
      match_id: match.id,
      user_id: player.userId,
      player_name: player.name,
      player_type: 'human',
      final_position: this.calculatePosition(player),
      final_score: this.calculateScore(player.cards),
      cards_remaining: player.cards.length
    }));
    
    await supabase
      .from('match_participants')
      .insert(participants);
  }
}
```

#### Leaderboard Updates
```typescript
// Real-time leaderboard updates
class LeaderboardService {
  async updatePlayerStats(userId: string, matchResult: MatchResult) {
    // Update player profile stats
    await supabase.rpc('update_player_stats', {
      player_id: userId,
      won: matchResult.position === 1,
      score: matchResult.finalScore,
      is_multiplayer: true
    });
    
    // Refresh leaderboards
    await this.refreshLeaderboards();
  }
}
```

## Technical Implementation

### 1. Colyseus Server Setup

#### Server Configuration
```typescript
import { Server } from 'colyseus';
import { GameRoom } from './rooms/GameRoom';

const gameServer = new Server({
  transport: new uWS.App()
});

// Register room handlers
gameServer.define('game_room', GameRoom);
gameServer.define('tournament_room', TournamentRoom);

// Matchmaking
gameServer.define('matchmaking', MatchmakingRoom);

gameServer.listen(2567);
```

#### Room State Schema
```typescript
import { Schema, type, ArraySchema, MapSchema } from '@colyseus/schema';

class Card extends Schema {
  @type("string") id: string;
  @type("string") element: ElementType;
  @type("string") type: CardType;
  @type("number") value?: number;
}

class Player extends Schema {
  @type("string") id: string;
  @type("string") name: string;
  @type("string") userId?: string;
  @type([Card]) cards: ArraySchema<Card>;
  @type("boolean") isConnected: boolean = true;
  @type("number") timeRemaining: number = 0;
}

class GameRoomState extends Schema {
  @type("string") currentPlayerId: string;
  @type("number") currentTurn: number;
  @type("number") direction: number = 1;
  @type([Card]) discardPile: ArraySchema<Card>;
  @type([Card]) drawPile: ArraySchema<Card>;
  @type("boolean") voidActive: boolean = false;
  @type("string") voidSelectedColor?: ElementType;
  @type({ map: Player }) players: MapSchema<Player>;
  @type("string") gamePhase: string = 'waiting';
  @type("string") winnerId?: string;
}
```

### 2. Client State Synchronization

#### React Integration
```typescript
import { useEffect, useState } from 'react';
import { Room } from 'colyseus.js';

export const useMultiplayerGame = (roomId?: string) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [gameState, setGameState] = useState<GameRoomState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const connectToRoom = async () => {
      const multiplayerService = new MultiplayerService();
      await multiplayerService.connect();
      
      const gameRoom = await multiplayerService.joinRoom(roomId);
      setRoom(gameRoom);
      
      gameRoom.onStateChange((state) => {
        setGameState(state);
      });
      
      gameRoom.onJoin(() => {
        setIsConnected(true);
      });
      
      gameRoom.onLeave(() => {
        setIsConnected(false);
      });
    };
    
    connectToRoom();
    
    return () => {
      room?.leave();
    };
  }, [roomId]);
  
  const playCard = (cardId: string) => {
    room?.send('play_card', { cardId });
  };
  
  const drawCard = () => {
    room?.send('draw_card');
  };
  
  return {
    gameState,
    isConnected,
    playCard,
    drawCard
  };
};
```

### 3. Matchmaking System

#### Queue-Based Matching
```typescript
class MatchmakingRoom extends Room {
  private queue: Map<string, MatchmakingEntry> = new Map();
  
  onJoin(client: Client, options: any) {
    const entry: MatchmakingEntry = {
      clientId: client.sessionId,
      playerName: options.playerName,
      skillRating: options.skillRating || 1000,
      preferredMode: options.gameMode || 'classic',
      joinedAt: Date.now()
    };
    
    this.queue.set(client.sessionId, entry);
    this.tryCreateMatch();
  }
  
  private tryCreateMatch() {
    const queueArray = Array.from(this.queue.values());
    
    if (queueArray.length >= 2) {
      // Simple matching by skill rating
      const sortedQueue = queueArray.sort((a, b) => a.skillRating - b.skillRating);
      
      for (let i = 0; i < sortedQueue.length - 1; i++) {
        const player1 = sortedQueue[i];
        const player2 = sortedQueue[i + 1];
        
        if (Math.abs(player1.skillRating - player2.skillRating) <= 200) {
          this.createMatch([player1, player2]);
          break;
        }
      }
    }
  }
  
  private async createMatch(players: MatchmakingEntry[]) {
    // Create new game room
    const room = await this.presence.create('game_room', {
      maxPlayers: players.length,
      gameMode: players[0].preferredMode
    });
    
    // Notify players
    players.forEach(player => {
      const client = this.clients.find(c => c.sessionId === player.clientId);
      client?.send('match_found', { roomId: room.roomId });
      
      // Remove from queue
      this.queue.delete(player.clientId);
    });
  }
}
```

## Security & Anti-Cheat

### Server-Side Validation
```typescript
class GameRoom extends Room<GameRoomState> {
  private validateCardPlay(client: Client, cardId: string): boolean {
    const player = this.state.players.get(client.sessionId);
    
    // Check if it's player's turn
    if (this.state.currentPlayerId !== client.sessionId) {
      return false;
    }
    
    // Validate player has the card
    const hasCard = player?.cards.some(card => card.id === cardId);
    if (!hasCard) {
      return false;
    }
    
    // Validate move against game rules
    const card = player.cards.find(c => c.id === cardId);
    const topCard = this.state.discardPile[this.state.discardPile.length - 1];
    
    return this.gameLogic.canPlayCard(card, topCard, this.state.voidActive);
  }
  
  private handleCardPlay(client: Client, cardId: string) {
    if (!this.validateCardPlay(client, cardId)) {
      client.send('invalid_move', { reason: 'Invalid card play' });
      return;
    }
    
    // Process the move
    this.gameLogic.playCard(client.sessionId, cardId);
    
    // Log to database for audit
    this.logMove(client.sessionId, 'play_card', { cardId });
  }
}
```

### Rate Limiting
```typescript
class RateLimiter {
  private playerActions: Map<string, number[]> = new Map();
  
  isAllowed(playerId: string): boolean {
    const now = Date.now();
    const actions = this.playerActions.get(playerId) || [];
    
    // Remove actions older than 1 minute
    const recentActions = actions.filter(time => now - time < 60000);
    
    // Allow max 60 actions per minute
    if (recentActions.length >= 60) {
      return false;
    }
    
    recentActions.push(now);
    this.playerActions.set(playerId, recentActions);
    return true;
  }
}
```

## Performance Optimization

### State Delta Compression
```typescript
// Colyseus automatically handles state deltas
// Only changed properties are sent to clients
class GameRoomState extends Schema {
  @type("string") currentPlayerId: string;
  
  // This will only send updates when the value changes
  setCurrentPlayer(playerId: string) {
    this.currentPlayerId = playerId;
  }
}
```

### Connection Management
```typescript
class GameRoom extends Room<GameRoomState> {
  onLeave(client: Client, consented: boolean) {
    const player = this.state.players.get(client.sessionId);
    
    if (!consented) {
      // Player disconnected unexpectedly
      player.isConnected = false;
      
      // Allow 30 seconds to reconnect
      this.allowReconnection(client, 30);
    } else {
      // Player left intentionally
      this.state.players.delete(client.sessionId);
    }
  }
  
  onReconnect(client: Client, player: Player) {
    player.isConnected = true;
    client.send('reconnected', { gameState: this.state });
  }
}
```

## Deployment

### Server Deployment
```dockerfile
# Dockerfile for Colyseus server
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 2567
CMD ["npm", "start"]
```

### Environment Configuration
```typescript
// Server environment variables
const config = {
  port: process.env.PORT || 2567,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_KEY,
  redisUrl: process.env.REDIS_URL, // For presence/scaling
};
```

## Testing Strategy

### Integration Testing
```typescript
describe('Multiplayer Game Flow', () => {
  let server: Server;
  let client1: Client;
  let client2: Client;
  
  beforeEach(async () => {
    server = new Server();
    server.define('game_room', GameRoom);
    
    client1 = new Client('ws://localhost:2567');
    client2 = new Client('ws://localhost:2567');
  });
  
  test('should handle complete game flow', async () => {
    // Both players join room
    const room1 = await client1.joinOrCreate('game_room');
    const room2 = await client2.joinById(room1.roomId);
    
    // Wait for game to start
    await waitFor(() => room1.state.gamePhase === 'playing');
    
    // Player 1 plays a card
    room1.send('play_card', { cardId: 'fire-5' });
    
    // Verify state update
    await waitFor(() => room2.state.currentTurn === 1);
    
    expect(room2.state.currentPlayerId).not.toBe(room1.sessionId);
  });
});
```

## Roadmap

### Phase 1: Core Real-Time Multiplayer (Q1 2025)
- [ ] Colyseus server setup and basic rooms
- [ ] WebSocket client integration
- [ ] Real-time card play synchronization
- [ ] Basic matchmaking system

### Phase 2: Enhanced Features (Q2 2025)
- [ ] Tournament bracket system
- [ ] Spectator mode
- [ ] Reconnection handling
- [ ] Mobile app optimization

### Phase 3: Advanced Features (Q3 2025)
- [ ] Skill-based matchmaking
- [ ] Replay system
- [ ] Advanced statistics
- [ ] Custom game modes

### Phase 4: Scaling & Polish (Q4 2025)
- [ ] Multi-server scaling
- [ ] Advanced anti-cheat
- [ ] Performance optimizations
- [ ] Community features

## Contributing to Multiplayer

### Development Setup
```bash
# Clone and setup
git clone https://github.com/yourusername/boltis.git
cd boltis

# Install dependencies
npm install

# Setup Supabase for user data
cp .env.example .env
# Add your Supabase credentials

# Start Colyseus server (separate terminal)
cd server
npm run dev

# Start client development
npm run dev
```

### Testing Multiplayer
```bash
# Run multiplayer-specific tests
npm run test:multiplayer

# Test with multiple clients
npm run test:clients

# Load testing
npm run test:load
```

## Support

For multiplayer-specific questions and issues:
- **GitHub Issues**: Tag with `multiplayer` label
- **Email**: multiplayer@theras.xyz
- **Documentation**: This file and inline code comments

---

*This document reflects the WebSocket/Colyseus approach to BOLTIS multiplayer with Supabase database integration for persistent data.*