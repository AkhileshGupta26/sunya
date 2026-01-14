import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useAuth } from '../contexts/AuthContext';
import { useThemeColor } from '../hooks/useThemeColor';

export default function WakeUp() {
  const router = useRouter();
  const { user } = useAuth();
  const THEME_COLOR = useThemeColor();

  const handleContinue = () => {
    Speech.speak('The path to peace begins now. Choose your meditation when you are ready.');
    setTimeout(() => {
      router.push('/meditation');
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <View style={{ height: 250, width: 250, marginBottom: 20 }}>
        <DotLottieReact
          src={
            user?.settings_gender?.toLowerCase() === 'female'
              ? "https://lottie.host/d66e81d2-5fe5-4cc8-abb4-5283462ee3c6/2FiRCfnpgp.lottie"
              : "https://lottie.host/fdf7a741-0f0d-40cd-bdf0-63330dfe4a17/lNe0vk8p4k.lottie"
          }
          loop
          autoplay
        />
      </View>

      <Text style={styles.title}>Good Morning!</Text>
      <Text style={styles.message}>
        Your 30-minute grace period has begun.
      </Text>
      <Text style={styles.subtitle}>
        Use this time to find your center, prepare your space, and when ready,
        begin your 10-minute meditation.
      </Text>

      <View style={styles.timerInfo}>
        <MaterialCommunityIcons name="clock-outline" size={32} color={THEME_COLOR} />
        <Text style={styles.timerText}>Grace timer is running</Text>
      </View>

      <TouchableOpacity style={[styles.continueButton, { backgroundColor: THEME_COLOR }]} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continue to Meditation</Text>
        <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={[styles.backButtonText, { color: THEME_COLOR }]}>Return to Home</Text>
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
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
  },
  message: {
    fontSize: 20,
    color: '#F59E0B',
    marginTop: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  timerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    backgroundColor: '#1F1F2E',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  timerText: {
    fontSize: 16,
    color: '#D1D5DB',
    marginLeft: 12,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 48,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  backButton: {
    marginTop: 16,
  },
  backButtonText: {
    color: '#7C3AED',
    fontSize: 14,
  },
});