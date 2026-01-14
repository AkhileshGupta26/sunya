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
    // promptIndex and PROMPTS removed as text is now static
    const handleStart = () => {

        const PROMPTS = [
            "Ready to center yourself?",
            "10 min clarity session",
            "Tap to start ritual"
        ];

        // useEffect for prompt rotation removed


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
                    <View style={styles.heroContent}>
                        <View style={styles.lottieContainer}>
                            <LottieView
                                source={{ uri: 'https://lottie.host/48d742d1-109c-46a1-b317-6a7f240ba097/6u1XLWBU0A.lottie' }}
                                autoPlay
                                loop
                                style={styles.lottie}
                            />
                        </View>
                        <View>
                            <Text style={styles.sectionTitle}>Begin your Sacred Morning</Text>
                            <Text style={styles.promptText}>Tap to start your 30-min ritual</Text>
                        </View>
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
    },
        headerRow: {
        marginBottom: 24,
    },
        heroContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
        sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 0.5,
        maxWidth: 200,
    },
        promptText: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 4,
        fontWeight: '500',
    },
        lottieContainer: {
        width: 64,
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
        lottie: {
        width: 100, // Slightly larger zoom effect within container
        height: 100,
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
