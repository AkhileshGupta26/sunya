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
import { useThemeColor } from '../../hooks/useThemeColor';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;
const { width } = Dimensions.get('window');

const GlobalStandingGraph = ({ token, refresh, themeColor }: { token: string | null, refresh: boolean, themeColor: string }) => {
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

  const percentile = standing.percentile || 0;

  // Bar Graph Logic (Minimal)
  // We will show 5 bars: Top 10%, Top 20%, Top 50%, Top 80%, You
  // Or just a visual representation of "You vs Average vs Top"

  // Let's do a simple single horizontal bar with markers
  // Or 3 vertical bars: "Top 1%", "Average", "You"

  const graphHeight = 100;
  const barWidth = 40;

  // Mock data for graph context
  // If user is top 5%, their bar is high. Average is 50%. Top is 100%.

  return (
    <View style={styles.graphContainer}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={styles.graphTitle}>Global Standing</Text>
          <Text style={styles.graphSubtitle}>You are in the <Text style={{ color: themeColor, fontWeight: 'bold' }}>Top {percentile}%</Text></Text>
        </View>
        <MaterialCommunityIcons name="chart-bar" size={24} color={themeColor} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 140, paddingVertical: 15, marginTop: 10 }}>
        {/* Top 1% Bar */}
        <View style={{ alignItems: 'center', width: barWidth }}>
          <Text style={{ color: 'white', fontSize: 10, marginBottom: 4, fontWeight: 'bold' }}>Top 1%</Text>
          <View style={{ width: '100%', height: 100, backgroundColor: '#374151', borderRadius: 6, opacity: 0.5, borderWidth: 1, borderColor: '#4B5563' }} />
          <Text style={{ color: '#9CA3AF', fontSize: 10, marginTop: 6 }}>Elite</Text>
        </View>

        {/* Your Bar */}
        <View style={{ alignItems: 'center', width: barWidth }}>
          <Text style={{ color: themeColor, fontSize: 12, marginBottom: 4, fontWeight: 'bold' }}>You</Text>
          <LinearGradient
            colors={[themeColor, '#D97706']}
            style={{ width: '100%', height: Math.max(20, 100 - percentile), borderRadius: 6, shadowColor: themeColor, shadowOpacity: 0.3, shadowRadius: 4 }}
          />
          <Text style={{ color: themeColor, fontSize: 10, marginTop: 6, fontWeight: 'bold' }}>{Math.round(standing.my_points)} pts</Text>
        </View>

        {/* Average Bar */}
        <View style={{ alignItems: 'center', width: barWidth }}>
          <Text style={{ color: '#9CA3AF', fontSize: 10, marginBottom: 4 }}>Avg</Text>
          <View style={{ width: '100%', height: 50, backgroundColor: '#374151', borderRadius: 6, opacity: 0.3 }} />
          <Text style={{ color: '#9CA3AF', fontSize: 10, marginTop: 6 }}>Norm</Text>
        </View>
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

