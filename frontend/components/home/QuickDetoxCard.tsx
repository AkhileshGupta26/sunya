import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface QuickDetoxCardProps {
    themeColor: string;
}

export const QuickDetoxCard: React.FC<QuickDetoxCardProps> = ({ themeColor }) => {
    const router = useRouter();

    return (
        <TouchableOpacity style={[styles.detoxCard, { borderColor: themeColor }]} onPress={() => router.push('/detox')}>
            <View style={styles.detoxContent}>
                <MaterialCommunityIcons name="cellphone-off" size={40} color={themeColor} />
                <View style={styles.detoxTextContainer}>
                    <Text style={styles.detoxTitle}>Quick Detox</Text>
                    <Text style={styles.detoxSubtitle}>Take a break without meditation</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={themeColor} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    detoxCard: {
        backgroundColor: '#1F1F2E',
        marginHorizontal: 24,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 2,
    },
    detoxContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    detoxTextContainer: {
        flex: 1,
    },
    detoxTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    detoxSubtitle: {
        fontSize: 13,
        color: '#9CA3AF',
        marginTop: 2,
    },
});
