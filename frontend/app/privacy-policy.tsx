import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function PrivacyPolicy() {
    const router = useRouter();
    const THEME_COLOR = '#00BFFF'; // Electric Blue for "Nothing" vibe

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>PRIVACY_POLICY</Text>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* Pixel Header Art */}
                <View style={styles.pixelArtContainer}>
                    <Text style={styles.pixelText}>
                        01010011 01010101 01001110 01011001 01000001
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>// 01. YOUR_DATA</Text>
                    <Text style={styles.text}>
                        We collect minimal data to power your mindfulness journey.
                        All meditation stats, streaks, and circle interactions are stored securely.
                        We do not sell your personal data to third parties.
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>// 02. CAMERA_USAGE</Text>
                    <Text style={styles.text}>
                        The camera is ONLY used for BPM (Heart Rate) measurements using your fingertip.
                        No video is ever recorded, stored, or transmitted. The analysis happens locally on your device in real-time.
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>// 03. SOCIAL_CIRCLES</Text>
                    <Text style={styles.text}>
                        When you join a circle, only your display name and basic activity stats (streak, points) are visible to other members.
                    </Text>
                </View>

                {/* Know Developer Section - Highlighted */}
                <View style={styles.developerContainer}>
                    <LinearGradient
                        colors={['#00BFFF20', '#000000']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.devGradient}
                    >
                        <View style={styles.devContent}>
                            <View style={styles.glitchBox}>
                                <Text style={styles.devLabel}>DESIGNED BY</Text>
                                <Text style={styles.devName}>AKHILESH GUPTA</Text>
                                <View style={styles.pixelLine} />
                                <Text style={styles.devRole}>FULL STACK ENGINEER</Text>
                            </View>

                            <View style={styles.socialRow}>
                                <TouchableOpacity onPress={() => Linking.openURL('https://github.com/AkhileshGupta26')} style={styles.iconBox}>
                                    <MaterialCommunityIcons name="github" size={24} color="#00BFFF" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => Linking.openURL('https://linkedin.com/in/akhilesh-gupta26')} style={styles.iconBox}>
                                    <MaterialCommunityIcons name="linkedin" size={24} color="#00BFFF" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => Linking.openURL('mailto:akhilesh@example.com')} style={styles.iconBox}>
                                    <MaterialCommunityIcons name="email" size={24} color="#00BFFF" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.quote}>"Code is poetry written for machines."</Text>
                        </View>
                    </LinearGradient>
                    {/* Pixel corners */}
                    <View style={[styles.corner, styles.tl]} />
                    <View style={[styles.corner, styles.tr]} />
                    <View style={[styles.corner, styles.bl]} />
                    <View style={[styles.corner, styles.br]} />
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000', // Pure Black
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        backgroundColor: '#000000',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingBottom: 20,
    },
    backButton: {
        marginRight: 16,
        padding: 8,
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
    },
    headerTitle: {
        color: '#00BFFF',
        fontSize: 20,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    content: {
        padding: 20,
    },
    pixelArtContainer: {
        marginBottom: 30,
        opacity: 0.5,
    },
    pixelText: {
        color: '#333',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 10,
        textAlign: 'center',
    },
    card: {
        marginBottom: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 0, // Square corners for pixel aesthetic
        borderStyle: 'dashed', // Dotted/Dashed feel
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontWeight: 'bold',
        marginBottom: 12,
    },
    text: {
        color: '#888',
        fontSize: 14,
        lineHeight: 22,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    developerContainer: {
        marginTop: 20,
        position: 'relative',
        padding: 2,
        marginBottom: 40,
    },
    devGradient: {
        padding: 24,
        borderWidth: 1,
        borderColor: '#00BFFF',
    },
    devContent: {
        alignItems: 'center',
    },
    glitchBox: {
        alignItems: 'center',
        marginBottom: 20,
    },
    devLabel: {
        color: '#555',
        fontSize: 10,
        letterSpacing: 4,
        marginBottom: 8,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    devName: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        textShadowColor: '#00BFFF',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 0, // Sharp shadow/glitch
    },
    pixelLine: {
        height: 2,
        width: 60,
        backgroundColor: '#00BFFF',
        marginVertical: 12,
    },
    devRole: {
        color: '#00BFFF',
        fontSize: 12,
        letterSpacing: 2,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    socialRow: {
        flexDirection: 'row',
        gap: 20,
        marginVertical: 20,
    },
    iconBox: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#333',
        backgroundColor: '#000',
    },
    quote: {
        color: '#444',
        fontStyle: 'italic',
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    // Pixel Corners
    corner: {
        position: 'absolute',
        width: 6,
        height: 6,
        backgroundColor: '#00BFFF',
    },
    tl: { top: 0, left: 0 },
    tr: { top: 0, right: 0 },
    bl: { bottom: 0, left: 0 },
    br: { bottom: 0, right: 0 },
});
