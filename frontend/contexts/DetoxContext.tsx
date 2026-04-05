import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import Constants from 'expo-constants';
import { useAuth } from './AuthContext';
import { triggerHaptic } from '../utils/haptics';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

interface DetoxContextType {
    isActive: boolean;
    timeLeft: number;
    startDetox: (minutes: number) => Promise<void>;
    cancelDetox: () => Promise<void>;
    completeDetox: () => Promise<void>;
    pointsEarned: number;
    detoxStreak: number;
    isFailed: boolean;
    resetDetoxState: () => void;
}

const DetoxContext = createContext<DetoxContextType | undefined>(undefined);

export const DetoxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const router = useRouter();
    const segments = useSegments();
    const { token, refreshUser, user } = useAuth();

    // State
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [pointsEarned, setPointsEarned] = useState(0);
    const [detoxStreak, setDetoxStreak] = useState(0);
    const [isFailed, setIsFailed] = useState(false);

    const startTimeRef = useRef<number | null>(null);
    const durationRef = useRef<number | null>(null);
    const appState = useRef(AppState.currentState);

    // Initial Load & AppState Monitoring
    useEffect(() => {
        checkExistingSession();

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, []);

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
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

    // Navigation Guard (Enforce Detox Screen)
    useEffect(() => {
        if (!isActive) return;

        // If active, user must be on 'detox' screen
        // segments array might be empty initially or ['detox']
        // We want to redirect TO detox if they are NOT there.
        const currentRoute = segments[segments.length - 1];

        // Simple check: if not already on detox, push detox
        // We need to be careful about infinite loops or replace vs push
        if (currentRoute !== 'detox') {
            // Using replace to prevent going back
            router.replace('/detox');
        }
    }, [isActive, segments]);

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
        if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
            await syncTimer();
        }
        appState.current = nextAppState;
    };

    const checkExistingSession = async () => {
        try {
            const storedStart = await AsyncStorage.getItem('detox_start_time');
            const storedDuration = await AsyncStorage.getItem('detox_duration');

            if (storedStart && storedDuration) {
                const start = parseInt(storedStart);
                const totalDuration = parseInt(storedDuration);
                const elapsed = Math.floor((Date.now() - start) / 1000);
                const remaining = totalDuration - elapsed;

                if (remaining > 0) {
                    startTimeRef.current = start;
                    durationRef.current = totalDuration;
                    setTimeLeft(remaining);
                    setIsActive(true);
                } else if (remaining <= 0 && remaining > -300) {
                    // If it finished recently (within 5 mins) while closed, verify completion?
                    // For now, let's just complete it
                    // completeDetox(); // Dangerous if not ready, maybe just reset or let user see 'Complete'
                    // Let's set time to 0 and active, so UI shows specific state?
                    setTimeLeft(0);
                    setIsActive(true);
                } else {
                    // Stale session
                    await AsyncStorage.removeItem('detox_start_time');
                    await AsyncStorage.removeItem('detox_duration');
                }
            }
        } catch (e) {
            console.error("Failed to restore detox session", e);
        }
    };

    const syncTimer = async () => {
        if (!startTimeRef.current) {
            const stored = await AsyncStorage.getItem('detox_start_time');
            if (stored) startTimeRef.current = parseInt(stored);
        }

        if (startTimeRef.current && isActive) {
            const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);

            // Re-fetch duration just in case
            let totalDuration = durationRef.current;
            if (!totalDuration) {
                const storedDur = await AsyncStorage.getItem('detox_duration');
                if (storedDur) totalDuration = parseInt(storedDur);
            }

            if (totalDuration) {
                const remaining = totalDuration - elapsed;
                if (remaining <= 0) {
                    setTimeLeft(0);
                    // Do not auto complete here, wait for tick or manual?
                    // completeDetox(); 
                } else {
                    setTimeLeft(remaining);
                }
            }
        }
    };

    const startDetox = async (minutes: number) => {
        const seconds = minutes * 60;
        const start = Date.now();

        await AsyncStorage.setItem('detox_start_time', start.toString());
        await AsyncStorage.setItem('detox_duration', seconds.toString());

        startTimeRef.current = start;
        durationRef.current = seconds;
        setTimeLeft(seconds);
        setIsActive(true);
        router.replace('/detox');
    };

    const cancelDetox = async () => {
        setIsActive(false);
        setTimeLeft(0);
        startTimeRef.current = null;
        durationRef.current = null;
        await AsyncStorage.removeItem('detox_start_time');
        await AsyncStorage.removeItem('detox_duration');
        router.replace('/(tabs)/home');
    };

    const completeDetox = async () => {
        // Logic similar to original detox.tsx
        const minutes = Math.floor((durationRef.current || 1800) / 60);

        if (user?.isGuest) {
            await clearSession();
            setPointsEarned(minutes * 10);
            triggerHaptic('success');
            return;
        }

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
                await clearSession();
                triggerHaptic('success');
            }
        } catch (error) {
            console.error('Failed to complete detox', error);
            // Even if API fails, we should stop the timer locally?
            // Maybe keep it at 0?
        }
    };

    const clearSession = async () => {
        await AsyncStorage.removeItem('detox_start_time');
        await AsyncStorage.removeItem('detox_duration');
        startTimeRef.current = null;
        durationRef.current = null;
        setIsActive(false);
        // Note: We keep pointsEarned > 0 so UI can show success screen
    };

    const resetDetoxState = () => {
        setPointsEarned(0);
        setIsActive(false);
    };

    return (
        <DetoxContext.Provider value={{
            isActive,
            timeLeft,
            startDetox,
            cancelDetox,
            completeDetox,
            pointsEarned,
            detoxStreak,
            isFailed,
            resetDetoxState
        }}>
            {children}
        </DetoxContext.Provider>
    );
};

export const useDetox = () => {
    const context = useContext(DetoxContext);
    if (context === undefined) {
        throw new Error('useDetox must be used within a DetoxProvider');
    }
    return context;
};
