import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface DailyFocusProps {
    themeColor: string;
}

export const DailyFocus: React.FC<DailyFocusProps> = ({ themeColor }) => {
    return (
        <View style={styles.todayCard}>
            <Text style={styles.sectionTitle}>Today's Focus</Text>
            <View style={styles.focusItem}>
                <MaterialCommunityIcons name="meditation" size={24} color={themeColor} />
                <Text style={styles.focusText}>10 minutes of mindful meditation</Text>
            </View>
            <View style={styles.focusItem}>
                <MaterialCommunityIcons name="heart-pulse" size={24} color="#EC4899" />
                <Text style={styles.focusText}>BPM verification before & after</Text>
            </View>
            <View style={styles.focusItem}>
                <MaterialCommunityIcons name="bell-ring" size={24} color="#F59E0B" />
                <Text style={styles.focusText}>Awareness probe during session</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    todayCard: {
        backgroundColor: '#1F1F2E',
        marginHorizontal: 24,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    focusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    focusText: {
        fontSize: 14,
        color: '#D1D5DB',
        marginLeft: 12,
    },
});
