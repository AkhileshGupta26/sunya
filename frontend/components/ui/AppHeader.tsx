import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AppHeader() {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.headerContainer}>
            {Platform.OS === 'web' ? (
                <View style={styles.webBlur} />
            ) : (
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            )}
            <View style={[styles.contentContainer, { paddingTop: insets.top + 8 }]}>
                <View style={styles.branding}>
                    <Text style={styles.appName}>Sunya</Text>
                </View>
                <Image
                    source={require('../../assets/images/female/user.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: 'transparent',
    },
    webBlur: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 15, 30, 0.4)', // More transparent for "cool" look
        backdropFilter: 'blur(20px)', // Stronger blur
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        justifyContent: 'space-between',
    },
    branding: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logo: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1.5,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
});
