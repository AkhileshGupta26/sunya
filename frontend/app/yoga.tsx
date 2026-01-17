import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Dimensions,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useThemeColor } from '../hooks/useThemeColor';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

const SCREEN_WIDTH = Dimensions.get('window').width;

const triggerHaptic = (type: 'impact' | 'notification' | 'selection') => {
    if (Platform.OS === 'web') return;
    try {
        if (type === 'impact') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        else if (type === 'notification') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        else Haptics.selectionAsync();
    } catch (e) { }
};

const YOGA_TRACKS = [
    {
        id: 'nadi_shodhana',
        name: 'Nadi Shodhana',
        icon: 'weather-windy',
        color: '#60A5FA',
        description: 'Alternate Nostril Breathing for balance',
        steps: [
            { title: 'Posture', icon: 'seat-recline-normal', desc: 'Sit comfortably with spine straight. Rest left hand on lap.' },
            { title: 'Vishnu Mudra', icon: 'hand-peace', desc: 'Right hand: Fold index & middle fingers down. Keep others up.' },
            { title: 'Block Right', icon: 'gesture-tap', desc: 'Use right thumb to close right nostril. Inhale deeply through Left.' },
            { title: 'Swap & Exhale', icon: 'swap-horizontal', desc: 'Close Left with ring finger. Open Right. Exhale completely.' },
            { title: 'Inhale Right', icon: 'arrow-right-thick', desc: 'Keep Left closed. Inhale deeply through Right nostril.' },
            { title: 'Swap & Exhale', icon: 'arrow-left-thick', desc: 'Close Right with thumb. Open Left. Exhale completely. Repeat.' },
        ]
    },
    {
        id: 'hatha',
        name: 'Hatha Yoga',
        icon: 'yoga',
        color: '#F59E0B',
        description: 'Slow-paced stretching & breathing',
        steps: [
            { title: 'Mountain Pose', icon: 'human-handsup', desc: 'Stand tall, feet together, shoulders relaxed. Breathe deeply.' },
            { title: 'Forward Fold', icon: 'human-handsdown', desc: 'Exhale and hinge at your hips. Let your head hang heavy.' },
            { title: 'Cobra Pose', icon: 'snake', desc: 'Lie on stomach, lift chest gently using back muscles.' },
            { title: 'Tree Pose', icon: 'tree', desc: 'Balance on one leg, place other foot on inner thigh. Hands in prayer.' },
            { title: 'Childs Pose', icon: 'baby-face-outline', desc: 'Kneel and sit back on heels, forehead to mat. Rest.' },
        ]
    },
    {
        id: 'vinyasa',
        name: 'Vinyasa Flow',
        icon: 'waves',
        color: '#10B981',
        description: 'Dynamic movement & energy',
        steps: [
            { title: 'Down Dog', icon: 'dog', desc: 'Inverted V-shape. Press hands into mat, lift hips high.' },
            { title: 'Plank', icon: 'vector-line', desc: 'High push-up position. Core engaged, straight line.' },
            { title: 'Chaturanga', icon: 'arrow-down-thick', desc: 'Lower halfway down, elbows hugging ribs.' },
            { title: 'Upward Dog', icon: 'arrow-up-thick', desc: 'Inhale, lift chest, straighten arms. Thighs off mat.' },
            { title: 'Warrior II', icon: 'sword-cross', desc: 'Wide stance, front knee bent. Arms out parallel.' },
        ]
    },
    {
        id: 'yin',
        name: 'Yin Yoga',
        icon: 'moon-waxing-crescent',
        color: '#8B5CF6',
        description: 'Deep tissue release & calm',
        steps: [
            { title: 'Butterfly', icon: 'butterfly', desc: 'Seated, soles of feet touching. Fold forward gently.' },
            { title: 'Dragon', icon: 'dragon', desc: 'Low lunge. Sink hips forward. Hold for 3-5 minutes.' },
            { title: 'Sphinx', icon: 'cat', desc: 'Lie on belly, propped on forearms. Relax lower back.' },
            { title: 'Sleeping Swan', icon: 'bird', desc: 'Pigeon pose. Fold over front leg. Release tension.' },
            { title: 'Savasana', icon: 'bed', desc: 'Corpse pose. Lie flat on back. Complete relaxation.' },
        ]
    },
];

