import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Routine } from '@/utils/routinesData';
import { useRouter } from 'expo-router';

interface RoutineDetailModalProps {
    isVisible: boolean;
    onClose: () => void;
    routine: Routine | null;
}

const { width, height } = Dimensions.get('window');

const RoutineDetailModal: React.FC<RoutineDetailModalProps> = ({ isVisible, onClose, routine }) => {
    const router = useRouter();

    if (!routine) return null;

    const handleStartMeditation = () => {
        onClose();
        router.push('/meditation');
    };

    const handleStartDetox = () => {
        onClose();
        router.push('/detox');
    };

    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={onClose}
            onSwipeComplete={onClose}
            swipeDirection={['down']}
            style={styles.modal}
            propagateSwipe
        >
            <View style={styles.container}>
                <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
                    <View style={styles.dragIndicator} />

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.name}>{routine.name}</Text>
                            <Text style={styles.title}>{routine.title}</Text>
                        </View>

                        {/* Mindset Rule */}
                        <View style={styles.mindsetContainer}>
                            <Ionicons name="sunny-outline" size={20} color="#FFD700" style={styles.icon} />
                            <Text style={styles.mindsetRule}>"{routine.mindsetRule}"</Text>
                        </View>

                        {/* Daily Structure */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Daily Structure</Text>
                            <View style={styles.listContainer}>
                                {routine.dailyStructure.map((item, index) => (
                                    <View key={index} style={styles.listItem}>
                                        <View style={styles.bulletPoint} />
                                        <Text style={styles.listText}>{item}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Screen-Time Discipline (Highlighted) */}
                        <View style={styles.disciplineContainer}>
                            <View style={styles.disciplineHeader}>
                                <Ionicons name="phone-portrait-outline" size={20} color="#FF6B6B" />
                                <Text style={styles.disciplineTitle}>Screen-Time Discipline</Text>
                            </View>
                            <Text style={styles.disciplineText}>{routine.screenTimeDiscipline}</Text>
                        </View>

                        {/* Habits You Can Copy */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Habits You Can Copy</Text>
                            <View style={styles.habitsContainer}>
                                {routine.habits.map((habit, index) => (
                                    <View key={index} style={styles.habitItem}>
                                        <Ionicons name="checkmark-circle-outline" size={20} color="#4ADE80" />
                                        <Text style={styles.habitText}>{habit}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Quote */}
                        {routine.quote && (
                            <View style={styles.quoteContainer}>
                                <Text style={styles.quoteText}>"{routine.quote}"</Text>
                                {routine.quoteAuthor && (
                                    <Text style={styles.quoteAuthor}>— {routine.quoteAuthor}</Text>
                                )}
                            </View>
                        )}

                        {/* Apply Now Actions */}
                        <View style={styles.actionsContainer}>
                            <Text style={styles.actionTitle}>Apply Now</Text>
                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={styles.actionButton} onPress={handleStartMeditation}>
                                    <Ionicons name="moon-outline" size={20} color="#fff" />
                                    <Text style={styles.buttonText}>Start Meditation</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionButton, styles.detoxButton]} onPress={handleStartDetox}>
                                    <Ionicons name="hourglass-outline" size={20} color="#fff" />
                                    <Text style={styles.buttonText}>Start Detox</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{ height: 40 }} />
                    </ScrollView>

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close-circle" size={36} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>
                </BlurView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        margin: 0,
        justifyContent: 'flex-end',
    },
    container: {
        height: height * 0.85,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
        backgroundColor: 'rgba(20, 20, 25, 0.95)',
    },
    blurContainer: {
        flex: 1,
        padding: 20,
    },
    dragIndicator: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 8,
        marginBottom: 20,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        marginBottom: 24,
    },
    name: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    title: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        fontStyle: 'italic',
    },
    mindsetContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.2)',
    },
    icon: {
        marginRight: 12,
    },
    mindsetRule: {
        fontSize: 16,
        color: '#FFD700',
        fontWeight: '600',
        flex: 1,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 16,
    },
    listContainer: {
        gap: 12,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    bulletPoint: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.5)',
        marginTop: 8,
        marginRight: 12,
    },
    listText: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.8)',
        lineHeight: 22,
        flex: 1,
    },
    disciplineContainer: {
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 107, 0.2)',
    },
    disciplineHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    disciplineTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF6B6B',
        marginLeft: 8,
    },
    disciplineText: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 22,
    },
    habitsContainer: {
        gap: 12,
    },
    habitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 12,
        borderRadius: 12,
    },
    habitText: {
        fontSize: 15,
        color: '#fff',
        marginLeft: 12,
    },
    quoteContainer: {
        marginTop: 8,
        marginBottom: 32,
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        alignItems: 'center',
    },
    quoteText: {
        fontSize: 18,
        fontStyle: 'italic',
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 26,
        fontFamily: 'serif',
    },
    quoteAuthor: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
    },
    actionsContainer: {
        marginTop: 8,
    },
    actionTitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 16,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'center',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4A90E2',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    detoxButton: {
        backgroundColor: '#FF6B6B',
    },
    buttonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    closeButton: {
        position: 'absolute',
        top: 24, // Increased top margin
        right: 20,
        zIndex: 10,
        padding: 8, // Larger touch area
    },
});

export default RoutineDetailModal;
