# Lucho Party Game - Expo App Implementation Plan

## Project Structure

```
app/
├── src/
│   ├── theme.ts ✅ (DONE)
│   ├── styles.ts ✅ (DONE)
│   ├── types.ts (Game data types, player roles, etc.)
│   │
│   ├── components/ (Reusable UI components)
│   │   ├── Button.tsx ✅ (DONE - Primary/Secondary buttons)
│   │   ├── Card.tsx ✅ (DONE - Card wrapper)
│   │   ├── LongPressWrapper.tsx (Wrapper for "next screen" long-press)
│   │   ├── PlayerAvatar.tsx (Round avatar with emoji/initials)
│   │   ├── StarRating.tsx (Interactive 1-5 star selector)
│   │   ├── Tag.tsx (Selectable emotion tags)
│   │   ├── RadioOption.tsx (Scene/director selection cards)
│   │   ├── QRPlaceholder.tsx (Mock QR code display)
│   │   ├── Timer.tsx (Countdown timer display)
│   │   └── ScoreItem.tsx (Leaderboard row with medal)
│   │
│   ├── screens/ (13 screens matching UX flow)
│   │   ├── 01_LandingScreen.tsx
│   │   ├── 02_SessionCreatedScreen.tsx
│   │   ├── 03_EnterNameScreen.tsx
│   │   ├── 04_LobbyScreen.tsx
│   │   ├── 05_ActorChoosesSceneScreen.tsx
│   │   ├── 06_DirectorChoosesStyleScreen.tsx
│   │   ├── 07_PreRoundViewersScreen.tsx
│   │   ├── 08_PreRoundActorDirectorScreen.tsx
│   │   ├── 09A_ActiveRoundViewersScreen.tsx
│   │   ├── 09B_ActiveRoundActorScreen.tsx
│   │   ├── 09C_ActiveRoundDirectorScreen.tsx
│   │   ├── 10_TimeUpScreen.tsx
│   │   ├── 11_RatingScreen.tsx
│   │   ├── 12_LeagueScoresScreen.tsx
│   │   └── 13_GameOverScreen.tsx
│   │
│   ├── data/
│   │   ├── scenes.ts (Romeo & Juliet, Hamlet, Macbeth, etc.)
│   │   ├── directors.ts (Tarantino, Wes Anderson, Nolan, etc.)
│   │   ├── tags.ts (Emotion tags for ratings)
│   │   └── mockPlayers.ts (Alice, Bob, Charlie, Dana)
│   │
│   └── navigation/
│       └── AppNavigator.tsx (Stack navigator with all screens)
│
├── App.tsx (Main entry point)
└── package.json
```

## Screen Implementation Details

### 1. LandingScreen
- **Elements**: 
  - Title "Lucho Party Game" (serif, gold)
  - 🎭 Large emoji icon
  - "CREATE SESSION" button (primary)
  - "JOIN SESSION" button (secondary)
- **Interaction**: Buttons navigate to next screen
- **Long-press**: → SessionCreatedScreen

### 2. SessionCreatedScreen  
- **Elements**:
  - "Session Created!" header
  - QR code placeholder (mock)
  - "Show this to other players to let them join!" text
  - Session ID: ABC-123
- **Interaction**: QR can be tapped (visual feedback)
- **Long-press**: → EnterNameScreen

### 3. EnterNameScreen
- **Elements**:
  - "Choose Your Name" header
  - Text input field (warm themed)
  - "CONTINUE" button
- **Interaction**: Input updates state, button becomes active when filled
- **Long-press**: → LobbyScreen

### 4. LobbyScreen
- **Elements**:
  - "Green Room" header
  - Player list (Alice, Bob, Charlie, You - Dana)
  - Small QR code
  - "START GAME" button (host only)
- **Interaction**: Players animate in, button has hover effect
- **Long-press**: → ActorChoosesSceneScreen

### 5. ActorChoosesSceneScreen
- **Elements**:
  - "You Are The Actor! 🎭" header
  - "Choose your scene:" subtitle
  - Radio options:
    - 📜 Romeo & Juliet - Balcony Scene
    - 💀 Hamlet - To be or not to be
    - ⚔️ Macbeth - Dagger speech
    - 🌟 Star Wars - I am your father
    - 🎬 The Godfather - Offer scene
  - "CONFIRM" button
- **Interaction**: Selecting option highlights it, button activates
- **Long-press**: → DirectorChoosesStyleScreen

### 6. DirectorChoosesStyleScreen
- **Elements**:
  - "You Are The Director! 🎬" header
  - "Direct the scene as:" subtitle
  - Radio options:
    - 🔪 Quentin Tarantino
    - 🎨 Wes Anderson
    - 🌀 Christopher Nolan
    - 🦇 Tim Burton
    - 🐦 Alfred Hitchcock
  - "CONFIRM" button
- **Interaction**: Same as actor screen
- **Long-press**: → PreRoundViewersScreen

