import { listResourceSegments } from "@/api/resource";
import { CustomRefreshControl } from "@/components/CustomRefreshControl";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");
const numColumns = 2;
const itemMargin = 8;
const columnWidth =
    (screenWidth - 20 - itemMargin * (numColumns - 1)) / numColumns;

export default function InspirationList() {
    const { colors } = useTailwindVars();
    const [searchQuery, setSearchQuery] = useState("");
    const [finalSearchQuery, setFinalSearchQuery] = useState("");

    const handleSearchSubmit = () => {
        setFinalSearchQuery(searchQuery);
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setFinalSearchQuery("");
    };

    const {
        data,
        isLoading,
        isRefetching,
        isFetchingNextPage,
        hasNextPage,
        refetch,
        fetchNextPage,
    } = useInfiniteQuery({
        queryKey: ["items", "inspiration", finalSearchQuery],
        queryFn: ({ pageParam }) => {
            const params = { page: pageParam || 1, keyword: finalSearchQuery };
            return listResourceSegments(params);
        },
        getNextPageParam: (lastPage) => {
            const { size, total, page } = lastPage?.data?.data;
            return size * page < total ? lastPage?.data?.data?.page + 1 : undefined;
        },
        staleTime: 1000,
        refetchOnWindowFocus: false,
    });

    const flatData = useMemo(() => {
        return data?.pages.flatMap((page) => page?.data?.data?.list || []) || [];
    }, [data]);

    const renderSkeletonItem = (index: number) => {
        return (
            <View
                key={`skeleton-${index}`}
                style={{
                    width: columnWidth,
                    marginBottom: 15,
                }}
                className="bg-background0 rounded-lg overflow-hidden"
            >
                <SkeletonLoader
                    width="100%"
                    height={columnWidth * (12 / 9)}
                    style={{ aspectRatio: 9 / 12 }}
                />
                <View className="py-2 px-2 gap-1.5">
                    <SkeletonLoader width="90%" height={14} />
                    <SkeletonLoader width="70%" height={14} />
                </View>
            </View>
        );
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        return (
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => router.push(`/inspiration/${item._id}`)}
                style={{
                    width: columnWidth,
                }}
                className="bg-background rounded-lg overflow-hidden self-start"
            >
                <Image
                    source={{ uri: item.highlightFrames?.[0]?.url || item.coverUrl }}
                    className="aspect-[9/12]"
                    resizeMode="cover"
                />
                <Text
                    className="text-sm text-white leading-6 py-2 px-2"
                    numberOfLines={2}
                >
                    {item?.description || item?.commodity?.name}
                </Text>
            </TouchableOpacity>
        );
    };

    // Search Header Component to pass to ListHeaderComponent (optional) or just render above
    const renderHeader = () => (
        <View className="px-3 py-4 backdrop-blur-sm">
            <View className="gap-2 flex-row items-center bg-background rounded-xl px-4 py-3">
                <Feather name="search" size={14} color={colors.white} />
                <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="发现精彩内容..."
                    placeholderTextColor="#666"
                    className="flex-1 text-white"
                    style={{ fontSize: 16, fontWeight: "400" }}
                    returnKeyType="search"
                    onSubmitEditing={handleSearchSubmit}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={handleClearSearch} className="ml-3">
                        <View className="w-6 h-6 rounded-full bg-white/10 items-center justify-center">
                            <Text className="text-white/60 text-xs">✕</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    if (isLoading && !data) {
        return (
            <View className="flex-1">
                {renderHeader()}
                <View style={{ padding: 10 }}>
                    <View className="flex-row flex-wrap justify-between">
                        {Array.from({ length: 8 }).map((_, index) =>
                            renderSkeletonItem(index)
                        )}
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1">
            {renderHeader()}
            <FlatList
                data={flatData}
                numColumns={numColumns}
                contentContainerStyle={{
                    padding: 10,
                }}
                ItemSeparatorComponent={() => <View className={"h-[15px]"} />}
                columnWrapperStyle={
                    numColumns > 1 ? { justifyContent: "space-between" } : undefined
                }
                renderItem={renderItem}
                keyExtractor={(item, index) => `item-${item.id}-${index}`}
                refreshing={isRefetching}
                onRefresh={() => {
                    void refetch();
                }}
                onEndReached={() => {
                    if (hasNextPage && !isFetchingNextPage) {
                        void fetchNextPage();
                    }
                }}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={10}
                refreshControl={
                    <CustomRefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
                }
            />
        </View>
    );
}
