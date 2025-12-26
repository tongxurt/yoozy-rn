import { listAssets } from "@/api/asset";
import { CustomRefreshControl } from "@/components/CustomRefreshControl";
import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { BlurView } from 'expo-blur';
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
    ActivityIndicator,
    Image,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

const containerPadding = 16;

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

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const coverUrl = item.coverUrl || item.commodity?.media?.[0]?.url;
        // Logic: If workflow exists and status is NOT completed, it is creating.
        const isCreating = item?.workflow?.status !== 'completed';

        return (
            <Animated.View
                entering={FadeInDown.delay(index % 10 * 100).springify()}
                layout={Layout.springify()}
            >
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => router.push(`/asset/${item._id}`)}
                    className="flex-col gap-3"
                >
                    <View className="flex-row items-center gap-2">
                        <Text className="text-sm font-medium" style={{ color: colors.grey0 }}>{item.commodity?.brand}</Text>
                    </View>
                    {/* Left: Image / Thumbnail */}
                    <View className="w-[130px] aspect-[3/4] rounded-xl overflow-hidden bg-gray-200 relative">
                        {coverUrl ? (
                            <Image
                                source={{ uri: coverUrl }}
                                className={`absolute inset-0 w-full h-full`}
                                resizeMode="cover"
                            />
                        ) : (
                            <View className="flex-1 items-center justify-center">
                                <Feather name="image" size={24} color="#6B7280" />
                            </View>
                        )}

                        {/* Status Overlay: Video Generating */}
                        {isCreating && (
                            <View className="absolute inset-0 items-center justify-center z-10">
                                <BlurView intensity={50} tint="dark" className="absolute inset-0" />
                                <View className="items-center gap-1.5 px-3">
                                    <ActivityIndicator size="small" color="orange" style={{ transform: [{ scale: 0.8 }] }} />
                                    <Text className="text-[orange] text-[10px] font-medium text-center">
                                        视频生成中
                                    </Text>
                                </View>
                            </View>
                        )}

                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <Animated.FlatList
            data={flatData}
            renderItem={renderItem}
            keyExtractor={(item: any) => item._id}
            contentContainerStyle={{
                padding: containerPadding,
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
            // Use itemLayoutAnimation for smooth reordering if needed
            itemLayoutAnimation={Layout.springify()}
            ListEmptyComponent={
                !isLoading ? (
                    <View className="items-center justify-center py-32 opacity-60">
                        <View className="bg-gray-100 p-6 rounded-full mb-4">
                            <Feather name="image" size={32} color={colors.grey3} />
                        </View>
                        <Text className="text-sm font-medium" style={{ color: colors.grey2 }}>No Assets Found</Text>
                        <Text className="text-xs mt-2" style={{ color: colors.grey3 }}>Create your first asset to get started</Text>
                    </View>
                ) : null
            }
            ListFooterComponent={
                isFetchingNextPage ? (
                    <View className="py-6 items-center">
                        <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                ) : <View className="h-8" />
            }
        />
    );
};

export default AssetList;
