import { listAssets } from "@/api/asset";
import { CustomRefreshControl } from "@/components/CustomRefreshControl";
import { assetWorkflowJobConfig } from "@/consts";
import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");
const columnCount = 2;
const cardGap = 12;
const containerPadding = 16;
// Calculate precise card width to fit 2 columns with padding and gap
const cardWidth = (screenWidth - (containerPadding * 2) - (cardGap * (columnCount - 1))) / columnCount;

const AssetList = () => {
    const { colors } = useTailwindVars();

    const {
        data,
        isLoading,
        isRefetching,
        hasNextPage,
        refetch,
        fetchNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ["assets"],
        queryFn: ({ pageParam = 1 }) => listAssets({ page: pageParam }),
        getNextPageParam: (lastPage: any) => {
            const { size, total, page } = lastPage?.data?.data || {};
            return size * page < total ? page + 1 : undefined;
        },
    });

    const flatData = useMemo(() => {
        return data?.pages?.flatMap((page: any) => page?.data?.data?.list || []) || [];
    }, [data]);

    const getStatusText = (status: string) => {
        switch (status) {
            case "completed": return "已完成";
            case "running": return "生成中";
            case "failed": return "失败";
            case "created": return "排队中";
            default: return status;
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const coverUrl = item.coverUrl || item.commodity?.media?.[0]?.url;

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push(`/asset/${item._id}`)}
                style={{
                    width: cardWidth,
                    aspectRatio: 3 / 4,
                    marginBottom: cardGap,
                }}
                className="bg-white rounded-xl overflow-hidden shadow-sm relative border border-gray-100"
            >
                <Image
                    source={{ uri: coverUrl }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                    className="bg-gray-100"
                />

                {/* Overlay */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)']}
                    locations={[0, 0.4, 0.9]}
                    style={{ zIndex: 10 }}
                    className="absolute bottom-0 left-0 right-0 p-3 pt-16 justify-end"
                >

                    {/* Ant Design Style Steps (Vertical) */}
                    {item.workflow?.jobs && (
                        <View className="mb-2">
                            {Object.keys(assetWorkflowJobConfig).map((key, index, arr) => {
                                const job = item.workflow.jobs.find((j: any) => j.name === key);
                                const status = job?.status || 'waiting';
                                const isLast = index === arr.length - 1;
                                const config = assetWorkflowJobConfig[key];

                                let dotClass = 'bg-white/30';
                                let borderClass = '';
                                let labelColor = 'text-white/40';

                                switch (status) {
                                    case 'completed':
                                        dotClass = 'bg-green-500';
                                        labelColor = 'text-green-500';
                                        break;
                                    case 'running':
                                        dotClass = 'bg-blue-500';
                                        borderClass = 'border-2 border-blue-900/30';
                                        labelColor = 'text-blue-500';
                                        break;
                                    case 'confirming':
                                        dotClass = 'bg-yellow-500';
                                        labelColor = 'text-yellow-500';
                                        break;
                                    case 'failed':
                                        dotClass = 'bg-red-500';
                                        labelColor = 'text-red-500';
                                        break;
                                    default:
                                        dotClass = 'bg-white/30';
                                        labelColor = 'text-white/40';
                                }

                                const data = item.workflow?.dataBus?.[config.dataKey];
                                const count = Array.isArray(data) ? data.length : 0;

                                return (
                                    <View key={key} className="flex-row items-center h-5">
                                        {/* Timeline Column */}
                                        <View className="items-center h-full w-3 pt-1">
                                            <View className={`w-1.5 h-1.5 rounded-full z-10 ${dotClass} ${borderClass}`} />
                                            {!isLast && (
                                                <View className={`w-[1px] flex-1 my-0.5 ${status === 'completed' ? 'bg-green-500/50' : 'bg-white/20'}`} />
                                            )}
                                        </View>

                                        {/* Content Column */}
                                        <View className="ml-1.5">
                                            <Text className={`text-[9px] font-medium leading-4 ${labelColor}`}>
                                                {config.label} {count > 0 ? `(${count})` : ''}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    <View className="flex-row items-center justify-between border-t border-white/10 pt-2 mt-1">
                        {/* Status Text */}
                        <View className="flex-1 mr-2">
                            {(() => {
                                if (!item.workflow?.jobs) {
                                    return (
                                        <Text className="text-white font-bold text-[11px]">
                                            {getStatusText(item.status)}
                                        </Text>
                                    );
                                }

                                const steps = Object.keys(assetWorkflowJobConfig);
                                const jobs = item.workflow.jobs;

                                let activeStepKey = steps.find(key => {
                                    const job = jobs.find((j: any) => j.name === key);
                                    return job?.status === 'failed';
                                });

                                let currentStatus = 'failed';

                                if (!activeStepKey) {
                                    activeStepKey = steps.find(key => {
                                        const job = jobs.find((j: any) => j.name === key);
                                        return job?.status !== 'completed';
                                    });

                                    if (activeStepKey) {
                                        const job = jobs.find((j: any) => j.name === activeStepKey);
                                        currentStatus = job?.status || 'waiting';
                                    } else {
                                        activeStepKey = steps[steps.length - 1];
                                        currentStatus = 'completed';
                                    }
                                }

                                if (!activeStepKey) return null;

                                const config = assetWorkflowJobConfig[activeStepKey];
                                if (!config) return null;
                                const statusConfig = config.status[currentStatus];

                                let displayText = statusConfig?.name || config.label;
                                if (currentStatus === 'failed') displayText = `${config.label}失败`;

                                return (
                                    <Text className="text-white font-bold text-[11px]" numberOfLines={1}>
                                        {displayText}
                                    </Text>
                                );
                            })()}
                        </View>

                        {/* Date */}
                        <Text className="text-white/50 text-[10px]">
                            {new Date(item.createdAt * 1000).toLocaleDateString()}
                        </Text>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    return (
        <FlatList
            data={flatData}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            numColumns={columnCount}
            contentContainerStyle={{
                padding: containerPadding,
                // paddingBottom: 50,
            }}
            columnWrapperStyle={{
                justifyContent: "space-between",
            }}
            refreshControl={
                <CustomRefreshControl
                    refreshing={isRefetching}
                    onRefresh={() => void refetch()}
                />
            }
            onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                    void fetchNextPage();
                }
            }}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
                !isLoading ? (
                    <View className="items-center justify-center py-32 opacity-60">
                        <View className="bg-gray-100 p-4 rounded-full mb-4">
                            <Feather name="inbox" size={32} color={colors.grey2} />
                        </View>
                        <Text className="text-sm font-medium" style={{ color: colors.grey2 }}>暂无资产</Text>
                        <Text className="text-xs mt-1" style={{ color: colors.grey3 }}>快去创建一个吧</Text>
                    </View>
                ) : null
            }
            ListFooterComponent={
                isFetchingNextPage ? (
                    <View className="py-6 items-center">
                        <ActivityIndicator size="small" />
                    </View>
                ) : <View className="h-8" />
            }
        />

    );
};

export default AssetList;
