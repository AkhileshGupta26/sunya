import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColor } from '../hooks/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';

export default function Developer() {
    const router = useRouter();
    const THEME_COLOR = useThemeColor();

    const handleContact = () => {
        Linking.openURL('mailto:support@sunya.app');
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Developer</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <View style={[styles.imageContainer, { borderColor: THEME_COLOR }]}>
                    <Image
                        source={require('../assets/images/developer.png')}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </View>

                <Text style={styles.name}>Akhilesh Gupta</Text>
                <Text style={styles.role}>Creator of Sunya</Text>

                <View style={styles.card}>
                    <Text style={styles.bio}>
                        Building technology that helps humanity find peace.
                        Sunya is a labor of love, designed to bring the ancient wisdom of mindfulness into the modern digital age.
                    </Text>
                </View>

                <View style={styles.socialRow}>
                    <TouchableOpacity onPress={() => Linking.openURL('https://github.com/AkhileshGupta26')} style={styles.socialButton}>
                        <MaterialCommunityIcons name="github" size={28} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Linking.openURL('https://www.linkedin.com/in/akhilesh-gupta26')} style={styles.socialButton}>
                        <MaterialCommunityIcons name="linkedin" size={28} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleContact} style={styles.socialButton}>
                        <MaterialCommunityIcons name="email-outline" size={28} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={{ marginTop: 40, alignItems: 'center' }}>
                    <Text style={{ color: '#6B7280', fontSize: 14 }}>Made with ❤️ in India 🇮🇳</Text>
                </View>
            </View>
        </ScrollView>
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#1F1F2E',
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        alignItems: 'center',
        padding: 24,
    },
    imageContainer: {
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 4,
        overflow: 'hidden',
        marginBottom: 24,
        backgroundColor: '#1F1F2E',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    role: {
        fontSize: 16,
        color: '#9CA3AF',
        marginBottom: 32,
    },
    card: {
        backgroundColor: '#1F1F2E',
        padding: 24,
        borderRadius: 20,
        width: '100%',
        marginBottom: 32,
    },
    bio: {
        color: '#D1D5DB',
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
        fontStyle: 'italic',
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 30,
        elevation: 4,
    },
    contactButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    socialRow: {
        flexDirection: 'row',
        gap: 20,
        marginTop: 8,
    },
    socialButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#1F1F2E',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#374151',
    },
});
