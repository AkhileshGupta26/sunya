import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function DeveloperPage() {
    const router = useRouter();
    const THEME_COLOR = '#00BFFF'; // Electric Blue

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>DEVELOPER_MODE</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Main Glitch Card */}
                <View style={styles.developerContainer}>
                    <LinearGradient
                        colors={['#00BFFF10', '#000000']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.devGradient}
                    >
                        {/* Decorative Grid Background */}
                        <View style={styles.gridOverlay} pointerEvents="none">
                            {[...Array(10)].map((_, i) => (
                                <View key={i} style={[styles.gridLine, { top: i * 40 }]} />
                            ))}
                        </View>

                        <View style={styles.devContent}>
                            <View style={styles.glitchBox}>
                                <Text style={styles.devLabel}>ARCHITECT</Text>
                                <Text style={styles.devName}>AKHILESH</Text>
                                <Text style={[styles.devName, { marginTop: -10, color: '#00BFFF' }]}>GUPTA</Text>

                                <View style={styles.pixelLine} />

                                <View style={styles.roleContainer}>
                                    <MaterialCommunityIcons name="xml" size={20} color="#666" />
                                    <Text style={styles.devRole}>FULL STACK ENGINEER</Text>
                                    <MaterialCommunityIcons name="xml" size={20} color="#666" />
                                </View>
                            </View>

                            <Text style={styles.bio}>
                                Building digital sanctuaries.
                                Focused on mindful technology and
                                sustainable code architectures.
                            </Text>

                            <View style={styles.socialRow}>
                                <TouchableOpacity onPress={() => Linking.openURL('https://github.com/AkhileshGupta26')} style={styles.iconBox}>
                                    <MaterialCommunityIcons name="github" size={32} color="#FFFFFF" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => Linking.openURL('https://linkedin.com/in/akhilesh-gupta26')} style={styles.iconBox}>
                                    <MaterialCommunityIcons name="linkedin" size={32} color="#0077B5" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => Linking.openURL('mailto:akhilesh@example.com')} style={styles.iconBox}>
                                    <MaterialCommunityIcons name="email" size={32} color="#EF4444" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.terminalBox}>
                                <Text style={styles.terminalText}>$ git commit -m "With Love"</Text>
                                <Text style={styles.terminalText}>$ git push origin india</Text>
                                <View style={styles.cursor} />
                            </View>

                        </View>
                    </LinearGradient>

                    {/* Pixel corners */}
                    <View style={[styles.corner, styles.tl]} />
                    <View style={[styles.corner, styles.tr]} />
                    <View style={[styles.corner, styles.bl]} />
                    <View style={[styles.corner, styles.br]} />
                </View>

                <Text style={styles.footerText}>EST. 2026 • INDIA</Text>

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
    scrollContent: {
        padding: 24,
        alignItems: 'center',
    },
    developerContainer: {
        width: '100%',
        position: 'relative',
        padding: 2,
        marginBottom: 40,
    },
    devGradient: {
        padding: 32,
        borderWidth: 1,
        borderColor: '#333',
        minHeight: 500,
        justifyContent: 'center',
        overflow: 'hidden',
    },
    gridOverlay: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.1,
    },
    gridLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#00BFFF',
    },
    devContent: {
        alignItems: 'center',
    },
    glitchBox: {
        alignItems: 'center',
        marginBottom: 40,
    },
    devLabel: {
        color: '#555',
        fontSize: 12,
        letterSpacing: 6,
        marginBottom: 16,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    devName: {
        color: '#FFFFFF',
        fontSize: 42,
        fontWeight: '900',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        letterSpacing: -2,
    },
    pixelLine: {
        height: 4,
        width: 80,
        backgroundColor: '#00BFFF',
        marginVertical: 24,
    },
    roleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    devRole: {
        color: '#888',
        fontSize: 14,
        letterSpacing: 2,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    bio: {
        color: '#AAA',
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 14,
        lineHeight: 24,
        maxWidth: 260,
        marginBottom: 40,
    },
    socialRow: {
        flexDirection: 'row',
        gap: 24,
        marginBottom: 40,
    },
    iconBox: {
        padding: 16,
        borderWidth: 1,
        borderColor: '#333',
        backgroundColor: '#050505',
    },
    terminalBox: {
        alignSelf: 'stretch',
        backgroundColor: '#111',
        padding: 16,
        borderLeftWidth: 2,
        borderLeftColor: '#00BFFF',
    },
    terminalText: {
        color: '#00BFFF',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 12,
        marginBottom: 4,
    },
    cursor: {
        width: 8,
        height: 14,
        backgroundColor: '#00BFFF',
        marginTop: 4,
    },
    footerText: {
        color: '#333',
        fontSize: 10,
        letterSpacing: 4,
    },
    // Pixel Corners
    corner: {
        position: 'absolute',
        width: 8,
        height: 8,
        backgroundColor: '#00BFFF',
    },
    tl: { top: 0, left: 0 },
    tr: { top: 0, right: 0 },
    bl: { bottom: 0, left: 0 },
    br: { bottom: 0, right: 0 },
});
