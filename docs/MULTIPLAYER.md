# BOLTIS Multiplayer Documentation

> **Status**: 🚧 In Development - This document outlines planned multiplayer features

## Overview

BOLTIS multiplayer will enable turn-based gameplay between players across the internet. The system uses Supabase as a database for persistent game state, user management, and match records - **not for real-time communication**.

## Architecture

### Technology Stack
- **Database**: Supabase (PostgreSQL) for persistent storage
- **State Management**: Database-driven turn-based system
- **Authentication**: Supabase Auth for user management
- **Matchmaking**: Database-based room and queue system
- **Real-time Updates**: Polling-based state synchronization

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client A      │    │   Supabase      │    │   Client B      │
│                 │    │   Database      │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Game Engine │◄┼────┼►│ Game State  │◄┼────┼►│ Game Engine │ │
│ └─────────────┘ │    │ │   Tables    │ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Polling     │ │    │ │ Room System │ │    │ │ Polling     │ │
│ │ Service     │ │    │ │   Tables    │ │    │ │ Service     │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Core Features

### 1. Turn-Based Multiplayer

#### Game Flow
1. **Room Creation**: Host creates a room with custom settings in database
2. **Player Joining**: Players join via room code stored in database
3. **Game Start**: Game state initialized in database tables
4. **Turn-Based Gameplay**: Players take turns, each action stored in database
5. **State Polling**: Clients poll database for game state updates
6. **Game End**: Final results saved to match history tables

#### Supported Game Modes
- **Classic Multiplayer**: Standard BOLTIS rules with 2-8 players
- **Async Mode**: Players can take turns over extended periods
- **Tournament Mode**: Bracket-style elimination tournaments
- **Blitz Mode**: Fast-paced games with shorter turn timers

### 2. Database-Driven Room System

#### Room Types
```typescript
interface GameRoom {
  id: string;
  name: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  gameMode: GameModeConfig;
  status: 'waiting' | 'starting' | 'playing' | 'finished';
  isPrivate: boolean;
  roomCode?: string;
  createdAt: Date;
  currentTurn: number;
  currentPlayerId: string;
  gameState: GameState;
  settings: RoomSettings;
}
```

#### Database Tables
```sql
-- Game rooms
CREATE TABLE multiplayer_rooms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  host_id uuid REFERENCES profiles(id),
  max_players integer DEFAULT 4,
  current_players integer DEFAULT 0,
  status text DEFAULT 'waiting',
  is_private boolean DEFAULT false,
  room_code text UNIQUE,
  current_turn integer DEFAULT 0,
  current_player_id uuid REFERENCES profiles(id),
  game_state jsonb DEFAULT '{}',
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Room participants
CREATE TABLE room_participants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id uuid REFERENCES multiplayer_rooms(id) ON DELETE CASCADE,
  player_id uuid REFERENCES profiles(id),
  player_order integer NOT NULL,
  role text DEFAULT 'player',
  joined_at timestamptz DEFAULT now(),
  left_at timestamptz,
  is_active boolean DEFAULT true
);

-- Game moves/actions
CREATE TABLE game_moves (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id uuid REFERENCES multiplayer_rooms(id),
  player_id uuid REFERENCES profiles(id),
  move_type text NOT NULL, -- 'play_card', 'draw_card', 'select_color'
  move_data jsonb NOT NULL,
  turn_number integer NOT NULL,
  timestamp timestamptz DEFAULT now()
);
```

### 3. Polling-Based Synchronization

#### Client Polling Strategy
```typescript
class MultiplayerService {
  private pollInterval: NodeJS.Timeout | null = null;
  
  startPolling(roomId: string) {
    this.pollInterval = setInterval(async () => {
      const gameState = await this.fetchGameState(roomId);
      if (gameState.version > this.currentVersion) {
        this.updateLocalGameState(gameState);
      }
    }, 2000); // Poll every 2 seconds
  }
  
  async makeMove(roomId: string, move: GameMove) {
    // Optimistic update
    this.updateLocalGameState(move);
    
    // Send to database
    await supabase
      .from('game_moves')
      .insert({
        room_id: roomId,
        player_id: this.playerId,
        move_type: move.type,
        move_data: move.data,
        turn_number: this.currentTurn
      });
      
    // Update room state
    await supabase
      .from('multiplayer_rooms')
      .update({
        game_state: this.gameState,
        current_turn: this.currentTurn + 1,
        current_player_id: this.getNextPlayerId(),
        updated_at: new Date()
      })
      .eq('id', roomId);
  }
}
```

