import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PrivacyPolicy() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>PRIVACY_POLICY</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.lastUpdated}>Last Updated: January 2026</Text>

                <View style={styles.section}>
                    <Text style={styles.heading}>1. Introduction</Text>
                    <Text style={styles.paragraph}>
                        Sunya ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>2. Data Collection</Text>
                    <Text style={styles.paragraph}>
                        We collect the following types of information to provide and improve our service:
                    </Text>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.paragraph}>
                            <Text style={styles.bold}>Personal Information:</Text> Name and email address (for account creation/authentication).
                        </Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.paragraph}>
                            <Text style={styles.bold}>Usage Data:</Text> Meditation minutes, sessions completed, and streak verification data.
                        </Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.paragraph}>
                            <Text style={styles.bold}>Camera Data:</Text> Temporary access to camera for Heart Rate (BPM) monitoring. This data is processed locally in real-time and is NOT recorded, stored, or transmitted to any server.
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>3. How We Use Your Data</Text>
                    <Text style={styles.paragraph}>
                        Your data is used solely for:
                    </Text>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.paragraph}>Tracking your meditation progress and streaks.</Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.paragraph}>Facilitating "Social Circles" where only display name and basic stats are shared with circle members.</Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.paragraph}>Authenticating your account across devices.</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>4. Data Safety</Text>
                    <Text style={styles.paragraph}>
                        We implement industry-standard security measures to protect your personal information. We do not sell, trade, or rent your personal identification information to others.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>5. Contact Us</Text>
                    <Text style={styles.paragraph}>
                        If you have any questions about this Privacy Policy, please contact the developer at:
                    </Text>
                    <Text style={[styles.paragraph, { color: '#00BFFF', marginTop: 8 }]}>akhilesh@example.com</Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#1A1A1A',
        backgroundColor: '#000000',
    },
    backButton: {
        marginRight: 16,
        padding: 8,
    },
    headerTitle: {
        color: '#00BFFF',
        fontSize: 20,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    content: {
        padding: 24,
    },
    lastUpdated: {
        color: '#666',
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        marginBottom: 32,
    },
    section: {
        marginBottom: 32,
    },
    heading: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        marginBottom: 12,
    },
    paragraph: {
        color: '#AAAAAA',
        fontSize: 14,
        lineHeight: 22,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    bold: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    bulletPoint: {
        flexDirection: 'row',
        marginTop: 8,
        paddingRight: 10,
    },
    bullet: {
        color: '#00BFFF',
        fontWeight: 'bold',
        marginRight: 10,
        fontSize: 16,
    }
});
