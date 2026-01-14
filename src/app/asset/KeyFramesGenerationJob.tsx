import XImageViewer from "@/components/XImageViewer";
import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import KeyFrameEditorDrawer from "./KeyFrameEditorDrawer";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;

interface Frame {
    url?: string;
    desc?: string;
    status?: 'waiting' | 'running' | 'done';
    prompt?: string;
    refs?: string[];
}

interface JobProps {
    index: number;
    job: any;
    asset: any;
    refetch: () => void;
}

const FrameItem = React.memo(({
    frame,
    index,
    editable,
    label,
    images,
    onEdit,
}: {
    frame: Frame;
    index: number;
    editable?: boolean;
    label: string;
    images: string[];
    onEdit: (index: number) => void;
}) => {
    const isRunning = frame.status?.toLowerCase() === 'running';

    return (
        <View
            className={`flex-1 min-w-[140px] flex flex-col rounded-xl border border-gray-100 overflow-hidden ${isRunning ? 'opacity-90' : ''}`}
        >
            <View className="relative aspect-[9/16] bg-gray-50 overflow-hidden">
                {frame.url ? (
                    <XImageViewer defaultIndex={index} images={images}>
                        <Image
                            source={{ uri: frame.url }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    </XImageViewer>
                ) : (
                    <TouchableOpacity 
                        className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                        onPress={() => editable && !isRunning && onEdit(index)}
                    >
                        {isRunning ? (
                            <ActivityIndicator size="small" color="#7150ff" />
                        ) : (
                            <Feather name="plus" size={24} color="#E5E7EB" />
                        )}
                    </TouchableOpacity>
                )}

                {/* Label */}
                <View className={`absolute top-2 ${label === '起始帧' ? 'left-2' : 'right-2'} z-10`}>
                    <View className={`px-2 py-0.5 rounded-md ${label === '起始帧' ? 'bg-green-500/90' : 'bg-blue-500/90'} backdrop-blur-sm border border-white/20`}>
                        <Text className="text-white text-[9px] font-bold">
                            {label}
                        </Text>
                    </View>
                </View>

                {/* Edit Button Overlay - only if editable */}
                {editable && !isRunning && frame.url && (
                    <TouchableOpacity 
                        className="absolute bottom-2 right-2 w-8 h-8 bg-primary rounded-full items-center justify-center shadow-sm"
                        onPress={() => onEdit(index)}
                    >
                        <Feather name="edit-2" size={14} color="white" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
});

const KeyFramesGenerationJob = ({ index: jobIndex, job, asset, refetch }: JobProps) => {
    const { colors } = useTailwindVars();
    const data = job?.dataBus?.keyFrames;
    const editable = job.status === 'confirming';
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const frames = data?.frames || [];
    const images = useMemo(() => frames.map((f: any) => f.url).filter(Boolean), [frames]);

    const framePairs = useMemo(() => {
        const pairs: [Frame, Frame | null][] = [];
        for (let i = 0; i < frames.length; i += 2) {
            pairs.push([frames[i], frames[i + 1] || null]);
        }
        return pairs;
    }, [frames]);

    const onScroll = (event: any) => {
        const x = event.nativeEvent.contentOffset.x;
        const index = Math.round(x / (CARD_WIDTH + 16));
        if (index !== activeIndex) {
            setActiveIndex(index);
        }
    };

    if (frames.length === 0) return null;

    return (
        <View className="flex-1 p-4">
            <View className="flex-row items-center gap-2 mb-4 px-1">
                <Text className="text-xs text-gray-400 font-bold uppercase tracking-wider">分镜关键帧</Text>
                <Text className="text-[10px] text-gray-300 font-bold">({activeIndex + 1}/{framePairs.length})</Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + 16}
                decelerationRate="fast"
                onScroll={onScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{ flexGrow: 1 }}
                className="flex-1"
            >
                {framePairs.map((pair, pairIndex) => {
                    const [startFrame, endFrame] = pair;
                    const startIdx = pairIndex * 2;
                    const endIdx = pairIndex * 2 + 1;

                    return (
                        <View
                            key={pairIndex}
                            style={{ width: CARD_WIDTH }}
                            className="bg-white rounded-[24px] border border-gray-100 shadow-sm mr-4 overflow-hidden"
                        >
                            {/* Pair Header */}
                            <View className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex-row items-center justify-between">
                                <View className="flex-row items-center gap-2">
                                    <View className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Text className="text-primary text-[10px] font-black">#{pairIndex + 1}</Text>
                                    </View>
                                    <Text className="text-xs font-bold text-gray-600">视频关键帧</Text>
                                </View>
                            </View>

                            {/* Frame Pair Container */}
                            <View className="flex-row gap-3 p-4">
                                <FrameItem
                                    frame={startFrame}
                                    index={startIdx}
                                    editable={editable}
                                    label="起始帧"
                                    images={images}
                                    onEdit={setSelectedIdx}
                                />
                                {endFrame && (
                                    <FrameItem
                                        frame={endFrame}
                                        index={endIdx}
                                        editable={editable}
                                        label="结束帧"
                                        images={images}
                                        onEdit={setSelectedIdx}
                                    />
                                )}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            {/* Indicator Dots */}
            {framePairs.length > 1 && (
                <View className="flex-row justify-center items-center mt-4 gap-1.5">
                    {framePairs.map((_: any, idx: number) => (
                        <View 
                            key={idx}
                            className={`h-1.5 rounded-full ${idx === activeIndex ? 'w-4 bg-primary' : 'w-1.5 bg-gray-200'}`}
                        />
                    ))}
                </View>
            )}

            <KeyFrameEditorDrawer
                job={job}
                visible={selectedIdx !== null}
                onClose={() => setSelectedIdx(null)}
                frame={selectedIdx !== null ? frames[selectedIdx] : null}
                index={selectedIdx}
                asset={asset}
                onRefresh={refetch}
            />
        </View>
    );
};

export default React.memo(KeyFramesGenerationJob);
