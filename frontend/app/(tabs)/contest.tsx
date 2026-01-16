import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Share,
  TextInput,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useThemeColor } from '../../hooks/useThemeColor';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

const CircleManager = ({ token, API_URL }: { token: string | null, API_URL: string }) => {
  const [myCircle, setMyCircle] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [createName, setCreateName] = useState('');
  const [viewMode, setViewMode] = useState<'main' | 'join' | 'create'>('main'); // Simple local nav

  useEffect(() => {
    fetchMyCircle();
  }, []);

  const fetchMyCircle = async () => {
    try {
      const res = await fetch(`${API_URL}/api/circles/my-circle`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyCircle(data.circle);
      }
    } catch (e) { console.error(e); }
  };

  const handleCreate = async () => {
    if (!createName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/circles/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: createName })
      });
      if (res.ok) {
        Alert.alert("Success", "Circle created!");
        setCreateName('');
        setViewMode('main');
        fetchMyCircle();
      } else {
        const err = await res.json();
        Alert.alert("Error", err.detail);
      }
    } catch (e) { Alert.alert("Error", "Failed to create circle"); }
    finally { setLoading(false); }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/circles/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: joinCode })
      });
      if (res.ok) {
        Alert.alert("Success", "Joined circle!");
        setJoinCode('');
        setViewMode('main');
        fetchMyCircle();
      } else {
        const err = await res.json();
        Alert.alert("Error", err.detail);
      }
    } catch (e) { Alert.alert("Error", "Failed to join circle"); }
    finally { setLoading(false); }
  };

  const handleLeave = async () => {
    Alert.alert("Leave Circle", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave", style: "destructive", onPress: async () => {
          try {
            await fetch(`${API_URL}/api/circles/leave`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` }
            });
            setMyCircle(null);
            Alert.alert("Left", "You have left the circle.");
          } catch (e) { console.error(e); }
        }
      }
    ]);
  };

  if (myCircle) {
    return (
      <View style={styles.circleCard}>
        <View style={styles.circleHeader}>
          <View>
            <Text style={styles.circleName}>{myCircle.name}</Text>
            <Text style={styles.circleCode}>Code: {myCircle.code}</Text>
          </View>
          <MaterialCommunityIcons name="account-group" size={32} color="#7C3AED" />
        </View>
        <View style={styles.harmonyContainer}>
          <Text style={styles.harmonyLabel}>Harmony Score</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${myCircle.harmony_score}%` }]} />
          </View>
          <Text style={styles.harmonyValue}>{Math.round(myCircle.harmony_score)}%</Text>
        </View>
        <Text style={styles.membersLabel}>Members ({myCircle.members.length})</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.membersRow}>
          {myCircle.members.map((m: any, i: number) => (
            <View key={i} style={styles.memberChip}>
              <Text style={styles.memberText}>{m.name.split(' ')[0]}</Text>
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity onPress={onShare => Share.share({ message: `Join my Meditation Circle on Shunya! Code: ${myCircle.code}` })} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Invite Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLeave} style={{ marginTop: 12, alignItems: 'center' }}>
          <Text style={{ color: '#EF4444', fontSize: 12 }}>Leave Circle</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (viewMode === 'create') {
    return (
      <View style={styles.circleCard}>
        <Text style={styles.inputLabel}>Circle Name</Text>
        <TextInput
          style={styles.input}
          value={createName}
          onChangeText={setCreateName}
          placeholder="e.g. Zen Masters"
          placeholderTextColor="#6B7280"
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={() => setViewMode('main')} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCreate} style={styles.confirmButton} disabled={loading}>
            <Text style={styles.confirmText}>{loading ? 'Creating...' : 'Create'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (viewMode === 'join') {
    return (
      <View style={styles.circleCard}>
        <Text style={styles.inputLabel}>Enter Circle Code</Text>
        <TextInput
          style={styles.input}
          value={joinCode}
          onChangeText={setJoinCode}
          placeholder="e.g. 123456"
          keyboardType="numeric"
          placeholderTextColor="#6B7280"
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={() => setViewMode('main')} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleJoin} style={styles.confirmButton} disabled={loading}>
            <Text style={styles.confirmText}>{loading ? 'Joining...' : 'Join'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.circleOptions}>
      <TouchableOpacity style={styles.optionButton} onPress={() => setViewMode('create')}>
        <MaterialCommunityIcons name="plus-circle" size={24} color="white" />
        <Text style={styles.optionText}>Create Circle</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionButton} onPress={() => setViewMode('join')}>
        <MaterialCommunityIcons name="login" size={24} color="white" />
        <Text style={styles.optionText}>Join Circle</Text>
      </TouchableOpacity>
    </View>
  );
};

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

      {/* Social Circle Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Social Circle</Text>
      </View>

      <CircleManager token={token} API_URL={API_URL} />


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
  infoText: { color: '#9CA3AF', fontSize: 14 },

  // Circle Manager Styles
  sectionHeader: { paddingHorizontal: 24, marginTop: 32, marginBottom: 12 },
  sectionTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  circleCard: { marginHorizontal: 24, backgroundColor: '#1F1F2E', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#2F2F3D' },
  circleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  circleName: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  circleCode: { color: '#9CA3AF', fontSize: 14, fontFamily: 'monospace' },
  harmonyContainer: { marginBottom: 16 },
  harmonyLabel: { color: '#9CA3AF', fontSize: 12, marginBottom: 6 },
  progressBar: { height: 8, backgroundColor: '#374151', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#10B981' },
  harmonyValue: { color: '#10B981', fontSize: 12, marginTop: 4, textAlign: 'right' },
  membersLabel: { color: 'white', fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  membersRow: { flexDirection: 'row', marginBottom: 16 },
  memberChip: { backgroundColor: '#374151', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
  memberText: { color: 'white', fontSize: 12 },
  actionButton: { backgroundColor: '#7C3AED', padding: 12, borderRadius: 12, alignItems: 'center' },
  actionButtonText: { color: 'white', fontWeight: 'bold' },

  circleOptions: { flexDirection: 'row', paddingHorizontal: 24, gap: 12 },
  optionButton: { flex: 1, backgroundColor: '#1F1F2E', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#2D2D3D' },
  optionText: { color: 'white', marginTop: 8, fontWeight: 'bold' },

  inputLabel: { color: '#9CA3AF', marginBottom: 8 },
  input: { backgroundColor: '#0F0F1E', color: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#374151', marginBottom: 16 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  cancelButton: { flex: 1, padding: 12, alignItems: 'center' },
  cancelText: { color: '#9CA3AF' },
  confirmButton: { flex: 1, backgroundColor: '#7C3AED', padding: 12, borderRadius: 8, alignItems: 'center' },
  confirmText: { color: 'white', fontWeight: 'bold' }
});