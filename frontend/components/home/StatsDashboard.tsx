import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';


interface StatsDashboardProps {
    user: any;
    themeColor: string;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ user, themeColor }) => {
    return (
        <View style={styles.streakCard}>
            <View style={styles.statsContainer}>
                {/* Meditation Streak */}
                <View style={[styles.statItem, { zIndex: 10 }]}>

                    <MaterialCommunityIcons name="fire" size={24} color="#F59E0B" />
                    <Text style={styles.statNumber}>{user?.current_streak || 0}</Text>
                    <Text style={styles.statLabel}>Meditation</Text>
                </View>

                <View style={styles.verticalDivider} />

                {/* Detox Streak */}
                <View style={styles.statItem}>
                    <MaterialCommunityIcons name="lightning-bolt" size={24} color="#F59E0B" />
                    <Text style={styles.statNumber}>{user?.detox_streak || 0}</Text>
                    <Text style={styles.statLabel}>Detox</Text>
                </View>

                <View style={styles.verticalDivider} />

                {/* Total Days */}
                <View style={styles.statItem}>
                    <MaterialCommunityIcons name="calendar-check" size={24} color={themeColor} />
                    <Text style={styles.statNumber}>{user?.total_days || 0}</Text>
                    <Text style={styles.statLabel}>Total Days</Text>
                </View>

                <View style={styles.verticalDivider} />

                {/* Zen Passes */}
                <View style={styles.statItem}>
                    <MaterialCommunityIcons name="ticket-confirmation" size={24} color={themeColor} />
                    <Text style={styles.statNumber}>{user?.zen_passes || 0}</Text>
                    <Text style={styles.statLabel}>Zen Passes</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    streakCard: {
        backgroundColor: '#1F1F2E',
        marginHorizontal: 24,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#2D2D3D',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    verticalDivider: {
        width: 1,
        height: 32,
        backgroundColor: '#2D2D3D',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 4,
    },
    statLabel: {
        fontSize: 10,
        color: '#9CA3AF',
        marginTop: 2,
        textAlign: 'center',
    },
});