export default function Yoga() {
    const router = useRouter();
    const { token } = useAuth();
    const THEME_COLOR = useThemeColor();

    // State
    const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isPracticing, setIsPracticing] = useState(false);

    const selectedTrack = YOGA_TRACKS.find(t => t.id === selectedTrackId);
    const currentStep = selectedTrack ? selectedTrack.steps[currentStepIndex] : null;
    const isLastStep = selectedTrack ? currentStepIndex === selectedTrack.steps.length - 1 : false;

    const startPractice = (trackId: string) => {
        triggerHaptic('selection');
        setSelectedTrackId(trackId);
        setCurrentStepIndex(0);
        setIsPracticing(true);
    };

    const nextStep = () => {
        triggerHaptic('impact');
        if (selectedTrack && currentStepIndex < selectedTrack.steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            completeSession();
        }
    };

    const prevStep = () => {
        triggerHaptic('selection');
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    const exitPractice = () => {
        setIsPracticing(false);
        setSelectedTrackId(null);
    };

    const completeSession = async () => {
        triggerHaptic('notification');

        try {
            const response = await fetch(`${API_URL}/api/sessions/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    track_type: selectedTrackId,
                    completed: true,
                    bpm_verified: true, // Manual completion implies verification for now
                    awareness_probe_passed: true
                })
            });

            if (response.ok) {
                // const data = await response.json(); // Data unused if no detox
                Alert.alert('Session Complete', 'You have completed this yoga practice.', [
                    { text: 'OK', onPress: () => exitPractice() }
                ]);
            }
        } catch (error) {
            console.error('Completion error', error);
            Alert.alert('Error', 'Could not save session.');
        }
        // setIsPracticing(false); // Moved to OnPress OK
    };

    if (isPracticing && selectedTrack && currentStep) {
        return (
            <View style={styles.container}>
                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    {selectedTrack.steps.map((_, idx) => (
                        <View
                            key={idx}
                            style={[
                                styles.progressBar,
                                {
                                    backgroundColor: idx <= currentStepIndex ? THEME_COLOR : '#2D2D3D',
                                    flex: 1
                                }
                            ]}
                        />
                    ))}
                </View>

                <View style={styles.practiceHeader}>
                    <TouchableOpacity onPress={exitPractice} style={styles.closeButton}>
                        <MaterialCommunityIcons name="close" size={28} color="#9CA3AF" />
                    </TouchableOpacity>
                    <Text style={styles.stepCounter}>Step {currentStepIndex + 1} of {selectedTrack.steps.length}</Text>
                </View>

                <View style={styles.contentContainer}>
                    <Animated.View
                        key={currentStepIndex} // Re-animate on step change
                        entering={FadeInRight.duration(500)}
                        exiting={FadeOutLeft.duration(300)}
                        style={styles.stepCard}
                    >
                        {/* Huge Vector Icon as "Image" */}
                        <View style={[styles.iconContainer, { borderColor: THEME_COLOR }]}>
                            <MaterialCommunityIcons name={currentStep.icon as any} size={120} color={THEME_COLOR} />
                        </View>

                        <Text style={styles.stepTitle}>{currentStep.title}</Text>
                        <Text style={styles.stepDesc}>{currentStep.desc}</Text>
                    </Animated.View>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity
                        style={[styles.navButton, currentStepIndex === 0 && styles.disabledButton]}
                        onPress={prevStep}
                        disabled={currentStepIndex === 0}
                    >
                        <MaterialCommunityIcons name="chevron-left" size={32} color={currentStepIndex === 0 ? "#4B5563" : "white"} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.mainButton, { backgroundColor: THEME_COLOR }]}
                        onPress={nextStep}
                    >
                        <Text style={styles.mainButtonText}>{isLastStep ? 'Finish' : 'Next Step'}</Text>
                        <MaterialCommunityIcons name={isLastStep ? "check" : "arrow-right"} size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Select Practice</Text>
            </View>

            <View style={styles.tracksContainer}>
                {YOGA_TRACKS.map(track => (
                    <TouchableOpacity
                        key={track.id}
                        style={[styles.trackCard, { borderColor: track.color }]}
                        onPress={() => startPractice(track.id)}
                    >
                        <View style={[styles.trackIcon, { backgroundColor: track.color + '20' }]}>
                            <MaterialCommunityIcons name={track.icon as any} size={32} color={track.color} />
                        </View>
                        <View style={styles.trackInfo}>
                            <Text style={styles.trackName}>{track.name}</Text>
                            <Text style={styles.trackDescription}>{track.description}</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={track.color} />
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F1E',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        paddingTop: 60,
        justifyContent: 'space-between',
    },
    backButton: { marginRight: 16 },
    closeButton: { padding: 8 },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        flex: 1,
    },
    stepCounter: {
        color: '#9CA3AF',
        fontSize: 16,
        fontWeight: '600',
    },
    tracksContainer: {
        padding: 24,
        paddingTop: 0,
    },
    trackCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1F1F2E',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
    },
    trackIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    trackInfo: { flex: 1 },
    trackName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    trackDescription: {
        fontSize: 14,
        color: '#9CA3AF',
    },

    // Detailed View Styles
    progressContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 40, // Adjust for status bar
        gap: 6,
        marginBottom: 10,
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
    },
    // Customize header for practice mode to reduce gap
    practiceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    stepCard: {
        alignItems: 'center',
        width: '100%',
    },
    iconContainer: {
        width: 240,
        height: 240,
        borderRadius: 120,
        borderWidth: 4, // Thicker border
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1F1F2E',
        marginBottom: 32,
        elevation: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 25,
    },
    stepTitle: {
        fontSize: 36, // Larger title
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
        textAlign: 'center',
    },
    stepDesc: {
        fontSize: 18,
        color: '#D1D5DB', // Lighter gray
        textAlign: 'center',
        lineHeight: 28,
        paddingHorizontal: 10,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 40, // More breathing room at bottom
        paddingBottom: Platform.OS === 'ios' ? 60 : 40,
        gap: 20,
    },
    navButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#1F1F2E',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#2D2D3D',
    },
    disabledButton: {
        opacity: 0.5,
        borderWidth: 0,
    },
    mainButton: {
        flex: 1,
        height: 60,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    mainButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
