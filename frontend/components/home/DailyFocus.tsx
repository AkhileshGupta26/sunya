import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { triggerHaptic } from '../../utils/haptics';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface DailyFocusProps {
    themeColor: string;
}

export const DailyFocus: React.FC<DailyFocusProps> = ({ themeColor }) => {
    const router = useRouter();
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        loadLikeStatus();
    }, []);

    const loadLikeStatus = async () => {
        try {
            const stored = await AsyncStorage.getItem('daily_focus_liked');
            if (stored === 'true') setIsLiked(true);
        } catch (e) { console.log(e); }
    };

    const toggleLike = async () => {
        const newState = !isLiked;
        setIsLiked(newState);
        triggerHaptic('selection');
        try {
            await AsyncStorage.setItem('daily_focus_liked', newState.toString());
        } catch (e) {
            console.log('Error saving like', e);
        }
    };

    const handleStart = () => {
        triggerHaptic('impact');
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

            {/* Like Button - Absolutely Positioned */}
            <TouchableOpacity
                onPress={(e) => { e.stopPropagation(); toggleLike(); }}
                style={styles.likeButton}
            >
                <MaterialCommunityIcons
                    name={isLiked ? "heart" : "heart-outline"}
                    size={24}
                    color={isLiked ? "#EF4444" : "rgba(255,255,255,0.4)"}
                />
            </TouchableOpacity>
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
        position: 'relative', // For absolute positioning of like button
    },
    heroContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Push text and lottie apart
        gap: 16,
    },
    textContainer: {
        flex: 1, // Allow text to take up available space
        paddingRight: 24, // Avoid overlapping with button if text is long
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
    likeButton: {
        position: 'absolute',
        top: 24,
        right: 24,
        zIndex: 10,
        padding: 4,
    }
});
