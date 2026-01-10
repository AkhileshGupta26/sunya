import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="account" size={48} color="#7C3AED" />
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{user?.current_streak || 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{user?.total_days || 0}</Text>
            <Text style={styles.statLabel}>Total Days</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{user?.zen_passes || 0}</Text>
            <Text style={styles.statLabel}>Zen Passes</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="clock-outline" size={24} color="#7C3AED" />
          <Text style={styles.menuText}>Wake Time</Text>
          <Text style={styles.menuValue}>{user?.wake_time || 'Not set'}</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="bell-outline" size={24} color="#7C3AED" />
          <Text style={styles.menuText}>Notifications</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="school-outline" size={24} color="#7C3AED" />
          <Text style={styles.menuText}>Institution</Text>
          <Text style={styles.menuValue}>{user?.institution_id ? 'Joined' : 'Not joined'}</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="information-outline" size={24} color="#7C3AED" />
          <Text style={styles.menuText}>How Shunya Works</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="shield-check-outline" size={24} color="#7C3AED" />
          <Text style={styles.menuText}>Zen Passes Explained</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#7C3AED20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#7C3AED',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  email: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  statsCard: {
    backgroundColor: '#1F1F2E',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statRow: {
    flexDirection: 'row',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#2D2D3D',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F2E',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D3D',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 16,
  },
  menuValue: {
    fontSize: 14,
    color: '#9CA3AF',
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F1F2E',
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  version: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 12,
    marginTop: 24,
    marginBottom: 40,
  },
});