### 7. PreRoundViewersScreen
- **Elements**:
  - "Round Ready!" header
  - Info cards:
    - 🎭 Actor: Alice | Scene: Romeo & Juliet - Balcony Scene
    - 🎬 Director: Bob | Style: Wes Anderson
  - "Waiting for Actor & Director to start..."
- **Interaction**: Info cards can be tapped (subtle animation)
- **Long-press**: → PreRoundActorDirectorScreen

### 8. PreRoundActorDirectorScreen
- **Elements**: Same as viewers but with:
  - "(YOU)" indicator on actor
  - "▶ START ROUND" button (green, prominent)
- **Interaction**: Button pulses/glows
- **Long-press**: → ActiveRoundViewersScreen

### 9A. ActiveRoundViewersScreen
- **Elements**:
  - "🎬 Round In Progress" header
  - Timer: 3:47 (large, centered)
  - Info cards: Actor, Director, Scene
  - 🎭 emoji
  - "Performance happening..." italic text
- **Interaction**: Timer can count down (or stay static)
- **Long-press**: → ActiveRoundActorScreen

### 9B. ActiveRoundActorScreen
- **Elements**:
  - "🎭 ACTOR - Romeo & Juliet" header
  - Timer: 3:47
  - Scrollable script box:
    - BALCONY SCENE header
    - Stage directions [in brackets, italics]
    - Dialogue lines
  - Footer: "Director: Bob (Wes Anderson)"
- **Interaction**: Script is scrollable
- **Long-press**: → ActiveRoundDirectorScreen

### 9C. ActiveRoundDirectorScreen
- **Elements**:
  - "🎬 DIRECTOR - Wes Anderson" header
  - Timer: 3:47
  - Scrollable guidance box:
    - "DIRECTING AS WES ANDERSON"
    - 🎨 Visual Style notes
    - 🎭 Performance notes
    - 📐 Composition notes
    - 💡 Key Direction
  - Footer: "Actor: Alice - Romeo & Juliet"
- **Interaction**: Guidance is scrollable
- **Long-press**: → TimeUpScreen

### 10. TimeUpScreen
- **Elements**:
  - 🎉 emoji (huge)
  - "TIME'S UP!" header (large)
  - "Great performance!"
  - "Now it's time to rate..."
- **Interaction**: Emojis can bounce/animate
- **Long-press**: → RatingScreen

### 11. RatingScreen
- **Elements**:
  - "Rate the Performance" header
  - Info: Actor & Director names
  - "How was it?" text
  - Star rating (1-5, interactive)
  - "Add tags (pick all that apply):" text
  - Tag pills (8 emotion tags, multi-select):
    - 😂 Hilarious
    - 🔥 Intense
    - 🎨 Creative
    - 💯 On Point
    - 😱 Dramatic
    - 🤯 Mind-Blowing
    - 😬 Awkward
    - 👏 Authentic
  - "SUBMIT" button
- **Interaction**: 
  - Stars fill/unfill on tap
  - Tags toggle selected state
  - Button activates after star selection
- **Long-press**: → LeagueScoresScreen

### 12. LeagueScoresScreen
- **Elements**:
  - "🎭 Actor/Director League" header
  - "This Round: ⭐ 4.2" card
  - "⚠️ All scores decay -5% per round" warning
  - "League Standings:" subtitle
  - Leaderboard with medals:
    - 🥇 Charlie - 39.9 pts (42 → -5% decay)
    - 🥈 Alice - 38.5 pts (+4.2 -5%)
    - 🥉 Bob - 35.5 pts (+4.2 -5%)
    - Dana - 29.5 pts (31 → -5% decay)
  - "Ready for next round?" text
  - "NEXT ROUND" button (green)
  - "END GAME" button (secondary)
  - "⏱️ Auto-start in: 15s" countdown
- **Interaction**:
  - Leaderboard animates positions
  - Buttons have press states
  - Countdown ticks down
- **Long-press**: → GameOverScreen

### 13. GameOverScreen
- **Elements**:
  - "🏆 Final League Standings" header
  - "Great performances, everyone! 🎭" subtitle
  - Final leaderboard:
    - 🥇 Charlie - 87.3 pts (gold gradient)
    - 🥈 Alice - 76.1 pts (silver gradient)
    - 🥉 Bob - 71.8 pts (bronze gradient)
    - Dana - 68.5 pts
  - Info box: "League System: Scores decay -5% each round..."
  - "🎉 One more round!" button
  - "EXIT" button (secondary)
- **Interaction**:
  - Confetti animation (optional)
  - Medal rows have shine effect
- **Long-press**: → LandingScreen (loop back to start)

## Component Implementation Order

### Phase 1: Foundation (3 components)
1. **LongPressWrapper.tsx** - Core navigation mechanism
2. **PlayerAvatar.tsx** - Used in lobby and scores
3. **QRPlaceholder.tsx** - Used in session/lobby

