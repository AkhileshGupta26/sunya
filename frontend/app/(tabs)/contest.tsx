import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Share,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useThemeColor } from '../../hooks/useThemeColor';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

export default function Contest() {
  const { token, user } = useAuth();
  const router = useRouter();
  const THEME_COLOR = useThemeColor();
  const [activeContest, setActiveContest] = useState<string>('none');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContestStatus();
  }, []);

  const loadContestStatus = async () => {
    if (!user) return; // Should allow loading even if user object isn't full, but token needed
    try {
      const response = await fetch(`${API_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setActiveContest(data.active_contest || 'none');
      }
    } catch (e) { console.error(e); }
  };

  const handleJoinContest = async (type: 'weekly' | 'monthly') => {
    Alert.alert('Join Contest', `Join the ${type} contest?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Join', onPress: async () => {
          setLoading(true);
          try {
            console.log(`Joining contest: ${type}`);
            const res = await fetch(`${API_URL}/api/contests/join`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ contest_type: type })
            });

            if (res.ok) {
              const data = await res.json();
              setActiveContest(data.active_contest);
              // Also trigger Haptic
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Success', `You joined the ${type} contest!`);
              router.push('/leaderboard'); // Or maybe just refresh UI? User asked for leaderboard on progress.
            } else {
              const err = await res.json();
              console.error("Join Error:", err);
              Alert.alert('Error', err.detail || "Failed to join. Please try again.");
            }
          } catch (e) {
            console.error("Join Exception:", e);
            Alert.alert('Error', 'Failed to join contest');
          }
          finally { setLoading(false); }
        }
      }
    ]);
  };

  const handleLeaveContest = async () => {
    Alert.alert('Leave Contest?', 'You will lose your progress.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave', style: 'destructive', onPress: async () => {
          // Not implemented in backend yet, but UI placeholder
          Alert.alert("Info", "Leaving contest feature coming soon.");
        }
      }
    ])
  }

  // Pure Contest UI - No Circle clutter unless hidden
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Contest Arena</Text>
        <Text style={styles.subtitle}>Compete with others globally</Text>
      </View>

      {activeContest === 'none' ? (
        <View style={styles.contestRow}>
          <TouchableOpacity style={styles.contestCard} onPress={() => handleJoinContest('weekly')} disabled={loading}>
            <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.contestGradient}>
              <MaterialCommunityIcons name="trophy" size={40} color="white" />
              <Text style={styles.contestTitle}>Weekly</Text>
              <Text style={styles.contestSubtitle}>Top the charts</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contestCard} onPress={() => handleJoinContest('monthly')} disabled={loading}>
            <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={styles.contestGradient}>
              <MaterialCommunityIcons name="crown" size={40} color="white" />
              <Text style={styles.contestTitle}>Monthly</Text>
              <Text style={styles.contestSubtitle}>Prove yourself</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.activeContainer}>
          <LinearGradient colors={activeContest === 'weekly' ? ['#F59E0B', '#D97706'] : ['#8B5CF6', '#6D28D9']} style={styles.activeCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <View>
                <Text style={styles.activeLabel}>CURRENT STATUS</Text>
                <Text style={styles.activeTitle}>{activeContest.toUpperCase()} WARRIOR</Text>
              </View>
              <MaterialCommunityIcons name="sword-cross" size={48} color="white" style={{ opacity: 0.8 }} />
            </View>
            <Text style={styles.activeDesc}>
              Check your ranking on the Progress tab!
            </Text>
          </LinearGradient>

          {/* Minimal Circle/Social Entry */}
          <TouchableOpacity style={styles.socialLink} onPress={() => Alert.alert("Coming Soon", "Social features are being revamped.")}>
            <Text style={{ color: '#6B7280' }}>Looking for Family Circles?</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>How it works</Text>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="meditation" size={20} color={THEME_COLOR} />
          <Text style={styles.infoText}>Meditate daily to earn points.</Text>
        </View>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="chart-bell-curve" size={20} color={THEME_COLOR} />
          <Text style={styles.infoText}>Check your percentile on Progress tab.</Text>
        </View>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="trophy-award" size={20} color={THEME_COLOR} />
          <Text style={styles.infoText}>Top 10% win badges at end of cycle.</Text>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1E' },
  header: { padding: 24, paddingTop: 60, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
  subtitle: { fontSize: 16, color: '#9CA3AF', marginTop: 4 },

  contestRow: { paddingHorizontal: 24, gap: 16, marginTop: 24 },
  contestCard: { borderRadius: 20, overflow: 'hidden', height: 160, marginBottom: 16 },
  contestGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  contestTitle: { color: 'white', fontWeight: 'bold', fontSize: 24, marginTop: 12 },
  contestSubtitle: { color: 'white', fontSize: 14, opacity: 0.9 },

  activeContainer: { paddingHorizontal: 24, marginTop: 24 },
  activeCard: { borderRadius: 24, padding: 32, alignItems: 'flex-start', justifyContent: 'center', height: 200 },
  activeLabel: { color: 'white', fontSize: 12, opacity: 0.8, letterSpacing: 1, fontWeight: 'bold' },
  activeTitle: { color: 'white', fontSize: 28, fontWeight: 'bold', marginTop: 8 },
  activeDesc: { color: 'white', marginTop: 16, fontSize: 16, opacity: 0.9 },

  socialLink: { marginTop: 32, alignItems: 'center' },

  infoSection: { marginTop: 40, paddingHorizontal: 32 },
  infoTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  infoItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  infoText: { color: '#9CA3AF', fontSize: 14 }
});