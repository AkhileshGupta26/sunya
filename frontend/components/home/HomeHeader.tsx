import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface HomeHeaderProps {
    themeColor: string;
}

import { useAuth } from '../../contexts/AuthContext';
import { StreakFlame } from '../ui/StreakFlame';

export const HomeHeader: React.FC<{ themeColor: string }> = ({ themeColor }) => {
    const { user } = useAuth();
    const router = useRouter();

    return (
        <View style={styles.header}>
            <View>
                <Text style={styles.greeting}>Good morning,</Text>
                <View style={styles.nameRow}>
                    <Text style={styles.name}>{user?.name}</Text>
                    {(user?.current_streak || 0) > 0 && (
                        <View style={styles.flameContainer}>
                            <StreakFlame size={40} active={true} />
                            <Text style={styles.streakCount}>{user?.current_streak}</Text>
                        </View>
                    )}
                </View>
            </View>
            <TouchableOpacity onPress={() => router.push('/profile')}>
                {user?.profile_picture ? (
                    <Image source={{ uri: user.profile_picture }} style={styles.headerAvatar} />
                ) : (
                    <View style={[styles.headerAvatarPlaceholder, { backgroundColor: themeColor }]}>
                        <MaterialCommunityIcons name="account" size={24} color="#FFF" />
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        padding: 24,
        paddingTop: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: 18,
        color: '#9CA3AF',
    },
    name: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 4,
    },
    headerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#2D2D3D',
    },
    headerAvatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#1F1F2E',
        borderWidth: 2,
        borderColor: '#2D2D3D',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    flameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        backgroundColor: '#1F1F2E',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2D2D3D',
    },
    streakCount: {
        color: '#F59E0B',
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: -4, // Pull closer to flame since flame has padding
        marginRight: 4,
    }
});
