import { createAssetV2 } from "@/api/asset";
import { getCommodity } from "@/api/commodity";
import { getTemplateSegment } from "@/api/resource";
import CommoditySelectorModal from "@/components/commodity/selector_modal";
import InspirationSelectorModal from "@/components/inspiration/selector_modal";
import ScreenContainer from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import { Toast } from "react-native-toast-notifications";



const SelectorCard = ({
    title,
    placeholder,
    item,
    onPress,
    icon,
    required = false,
}: {
    title: string;
    placeholder: string;
    item?: any;
    onPress: () => void;
    icon: any;
    required?: boolean;
}) => {
    const { colors } = useTailwindVars();
    const imageUrl = item?.highlightFrames?.[0]?.url || item?.root?.url || item?.coverUrl || item?.images?.[0] || item?.medias?.[0]?.url;

    return (
        <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2 px-1">
                <View className="flex-row items-center gap-1">
                    {required && <Text className="text-red-500 font-bold">*</Text>}
                    <Text className="text-sm font-bold opacity-60" style={{ color: colors.grey0 }}>{title}</Text>
                </View>
                {item && (
                    <TouchableOpacity onPress={onPress}>
                        <Text className="text-xs font-bold" style={{ color: colors.primary }}>更换</Text>
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onPress}
                className="w-full aspect-[2.5/1] bg-white rounded-2xl overflow-hidden border border-dashed relative shadow-sm"
                style={{
                    backgroundColor: item ? colors.plain : colors.background2, // Use plain for selected, background2 for empty
                    borderColor: item ? 'transparent' : colors.divider,
                }}
            >
                {item ? (
                    <View className="flex-1 flex-row">
                        {/* Image */}
                        <View className="h-full aspect-[3/4] bg-background2">
                            {imageUrl ? (
                                <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />
                            ) : (
                                <View className="w-full h-full items-center justify-center">
                                    <Feather name="image" size={24} color={colors.grey2} />
                                </View>
                            )}
                        </View>
                        {/* Info */}
                        <View className="flex-1 p-4 justify-center gap-2">
                            <Text
                                numberOfLines={2}
                                className="text-sm font-bold leading-5"
                                style={{ color: colors.grey0 }}
                            >
                                {item.title || item.description || item.name || "未命名"}
                            </Text>
                            {item.brand && (
                                <Text className="text-xs opacity-60 font-bold tracking-wider" style={{ color: colors.grey1 }}>
                                    {item.brand}
                                </Text>
                            )}
                            <View className="flex-row items-center gap-1 mt-1">
                                <Feather name="check-circle" size={12} color={colors.primary} />
                                <Text className="text-xs" style={{ color: colors.primary }}>已选择</Text>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View className="flex-1 items-center justify-center gap-3 opacity-60">
                        <View className="w-12 h-12 rounded-full items-center justify-center bg-white shadow-sm">
                            <Feather name={icon} size={20} color={colors.grey1} />
                        </View>
                        <Text className="text-sm font-medium" style={{ color: colors.grey1 }}>{placeholder}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
};

const SegmentReplication = () => {
    const { colors } = useTailwindVars();
    const { commodityId, inspirationId } = useLocalSearchParams<{ commodityId: string; inspirationId: string }>();

    const [selectedCommodity, setSelectedCommodity] = useState<any>(null);
    const [selectedInspiration, setSelectedInspiration] = useState<any>(null);

    const [isCommoditySelectorVisible, setCommoditySelectorVisible] = useState(false);
    const [isInspirationSelectorVisible, setInspirationSelectorVisible] = useState(false);

    const [isCreating, setIsCreating] = useState(false);

    // Fetch Commodity Details if ID is present
    useQuery({
        queryKey: ["commodity", commodityId],
        queryFn: async () => {
            if (!commodityId) return null;
            const res = await getCommodity(commodityId);
            if (res?.data?.data) {
                setSelectedCommodity(res.data.data);
            }
            return res?.data?.data;
        },
        enabled: !!commodityId && !selectedCommodity,
    });

    // Fetch Inspiration Details if ID is present
    useQuery({
        queryKey: ["inspiration-segment", inspirationId],
        queryFn: async () => {
            if (!inspirationId) return null;
            const res = await getTemplateSegment({ id: inspirationId });
            if (res?.data?.data) {
                setSelectedInspiration(res.data.data);
            }
            return res?.data?.data;
        },
        enabled: !!inspirationId && !selectedInspiration,
    });

    // Manual Fetch for selection
    const fetchCommodityDetail = async (id: string) => {
        const res = await getCommodity(id);
        if (res?.data?.data) setSelectedCommodity(res.data.data);
    };

    const fetchInspirationDetail = async (id: string) => {
        const res = await getTemplateSegment({ id });
        if (res?.data?.data) setSelectedInspiration(res.data.data);
    };


    const handleCreate = async () => {
        if (!selectedCommodity?._id || !selectedInspiration?._id) {
            Toast.show("请先选择商品和灵感");
            return;
        }

        setIsCreating(true);
        try {
            const payload: any = {
                commodityId: selectedCommodity._id,
                segmentId: selectedInspiration._id, // Assuming backend accepts segmentId or inspirationId
                // inspirationId: selectedInspiration._id, // Add this if backend needs exact name
            };

            const session = await createAssetV2(payload);
            if (session?.data?.data?._id) {
                // router.replace(`/session/${session.data.data._id}`);
            } else {
                Toast.show("创建会话失败");
            }
        } catch (error) {
            console.error(error);
            Toast.show("创建会话失败，请重试");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <ScreenContainer
            stackScreenProps={{
                animation: "fade",
                animationDuration: 1,
            }} >
            {/* Header */}
            <ScreenHeader title="复刻灵感" />

            {/* Content */}
            <View className="flex-1 px-5 pt-4">
                <Text className="text-sm opacity-60 mb-6 leading-5" style={{ color: colors.grey1 }}>
                    选择一个灵感视频片段，我们将为您复刻其运镜和风格，应用到您的商品上。
                </Text>

                <SelectorCard
                    title="复刻灵感"
                    placeholder="点击选择灵感视频"
                    icon="film"
                    required
                    item={selectedInspiration}
                    onPress={() => setInspirationSelectorVisible(true)}
                />

                <View className="h-[20px]" />

                <SelectorCard
                    title="目标商品"
                    placeholder="点击选择推广商品"
                    icon="shopping-bag"
                    required
                    item={selectedCommodity}
                    onPress={() => setCommoditySelectorVisible(true)}
                />
            </View>

            {/* Footer Action */}
            <View className="px-5 pb-8 pt-4 bg-background" style={{ paddingBottom: 40 }}>
                <Text style={{ fontSize: 12, color: colors.grey2, textAlign: "center", marginBottom: 16 }}>
                    视频每秒消耗1积分, 实际消耗与最终输出的视频时长相关
                </Text>
                <TouchableOpacity
                    onPress={handleCreate}
                    disabled={isCreating}
                    activeOpacity={0.8}
                    className={`w-full py-4 rounded-xl items-center flex-row justify-center gap-2 ${(!selectedCommodity || !selectedInspiration) ? 'opacity-50' : ''
                        }`}
                    style={{ backgroundColor: colors.primary }}
                >
                    {isCreating ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="movie-open-star-outline" size={20} color="white" />
                            <Text className="text-white font-bold text-lg">开始复刻制作</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Drawers */}
            <CommoditySelectorModal
                visible={isCommoditySelectorVisible}
                onClose={() => setCommoditySelectorVisible(false)}
                onSelect={(id: string) => fetchCommodityDetail(id)}
            />

            <InspirationSelectorModal
                visible={isInspirationSelectorVisible}
                onClose={() => setInspirationSelectorVisible(false)}
                onSelect={(id) => fetchInspirationDetail(id)}
            />

        </ScreenContainer>
    );
};

export default SegmentReplication;
