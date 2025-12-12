# Game Room Logic

This document explains the architecture and implementation of the Lucho Party Game's real-time multiplayer game room system.

## Architecture Overview

The game room system consists of three main components:

1. **Types** (`types.ts`) - TypeScript type definitions for all game entities
2. **GameRoom** (`gameRoom.ts`) - Core game state management and Redis synchronization
3. **useGameRoom Hook** (`useGameRoom.ts`) - React integration layer

## Data Flow

```
Player Action → useGameRoom Hook → GameRoom Class → Redis
                                                       ↓
                                            Redis Pub/Sub
                                                       ↓
                                    All Connected Clients
                                                       ↓
                                              Update UI
```

## State Management

### Game State Structure

```typescript
GameState {
  sessionId: string               // 6-character session code
  phase: GamePhase               // Current game phase
  players: Record<id, Player>    // All players in session
  currentRound: Round | null     // Active round data
  roundHistory: Round[]          // Completed rounds
  continueVotes: ContinueVote[]  // Votes to continue/end
  createdAt: number              // Timestamp
  lastActivity: number           // Last interaction timestamp
}
```

### Game Phases

1. **`lobby`** - Players joining, waiting for host to start
2. **`actor-selecting`** - Random actor choosing a scene
3. **`director-selecting`** - Random director choosing a style
4. **`pre-round`** - Waiting for actor & director to mark ready
5. **`round-active`** - 5-minute performance timer running
6. **`round-ended`** - Round finished, brief notification
7. **`rating`** - Viewers rating the performance
8. **`scores`** - Displaying league standings with decay
9. **`continue-vote`** - Players voting to continue or end
10. **`game-over`** - Final scores, option to play again

## Key Features

### 1. Session Management

#### Creating a Session
```typescript
const gameRoom = new GameRoom(sessionId, playerId);
await gameRoom.createSession(hostName);
```

- Generates 6-character session ID
- Creates host as first player
- Initializes game state in Redis
- Returns QR-scannable session code

#### Joining a Session
```typescript
await gameRoom.joinSession(playerName);
```

- Can only join during `lobby` phase
- Creates new player entry
- Broadcasts join event to all clients
- Real-time updates player list

### 2. Role Assignment

#### Actor Selection
- **Trigger**: Game start or new round
- **Logic**: Random selection from all players
- **Exclusions**: None

#### Director Selection
- **Trigger**: After actor selects scene
- **Logic**: Random selection excluding current actor
- **Exclusions**: Current actor

#### Viewer Assignment
- **Trigger**: After director selected
- **Logic**: All players except actor and director
- **Role**: Rate performance at end

### 3. Round Flow

#### Pre-Round Synchronization
```typescript
// Actor or director marks ready
await gameRoom.markReady();

// Round starts when BOTH ready
if (actorReady && directorReady) {
  startRound();
}
```

- Both actor and director must press START
- Uses temporary `SelectionState` in Redis
- Prevents premature round start

#### Round Timer
- **Duration**: 300 seconds (5 minutes)
- **Sync**: Server-side timer with broadcast
- **Auto-end**: Automatic transition to rating phase
- **Implementation**:
  ```typescript
  setTimeout(() => {
    this.endRound();
  }, ROUND_DURATION * 1000);
  ```

### 4. Scoring System

#### Rating Collection
```typescript
await gameRoom.submitRating(stars, tags);
```

- **Who**: Viewers only (not actor/director)
- **Stars**: 1-5 integer
- **Tags**: Array of emotional tags
- **Validation**: Can't rate twice, must be viewer

#### Score Calculation
```typescript
// Average all viewer ratings
const averageScore = totalStars / ratingCount;

// Apply -5% decay to ALL players
player.totalScore *= (1 - SCORE_DECAY_RATE);

// Add new score to actor and director
actor.totalScore += averageScore;
director.totalScore += averageScore;
```

**Why decay?** Prevents runaway leads, rewards consistent high performance.

### 5. Continue/End Voting

#### Vote Collection
```typescript
await gameRoom.voteToContinue(true);  // Yes
await gameRoom.voteToContinue(false); // No
```

- **Timeout**: 30 seconds
- **Auto-continue**: If timeout with no votes
- **Majority Rule**: Continue if >50% vote yes
- **All-voted**: Immediate transition if everyone votes

#### Decision Logic
```typescript
const shouldContinue = 
  yesVotes > totalVotes / 2 || // Majority yes
  totalVotes === 0;             // Timeout

if (shouldContinue) {
  startNewRound();
} else {
  endGame();
}
```

## Redis Data Structure

### Keys Used

```
game:{sessionId}:state       // Main game state (JSON)
game:{sessionId}:selection   // Selection state (JSON, temp)
game:{sessionId}:events      // Pub/Sub channel
```

### Expiry Times

- **State**: 24 hours (86400s)
- **Selection**: 1 hour (3600s)
- **Events**: No expiry (channel)

### Pub/Sub Events

Published events trigger UI updates across all clients:

