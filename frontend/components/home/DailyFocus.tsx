import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';

interface DailyFocusProps {
    themeColor: string;
}

export const DailyFocus: React.FC<DailyFocusProps> = ({ themeColor }) => {
    const router = useRouter();
    // Pulse ref removed
    const [promptIndex, setPromptIndex] = useState(0);

    const PROMPTS = [
        "Ready to center yourself?",
        "10 min clarity session",
        "Tap to start ritual"
    ];

    useEffect(() => {
        // Rotate Prompts
        const interval = setInterval(() => {
            setPromptIndex((prev) => (prev + 1) % PROMPTS.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const handleStart = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/meditation');
    };

    return (
        <TouchableOpacity
            style={styles.todayCard}
            onPress={handleStart}
            activeOpacity={0.9}
        >
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.sectionTitle}>Sacred Morning</Text>
                    <Text style={styles.promptText}>{PROMPTS[promptIndex]}</Text>
                </View>

                <View style={styles.lottieContainer}>
                    <LottieView
                        source={{ uri: 'https://lottie.host/48d742d1-109c-46a1-b317-6a7f240ba097/6u1XLWBU0A.lottie' }}
                        autoPlay
                        loop
                        style={styles.lottie}
                    />
                </View>
            </View>

            <View style={styles.focusContent}>
                <View style={styles.focusItem}>
                    <MaterialCommunityIcons name="meditation" size={18} color={themeColor} />
                    <Text style={styles.focusText}>10 min Mindful Breath</Text>
                </View>
                <View style={styles.focusItem}>
                    <MaterialCommunityIcons name="heart-pulse" size={18} color="#EC4899" />
                    <Text style={styles.focusText}>HRV Check-in</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    todayCard: {
        backgroundColor: '#1F1F2E',
        marginHorizontal: 24,
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#2D2D3D',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    promptText: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 4,
        fontWeight: '500',
    },
    lottieContainer: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lottie: {
        width: '100%',
        height: '100%',
    },
    focusContent: {
        gap: 12,
    },
    focusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
    },
    focusText: {
        fontSize: 15,
        color: '#E5E7EB',
        marginLeft: 12,
        fontWeight: '500',
    },
});
