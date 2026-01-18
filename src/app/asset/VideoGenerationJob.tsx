import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import VideoGenerationEditorDrawer from "./components/VideoGenerationEditorDrawer";

interface JobProps {
    index: number;
    job: any;
    asset: any;
    refetch: () => void;
}

const VideoGenerationJob = ({ index: jobIndex, job, asset, refetch }: JobProps) => {
    const { colors } = useTailwindVars();
    const data = job?.dataBus?.videoGenerations || [];
    const item = data?.[0]; 
    
    const [isEditing, setIsEditing] = useState(false);
    const editable = job.status === 'confirming';
    const isRunning = item?.status?.toLowerCase() === 'running' || job.status === 'running';

    const handlePreview = () => {
        if (item?.url && !isRunning) {
            router.push(`/video?url=${encodeURIComponent(item.url)}`);
        }
    };

    return (
        <View className="flex-1 p-5">
                {/* Content */}
                <View className="flex-1">
                    {item ? (
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={handlePreview}
                            className="flex-1 relative bg-gray-100 rounded-xl overflow-hidden border border-gray-100"
                        >
                            {item.url && !isRunning ? (
                                <View className="w-full h-full">
                                    <Image
                                        source={{ uri: item.coverUrl || item.lastFrame }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                    <View className="absolute inset-0 items-center justify-center">
                                        <View className="w-12 h-12 rounded-full bg-black/40 items-center justify-center backdrop-blur-sm">
                                            <Feather name="play" size={24} color="white" style={{ marginLeft: 2 }} />
                                        </View>
                                    </View>

                                    {editable && (
                                        <TouchableOpacity 
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                setIsEditing(true);
                                            }}
                                            className="absolute bottom-3 right-3 w-10 h-10 bg-primary rounded-full items-center justify-center shadow-md"
                                        >
                                            <Feather name="edit-2" size={18} color="white" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ) : (
                                <View className="w-full h-full items-center justify-center bg-black/5">
                                    {(item.lastFrame || item.coverUrl) && (
                                        <Image
                                            source={{ uri: item.lastFrame || item.coverUrl }}
                                            className="absolute inset-0 w-full h-full opacity-40"
                                            blurRadius={1}
                                        />
                                    )}
                                    <ActivityIndicator size="small" color={colors.primary} />
                                    <Text className="text-[10px] text-gray-500 mt-2 font-bold uppercase">生成中</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <View className="flex-1 items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <ActivityIndicator size="small" color={colors.primary} />
                            <Text className="text-[10px] text-gray-400 mt-2 font-bold uppercase">初始化任务中...</Text>
                        </View>
                    )}
            </View>

            {item && (
                <VideoGenerationEditorDrawer
                    job={job}
                    visible={isEditing}
                    onClose={() => setIsEditing(false)}
                    video={item}
                    index={0}
                    asset={asset}
                    onRefresh={refetch}
                />
            )}
        </View>
    );
};

export default React.memo(VideoGenerationJob);
