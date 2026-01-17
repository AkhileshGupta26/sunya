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
  Platform,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useThemeColor } from '../../hooks/useThemeColor';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

const CircleManager = ({ token, API_URL, themeColor }: { token: string | null, API_URL: string, themeColor: string }) => {
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
          <MaterialCommunityIcons name="account-group" size={32} color={themeColor} />
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
        <TouchableOpacity onPress={onShare => Share.share({ message: `Join my Meditation Circle on Shunya! Code: ${myCircle.code}` })} style={[styles.actionButton, { backgroundColor: themeColor }]}>
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
          <TouchableOpacity onPress={handleCreate} style={[styles.confirmButton, { backgroundColor: themeColor }]} disabled={loading}>
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
          <TouchableOpacity onPress={handleJoin} style={[styles.confirmButton, { backgroundColor: themeColor }]} disabled={loading}>
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
  const [activeContests, setActiveContests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContestStatus();
  }, []);

  const loadContestStatus = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        // Handle migration fallback: if backend hasn't migrated yet (it handles in-memory), use returned value
        setActiveContests(data.active_contests || []);
      }
    } catch (e) { console.error(e); }
  };

  const handleJoinContest = async (type: 'weekly' | 'monthly') => {
    if (type === 'weekly') {
      const day = new Date().getDay();
      if (day === 0 || day === 6) {
        Alert.alert("Weekly Contest", "The Weekly Contest is in cooldown (Results Phase). \n\nJoin us on Monday!");
        return;
      }
    }

    Alert.alert('Join Contest', `Join the ${type} contest?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Join', onPress: async () => {
          setLoading(true);
          try {
            const res = await fetch(`${API_URL}/api/contests/join`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ contest_type: type })
            });

            if (res.ok) {
              const data = await res.json();
              setActiveContests(data.active_contests); // Update list
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Success', `You joined the ${type} contest!`);
            } else {
              const err = await res.json();
              Alert.alert('Error', err.detail || "Failed to join.");
              // If already in, maybe refresh to confirm
              if (res.status === 400 && err.detail.includes("already in")) loadContestStatus();
            }
          } catch (e) { Alert.alert('Error', 'Failed to join contest'); }
          finally { setLoading(false); }
        }
      }
    ]);
  };

  const openLeaderboard = (type: string) => {
    // Navigate to leaderboard with type param
    router.push({ pathname: '/leaderboard', params: { type } });
  };

  // Helper to render the Specific Cards from the Screenshot
  const renderContestCard = (
    title: string,
    subtitle: string,
    badgeText: string,
    iconName: any,
    colors: string[],
    onPress: () => void,
    isResultsMode: boolean = false
  ) => (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.cardContainer}>
      <LinearGradient colors={colors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cardGradient}>
        <View style={styles.cardContent}>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSubtitle}>{subtitle}</Text>
            <View style={isResultsMode ? styles.badgeContainerWarm : styles.badgeContainerCool}>
              <Text style={styles.badgeText}>{badgeText}</Text>
            </View>
          </View>
          <MaterialCommunityIcons name={iconName} size={48} color="white" style={{ opacity: 0.9 }} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Contest Arena</Text>
        <Text style={styles.subtitle}>Compete with others globally</Text>
      </View>

      {/* Contests Stack */}
      <View style={styles.sectionContainer}>
        {/* Weekly Contest Card - Matches Screenshot "Orange" */}
        {renderContestCard(
          "Weekly Contest",
          "Results Period", // Or "High Intensity" based on state
          "STARTS MONDAY",  // Or "ACTIVE"
          "trophy",
          ['#F59E0B', '#EA580C'], // Orange/Amber
          () => openLeaderboard('weekly'),
          true
        )}

        {/* Monthly Marathon Card - Matches Screenshot "Purple" */}
        {renderContestCard(
          "Monthly Marathon",
          "You are participating!",
          "ACTIVE • TAP TO VIEW",
          "check-circle", // Start implies check? Or 'crown'
          ['#8B5CF6', '#6D28D9'], // Purple/Violet
          () => openLeaderboard('monthly'),
          false
        )}
      </View>

      {/* Family Circles Text */}
      <View style={styles.dividerContainer}>
        <Text style={styles.dividerText}>Looking for Family Circles?</Text>
      </View>

      {/* Social Circle Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Social Circle</Text>
      </View>

      <CircleManager token={token} API_URL={API_URL} themeColor={THEME_COLOR} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
    ...Platform.select({
      web: {
        alignSelf: 'center',
        width: '100%',
        maxWidth: 600,
      }
    })
  },
  header: { padding: 24, paddingTop: 60, alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },

  sectionContainer: { marginTop: 0, paddingHorizontal: 20 },

  // New Card Styles
  cardContainer: {
    height: 160,
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cardGradient: { flex: 1, padding: 24, justifyContent: 'center' },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTextContainer: { flex: 1, marginRight: 16 },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 16 },

  badgeContainerWarm: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  badgeContainerCool: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  badgeText: { color: 'white', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },

  // Divider
  dividerContainer: { alignItems: 'center', marginVertical: 24 },
  dividerText: { color: '#6B7280', fontSize: 14 },

  // Social Head
  sectionHeader: { paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },

  // Make Circle Manager buttons look like "Social Circle" grid in screenshot
  // Circle Manager Specifics (retained but tweaked)
  circleCard: { marginHorizontal: 20, backgroundColor: '#1F1F2E', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#2F2F3D' },
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

  // The "Create / Join" Buttons from screenshot (Grid)
  circleOptions: { flexDirection: 'row', paddingHorizontal: 20, gap: 16 },
  optionButton: {
    flex: 1,
    backgroundColor: '#1F1F2E',
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2D2D3D',
    height: 120
  },
  optionText: { color: 'white', marginTop: 12, fontWeight: 'bold', fontSize: 16 },

  inputLabel: { color: '#9CA3AF', marginBottom: 8 },
  input: { backgroundColor: '#0F0F1E', color: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#374151', marginBottom: 16 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  cancelButton: { flex: 1, padding: 12, alignItems: 'center' },
  cancelText: { color: '#9CA3AF' },
  confirmButton: { flex: 1, backgroundColor: '#7C3AED', padding: 12, borderRadius: 8, alignItems: 'center' },
  confirmText: { color: 'white', fontWeight: 'bold' }
});