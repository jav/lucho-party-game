# Peer-to-Peer Lobby System

## Overview

The Lucho Party Game uses a **peer-to-peer lobby model** where every player starts in their own lobby and can invite others to join by sharing a QR code or lobby ID.

## Key Differences from Host-Based Model

### ❌ Old Host-Based Model
- One person creates, others join
- Only host can start game
- Clear hierarchy (host vs. players)

### ✅ New Peer-to-Peer Model
- **Everyone starts in their own lobby**
- **Any player can start when 2+ people present**
- **No special "host" permissions**
- **Names can be changed anytime**

## Player Flow

### 1. App Launch - Everyone Starts in Their Own Lobby

```
┌─────────────────────────────────────┐
│      🎭 Studio Lucho                │
├─────────────────────────────────────┤
│                                     │
│   Welcome!                          │
│                                     │
│   ┌─────────────────────────┐      │
│   │ Your Name:              │      │
│   │ [Alice____________]     │      │
│   └─────────────────────────┘      │
│                                     │
│   ┌───────────────────────┐        │
│   │  CREATE MY LOBBY      │        │
│   └───────────────────────┘        │
│   Creates lobby ABC123              │
│                                     │
│   OR                                │
│                                     │
│   ┌─────────────────────────┐      │
│   │ Join Code:              │      │
│   │ [DEF456_______]         │      │
│   └─────────────────────────┘      │
│                                     │
│   ┌───────────────────────┐        │
│   │   JOIN LOBBY          │        │
│   └───────────────────────┘        │
│   Scan QR or enter code             │
│                                     │
└─────────────────────────────────────┘
```

**Implementation:**
```typescript
// Everyone creates their own lobby first
const { createMyLobby } = useGameRoom();
await createMyLobby('Alice');

// Generates unique session ID (e.g., ABC123)
// Alice is now in lobby ABC123 alone
```

### 2. Alice's Lobby (Solo)

```
┌─────────────────────────────────────┐
│      🎭 Lobby ABC123                │
├─────────────────────────────────────┤
│                                     │
│   Your Name: [Alice_____] ✏️        │
│   (tap to edit anytime)             │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                     │
│   Share to invite players:          │
│                                     │
│   ┌─────────────┐                   │
│   │  QR CODE    │                   │
│   │  [ABC123]   │ ← Others scan     │
│   └─────────────┘                   │
│                                     │
│   Code: ABC123 📋 (tap to copy)     │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                     │
│   Players in lobby: 1               │
│   • Alice (You)                     │
│                                     │
│   Need at least 2 players to start  │
│                                     │
└─────────────────────────────────────┘
```

### 3. Bob Scans Alice's QR Code

Bob opens the app and instead of creating his lobby, he:
1. Scans Alice's QR code (or enters ABC123)
2. Gets added to lobby ABC123
3. Both Alice and Bob see the update instantly

```typescript
// Bob's action
const { joinLobby } = useGameRoom();
await joinLobby('ABC123', 'Bob');

// Bob joins Alice's lobby ABC123
```

### 4. Multi-Player Lobby (ABC123)

**Alice sees:**
```
┌─────────────────────────────────────┐
│      🎭 Lobby ABC123                │
├─────────────────────────────────────┤
│                                     │
│   Your Name: [Alice_____] ✏️        │
│                                     │
│   ┌─────────────┐                   │
│   │  QR CODE    │                   │
│   │  [ABC123]   │                   │
│   └─────────────┘                   │
│   Code: ABC123 📋                    │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                     │
│   Players in lobby: 2               │
│   • Alice (You)                     │
│   • Bob ← Just joined!              │
│                                     │
│   ┌───────────────────────┐         │
│   │  🎬 START GAME        │ ← Now enabled!
│   └───────────────────────┘         │
│                                     │
└─────────────────────────────────────┘
```

