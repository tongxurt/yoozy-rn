import {StyleSheet, TouchableOpacity, View, ActivityIndicator} from 'react-native';
import {ResizeMode, Video} from 'expo-av';
import React, {useEffect, useRef, useState} from 'react';
import {Ionicons} from '@expo/vector-icons';

interface VideoPlayerProps {
    videoUri: string;
    timeStart?: number;
    timeEnd?: number;
    coverUrl?: string;
    shouldLoop?: boolean;
}

const VideoPlayer = ({videoUri, timeStart, timeEnd, coverUrl, shouldLoop = false}: VideoPlayerProps) => {
    const videoRef = useRef<Video>(null);
    const [playbackStatus, setPlaybackStatus] = useState<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (timeStart !== undefined && videoRef.current) {
            videoRef.current.setPositionAsync(timeStart * 1000);
        }
    }, [timeStart]);

    // 播放时隐藏控制器，暂停时显示
    useEffect(() => {
        if (isPlaying) {
            setShowControls(false);
        } else {
            setShowControls(true);
        }
    }, [isPlaying]);

    const handlePlaybackStatusUpdate = (status: any) => {
        setPlaybackStatus(status);
        if (!status.isLoaded) return;

        setIsPlaying(status.isPlaying);

        if (timeEnd !== undefined && status.positionMillis >= timeEnd * 1000) {
            if (shouldLoop && timeStart !== undefined) {
                videoRef.current?.setPositionAsync(timeStart * 1000);
            } else {
                videoRef.current?.pauseAsync();
                if (timeStart !== undefined) {
                    videoRef.current?.setPositionAsync(timeStart * 1000);
                }
            }
        }

        if (status.didJustFinish) {
            if (timeStart !== undefined) {
                videoRef.current?.setPositionAsync(timeStart * 1000);
            }
            if (!shouldLoop) {
                videoRef.current?.pauseAsync();
            }
        }
    };

    const togglePlayPause = async () => {
        if (!videoRef.current) return;

        if (isPlaying) {
            await videoRef.current.pauseAsync();
        } else {
            await videoRef.current.playAsync();
        }
    };

    const handleVideoPress = () => {
        togglePlayPause();
    };

    const isLoading = playbackStatus?.isLoaded === false;

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.videoContainer}
                activeOpacity={1}
                onPress={handleVideoPress}
            >
                <Video
                    ref={videoRef}
                    source={{uri: videoUri}}
                    posterSource={coverUrl ? {uri: coverUrl} : undefined}
                    usePoster={!!coverUrl}
                    shouldPlay={false}
                    isLooping={shouldLoop && timeStart === undefined && timeEnd === undefined}
                    useNativeControls={false}
                    resizeMode={ResizeMode.CONTAIN}
                    onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                    style={styles.video}
                />

                {/* 只在暂停时显示控制器 */}
                {showControls && !isPlaying && (
                    <View style={styles.controlsOverlay}>
                        <TouchableOpacity
                            style={styles.playPauseButton}
                            onPress={togglePlayPause}
                            activeOpacity={0.7}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="large" color="#fff" />
                            ) : (
                                <Ionicons
                                    name="play"
                                    size={50}
                                    color="#fff"
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    videoContainer: {
        position: 'relative',
        width: '100%',
    },
    video: {
        height: 200,
        width: '100%',
    },
    controlsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    playPauseButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        // 移除了 backgroundColor 和 borderColor
    },
});

export default VideoPlayer;
