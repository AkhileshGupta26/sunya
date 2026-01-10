import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';

export default function BPMCheck() {
  const router = useRouter();
  const { phase } = useLocalSearchParams();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (checking && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (checking && countdown === 0) {
      handleComplete();
    }
  }, [checking, countdown]);

  const startCheck = () => {
    setChecking(true);
  };

  const handleComplete = () => {
    if (phase === 'before') {
      Alert.alert(
        'BPM Recorded',
        'Heart rate captured. Begin your meditation now.',
        [
          {
            text: 'Start',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      Alert.alert(
        'BPM Verified',
        'Heart rate shows relaxation. Well done!',
        [
          {
            text: 'Complete',
            onPress: () => router.back(),
          },
        ]
      );
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons name="camera-off" size={60} color="#EF4444" />
        <Text style={styles.title}>Camera Permission Required</Text>
        <Text style={styles.subtitle}>
          We need camera access to verify your heart rate through your fingertip.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="heart-pulse" size={80} color="#EC4899" />
      
      <Text style={styles.title}>
        {phase === 'before' ? 'Pre-Meditation' : 'Post-Meditation'} BPM Check
      </Text>
      
      <Text style={styles.instructions}>
        {checking
          ? `Hold your finger steady... ${countdown}s`
          : 'Place your index finger gently over the rear camera lens'}
      </Text>

      {checking ? (
        <View style={styles.checkingContainer}>
          <View style={styles.pulse}>
            <MaterialCommunityIcons name="heart-pulse" size={48} color="#EC4899" />
          </View>
          <Text style={styles.countdown}>{countdown}</Text>
          <Text style={styles.checkingText}>Reading your heart rate...</Text>
        </View>
      ) : (
        <View style={styles.instructionCard}>
          <Text style={styles.instructionStep}>1. Ensure good lighting</Text>
          <Text style={styles.instructionStep}>2. Cover the camera completely</Text>
          <Text style={styles.instructionStep}>3. Stay still for 10 seconds</Text>
        </View>
      )}

      {!checking && (
        <TouchableOpacity style={styles.startButton} onPress={startCheck}>
          <Text style={styles.startButtonText}>Start BPM Check</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => router.back()}
      >
        <Text style={styles.skipButtonText}>Skip (Not Recommended)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  instructions: {
    fontSize: 16,
    color: '#D1D5DB',
    marginTop: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  instructionCard: {
    backgroundColor: '#1F1F2E',
    borderRadius: 12,
    padding: 20,
    marginTop: 32,
    width: '100%',
  },
  instructionStep: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 12,
  },
  checkingContainer: {
    alignItems: 'center',
    marginTop: 48,
  },
  pulse: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EC489920',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdown: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#EC4899',
    marginTop: 24,
  },
  checkingText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  startButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 48,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  skipButton: {
    marginTop: 16,
  },
  skipButtonText: {
    color: '#6B7280',
    fontSize: 12,
  },
});