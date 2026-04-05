import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { api } from '../../services/api';
import { triggerHaptic } from '../../utils/haptics';

interface DailyGuidanceProps {
  themeColor: string;
}

export const DailyGuidance: React.FC<DailyGuidanceProps> = ({ themeColor }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [guidance, setGuidance] = useState<{
    wisdom: string;
    recommended_track_id: string;
    track_type: 'meditation' | 'yoga';
  } | null>(null);

  useEffect(() => {
    fetchGuidance();
  }, []);

  const fetchGuidance = async () => {
    setLoading(true);
    try {
      // Reusing the general "ask" endpoint with a specific "daily guidance" prompt
      const data: any = await api.askYogi('Give me my daily guidance for today.');
      setGuidance(data);
    } catch (error) {
      console.error('Failed to fetch guidance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = () => {
    if (!guidance) return;
    triggerHaptic('impact');
    
    // Navigate based on type
    if (guidance.track_type === 'yoga') {
      router.push({
        pathname: '/meditation', // Reusing meditation screen for now or yoga specifically
        params: { trackId: guidance.recommended_track_id, type: 'yoga' }
      });
    } else {
      router.push({
        pathname: '/meditation',
        params: { trackId: guidance.recommended_track_id }
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={themeColor} />
      </View>
    );
  }

  if (!guidance) return null;

  return (
    <Animated.View entering={FadeInUp} style={styles.container}>
      <LinearGradient
        colors={['rgba(124, 58, 237, 0.15)', 'rgba(124, 58, 237, 0.05)']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <MaterialCommunityIcons name="meditation" size={20} color={themeColor} />
          <Text style={styles.headerTitle}>Daily Guidance</Text>
        </View>

        <Text style={styles.wisdomText}>"{guidance.wisdom}"</Text>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: themeColor }]}
          onPress={handleStartSession}
        >
          <MaterialCommunityIcons 
             name={guidance.track_type === 'yoga' ? 'yoga' : 'om'} 
             size={18} 
             color="white" 
          />
          <Text style={styles.actionButtonText}>
            Start Recommended {guidance.track_type === 'yoga' ? 'Yoga' : 'Session'}
          </Text>
          <MaterialCommunityIcons name="arrow-right" size={16} color="white" />
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gradient: {
    padding: 20,
  },
  loadingContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  wisdomText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#F3F4F6',
    lineHeight: 26,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});