### 4. Matchmaking System

#### Database-Based Matching
```typescript
interface MatchmakingQueue {
  id: string;
  playerId: string;
  preferredMode: GameMode;
  skillRating: number;
  queuedAt: Date;
  maxWaitTime: number;
}

// Matchmaking table
CREATE TABLE matchmaking_queue (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id uuid REFERENCES profiles(id),
  preferred_mode text NOT NULL,
  skill_rating integer DEFAULT 1000,
  queued_at timestamptz DEFAULT now(),
  max_wait_time integer DEFAULT 300 -- 5 minutes
);
```

#### Matchmaking Process
1. **Queue Entry**: Player joins matchmaking queue in database
2. **Periodic Matching**: Server function runs every 30 seconds to create matches
3. **Room Creation**: Matched players automatically placed in new room
4. **Notification**: Players notified via polling that match was found

## Technical Implementation

### 1. Database Schema

#### Core Multiplayer Tables
```sql
-- Extended profiles for multiplayer
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
  multiplayer_rating integer DEFAULT 1000,
  games_played integer DEFAULT 0,
  current_room_id uuid REFERENCES multiplayer_rooms(id),
  last_active timestamptz DEFAULT now();

-- Game state snapshots
CREATE TABLE game_snapshots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id uuid REFERENCES multiplayer_rooms(id),
  turn_number integer NOT NULL,
  game_state jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Player hands (encrypted for security)
CREATE TABLE player_hands (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id uuid REFERENCES multiplayer_rooms(id),
  player_id uuid REFERENCES profiles(id),
  hand_data text NOT NULL, -- encrypted JSON
  updated_at timestamptz DEFAULT now()
);
```

### 2. Turn Management

#### Turn-Based Logic
```typescript
interface TurnManager {
  roomId: string;
  currentTurn: number;
  currentPlayerId: string;
  turnTimeLimit: number;
  turnStartTime: Date;
}

class TurnService {
  async processTurn(roomId: string, playerId: string, action: GameAction) {
    // Validate it's player's turn
    const room = await this.getRoomState(roomId);
    if (room.currentPlayerId !== playerId) {
      throw new Error('Not your turn');
    }
    
    // Process the action
    const newGameState = this.gameEngine.processAction(room.gameState, action);
    
    // Save to database
    await this.saveGameState(roomId, newGameState);
    await this.advanceTurn(roomId);
  }
  
  async handleTurnTimeout(roomId: string) {
    // Auto-draw card for player who timed out
    const room = await this.getRoomState(roomId);
    const timeoutAction = { type: 'draw_card', playerId: room.currentPlayerId };
    await this.processTurn(roomId, room.currentPlayerId, timeoutAction);
  }
}
```

### 3. State Synchronization

#### Optimistic Updates with Rollback
```typescript
class GameStateManager {
  private localState: GameState;
  private serverState: GameState;
  private pendingMoves: GameMove[] = [];
  
  async makeOptimisticMove(move: GameMove) {
    // Apply move locally immediately
    this.localState = this.applyMove(this.localState, move);
    this.pendingMoves.push(move);
    
    // Send to server
    try {
      await this.sendMoveToServer(move);
      this.confirmMove(move);
    } catch (error) {
      this.rollbackMove(move);
    }
  }
  
  async syncWithServer() {
    const serverState = await this.fetchServerState();
    if (serverState.version > this.serverState.version) {
      this.resolveConflicts(serverState);
    }
  }
}
```

## API Design

### REST Endpoints
```typescript
// Room management
POST   /api/rooms                    // Create room
GET    /api/rooms                    // List public rooms
GET    /api/rooms/:id                // Get room details
POST   /api/rooms/:id/join           // Join room
DELETE /api/rooms/:id/leave          // Leave room

// Game actions
POST   /api/rooms/:id/moves          // Make a move
GET    /api/rooms/:id/state          // Get current game state
GET    /api/rooms/:id/moves          // Get move history

// Matchmaking
POST   /api/matchmaking/queue        // Join queue
DELETE /api/matchmaking/queue        // Leave queue
GET    /api/matchmaking/status       // Check queue status
```

