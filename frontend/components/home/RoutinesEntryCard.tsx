import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface RoutinesEntryCardProps {
    themeColor?: string;
    title?: string;
    subtitle?: string;
}

export const RoutinesEntryCard: React.FC<RoutinesEntryCardProps> = ({
    themeColor = '#7F5AF0',
    title = "Routines of Greatness",
    subtitle = "Copy habits from cricket, business & science legends."
}) => {
    const router = useRouter();

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            style={styles.container}
            onPress={() => router.push('/routines')}
        >
            <View style={[styles.card, { borderColor: themeColor + '40' }]}>
                <View style={styles.content}>
                    <View style={[styles.iconContainer, { backgroundColor: themeColor + '20' }]}>
                        <Ionicons name="sparkles" size={24} color={themeColor} />
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subtitle}>{subtitle}</Text>
                    </View>

                    <Ionicons name="chevron-forward" size={24} color="#666" />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        marginBottom: 16,
        width: '100%',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
    },
});