const ProgressLineChart = ({ sessions, themeColor }: { sessions: any[], themeColor: string }) => {
  const chartHeight = 160;
  const chartWidth = width - 88; // Accounting for padding
  const padding = 20;

  // Process sessions into last 30 days
  const last30Days = Array.from({ length: 15 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (14 - i));
    const dateStr = d.toISOString().split('T')[0];
    
    // Sum minutes for this day
    const daySessions = sessions.filter(s => s.date === dateStr && s.completed);
    const totalMinutes = daySessions.reduce((acc, s) => acc + (s.duration_seconds || 0) / 60, 0);
    
    return { date: dateStr, minutes: totalMinutes, label: d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0) };
  });

  const maxMinutes = Math.max(20, ...last30Days.map(d => d.minutes)) * 1.2;
  
  const points = last30Days.map((d, i) => ({
    x: padding + (i * (chartWidth - 2 * padding) / (last30Days.length - 1)),
    y: chartHeight - padding - (d.minutes / maxMinutes * (chartHeight - 2 * padding))
  }));

  // Create SVG path (Bezier Curve)
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cx1 = curr.x + (next.x - curr.x) / 2;
    const cy1 = curr.y;
    const cx2 = curr.x + (next.x - curr.x) / 2;
    const cy2 = next.y;
    d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${next.x} ${next.y}`;
  }

  const fillD = `${d} V ${chartHeight - padding} H ${points[0].x} Z`;

  return (
    <View style={styles.graphContainer}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <View>
            <Text style={styles.graphTitle}>Meditation Path</Text>
            <Text style={styles.graphSubtitle}>Your last 15 days of mindfulness</Text>
          </View>
          <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={24} color={themeColor} />
      </View>

      <View style={{ height: chartHeight, width: '100%', overflow: 'hidden' }}>
        <Svg height={chartHeight} width={chartWidth}>
          <Defs>
            <SvgLinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={themeColor} stopOpacity="0.3" />
              <Stop offset="1" stopColor={themeColor} stopOpacity="0" />
            </SvgLinearGradient>
          </Defs>

          {/* Grid Lines */}
          <Line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#2D2D3D" strokeWidth="1" />
          <Line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke="#2D2D3D" strokeWidth="1" />

          {/* Area Fill */}
          <Path d={fillD} fill="url(#grad)" />

          {/* Path Line */}
          <Path d={d} fill="none" stroke={themeColor} strokeWidth="3" strokeLinecap="round" />

          {/* Data Points */}
          {points.map((p, i) => (
             last30Days[i].minutes > 0 && (
              <Circle key={i} cx={p.x} cy={p.y} r="4" fill="#0F0F1E" stroke={themeColor} strokeWidth="2" />
             )
          ))}

          {/* Date Labels */}
          {last30Days.map((d, i) => (
            i % 2 === 0 && (
              <SvgText
                key={i}
                x={points[i].x}
                y={chartHeight - 4}
                fill="#6B7280"
                fontSize="10"
                textAnchor="middle"
              >
                {d.label}
              </SvgText>
            )
          ))}
        </Svg>
      </View>
    </View>
  );
};

const LeaderboardSection = ({ token }: { token: string | null }) => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [contestType, setContestType] = useState('none');
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
        setContestType(data.contest_type || 'none');
        setLeaderboard(data.leaderboard || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (contestType === 'none') return null;

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>
        {contestType === 'global' ? 'Global' : contestType.charAt(0).toUpperCase() + contestType.slice(1)} Leaderboard
      </Text>
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
  const themeColor = useThemeColor();
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

      <ProgressLineChart sessions={sessions} themeColor={themeColor} />
      <GlobalStandingGraph token={token} refresh={refreshing} themeColor={themeColor} />
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

      {/* Logic Update: Only show INCOMPLETE sessions. completed ones are history. */}
      {sessions.filter(s => !s.completed).length === 0 ? null : (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Sessions (Incomplete)</Text>
          </View>
          <View style={styles.sessionsList}>
            {sessions.filter(s => !s.completed).map((session) => (
              <View key={session.id} style={styles.sessionCard}>
                <View style={[
                  styles.sessionIcon,
                  { backgroundColor: '#4B556320' }
                ]}>
                  <MaterialCommunityIcons
                    name={'clock-alert-outline'}
                    size={24}
                    color={'#EF4444'}
                  />
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionDate}>{new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                  <Text style={styles.sessionType}>
                    Incomplete Session captured
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
              </View>
            ))}
          </View>
        </>
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
    padding: 12, // Reduced from 16
    marginTop: 8, // Reduced from 12
    borderWidth: 1,
    borderColor: '#2D2D3D',
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10, // Reduced from 12
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
    width: 24, // Reduced from 30
    alignItems: 'center',
    marginRight: 8, // Reduced from 12
  },
  rankText: {
    color: '#9CA3AF',
    fontWeight: 'bold',
    fontSize: 12, // Reduced from 14
  },
  rankName: {
    color: '#FFFFFF',
    fontSize: 12, // Reduced from 14
  },
  rankPoints: {
    color: '#F59E0B',
    fontWeight: '600',
    fontSize: 12, // Reduced from 14
  },
});