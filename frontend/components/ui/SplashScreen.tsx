import React, { useRef } from 'react';
import { StyleSheet, View, Dimensions, Image } from 'react-native';

interface SplashScreenProps {
    onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
    // Timer to auto-dismiss splash
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onFinish();
        }, 2000); // 2 seconds delay
        return () => clearTimeout(timer);
    }, [onFinish]);


    return (
        <View style={styles.container}>
            <Image
                source={require('../../assets/images/splash_screen.png')}
                style={styles.image}
                resizeMode="contain"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000', // Match splash background
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
});