### Phase 2: Input Components (3 components)
4. **RadioOption.tsx** - Scene/director selection
5. **StarRating.tsx** - Rating screen
6. **Tag.tsx** - Rating tags

### Phase 3: Display Components (3 components)
7. **Timer.tsx** - Active round screens
8. **ScoreItem.tsx** - Leaderboards
9. **InfoCard.tsx** - Pre-round and active round info

## Navigation Setup

```typescript
// AppNavigator.tsx
type RootStackParamList = {
  Landing: undefined;
  SessionCreated: undefined;
  EnterName: undefined;
  Lobby: undefined;
  ActorChoosesScene: undefined;
  DirectorChoosesStyle: undefined;
  PreRoundViewers: undefined;
  PreRoundActorDirector: undefined;
  ActiveRoundViewers: undefined;
  ActiveRoundActor: undefined;
  ActiveRoundDirector: undefined;
  TimeUp: undefined;
  Rating: undefined;
  LeagueScores: undefined;
  GameOver: undefined;
};

// Screen order for long-press navigation:
const screenOrder = [
  'Landing',
  'SessionCreated',
  'EnterName',
  'Lobby',
  'ActorChoosesScene',
  'DirectorChoosesStyle',
  'PreRoundViewers',
  'PreRoundActorDirector',
  'ActiveRoundViewers',
  'ActiveRoundActor',
  'ActiveRoundDirector',
  'TimeUp',
  'Rating',
  'LeagueScores',
  'GameOver',
  // Loop back to Landing
];
```

## Mock Data Files

### scenes.ts
```typescript
export const scenes = [
  { id: 1, title: 'Romeo & Juliet', subtitle: 'Balcony Scene', emoji: '📜', script: '...' },
  { id: 2, title: 'Hamlet', subtitle: 'To be or not to be', emoji: '💀', script: '...' },
  // ... etc
];
```

### directors.ts
```typescript
export const directors = [
  { id: 1, name: 'Quentin Tarantino', emoji: '🔪', guidance: '...' },
  { id: 2, name: 'Wes Anderson', emoji: '🎨', guidance: '...' },
  // ... etc
];
```

### tags.ts
```typescript
export const emotionTags = [
  { id: 1, label: 'Hilarious', emoji: '😂' },
  { id: 2, label: 'Intense', emoji: '🔥' },
  // ... etc
];
```

### mockPlayers.ts
```typescript
export const mockPlayers = [
  { id: 1, name: 'Alice', initials: 'AL', color: '#D4A574' },
  { id: 2, name: 'Bob', initials: 'BO', color: '#C9A875' },
  { id: 3, name: 'Charlie', initials: 'CH', color: '#8B7355' },
  { id: 4, name: 'Dana', initials: 'DA', color: '#F5E6D3', isYou: true },
];
```

## Implementation Steps

### Step 1: Complete Foundation
- [ ] LongPressWrapper component
- [ ] Navigation setup (AppNavigator)
- [ ] Mock data files

### Step 2: Build Screens 1-4 (Session Flow)
- [ ] LandingScreen
- [ ] SessionCreatedScreen
- [ ] EnterNameScreen
- [ ] LobbyScreen

### Step 3: Build Screens 5-8 (Setup Flow)
- [ ] ActorChoosesSceneScreen + RadioOption component
- [ ] DirectorChoosesStyleScreen
- [ ] PreRoundViewersScreen
- [ ] PreRoundActorDirectorScreen

### Step 4: Build Screens 9-11 (Performance Flow)
- [ ] ActiveRound screens (A, B, C) + Timer component
- [ ] TimeUpScreen
- [ ] RatingScreen + StarRating + Tag components

### Step 5: Build Screens 12-13 (Results Flow)
- [ ] LeagueScoresScreen + ScoreItem component
- [ ] GameOverScreen

### Step 6: Polish & Sync
- [ ] Test complete flow
- [ ] Sync all screens with design/ux-flow.html
- [ ] Add subtle animations
- [ ] Test on Expo Go

## Estimated File Count
- **Screens**: 15 files
- **Components**: 12 files  
- **Data**: 4 files
- **Navigation/Config**: 3 files
- **Total**: ~34 new files

## Priority Order for Implementation

If building incrementally:

**High Priority (MVP to see flow):**
1. LongPressWrapper
2. Navigation setup
3. Landing → SessionCreated → EnterName → Lobby (4 screens)
4. One selection screen (Actor or Director)
5. One result screen (League Scores or Game Over)

**Medium Priority (Complete flow):**
6. All remaining screens
7. Interactive components (stars, tags, radio)

**Low Priority (Polish):**
8. Animations and transitions
9. Sound effects (optional)
10. Haptic feedback

Would you like me to:
- **A**: Start with High Priority MVP (5-6 screens, working flow)?
- **B**: Build everything in phases following the plan above?
- **C**: Focus on specific screens you want to see first?
