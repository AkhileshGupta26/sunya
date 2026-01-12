import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface SessionStatusProps {
    todaySession: any;
    graceTimeRemaining: number | null;
    themeColor: string;
    formatTime: (seconds: number) => string;
}

export const SessionStatus: React.FC<SessionStatusProps> = ({
    todaySession,
    graceTimeRemaining,
    themeColor,
    formatTime,
}) => {
    const router = useRouter();

    const handleWakeUp = () => {
        router.push('/wake-up');
    };

    if (todaySession?.completed) {
        return (
            <View style={styles.completedCard}>
                <MaterialCommunityIcons name="check-circle" size={60} color="#10B981" />
                <Text style={styles.completedTitle}>Today's Meditation Complete!</Text>
                <Text style={styles.completedSubtitle}>See you tomorrow morning</Text>
            </View>
        );
    }

    if (todaySession && graceTimeRemaining !== null && graceTimeRemaining > 0) {
        return (
            <View style={styles.graceCard}>
                <MaterialCommunityIcons name="clock-outline" size={48} color="#F59E0B" />
                <Text style={styles.graceTitle}>Grace Period Active</Text>
                <Text style={styles.graceTimer}>{formatTime(graceTimeRemaining)}</Text>
                <Text style={styles.graceSubtitle}>Time remaining to meditate</Text>
                <TouchableOpacity style={[styles.meditateButton, { backgroundColor: themeColor }]} onPress={() => router.push('/meditation')}>
                    <Text style={styles.meditateButtonText}>Start Meditation</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <TouchableOpacity style={[styles.wakeUpCard, { borderColor: themeColor }]} onPress={handleWakeUp}>
            <MaterialCommunityIcons name="weather-sunny" size={60} color={themeColor} />
            <Text style={styles.wakeUpTitle}>Begin Your Sacred Morning</Text>
            <Text style={styles.wakeUpSubtitle}>Tap to start your 30-minute grace period</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    wakeUpCard: {
        backgroundColor: '#1F1F2E',
        marginHorizontal: 24,
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#7C3AED',
    },
    wakeUpTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 16,
        textAlign: 'center',
    },
    wakeUpSubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
        textAlign: 'center',
    },
    graceCard: {
        backgroundColor: '#1F1F2E',
        marginHorizontal: 24,
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#F59E0B',
    },
    graceTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 12,
    },
    graceTimer: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#F59E0B',
        marginTop: 8,
    },
    graceSubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 4,
    },
    meditateButton: {
        backgroundColor: '#7C3AED',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 16,
    },
    meditateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    completedCard: {
        backgroundColor: '#1F1F2E',
        marginHorizontal: 24,
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#10B981',
    },
    completedTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 16,
    },
    completedSubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
    },
});
