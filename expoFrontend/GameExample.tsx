/**
 * Example: Integrating Game Room with React Native
 * 
 * This file demonstrates how to use the useGameRoom hook
 * to build real-time multiplayer screens
 */

import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { useGameRoom } from './useGameRoom';
import { SCENES, DIRECTOR_STYLES } from './types';

export function GameExample() {
  const [playerName, setPlayerName] = useState('');
  const [sessionIdInput, setSessionIdInput] = useState('');
  
  const {
    gameState,
    isConnected,
    error,
    createMyLobby,
    joinLobby,
    changeName,
    startGame,
    selectScene,
    selectDirectorStyle,
    markReady,
    submitRating,
    voteToContinue,
    canStartGame,
    isActor,
    isDirector,
    isViewer,
  } = useGameRoom({
    onError: (err) => {
      console.error('Game error:', err.message);
      alert(err.message);
    }
  });

  // ===== LANDING SCREEN =====
  if (!isConnected) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Studio Lucho</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Enter your name..."
          value={playerName}
          onChangeText={setPlayerName}
        />
        
        <Pressable 
          style={styles.button}
          onPress={() => createMyLobby(playerName)}
        >
          <Text style={styles.buttonText}>CREATE MY LOBBY</Text>
        </Pressable>
        
        <TextInput
          style={styles.input}
          placeholder="Session ID (e.g., ABC123)"
          value={sessionIdInput}
          onChangeText={setSessionIdInput}
        />
        
        <Pressable 
          style={styles.button}
          onPress={() => joinLobby(sessionIdInput, playerName)}
        >
          <Text style={styles.buttonText}>JOIN LOBBY</Text>
        </Pressable>
        
        {error && <Text style={styles.error}>{error.message}</Text>}
      </View>
    );
  }

  if (!gameState) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // ===== LOBBY SCREEN =====
  if (gameState.phase === 'lobby') {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Lobby</Text>
        <Text style={styles.sessionId}>Session: {gameState.sessionId}</Text>
        
        <Text style={styles.subtitle}>Players ({Object.keys(gameState.players).length}):</Text>
        {Object.values(gameState.players).map(player => (
          <Text key={player.id} style={styles.playerName}>
            • {player.name}
          </Text>
        ))}
        
        {canStartGame() && (
          <Pressable style={styles.button} onPress={startGame}>
            <Text style={styles.buttonText}>START GAME</Text>
          </Pressable>
        )}
        
        {!canStartGame() && (
          <Text style={styles.subtitle}>Need at least 2 players to start</Text>
        )}
      </View>
    );
  }

  // ===== ACTOR SELECTING SCENE =====
  if (gameState.phase === 'actor-selecting') {
    if (isActor()) {
      return (
        <View style={styles.container}>
          <Text style={styles.header}>You Are The Actor! 🎭</Text>
          <Text style={styles.subtitle}>Choose your scene:</Text>
          
          {SCENES.map(scene => (
            <Pressable
              key={scene.id}
              style={styles.option}
              onPress={() => selectScene(scene.id)}
            >
              <Text style={styles.optionText}>
                {scene.emoji} {scene.title}
              </Text>
              <Text style={styles.optionSubtext}>{scene.subtitle}</Text>
            </Pressable>
          ))}
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <Text style={styles.header}>Actor is choosing a scene...</Text>
          <Text style={styles.subtitle}>
            {gameState.currentRound && 
              gameState.players[gameState.currentRound.actorId]?.name} is selecting
          </Text>
        </View>
      );
    }
  }

  // ===== DIRECTOR SELECTING STYLE =====
  if (gameState.phase === 'director-selecting') {
    if (isDirector()) {
      return (
        <View style={styles.container}>
          <Text style={styles.header}>You Are The Director! 🎬</Text>
          <Text style={styles.subtitle}>Direct the scene as:</Text>
          
          {DIRECTOR_STYLES.map(style => (
            <Pressable
              key={style.id}
              style={styles.option}
              onPress={() => selectDirectorStyle(style.id)}
            >
              <Text style={styles.optionText}>
                {style.emoji} {style.name}
              </Text>
            </Pressable>
          ))}
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <Text style={styles.header}>Director is choosing a style...</Text>
          <Text style={styles.subtitle}>
            {gameState.currentRound && 
              gameState.players[gameState.currentRound.directorId]?.name} is selecting
          </Text>
        </View>
      );
    }
  }

  // ===== PRE-ROUND (READY CHECK) =====
  if (gameState.phase === 'pre-round') {
    const round = gameState.currentRound!;
    const scene = SCENES.find(s => s.id === round.sceneId);
    const style = DIRECTOR_STYLES.find(s => s.id === round.directorStyleId);
    
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Round Ready!</Text>
        
        <Text style={styles.info}>
          🎭 Actor: {gameState.players[round.actorId]?.name}
        </Text>
        <Text style={styles.info}>
          📜 Scene: {scene?.title} - {scene?.subtitle}
        </Text>
        <Text style={styles.info}>
          🎬 Director: {gameState.players[round.directorId]?.name}
        </Text>
        <Text style={styles.info}>
          🎨 Style: {style?.name}
        </Text>
        
        {(isActor() || isDirector()) && (
          <Pressable style={styles.button} onPress={markReady}>
            <Text style={styles.buttonText}>▶ START ROUND</Text>
          </Pressable>
        )}
        
        {isViewer() && (
          <Text style={styles.subtitle}>
            Waiting for Actor & Director to start...
          </Text>
        )}
      </View>
    );
  }

  // ===== ROUND ACTIVE =====
  if (gameState.phase === 'round-active') {
    const round = gameState.currentRound!;
    const elapsed = round.startTime ? Math.floor((Date.now() - round.startTime) / 1000) : 0;
    const remaining = Math.max(0, 300 - elapsed);
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    
    return (
      <View style={styles.container}>
        <Text style={styles.header}>🎬 Round In Progress</Text>
        <Text style={styles.timer}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </Text>
        
        <Text style={styles.info}>
          Actor: {gameState.players[round.actorId]?.name}
        </Text>
        <Text style={styles.info}>
          Director: {gameState.players[round.directorId]?.name}
        </Text>
        
        <Text style={styles.subtitle}>🎭 Performance happening...</Text>
      </View>
    );
  }

  // ===== RATING PHASE =====
  if (gameState.phase === 'rating') {
    const [stars, setStars] = useState(0);
    const [tags, setTags] = useState<string[]>([]);
    
    if (isViewer()) {
      return (
        <View style={styles.container}>
          <Text style={styles.header}>Rate the Performance</Text>
          
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map(star => (
              <Pressable key={star} onPress={() => setStars(star)}>
                <Text style={[styles.star, stars >= star && styles.starActive]}>
                  ⭐
                </Text>
              </Pressable>
            ))}
          </View>
          
          <Pressable
            style={styles.button}
            onPress={() => submitRating(stars, tags)}
          >
            <Text style={styles.buttonText}>SUBMIT</Text>
          </Pressable>
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <Text style={styles.header}>Waiting for ratings...</Text>
        </View>
      );
    }
  }

  // ===== SCORES =====
  if (gameState.phase === 'scores') {
    const sorted = Object.values(gameState.players)
      .sort((a, b) => b.totalScore - a.totalScore);
    
    return (
      <View style={styles.container}>
        <Text style={styles.header}>🎭 League Standings</Text>
        
        <Text style={styles.subtitle}>
          Round Score: ⭐ {gameState.currentRound?.averageScore?.toFixed(1)}
        </Text>
        
        {sorted.map((player, index) => (
          <Text key={player.id} style={styles.scoreItem}>
            {index === 0 && '🥇'} {index === 1 && '🥈'} {index === 2 && '🥉'}
            {player.name}: {player.totalScore.toFixed(1)} pts
          </Text>
        ))}
      </View>
    );
  }

  // ===== CONTINUE VOTE =====
  if (gameState.phase === 'continue-vote') {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Continue Playing?</Text>
        
        <Pressable style={styles.button} onPress={() => voteToContinue(true)}>
          <Text style={styles.buttonText}>YES</Text>
        </Pressable>
        
        <Pressable style={styles.button} onPress={() => voteToContinue(false)}>
          <Text style={styles.buttonText}>NO</Text>
        </Pressable>
        
        <Text style={styles.subtitle}>
          Votes: {gameState.continueVotes.length} / {Object.keys(gameState.players).length}
        </Text>
      </View>
    );
  }

  // ===== GAME OVER =====
  if (gameState.phase === 'game-over') {
    const sorted = Object.values(gameState.players)
      .sort((a, b) => b.totalScore - a.totalScore);
    
    return (
      <View style={styles.container}>
        <Text style={styles.header}>🏆 Final Standings</Text>
        
        {sorted.map((player, index) => (
          <Text key={player.id} style={styles.scoreItem}>
            {index === 0 && '🥇'} {index === 1 && '🥈'} {index === 2 && '🥉'}
            {player.name}: {player.totalScore.toFixed(1)} pts
          </Text>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Unknown phase: {gameState.phase}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0f0a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#D4A574',
    marginBottom: 30,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4A574',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#C9A875',
    marginBottom: 15,
  },
  sessionId: {
    fontSize: 18,
    color: '#D4A574',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(45, 24, 16, 0.6)',
    borderWidth: 1,
    borderColor: '#8B7355',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#F5E6D3',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#D4A574',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a0f0a',
  },
  playerName: {
    fontSize: 16,
    color: '#F5E6D3',
    marginBottom: 8,
  },
  option: {
    width: '100%',
    backgroundColor: 'rgba(212, 165, 116, 0.2)',
    borderWidth: 2,
    borderColor: '#8B7355',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  optionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F5E6D3',
  },
  optionSubtext: {
    fontSize: 14,
    color: '#C9A875',
  },
  info: {
    fontSize: 16,
    color: '#F5E6D3',
    marginBottom: 10,
  },
  timer: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#D4A574',
    marginVertical: 20,
  },
  stars: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 20,
  },
  star: {
    fontSize: 40,
    opacity: 0.3,
  },
  starActive: {
    opacity: 1,
  },
  scoreItem: {
    fontSize: 18,
    color: '#F5E6D3',
    marginBottom: 12,
  },
  error: {
    fontSize: 14,
    color: '#ff6b6b',
    marginTop: 20,
  },
});
