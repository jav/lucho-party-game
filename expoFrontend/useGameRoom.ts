/**
 * React Hook for Game Room
 * Provides easy access to game state and actions
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { GameRoom } from './gameRoom';
import type { GameState } from './types';

export interface UseGameRoomOptions {
  sessionId?: string;
  playerId?: string;
  onError?: (error: Error) => void;
}

export interface UseGameRoomReturn {
  gameState: GameState | null;
  gameRoom: GameRoom | null;
  isConnected: boolean;
  error: Error | null;
  
  // Session actions
  createMyLobby: (playerName: string) => Promise<void>;
  joinLobby: (sessionId: string, playerName: string) => Promise<void>;
  leaveSession: () => Promise<void>;
  changeName: (newName: string) => Promise<void>;
  
  // Game actions
  startGame: () => Promise<void>;
  selectScene: (sceneId: string) => Promise<void>;
  selectDirectorStyle: (styleId: string) => Promise<void>;
  markReady: () => Promise<void>;
  submitRating: (stars: number, tags: string[]) => Promise<void>;
  voteToContinue: (vote: boolean) => Promise<void>;
  
  // Helpers
  getCurrentPlayer: () => any;
  canStartGame: () => boolean;
  isActor: () => boolean;
  isDirector: () => boolean;
  isViewer: () => boolean;
}

export function useGameRoom(options: UseGameRoomOptions = {}): UseGameRoomReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const sessionIdRef = useRef<string | null>(options.sessionId || null);
  const playerIdRef = useRef<string | null>(options.playerId || null);
  const gameRoomRef = useRef<GameRoom | null>(null);

  // Initialize game room
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (gameRoomRef.current) {
        gameRoomRef.current.disconnect();
      }
    };
  }, []);

  // Create your own lobby (everyone starts here)
  const createMyLobby = useCallback(async (playerName: string) => {
    try {
      setError(null);
      
      // Generate IDs if not provided
      const sessionId = GameRoom.generateSessionId();
      const playerId = playerIdRef.current || GameRoom.generatePlayerId();
      
      sessionIdRef.current = sessionId;
      playerIdRef.current = playerId;
      
      // Create game room
      const room = new GameRoom(sessionId, playerId);
      gameRoomRef.current = room;
      setGameRoom(room);
      
      // Subscribe to state changes
      room.onStateChange('main', (state) => {
        setGameState(state);
      });
      
      // Create your lobby
      const state = await room.createMyLobby(playerName);
      setGameState(state);
      setIsConnected(true);
    } catch (err) {
      const error = err as Error;
      setError(error);
      if (options.onError) {
        options.onError(error);
      }
    }
  }, [options]);

  // Join someone else's lobby
  const joinLobby = useCallback(async (sessionId: string, playerName: string) => {
    try {
      setError(null);
      
      // Generate player ID if not provided
      const playerId = playerIdRef.current || GameRoom.generatePlayerId();
      
      sessionIdRef.current = sessionId;
      playerIdRef.current = playerId;
      
      // Create game room
      const room = new GameRoom(sessionId, playerId);
      gameRoomRef.current = room;
      setGameRoom(room);
      
      // Subscribe to state changes
      room.onStateChange('main', (state) => {
        setGameState(state);
      });
      
      // Join lobby
      const state = await room.joinLobby(playerName);
      if (!state) {
        throw new Error('Lobby not found');
      }
      setGameState(state);
      setIsConnected(true);
    } catch (err) {
      const error = err as Error;
      setError(error);
      if (options.onError) {
        options.onError(error);
      }
    }
  }, [options]);

  // Change your name
  const changeName = useCallback(async (newName: string) => {
    try {
      setError(null);
      if (!gameRoomRef.current) {
        throw new Error('Not connected to a lobby');
      }
      await gameRoomRef.current.changeName(newName);
    } catch (err) {
      const error = err as Error;
      setError(error);
      if (options.onError) {
        options.onError(error);
      }
    }
  }, [options]);

  // Leave session
  const leaveSession = useCallback(async () => {
    try {
      if (gameRoomRef.current) {
        await gameRoomRef.current.leaveSession();
        await gameRoomRef.current.disconnect();
      }
      gameRoomRef.current = null;
      setGameRoom(null);
      setGameState(null);
      setIsConnected(false);
    } catch (err) {
      const error = err as Error;
      setError(error);
      if (options.onError) {
        options.onError(error);
      }
    }
  }, [options]);

  // Start game
  const startGame = useCallback(async () => {
    try {
      setError(null);
      if (!gameRoomRef.current) {
        throw new Error('Not connected to game room');
      }
      await gameRoomRef.current.startGame();
    } catch (err) {
      const error = err as Error;
      setError(error);
      if (options.onError) {
        options.onError(error);
      }
    }
  }, [options]);

  // Select scene
  const selectScene = useCallback(async (sceneId: string) => {
    try {
      setError(null);
      if (!gameRoomRef.current) {
        throw new Error('Not connected to game room');
      }
      await gameRoomRef.current.selectScene(sceneId);
    } catch (err) {
      const error = err as Error;
      setError(error);
      if (options.onError) {
        options.onError(error);
      }
    }
  }, [options]);

  // Select director style
  const selectDirectorStyle = useCallback(async (styleId: string) => {
    try {
      setError(null);
      if (!gameRoomRef.current) {
        throw new Error('Not connected to game room');
      }
      await gameRoomRef.current.selectDirectorStyle(styleId);
    } catch (err) {
      const error = err as Error;
      setError(error);
      if (options.onError) {
        options.onError(error);
      }
    }
  }, [options]);

  // Mark ready
  const markReady = useCallback(async () => {
    try {
      setError(null);
      if (!gameRoomRef.current) {
        throw new Error('Not connected to game room');
      }
      await gameRoomRef.current.markReady();
    } catch (err) {
      const error = err as Error;
      setError(error);
      if (options.onError) {
        options.onError(error);
      }
    }
  }, [options]);

  // Submit rating
  const submitRating = useCallback(async (stars: number, tags: string[]) => {
    try {
      setError(null);
      if (!gameRoomRef.current) {
        throw new Error('Not connected to game room');
      }
      await gameRoomRef.current.submitRating(stars, tags);
    } catch (err) {
      const error = err as Error;
      setError(error);
      if (options.onError) {
        options.onError(error);
      }
    }
  }, [options]);

  // Vote to continue
  const voteToContinue = useCallback(async (vote: boolean) => {
    try {
      setError(null);
      if (!gameRoomRef.current) {
        throw new Error('Not connected to game room');
      }
      await gameRoomRef.current.voteToContinue(vote);
    } catch (err) {
      const error = err as Error;
      setError(error);
      if (options.onError) {
        options.onError(error);
      }
    }
  }, [options]);

  // Helper: Get current player
  const getCurrentPlayer = useCallback(() => {
    if (!gameState || !playerIdRef.current) {
      return null;
    }
    return gameState.players[playerIdRef.current];
  }, [gameState]);

  // Helper: Can start game (any player in lobby with 2+ people)
  const canStartGame = useCallback(() => {
    if (!gameState || gameState.phase !== 'lobby') {
      return false;
    }
    const playerCount = Object.keys(gameState.players).length;
    return playerCount >= 2;
  }, [gameState]);

  // Helper: Is actor
  const isActor = useCallback(() => {
    const player = getCurrentPlayer();
    return player?.currentRole === 'actor';
  }, [getCurrentPlayer]);

  // Helper: Is director
  const isDirector = useCallback(() => {
    const player = getCurrentPlayer();
    return player?.currentRole === 'director';
  }, [getCurrentPlayer]);

  // Helper: Is viewer
  const isViewer = useCallback(() => {
    const player = getCurrentPlayer();
    return player?.currentRole === 'viewer';
  }, [getCurrentPlayer]);

  return {
    gameState,
    gameRoom,
    isConnected,
    error,
    createMyLobby,
    joinLobby,
    leaveSession,
    changeName,
    startGame,
    selectScene,
    selectDirectorStyle,
    markReady,
    submitRating,
    voteToContinue,
    getCurrentPlayer,
    canStartGame,
    isActor,
    isDirector,
    isViewer,
  };
}
