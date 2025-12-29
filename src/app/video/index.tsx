import { Feather } from "@expo/vector-icons";
import { Video as ExpoVideo, ResizeMode } from "expo-av";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const VideoPage = () => {
    const { url } = useLocalSearchParams<{ url: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const decodedUrl = url ? decodeURIComponent(url) : null;

    if (!decodedUrl) return null;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false, animation: 'fade', animationDuration: 1, gestureEnabled: false }} />
            <StatusBar hidden />

            <ExpoVideo
                source={{ uri: decodedUrl }}
                style={styles.video}
                resizeMode={ResizeMode.CONTAIN}
                useNativeControls
                shouldPlay
                isLooping
            />

            <TouchableOpacity
                style={[styles.closeButton, { top: insets.top + 10, left: 20 }]}
                onPress={() => router.back()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Feather name="chevron-left" size={32} color="white" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        zIndex: 50,
        padding: 4,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
    }
});

export default VideoPage;