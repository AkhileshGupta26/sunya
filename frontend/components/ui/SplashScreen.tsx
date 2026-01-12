import React, { useRef } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

interface SplashScreenProps {
    onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
    const videoRef = useRef(null);

    React.useEffect(() => {
        // Failsafe: If video doesn't finish in 2 seconds, force finish
        const timer = setTimeout(() => {
            onFinish();
        }, 2000);
        return () => clearTimeout(timer);
    }, [onFinish]);


    return (
        <View style={styles.container}>
            <Video
                ref={videoRef}
                source={require('../../assets/images/splash_image.webm')}
                style={styles.video}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isLooping={false}
                onPlaybackStatusUpdate={(status) => {
                    if (status.isLoaded && status.didJustFinish) {
                        onFinish();
                    }
                }}
                onError={(error) => {
                    console.warn("Splash video failed to load, skipping.", error);
                    onFinish();
                }}
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
    video: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
});
