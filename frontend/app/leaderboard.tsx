import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColor } from '../hooks/useThemeColor';
import { api } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';

export default function Leaderboard() {
    const router = useRouter();
    const { user } = useAuth();
    const THEME_COLOR = useThemeColor();
    const [leaderboard, setLeaderboard] = useState([]);
    const [activeContest, setActiveContest] = useState('none');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchLeaderboard = async () => {
        try {
            const res: any = await api.get('/api/contests/leaderboard');
            setActiveContest(res.active_contest || 'none');
            setLeaderboard(res.leaderboard || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchLeaderboard();
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const isMe = item.is_me;
        let rankColor = '#6B7280';
        let rankIcon = null;

        if (item.rank === 1) {
            rankColor = '#F59E0B'; // Gold
            rankIcon = "crown";
        } else if (item.rank === 2) {
            rankColor = '#9CA3AF'; // Silver
            rankIcon = "medal";
        } else if (item.rank === 3) {
            rankColor = '#B45309'; // Bronze
            rankIcon = "medal-outline";
        }

        return (
            <View style={[
                styles.rankItem,
                isMe && { backgroundColor: THEME_COLOR + '20', borderColor: THEME_COLOR, borderWidth: 1 }
            ]}>
                <View style={[styles.rankBadge, { borderColor: rankColor }]}>
                    {rankIcon ? (
                        <MaterialCommunityIcons name={rankIcon as any} size={20} color={rankColor} />
                    ) : (
                        <Text style={styles.rankText}>{item.rank}</Text>
                    )}
                </View>

                <View style={styles.userInfo}>
                    <Text style={[styles.userName, isMe && { color: THEME_COLOR, fontWeight: 'bold' }]}>
                        {item.name} {isMe && '(You)'}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.userPoints}>{item.total_points} pts</Text>
                        {item.badges && item.badges.length > 0 && (
                            <View style={{ flexDirection: 'row', marginLeft: 8 }}>
                                {item.badges.slice(0, 3).map((b: string, i: number) => (
                                    <Text key={i} style={{ fontSize: 10, marginLeft: 2 }}>🏆</Text>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {item.rank <= 3 && (
                    <MaterialCommunityIcons name="fire" size={20} color="#F59E0B" />
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Leaderboard</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={THEME_COLOR} />
                </View>
            </View>
        );
    }

    // No Active Contest View
    if (activeContest === 'none' && !loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Leaderboard</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="trophy-variant-outline" size={80} color="#4B5563" />
                    <Text style={styles.emptyTitle}>No Active Contest</Text>
                    <Text style={styles.emptyText}>Join a Weekly or Monthly contest to see rankings!</Text>

                    <TouchableOpacity style={[styles.joinButton, { backgroundColor: THEME_COLOR }]} onPress={() => router.push('/(tabs)/circle')}>
                        <Text style={styles.joinButtonText}>Go to Contest Arena</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.title}>
                    {activeContest.charAt(0).toUpperCase() + activeContest.slice(1)} Leaderboard
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={leaderboard}
                renderItem={renderItem}
                keyExtractor={(item: any) => item.id || Math.random().toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME_COLOR} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="trophy-broken" size={64} color="#4B5563" />
                        <Text style={styles.emptyText}>No rankings yet.</Text>
                    </View>
                }
            />
        </View>
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
    backButton: {
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        flex: 1,
        textAlign: 'center'
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 24,
    },
    rankItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1F1F2E',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2D2D3D',
    },
    rankBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        backgroundColor: '#0F0F1E',
    },
    rankText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 4,
    },
    userPoints: {
        color: '#9CA3AF',
        fontSize: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        paddingHorizontal: 32
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginTop: 16
    },
    emptyText: {
        color: '#6B7280',
        marginTop: 8,
        fontSize: 16,
        textAlign: 'center'
    },
    joinButton: {
        marginTop: 24,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12
    },
    joinButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    }
});
