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
  SlideInRight,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  withSequence,
  Extrapolate
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'yogi';
  recommendation?: {
    track_id: string;
    track_type: 'meditation' | 'yoga';
  };
}

const AIHalo = ({ color }: { color: string }) => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulse.value, [0, 1], [1, 1.4]);
    const opacity = interpolate(pulse.value, [0, 1], [0.6, 0]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.halo, { backgroundColor: color }, animatedStyle]} />
  );
};

const ThinkingDots = ({ color }: { color: string }) => {
  return (
    <View style={styles.dotsContainer}>
      {[0, 1, 2].map((i) => (
        <AnimatedDot key={i} delay={i * 200} color={color} />
      ))}
    </View>
  );
};

const AnimatedDot = ({ delay, color }: { delay: number, color: string }) => {
  const opacity = useSharedValue(0.3);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0.3, { duration: 400 })
      ),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.dot, { backgroundColor: color }, style]} />;
};

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
    <LinearGradient colors={['#0F0F1E', '#161622', '#0A0A12']} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <BlurView intensity={20} tint="dark" style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <View style={styles.headerAvatarWrapper}>
              <AIHalo color={THEME_COLOR} />
              <View style={[styles.headerAvatar, { backgroundColor: THEME_COLOR }]}>
                <MaterialCommunityIcons name="meditation" size={20} color="white" />
              </View>
            </View>
            <View>
              <Text style={styles.headerTitle}>Sunya Yogi</Text>
              <Text style={styles.headerSubtitle}>Vedic AI Mentor</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/vedic-search')} style={styles.searchButton}>
            <MaterialCommunityIcons name="library-shelves" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </BlurView>

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
                <View style={styles.avatarContainer}>
                  <AIHalo color={THEME_COLOR} />
                  <View style={[styles.avatar, { backgroundColor: THEME_COLOR }]}>
                    <MaterialCommunityIcons name="meditation" size={18} color="white" />
                  </View>
                </View>
              )}
              <BlurView 
                intensity={msg.sender === 'yogi' ? 20 : 0} 
                tint="dark" 
                style={[
                  msg.sender === 'user' ? styles.userBubble : styles.yogiBubble,
                  msg.sender === 'yogi' && { borderColor: THEME_COLOR + '30', borderWidth: 1 }
                ]}
              >
                <Text style={styles.messageText}>{msg.text}</Text>
                
                {msg.recommendation && msg.recommendation.track_id && (
                  <Animated.View entering={FadeIn.delay(400)} style={styles.recContainer}>
                    <TouchableOpacity 
                      style={[styles.recButton, { backgroundColor: THEME_COLOR }]}
                      onPress={() => startRecommendedSession(msg.recommendation)}
                    >
                      <MaterialCommunityIcons 
                        name={msg.recommendation.track_type === 'meditation' ? 'play-circle' : 'yoga'} 
                        size={20} 
                        color="white" 
                      />
                      <Text style={styles.recButtonText}>
                        Go to {msg.recommendation.track_id
                          .split('_')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </BlurView>
            </Animated.View>
          ))}
          {loading && (
            <View style={styles.loadingWrapper}>
               <View style={styles.avatarContainer}>
                <AIHalo color={THEME_COLOR} />
                <View style={[styles.avatar, { backgroundColor: THEME_COLOR + '40' }]}>
                  <MaterialCommunityIcons name="brain" size={18} color="white" />
                </View>
              </View>
              <BlurView intensity={20} tint="dark" style={[styles.yogiBubble, styles.thinkingBubble, { borderColor: THEME_COLOR + '20', borderWidth: 1 }]}>
                <ThinkingDots color={THEME_COLOR} />
              </BlurView>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <BlurView intensity={60} tint="dark" style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Share your heart..."
              placeholderTextColor="#9CA3AF"
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
        </BlurView>
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
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backButton: {
    padding: 4,
  },
  searchButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 15,
  },
  headerAvatarWrapper: {
    marginRight: 12,
    position: 'relative',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  userWrapper: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    maxWidth: '85%',
  },
  yogiWrapper: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginBottom: 20,
    maxWidth: '85%',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    position: 'relative',
    marginRight: 12,
    marginTop: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  halo: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    top: 0,
    right: 0,
  },
  userBubble: {
    backgroundColor: '#37374A',
    borderRadius: 20,
    borderBottomRightRadius: 4,
    padding: 16,
  },
  yogiBubble: {
    backgroundColor: 'rgba(31, 31, 46, 0.4)',
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    padding: 16,
  },
  thinkingBubble: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  messageText: {
    fontSize: 16,
    color: '#E5E7EB',
    lineHeight: 24,
    fontWeight: '500',
  },
  recContainer: {
    marginTop: 16,
  },
  recButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  recButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  loadingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    height: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  inputContainer: {
    padding: 15,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 31, 46, 0.8)',
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 8,
    paddingTop: 8,
    color: '#FFFFFF',
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});
