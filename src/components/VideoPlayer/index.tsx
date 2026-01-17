import React, { useRef, useState, useCallback, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import Video, { ResizeMode, OnProgressData, OnLoadData, VideoRef } from 'react-native-video';
import { Ionicons } from '@expo/vector-icons';

interface VideoPlayerProps {
    videoUrl: string;
    timeStart?: number;
    timeEnd?: number;
    shouldLoop?: boolean;
    resizeMode?: ResizeMode;
    autoPlay?: boolean;
    onReadyForDisplay?: () => void;
    style?: StyleProp<ViewStyle>;
}

const VideoPlayer = ({
    videoUrl,
    timeStart = 0,
    timeEnd,
    shouldLoop = false,
    resizeMode = ResizeMode.CONTAIN,
    autoPlay = false,
    onReadyForDisplay,
    style
}: VideoPlayerProps) => {
    const videoRef = useRef<VideoRef>(null);
    const [paused, setPaused] = useState(!autoPlay);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);

    // 监听外部 autoPlay 变化
    useEffect(() => {
        setPaused(!autoPlay);
    }, [autoPlay, videoUrl]);

    const handleLoad = (data: OnLoadData) => {
        setIsLoaded(true);
        setIsLoading(false);
        
        // 双重保障：初始位置跳转
        if (timeStart > 0) {
            videoRef.current?.seek(timeStart);
        }
    };

    const handleProgress = (data: OnProgressData) => {
        // 片段循环逻辑
        if (timeEnd !== undefined && data.currentTime >= timeEnd) {
            if (shouldLoop) {
                videoRef.current?.seek(timeStart);
            } else {
                setPaused(true);
            }
        }
    };

    const handleEnd = () => {
        if (shouldLoop) {
            videoRef.current?.seek(timeStart);
        } else {
            setPaused(true);
        }
    };

    const handleReadyForDisplay = () => {
        if (onReadyForDisplay) {
            onReadyForDisplay();
        }
    };

    const togglePlayPause = () => {
        if (!isLoaded) return;
        setPaused(!paused);
    };

    const showOverlay = paused || isLoading;

    return (
        <View style={[styles.container, style]}>
            <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={togglePlayPause}
            >
                <Video
                    ref={videoRef}
                    source={{ uri: videoUrl }}
                    style={StyleSheet.absoluteFill}
                    resizeMode={resizeMode}
                    paused={paused}
                    muted={false}
                    volume={1.0}
                    onLoad={handleLoad}
                    onProgress={handleProgress}
                    onEnd={handleEnd}
                    onReadyForDisplay={handleReadyForDisplay}
                    progressUpdateInterval={50}
                    repeat={false} // 我们手动控制 repeat 以支持片段
                    playInBackground={false}
                    playWhenInactive={false}
                    ignoreSilentSwitch="ignore" // 忽略静音键，确保强制有声
                    shutterColor="transparent"
                    disableFocus={true}
                    mixWithOthers="mix"
                />

                {/* 交互反馈层 */}
                {showOverlay && (
                    <View style={styles.overlay}>
                        {isLoading ? (
                            <ActivityIndicator size="large" color="#fff" />
                        ) : (
                            <Ionicons name="play" size={60} color="rgba(255,255,255,0.8)" />
                        )}
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'black',
        overflow: 'hidden',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
});

export default VideoPlayer;