**Bob sees:**
```
┌─────────────────────────────────────┐
│      🎭 Lobby ABC123                │
├─────────────────────────────────────┤
│                                     │
│   Your Name: [Bob_______] ✏️        │
│                                     │
│   ┌─────────────┐                   │
│   │  QR CODE    │  ← Bob can also   │
│   │  [ABC123]   │    share now      │
│   └─────────────┘                   │
│   Code: ABC123 📋                    │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                     │
│   Players in lobby: 2               │
│   • Alice                           │
│   • Bob (You)                       │
│                                     │
│   ┌───────────────────────┐         │
│   │  🎬 START GAME        │ ← Bob can start too!
│   └───────────────────────┘         │
│                                     │
└─────────────────────────────────────┘
```

## Key Features

### 1. Name Editing Anytime

```typescript
const { changeName } = useGameRoom();

// During lobby
await changeName('Alice the Great');

// Even during game!
await changeName('Alice the Magnificent');
```

**UI:**
```
Your Name: [Alice_____________] ✏️
           ↑ Always editable
```

When someone changes their name:
- Update happens in real-time via Redis Pub/Sub
- All players see the change instantly
- Works even mid-game

### 2. Anyone Can Start

No special "host" privilege. Game starts when:
- 2+ players in lobby
- ANY player presses START

```typescript
const { canStartGame, startGame } = useGameRoom();

// Check if allowed to start
if (canStartGame()) {
  await startGame(); // Works for anyone!
}
```

**Logic:**
```typescript
canStartGame() {
  // True if in lobby with 2+ players
  return (
    gameState.phase === 'lobby' &&
    Object.keys(gameState.players).length >= 2
  );
}
```

### 3. Lobby Ownership is Shared

Once you join a lobby, you can:
- ✅ Share the QR code to invite others
- ✅ Start the game (if 2+ players)
- ✅ Change your name anytime
- ✅ See all players in real-time

