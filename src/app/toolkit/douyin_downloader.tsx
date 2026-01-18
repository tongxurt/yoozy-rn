import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Keyboard,
    ScrollView,
    StyleSheet,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { useToast } from 'react-native-toast-notifications';
import { router } from 'expo-router';

import ScreenContainer from '@/components/ScreenContainer';
import VideoPlayer from '@/components/VideoPlayer';
import useTailwindVars from '@/hooks/useTailwindVars';
import { getDouyinVideoUrl } from '@/api/toolkit';
import { extractLink } from '@/utils/url';
import { ResizeMode } from 'react-native-video';

const DouyinDownloader = () => {
    const { colors } = useTailwindVars();
    const toast = useToast();
    
    const [inputUrl, setInputUrl] = useState('');
    const [videoData, setVideoData] = useState<{ url: string; title?: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const extractMutation = useMutation({
        mutationFn: async (url: string) => {
            const extracted = extractLink(url);
            if (!extracted) throw new Error('未发现有效的抖音链接');
            
            try {
                const res = await getDouyinVideoUrl({ url: extracted });
                
                // 彻底检查 API 返回结构
                const responseData = res?.data?.data || res?.data;
                
                if (responseData && (responseData.url || responseData.video_url)) {
                    return {
                        url: responseData.url || responseData.video_url,
                        title: responseData.title || responseData.desc || ''
                    };
                }
                
                // 处理后端明确返回的错误信息
                if (responseData?.message) {
                    throw new Error(responseData.message);
                }
                
                throw new Error('解析失败，请检查链接是否正确');
            } catch (err: any) {
                // 如果是 axios 错误且有 response data，优先使用
                const errMsg = err?.response?.data?.message || err.message;
                throw new Error(errMsg);
            }
        },
        onSuccess: (data) => {
            setVideoData(data);
            Keyboard.dismiss();
            toast.show('解析成功', { type: 'success' });
        },
        onError: (error: any) => {
            Alert.alert('提示', error.message || '系统繁忙，请稍后重试');
        }
    });

    const handlePaste = async () => {
        try {
            const text = await Clipboard.getStringAsync();
            if (text) {
                setInputUrl(text);
            }
        } catch (e) {
            // 忽略剪贴板错误
        }
    };

    const handleSaveVideo = async () => {
        if (!videoData?.url) return;

        try {
            setIsSaving(true);
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('权限不足', '请在设置中开启相册权限以保存视频');
                return;
            }

            const filename = `yoozy_video_${Date.now()}.mp4`;
            const fileUri = `${FileSystem.cacheDirectory}${filename}`;

            toast.show('正在下载...', { id: 'downloading' });
            
            const downloadRes = await FileSystem.downloadAsync(videoData.url, fileUri);
            
            if (downloadRes.status === 200) {
                await MediaLibrary.saveToLibraryAsync(downloadRes.uri);
                toast.hide('downloading');
                toast.show('已存入系统相册', { type: 'success' });
            } else {
                throw new Error('下载失败');
            }
        } catch (error) {
            toast.hide('downloading');
            toast.show('保存失败，请稍后重试', { type: 'danger' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ScreenContainer edges={['top']}>
            {/* Header 区域 */}
            <View className="px-5 py-3 flex-row justify-between items-center border-b border-muted/10">
                <Text className="text-xl font-bold" style={{ color: colors.foreground }}>抖音去水印下载</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center rounded-full bg-muted/20"
                >
                    <Ionicons name="close" size={24} color={colors.foreground} />
                </TouchableOpacity>
            </View>
            
            <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled">
                <View className="mt-6">
                    <Text className="text-muted-foreground text-xs mb-4">
                        复制抖音文案中的链接，点击下方按钮一键提取无水印原片
                    </Text>
                    
                    <View className="bg-muted rounded-3xl p-5 min-h-[120px] relative border border-transparent focus:border-primary shadow-sm">
                        <TextInput
                            className="flex-1 text-foreground text-base leading-6"
                            placeholder="请粘贴抖音分享链接..."
                            placeholderTextColor={colors['muted-foreground']}
                            multiline
                            textAlignVertical="top"
                            value={inputUrl}
                            onChangeText={setInputUrl}
                        />
                        {inputUrl.length > 0 && (
                            <TouchableOpacity 
                                onPress={() => setInputUrl('')}
                                className="absolute right-4 top-4 w-8 h-8 items-center justify-center bg-gray-200/50 rounded-full"
                            >
                                <Feather name="x" size={16} color={colors.foreground} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View className="flex-row gap-4 mt-6">
                        <TouchableOpacity 
                            onPress={handlePaste}
                            className="flex-1 h-14 flex-row items-center justify-center bg-muted rounded-2xl"
                        >
                            <Feather name="clipboard" size={20} color={colors.primary} />
                            <Text className="ml-2 text-primary font-bold">粘贴</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            onPress={() => extractMutation.mutate(inputUrl)}
                            disabled={!inputUrl || extractMutation.isPending}
                            className={`flex-[2] h-14 flex-row items-center justify-center rounded-2xl ${
                                !inputUrl || extractMutation.isPending ? 'bg-primary/40' : 'bg-primary shadow-lg shadow-primary/30'
                            }`}
                        >
                            {extractMutation.isPending ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text className="text-white font-bold text-lg">开始提取</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {videoData && (
                    <View className="mt-10 mb-10">
                        <View className="bg-white dark:bg-gray-900 rounded-[32px] overflow-hidden border border-muted/50 shadow-xl">
                            <View className="aspect-[9/16] w-full bg-black">
                                <VideoPlayer 
                                    videoUrl={videoData.url}
                                    shouldLoop
                                    autoPlay={false}
                                    resizeMode={ResizeMode.CONTAIN}
                                    style={StyleSheet.absoluteFillObject}
                                />
                            </View>
                            
                            <View className="p-6">
                                {videoData.title ? (
                                    <Text className="text-foreground text-base font-bold mb-6" numberOfLines={2}>
                                        {videoData.title}
                                    </Text>
                                ) : null}
                                
                                <TouchableOpacity
                                    onPress={handleSaveVideo}
                                    disabled={isSaving}
                                    activeOpacity={0.8}
                                    className={`h-14 rounded-2xl items-center justify-center bg-primary flex-row ${isSaving ? 'opacity-70' : ''}`}
                                >
                                    {isSaving ? (
                                        <ActivityIndicator color="white" size="small" />
                                    ) : (
                                        <>
                                            <Feather name="download" size={22} color="white" />
                                            <Text className="ml-2 text-white font-bold text-lg">保存到手机相册</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    onPress={() => {
                                        Clipboard.setStringAsync(videoData.url);
                                        toast.show('链接已复制', { type: 'success' });
                                    }}
                                    className="mt-4 py-2 items-center"
                                >
                                    <Text className="text-muted-foreground text-xs underline">复制视频无水印直链</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                <View className="mt-10 p-6 bg-primary/5 rounded-[24px] mb-20 border border-primary/10">
                    <Text className="text-primary font-bold mb-2">使用帮助</Text>
                    <Text className="text-muted-foreground text-[12px] leading-5">
                        • 粘贴包含链接的分享文案即可自动识别 {"\n"}
                        • 若提取失败，请检查链接是否在有效期内 {"\n"}
                        • 下载后的视频不含抖音水印
                    </Text>
                </View>
            </ScrollView>
        </ScreenContainer>
    );
};

export default DouyinDownloader;