### Database Functions
```sql
-- Function to advance turn
CREATE OR REPLACE FUNCTION advance_turn(room_uuid uuid)
RETURNS void AS $$
DECLARE
  next_player_id uuid;
BEGIN
  -- Get next player in turn order
  SELECT player_id INTO next_player_id
  FROM room_participants
  WHERE room_id = room_uuid 
    AND is_active = true
  ORDER BY player_order
  LIMIT 1 OFFSET (
    SELECT player_order FROM room_participants 
    WHERE room_id = room_uuid AND player_id = (
      SELECT current_player_id FROM multiplayer_rooms WHERE id = room_uuid
    )
  ) + 1;
  
  -- Update room with next player
  UPDATE multiplayer_rooms 
  SET current_player_id = next_player_id,
      current_turn = current_turn + 1,
      updated_at = now()
  WHERE id = room_uuid;
END;
$$ LANGUAGE plpgsql;
```

## Security Considerations

### Data Protection
- **Hand Encryption**: Player hands encrypted in database
- **Move Validation**: All moves validated server-side
- **Rate Limiting**: Prevent move spam and abuse
- **Turn Validation**: Ensure only current player can move

### Anti-Cheat Measures
```typescript
class AntiCheatService {
  validateMove(roomId: string, playerId: string, move: GameMove): boolean {
    // Check if it's player's turn
    if (!this.isPlayerTurn(roomId, playerId)) return false;
    
    // Validate move against game rules
    if (!this.isValidMove(roomId, move)) return false;
    
    // Check for timing violations
    if (!this.isWithinTimeLimit(roomId, move.timestamp)) return false;
    
    return true;
  }
  
  detectSuspiciousActivity(playerId: string): boolean {
    // Check for impossible move timing
    // Detect pattern anomalies
    // Flag rapid successive moves
    return false;
  }
}
```

## Performance Optimization

### Database Optimization
```sql
-- Indexes for performance
CREATE INDEX idx_rooms_status ON multiplayer_rooms(status);
CREATE INDEX idx_rooms_updated ON multiplayer_rooms(updated_at DESC);
CREATE INDEX idx_participants_room ON room_participants(room_id);
CREATE INDEX idx_moves_room_turn ON game_moves(room_id, turn_number);
CREATE INDEX idx_queue_rating ON matchmaking_queue(skill_rating);

-- Cleanup old data
CREATE OR REPLACE FUNCTION cleanup_old_games()
RETURNS void AS $$
BEGIN
  -- Delete finished games older than 30 days
  DELETE FROM multiplayer_rooms 
  WHERE status = 'finished' 
    AND updated_at < now() - interval '30 days';
    
  -- Clean up abandoned games older than 24 hours
  DELETE FROM multiplayer_rooms 
  WHERE status IN ('waiting', 'playing')
    AND updated_at < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql;
```

### Client Optimization
```typescript
class PollingOptimizer {
  private pollInterval = 2000; // Start with 2 seconds
  private maxInterval = 10000;  // Max 10 seconds
  private minInterval = 1000;   // Min 1 second
  
  adjustPollingRate(roomActivity: 'high' | 'medium' | 'low') {
    switch (roomActivity) {
      case 'high':   // Active game
        this.pollInterval = this.minInterval;
        break;
      case 'medium': // Waiting for players
        this.pollInterval = 3000;
        break;
      case 'low':    // Inactive room
        this.pollInterval = this.maxInterval;
        break;
    }
  }
  
  // Exponential backoff on errors
  handlePollingError() {
    this.pollInterval = Math.min(this.pollInterval * 1.5, this.maxInterval);
  }
}
```

## Testing Strategy