You cannot:
- ❌ Kick other players (no hierarchy)
- ❌ Close the lobby (it persists 24h)
- ❌ Transfer "ownership" (concept doesn't exist)

## Technical Implementation

### Data Structure Changes

**Before (Host-Based):**
```typescript
interface Player {
  id: string;
  name: string;
  isHost: boolean;  // ← Special privilege
  // ...
}
```

**After (Peer-to-Peer):**
```typescript
interface Player {
  id: string;
  name: string;
  joinedAt: number;  // ← Just for ordering
  // ...
}
```

### API Changes

**Before:**
```typescript
createSession(hostName)  // Create as host
joinSession(sessionId)   // Join as regular player
isHost()                 // Check if you're special
```

**After:**
```typescript
createMyLobby(playerName)  // Everyone creates their own
joinLobby(sessionId)       // Join someone else's lobby
changeName(newName)        // Edit name anytime
canStartGame()             // Check if game can start
```

### Redis Events

New event added:
```
player-name-changed → Broadcast when someone changes name
```

Example:
```json
{
  "event": "player-name-changed",
  "data": {
    "playerId": "player_123",
    "newName": "Alice the Great"
  },
  "timestamp": 1702391234567
}
```

## User Stories

### Story 1: Alice Creates, Bob Joins

1. **Alice:** Opens app → Creates lobby (ABC123)
2. **Alice:** Shows QR code to Bob
3. **Bob:** Opens app → Scans Alice's QR
4. **Bob:** Joins lobby ABC123
5. **Both:** See each other in player list
6. **Either:** Can press START to begin

### Story 2: Mid-Lobby Name Change

1. **Charlie:** In lobby with Alice and Bob
2. **Charlie:** Realizes name is boring
3. **Charlie:** Taps name field → Types "Charlie Chaplin"
4. **Everyone:** Sees update instantly
5. **Charlie:** Much happier now

### Story 3: Three-Way Lobby Merge

1. **Alice:** Creates lobby ABC123, invites Bob
2. **Charlie:** Creates lobby DEF456, invites Dana
3. **Dana:** "Wait, let's all play together!"
4. **Dana:** Scans Alice's QR code (ABC123)
5. **Charlie:** "I'll join too!" → Scans Alice's QR
6. **Result:** All 4 in lobby ABC123
   - Alice, Bob (already there)
   - Dana, Charlie (just joined)
   - DEF456 now empty (auto-expires in 24h)

## Design Rationale

### Why Peer-to-Peer?

**1. More Social**
- No awkward "who's the host?" moment
- Anyone can invite friends
- Feels collaborative, not hierarchical

**2. Flexible**
- Multiple people can share QR codes
- No single point of failure
- Works for distributed groups

**3. Simpler UX**
- One consistent flow: "create your lobby, share it"
- No role confusion
- Everyone has the same capabilities

### Why Allow Name Changes?

**1. Theatrical Nature**
- Players might want stage names
- Encourages playfulness
- "Alice" → "Alice the Magnificent Actress" is fun

**2. Practicality**
- Fix typos anytime
- Accommodate nickname changes mid-game
- No penalty for quick thinking

**3. Real-Time Spirit**
- Everything else updates live, why not names?
- Shows off the tech
- Delightful when you see it happen

## Example Implementation

Complete lobby component:

```typescript
function LobbyScreen() {
  const {
    gameState,
    createMyLobby,
    joinLobby,
    changeName,
    canStartGame,
    startGame,
  } = useGameRoom();

  const [nameInput, setNameInput] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  if (!gameState) {
    // Initial screen
    return (
      <View>
        <TextInput
          placeholder="Your name"
          value={nameInput}
          onChangeText={setNameInput}
        />
        <Pressable onPress={() => createMyLobby(nameInput)}>
          <Text>CREATE MY LOBBY</Text>
        </Pressable>
        <TextInput placeholder="Join code" />
        <Pressable onPress={() => joinLobby(code, nameInput)}>
          <Text>JOIN LOBBY</Text>
        </Pressable>
      </View>
    );
  }

  // In lobby
  const currentPlayer = gameState.players[playerId];

  return (
    <View>
      <Text>Lobby {gameState.sessionId}</Text>
      
      {/* Editable name */}
      <TextInput
        value={currentPlayer.name}
        onChangeText={changeName}
        placeholder="Your name"
      />
      
      {/* QR code */}
      <QRCode value={`lucho://join/${gameState.sessionId}`} />
      
      {/* Player list */}
      {Object.values(gameState.players).map(player => (
        <Text key={player.id}>
          • {player.name} {player.id === playerId && '(You)'}
        </Text>
      ))}
      
      {/* Start button (anyone can press) */}
      {canStartGame() && (
        <Pressable onPress={startGame}>
          <Text>START GAME</Text>
        </Pressable>
      )}
    </View>
  );
}
```

## Edge Cases

### What if two people create lobbies separately?

They stay separate until someone joins the other:
- Alice creates ABC123 (alone)
- Bob creates DEF456 (alone)
- If they want to play together, one scans the other's QR
- The scanner abandons their lobby and joins the other's

### Can you "steal" players from another lobby?

No. Players are in one lobby at a time:
- Alice in ABC123
- Bob shares DEF456 QR with Alice
- Alice must explicitly join DEF456
- This disconnects Alice from ABC123

### What happens to empty lobbies?

Auto-expire after 24 hours (Redis TTL):
- Alice creates ABC123
- Everyone joins DEF456 instead
- ABC123 sits empty
- After 24h, Redis deletes ABC123
- No manual cleanup needed

## Future Enhancements

### Possible Features
- [ ] Lobby discovery (browse active lobbies)
- [ ] Invite links (web deep links)
- [ ] Lobby passwords (for private games)
- [ ] Player profiles (avatars, stats)
- [ ] Lobby chat (pre-game banter)

### Not Planned
- ❌ Host privileges (goes against peer-to-peer ethos)
- ❌ Lobby voting/consensus (too complex for party game)
- ❌ Player kicking (creates drama)
