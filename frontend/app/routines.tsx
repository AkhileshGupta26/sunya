import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ROUTINE_CATEGORIES, Routine } from '@/utils/routinesData';
import RoutineCard from '@/components/routines/RoutineCard';
import RoutineDetailModal from '@/components/routines/RoutineDetailModal';

export default function RoutinesScreen() {
    const router = useRouter();
    const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleRoutinePress = (routine: Routine) => {
        setSelectedRoutine(routine);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        // consistent delay for animation
        setTimeout(() => setSelectedRoutine(null), 300);
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0F2027', '#203A43', '#2C5364']}
                style={styles.background}
            />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Routines of Greatness</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.subtitle}>
                        Principles, habits, and discipline from the world's best.
                    </Text>

                    {ROUTINE_CATEGORIES.map((category) => (
                        <View key={category.id} style={styles.categorySection}>
                            <View style={styles.categoryHeader}>
                                <Text style={styles.categoryTitle}>{category.title}</Text>
                                <Text style={styles.categoryDescription}>{category.description}</Text>
                            </View>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.cardsRow}
                            >
                                {category.routines.map((routine) => (
                                    <RoutineCard
                                        key={routine.id}
                                        routine={routine}
                                        onPress={handleRoutinePress}
                                    />
                                ))}
                            </ScrollView>
                        </View>
                    ))}

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>

            <RoutineDetailModal
                isVisible={isModalVisible}
                onClose={handleCloseModal}
                routine={selectedRoutine}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F2027',
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        paddingHorizontal: 20,
        marginBottom: 32,
        textAlign: 'center',
    },
    categorySection: {
        marginBottom: 32,
    },
    categoryHeader: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    categoryTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    categoryDescription: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
    },
    cardsRow: {
        paddingHorizontal: 20,
    },
});
