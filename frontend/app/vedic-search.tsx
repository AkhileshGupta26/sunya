import React, { useState, useRef, useEffect } from 'react';
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
  SlideInRight 
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
  const scrollViewRef = useRef<ScrollView>(null);

  const performSearch = async () => {
    if (!query.trim() || loading) return;

    setLoading(true);
    triggerHaptic('selection');

    try {
      console.log('[VedicSearch] Performing search for:', query);
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
          placeholder="Search Vedic wisdom (e.g., Karma, Dharma)..."
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
              style={[styles.topicPill, { borderColor: THEME_COLOR + '40' }]}
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
            <BlurView intensity={20} tint="dark" style={styles.resultCard}>
              <View style={styles.questionSection}>
                <Text style={styles.questionText}>{res.question}</Text>
                <TouchableOpacity onPress={() => copyToClipboard(`${res.wisdom}\n\n- ${res.source_context}`)}>
                  <MaterialCommunityIcons name="content-copy" size={20} color={THEME_COLOR} />
                </TouchableOpacity>
              </View>

              {res.sanskrit_shloka && (
                <View style={[styles.shlokaContainer, { borderColor: THEME_COLOR + '30' }]}>
                  <Text style={styles.shlokaText}>{res.sanskrit_shloka}</Text>
                  {res.shloka_translation && (
                    <Text style={styles.shlokaTranslation}>"{res.shloka_translation}"</Text>
                  )}
                </View>
              )}

              <View style={styles.wisdomSection}>
                <Text style={styles.wisdomText}>{res.wisdom}</Text>
              </View>

              <View style={styles.practicalSection}>
                <View style={styles.practicalHeader}>
                   <Text style={styles.practicalTitle}>Practical Steps</Text>
                   {res.source_context && (
                    <View style={[styles.tag, { backgroundColor: THEME_COLOR + '20' }]}>
                      <Text style={[styles.tagText, { color: THEME_COLOR }]}>{res.source_context}</Text>
                    </View>
                  )}
                </View>
                {res.practical_steps.map((step, idx) => (
                  <View key={idx} style={styles.stepItem}>
                    <Text style={[styles.stepNumber, { color: THEME_COLOR }]}>0{idx + 1}</Text>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            </BlurView>
          </Animated.View>
        ))}
      </ScrollView>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    borderColor: '#2D2D3D',
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
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  resultCard: {
    backgroundColor: '#1F1F2E',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2D2D3D',
  },
  questionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
    gap: 10,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  topicsContainer: {
    marginTop: 15,
    marginBottom: 5,
  },
  topicsScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  topicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F2E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
  },
  topicLabel: {
    color: '#D1D5DB',
    fontSize: 13,
    fontWeight: '500',
  },
  cardWrapper: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  shlokaContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
  },
  shlokaText: {
    fontSize: 18,
    color: '#FCD34D',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  shlokaTranslation: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  practicalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  wisdomSection: {
    marginBottom: 20,
  },
  wisdomText: {
    fontSize: 15,
    color: '#D1D5DB',
    lineHeight: 24,
  },
  practicalSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 15,
    padding: 15,
  },
  practicalTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 12,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  stepText: {
    fontSize: 14,
    color: '#E5E7EB',
    flex: 1,
    lineHeight: 20,
  },
});
