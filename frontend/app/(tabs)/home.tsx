import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  RefreshControl,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import Constants from 'expo-constants';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useSession } from '../../hooks/useSession';
import { triggerHaptic } from '../../utils/haptics';

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
    triggerHaptic('light');
    setIsRefreshing(true);
    await Promise.all([refreshUser(), refetch()]);
    setIsRefreshing(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Responsive Layout Logic
  const { width } = useWindowDimensions();
  const isWeb = width > 768;

  // Responsive Styles
  const contentContainerStyle = isWeb ? styles.webContainer : styles.mobileContainer;
  const cardWrapperStyle = isWeb ? styles.webCardWrapper : styles.mobileCardWrapper;

  // Show Skeleton if loading session or user data not ready
  if (isSessionLoading && !isRefreshing) {
    return <HomeSkeleton />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[contentContainerStyle, { paddingBottom: 20 }]}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={THEME_COLOR} />}
    >
      <View style={{ width: '100%', marginBottom: 16 }}>
        <HomeHeader themeColor={THEME_COLOR} />
      </View>

      <View style={{ width: '100%', marginBottom: 16 }}>
        <StatsDashboard user={user} themeColor={THEME_COLOR} />
      </View>

      {/* Row 1: Yoga & Sacred Morning (Dynamic Slot) */}
      <View style={cardWrapperStyle}>
        <YogaCard themeColor={THEME_COLOR} />
      </View>
      <View style={cardWrapperStyle}>
        {/* Dynamic Slot: Shows SessionStatus (Active/Complete) OR DailyFocus (Start) */}
        {(todaySession?.completed || (todaySession && graceTimeRemaining !== null && graceTimeRemaining > 0)) ? (
          <SessionStatus
            todaySession={todaySession}
            graceTimeRemaining={graceTimeRemaining}
            themeColor={THEME_COLOR}
            formatTime={formatTime}
          />
        ) : (
          <DailyFocus themeColor={THEME_COLOR} />
        )}
      </View>

      {/* Row 2: Detox & Stats (or other content) */}
      <View style={cardWrapperStyle}>
        <QuickDetoxCard themeColor={THEME_COLOR} />
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
  mobileContainer: {
    flexDirection: 'column',
  },
  webContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center', // Center the grid
    maxWidth: 1200, // Max width for web
    alignSelf: 'center', // Center the container itself
    width: '100%',
    paddingHorizontal: 16,
  },
  mobileCardWrapper: {
    width: '100%',
    marginBottom: 0, // Components already handle margins, but we might want to standardize
  },
  webCardWrapper: {
    width: '48%', // 2 cards per row with some gap
    marginHorizontal: '1%',
    marginBottom: 16,
  },
});
