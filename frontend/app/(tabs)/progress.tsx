import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import Svg, { Path, Circle, Line, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;
const { width } = Dimensions.get('window');

const GlobalStandingGraph = ({ token, refresh }: { token: string | null, refresh: boolean }) => {
  const [standing, setStanding] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStanding();
  }, [refresh]);

  const fetchStanding = async () => {
    try {
      const res = await fetch(`${API_URL}/api/contests/standing`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setStanding(await res.json());
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading || !standing) return null;

  // Bell Curve Logic
  // A simple bell curve path: M 0,100 Q 50,0 100,100 (Simplified Bezier)
  // Scaled to width
  const graphWidth = width - 48;
  const graphHeight = 120;

  // Calculate X position based on percentile (0 to 100) -> (0 to width)
  const percentile = standing.percentile || 0;
  // Invert percentile for X axis? "Top 5%" is usually at the RIGHT end (High score).
  // If 5% are ABOVE me, then I am at the 95th percentile.
  // My API returns "Top X%" which is (Rank/Total)*100. Small is Better.
  // So Top 1% -> Right Side? Or Left Side?
  // Usually High Score -> Right Side.
  // Percentile = 100 - Top%
  const xPos = ((100 - percentile) / 100) * graphWidth;

  return (
    <View style={styles.graphContainer}>
      <Text style={styles.graphTitle}>Global Standing</Text>
      <Text style={styles.graphSubtitle}>You are in the <Text style={{ color: '#F59E0B', fontWeight: 'bold' }}>Top {percentile}%</Text></Text>

      <View style={{ marginTop: 20, alignItems: 'center' }}>
        <Svg width={graphWidth} height={graphHeight}>
          <Defs>
            <SvgLinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#7C3AED" stopOpacity="0.8" />
              <Stop offset="1" stopColor="#7C3AED" stopOpacity="0.1" />
            </SvgLinearGradient>
          </Defs>

          {/* Bell Curve Shape */}
          <Path
            d={`M0,${graphHeight} C${graphWidth * 0.2},${graphHeight} ${graphWidth * 0.4},0 ${graphWidth / 2},0 C${graphWidth * 0.6},0 ${graphWidth * 0.8},${graphHeight} ${graphWidth},${graphHeight} Z`}
            fill="url(#grad)"
          />

          {/* User Position Marker */}
          <Line x1={xPos} y1={0} x2={xPos} y2={graphHeight} stroke="#F59E0B" strokeWidth="2" strokeDasharray="5,5" />
          <Circle cx={xPos} cy={graphHeight} r="6" fill="#F59E0B" />

          {/* Labels */}
          <SvgText x="10" y={graphHeight - 10} fill="#9CA3AF" fontSize="10">Low</SvgText>
          <SvgText x={graphWidth - 30} y={graphHeight - 10} fill="#9CA3AF" fontSize="10">High</SvgText>
        </Svg>
      </View>

      <View style={styles.statRow}>
        <View style={styles.miniStat}>
          <Text style={styles.miniLabel}>Rank</Text>
          <Text style={styles.miniValue}>#{standing.rank}</Text>
        </View>
        <View style={styles.miniStat}>
          <Text style={styles.miniLabel}>Total Users</Text>
          <Text style={styles.miniValue}>{standing.total_users}</Text>
        </View>
        <View style={styles.miniStat}>
          <Text style={styles.miniLabel}>Points</Text>
          <Text style={styles.miniValue}>{standing.my_points}</Text>
        </View>
      </View>
    </View>
  );
};

const LeaderboardSection = ({ token }: { token: string | null }) => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [activeContest, setActiveContest] = useState('none');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_URL}/api/contests/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveContest(data.active_contest || 'none');
        setLeaderboard(data.leaderboard || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (activeContest === 'none') return null;

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{activeContest.charAt(0).toUpperCase() + activeContest.slice(1)} Leaderboard</Text>
      <View style={styles.leaderboardCard}>
        {loading ? (
          <Text style={{ color: '#9CA3AF', textAlign: 'center', padding: 20 }}>Loading rankings...</Text>
        ) : leaderboard.length === 0 ? (
          <Text style={{ color: '#9CA3AF', textAlign: 'center', padding: 20 }}>No participants yet.</Text>
        ) : (
          leaderboard.slice(0, 5).map((item, index) => (
            <View key={index} style={[styles.rankItem, item.is_me && styles.myRankItem]}>
              <View style={styles.rankBadge}>
                <Text style={[styles.rankText, item.rank <= 3 && { color: '#F59E0B' }]}>#{item.rank}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rankName, item.is_me && { color: '#7C3AED', fontWeight: 'bold' }]}>{item.name} {item.is_me && '(You)'}</Text>
              </View>
              <Text style={styles.rankPoints}>{item.total_points} pts</Text>
            </View>
          ))
        )}
        <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={() => { /* Navigate to full leaderboard maybe? */ }}>
          <Text style={{ color: '#6B7280', fontSize: 12 }}>Top 5 shown</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


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

      <GlobalStandingGraph token={token} refresh={refreshing} />
      <LeaderboardSection token={token} />

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
  graphContainer: {
    marginHorizontal: 24,
    backgroundColor: '#1F1F2E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2D2D3D',
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  graphSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2D2D3D',
  },
  miniStat: {
    alignItems: 'center',
  },
  miniLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  miniValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  sectionContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  leaderboardCard: {
    backgroundColor: '#1F1F2E',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#2D2D3D',
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D3D',
  },
  myRankItem: {
    backgroundColor: '#7C3AED10',
    borderRadius: 8,
    marginHorizontal: -8,
    paddingHorizontal: 8,
    borderBottomWidth: 0
  },
  rankBadge: {
    width: 30,
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#9CA3AF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  rankName: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  rankPoints: {
    color: '#F59E0B',
    fontWeight: '600',
    fontSize: 14,
  },
});