import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../services/api';
import { Audio } from 'expo-av';
import { useThemeColor } from '../hooks/useThemeColor';
import { triggerHaptic } from '../utils/haptics';
import { Platform } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation
} from 'react-native-reanimated';



const AUDIO_FILES = {
  vedic: require('../assets/vedic.mp3'),
  nature: require('../assets/nature.mp3'),
  guided: require('../assets/guided.mp3'),
  flute: require('../assets/flute.mp3'),
  forest: require('../assets/forest.mp4'),
  bird_piano: require('../assets/bird_piano.mp3'),
};

const MEDITATION_TRACKS = [
  {
    id: 'bird_piano',
    name: 'Bird Piano',
    icon: 'piano',
    color: '#8B5CF6',
    description: 'Gentle piano with birdsong',
    source: AUDIO_FILES.bird_piano,
  },
  {
    id: 'flute',
    name: 'Krishna Flute',
    icon: 'music-clef-treble',
    color: '#F472B6',
    description: 'Divine, relaxing flute melody',
    source: AUDIO_FILES.flute,
  },
  {
    id: 'forest',
    name: 'Forest Ambience',
    icon: 'tree',
    color: '#10B981',
    description: 'Birds and rustling leaves',
    source: AUDIO_FILES.forest,
  },
  {
    id: 'rain',
    name: 'Rain Sounds',
    icon: 'weather-pouring',
    color: '#3B82F6',
    description: 'Soothing rainfall for deep sleep',
    source: AUDIO_FILES.nature,
  },
  {
    id: 'vedic',
    name: 'Vedic Chants',
    icon: 'om',
    color: '#F59E0B',
    description: 'Ancient mantras for deep focus',
    source: AUDIO_FILES.vedic,
  },
  {
    id: 'silence',
    name: 'Pure Silence',
    icon: 'volume-off',
    color: '#6B7280',
    description: 'Deep stillness and awareness',
    uri: null,
  },
];

