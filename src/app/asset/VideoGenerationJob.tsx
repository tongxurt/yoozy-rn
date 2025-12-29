import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    Image,
    Text,
    TouchableOpacity,
    View
} from "react-native";


interface VideoGenerationJobProps {
    index: number;
    job: any;
    asset: any;
    refetch: () => void;
}

const VideoGenerationJob = ({ job, asset, refetch }: VideoGenerationJobProps) => {
    const { colors } = useTailwindVars();
    const [videoPreview, setVideoPreview] = React.useState<string | null>(null);

    const data = asset?.workflow?.dataBus?.videoGenerations?.[0];
    if (!data) return null;

    return <>
        <View className={`rounded-2xl overflow-hidden`}>
            {
                !data?.url ?
                    (
                        <View className="h-full bg-primary/20 items-center justify-center gap-3">
                            {/* Custom Spinner Placeholder or ActivityIndicator */}
                            <View className="w-12 h-12 rounded-full bg-[#8B5CF6]/20 items-center justify-center">
                                <ActivityIndicator size="small" color="#8B5CF6" />
                            </View>
                            <Text className="text-[#8B5CF6] text-sm font-bold tracking-wide">创作进行中</Text>
                        </View>
                    )
                    :
                    (
                        <TouchableOpacity
                            activeOpacity={0.9}
                            className="w-full h-full relative"
                            onPress={() => router.push(`/video?url=${data.url}`)}
                        >
                            <Image source={{ uri: data.coverUrl || data.lastFrame }} className="w-full h-full" resizeMode="cover" />
                            <View className="absolute inset-0 items-center justify-center bg-black/10">
                                <Feather name="play-circle" size={24} color="white" />
                            </View>
                        </TouchableOpacity>
                    )
            }
        </View>

    </>
};

export default VideoGenerationJob;
