/**
 * Type definitions for Lucho Party Game
 */

export type GamePhase = 
  | 'lobby'
  | 'actor-selecting'
  | 'director-selecting'
  | 'pre-round'
  | 'round-active'
  | 'round-ended'
  | 'rating'
  | 'scores'
  | 'continue-vote'
  | 'game-over';

export type PlayerRole = 'actor' | 'director' | 'viewer' | 'none';

export interface Player {
  id: string;
  name: string;
  joinedAt: number; // Timestamp when joined this lobby
  connectionStatus: 'connected' | 'disconnected';
  currentRole: PlayerRole;
  totalScore: number;
}

export interface Scene {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  script?: string;
}

export interface DirectorStyle {
  id: string;
  name: string;
  emoji: string;
  description?: string;
  directions?: string;
}

export interface Rating {
  playerId: string;
  stars: number;
  tags: string[];
}

export interface Round {
  roundNumber: number;
  actorId: string;
  directorId: string;
  sceneId: string;
  directorStyleId: string;
  startTime?: number;
  endTime?: number;
  ratings: Rating[];
  averageScore?: number;
}

export interface ContinueVote {
  playerId: string;
  vote: boolean;
  timestamp: number;
}

export interface GameState {
  sessionId: string;
  phase: GamePhase;
  players: Record<string, Player>; // playerId -> Player
  currentRound: Round | null;
  roundHistory: Round[];
  continueVotes: ContinueVote[];
  createdAt: number;
  lastActivity: number;
}

// Selection state (transient, not in main GameState)
export interface SelectionState {
  actorId?: string;
  directorId?: string;
  selectedSceneId?: string;
  selectedStyleId?: string;
  actorReady?: boolean;
  directorReady?: boolean;
}

// Available content
export const SCENES: Scene[] = [
  {
    id: 'romeo-juliet',
    title: 'Romeo & Juliet',
    subtitle: 'Balcony Scene',
    emoji: '📜',
    script: `[Romeo stands below Juliet's balcony, gazing up]

ROMEO: But soft, what light through yonder window breaks? It is the east, and Juliet is the sun.

[Juliet appears at the window]

Arise, fair sun, and kill the envious moon, who is already sick and pale with grief...

[Pause, look up lovingly]

O, that I were a glove upon that hand, that I might touch that cheek!`,
  },
  {
    id: 'hamlet',
    title: 'Hamlet',
    subtitle: 'To be or not to be',
    emoji: '💀',
    script: `[Hamlet enters, pacing in contemplation]

HAMLET: To be, or not to be, that is the question:
Whether 'tis nobler in the mind to suffer
The slings and arrows of outrageous fortune,
Or to take arms against a sea of troubles
And by opposing end them.

[Pause, hand to head]

To die—to sleep, no more; and by a sleep to say we end
The heart-ache and the thousand natural shocks
That flesh is heir to: 'tis a consummation
Devoutly to be wish'd.`,
  },
  {
    id: 'macbeth',
    title: 'Macbeth',
    subtitle: 'Dagger speech',
    emoji: '⚔️',
    script: `[Macbeth alone, staring ahead in horror]

MACBETH: Is this a dagger which I see before me,
The handle toward my hand? Come, let me clutch thee.

[Reaches out to grasp invisible dagger]

I have thee not, and yet I see thee still.
Art thou not, fatal vision, sensible
To feeling as to sight? or art thou but
A dagger of the mind, a false creation,
Proceeding from the heat-oppressed brain?`,
  },
  {
    id: 'star-wars',
    title: 'Star Wars',
    subtitle: 'I am your father',
    emoji: '🌟',
    script: `[Luke, wounded, clings to a ledge. Darth Vader approaches]

VADER: Obi-Wan never told you what happened to your father.

LUKE: He told me enough! He told me you killed him!

VADER: No. I am your father.

[Luke shakes his head in denial]

LUKE: No. No. That's not true! That's impossible!

VADER: Search your feelings, you know it to be true!`,
  },
  {
    id: 'godfather',
    title: 'The Godfather',
    subtitle: 'Offer scene',
    emoji: '🎩',
    script: `[Don Corleone sits behind his desk, Bonasera pleads before him]

BONASERA: I believe in America. America has made my fortune. And I raised my daughter in the American fashion. I gave her freedom, but I taught her never to dishonor her family.

[The Don listens, stroking his cat]

DON CORLEONE: Why did you go to the police? Why didn't you come to me first?

BONASERA: What do you want of me? Tell me anything. But do what I beg you to do.

DON CORLEONE: Someday—and that day may never come—I'll call upon you to do a service for me. But until that day, accept this justice as a gift on my daughter's wedding day.`,
  },
];

