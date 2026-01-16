import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeColor } from '../../hooks/useThemeColor';
import { triggerHaptic } from '../../utils/haptics';

export default function TabLayout() {
  const { user } = useAuth();
  const THEME_COLOR = useThemeColor(); // Use Hook

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1F1F2E',
          borderTopColor: '#2D2D3D',
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: THEME_COLOR,
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: () => triggerHaptic('selection'),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-line" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: () => triggerHaptic('selection'),
        }}
      />
      <Tabs.Screen
        name="contest"
        options={{
          title: 'Contest',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="trophy-outline" size={24} color={color} />
          ),
        }}
        listeners={{
          tabPress: () => triggerHaptic('selection'),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: () => triggerHaptic('selection'),
        }}
      />
    </Tabs>
  );
}
