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
    // Cancel existing similar notifications first (rudimentary deduplication)
    // For now we just schedule. In production, we'd manage IDs.

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
        },
    });
}
