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

                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <View style={[styles.iconContainer, { backgroundColor: `${themeColor}20` }]}>
                        <MaterialCommunityIcons name="weather-sunset" size={32} color={themeColor} />
                        <View style={[styles.playBadge, { backgroundColor: themeColor }]}>
                            <MaterialCommunityIcons name="play" size={12} color="#FFF" />
                        </View>
                    </View>
                </Animated.View>
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
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    playBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#1F1F2E',
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
