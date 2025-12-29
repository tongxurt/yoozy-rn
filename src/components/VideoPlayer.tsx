import { Feather } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import React from "react";
import { Modal, StatusBar, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface VideoPlayerProps {
    videoUrl?: string;
    visible: boolean;
    onClose: () => void;
}

const VideoPlayer = ({ videoUrl, visible, onClose }: VideoPlayerProps) => {
    const insets = useSafeAreaInsets();

    if (!videoUrl) return null;

    return (
        <Modal
            visible={visible}
            transparent={false}
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <StatusBar hidden />
            <View style={styles.container}>
                <Video
                    source={{ uri: videoUrl }}
                    style={styles.video}
                    resizeMode={ResizeMode.CONTAIN}
                    useNativeControls
                    shouldPlay={visible}
                    isLooping
                />

                <TouchableOpacity
                    style={[styles.closeButton, { top: insets.top + 10 }]}
                    onPress={onClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Feather name="x" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width: '100%',
        flex: 1,
    },
    closeButton: {
        position: 'absolute',
        right: 20,
        zIndex: 50, // Higher z-index to stay above video controls if needed
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
    }
});

export default VideoPlayer;
