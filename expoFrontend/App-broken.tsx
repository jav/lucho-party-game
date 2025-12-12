import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, Animated } from 'react-native';

export default function App() {
  const [screen, setScreen] = useState(1);
  const [playerName, setPlayerName] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [selectedStars, setSelectedStars] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    if (screen >= 8 && screen <= 10 && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setScreen(11);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [screen, timeLeft]);

  useEffect(() => {
    if (screen === 11) {
      const autoAdvance = setTimeout(() => {
        setScreen(12);
      }, 5000);
      return () => clearTimeout(autoAdvance);
    }
  }, [screen]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  if (screen === 1) {
    return (
      <Pressable style={styles.container} onPress={() => setScreen(2)}>
        <Text style={styles.title}>Studio Lucho</Text>
        <Text style={styles.emoji}>🎭</Text>
        <Text style={styles.subtitle}>
          Theatrical improvisation meets competitive league play
        </Text>
        <StatusBar style="light" />
      </Pressable>
    );
  }

  if (screen === 2) {
    return (
      <Pressable style={styles.container} onPress={() => setScreen(3)}>
        <View style={styles.gameRoom}>
          <Text style={styles.helpText}>
            Everyone needs to be in the same game!
          </Text>
          
          <View style={styles.gameNameSection}>
            <Text style={styles.gameLabel}>Your Game:</Text>
            <Text style={styles.gameName}>Dramatic Badger</Text>
          </View>
          
          <View style={styles.qrCode}>
            <Text style={styles.qrPlaceholder}>▦</Text>
            <Text style={styles.qrLabel}>Scan to join</Text>
          </View>
          
          <TextInput
            style={styles.nameInput}
            placeholder="Enter your name..."
            placeholderTextColor="#8B7355"
            value={playerName}
            onChangeText={setPlayerName}
          />
          
          <View style={styles.scanButton}>
            <Text style={styles.scanButtonText}>SCAN QR CODE</Text>
          </View>
        </View>
        <StatusBar style="light" />
      </Pressable>
    );
  }

  if (screen === 3) {
    return (
      <View style={styles.container}>
        <Text style={styles.lobbyHeader}>Green Room</Text>
        
        <View style={styles.playerList}>
          <Text style={styles.playerListTitle}>Players in session:</Text>
          <View style={styles.playerItem}>
            <Text style={styles.playerName}>Alice</Text>
          </View>
          <View style={styles.playerItem}>
            <Text style={styles.playerName}>Bob</Text>
          </View>
          <View style={styles.playerItem}>
            <Text style={styles.playerName}>Charlie</Text>
          </View>
          <View style={[styles.playerItem, styles.playerItemYou]}>
            <Text style={styles.playerName}>You ({playerName || 'Dana'})</Text>
          </View>
        </View>
        
        <View style={styles.qrCodeSmall}>
          <Text style={styles.qrPlaceholderSmall}>▦</Text>
        </View>
        
        <Pressable onPress={() => setScreen(4)}>
          <Animated.View style={[
            styles.startButton,
            { transform: [{ scale: pulseAnim }] }
          ]}>
            <Text style={styles.startButtonText}>START GAME</Text>
          </Animated.View>
        </Pressable>
        
        <StatusBar style="light" />
      </View>
    );
  }

  if (screen === 4) {
    return (
      <Pressable style={styles.actorScreen} onPress={() => setScreen(5)}>
        <Text style={styles.roleHeader}>You Are The Actor! 🎭</Text>
        <Text style={styles.roleSubtitle}>Choose your scene:</Text>
        
        <View style={styles.sceneOption}>
          <Text style={styles.sceneTitle}>📜 Romeo & Juliet</Text>
          <Text style={styles.sceneSubtitle}>Balcony Scene</Text>
        </View>
        
        <View style={[styles.sceneOption, styles.sceneOptionSelected]}>
          <Text style={styles.sceneTitle}>💀 Hamlet</Text>
          <Text style={styles.sceneSubtitle}>To be or not to be</Text>
        </View>
        
        <View style={styles.sceneOption}>
          <Text style={styles.sceneTitle}>⚔️ Macbeth</Text>
          <Text style={styles.sceneSubtitle}>Dagger speech</Text>
        </View>
        
        <View style={styles.sceneOption}>
          <Text style={styles.sceneTitle}>🌟 Star Wars</Text>
          <Text style={styles.sceneSubtitle}>I am your father</Text>
        </View>
        
        <View style={styles.confirmButton}>
          <Text style={styles.confirmButtonText}>CONFIRM</Text>
        </View>
        
        <StatusBar style="light" />
      </Pressable>
    );
  }

  if (screen === 5) {
    return (
      <Pressable style={styles.directorScreen} onPress={() => setScreen(6)}>
        <Text style={styles.roleHeader}>You Are The Director! 🎬</Text>
        <Text style={styles.roleSubtitle}>Direct the scene as:</Text>
        
        <View style={styles.directorOption}>
          <Text style={styles.directorName}>🔪 Quentin Tarantino</Text>
        </View>
        
        <View style={[styles.directorOption, styles.directorOptionSelected]}>
          <Text style={styles.directorName}>🎨 Wes Anderson</Text>
        </View>
        
        <View style={styles.directorOption}>
          <Text style={styles.directorName}>🌀 Christopher Nolan</Text>
        </View>
        
        <View style={styles.directorOption}>
          <Text style={styles.directorName}>🦇 Tim Burton</Text>
        </View>
        
        <View style={styles.directorOption}>
          <Text style={styles.directorName}>🐦 Alfred Hitchcock</Text>
        </View>
        
        <View style={styles.confirmButton}>
          <Text style={styles.confirmButtonText}>CONFIRM</Text>
        </View>
        
        <StatusBar style="light" />
      </Pressable>
    );
  }

  if (screen === 6) {
    // Screen 6: Viewers Waiting
    return (
      <Pressable style={styles.readyScreen} onPress={() => setScreen(7)}>
        <Text style={styles.readyHeader}>Round Ready!</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>🎭 ACTOR</Text>
          <Text style={styles.infoCardName}>Alice</Text>
          <Text style={styles.infoCardDetail}>Scene: Romeo & Juliet</Text>
          <Text style={styles.infoCardSubDetail}>Balcony Scene</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>🎬 DIRECTOR</Text>
          <Text style={styles.infoCardName}>Bob</Text>
          <Text style={styles.infoCardDetail}>Style: Wes Anderson</Text>
        </View>
        
        <Text style={styles.waitingText}>
          Waiting for Actor & Director to start...
        </Text>
        
        <StatusBar style="dark" />
      </Pressable>
    );
  }

  if (screen === 7) {
    // Screen 7: Ready to Start
    return (
      <View style={styles.readyStartScreen}>
        <Text style={styles.readyHeader}>Round Ready!</Text>
        
        <View style={styles.infoCardDark}>
          <Text style={styles.infoCardTitle}>🎭 ACTOR</Text>
          <Text style={styles.infoCardName}>Alice (YOU)</Text>
          <Text style={styles.infoCardDetail}>Scene: Romeo & Juliet</Text>
          <Text style={styles.infoCardSubDetail}>Balcony Scene</Text>
        </View>
        
        <View style={styles.infoCardDark}>
          <Text style={styles.infoCardTitle}>🎬 DIRECTOR</Text>
          <Text style={styles.infoCardName}>Bob</Text>
          <Text style={styles.infoCardDetail}>Style: Wes Anderson</Text>
        </View>
        
        <Pressable onPress={() => { setTimeLeft(300); setScreen(8); }}>
          <Animated.View style={[
            styles.startRoundButton,
            { transform: [{ scale: pulseAnim }] }
          ]}>
            <Text style={styles.startRoundButtonText}>▶ START ROUND</Text>
          </Animated.View>
        </Pressable>
        
        <StatusBar style="light" />
      </View>
    );
  }

  if (screen === 8) {
    // Screen 8: Viewers - Performance in Progress
    const formatTime8 = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <Pressable style={styles.performanceScreen} onPress={() => setScreen(9)}>
        <Text style={styles.performanceHeader}>🎬 Round In Progress</Text>
        <Text style={styles.timer}>{formatTime8(timeLeft)}</Text>
        
        <View style={styles.performanceCard}>
          <Text style={styles.performanceCardText}><Text style={styles.bold}>Actor:</Text> Alice</Text>
        </View>
        
        <View style={styles.performanceCard}>
          <Text style={styles.performanceCardText}><Text style={styles.bold}>Director:</Text> Bob (Wes Anderson)</Text>
        </View>
        
        <View style={styles.performanceCard}>
          <Text style={styles.performanceCardText}><Text style={styles.bold}>Scene:</Text> Romeo & Juliet</Text>
        </View>
        
        <Text style={styles.performanceEmoji}>🎭</Text>
        <Text style={styles.performanceStatus}>Performance happening...</Text>
        
        <StatusBar style="light" />
      </Pressable>
    );
  }

  if (screen === 9) {
    // Screen 9: Actor - Performance in Progress
    const formatTime9 = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <Pressable style={styles.actorPerformanceScreen} onPress={() => setScreen(10)}>
        <Text style={styles.actorPerformanceHeader}>🎭 ACTOR - Romeo & Juliet</Text>
        <Text style={styles.actorTimer}>{formatTime9(timeLeft)}</Text>
        
        <View style={styles.scriptBox}>
          <Text style={styles.scriptTitle}>BALCONY SCENE</Text>
          <Text style={styles.scriptDirection}>[Romeo stands below Juliet's balcony, gazing up]</Text>
          <Text style={styles.scriptLine}><Text style={styles.bold}>ROMEO:</Text> But soft, what light through yonder window breaks? It is the east, and Juliet is the sun.</Text>
          <Text style={styles.scriptDirection}>[Juliet appears at the window]</Text>
          <Text style={styles.scriptLine}>Arise, fair sun, and kill the envious moon, who is already sick and pale with grief...</Text>
          <Text style={styles.scriptDirection}>[Pause, look up lovingly]</Text>
          <Text style={styles.scriptLine}>O, that I were a glove upon that hand, that I might touch that cheek!</Text>
        </View>
        
        <Text style={styles.directorNote}>Director: Bob (Wes Anderson)</Text>
        
        <StatusBar style="light" />
      </Pressable>
    );
  }

  if (screen === 10) {
    // Screen 10: Director - Performance in Progress
    const formatTime10 = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePress10 = () => {
      setTimeLeft(Math.max(0, timeLeft - 15));
    };

    return (
      <Pressable style={styles.directorPerformanceScreen} onPress={handlePress10}>
        <Text style={styles.directorPerformanceHeader}>🎬 DIRECTOR - Wes Anderson</Text>
        <Text style={styles.directorTimer}>{formatTime10(timeLeft)}</Text>
        
        <View style={styles.directingBox}>
          <Text style={styles.directingTitle}>DIRECTING AS WES ANDERSON</Text>
          <Text style={styles.directingPoint}><Text style={styles.bold}>🎨 Visual Style:</Text> Everything should be perfectly symmetrical. Have the actor stand centered, facing directly forward when possible.</Text>
          <Text style={styles.directingPoint}><Text style={styles.bold}>🎭 Performance:</Text> Keep emotions understated and deadpan. Encourage precise, deliberate movements. Think quirky but controlled.</Text>
          <Text style={styles.directingPoint}><Text style={styles.bold}>📐 Composition:</Text> Use precise geometry. If they gesture, make it perpendicular or parallel to their body.</Text>
          <Text style={styles.directingPoint}><Text style={styles.bold}>💡 Key Direction:</Text> "Look directly at the camera (audience). Move in straight lines. Pause before each new thought."</Text>
        </View>
        
        <Text style={styles.actorNote}>Actor: Alice - Romeo & Juliet</Text>
        
        <StatusBar style="light" />
      </Pressable>
    );
  }

  if (screen === 11) {
    // Screen 11: Time's Up
    return (
      <Pressable style={styles.timeUpScreen} onPress={() => setScreen(12)}>
        <Text style={styles.timeUpEmoji}>🎉</Text>
        <Text style={styles.timeUpHeader}>TIME'S UP!</Text>
        <Text style={styles.timeUpSubtext}>Great performance!</Text>
        <Text style={styles.timeUpNote}>Now it's time to rate...</Text>
        
        <StatusBar style="light" />
      </Pressable>
    );
  }

  if (screen === 12) {
    // Screen 12: Rating
    const tags = [
      '😂 Hilarious', '🔥 Intense', '🎨 Creative', '💯 On Point',
      '😱 Dramatic', '🤯 Mind-Blowing', '😬 Awkward', '👏 Authentic'
    ];

    return (
      <View style={styles.ratingScreen}>
        <Text style={styles.ratingHeader}>Rate the Performance</Text>
        
        <View style={styles.ratingInfoCard}>
          <Text style={styles.ratingInfo}>🎭 Actor: Alice    🎬 Director: Bob</Text>
        </View>
        
        <View style={styles.starsSection}>
          <Text style={styles.starsPrompt}>How was it?</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map(star => (
              <Pressable key={star} onPress={() => setSelectedStars(star)}>
                <Text style={[
                  styles.star,
                  selectedStars >= star && styles.starActive
                ]}>⭐</Text>
              </Pressable>
            ))}
          </View>
        </View>
        
        <View style={styles.tagsSection}>
          <Text style={styles.tagsPrompt}>Add tags (pick all that apply):</Text>
          <View style={styles.tagsContainer}>
            {tags.map(tag => (
              <Pressable key={tag} onPress={() => toggleTag(tag)}>
                <View style={[
                  styles.tag,
                  selectedTags.includes(tag) && styles.tagSelected
                ]}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
        
        <Pressable onPress={() => setScreen(1)}>
          <Animated.View style={[
            styles.submitButton,
            { transform: [{ scale: pulseAnim }] }
          ]}>
            <Text style={styles.submitButtonText}>SUBMIT</Text>
          </Animated.View>
        </Pressable>
        
        <StatusBar style="light" />
      </View>
    );
  }

  // Fallback
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Screen {screen}</Text>
      <StatusBar style="light" />
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
    marginBottom: 20,
  },
  emoji: {
    fontSize: 80,
    marginVertical: 30,
  },
  subtitle: {
    fontSize: 16,
    color: '#C9A875',
    textAlign: 'center',
  },
  gameRoom: {
    width: '100%',
    alignItems: 'center',
  },
  helpText: {
    fontSize: 16,
    color: '#C9A875',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  gameNameSection: {
    marginVertical: 25,
    alignItems: 'center',
  },
  gameLabel: {
    fontSize: 14,
    color: '#8B7355',
    marginBottom: 8,
  },
  gameName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D4A574',
  },
  qrCode: {
    width: 140,
    height: 140,
    backgroundColor: 'rgba(212, 165, 116, 0.2)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8B7355',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  qrPlaceholder: {
    fontSize: 60,
    color: '#D4A574',
  },
  qrLabel: {
    fontSize: 13,
    color: '#C9A875',
    marginTop: 5,
  },
  nameInput: {
    width: '100%',
    backgroundColor: 'rgba(45, 24, 16, 0.6)',
    borderWidth: 1,
    borderColor: '#8B7355',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#F5E6D3',
    marginVertical: 25,
  },
  scanButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#8B7355',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 15,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C9A875',
  },
  lobbyHeader: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4A574',
    marginBottom: 30,
  },
  playerList: {
    width: '100%',
    backgroundColor: 'rgba(212, 165, 116, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  playerListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4A574',
    marginBottom: 15,
  },
  playerItem: {
    backgroundColor: 'rgba(45, 24, 16, 0.8)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  playerItemYou: {
    borderWidth: 2,
    borderColor: '#D4A574',
  },
  playerName: {
    fontSize: 16,
    color: '#F5E6D3',
  },
  qrCodeSmall: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(212, 165, 116, 0.2)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8B7355',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  qrPlaceholderSmall: {
    fontSize: 48,
    color: '#D4A574',
  },
  startButton: {
    backgroundColor: '#D4A574',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 15,
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a0f0a',
  },
  actorScreen: {
    flex: 1,
    backgroundColor: '#5a2d82',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  directorScreen: {
    flex: 1,
    backgroundColor: '#1f5a8a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  roleHeader: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  roleSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  sceneOption: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sceneOptionSelected: {
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  sceneTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sceneSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  directorOption: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  directorOptionSelected: {
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  directorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  confirmButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  readyScreen: {
    flex: 1,
    backgroundColor: '#ffecd2',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  readyStartScreen: {
    flex: 1,
    backgroundColor: '#8b5a00',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  readyHeader: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#d35400',
    marginBottom: 30,
  },
  infoCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
  },
  infoCardDark: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  infoCardName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  infoCardDetail: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 5,
  },
  infoCardSubDetail: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  waitingText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#333',
    marginTop: 30,
    opacity: 0.8,
  },
  startRoundButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 8,
    marginTop: 30,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
  },
  startRoundButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  performanceScreen: {
    flex: 1,
    backgroundColor: '#d42a6a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  performanceHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  timer: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 20,
  },
  performanceCard: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderLeftWidth: 4,
    borderLeftColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  performanceCardText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  bold: {
    fontWeight: 'bold',
  },
  performanceEmoji: {
    fontSize: 60,
    marginTop: 30,
  },
  performanceStatus: {
    fontSize: 18,
    fontStyle: 'italic',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 10,
  },
  actorPerformanceScreen: {
    flex: 1,
    backgroundColor: '#161b22',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  actorPerformanceHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 15,
  },
  actorTimer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 20,
  },
  scriptBox: {
    backgroundColor: '#0d1117',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
    width: '100%',
    maxHeight: 350,
  },
  scriptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 10,
  },
  scriptDirection: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#8b949e',
    marginBottom: 10,
  },
  scriptLine: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 12,
  },
  directorNote: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 15,
  },
  directorPerformanceScreen: {
    flex: 1,
    backgroundColor: '#161b22',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  directorPerformanceHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#58a6ff',
    marginBottom: 15,
  },
  directorTimer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#58a6ff',
    marginBottom: 20,
  },
  directingBox: {
    backgroundColor: '#0d1117',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#58a6ff',
    width: '100%',
    maxHeight: 350,
  },
  directingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#58a6ff',
    marginBottom: 10,
  },
  directingPoint: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 12,
  },
  actorNote: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 15,
  },
  timeUpScreen: {
    flex: 1,
    backgroundColor: '#0d7377',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  timeUpEmoji: {
    fontSize: 100,
    marginBottom: 20,
  },
  timeUpHeader: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  timeUpSubtext: {
    fontSize: 22,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  timeUpNote: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  ratingScreen: {
    flex: 1,
    backgroundColor: '#1f6feb',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  ratingHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  ratingInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  ratingInfo: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  starsSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  starsPrompt: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  star: {
    fontSize: 40,
    opacity: 0.3,
  },
  starActive: {
    opacity: 1,
  },
  tagsSection: {
    width: '100%',
    marginBottom: 20,
  },
  tagsPrompt: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    borderColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  tagSelected: {
    borderColor: '#FFFFFF',
  },
  tagText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 8,
    marginTop: 20,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f6feb',
  },
});
