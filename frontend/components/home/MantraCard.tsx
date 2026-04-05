import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

interface MantraCardProps {
  mantra?: {
    sankalpa: string;
    explanation: string;
    focus_points: string[];
  };
  loading: boolean;
  onRefresh: () => void;
  themeColor: string;
}

export const MantraCard: React.FC<MantraCardProps> = ({
  mantra,
  loading,
  onRefresh,
  themeColor,
}) => {
  return (
    <Animated.View entering={FadeInDown.delay(200)} style={styles.container}>
      <BlurView intensity={20} tint="dark" style={styles.blur}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <MaterialCommunityIcons name="star-shooting" size={20} color={themeColor} />
            <Text style={styles.title}>Daily Sankalpa</Text>
          </View>
          <TouchableOpacity onPress={onRefresh} disabled={loading} style={styles.refreshButton}>
            {loading ? (
              <ActivityIndicator size="small" color={themeColor} />
            ) : (
              <MaterialCommunityIcons name="refresh" size={20} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        </View>

        {mantra ? (
          <Animated.View entering={FadeIn} style={styles.content}>
            <Text style={[styles.sankalpa, { color: themeColor }]}>
              "{mantra.sankalpa}"
            </Text>
            <Text style={styles.explanation}>{mantra.explanation}</Text>
            
            <View style={styles.focusContainer}>
              {mantra.focus_points.map((point, index) => (
                <View key={index} style={styles.focusTag}>
                  <View style={[styles.dot, { backgroundColor: themeColor }]} />
                  <Text style={styles.focusText}>{point}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        ) : (
          <View style={styles.emptyContent}>
            <Text style={styles.emptyText}>Tap refresh to generate your personalized resolution.</Text>
          </View>
        )}
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  blur: {
    padding: 20,
    backgroundColor: 'rgba(31, 31, 46, 0.6)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
    letterSpacing: 0.5,
  },
  refreshButton: {
    padding: 4,
  },
  content: {
    alignItems: 'center',
  },
  sankalpa: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 10,
    fontStyle: 'italic',
  },
  explanation: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 15,
  },
  focusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  focusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  focusText: {
    fontSize: 12,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  emptyContent: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
