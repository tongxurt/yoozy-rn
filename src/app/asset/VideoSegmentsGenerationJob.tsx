import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";

interface JobProps {
    index: number;
    job: any;
    asset: any;
    refetch: () => void;
    selectedItem?: any;
    onSelect?: (item: any) => void;
}

const Job = ({ index, job, asset, refetch, selectedItem, onSelect }: JobProps) => {
    const { colors } = useTailwindVars();

    const data = asset?.workflow?.dataBus?.videoGenerations;

    if (!data) return null;

    return (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
            <View className="flex-row flex-wrap justify-between gap-y-4">
                {data.map((item: any, index: number) => {
                    const isSelected = selectedItem?.url === item.url;
                    const isAnySelected = !!selectedItem;

                    return (
                        <TouchableOpacity
                            key={index}
                            activeOpacity={0.9}
                            onPress={() => onSelect?.(item)}
                            className={`w-[48%] bg-card rounded-xl overflow-hidden shadow-sm border-2 ${isSelected ? 'border-primary' : 'border-transparent'} ${isAnySelected && !isSelected ? 'opacity-50' : 'opacity-100'}`}
                            style={{ aspectRatio: 9 / 16 }}
                        >
                            {!item.url ? (
                                <View className="flex-1 items-center justify-center gap-2 bg-primary/20">
                                    <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center">
                                        <ActivityIndicator size="small" color={colors.primary} />
                                    </View>
                                    <Text className="text-primary text-sm font-bold tracking-wide">创作进行中</Text>
                                </View>
                            ) : (
                                <View className="w-full h-full relative">
                                    <Image
                                        source={{ uri: item.coverUrl || item.lastFrame }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                    <View className="absolute inset-0 bg-black/20" pointerEvents="none" />

                                    <View className="absolute inset-0 items-center justify-center">
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={() => router.push(`/video?url=${encodeURIComponent(item.url)}`)}
                                            className="w-12 h-12 rounded-full bg-black/40 items-center justify-center backdrop-blur-sm"
                                        >
                                            <Feather name="play" size={20} color="white" style={{ marginLeft: 2 }} />
                                        </TouchableOpacity>
                                    </View>

                                    <View className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded-md">
                                        <Text className="text-white text-[10px] font-medium">
                                            Segment {index + 1}
                                        </Text>
                                    </View>

                                    {isSelected && (
                                        <View className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary items-center justify-center border-2 border-white">
                                            <Feather name="check" size={14} color="white" />
                                        </View>
                                    )}

                                    {!isSelected && !isAnySelected && (
                                        <View className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/30 items-center justify-center border border-white/50">
                                        </View>
                                    )}
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </ScrollView>
    );
};

export default Job;