export const DIRECTOR_STYLES: DirectorStyle[] = [
  {
    id: 'tarantino',
    name: 'Quentin Tarantino',
    emoji: '🔪',
    description: 'Stylized violence, witty dialogue, non-linear storytelling',
    directions: `🎬 TARANTINO STYLE:

🔪 Violence & Intensity: Make it stylized. Exaggerate the dramatic moments with sudden intensity.

💬 Dialogue: Encourage casual, conversational delivery even in serious moments. Add pauses for effect.

🎭 Performance: Bold, unapologetic choices. No subtlety—go big or go home.

💡 Key Direction: "Give me more energy! Make it cool. Pause before the big line. Now hit it hard!"`,
  },
  {
    id: 'anderson',
    name: 'Wes Anderson',
    emoji: '🎨',
    description: 'Symmetry, whimsy, deadpan delivery, precise composition',
    directions: `🎨 WES ANDERSON STYLE:

📐 Visual Style: Everything should be perfectly symmetrical. Have the actor stand centered, facing directly forward when possible.

🎭 Performance: Keep emotions understated and deadpan. Encourage precise, deliberate movements. Think quirky but controlled.

📏 Composition: Use precise geometry. If they gesture, make it perpendicular or parallel to their body.

💡 Key Direction: "Look directly at the camera (audience). Move in straight lines. Pause before each new thought."`,
  },
  {
    id: 'nolan',
    name: 'Christopher Nolan',
    emoji: '🌀',
    description: 'Complex narratives, time manipulation, epic scale',
    directions: `🌀 CHRISTOPHER NOLAN STYLE:

⏰ Time & Reality: Play with time. Deliver some lines slowly, others rapidly. Create a sense of disorientation.

🎭 Performance: Intense, brooding, philosophical. Every word carries weight. Make it cerebral.

🔊 Sound: Encourage projection—loud and commanding. Think IMAX scale even in a small room.

💡 Key Direction: "Bigger! More intensity! Make us question reality. Dramatic pause... now BOOM!"`,
  },
  {
    id: 'burton',
    name: 'Tim Burton',
    emoji: '🦇',
    description: 'Gothic aesthetics, quirky darkness, fantastical elements',
    directions: `🦇 TIM BURTON STYLE:

🌙 Gothic & Quirky: Embrace the weird and wonderful. Exaggerated expressions, theatrical gestures.

🎭 Performance: A mix of dark and whimsical. Think Edward Scissorhands meets Beetlejuice.

👻 Movement: Fluid, almost puppet-like movements. Contorted poses. Embrace the eerie.

💡 Key Direction: "More whimsy! Twist your body. Make it creepy but charming. Exaggerate everything!"`,
  },
  {
    id: 'hitchcock',
    name: 'Alfred Hitchcock',
    emoji: '🐦',
    description: 'Suspense, psychological tension, deliberate pacing',
    directions: `🐦 ALFRED HITCHCOCK STYLE:

😰 Suspense & Tension: Build it slowly. Long pauses. Make the audience uncomfortable.

🎭 Performance: Restrained on the surface, turmoil underneath. Show fear through small details—a trembling hand, a dart of the eyes.

⏱️ Pacing: Slow and deliberate. Every movement is calculated. The silence is as important as the words.

💡 Key Direction: "Slower... slower... now look away nervously. Hold the pause. Feel the dread."`,
  },
];

export const RATING_TAGS = [
  '😂 Hilarious',
  '🔥 Intense',
  '🎨 Creative',
  '💯 On Point',
  '😱 Dramatic',
  '🤯 Mind-Blowing',
  '😬 Awkward',
  '👏 Authentic',
];
