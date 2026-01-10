import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;
const { width } = Dimensions.get('window');

export default function Progress() {
  const { token, user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/sessions/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  const getTrackIcon = (trackType: string) => {
    switch (trackType) {
      case 'vedic': return 'om';
      case 'nature': return 'nature';
      case 'guided': return 'account-voice';
      case 'silence': return 'volume-off';
      default: return 'meditation';
    }
  };

  const getTrackColor = (trackType: string) => {
    switch (trackType) {
      case 'vedic': return '#F59E0B';
      case 'nature': return '#10B981';
      case 'guided': return '#3B82F6';
      case 'silence': return '#8B5CF6';
      default: return '#7C3AED';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="fire" size={32} color="#F59E0B" />
          <Text style={styles.statNumber}>{user?.current_streak || 0}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="calendar-check" size={32} color="#10B981" />
          <Text style={styles.statNumber}>{user?.total_days || 0}</Text>
          <Text style={styles.statLabel}>Total Days</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="shield-star" size={32} color="#8B5CF6" />
          <Text style={styles.statNumber}>{user?.zen_passes || 0}</Text>
          <Text style={styles.statLabel}>Zen Passes</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="clock-outline" size={32} color="#3B82F6" />
          <Text style={styles.statNumber}>{(user?.total_days || 0) * 10}</Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
      </View>

      {sessions.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="meditation" size={60} color="#4B5563" />
          <Text style={styles.emptyText}>No meditation sessions yet</Text>
          <Text style={styles.emptySubtext}>Start your journey today!</Text>
        </View>
      ) : (
        <View style={styles.sessionsList}>
          {sessions.map((session, index) => (
            <View key={session.id} style={styles.sessionCard}>
              <View style={[
                styles.sessionIcon,
                { backgroundColor: session.completed ? getTrackColor(session.track_type) + '20' : '#4B556320' }
              ]}>
                <MaterialCommunityIcons
                  name={session.completed ? getTrackIcon(session.track_type) : 'cancel'}
                  size={24}
                  color={session.completed ? getTrackColor(session.track_type) : '#6B7280'}
                />
              </View>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionDate}>{new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                <Text style={styles.sessionType}>
                  {session.completed
                    ? `${session.track_type.charAt(0).toUpperCase() + session.track_type.slice(1)} - 10 min`
                    : 'Incomplete'}
                </Text>
              </View>
              {session.completed && (
                <MaterialCommunityIcons name="check-circle" size={24} color="#10B981" />
              )}
            </View>
          ))}
        </View>
      )}
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1F1F2E',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D3D',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sessionsList: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  sessionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sessionType: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
});