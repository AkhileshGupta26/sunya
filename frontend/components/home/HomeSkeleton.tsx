import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Skeleton } from '../ui/Skeleton';

export const HomeSkeleton: React.FC = () => {
    return (
        <ScrollView style={styles.container} scrollEnabled={false}>
            {/* Header Skeleton */}
            <View style={styles.header}>
                <View>
                    <Skeleton width={120} height={20} style={{ marginBottom: 8 }} />
                    <Skeleton width={180} height={32} />
                </View>
                <Skeleton width={48} height={48} borderRadius={24} />
            </View>

            {/* Stats Row Skeleton */}
            <View style={styles.streakCard}>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Skeleton width={24} height={24} style={{ marginBottom: 4 }} />
                        <Skeleton width={30} height={20} style={{ marginBottom: 4 }} />
                        <Skeleton width={50} height={10} />
                    </View>
                    <View style={styles.statItem}>
                        <Skeleton width={24} height={24} style={{ marginBottom: 4 }} />
                        <Skeleton width={30} height={20} style={{ marginBottom: 4 }} />
                        <Skeleton width={50} height={10} />
                    </View>
                    <View style={styles.statItem}>
                        <Skeleton width={24} height={24} style={{ marginBottom: 4 }} />
                        <Skeleton width={30} height={20} style={{ marginBottom: 4 }} />
                        <Skeleton width={50} height={10} />
                    </View>
                    <View style={styles.statItem}>
                        <Skeleton width={24} height={24} style={{ marginBottom: 4 }} />
                        <Skeleton width={30} height={20} style={{ marginBottom: 4 }} />
                        <Skeleton width={50} height={10} />
                    </View>
                </View>
            </View>

            {/* Main Action Card Skeleton (Wake Up / Session) */}
            <View style={styles.mainCard}>
                <Skeleton width={60} height={60} style={{ marginBottom: 16 }} />
                <Skeleton width={200} height={24} style={{ marginBottom: 8 }} />
                <Skeleton width={240} height={16} />
            </View>

            {/* Detox Card Skeleton */}
            <View style={styles.detoxCard}>
                <View style={styles.detoxContent}>
                    <Skeleton width={40} height={40} />
                    <View style={{ flex: 1, marginLeft: 16 }}>
                        <Skeleton width={100} height={18} style={{ marginBottom: 4 }} />
                        <Skeleton width={150} height={13} />
                    </View>
                    <Skeleton width={24} height={24} />
                </View>
            </View>

            {/* Daily Focus Skeleton */}
            <View style={styles.todayCard}>
                <Skeleton width={120} height={20} style={{ marginBottom: 16 }} />
                <Skeleton width="100%" height={24} style={{ marginBottom: 12 }} />
                <Skeleton width="100%" height={24} style={{ marginBottom: 12 }} />
                <Skeleton width="100%" height={24} />
            </View>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F1E',
    },
    header: {
        padding: 24,
        paddingTop: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
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
    mainCard: {
        backgroundColor: '#1F1F2E',
        marginHorizontal: 24,
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#2D2D3D',
        height: 200,
        justifyContent: 'center'
    },
    detoxCard: {
        backgroundColor: '#1F1F2E',
        marginHorizontal: 24,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#2D2D3D',
    },
    detoxContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    todayCard: {
        backgroundColor: '#1F1F2E',
        marginHorizontal: 24,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
});
