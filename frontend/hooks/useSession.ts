import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import Constants from 'expo-constants';
import { useState, useEffect } from 'react';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

export const useSession = () => {
    const { token } = useAuth();
    const [graceTimeRemaining, setGraceTimeRemaining] = useState<number | null>(null);

    const { data: session, isLoading, refetch, error } = useQuery({
        queryKey: ['todaySession'],
        queryFn: async () => {
            if (!token) return null;
            const response = await fetch(`${API_URL}/api/sessions/today`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to fetch session');
            const data = await response.json();
            return data; // assumes data is { session: ... } or similar structure? API returns object directly or {session: object}?
            // Checking backend response in sessions.py: {"session": session_doc} or {"session": None}
        },
        enabled: !!token, // Guests (no token) will skip this
    });

    // Derived state: grace timer logic
    // React Query handles fetching, but the countdown is local state driven by the fetch result.
    useEffect(() => {
        if (session && session.session && !session.session.completed && session.session.grace_timer_started) {
            // Calculation logic
            const startTime = new Date(session.session.grace_timer_started).getTime();
            const now = new Date().getTime();
            const elapsed = Math.floor((now - startTime) / 1000);
            const GRACE_PERIOD = 30 * 60; // 30 mins

            if (elapsed < GRACE_PERIOD) {
                setGraceTimeRemaining(GRACE_PERIOD - elapsed);
            } else {
                setGraceTimeRemaining(0);
            }
        } else {
            setGraceTimeRemaining(null);
        }
    }, [session]);

    // Grace Timer Interval
    useEffect(() => {
        let interval: any;
        if (graceTimeRemaining !== null && graceTimeRemaining > 0) {
            interval = setInterval(() => {
                setGraceTimeRemaining((prev) => {
                    if (prev === null || prev <= 0) return 0;
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [graceTimeRemaining]);

    return {
        todaySession: session?.session,
        isLoading,
        refetch,
        graceTimeRemaining,
        error
    };
};
