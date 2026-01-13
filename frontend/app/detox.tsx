import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, AppState, Alert, Image, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColor } from '../hooks/useThemeColor';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

export default function Detox() {
    const router = useRouter();
    const { token, refreshUser, user } = useAuth();

    // Original State
    const [timeLeft, setTimeLeft] = useState(1800); // Default placeholder
    const [customDuration, setCustomDuration] = useState(30); // Manual selection in minutes
    const [isActive, setIsActive] = useState(false);
    const [pointsEarned, setPointsEarned] = useState(0);
    // @ts-ignore: detox_streak might not be in the type hint yet but is in backend
    const [detoxStreak, setDetoxStreak] = useState(user?.detox_streak || 0);
    const [isFailed, setIsFailed] = useState(false);



    const startTimeRef = useRef<number | null>(null);
    const appState = useRef(AppState.currentState);

    const THEME_COLOR = useThemeColor();

    // Auto-Destox Params
    const params = useLocalSearchParams();
    const { autoStart, duration } = params;

    useEffect(() => {
        // Handle Auto-Start from Meditation
        if (autoStart === 'true' && duration) {
            setupAutoDetox(parseInt(duration as string));
        } else {
            // Check for existing/ongoing session
            checkExistingSession();
        }

        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                syncTimer();
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, []);

    useEffect(() => {
        let interval: any;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        completeDetox();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const checkExistingSession = async () => {
        try {
            const storedStart = await AsyncStorage.getItem('detox_start_time');
            const storedDuration = await AsyncStorage.getItem('detox_duration');

            if (storedStart && storedDuration) {
                const start = parseInt(storedStart);
                const totalDuration = parseInt(storedDuration);
                const elapsed = Math.floor((Date.now() - start) / 1000);
                const remaining = totalDuration - elapsed;

                startTimeRef.current = start;

                if (remaining > 0) {
                    setTimeLeft(remaining);
                    setIsActive(true);
                } else {
                    setTimeLeft(0);
                    setIsActive(true);
                }
            }
        } catch (e) {
            console.error("Failed to restore session", e);
        }
    };

    const syncTimer = async () => {
        if (!startTimeRef.current && isActive) return;

        let start = startTimeRef.current;
        if (!start) {
            const stored = await AsyncStorage.getItem('detox_start_time');
            if (stored) start = parseInt(stored);
        }

        if (start) {
            const elapsed = Math.floor((Date.now() - start) / 1000);

            const storedDuration = await AsyncStorage.getItem('detox_duration');
            const totalDuration = storedDuration ? parseInt(storedDuration) : (timeLeft + elapsed); // fallback

            const remaining = totalDuration - elapsed;

            if (remaining <= 0) {
                setTimeLeft(0);
            } else {
                setTimeLeft(remaining);
            }
        }
    };

    const setupAutoDetox = async (seconds: number) => {
        const start = Date.now();
        await AsyncStorage.setItem('detox_start_time', start.toString());
        await AsyncStorage.setItem('detox_duration', seconds.toString());

        startTimeRef.current = start;
        setTimeLeft(seconds);
        setIsActive(true);
    };

    const startManualDetox = async () => {
        const seconds = customDuration * 60;
        await setupAutoDetox(seconds);
    };

    const cancelDetox = async () => {
        setIsActive(false);
        setTimeLeft(1800);
        startTimeRef.current = null;
        await AsyncStorage.removeItem('detox_start_time');
        await AsyncStorage.removeItem('detox_duration');
        if (autoStart) {
            router.replace('/(tabs)/home');
        } else {
            router.back();
        }
    };

    const completeDetox = async () => {
        const storedDuration = await AsyncStorage.getItem('detox_duration');
        const durationSecs = storedDuration ? parseInt(storedDuration) : 1800;
        const minutes = Math.floor(durationSecs / 60);

        try {
            const response = await fetch(`${API_URL}/api/detox/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ duration_minutes: minutes })
            });

            if (response.ok) {
                const data = await response.json();
                setPointsEarned(data.points_earned);
                if (data.detox_streak) setDetoxStreak(data.detox_streak);

                await refreshUser();

                await AsyncStorage.removeItem('detox_start_time');
                await AsyncStorage.removeItem('detox_duration');

                startTimeRef.current = null;
                setIsActive(false);
                setTimeLeft(0);
                Alert.alert('Digital Detox Complete', `You earned ${data.points_earned} points!`);
            }
        } catch (error) {
            console.error('Failed to complete detox', error);
        }
    };

    const retryDetox = () => {
        setIsFailed(false);
        setIsActive(false);
        setTimeLeft(1800);
        setCustomDuration(30);
    };

    const formatTime = (seconds: number) => {
        if (seconds < 0) return "00:00";
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (pointsEarned > 0) {
        return (
            <View style={styles.container}>
                <MaterialCommunityIcons name="star-face" size={100} color="#F59E0B" />
                <Text style={styles.title}>Detox Complete!</Text>
                <Text style={styles.points}>+{pointsEarned} Points</Text>
                <Text style={styles.subtitle}>You disconnected to reconnect.</Text>

                <TouchableOpacity style={[styles.button, { backgroundColor: THEME_COLOR }]} onPress={() => router.replace('/(tabs)/home')}>
                    <Text style={styles.buttonText}>Go Home</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                {!autoStart && (
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                )}
                <Text style={styles.headerTitle}>Digital Detox</Text>
                <View style={styles.streakContainer}>
                    <MaterialCommunityIcons name="lightning-bolt" size={20} color="#F59E0B" />
                    <Text style={styles.streakText}>{detoxStreak}</Text>
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

                    <TouchableOpacity style={[styles.startButton, { backgroundColor: THEME_COLOR }]} onPress={startManualDetox}>
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

                    <TouchableOpacity style={styles.giveUpButton} onPress={cancelDetox}>
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
