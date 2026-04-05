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

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'yogi';
  recommendation?: {
    track_id: string;
    track_type: 'meditation' | 'yoga';
  };
}

export default function SunyaYogi() {
  const router = useRouter();
  const THEME_COLOR = useThemeColor();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Namaste. I am your Sunya Yogi. How does your soul feel in this sacred moment? Share your heart, and we shall walk the path of stillness together.",
      sender: 'yogi',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    triggerHaptic('selection');

    try {
      const response: any = await api.askYogi(userMsg.text);
      
      const yogiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.wisdom,
        sender: 'yogi',
        recommendation: response.recommended_track_id ? {
          track_id: response.recommended_track_id,
          track_type: response.track_type,
        } : undefined,
      };

      setMessages((prev) => [...prev, yogiMsg]);
      triggerHaptic('notification');
    } catch (error: any) {
      console.error('Yogi Error:', error);
      const errorMsg = error.message || "The connection to the higher realm is misted.";
      setMessages((prev) => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          text: `${errorMsg} Let us take a deep breath and reconnect soon.`,
          sender: 'yogi',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startRecommendedSession = (rec: any) => {
    triggerHaptic('impact');
    if (rec.track_type === 'meditation') {
      router.push({
        pathname: '/meditation',
        params: { autoStart: 'true', trackId: rec.track_id }
      });
    } else {
      router.push('/yoga');
    }
  };

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, loading]);

  return (
    <LinearGradient colors={['#0F0F1E', '#161622']} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <MaterialCommunityIcons name="auto-fix" size={20} color={THEME_COLOR} style={{ marginRight: 8 }} />
            <Text style={styles.headerTitle}>Sunya Yogi</Text>
          </View>
          {/* @ts-ignore - Route types will sync on next build */}
          <TouchableOpacity onPress={() => router.push('/vedic-search')} style={styles.searchButton}>
            <MaterialCommunityIcons name="library-shelves" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <Animated.View 
              key={msg.id} 
              entering={msg.sender === 'user' ? SlideInRight : FadeInDown}
              layout={Layout.springify()}
              style={[
                msg.sender === 'user' ? styles.userWrapper : styles.yogiWrapper
              ]}
            >
              {msg.sender === 'yogi' && (
                <View style={[styles.avatar, { backgroundColor: THEME_COLOR + '20' }]}>
                  <MaterialCommunityIcons name="meditation" size={20} color={THEME_COLOR} />
                </View>
              )}
              <View style={[
                msg.sender === 'user' ? styles.userBubble : [styles.yogiBubble, { borderLeftColor: THEME_COLOR }]
              ]}>
                <Text style={styles.messageText}>{msg.text}</Text>
                
                {msg.recommendation && msg.recommendation.track_id && (
                  <Animated.View entering={FadeIn.delay(400)} style={styles.recContainer}>
                    <TouchableOpacity 
                      style={[styles.recButton, { backgroundColor: THEME_COLOR }]}
                      onPress={() => startRecommendedSession(msg.recommendation)}
                    >
                      <MaterialCommunityIcons 
                        name={msg.recommendation.track_type === 'meditation' ? 'play' : 'yoga'} 
                        size={20} 
                        color="white" 
                      />
                      <Text style={styles.recButtonText}>
                        Begin {msg.recommendation.track_id
                          .split('_')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </View>
            </Animated.View>
          ))}
          {loading && (
            <View style={styles.loadingWrapper}>
              <ActivityIndicator size="small" color={THEME_COLOR} />
              <Text style={styles.loadingText}>The Yogi is reflecting...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Share your heart..."
            placeholderTextColor="#6B7280"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, { backgroundColor: input.trim() ? THEME_COLOR : '#2D2D3D' }]}
            onPress={sendMessage}
            disabled={!input.trim() || loading}
          >
            <MaterialCommunityIcons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D3D',
  },
  backButton: {
    padding: 8,
  },
  searchButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 20,
    maxWidth: '85%',
  },
  userWrapper: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  yogiWrapper: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 5,
  },
  bubble: {
    borderRadius: 18,
    padding: 15,
  },
  userBubble: {
    backgroundColor: '#37374A',
    borderBottomRightRadius: 4,
  },
  yogiBubble: {
    backgroundColor: '#1F1F2E',
    borderBottomLeftRadius: 4,
    borderLeftWidth: 3,
  },
  messageText: {
    fontSize: 16,
    color: '#E5E7EB',
    lineHeight: 24,
  },
  recContainer: {
    marginTop: 15,
  },
  recButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  recButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  loadingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 46,
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginLeft: 10,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: '#161622',
    borderTopWidth: 1,
    borderTopColor: '#2D2D3D',
  },
  input: {
    flex: 1,
    backgroundColor: '#1F1F2E',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingTop: 10,
    color: '#FFFFFF',
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
