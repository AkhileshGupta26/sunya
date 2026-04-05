import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../services/api';
import { useThemeColor } from '../hooks/useThemeColor';
import { triggerHaptic } from '../utils/haptics';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  Layout, 
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import * as Clipboard from 'expo-clipboard';

const { width } = Dimensions.get('window');

interface SearchResult {
  id: string;
  question: string;
  wisdom: string;
  practical_steps: string[];
  source_context?: string;
  sanskrit_shloka?: string;
  shloka_translation?: string;
}

const TOPICS = [
  { id: 'karma', label: 'Karma', icon: 'sync' },
  { id: 'dharma', label: 'Dharma', icon: 'shield-star' },
  { id: 'maya', label: 'Maya', icon: 'opacity' },
  { id: 'prana', label: 'Prana', icon: 'wind' },
  { id: 'yoga', label: 'Yoga Sutras', icon: 'infinity' },
  { id: 'gita', label: 'Bhagavad Gita', icon: 'book-open-page-variant' },
];

export default function VedicSearch() {
  const router = useRouter();
  const THEME_COLOR = useThemeColor();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const performSearch = async () => {
    if (!query.trim() || loading) return;

    setLoading(true);
    triggerHaptic('selection');

    try {
      const response: any = await api.searchVedic(query);
      
      if (!response || !response.wisdom) {
        throw new Error('Wisdom is currently clouded. Please rephrase.');
      }

      const newResult: SearchResult = {
        id: Date.now().toString(),
        question: query.trim(),
        wisdom: response.wisdom,
        practical_steps: Array.isArray(response.practical_steps) ? response.practical_steps : [],
        source_context: response.source_context,
        sanskrit_shloka: response.sanskrit_shloka,
        shloka_translation: response.shloka_translation,
      };

      setResults((prev) => [newResult, ...prev]);
      setQuery('');
      triggerHaptic('notification');
    } catch (error: any) {
      console.error('Search Error:', error);
      triggerHaptic('notification');
      // @ts-ignore
      import('react-native').then(({ Alert }) => {
        Alert.alert('Silence of the Sages', error.message || 'The river of wisdom is currently still. Please try again in a moment.');
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      triggerHaptic('success');
      // @ts-ignore
      import('react-native').then(({ Alert }) => {
        Alert.alert('Wisdom Saved', 'This sacred teaching has been saved to your clipboard.');
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <LinearGradient colors={['#0F0F1E', '#11101D']} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vedic Search</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Vedic wisdom..."
            placeholderTextColor="#6B7280"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={performSearch}
          />
          <TouchableOpacity 
            onPress={performSearch} 
            disabled={!query.trim() || loading}
            style={[styles.searchButton, { backgroundColor: query.trim() ? THEME_COLOR : '#2D2D3D' }]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <MaterialCommunityIcons name="magnify" size={24} color="white" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.topicsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topicsScroll}>
            {TOPICS.map((topic) => (
              <TouchableOpacity
                key={topic.id}
                style={styles.topicPill}
                onPress={() => {
                  setQuery(`Tell me about ${topic.label}`);
                  triggerHaptic('selection');
                }}
              >
                <MaterialCommunityIcons name={topic.icon as any} size={16} color={THEME_COLOR} />
                <Text style={styles.topicLabel}>{topic.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {results.length === 0 && !loading && (
            <Animated.View entering={FadeIn.delay(200)} style={styles.emptyState}>
              <MaterialCommunityIcons name="book-open-variant" size={60} color="#2D2D3D" />
              <Text style={styles.emptyText}>Dig deep into the ancient wisdom of the Vedas.</Text>
              <Text style={styles.emptySubtext}>Try: "What is Tapas?" or "Explain the concept of Dharma."</Text>
            </Animated.View>
          )}

          {results.map((res) => (
            <Animated.View 
              key={res.id} 
              entering={FadeInDown}
              layout={Layout.springify()}
              style={styles.cardWrapper}
            >
              <BlurView intensity={40} tint="dark" style={styles.resultCard}>
                <LinearGradient
                  colors={[THEME_COLOR + '15', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.questionSection}>
                  <Text style={styles.questionText}>{res.question}</Text>
                  <TouchableOpacity 
                    onPress={() => copyToClipboard(`${res.wisdom}\n\n- ${res.source_context}`)}
                    style={styles.actionButton}
                  >
                    <MaterialCommunityIcons name="content-copy" size={20} color={THEME_COLOR} />
                  </TouchableOpacity>
                </View>

                {res.sanskrit_shloka && (
                  <Animated.View 
                    entering={FadeIn.delay(300)}
                    style={styles.shlokaContainer}
                  >
                    <LinearGradient
                      colors={['#FCD34D15', 'transparent']}
                      style={StyleSheet.absoluteFill}
                    />
                    <MaterialCommunityIcons name="flower-lotus" size={18} color="#FCD34D" style={styles.shlokaIcon} />
                    <Text style={styles.shlokaText}>{res.sanskrit_shloka}</Text>
                    {res.shloka_translation && (
                      <Text style={styles.shlokaTranslation}>"{res.shloka_translation}"</Text>
                    )}
                  </Animated.View>
                )}

                <View style={styles.wisdomSection}>
                  <Text style={styles.wisdomText}>{res.wisdom}</Text>
                </View>

                <View style={styles.practicalSection}>
                  <View style={styles.practicalHeader}>
                    <View style={styles.practicalTitleWrapper}>
                      <MaterialCommunityIcons name="lightning-bolt" size={16} color={THEME_COLOR} />
                      <Text style={styles.practicalTitle}>Path to Mastery</Text>
                    </View>
                    {res.source_context && (
                      <View style={[styles.tag, { backgroundColor: THEME_COLOR + '20' }]}>
                        <Text style={[styles.tagText, { color: THEME_COLOR }]}>{res.source_context}</Text>
                      </View>
                    )}
                  </View>
                  {res.practical_steps.map((step, idx) => (
                    <View key={idx} style={styles.stepItem}>
                      <View style={[styles.stepDot, { backgroundColor: THEME_COLOR }]} />
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>
              </BlurView>
            </Animated.View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  searchBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 10,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1F1F2E',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#37374A',
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    color: '#D1D5DB',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 24,
    fontWeight: '700',
  },
  emptySubtext: {
    color: '#9CA3AF',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
  resultCard: {
    backgroundColor: 'rgba(31, 31, 46, 0.7)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  questionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 12,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 28,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  topicsContainer: {
    marginVertical: 15,
  },
  topicsScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  topicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F2E',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  topicLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cardWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  shlokaContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  shlokaIcon: {
    marginBottom: 10,
  },
  shlokaText: {
    fontSize: 20,
    color: '#FCD34D',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '700',
    lineHeight: 30,
  },
  shlokaTranslation: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  wisdomSection: {
    marginBottom: 24,
  },
  wisdomText: {
    fontSize: 16,
    color: '#E5E7EB',
    lineHeight: 26,
  },
  practicalSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  practicalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  practicalTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  practicalTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 15,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stepText: {
    fontSize: 15,
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 22,
    fontWeight: '500',
  },
});
