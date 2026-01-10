import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Speech from 'expo-speech';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

export default function Home() {
  const router = useRouter();
  const { user, token, refreshUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [todaySession, setTodaySession] = useState<any>(null);
  const [graceTimeRemaining, setGraceTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    loadTodaySession();
  }, []);

  useEffect(() => {
    if (todaySession && !todaySession.completed && todaySession.grace_timer_started) {
      const interval = setInterval(() => {
        const started = new Date(todaySession.grace_timer_started).getTime();
        const now = Date.now();
        const elapsed = (now - started) / 1000;
        const remaining = Math.max(0, 1800 - elapsed); // 30 minutes = 1800 seconds
        setGraceTimeRemaining(remaining);

        if (remaining === 0) {
          clearInterval(interval);
          Alert.alert('Grace Period Ended', 'Your 30-minute window has closed. Your streak may be affected.');
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [todaySession]);

  const loadTodaySession = async () => {
    try {
      const response = await fetch(`${API_URL}/api/sessions/today`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTodaySession(data.session);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshUser(), loadTodaySession()]);
    setRefreshing(false);
  };

  const handleWakeUp = async () => {
    try {
      // Start grace timer
      const response = await fetch(`${API_URL}/api/sessions/start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTodaySession({ ...data, completed: false });

        // Speak welcome message
        Speech.speak(
          `Good morning, ${user?.name}. You have successfully awoken. Your 30-minute grace period to find your center begins now.`,
          {
            language: 'en-US',
            pitch: 1.0,
            rate: 0.9,
          }
        );

        router.push('/wake-up');
      }
    } catch (error) {
      console.error('Failed to start session:', error);
      Alert.alert('Error', 'Failed to start morning session');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Good morning,</Text>
        <Text style={styles.name}>{user?.name}</Text>
      </View>

      <View style={styles.streakCard}>
        <View style={styles.streakHeader}>
          <MaterialCommunityIcons name="fire" size={40} color="#F59E0B" />
          <View style={styles.streakInfo}>
            <Text style={styles.streakNumber}>{user?.current_streak || 0}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{user?.total_days || 0}</Text>
            <Text style={styles.statLabel}>Total Days</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{user?.zen_passes || 0}</Text>
            <Text style={styles.statLabel}>Zen Passes</Text>
          </View>
        </View>
      </View>

      {todaySession?.completed ? (
        <View style={styles.completedCard}>
          <MaterialCommunityIcons name="check-circle" size={60} color="#10B981" />
          <Text style={styles.completedTitle}>Today's Meditation Complete!</Text>
          <Text style={styles.completedSubtitle}>See you tomorrow morning</Text>
        </View>
      ) : todaySession && graceTimeRemaining !== null && graceTimeRemaining > 0 ? (
        <View style={styles.graceCard}>
          <MaterialCommunityIcons name="clock-outline" size={48} color="#F59E0B" />
          <Text style={styles.graceTitle}>Grace Period Active</Text>
          <Text style={styles.graceTimer}>{formatTime(graceTimeRemaining)}</Text>
          <Text style={styles.graceSubtitle}>Time remaining to meditate</Text>
          <TouchableOpacity style={styles.meditateButton} onPress={() => router.push('/meditation')}>
            <Text style={styles.meditateButtonText}>Start Meditation</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.wakeUpCard} onPress={handleWakeUp}>
          <MaterialCommunityIcons name="weather-sunny" size={60} color="#7C3AED" />
          <Text style={styles.wakeUpTitle}>Begin Your Sacred Morning</Text>
          <Text style={styles.wakeUpSubtitle}>Tap to start your 30-minute grace period</Text>
        </TouchableOpacity>
      )}

      <View style={styles.todayCard}>
        <Text style={styles.sectionTitle}>Today's Focus</Text>
        <View style={styles.focusItem}>
          <MaterialCommunityIcons name="meditation" size={24} color="#7C3AED" />
          <Text style={styles.focusText}>10 minutes of mindful meditation</Text>
        </View>
        <View style={styles.focusItem}>
          <MaterialCommunityIcons name="heart-pulse" size={24} color="#EC4899" />
          <Text style={styles.focusText}>BPM verification before & after</Text>
        </View>
        <View style={styles.focusItem}>
          <MaterialCommunityIcons name="bell-ring" size={24} color="#F59E0B" />
          <Text style={styles.focusText}>Awareness probe during session</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  streakCard: {
    backgroundColor: '#1F1F2E',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2D2D3D',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  streakInfo: {
    marginLeft: 16,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  streakLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#2D2D3D',
  },
  wakeUpCard: {
    backgroundColor: '#1F1F2E',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  wakeUpTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  wakeUpSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  graceCard: {
    backgroundColor: '#1F1F2E',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  graceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
  },
  graceTimer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginTop: 8,
  },
  graceSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  meditateButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  meditateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  completedCard: {
    backgroundColor: '#1F1F2E',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  completedTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  completedSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  todayCard: {
    backgroundColor: '#1F1F2E',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  focusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  focusText: {
    fontSize: 14,
    color: '#D1D5DB',
    marginLeft: 12,
  },
});