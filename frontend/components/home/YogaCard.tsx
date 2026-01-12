import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface YogaCardProps {
    themeColor: string;
}

export const YogaCard: React.FC<YogaCardProps> = ({ themeColor }) => {
    const router = useRouter();

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <MaterialCommunityIcons name="yoga" size={32} color={themeColor} />
                <Text style={styles.title}>Daily Yoga</Text>
            </View>

            <Text style={styles.description}>
                Energize your body with mindful movement.
            </Text>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: themeColor }]}
                onPress={() => router.push('/yoga')}
            >
                <Text style={styles.buttonText}>Start Flow</Text>
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
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    description: {
        fontSize: 14,
        color: '#9CA3AF',
        marginBottom: 20,
        lineHeight: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
