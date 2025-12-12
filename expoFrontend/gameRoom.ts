/**
 * Game Room Manager
 * Handles all game state management and Redis synchronization
 */

import Redis from 'ioredis';
import { config } from './config';
import type {
  GameState,
  Player,
  Round,
  Rating,
  ContinueVote,
  SelectionState,
  GamePhase,
} from './types';

const SCORE_DECAY_RATE = 0.05; // 5% decay per round
const ROUND_DURATION = 300; // 5 minutes in seconds
const CONTINUE_VOTE_TIMEOUT = 30; // 30 seconds to vote

export class GameRoom {
  private redis: Redis;
  private sessionId: string;
  private playerId: string;
  private subscribers: Map<string, (state: GameState) => void> = new Map();

  constructor(sessionId: string, playerId: string) {
    this.redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      username: config.redis.username,
      tls: config.redis.tls ? {} : undefined,
      db: config.redis.db,
    });

    this.sessionId = sessionId;
    this.playerId = playerId;

    // Subscribe to game state changes
    this.subscribeToChanges();
  }

  // ===== SESSION MANAGEMENT =====

  /**
   * Create your own lobby (everyone starts here)
   */
  async createMyLobby(playerName: string): Promise<GameState> {
    const player: Player = {
      id: this.playerId,
      name: playerName,
      joinedAt: Date.now(),
      connectionStatus: 'connected',
      currentRole: 'none',
      totalScore: 0,
    };

    const gameState: GameState = {
      sessionId: this.sessionId,
      phase: 'lobby',
      players: {
        [this.playerId]: player,
      },
      currentRound: null,
      roundHistory: [],
      continueVotes: [],
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };

    await this.saveGameState(gameState);
    return gameState;
  }

  /**
   * Join someone else's lobby by scanning their QR code
   */
  async joinLobby(playerName: string): Promise<GameState | null> {
    const gameState = await this.getGameState();
    
    if (!gameState) {
      return null;
    }

    // Can only join during lobby phase
    if (gameState.phase !== 'lobby') {
      throw new Error('Game already in progress');
    }

    const player: Player = {
      id: this.playerId,
      name: playerName,
      joinedAt: Date.now(),
      connectionStatus: 'connected',
      currentRole: 'none',
      totalScore: 0,
    };

    gameState.players[this.playerId] = player;
    gameState.lastActivity = Date.now();

    await this.saveGameState(gameState);
    await this.publishStateChange('player-joined', { playerId: this.playerId, playerName });

    return gameState;
  }

  /**
   * Change your name at any time (during lobby or game)
   */
  async changeName(newName: string): Promise<void> {
    const gameState = await this.getGameState();
    
    if (!gameState || !gameState.players[this.playerId]) {
      throw new Error('Not in a lobby');
    }

    gameState.players[this.playerId].name = newName;
    gameState.lastActivity = Date.now();

    await this.saveGameState(gameState);
    await this.publishStateChange('player-name-changed', { playerId: this.playerId, newName });
  }

  /**
   * Leave session (disconnect)
   */
  async leaveSession(): Promise<void> {
    const gameState = await this.getGameState();
    
    if (!gameState || !gameState.players[this.playerId]) {
      return;
    }

    gameState.players[this.playerId].connectionStatus = 'disconnected';
    gameState.lastActivity = Date.now();

    await this.saveGameState(gameState);
    await this.publishStateChange('player-left', { playerId: this.playerId });
  }

  // ===== GAME FLOW =====

  /**
   * Start the game (any player can start, or auto-start with consensus)
   */
  async startGame(): Promise<void> {
    const gameState = await this.getGameState();
    
    if (!gameState) {
      throw new Error('Game state not found');
    }

    const player = gameState.players[this.playerId];
    if (!player) {
      throw new Error('Player not found in lobby');
    }

    if (gameState.phase !== 'lobby') {
      throw new Error('Game already started');
    }

    const playerIds = Object.keys(gameState.players);
    if (playerIds.length < 2) {
      throw new Error('Need at least 2 players');
    }

    // Select random actor
    const actorId = this.selectRandomPlayer(playerIds, []);
    
    // Initialize round
    const round: Round = {
      roundNumber: gameState.roundHistory.length + 1,
      actorId,
      directorId: '', // Will be selected after scene choice
      sceneId: '',
      directorStyleId: '',
      ratings: [],
    };

    // Update player roles
    Object.values(gameState.players).forEach(p => {
      p.currentRole = p.id === actorId ? 'actor' : 'none';
    });

    gameState.currentRound = round;
    gameState.phase = 'actor-selecting';
    gameState.lastActivity = Date.now();

    await this.saveGameState(gameState);
    await this.publishStateChange('game-started', { actorId });
  }

  /**
   * Actor selects a scene
   */
  async selectScene(sceneId: string): Promise<void> {
    const gameState = await this.getGameState();
    
    if (!gameState || !gameState.currentRound) {
      throw new Error('No active round');
    }

    if (gameState.phase !== 'actor-selecting') {
      throw new Error('Not in actor selection phase');
    }

    if (gameState.currentRound.actorId !== this.playerId) {
      throw new Error('Only actor can select scene');
    }

    gameState.currentRound.sceneId = sceneId;

    // Select random director (excluding actor)
    const playerIds = Object.keys(gameState.players);
    const directorId = this.selectRandomPlayer(playerIds, [gameState.currentRound.actorId]);
    gameState.currentRound.directorId = directorId;

    // Update player roles
    Object.values(gameState.players).forEach(p => {
      if (p.id === directorId) {
        p.currentRole = 'director';
      } else if (p.id !== gameState.currentRound!.actorId) {
        p.currentRole = 'viewer';
      }
    });

    gameState.phase = 'director-selecting';
    gameState.lastActivity = Date.now();

    await this.saveGameState(gameState);
    await this.publishStateChange('scene-selected', { sceneId, directorId });
  }

  /**
   * Director selects a style
   */
  async selectDirectorStyle(styleId: string): Promise<void> {
    const gameState = await this.getGameState();
    
    if (!gameState || !gameState.currentRound) {
      throw new Error('No active round');
    }

    if (gameState.phase !== 'director-selecting') {
      throw new Error('Not in director selection phase');
    }

    if (gameState.currentRound.directorId !== this.playerId) {
      throw new Error('Only director can select style');
    }

    gameState.currentRound.directorStyleId = styleId;
    gameState.phase = 'pre-round';
    gameState.lastActivity = Date.now();

    // Initialize selection state for ready check
    await this.saveSelectionState({
      actorId: gameState.currentRound.actorId,
      directorId: gameState.currentRound.directorId,
      selectedSceneId: gameState.currentRound.sceneId,
      selectedStyleId: styleId,
      actorReady: false,
      directorReady: false,
    });

    await this.saveGameState(gameState);
    await this.publishStateChange('style-selected', { styleId });
  }

  /**
   * Actor or Director marks themselves as ready
   */
  async markReady(): Promise<void> {
    const gameState = await this.getGameState();
    
    if (!gameState || !gameState.currentRound) {
      throw new Error('No active round');
    }

    if (gameState.phase !== 'pre-round') {
      throw new Error('Not in pre-round phase');
    }

    const isActor = gameState.currentRound.actorId === this.playerId;
    const isDirector = gameState.currentRound.directorId === this.playerId;

    if (!isActor && !isDirector) {
      throw new Error('Only actor or director can mark ready');
    }

    const selectionState = await this.getSelectionState();
    if (!selectionState) {
      throw new Error('Selection state not found');
    }

    if (isActor) {
      selectionState.actorReady = true;
    } else {
      selectionState.directorReady = true;
    }

    await this.saveSelectionState(selectionState);

    // If both ready, start round
    if (selectionState.actorReady && selectionState.directorReady) {
      await this.startRound();
    } else {
      await this.publishStateChange('ready-marked', { playerId: this.playerId });
    }
  }

  /**
   * Start the round timer
   */
  private async startRound(): Promise<void> {
    const gameState = await this.getGameState();
    
    if (!gameState || !gameState.currentRound) {
      throw new Error('No active round');
    }

    gameState.currentRound.startTime = Date.now();
    gameState.phase = 'round-active';
    gameState.lastActivity = Date.now();

    await this.saveGameState(gameState);
    await this.publishStateChange('round-started', { 
      startTime: gameState.currentRound.startTime,
      duration: ROUND_DURATION 
    });

    // Schedule round end
    setTimeout(() => {
      this.endRound();
    }, ROUND_DURATION * 1000);
  }

  /**
   * End the round
   */
  private async endRound(): Promise<void> {
    const gameState = await this.getGameState();
    
    if (!gameState || !gameState.currentRound) {
      return;
    }

    if (gameState.phase !== 'round-active') {
      return;
    }

    gameState.currentRound.endTime = Date.now();
    gameState.phase = 'round-ended';
    gameState.lastActivity = Date.now();

    await this.saveGameState(gameState);
    await this.publishStateChange('round-ended', {});

    // Auto-transition to rating after 5 seconds
    setTimeout(() => {
      this.transitionToRating();
    }, 5000);
  }

  /**
   * Transition to rating phase
   */
  private async transitionToRating(): Promise<void> {
    const gameState = await this.getGameState();
    
    if (!gameState) {
      return;
    }

    if (gameState.phase !== 'round-ended') {
      return;
    }

    gameState.phase = 'rating';
    gameState.lastActivity = Date.now();

    await this.saveGameState(gameState);
    await this.publishStateChange('rating-started', {});
  }

  /**
   * Submit a rating (viewers only)
   */
  async submitRating(stars: number, tags: string[]): Promise<void> {
    const gameState = await this.getGameState();
    
    if (!gameState || !gameState.currentRound) {
      throw new Error('No active round');
    }

    if (gameState.phase !== 'rating') {
      throw new Error('Not in rating phase');
    }

    const player = gameState.players[this.playerId];
    if (!player || player.currentRole !== 'viewer') {
      throw new Error('Only viewers can rate');
    }

    // Check if already rated
    const existingRating = gameState.currentRound.ratings.find(r => r.playerId === this.playerId);
    if (existingRating) {
      throw new Error('Already rated this round');
    }

    const rating: Rating = {
      playerId: this.playerId,
      stars,
      tags,
    };

    gameState.currentRound.ratings.push(rating);
    gameState.lastActivity = Date.now();

    await this.saveGameState(gameState);
    await this.publishStateChange('rating-submitted', { playerId: this.playerId });

    // Check if all viewers have rated
    const viewerCount = Object.values(gameState.players).filter(p => p.currentRole === 'viewer').length;
    if (gameState.currentRound.ratings.length === viewerCount) {
      await this.calculateScores();
    }
  }

  /**
   * Calculate scores and update league standings
   */
  private async calculateScores(): Promise<void> {
    const gameState = await this.getGameState();
    
    if (!gameState || !gameState.currentRound) {
      return;
    }

    const round = gameState.currentRound;

    // Calculate average rating
    const totalStars = round.ratings.reduce((sum, r) => sum + r.stars, 0);
    const averageScore = round.ratings.length > 0 ? totalStars / round.ratings.length : 0;
    round.averageScore = averageScore;

    // Apply decay to all players
    Object.values(gameState.players).forEach(player => {
      player.totalScore = player.totalScore * (1 - SCORE_DECAY_RATE);
    });

    // Add new score to actor and director
    const actor = gameState.players[round.actorId];
    const director = gameState.players[round.directorId];
    
    if (actor) {
      actor.totalScore += averageScore;
    }
    if (director) {
      director.totalScore += averageScore;
    }

    // Move round to history
    gameState.roundHistory.push(round);
    gameState.currentRound = null;

    gameState.phase = 'scores';
    gameState.lastActivity = Date.now();

    await this.saveGameState(gameState);
    await this.publishStateChange('scores-calculated', { averageScore });

    // Auto-transition to continue vote after 10 seconds
    setTimeout(() => {
      this.transitionToContinueVote();
    }, 10000);
  }

  /**
   * Transition to continue vote phase
   */
  private async transitionToContinueVote(): Promise<void> {
    const gameState = await this.getGameState();
    
    if (!gameState) {
      return;
    }

    if (gameState.phase !== 'scores') {
      return;
    }

    gameState.phase = 'continue-vote';
    gameState.continueVotes = [];
    gameState.lastActivity = Date.now();

    await this.saveGameState(gameState);
    await this.publishStateChange('continue-vote-started', {});

    // Auto-continue after timeout
    setTimeout(() => {
      this.processContinueVote();
    }, CONTINUE_VOTE_TIMEOUT * 1000);
  }

  /**
   * Vote to continue or end game
   */
  async voteToContinue(vote: boolean): Promise<void> {
    const gameState = await this.getGameState();
    
    if (!gameState) {
      throw new Error('Game state not found');
    }

    if (gameState.phase !== 'continue-vote') {
      throw new Error('Not in voting phase');
    }

    // Check if already voted
    const existingVote = gameState.continueVotes.find(v => v.playerId === this.playerId);
    if (existingVote) {
      // Update existing vote
      existingVote.vote = vote;
      existingVote.timestamp = Date.now();
    } else {
      const continueVote: ContinueVote = {
        playerId: this.playerId,
        vote,
        timestamp: Date.now(),
      };
      gameState.continueVotes.push(continueVote);
    }

    gameState.lastActivity = Date.now();

    await this.saveGameState(gameState);
    await this.publishStateChange('vote-submitted', { playerId: this.playerId, vote });

    // Check if all players have voted
    const playerCount = Object.keys(gameState.players).length;
    if (gameState.continueVotes.length === playerCount) {
      await this.processContinueVote();
    }
  }

  /**
   * Process continue votes and determine next phase
   */
  private async processContinueVote(): Promise<void> {
    const gameState = await this.getGameState();
    
    if (!gameState) {
      return;
    }

    if (gameState.phase !== 'continue-vote') {
      return;
    }

    const yesVotes = gameState.continueVotes.filter(v => v.vote).length;
    const totalVotes = gameState.continueVotes.length;
    const playerCount = Object.keys(gameState.players).length;

    // Continue if majority voted yes OR if timeout and no votes
    const shouldContinue = yesVotes > totalVotes / 2 || totalVotes === 0;

    if (shouldContinue) {
      // Start new round
      const playerIds = Object.keys(gameState.players);
      const actorId = this.selectRandomPlayer(playerIds, []);
      
      const round: Round = {
        roundNumber: gameState.roundHistory.length + 1,
        actorId,
        directorId: '',
        sceneId: '',
        directorStyleId: '',
        ratings: [],
      };

      // Update player roles
      Object.values(gameState.players).forEach(p => {
        p.currentRole = p.id === actorId ? 'actor' : 'none';
      });

      gameState.currentRound = round;
      gameState.phase = 'actor-selecting';
      gameState.continueVotes = [];
      gameState.lastActivity = Date.now();

      await this.saveGameState(gameState);
      await this.publishStateChange('new-round-started', { actorId });
    } else {
      // Game over
      gameState.phase = 'game-over';
      gameState.lastActivity = Date.now();

      await this.saveGameState(gameState);
      await this.publishStateChange('game-over', {});
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Select a random player excluding specified players
   */
  private selectRandomPlayer(playerIds: string[], exclude: string[]): string {
    const available = playerIds.filter(id => !exclude.includes(id));
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  }

  /**
   * Get game state from Redis
   */
  async getGameState(): Promise<GameState | null> {
    const key = `game:${this.sessionId}:state`;
    const data = await this.redis.get(key);
    
    if (!data) {
      return null;
    }

    return JSON.parse(data);
  }

  /**
   * Save game state to Redis
   */
  private async saveGameState(state: GameState): Promise<void> {
    const key = `game:${this.sessionId}:state`;
    await this.redis.set(key, JSON.stringify(state));
    
    // Set expiry to 24 hours
    await this.redis.expire(key, 86400);
  }

  /**
   * Get selection state
   */
  private async getSelectionState(): Promise<SelectionState | null> {
    const key = `game:${this.sessionId}:selection`;
    const data = await this.redis.get(key);
    
    if (!data) {
      return null;
    }

    return JSON.parse(data);
  }

  /**
   * Save selection state
   */
  private async saveSelectionState(state: SelectionState): Promise<void> {
    const key = `game:${this.sessionId}:selection`;
    await this.redis.set(key, JSON.stringify(state));
    
    // Set expiry to 1 hour
    await this.redis.expire(key, 3600);
  }

  /**
   * Publish state change event
   */
  private async publishStateChange(event: string, data: any): Promise<void> {
    const channel = `game:${this.sessionId}:events`;
    await this.redis.publish(channel, JSON.stringify({ event, data, timestamp: Date.now() }));
  }

  /**
   * Subscribe to state changes
   */
  private async subscribeToChanges(): Promise<void> {
    const subscriber = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      username: config.redis.username,
      tls: config.redis.tls ? {} : undefined,
      db: config.redis.db,
    });

    const channel = `game:${this.sessionId}:events`;
    await subscriber.subscribe(channel);

    subscriber.on('message', async (ch, message) => {
      if (ch === channel) {
        const { event, data } = JSON.parse(message);
        
        // Reload game state and notify subscribers
        const gameState = await this.getGameState();
        if (gameState) {
          this.subscribers.forEach(callback => callback(gameState));
        }
      }
    });
  }

  /**
   * Register a callback for state changes
   */
  onStateChange(id: string, callback: (state: GameState) => void): void {
    this.subscribers.set(id, callback);
  }

  /**
   * Unregister a state change callback
   */
  offStateChange(id: string): void {
    this.subscribers.delete(id);
  }

  /**
   * Cleanup connections
   */
  async disconnect(): Promise<void> {
    await this.leaveSession();
    await this.redis.quit();
  }

  /**
   * Generate a random session ID
   */
  static generateSessionId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate a random player ID
   */
  static generatePlayerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
