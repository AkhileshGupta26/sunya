import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Permission not granted for notifications');
            return;
        }

        try {
            // Expo Go SDK 53+ removed remote notifications support
            // We check if we are in Expo Go context or catch the error
            token = (await Notifications.getExpoPushTokenAsync({
                projectId: process.env.EXPO_PUBLIC_PROJECT_ID // optional, good practice
            })).data;
            console.log("Push Token:", token);
        } catch (error) {
            console.warn("Skipping Push Token generation (likely Expo Go limitation):", error);
        }
    } else {
        // console.log('Must use physical device for Push Notifications');
    }

    return token;
}

export async function scheduleDailyReminder(hour: number, minute: number, title: string, body: string) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
            // @ts-ignore
            repeats: true,
        },
    });
}

export async function setupSmartNotifications() {
    if (Platform.OS === 'web') return;

    const hasSetup = await import('@react-native-async-storage/async-storage').then(m => m.default.getItem('notifications_setup_v1'));
    if (hasSetup === 'true') {
        // Already setup, maybe verify permissions but don't reschedule
        return;
    }

    const token = await registerForPushNotificationsAsync();
    // Even if token is null (no remote push), we can still do local notifications if permissions granted

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    // Clear old ones to be safe on first setup
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Morning Reminder (7:00 AM)
    await scheduleDailyReminder(7, 0, "Morning Clarity ☀️", "Start your day with intention. 10 minutes for yourself.");

    // Streak Saver (8:00 PM)
    await scheduleDailyReminder(20, 0, "Keep Your Streak 🔥", "Don't break the chain! Complete your session today.");

    await import('@react-native-async-storage/async-storage').then(m => m.default.setItem('notifications_setup_v1', 'true'));
    console.log('[Notifications] Smart notifications scheduled');
}
