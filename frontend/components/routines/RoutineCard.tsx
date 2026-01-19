import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Routine } from '@/utils/routinesData';

interface RoutineCardProps {
    routine: Routine;
    onPress: (routine: Routine) => void;
}

const RoutineCard: React.FC<RoutineCardProps> = ({ routine, onPress }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onPress(routine)}
            style={styles.container}
        >
            <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="person" size={16} color="#fff" />
                    </View>
                    <Ionicons name="arrow-forward-circle-outline" size={24} color="rgba(255,255,255,0.3)" />
                </View>

                <Text style={styles.name}>{routine.name}</Text>
                <Text style={styles.title} numberOfLines={2}>{routine.title}</Text>

                <View style={styles.divider} />

                <View style={styles.mindsetRow}>
                    <Ionicons name="flash-outline" size={14} color="#FFD700" style={{ marginRight: 6 }} />
                    <Text style={styles.mindset} numberOfLines={1}>
                        {routine.mindsetRule}
                    </Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 220,
        height: 180,
        marginRight: 16,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    gradient: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    title: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 18,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 12,
    },
    mindsetRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mindset: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        fontStyle: 'italic',
        flex: 1,
    },
});

export default RoutineCard;
