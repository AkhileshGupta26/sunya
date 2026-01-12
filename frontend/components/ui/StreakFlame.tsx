import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import LottieView from 'lottie-react-native';

// Fallback for Web if lottie-react-native has issues (though it supports web now)
// We will try standard LottieView first.

interface StreakFlameProps {
    size?: number;
    active?: boolean;
}

export const StreakFlame = ({ size = 50, active = true }: StreakFlameProps) => {
    if (!active) return null;

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <LottieView
                source={{ uri: 'https://lottie.host/9bd48897-7b0d-41c2-baff-f51b43cc73a2/eCBwBO8l20.lottie' }}
                autoPlay
                loop
                style={{ width: size, height: size }}
            />
        </View>
    );
};