export default function Meditation() {
  const router = useRouter();
  const { token, user } = useAuth();
  const THEME_COLOR = useThemeColor();
  const { autoStart, trackId } = useLocalSearchParams();
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

  const [meditating, setMeditating] = useState(false);
  const [paused, setPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(10 * 60); // 10 minutes default
  const [selectedDuration, setSelectedDuration] = useState(10 * 60);
  const [breakTimeRemaining, setBreakTimeRemaining] = useState(2 * 60); // 2 min break limit
  const [awarenessProbe, setAwarenessProbe] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Animation Shared Value
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Breathing Animation Effect
  useEffect(() => {
    if (meditating && !paused) {
      // Breathe in (4s), Breathe out (4s)
      scale.value = withRepeat(
        withTiming(1.05, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        -1, // infinite
        true // reverse
      );
    } else {
      cancelAnimation(scale);
      scale.value = withTiming(1, { duration: 500 });
    }
  }, [meditating, paused]);

  const [probeTriggered, setProbeTriggered] = useState(false);

  useEffect(() => {
    let interval: any;
    if (meditating && !paused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            completeSession();
            return 0;
          }
          return prev - 1;
        });

        // Trigger awareness probe ONLY ONCE per session (randomly)
        // Check if not already triggered, not currently probing, and random chance
        if (!probeTriggered && !awarenessProbe && Math.random() < 0.005) {
          setProbeTriggered(true);
          setAwarenessProbe(true);
          triggerHaptic('warning');
          // Ideally play a bell sound here if asset available
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [meditating, paused, timeRemaining, awarenessProbe, probeTriggered]);

  // Break Timer
  useEffect(() => {
    let interval: any;
    if (paused && breakTimeRemaining > 0) {
      interval = setInterval(() => {
        setBreakTimeRemaining((prev) => {
          if (prev <= 1) {
            handleStop(); // End session if break too long
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [paused, breakTimeRemaining]);

  useEffect(() => {
    if (autoStart && trackId) {
      setSelectedTrack(trackId as string);
    }
  }, [autoStart, trackId]);

  useEffect(() => {
    if (autoStart && selectedTrack && !meditating) {
      startMeditation();
    }
  }, [autoStart, selectedTrack]);

  const startMeditation = async () => {
    if (!selectedTrack) {
      Alert.alert('Select a Track', 'Please choose a meditation track first.');
      return;
    }

    if (user?.settings_bpm_check && !autoStart) {
      router.push({
        pathname: '/bpm-check',
        params: { phase: 'before', trackId: selectedTrack }
      });
      return;
    }

    triggerHaptic('medium');

    const track = MEDITATION_TRACKS.find(t => t.id === selectedTrack);
    if (!track) return;

    try {
      if (sound) await sound.unloadAsync();

      if (track.source) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          track.source,
          { shouldPlay: true, isLooping: true }
        );
        setSound(newSound);
      }

      setMeditating(true);
      setPaused(false);
      setProbeTriggered(false); // Reset probe for new session
      setStartTime(new Date());
      // timeRemaining is already set by duration selector, don't reset it
      setBreakTimeRemaining(2 * 60);

      if (!user?.isGuest) {
        await api.post('/api/sessions/start', {});
      }

    } catch (error) {
      console.error('Failed to start session/audio', error);
      // Alert.alert('Error', 'Could not play audio track.'); // Optional: Don't block user if tracking fails
    }
  };

  const handlePause = async () => {
    triggerHaptic('light');
    setPaused(true);
    if (sound) {
      await sound.pauseAsync();
    }
  };

  const handleResume = async () => {
    triggerHaptic('light');
    setPaused(false);
    if (sound) {
      await sound.playAsync();
    }
  };


  const handleStop = async () => {
    triggerHaptic('heavy');
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
    setMeditating(false);
    setPaused(false);
    setAwarenessProbe(false);
    // Don't reset timeRemaining here - let the calling code decide
  };

  const completeSession = async () => {
    triggerHaptic('success');
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
    setMeditating(false);

    if (user?.settings_bpm_check) {
      router.push({
        pathname: '/bpm-check',
        params: {
          phase: 'after',
          trackId: selectedTrack,
          awarenessPassed: 'true'
        }
      });
      return;
    }

    try {
      let data = { next_detox_duration: 1800 }; // Default for guest

      if (!user?.isGuest) {
        const res: any = await api.post('/api/sessions/complete', {
          track_type: selectedTrack,
          completed: true,
          bpm_verified: true,
          awareness_probe_passed: true,
          duration_seconds: selectedDuration
        });
        data = res;
      }

      // Auto-route to Detox with calculated duration
      // data.next_detox_duration is in seconds from backend
      triggerHaptic('success');

      // LOGIC CHANGE: Do NOT auto-redirect. Allow repeat.
      Alert.alert(
        'Meditation Complete',
        'Today’s meditation completed. You can do more meditation to earn extra points.',
        [
          {
            text: 'Start Detox Mode',
            onPress: () => {
              router.push({
                pathname: '/detox',
                params: {
                  autoStart: 'true',
                  duration: data.next_detox_duration || 1800
                }
              });
            }
          },
          {
            text: 'Meditate Again',
            style: 'cancel',
            onPress: () => {
              // Reset state for new session
              setMeditating(false);
              setPaused(false);
              setAwarenessProbe(false);
              // Maybe reset timer? Keeping selectedDuration.
              setTimeRemaining(selectedDuration);
            }
          }
        ]
      );

    } catch (error) {
      console.error('Completion error', error);
      // Fallback for error to still allow progress if offline?
      // For now just log.
    }
  };

  const handleAwarenessResponse = () => {
    triggerHaptic('medium');
    setAwarenessProbe(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (meditating) {
    return (
      <View style={styles.meditatingContainer}>
        <TouchableOpacity
          style={styles.closeButtonAbsolute}
          onPress={() => {
            handlePause();
            Alert.alert(
              'Exit Session?',
              'Exiting now will end your session.',
              [
                { text: 'Resume', style: 'cancel', onPress: handleResume },
                {
                  text: 'Exit',
                  style: 'destructive',
                  onPress: async () => {
                    await handleStop();
                    router.back();
                  }
                }
              ]
            );
          }}
        >
          <MaterialCommunityIcons name="close" size={28} color="#FFFFFF" opacity={0.7} />
        </TouchableOpacity>

        {awarenessProbe && (
          <View style={styles.probeOverlay}>
            <MaterialCommunityIcons name="bell-ring" size={60} color="#F59E0B" />
            <Text style={styles.probeText}>Are you still present?</Text>
            <TouchableOpacity style={[styles.probeButton, { backgroundColor: THEME_COLOR }]} onPress={handleAwarenessResponse}>
              <Text style={styles.probeButtonText}>Still Present ✓</Text>
            </TouchableOpacity>
          </View>
        )}

        {paused && (
          <View style={styles.pausedOverlay}>
            <Text style={styles.pausedTitle}>Session Paused</Text>
            <Text style={[styles.pausedTimer, { color: THEME_COLOR }]}>Resuming in {formatTime(breakTimeRemaining)}</Text>
            <Text style={styles.pausedHint}>Session ends if timer runs out.</Text>
            <TouchableOpacity style={[styles.resumeButton, { backgroundColor: THEME_COLOR }]} onPress={handleResume}>
              <MaterialCommunityIcons name="play" size={32} color="white" />
              <Text style={styles.resumeText}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.exitSessionButton}
              onPress={() => {
                Alert.alert(
                  'Exit Session?',
                  'Exiting now will end your meditation session without saving progress.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Exit',
                      style: 'destructive',
                      onPress: async () => {
                        await handleStop();
                        router.back();
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={styles.exitSessionText}>Exit Session</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.timerContainer}>
          <Text style={[styles.timerText, { color: THEME_COLOR }]}>{formatTime(timeRemaining)}</Text>
          <Text style={styles.timerLabel}>Remaining</Text>
        </View>

        <View style={[styles.meditationImageContainer, animatedStyle]}>
          <LottieView
            source={{
              uri: user?.settings_gender === 'female'
                ? "https://lottie.host/d66e81d2-5fe5-4cc8-abb4-5283462ee3c6/2FiRCfnpgp.lottie"
                : "https://lottie.host/fdf7a741-0f0d-40cd-bdf0-63330dfe4a17/lNe0vk8p4k.lottie"
            }}
            loop
            autoPlay
            style={{ width: '100%', height: 250 }}
          />
        </View>

        <Text style={styles.breatheText}>{paused ? 'Paused' : 'Breathe...'}</Text>

        <View style={styles.controlsRow}>
          {!paused && (
            <TouchableOpacity
              style={[styles.pauseButton, { backgroundColor: THEME_COLOR }]}
              onPress={handlePause}
            >
              <MaterialCommunityIcons name="pause" size={32} color="white" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.stopButton}
            onPress={() => {
              // Pause while confirming
              handlePause();
              Alert.alert(
                'Stop Meditation?',
                'Stopping now will not count towards your streak.',
                [
                  { text: 'Resume', style: 'cancel', onPress: handleResume },
                  {
                    text: 'End Session',
                    style: 'destructive',
                    onPress: async () => {
                      await handleStop();
                      router.back();
                    },
                  },
                ]
              );
            }}
          >
            <Text style={styles.stopButtonText}>Stop</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Choose Your Path</Text>
      </View>

      <View style={styles.tracksContainer}>
        {MEDITATION_TRACKS.map(track => (
          <TouchableOpacity
            key={track.id}
            style={[
              styles.trackCard,
              selectedTrack === track.id && { borderColor: THEME_COLOR, backgroundColor: THEME_COLOR + '20' },
            ]}
            onPress={() => {
              triggerHaptic('selection');
              setSelectedTrack(track.id);
            }}
          >
            <View style={[styles.trackIcon, { backgroundColor: track.color + '20' }]}>
              <MaterialCommunityIcons name={track.icon as any} size={32} color={track.color} />
            </View>
            <View style={styles.trackInfo}>
              <Text style={styles.trackName}>{track.name}</Text>
              <Text style={styles.trackDescription}>{track.description}</Text>
            </View>
            {selectedTrack === track.id && (
              <MaterialCommunityIcons name="check-circle" size={24} color={THEME_COLOR} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoCard}>
        <MaterialCommunityIcons name="clock-outline" size={24} color={THEME_COLOR} />
        <Text style={styles.infoText}>
          Duration: {timeRemaining / 60} Minutes
        </Text>
      </View>

      <View style={styles.durationSelector}>
        {[5, 10, 20].map(min => (
          <TouchableOpacity
            key={min}
            style={[
              styles.durationOption,
              timeRemaining === min * 60 && { backgroundColor: THEME_COLOR, borderColor: THEME_COLOR }
            ]}
            onPress={() => {
              triggerHaptic('selection');
              setTimeRemaining(min * 60);
              setSelectedDuration(min * 60);
            }}
          >
            <Text style={[styles.durationText, timeRemaining === min * 60 && { color: '#FFF' }]}>{min}m</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.startButton, { backgroundColor: THEME_COLOR }, !selectedTrack && styles.startButtonDisabled]}
        onPress={startMeditation}
        disabled={!selectedTrack}
      >
        <Text style={styles.startButtonText}>Begin Meditation</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tracksContainer: {
    padding: 24,
    paddingTop: 0,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#2D2D3D',
  },
  trackIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  trackDescription: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#1F1F2E',
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#D1D5DB',
    marginLeft: 12,
    lineHeight: 20,
  },
  startButton: {
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  meditatingContainer: {
    flex: 1,
    backgroundColor: '#0F0F1E',
    alignItems: 'center',
    justifyContent: 'space-evenly', // Better vertical distribution
    padding: 24,
    paddingTop: 40,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 0,
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
  },
  timerLabel: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
  },
  breatheText: {
    fontSize: 24,
    color: '#D1D5DB',
    marginTop: 0,
  },
  stopButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  stopButtonText: {
    color: '#EF4444',
    fontSize: 14,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 48,
    gap: 24,
  },
  pauseButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pausedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  pausedTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  pausedTimer: {
    fontSize: 24,
    marginBottom: 8,
  },
  pausedHint: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 48,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  resumeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  probeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F0F1EF0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  probeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 32,
  },
  probeButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  probeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  meditationImage: {
    width: '100%',
    height: 250,
    resizeMode: 'contain',
    marginVertical: 20,
  },
  meditationImageContainer: {
    width: '100%',
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  durationSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  durationOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2D3D',
    backgroundColor: '#1F1F2E',
    minWidth: 80,
    alignItems: 'center',
  },
  durationText: {
    color: '#9CA3AF',
    fontWeight: '600',
    fontSize: 16,
  },
  closeButtonAbsolute: {
    position: 'absolute',
    top: 50,
    left: 24,
    zIndex: 50,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  exitSessionButton: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  exitSessionText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
