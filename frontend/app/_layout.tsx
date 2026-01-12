import React, { useEffect, useState } from 'react';
import { SplashScreen } from '../components/ui/SplashScreen';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, scheduleDailyReminder } from '../utils/notifications';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, asyncStoragePersister } from '../utils/queryClient';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const [isSplashFinished, setIsSplashFinished] = useState(Platform.OS === 'web');

  useEffect(() => {
    async function setupNotifications() {
      if (Platform.OS === 'web') return; // Added web platform check

      await registerForPushNotificationsAsync();

      // Schedule defaults (In a real app, these would be based on user settings)
      await Notifications.cancelAllScheduledNotificationsAsync(); // Clear old ones for testing simplicity

      // Morning Reminder (7:00 AM)
      await scheduleDailyReminder(7, 0, "Morning Clarity ☀️", "Start your day with intention. 10 minutes for yourself.");

      // Streak Saver (8:00 PM)
      await scheduleDailyReminder(20, 0, "Keep Your Streak 🔥", "Don't break the chain! Complete your session today.");
    }

    setupNotifications();
  }, []);

  if (!isSplashFinished) {
    return <SplashScreen onFinish={() => setIsSplashFinished(true)} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: asyncStoragePersister }}
        >
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="auth/login" />
              <Stack.Screen name="auth/register" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="meditation" />
              <Stack.Screen name="yoga" />
              <Stack.Screen name="wake-up" />
              <Stack.Screen name="bpm-check" />
              <Stack.Screen name="detox" />
              <Stack.Screen name="leaderboard" />
            </Stack>
          </AuthProvider>
        </PersistQueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
