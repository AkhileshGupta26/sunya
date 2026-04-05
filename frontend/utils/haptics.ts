import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type HapticType = 'light' | 'medium' | 'heavy' | 'impact' | 'selection' | 'notification' | 'success' | 'warning' | 'error';

export const triggerHaptic = (type: HapticType = 'selection') => {
    if (Platform.OS === 'web') return;

    try {
        switch (type) {
            case 'light':
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                break;
            case 'medium':
            case 'impact':
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                break;
            case 'heavy':
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                break;
            case 'selection':
                Haptics.selectionAsync();
                break;
            case 'notification':
            case 'success':
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                break;
            case 'warning':
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                break;
            case 'error':
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                break;
        }
    } catch (error) {
        console.warn('Haptic feedback failed', error);
    }
};
