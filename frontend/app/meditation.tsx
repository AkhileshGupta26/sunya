import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Audio } from 'expo-av';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

const MEDITATION_TRACKS = [
  {
    id: 'vedic',
    name: 'Vedic Chants',
    icon: 'om',
    color: '#F59E0B',
    description: 'Ancient mantras for deep focus',
  },
  {
    id: 'nature',
    name: 'Nature Sounds',
    icon: 'nature',
    color: '#10B981',
    description: 'Forest ambience and flowing water',
  },
  {
    id: 'guided',
    name: 'Guided Meditation',
    icon: 'account-voice',
    color: '#3B82F6',
    description: 'Gentle voice guidance',
  },
  {
    id: 'silence',
    name: 'Pure Silence',
    icon: 'volume-off',
    color: '#8B5CF6',
    description: 'Deep stillness and awareness',
  },
];

export default function Meditation() {
  const router = useRouter();
  const { token, refreshUser } = useAuth();
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [meditating, setMeditating] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes
  const [awarenessProbe, setAwarenessProbe] = useState(false);
  const [probePassed, setProbePassed] = useState(false);

  useEffect(() => {
    if (meditating && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            completeMeditation();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Schedule awareness probe at random time between 2-8 minutes
      const probeTime = Math.random() * (480 - 120) + 120; // 2-8 minutes in seconds
      const probeTimeout = setTimeout(() => {
        setAwarenessProbe(true);
        playProbeSound();
      }, probeTime * 1000);

      return () => {
        clearInterval(interval);
        clearTimeout(probeTimeout);
      };
    }
  }, [meditating, timeRemaining]);

  const playProbeSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3' },
        { shouldPlay: true }
      );
      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play probe sound:', error);
    }
  };

  const handleAwarenessResponse = () => {
    setAwarenessProbe(false);
    setProbePassed(true);
  };

  const startMeditation = () => {
    if (!selectedTrack) {
      Alert.alert('Select a Track', 'Please choose your meditation style');
      return;
    }

    router.push('/bpm-check?phase=before');
  };

  const completeMeditation = async () => {
    try {
      const response = await fetch(`${API_URL}/api/sessions/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          track_type: selectedTrack,
          completed: true,
          bpm_verified: true,
          awareness_probe_passed: probePassed,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        await refreshUser();

        Alert.alert(
          'Meditation Complete! 🎉',
          `Streak: ${data.new_streak} days\nTotal: ${data.total_days} days${data.zen_passes > 0 ? `\nZen Pass Earned!` : ''}`,
          [
            {
              text: 'Great!',
              onPress: () => router.replace('/(tabs)/home'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Failed to complete meditation:', error);
      Alert.alert('Error', 'Failed to save meditation session');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (meditating) {
    return (
      <View style={styles.meditatingContainer}>
        {awarenessProbe && (
          <View style={styles.probeOverlay}>
            <MaterialCommunityIcons name="bell-ring" size={60} color="#F59E0B" />
            <Text style={styles.probeText}>Are you still present?</Text>
            <TouchableOpacity style={styles.probeButton} onPress={handleAwarenessResponse}>
              <Text style={styles.probeButtonText}>Still Present ✓</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
          <Text style={styles.timerLabel}>Remaining</Text>
        </View>

        <MaterialCommunityIcons name="meditation" size={100} color="#7C3AED" />

        <Text style={styles.breatheText}>Breathe...</Text>

        <TouchableOpacity
          style={styles.stopButton}
          onPress={() => {
            Alert.alert(
              'Stop Meditation?',
              'Stopping now will not count towards your streak.',
              [
                { text: 'Continue', style: 'cancel' },
                {
                  text: 'Stop',
                  style: 'destructive',
                  onPress: () => router.back(),
                },
              ]
            );
          }}
        >
          <Text style={styles.stopButtonText}>Stop</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Choose Your Path</Text>
      </View>

      <View style={styles.tracksContainer}>
        {MEDITATION_TRACKS.map(track => (
          <TouchableOpacity
            key={track.id}
            style={[
              styles.trackCard,
              selectedTrack === track.id && styles.trackCardSelected,
            ]}
            onPress={() => setSelectedTrack(track.id)}
          >
            <View style={[styles.trackIcon, { backgroundColor: track.color + '20' }]}>
              <MaterialCommunityIcons name={track.icon as any} size={32} color={track.color} />
            </View>
            <View style={styles.trackInfo}>
              <Text style={styles.trackName}>{track.name}</Text>
              <Text style={styles.trackDescription}>{track.description}</Text>
            </View>
            {selectedTrack === track.id && (
              <MaterialCommunityIcons name="check-circle" size={24} color="#7C3AED" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoCard}>
        <MaterialCommunityIcons name="information" size={24} color="#7C3AED" />
        <Text style={styles.infoText}>
          Your 10-minute meditation session will include a random awareness check.
          Stay present and focused.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.startButton, !selectedTrack && styles.startButtonDisabled]}
        onPress={startMeditation}
        disabled={!selectedTrack}
      >
        <Text style={styles.startButtonText}>Begin Meditation</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tracksContainer: {
    padding: 24,
    paddingTop: 0,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#2D2D3D',
  },
  trackCardSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#7C3AED10',
  },
  trackIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  trackDescription: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#1F1F2E',
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#D1D5DB',
    marginLeft: 12,
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#7C3AED',
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  meditatingContainer: {
    flex: 1,
    backgroundColor: '#0F0F1E',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  timerLabel: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
  },
  breatheText: {
    fontSize: 24,
    color: '#D1D5DB',
    marginTop: 48,
  },
  stopButton: {
    marginTop: 48,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  stopButtonText: {
    color: '#EF4444',
    fontSize: 14,
  },
  probeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F0F1EF0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  probeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 32,
  },
  probeButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  probeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});