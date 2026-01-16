import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Share,
  Platform,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import Modal from 'react-native-modal';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useThemeColor } from '../../hooks/useThemeColor';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const triggerHaptic = (type: 'impact' | 'notification' | 'selection', style?: any) => {
  if (Platform.OS === 'web') return;
  try {
    if (type === 'impact') Haptics.impactAsync(style);
    else if (type === 'notification') Haptics.notificationAsync(style);
    else Haptics.selectionAsync();
  } catch (e) { }
};

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

export default function Circle() {
  const { token, user, logout } = useAuth();
  const router = useRouter();
  const THEME_COLOR = useThemeColor();
  const [refreshing, setRefreshing] = useState(false);

  // Family Circle State
  const [circle, setCircle] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [circleName, setCircleName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  // Contest State
  const [activeContest, setActiveContest] = useState<string>('none');
  const [contestLoading, setContestLoading] = useState(false);

  // Deep Link Handling
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.code) {
      setJoinCode(params.code as string);
      setShowJoinModal(true);
    }
  }, [params.code]);

  useEffect(() => {
    loadCircle();
    loadContestStatus();
  }, []);

  const loadContestStatus = async () => {
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

  const loadCircle = async () => {
    try {
      const response = await fetch(`${API_URL}/api/circles/my-circle`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCircle(data.circle);
      }
    } catch (error) {
      console.error('Failed to load circle:', error);
    }
  };

  const onRefresh = async () => {
    triggerHaptic('impact', Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await loadCircle();
    await loadContestStatus();
    setRefreshing(false);
  };

  const handleCreateCircle = async () => {
    if (!circleName.trim()) { Alert.alert('Error', 'Please enter a circle name'); return; }
    triggerHaptic('impact', Haptics.ImpactFeedbackStyle.Medium);
    try {
      const response = await fetch(`${API_URL}/api/circles/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: circleName }),
      });
      if (response.ok) {
        triggerHaptic('notification', Haptics.NotificationFeedbackType.Success);
        const data = await response.json();
        setCircle(data);
        setShowCreateModal(false);
        setCircleName('');
        Alert.alert('Success', `Circle created! Share code: ${data.code}`);
      }
    } catch (error) { Alert.alert('Error', 'Failed to create circle'); }
  };

  const handleJoinCircle = async () => {
    if (!joinCode.trim()) { Alert.alert('Error', 'Please enter a circle code'); return; }
    triggerHaptic('impact', Haptics.ImpactFeedbackStyle.Medium);
    try {
      const response = await fetch(`${API_URL}/api/circles/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: joinCode }),
      });
      if (response.ok) {
        triggerHaptic('notification', Haptics.NotificationFeedbackType.Success);
        const data = await response.json();
        setCircle(data);
        setShowJoinModal(false);
        setJoinCode('');
        Alert.alert('Success', `Joined ${data.name}!`);
      } else {
        const error = await response.json();
        Alert.alert('Error', error.detail || 'Failed to join circle');
      }
    } catch (error) { Alert.alert('Error', 'Failed to join circle'); }
  };

  const handleShare = async () => {
    if (!circle) return;
    triggerHaptic('selection');
    const link = Linking.createURL('/(tabs)/circle', { queryParams: { code: circle.code } });
    try {
      await Share.share({
        message: `Join my Zen Circle "${circle.name}"! Use code: ${circle.code}\n\nJoin automatically here: ${link}`,
        url: link,
      });
    } catch (error) { Alert.alert('Error', 'Failed to share'); }
  };

  const handleLeaveCircle = async () => {
    Alert.alert('Leave Circle?', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave', style: 'destructive', onPress: async () => {
          triggerHaptic('impact', Haptics.ImpactFeedbackStyle.Heavy);
          await fetch(`${API_URL}/api/circles/leave`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
          setCircle(null);
        }
      }
    ]);
  };

  const handleJoinContest = async (type: 'weekly' | 'monthly') => {
    Alert.alert('Join Contest', `Join the ${type} contest?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Join', onPress: async () => {
          setContestLoading(true);
          try {
            const res = await fetch(`${API_URL}/api/contests/join`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ contest_type: type })
            });
            if (res.ok) {
              const data = await res.json();
              setActiveContest(data.active_contest);
              Alert.alert('Success', `You joined the ${type} contest!`);
              router.push('/leaderboard');
            } else {
              const err = await res.json();
              Alert.alert('Error', err.detail);
            }
          } catch (e) { Alert.alert('Error', 'Failed to join contest'); }
          finally { setContestLoading(false); }
        }
      }
    ]);
  };

  const renderContestSection = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Zen Contests</Text>
      </View>

      {activeContest === 'none' ? (
        <View style={styles.contestRow}>
          <TouchableOpacity style={styles.contestCard} onPress={() => handleJoinContest('weekly')}>
            <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.contestGradient}>
              <MaterialCommunityIcons name="trophy" size={32} color="white" />
              <Text style={styles.contestTitle}>Weekly</Text>
              <Text style={styles.contestSubtitle}>Top the charts</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contestCard} onPress={() => handleJoinContest('monthly')}>
            <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={styles.contestGradient}>
              <MaterialCommunityIcons name="crown" size={32} color="white" />
              <Text style={styles.contestTitle}>Monthly</Text>
              <Text style={styles.contestSubtitle}>Prove yourself</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.activeContestCard} onPress={() => router.push('/leaderboard')}>
          <LinearGradient colors={activeContest === 'weekly' ? ['#F59E0B', '#D97706'] : ['#8B5CF6', '#6D28D9']} style={styles.activeContestGradient}>
            <View>
              <Text style={styles.activeContestLabel}>Active Contest</Text>
              <Text style={styles.activeContestTitle}>{activeContest.charAt(0).toUpperCase() + activeContest.slice(1)} Challenge</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={30} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );

  // Guest Handling
  if (user?.isGuest) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F0F1E', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <MaterialCommunityIcons name="account-group" size={80} color={THEME_COLOR} style={{ opacity: 0.8, marginBottom: 24 }} />
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFF', textAlign: 'center', marginBottom: 12 }}>
          Join the Community
        </Text>
        <Text style={{ fontSize: 16, color: '#9CA3AF', textAlign: 'center', marginBottom: 32, lineHeight: 24 }}>
          Create an account to join family circles and meditate together with your loved ones.
        </Text>

        <TouchableOpacity
          style={{ backgroundColor: THEME_COLOR, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
          onPress={async () => {
            await logout(() => router.replace('/auth/login'));
          }}
        >
          <MaterialCommunityIcons name="login" size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>Log In / Sign Up</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Main View
  if (!circle) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME_COLOR} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Family Circle</Text>
          <Text style={styles.subtitle}>Meditate together, stay connected</Text>
        </View>

        {/* Contest Section is visible even without a circle */}
        {renderContestSection()}

        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="account-group-outline" size={80} color="#4B5563" />
          <Text style={styles.emptyTitle}>No Circle Yet</Text>
          <Text style={styles.emptySubtitle}>Create a circle for your family or join an existing one to meditate together</Text>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: THEME_COLOR }]} onPress={() => setShowCreateModal(true)}>
            <MaterialCommunityIcons name="plus-circle" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Create Circle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton, { borderColor: THEME_COLOR }]}
            onPress={() => setShowJoinModal(true)}
          >
            <MaterialCommunityIcons name="login" size={20} color={THEME_COLOR} />
            <Text style={[styles.actionButtonText, styles.secondaryButtonText, { color: THEME_COLOR }]}>Join Circle</Text>
          </TouchableOpacity>
        </View>

        {/* Create Circle Modal */}
        <Modal isVisible={showCreateModal} onBackdropPress={() => setShowCreateModal(false)} style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: THEME_COLOR }]}>Create Family Circle</Text>
            <TextInput style={styles.input} placeholder="Circle Name" placeholderTextColor="#6B7280" value={circleName} onChangeText={setCircleName} />
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: THEME_COLOR }]} onPress={handleCreateCircle}>
              <Text style={styles.modalButtonText}>Create</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Join Circle Modal */}
        <Modal isVisible={showJoinModal} onBackdropPress={() => setShowJoinModal(false)} style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: THEME_COLOR }]}>Join Circle</Text>
            <TextInput style={styles.input} placeholder="Enter 6-digit code" placeholderTextColor="#6B7280" value={joinCode} onChangeText={setJoinCode} keyboardType="number-pad" maxLength={6} />
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: THEME_COLOR }]} onPress={handleJoinCircle}>
              <Text style={styles.modalButtonText}>Join</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowJoinModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </ScrollView>
    );
  }

  // Circle View (when user is in a circle)
  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME_COLOR} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{circle.name}</Text>
      </View>

      {renderContestSection()}

      <View style={[styles.codeCard, { borderColor: THEME_COLOR }]}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="qrcode" size={32} color={THEME_COLOR} />
          <View style={styles.codeInfo}>
            <Text style={styles.codeLabel}>Circle Code</Text>
            <Text style={styles.codeText}>{circle.code}</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.shareButton, { backgroundColor: THEME_COLOR }]} onPress={handleShare}>
          <MaterialCommunityIcons name="share-variant" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.harmonyCard}>
        <Text style={styles.harmonyTitle}>Harmony Score</Text>
        <Text style={[styles.harmonyScore, { color: THEME_COLOR }]}>{Math.round(circle.harmony_score)}%</Text>
        <Text style={styles.harmonySubtitle}>Members meditating today</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Members</Text>
        <Text style={[styles.memberCount, { color: THEME_COLOR }]}>{circle.members.length}</Text>
      </View>

      <View style={styles.membersList}>
        {circle.members.map((member: any, index: number) => (
          <View key={index} style={styles.memberCard}>
            <View style={[styles.memberAvatar, { backgroundColor: `${THEME_COLOR}20` }]}>
              <MaterialCommunityIcons name="account" size={24} color={THEME_COLOR} />
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberJoined}>Joined {new Date(member.joined_at).toLocaleDateString()}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveCircle}>
          <MaterialCommunityIcons name="exit-to-app" size={20} color="#EF4444" />
          <Text style={styles.leaveButtonText}>Leave Circle</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1E' },
  header: { padding: 24, paddingTop: 60 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
  subtitle: { fontSize: 16, color: '#9CA3AF', marginTop: 4 },

  emptyState: { alignItems: 'center', padding: 24, marginTop: 48 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#9CA3AF', marginTop: 8, textAlign: 'center', lineHeight: 20 },
  actionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7C3AED', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, marginTop: 24, width: '80%', justifyContent: 'center' },
  actionButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#7C3AED' },
  secondaryButtonText: { color: '#7C3AED' },

  codeCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1F1F2E', marginHorizontal: 24, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1 },
  codeInfo: { marginLeft: 16 },
  codeLabel: { fontSize: 12, color: '#9CA3AF' },
  codeText: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 2 },
  shareButton: { padding: 12, borderRadius: 8, marginLeft: 16 },

  harmonyCard: { backgroundColor: '#1F1F2E', marginHorizontal: 24, borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16 },
  harmonyTitle: { fontSize: 16, color: '#9CA3AF' },
  harmonyScore: { fontSize: 48, fontWeight: 'bold', marginTop: 8 },
  harmonySubtitle: { fontSize: 12, color: '#6B7280', marginTop: 4 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginTop: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  memberCount: { fontSize: 16, fontWeight: '600' },

  membersList: { paddingHorizontal: 24, paddingBottom: 24 },
  memberCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1F1F2E', borderRadius: 12, padding: 16, marginBottom: 8 },
  memberAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  memberJoined: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },

  modal: { justifyContent: 'center', margin: 0, padding: 24 },
  modalContent: { backgroundColor: '#1F1F2E', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20 },
  input: { backgroundColor: '#0F0F1E', borderRadius: 12, padding: 16, color: '#FFFFFF', fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2D2D3D' },
  modalButton: { backgroundColor: '#7C3AED', borderRadius: 12, padding: 16, alignItems: 'center' },
  modalButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  modalCancelButton: { marginTop: 12, alignItems: 'center' },
  modalCancelText: { color: '#9CA3AF', fontSize: 14 },

  leaveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#EF4444', backgroundColor: '#EF444410' },
  leaveButtonText: { color: '#EF4444', fontSize: 16, fontWeight: '600', marginLeft: 8 },

  sectionContainer: { marginBottom: 24 },
  contestRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 12 },
  contestCard: { flex: 1, borderRadius: 16, overflow: 'hidden', height: 120 },
  contestGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 12 },
  contestTitle: { color: 'white', fontWeight: 'bold', fontSize: 16, marginTop: 8 },
  contestSubtitle: { color: 'white', fontSize: 12, opacity: 0.9 },

  activeContestCard: { marginHorizontal: 24, borderRadius: 16, overflow: 'hidden', height: 80 },
  activeContestGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  activeContestLabel: { color: 'white', fontSize: 12, opacity: 0.9 },
  activeContestTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
});