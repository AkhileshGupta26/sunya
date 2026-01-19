declare module 'react-native-modal' {
    import { Component } from 'react';
    import { ViewStyle, StyleProp } from 'react-native';

    export interface ModalProps {
        isVisible?: boolean;
        style?: StyleProp<ViewStyle>;
        onBackdropPress?: () => void;
        onModalHide?: () => void;
        children?: React.ReactNode;
        // Add other props as needed
        animationIn?: string;
        animationOut?: string;
        useNativeDriver?: boolean;
        hideModalContentWhileAnimating?: boolean;
        onSwipeComplete?: () => void;
        swipeDirection?: string | string[];
        propagateSwipe?: boolean;
    }

    export default class Modal extends Component<ModalProps> { }
}
