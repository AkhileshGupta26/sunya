import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Switch,
  Modal,
  Linking,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCameraPermissions } from 'expo-camera';
import { useThemeColor } from '../../hooks/useThemeColor';
import * as Haptics from 'expo-haptics';
import { StreakFlame } from '../../components/ui/StreakFlame';
import { api } from '../../services/api';
import { scheduleAlarm, cancelAlarm } from '../../utils/notifications';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function Profile() {
  const router = useRouter();
  const { user, logout, token, refreshUser, updateUser } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();

  // State for modals
  const [wakeTimeModalVisible, setWakeTimeModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [zenModalVisible, setZenModalVisible] = useState(false);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  // State for settings
  const [editName, setEditName] = useState('');
  const [editGender, setEditGender] = useState('male');
  const [debugLog, setDebugLog] = useState('');

  // State for settings
  const [wakeTime, setWakeTime] = useState(user?.wake_time || '06:00');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);


  // Settings from User object
  // cameraEnabled is defined below, wait. I duplicated it.
  // I need to remove the lines I added last time or the original ones.
  // Last time I replaced lines 47-56.
  // The original lines 57-59 had cameraEnabled.

  // I will just consolidate here.
  const [cameraEnabled, setCameraEnabled] = useState(false);

  // Settings from User object
  const [bpmCheck, setBpmCheck] = useState(false);
  const [timerCheck, setTimerCheck] = useState(false);
  // Removed redundant gender state

  // Theme Colors
  const THEME_COLOR = useThemeColor();

  useEffect(() => {
    if (user) {
      setWakeTime(user.wake_time || '06:00');
      setCameraEnabled(user.settings_camera_enabled || false);
      setBpmCheck(user.settings_bpm_check || false);
      setTimerCheck(user.settings_timer_check || false);
      // @ts-ignore
      setNotificationsEnabled(user.settings_notifications_enabled || false);

      // Init edit state
      setEditName(user.name);
      setEditGender(user.settings_gender || 'male');
    }
  }, [user]);

  // ... (previous useEffects)

  useEffect(() => {
    checkRewards();
  }, []);

  const checkRewards = async () => {
    try {
      const res = await api.post('/api/contests/claim-rewards', {});
      // @ts-ignore
      if (res.new_badges && res.new_badges.length > 0) {
        Alert.alert('Congratulations! 🏆', `You earned new badges:\n${res.new_badges.join('\n')}`);
        refreshUser();
      }
    } catch (e) {
      // Silent fail
      console.log('Reward check failed', e);
    }
  };

  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      const updatedUser = await api.put('/api/user/profile', {
        name: editName,
        settings_gender: editGender
      });

      // @ts-ignore
      await updateUser(updatedUser);
      setEditProfileModalVisible(false);
      Alert.alert('Success', 'Profile updated!');

    } catch (error: any) {
      console.error('Profile update error:', error);

      if (error.status === 401) {
        Alert.alert('Session Expired', 'Please login again.');
        await logout(() => router.replace('/auth/login'));
        return;
      }

      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  // Simple toggle for local UI before saving
  const toggleEditGender = (val: string) => {
    console.log('[Profile] Toggling gender to:', val);
    setEditGender(val);
  }

  const toggleGender = (value: string) => {
    // Legacy direct toggle if used elsewhere
    updateSettings({ settings_gender: value });
  };

  const updateSettings = async (updates: any) => {
    try {
      await api.put('/api/user/settings', updates);
      refreshUser();
      return true;
    } catch (error) {
      console.error('Settings update error:', error);
      Alert.alert('Error', 'Failed to update settings');
      return false;
    }
  };

  const toggleCamera = async (value: boolean) => {
    // 1. Safety check
    if (typeof value !== 'boolean') {
      console.warn('toggleCamera received non-boolean value');
      return;
    }

    if (value) {
      try {
        let isGranted = permission?.granted;
        let canAskAgain = permission?.canAskAgain;

        // 2. If permission is undetermined, request it
        if (!permission || permission.status === 'undetermined') {
          const result = await requestPermission();
          isGranted = result.granted;
          canAskAgain = result.canAskAgain;
        }

        // 3. If NOT granted after request, handle denial
        if (!isGranted) {
          if (canAskAgain === false) {
            // Explicitly denied -> Settings
            Alert.alert(
              "Permission Required",
              "Camera access is currently denied. Please enable it in system settings.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Open Settings", onPress: () => Linking.openSettings() }
              ]
            );
          } else {
            // First time denied or dismissible -> Generic alert
            Alert.alert("Permission Required", "Camera access is needed to enable this feature.");
          }
          return;
        }
      } catch (error) {
        console.error('Camera permission request error:', error);
        Alert.alert("Error", "Failed to request camera permissions.");
        return;
      }
    }

    // 4. Update UI and Backend (Optimistic)
    setCameraEnabled(value);

    const success = await updateSettings({ camera_enabled: value });
    if (!success) {
      setCameraEnabled(!value); // Revert on failure
    }
  };

  const toggleBpm = (value: boolean) => {
    setBpmCheck(value);
    updateSettings({ bpm_check: value });
  };

  const toggleTimer = (value: boolean) => {
    setTimerCheck(value);
    updateSettings({ timer_check: value });
  };

  const toggleNotifications = (value: boolean) => {
    setNotificationsEnabled(value);
    updateSettings({ notifications_enabled: value });
  };

  const updateWakeTime = async () => {
    // Basic validation for HH:MM
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(wakeTime)) {
      Alert.alert('Invalid Time', 'Please enter time in HH:MM format (e.g., 06:30)');
      return;
    }

    try {
      await api.put('/api/user/wake-time', { wake_time: wakeTime });

      await refreshUser();
      setWakeTimeModalVisible(false);
      Alert.alert('Success', 'Wake time updated successfully');

    } catch (error) {
      console.error('Wake time update error:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };



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
            await logout(() => router.replace('/auth/login'));
          },
        },
      ]
    );
  };

  // updateSettings wrapper to handle exact key expected by backend if generic
  // Assuming backend just takes dict and updates patches.
  // We need to check useAuth's updateSettings or Profile's updateSettings implementation.
  // Profile's local updateSettings takes "updates: any".



  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setEditProfileModalVisible(true)}>
          <View style={[styles.avatar, { borderColor: THEME_COLOR, backgroundColor: `${THEME_COLOR}20` }]}>
            {/* Placeholder for Profile Pic - logic to show image if exists */}
            <MaterialCommunityIcons name="account" size={48} color={THEME_COLOR} />
            <View style={[styles.editBadge, { backgroundColor: THEME_COLOR }]}>
              <MaterialCommunityIcons name="pencil" size={14} color="white" />
            </View>
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email || 'No Account Linked'}</Text>
      </View>

      {user?.isGuest && (
        <View style={styles.guestBanner}>
          <MaterialCommunityIcons name="cloud-off-outline" size={24} color="#F59E0B" />
          <View style={styles.guestBannerText}>
            <Text style={styles.guestBannerTitle}>Guest Mode</Text>
            <Text style={styles.guestBannerDesc}>Sign up to save your stats and join circles.</Text>
          </View>
          <TouchableOpacity style={styles.guestSignUpButton} onPress={async () => {
            await logout(() => router.replace('/auth/register'));
          }}>
            <Text style={styles.guestSignUpText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <View style={styles.stat}>

            <Text style={[styles.statNumber, { color: THEME_COLOR, marginTop: 10 }]}>{user?.current_streak || 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: THEME_COLOR }]}>{user?.total_days || 0}</Text>
            <Text style={styles.statLabel}>Total Days</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: THEME_COLOR }]}>{user?.zen_passes || 0}</Text>
            <Text style={styles.statLabel}>Zen Passes</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        {/* @ts-ignore */}
        {user?.badges && user.badges.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
            {/* @ts-ignore */}
            {user.badges.map((b: string, i: number) => (
              <View key={i} style={{ backgroundColor: '#1F1F2E', borderWidth: 1, borderColor: '#7C3AED', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: '#FFFFFF', fontWeight: 'bold' }}>{b}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ color: '#6B7280', fontStyle: 'italic', marginTop: 8 }}>No badges yet. Join a contest to win!</Text>
        )}
      </View>

      {/* Removed standalone Appearance section as requested, moved to Account Settings logic or Edit Profile Modal */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permissions</Text>
        <View style={styles.menuItem}>
          <MaterialCommunityIcons name="camera-outline" size={24} color={THEME_COLOR} />
          <Text style={styles.menuText}>Camera Access</Text>
          <Switch
            value={cameraEnabled}
            onValueChange={toggleCamera}
            trackColor={{ false: "#767577", true: THEME_COLOR }}
            thumbColor={cameraEnabled ? "#FFFFFF" : "#f4f3f4"}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meditation Verification</Text>
        <View style={styles.menuItem}>
          <MaterialCommunityIcons name="heart-pulse" size={24} color={THEME_COLOR} />
          <Text style={styles.menuText}>BPM Check (Experimental)</Text>
          <Switch
            value={bpmCheck}
            onValueChange={toggleBpm}
            trackColor={{ false: "#767577", true: THEME_COLOR }}
            thumbColor={bpmCheck ? "#FFFFFF" : "#f4f3f4"}
          />
        </View>
        <View style={styles.menuItem}>
          <MaterialCommunityIcons name="timer-outline" size={24} color={THEME_COLOR} />
          <Text style={styles.menuText}>Timer Check</Text>
          <Switch
            value={timerCheck}
            onValueChange={toggleTimer}
            trackColor={{ false: "#767577", true: THEME_COLOR }}
            thumbColor={timerCheck ? "#FFFFFF" : "#f4f3f4"}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <TouchableOpacity style={styles.menuItem} onPress={() => setWakeTimeModalVisible(true)}>
          <MaterialCommunityIcons name="clock-outline" size={24} color={THEME_COLOR} />
          <Text style={styles.menuText}>Wake Time</Text>
          <Text style={styles.menuValue}>{user?.wake_time || 'Set Time'}</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
        </TouchableOpacity>

        <View style={styles.menuItem}>
          <MaterialCommunityIcons name="bell-outline" size={24} color={THEME_COLOR} />
          <Text style={styles.menuText}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: "#767577", true: THEME_COLOR }}
            thumbColor={notificationsEnabled ? "#FFFFFF" : "#f4f3f4"}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <TouchableOpacity style={styles.menuItem} onPress={() => setAboutModalVisible(true)}>
          <MaterialCommunityIcons name="information-outline" size={24} color={THEME_COLOR} />
          <Text style={styles.menuText}>How Sunya Works</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => setZenModalVisible(true)}>
          <MaterialCommunityIcons name="shield-check-outline" size={24} color={THEME_COLOR} />
          <Text style={styles.menuText}>Zen Passes Explained</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/privacy-policy')}>
          <MaterialCommunityIcons name="shield-lock-outline" size={24} color={THEME_COLOR} />
          <Text style={styles.menuText}>Privacy Policy</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* ... Rest of render ... */}

      {user?.isGuest ? (
        <TouchableOpacity style={[styles.logoutButton, { borderColor: THEME_COLOR }]} onPress={async () => {
          await logout(() => router.replace('/auth/login'));
        }}>
          <MaterialCommunityIcons name="login" size={20} color={THEME_COLOR} />
          <Text style={[styles.logoutText, { color: THEME_COLOR }]}>Log In / Sign Up</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.version}>Version 1.0.0</Text>

      <View style={{ alignItems: 'center', marginBottom: 40, marginTop: -20 }}>
        <Text style={{ color: '#6B7280', fontSize: 12 }}>Made with ❤️ in India</Text>
        <TouchableOpacity onPress={() => router.push('/developer')} style={{ marginTop: 8 }}>
          <Text style={{ color: THEME_COLOR, fontSize: 12, fontWeight: '600' }}>Know Developer</Text>
        </TouchableOpacity>
      </View>

      {/* Wake Time Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={wakeTimeModalVisible}
        onRequestClose={() => setWakeTimeModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={[styles.modalTitle, { color: THEME_COLOR }]}>Set Wake Time</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              placeholderTextColor="#9CA3AF"
              value={wakeTime}
              onChangeText={setWakeTime}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setWakeTimeModalVisible(false)}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSave, { backgroundColor: THEME_COLOR }]}
                onPress={updateWakeTime}
              >
                <Text style={styles.textStyle}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={aboutModalVisible}
        onRequestClose={() => setAboutModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={[styles.modalTitle, { color: THEME_COLOR }]}>How Sunya Works</Text>
            <Text style={styles.modalBody}>
              Sunya is your digital sanctuary for mindfulness. Start your day with a calm wake-up routine, meditate daily to build your streak, and join circles to stay accountable with friends and family.
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setAboutModalVisible(false)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Zen Pass Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={zenModalVisible}
        onRequestClose={() => setZenModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={[styles.modalTitle, { color: THEME_COLOR }]}>Zen Passes</Text>
            <Text style={styles.modalBody}>
              Consistency is key, but life happens. You earn a Zen Pass for every 10 days of continuous meditation. Use a pass to maintain your streak if you miss a day!
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setZenModalVisible(false)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editProfileModalVisible}
        onRequestClose={() => setEditProfileModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={[styles.modalTitle, { color: THEME_COLOR }]}>Edit Profile</Text>

            <Text style={styles.inputLabel}>Display Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              placeholderTextColor="#9CA3AF"
              value={editName}
              onChangeText={setEditName}
            />

            <Text style={styles.inputLabel}>Gender Theme</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[styles.genderOption, editGender === 'male' && { borderColor: '#2DD4BF', backgroundColor: '#2DD4BF20' }]}
                onPress={() => toggleEditGender('male')}
              >
                <MaterialCommunityIcons name="gender-male" size={24} color={editGender === 'male' ? '#2DD4BF' : '#6B7280'} />
                <Text style={[styles.genderText, editGender === 'male' ? { color: '#2DD4BF' } : { color: '#6B7280' }]}>Male</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.genderOption, editGender === 'female' && { borderColor: '#FB7185', backgroundColor: '#FB718520' }]}
                onPress={() => toggleEditGender('female')}
              >
                <MaterialCommunityIcons name="gender-female" size={24} color={editGender === 'female' ? '#FB7185' : '#6B7280'} />
                <Text style={[styles.genderText, editGender === 'female' ? { color: '#FB7185' } : { color: '#6B7280' }]}>Female</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setEditProfileModalVisible(false)}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSave, { backgroundColor: THEME_COLOR }]}
                onPress={handleUpdateProfile}
                disabled={isUpdating}
              >
                {isUpdating ? <ActivityIndicator color="white" /> : <Text style={styles.textStyle}>Save Changes</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>



      {/* Alarm Time Modal */}



    </ScrollView >
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
  // Modal Styles
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: '#1F1F2E',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 15,
  },
  modalBody: {
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#2D2D3D',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    color: '#FFFFFF',
    paddingHorizontal: 15,
    fontSize: 24,
    textAlign: 'center',
    backgroundColor: '#0F0F1E',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonClose: {
    backgroundColor: '#4B5563',
  },
  buttonSave: {
    backgroundColor: '#7C3AED',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  genderRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 16,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#1F1F2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2D3D',
    gap: 8,
  },
  genderText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1F1F2E',
  },
  inputLabel: {
    alignSelf: 'flex-start',
    color: '#9CA3AF',
    marginBottom: 8,
    fontSize: 14,
    marginLeft: 4,
  },
  guestBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)', // Amber low opacity
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  guestBannerText: {
    flex: 1,
  },
  guestBannerTitle: {
    color: '#F59E0B',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  guestBannerDesc: {
    color: '#D1D5DB',
    fontSize: 12,
  },
  guestSignUpButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  guestSignUpText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
