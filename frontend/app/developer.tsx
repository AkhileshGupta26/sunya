import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '../hooks/useThemeColor';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function DeveloperPage() {
    const router = useRouter();
    const THEME_COLOR = useThemeColor();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>About Developer</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={[styles.devCard, { borderColor: THEME_COLOR, shadowColor: THEME_COLOR }]}>
                    <View style={[styles.avatarContainer, { backgroundColor: THEME_COLOR }]}>
                        <MaterialCommunityIcons name="xml" size={40} color="white" />
                    </View>

                    <Text style={styles.devName}>Akhilesh Gupta</Text>
                    <Text style={styles.devRole}>Full Stack Engineer</Text>

                    <Text style={styles.bio}>
                        Building digital sanctuaries for the modern mind.
                        Dedicated to creating mindful technology that
                        respects your time and attention.
                    </Text>

                    <View style={styles.divider} />

                    <View style={styles.socialRow}>
                        <TouchableOpacity onPress={() => Linking.openURL('https://github.com/AkhileshGupta26')} style={styles.iconButton}>
                            <MaterialCommunityIcons name="github" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => Linking.openURL('https://linkedin.com/in/akhilesh-gupta26')} style={styles.iconButton}>
                            <MaterialCommunityIcons name="linkedin" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => Linking.openURL('mailto:akhilesh@example.com')} style={styles.iconButton}>
                            <MaterialCommunityIcons name="email" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.footerText}>Made with ❤️ in India</Text>

            </ScrollView>
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
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#1F1F2E',
        backgroundColor: '#0F0F1E',
    },
    backButton: {
        marginRight: 16,
        padding: 8,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 24,
        alignItems: 'center',
    },
    devCard: {
        backgroundColor: '#1F1F2E',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: '#7C3AED',
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: 32,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#7C3AED',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    devName: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    devRole: {
        color: '#9CA3AF',
        fontSize: 16,
        marginBottom: 24,
    },
    bio: {
        color: '#D1D5DB',
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 24,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#2D2D3D',
        marginBottom: 24,
    },
    socialRow: {
        flexDirection: 'row',
        gap: 20,
    },
    iconButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#2D2D3D',
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerText: {
        color: '#6B7280',
        fontSize: 12,
    },
});
