import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useThemeColor } from '../hooks/useThemeColor';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const triggerHaptic = (type: 'impact' | 'notification' | 'selection', style?: any) => {
    if (Platform.OS === 'web') return;
    try {
        if (type === 'impact') Haptics.impactAsync(style);
        else if (type === 'notification') Haptics.notificationAsync(style);
        else Haptics.selectionAsync();
    } catch (e) { }
};
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;
const { width } = Dimensions.get('window');

type LeaderboardUser = {
    rank: number;
    id: string;
    name: string;
    total_points: number;
    is_me: boolean;
};

export default function Leaderboard() {
    const { token, user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'global' | 'circle'>('global');
    const [users, setUsers] = useState<LeaderboardUser[]>([]);

    // Theme
    const THEME_COLOR = useThemeColor();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, [activeTab]);

    const handleTabSwitch = (tab: 'global' | 'circle') => {
        if (activeTab !== tab) {
            triggerHaptic('impact', Haptics.ImpactFeedbackStyle.Light);
            setActiveTab(tab);
        }
    };

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/leaderboard?type=${activeTab}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            setUsers(data.leaderboard || []);
        } catch (e) {
            console.error(e);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item, index }: { item: LeaderboardUser, index: number }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 60).springify()}
            style={[styles.card, item.is_me && [styles.myCard, { borderColor: THEME_COLOR, backgroundColor: `${THEME_COLOR}10` }]]}
        >
            <Text style={[styles.rank, item.rank <= 3 && { color: getRankColor(item.rank) }]}>#{item.rank}</Text>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={[styles.userName, item.is_me && { color: THEME_COLOR, fontWeight: 'bold' }]}>
                    {item.name} {item.is_me && '(You)'}
                </Text>
                <Text style={styles.userPoints}>{item.total_points} Zen Pts</Text>
            </View>
            {item.rank <= 3 && (
                <MaterialCommunityIcons name="crown" size={24} color={getRankColor(item.rank)} />
            )}
        </Animated.View>
    );

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return '#F59E0B'; // Gold
            case 2: return '#9CA3AF'; // Silver
            case 3: return '#B45309'; // Bronze
            default: return '#6B7280';
        }
    };

    const topThree = users.filter(u => u.rank <= 3);
    const rest = users.filter(u => u.rank > 3);

    const Podium = () => {
        if (topThree.length === 0) return null;

        const first = topThree.find(u => u.rank === 1);
        const second = topThree.find(u => u.rank === 2);
        const third = topThree.find(u => u.rank === 3);

        return (
            <View style={styles.podiumContainer}>
                {/* Second Place */}
                <Animated.View entering={FadeInUp.delay(200).springify()} style={[styles.podiumPlace, { marginTop: 40 }]}>
                    {second && (
                        <>
                            <MaterialCommunityIcons name="crown" size={24} color="#C0C0C0" style={{ marginBottom: -10, zIndex: 10 }} />
                            <View style={[styles.podiumAvatar, { borderColor: '#C0C0C0' }]}>
                                <Text style={styles.podiumAvatarText}>{second.name.charAt(0)}</Text>
                            </View>
                            <Text style={styles.podiumName} numberOfLines={1}>{second.name}</Text>
                            <Text style={styles.podiumPoints}>{second.total_points}</Text>
                            <View style={[styles.podiumBar, { height: 80, backgroundColor: '#C0C0C0' }]}>
                                <Text style={styles.podiumRank}>2</Text>
                            </View>
                        </>
                    )}
                </Animated.View>

                {/* First Place */}
                <Animated.View entering={FadeInUp.delay(100).springify()} style={[styles.podiumPlace, { zIndex: 10 }]}>
                    {first && (
                        <>
                            <MaterialCommunityIcons name="crown" size={32} color="#F59E0B" style={{ marginBottom: -12, zIndex: 10 }} />
                            <View style={[styles.podiumAvatar, { borderColor: '#F59E0B', width: 64, height: 64, borderRadius: 32 }]}>
                                <Text style={[styles.podiumAvatarText, { fontSize: 24 }]}>{first.name.charAt(0)}</Text>
                            </View>
                            <Text style={[styles.podiumName, { fontWeight: 'bold', fontSize: 16 }]}>{first.name}</Text>
                            <Text style={[styles.podiumPoints, { color: '#F59E0B' }]}>{first.total_points}</Text>
                            <View style={[styles.podiumBar, { height: 110, backgroundColor: '#F59E0B', shadowColor: '#F59E0B', shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 }]}>
                                <Text style={styles.podiumRank}>1</Text>
                            </View>
                        </>
                    )}
                </Animated.View>

                {/* Third Place */}
                <Animated.View entering={FadeInUp.delay(300).springify()} style={[styles.podiumPlace, { marginTop: 60 }]}>
                    {third && (
                        <>
                            <MaterialCommunityIcons name="crown" size={20} color="#CD7F32" style={{ marginBottom: -8, zIndex: 10 }} />
                            <View style={[styles.podiumAvatar, { borderColor: '#CD7F32' }]}>
                                <Text style={styles.podiumAvatarText}>{third.name.charAt(0)}</Text>
                            </View>
                            <Text style={styles.podiumName} numberOfLines={1}>{third.name}</Text>
                            <Text style={styles.podiumPoints}>{third.total_points}</Text>
                            <View style={[styles.podiumBar, { height: 60, backgroundColor: '#CD7F32' }]}>
                                <Text style={styles.podiumRank}>3</Text>
                            </View>
                        </>
                    )}
                </Animated.View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Leaderboard</Text>
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'global' && { backgroundColor: THEME_COLOR }]}
                    onPress={() => handleTabSwitch('global')}
                >
                    <Text style={[styles.tabText, activeTab === 'global' && styles.activeTabText]}>Global</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'circle' && { backgroundColor: THEME_COLOR }]}
                    onPress={() => handleTabSwitch('circle')}
                >
                    <Text style={[styles.tabText, activeTab === 'circle' && styles.activeTabText]}>My Circle</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={rest}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListHeaderComponent={Podium}
                refreshing={loading}
                onRefresh={fetchLeaderboard}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="trophy-outline" size={64} color="#374151" />
                        <Text style={styles.emptyText}>
                            {activeTab === 'circle'
                                ? (!user?.circle_id ? "Join a Circle to compete!" : "No members found.")
                                : "No players yet."}
                        </Text>
                        {activeTab === 'circle' && !user?.circle_id && (
                            <TouchableOpacity style={[styles.joinButton, { backgroundColor: THEME_COLOR }]} onPress={() => router.push('/(tabs)/circle')}>
                                <Text style={styles.joinButtonText}>Find a Circle</Text>
                            </TouchableOpacity>
                        )}
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
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 24,
        backgroundColor: '#1F1F2E',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    tabs: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: '#1F1F2E',
    },
    tabText: {
        color: '#9CA3AF',
        fontWeight: '600',
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    podiumContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        height: 250,
        marginBottom: 24,
        gap: 16,
    },
    podiumPlace: {
        alignItems: 'center',
        width: width * 0.25,
    },
    podiumAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#1F1F2E',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        marginBottom: 8,
    },
    podiumAvatarText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 20,
    },
    podiumName: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
    },
    podiumPoints: {
        color: '#9CA3AF',
        fontSize: 10,
        marginBottom: 8,
    },
    podiumBar: {
        width: '100%',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        alignItems: 'center',
        paddingTop: 8,
    },
    podiumRank: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 24,
        opacity: 0.8,
    },
    list: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1F1F2E',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    myCard: {
        borderWidth: 1,
    },
    rank: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#6B7280',
        width: 30,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2D2D3D',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    avatarText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    userPoints: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        color: '#6B7280',
        fontSize: 16,
        marginTop: 16,
        marginBottom: 24,
    },
    joinButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    joinButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    }
});
