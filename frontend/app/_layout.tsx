import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SplashScreen } from '../components/ui/SplashScreen';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import AppHeader from '../components/ui/AppHeader';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, setupSmartNotifications } from '../utils/notifications';
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
    setupSmartNotifications();
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
            <View style={{ flex: 1 }}>
              <AppHeader />
              <Stack screenOptions={{ headerShown: false, contentStyle: { paddingTop: 0 } }}>
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
            </View>
          </AuthProvider>
        </PersistQueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
