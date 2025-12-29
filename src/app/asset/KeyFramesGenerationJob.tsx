import XImageViewer from "@/components/XImageViewer";
import useTailwindVars from "@/hooks/useTailwindVars";
import React from "react";
import {
    Image,
    ScrollView,
    Text,
    View
} from "react-native";

interface JobProps {
    index: number;
    job: any;
    asset: any;
    refetch: () => void;
}

const Job = ({ index, job, asset, refetch }: JobProps) => {
    const { colors } = useTailwindVars();

    const data = asset?.workflow?.dataBus?.keyFrames;

    if (!data?.frames) return null;

    const images = data.frames.map((frame: any) => frame.url)

    return (
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
            <View className="flex-row flex-wrap justify-between gap-y-4">
                {data.frames?.map((frame: any, idx: number) => (
                    <View
                        key={idx}
                        className="w-[48%] bg-card rounded-xl overflow-hidden shadow-sm border border-border"
                        style={{ aspectRatio: 9 / 16 }}
                    >
                        <XImageViewer defaultIndex={idx} images={images}>
                            <Image
                                source={{ uri: frame.url }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                            <View className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded-md">
                                <Text className="text-white text-[10px] font-medium">
                                    {idx + 1}
                                </Text>
                            </View>
                        </XImageViewer>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

export default Job;
