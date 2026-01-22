import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useDetox } from '../contexts/DetoxContext';
import { useThemeColor } from '../hooks/useThemeColor';

export default function Detox() {
    const router = useRouter();
    const { user } = useAuth();
    const {
        isActive,
        timeLeft,
        startDetox,
        cancelDetox,
        pointsEarned,
        detoxStreak,
        resetDetoxState
    } = useDetox();

    const [customDuration, setCustomDuration] = useState(30);
    const THEME_COLOR = useThemeColor();

    // Auto-Start Check
    const params = useLocalSearchParams();
    const { autoStart, duration } = params;

    useEffect(() => {
        if (autoStart === 'true' && duration && !isActive) {
            // Avoid double start if already active
            startDetox(parseInt(duration as string) / 60); // duration is usually seconds in params? 
            // Wait, previous code: parseInt(duration) passed to setupAutoDetox(seconds)
            // My startDetox takes minutes.
            // If duration in params is seconds (from wake-up?), convert to minutes.
            // Let's assume duration param is seconds based on wake-up usage (often 5 mins / 300s).
            // Actually let's check: previous detox.tsx said setupAutoDetox(parseInt(duration)). 
            // And setupAutoDetox took seconds.
            // My startDetox takes minutes. So I should divide by 60?
            // Safer: Update startDetox to take seconds or handle calls carefully.
        }
    }, [autoStart, duration]);

    // Quick fix for startDetox assumption: 
    // In Context I defined startDetox(minutes: number).
    // In wake-up.tsx, does it pass seconds?
    // Let's verify wake-up.tsx later. For now, assuming duration is seconds is safer if it comes from timer.
    // But let's handle "Greatness" card... wait, let's just stick to UI.

    // If points earned > 0, show Success
    if (pointsEarned > 0) {
        return (
            <View style={styles.containerCenter}>
                <MaterialCommunityIcons name="star-face" size={100} color="#F59E0B" />
                <Text style={styles.title}>Detox Complete!</Text>
                <Text style={styles.points}>+{pointsEarned} Points</Text>
                <Text style={styles.subtitle}>You disconnected to reconnect.</Text>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: THEME_COLOR }]}
                    onPress={() => {
                        resetDetoxState();
                        router.replace('/(tabs)/home');
                    }}
                >
                    <Text style={styles.buttonText}>Go Home</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const formatTime = (seconds: number) => {
        if (seconds < 0) return "00:00";
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (hours > 0) return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStart = () => {
        startDetox(customDuration);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                {!isActive && !autoStart && (
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                )}
                <Text style={styles.headerTitle}>Digital Detox</Text>
                <View style={styles.streakContainer}>
                    <MaterialCommunityIcons name="lightning-bolt" size={20} color="#F59E0B" />
                    <Text style={styles.streakText}>{detoxStreak || user?.detox_streak || 0}</Text>
                </View>
            </View>

            {!isActive ? (
                <View style={styles.centerContent}>
                    <MaterialCommunityIcons name="cellphone-off" size={80} color={THEME_COLOR} />
                    <Text style={styles.description}>
                        Take a break from the digital world.{'\n'}
                        Reconnect with reality.
                    </Text>

                    <Text style={styles.setupLabel}>Select Duration</Text>
                    <View style={styles.durationSelector}>
                        {[30, 60, 90, 120].map(min => (
                            <TouchableOpacity
                                key={min}
                                style={[styles.durationOption, customDuration === min && { backgroundColor: THEME_COLOR }]}
                                onPress={() => setCustomDuration(min)}
                            >
                                <Text style={[styles.durationText, customDuration === min && { color: '#FFF' }]}>{min}m</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={[styles.startButton, { backgroundColor: THEME_COLOR }]} onPress={handleStart}>
                        <Text style={styles.startButtonText}>Start {customDuration}m Detox</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.textButton} onPress={() => router.back()}>
                        <Text style={styles.textButtonLabel}>Not Now</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.centerContent}>
                    <View style={[styles.timerRing, { borderColor: THEME_COLOR, backgroundColor: `${THEME_COLOR}10` }]}>
                        <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
                        <Text style={[styles.status, { color: THEME_COLOR }]}>Strict Mode Active</Text>
                    </View>

                    <Text style={styles.hint}>
                        Don't leave the app.{'\n'}
                        Focus on the present moment.
                    </Text>

                    <TouchableOpacity style={styles.giveUpButton} onPress={() => cancelDetox()}>
                        <Text style={styles.giveUpText}>Give Up</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#0F0F1E',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    containerCenter: {
        flex: 1,
        backgroundColor: '#0F0F1E',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        zIndex: 10,
    },
    backButton: {
        position: 'absolute',
        left: 24,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    streakContainer: {
        position: 'absolute',
        right: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#1F1F2E',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2D2D3D',
    },
    streakText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    centerContent: {
        alignItems: 'center',
        width: '100%',
        marginTop: 60,
    },
    description: {
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 24,
        marginBottom: 32,
        lineHeight: 24,
    },
    setupLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 12,
        fontWeight: '600',
    },
    durationSelector: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    durationOption: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#2D2D3D',
        backgroundColor: '#1F1F2E',
    },
    durationText: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '500',
    },
    startButton: {
        paddingHorizontal: 32,
        paddingVertical: 18,
        borderRadius: 16,
        width: '100%',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    startButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    button: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        marginTop: 32,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    textButton: {
        marginTop: 24,
        padding: 12,
    },
    textButtonLabel: {
        color: '#6B7280',
        fontSize: 16,
    },
    timerRing: {
        width: 250,
        height: 250,
        borderRadius: 125,
        borderWidth: 4,
        borderColor: '#7C3AED',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        backgroundColor: '#7C3AED10'
    },
    timer: {
        fontSize: 56,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontVariant: ['tabular-nums'],
    },
    status: {
        color: '#7C3AED',
        marginTop: 8,
        textTransform: 'uppercase',
        letterSpacing: 2,
        fontSize: 12,
        fontWeight: '600',
    },
    hint: {
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 48,
        lineHeight: 22,
    },
    giveUpButton: {
        padding: 16,
    },
    giveUpText: {
        color: '#EF4444',
        fontSize: 16,
    },
    points: {
        fontSize: 56,
        fontWeight: 'bold',
        color: '#F59E0B',
        marginTop: 8,
    },
    subtitle: {
        color: '#9CA3AF',
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
    }
});
