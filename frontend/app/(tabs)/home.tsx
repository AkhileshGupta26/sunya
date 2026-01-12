import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import Constants from 'expo-constants';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useSession } from '../../hooks/useSession';

// Components
import { HomeHeader } from '../../components/home/HomeHeader';
import { StatsDashboard } from '../../components/home/StatsDashboard';
import { SessionStatus } from '../../components/home/SessionStatus';
import { QuickDetoxCard } from '../../components/home/QuickDetoxCard';
import { DailyFocus } from '../../components/home/DailyFocus';
import { HomeSkeleton } from '../../components/home/HomeSkeleton';
import { YogaCard } from '../../components/home/YogaCard';

export default function Home() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const THEME_COLOR = useThemeColor();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use React Query Hook
  const {
    todaySession,
    isLoading: isSessionLoading,
    refetch,
    graceTimeRemaining
  } = useSession();

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refreshUser(), refetch()]);
    setIsRefreshing(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show Skeleton if loading session or user data not ready
  if (isSessionLoading && !isRefreshing) {
    return <HomeSkeleton />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={THEME_COLOR} />}
    >
      <HomeHeader themeColor={THEME_COLOR} />

      <StatsDashboard user={user} themeColor={THEME_COLOR} />

      <YogaCard themeColor={THEME_COLOR} />

      <SessionStatus
        todaySession={todaySession}
        graceTimeRemaining={graceTimeRemaining}
        themeColor={THEME_COLOR}
        formatTime={formatTime}
      />

      <QuickDetoxCard themeColor={THEME_COLOR} />

      <DailyFocus themeColor={THEME_COLOR} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
});
