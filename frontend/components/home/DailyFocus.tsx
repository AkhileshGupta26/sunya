import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';

interface DailyFocusProps {
    themeColor: string;
}

export const DailyFocus: React.FC<DailyFocusProps> = ({ themeColor }) => {
    const router = useRouter();

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
            <View style={styles.heroContent}>
                <View style={styles.textContainer}>
                    <Text style={styles.sectionTitle}>Begin your Sacred Morning</Text>
                    <Text style={styles.promptText}>Tap to start your 30-min ritual</Text>
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
        justifyContent: 'center', // Vertically center content if needed
    },
    heroContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Push text and lottie apart
        gap: 16,
    },
    textContainer: {
        flex: 1, // Allow text to take up available space
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    promptText: {
        fontSize: 14,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    lottieContainer: {
        width: 80, // Slightly larger for emphasis
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lottie: {
        width: '100%',
        height: '100%',
    },
});
