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
                    <Image
                        source={require('../../assets/images/female/user.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.appName}>Sunya</Text>
                </View>
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
        backgroundColor: 'rgba(15, 15, 30, 0.7)',
        backdropFilter: 'blur(12px)',
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
        width: 36,
        height: 36,
        borderRadius: 12,
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
});
