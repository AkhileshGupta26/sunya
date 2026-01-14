import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface YogaCardProps {
    themeColor: string;
}

export const YogaCard: React.FC<YogaCardProps> = ({ themeColor }) => {
    const router = useRouter();
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    // Dynamic text state
    const [actionText, setActionText] = useState("Start Flow");
    const TEXTS = ["Start Flow", "Ready to stretch?", "Begin Yoga"];

    useEffect(() => {
        // Shimmer Loop
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.delay(1000), // Pause between shimmers
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 0, // Reset instantly
                    useNativeDriver: true,
                })
            ])
        ).start();

        // Rotate Text
        const interval = setInterval(() => {
            setActionText(prev => {
                const idx = TEXTS.indexOf(prev);
                return TEXTS[(idx + 1) % TEXTS.length];
            });
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push('/yoga');
    };

    // Interpolate for opacity shimmer overlay
    const shimmerOpacity = shimmerAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0.3, 0]
    });

    const shimmerTranslate = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-100, 300] // Move across button width
    });

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <MaterialCommunityIcons name="yoga" size={32} color={themeColor} />
                <View>
                    <Text style={styles.title}>Daily Yoga</Text>
                    <Text style={styles.subtitle}>Mindful Movement</Text>
                </View>
            </View>

            <Text style={styles.description}>
                Energize your body and calm your mind with a 15-minute guided flow.
            </Text>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: themeColor }]}
                onPress={handlePress}
                activeOpacity={0.9}
            >
                {/* Shimmer Overlay */}
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            transform: [{ translateX: shimmerTranslate }],
                            opacity: shimmerOpacity
                        }
                    ]}
                />

                <Text style={styles.buttonText}>{actionText}</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#1F1F2E',
        marginHorizontal: 24,
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#2D2D3D',
        position: 'relative',
        overflow: 'hidden', // Contain shimmer if we animated card bg
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    description: {
        fontSize: 14,
        color: '#9CA3AF',
        marginBottom: 24,
        lineHeight: 22,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
        overflow: 'hidden', // Critical for shimmer translate
        position: 'relative',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        minWidth: 100, // Prevent layout jump on text change
        textAlign: 'center',
    },
});