### Database Testing
```typescript
describe('Multiplayer Database Operations', () => {
  test('should create room and add participants', async () => {
    const room = await createRoom({
      name: 'Test Room',
      maxPlayers: 4,
      hostId: 'user1'
    });
    
    await joinRoom(room.id, 'user2');
    
    const participants = await getRoomParticipants(room.id);
    expect(participants).toHaveLength(2);
  });
  
  test('should handle turn advancement correctly', async () => {
    const room = await createGameRoom(['user1', 'user2', 'user3']);
    
    await makeMove(room.id, 'user1', { type: 'play_card', cardId: 'fire-5' });
    
    const updatedRoom = await getRoomState(room.id);
    expect(updatedRoom.currentPlayerId).toBe('user2');
    expect(updatedRoom.currentTurn).toBe(1);
  });
});
```

### Load Testing
```typescript
// Simulate 100 concurrent games
async function loadTest() {
  const rooms = await Promise.all(
    Array(100).fill(0).map(() => createTestRoom())
  );
  
  // Simulate moves in all rooms
  await Promise.all(
    rooms.map(room => simulateGameplay(room.id, 1000)) // 1000 moves per game
  );
}
```

## Deployment

### Database Setup
```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set up row level security
ALTER TABLE multiplayer_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_moves ENABLE ROW LEVEL SECURITY;

-- Policies for multiplayer tables
CREATE POLICY "Players can read rooms they're in"
  ON multiplayer_rooms FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT room_id FROM room_participants 
      WHERE player_id = auth.uid()
    )
  );
```

### Monitoring
```typescript
// Database monitoring queries
const monitoringQueries = {
  activeRooms: `
    SELECT COUNT(*) as active_rooms 
    FROM multiplayer_rooms 
    WHERE status IN ('waiting', 'playing')
  `,
  
  averageGameDuration: `
    SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_duration
    FROM multiplayer_rooms 
    WHERE status = 'finished'
      AND updated_at > now() - interval '24 hours'
  `,
  
  playerActivity: `
    SELECT COUNT(DISTINCT player_id) as active_players
    FROM room_participants 
    WHERE joined_at > now() - interval '1 hour'
  `
};
```

## Roadmap

### Phase 1: Core Turn-Based Multiplayer (Q1 2025)
- [ ] Database schema implementation
- [ ] Basic room system with polling
- [ ] Turn management and validation
- [ ] Simple matchmaking

### Phase 2: Enhanced Features (Q2 2025)
- [ ] Async gameplay (extended turn times)
- [ ] Tournament bracket system
- [ ] Spectator mode via database
- [ ] Mobile app optimization

### Phase 3: Advanced Features (Q3 2025)
- [ ] Skill-based matchmaking
- [ ] Replay system from move history
- [ ] Advanced statistics and analytics
- [ ] Custom game modes

### Phase 4: Community Features (Q4 2025)
- [ ] Friend systems and private matches
- [ ] Guilds and team tournaments
- [ ] Leaderboards and seasons
- [ ] Achievement system

## Contributing to Multiplayer

### Development Setup
```bash
# Clone and setup
git clone https://github.com/yourusername/boltis.git
cd boltis
npm install

# Setup Supabase for multiplayer testing
cp .env.example .env
# Add your Supabase credentials

# Run multiplayer migrations
npx supabase db reset
npx supabase db push

# Start development with multiplayer features
npm run dev
```

### Testing Multiplayer Features
```bash
# Run multiplayer-specific tests
npm run test:multiplayer

# Test database functions
npm run test:db

# Load testing
npm run test:load
```

## Limitations & Considerations

### Current Limitations
- **Turn-based only**: No real-time simultaneous actions
- **Polling latency**: 1-2 second delay for state updates
- **Database load**: Frequent polling may impact performance
- **Offline play**: Requires internet connection for multiplayer

### Future Improvements
- **WebSocket upgrade**: Consider WebSockets for lower latency
- **Push notifications**: Mobile notifications for turn alerts
- **Offline sync**: Queue moves when offline, sync when online
- **Edge caching**: Cache game state closer to users

## Support

For multiplayer-specific questions and issues:
- **GitHub Issues**: Tag with `multiplayer` label
- **Email**: multiplayer@theras.xyz
- **Documentation**: This file and inline code comments

---

*This document reflects the database-driven, turn-based approach to BOLTIS multiplayer using Supabase as a persistent storage solution.*