```typescript
// Event structure
{
  event: string,           // Event name
  data: any,              // Event-specific data
  timestamp: number       // Event time
}
```

**Events emitted**:
- `player-joined`
- `player-left`
- `game-started`
- `scene-selected`
- `style-selected`
- `ready-marked`
- `round-started`
- `round-ended`
- `rating-started`
- `rating-submitted`
- `scores-calculated`
- `continue-vote-started`
- `vote-submitted`
- `new-round-started`
- `game-over`

## React Integration

### Basic Usage

```typescript
import { useGameRoom } from './useGameRoom';

function GameComponent() {
  const {
    gameState,
    isConnected,
    createSession,
    joinSession,
    selectScene,
    isActor,
    isDirector,
  } = useGameRoom();

  // Create new session
  const handleCreate = async () => {
    await createSession('Alice');
  };

  // Join existing session
  const handleJoin = async () => {
    await joinSession('ABC123', 'Bob');
  };

  // Actor selects scene
  const handleSceneSelect = async (sceneId: string) => {
    if (isActor()) {
      await selectScene(sceneId);
    }
  };

  // Render based on phase
  if (!gameState) return <Loading />;
  
  switch (gameState.phase) {
    case 'lobby':
      return <LobbyScreen />;
    case 'actor-selecting':
      return isActor() ? <SelectSceneScreen /> : <WaitingScreen />;
    // ... etc
  }
}
```

### State Change Subscription

The hook automatically subscribes to Redis pub/sub and updates `gameState` on any change:

```typescript
// Internal implementation
gameRoom.onStateChange('main', (state) => {
  setGameState(state);
});
```

## Error Handling

All async methods throw errors that can be caught:

```typescript
const { error, onError } = useGameRoom({
  onError: (err) => {
    console.error('Game error:', err.message);
  }
});

// Or handle individually
try {
  await startGame();
} catch (err) {
  alert(err.message);
}
```

**Common errors**:
- `"Game state not found"` - Invalid session ID
- `"Only host can start game"` - Permission denied
- `"Game already in progress"` - Can't join mid-game
- `"Not in {phase} phase"` - Invalid action for current phase
- `"Only {role} can {action}"` - Role mismatch

## Performance Considerations

### Redis Optimization

1. **Connection Pooling**: Each GameRoom instance has dedicated connection
2. **Expiry**: Auto-cleanup of old sessions
3. **Pub/Sub**: Efficient broadcast to all clients
4. **JSON Storage**: Compact serialization

### React Optimization

1. **useCallback**: Memoized action functions
2. **useRef**: Stable references across renders
3. **Conditional Subscriptions**: Only active when connected

### Network Efficiency

- **Minimal Polling**: Pub/sub for real-time updates
- **Delta Updates**: Not implemented (future optimization)
- **Compression**: Not implemented (future optimization)

## Testing Strategy

### Unit Tests (TODO)

```typescript
describe('GameRoom', () => {
  it('should create session', async () => {
    const room = new GameRoom(sessionId, playerId);
    const state = await room.createSession('Alice');
    expect(state.phase).toBe('lobby');
    expect(state.players[playerId].isHost).toBe(true);
  });

  it('should select random actor', async () => {
    // Add multiple players
    // Start game
    // Verify actor selected
  });

  it('should apply score decay', async () => {
    // Set initial scores
    // Complete round
    // Verify 5% decay applied
  });
});
```

### Integration Tests (TODO)

- Multi-client session joining
- Full round flow end-to-end
- Disconnection/reconnection
- Timer accuracy

## Future Enhancements

### Short-term
- [ ] Reconnection logic (preserve player ID across refresh)
- [ ] Spectator mode (join mid-game as viewer only)
- [ ] Custom scenes/styles (user-submitted content)
- [ ] Chat messages during performance

### Long-term
- [ ] Video/audio integration
- [ ] Recording and playback
- [ ] Tournament brackets
- [ ] Achievements and badges
- [ ] Player profiles and stats

## Deployment Checklist

Before deploying to production:

1. ✅ Configure Redis credentials in `config.ts`
2. ✅ Test with multiple clients
3. ✅ Verify timer synchronization
4. ✅ Test disconnection scenarios
5. ✅ Load test with 10+ players
6. ✅ Monitor Redis memory usage
7. ✅ Set up error tracking (Sentry, etc.)
8. ✅ Configure CORS for API endpoints
9. ✅ Set up SSL/TLS for production Redis

## Troubleshooting

### "Connection refused" errors
- Check Redis host/port in config.ts
- Verify Redis password is correct
- Ensure TLS is enabled for cloud instances

### Players not seeing updates
- Check Redis pub/sub working
- Verify subscription channel matches
- Check for JavaScript errors in console

### Timer drift
- Verify server time synchronization
- Use server timestamps, not client time
- Consider NTP for server

### Score calculation incorrect
- Verify decay rate (5% = 0.05)
- Check floating-point precision
- Ensure ratings are integers 1-5

## Credits

Designed and implemented for Studio Lucho Party Game.
Redis-based architecture for real-time multiplayer gaming.
