import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface DailyFocusProps {
    themeColor: string;
}

export const DailyFocus: React.FC<DailyFocusProps> = ({ themeColor }) => {
    const router = useRouter();
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const [promptIndex, setPromptIndex] = useState(0);

    const PROMPTS = [
        "Ready to center yourself?",
        "10 min clarity session",
        "Tap to start ritual"
    ];

    useEffect(() => {
        // Breathing Animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

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
        <View style={styles.todayCard}>
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Sacred Morning</Text>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <MaterialCommunityIcons name="weather-sunset" size={24} color={themeColor} />
                </Animated.View>
            </View>

            <View style={styles.focusContent}>
                <View style={styles.focusItem}>
                    <MaterialCommunityIcons name="meditation" size={20} color={themeColor} />
                    <Text style={styles.focusText}>10 min Mindful Breath</Text>
                </View>
                <View style={styles.focusItem}>
                    <MaterialCommunityIcons name="heart-pulse" size={20} color="#EC4899" />
                    <Text style={styles.focusText}>HRV Check-in</Text>
                </View>
            </View>

            <Animated.View style={[styles.mainButtonContainer, { transform: [{ scale: pulseAnim }] }]}>
                <TouchableOpacity
                    style={[styles.mainButton, { backgroundColor: themeColor, shadowColor: themeColor }]}
                    onPress={handleStart}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons name="play-circle-outline" size={24} color="#FFF" />
                    <Text style={styles.mainButtonText}>{PROMPTS[promptIndex]}</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    todayCard: {
        backgroundColor: '#1F1F2E',
        marginHorizontal: 24,
        borderRadius: 24, // Softer corners
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#2D2D3D',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20, // Slightly larger
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    focusContent: {
        marginBottom: 24,
        gap: 12,
    },
    focusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 12,
        borderRadius: 12,
    },
    focusText: {
        fontSize: 15,
        color: '#E5E7EB',
        marginLeft: 12,
        fontWeight: '500',
    },
    mainButtonContainer: {
        width: '100%',
    },
    mainButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    mainButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});
