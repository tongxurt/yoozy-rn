import {
  Dimensions,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import useTailwindVars from "@/hooks/useTailwindVars";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { listResourceSegments, listItems } from "@/api/resource";
import { Feather } from "@expo/vector-icons";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";

const { width: screenWidth } = Dimensions.get("window");
const numColumns = 2;
const itemMargin = 8;
const columnWidth =
  (screenWidth - 20 - itemMargin * (numColumns - 1)) / numColumns;

type TabType = "video" | "inspiration";
const tabList: { id: number; name: string; value: TabType }[] = [
  {
    id:0,
    name: "视频库",
    value: "video"
  },
  {
    id:1,
    name: "灵感库",
    value: "inspiration"
  }
]
export default function HomeScreen() {
  const { colors } = useTailwindVars();
  const [searchQuery, setSearchQuery] = useState("");
  // activeTab: 'video' | 'inspiration'
  const [activeTab, setActiveTab] = useState<TabType>(tabList[0].value);

  const {
    data,
    isLoading,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    refetch,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["items", activeTab, searchQuery],
    queryFn: ({ pageParam }) => {
      const params = { page: pageParam || 1, keyword: searchQuery };
      return activeTab === "video"
        ? listItems(params)
        : listResourceSegments(params);
    },
    getNextPageParam: (lastPage) => {
      const { size, total, page } = lastPage?.data?.data;
      return size * page < total ? lastPage?.data?.data?.page + 1 : undefined;
    },
    staleTime: 1000,
    // enabled: false,
    refetchOnWindowFocus: false,
  });

  // useFocusEffect(useCallback(() => {
  //     void refetch();
  // }, [refetch]));

  const flatData = useMemo(() => {
    return data?.pages.flatMap((page) => page?.data?.data?.list || []) || [];
  }, [data]);

  // 渲染骨架屏项
  const renderSkeletonItem = (index: number) => {
    return (
      <View
        key={`skeleton-${index}`}
        style={{
          width: columnWidth,
          marginBottom: 15,
        }}
        className="bg-background rounded-lg overflow-hidden"
      >
        {/* 图片骨架 - 9:12 比例 */}
        <SkeletonLoader
          width="100%"
          height={columnWidth * (12 / 9)}
          style={{ aspectRatio: 9 / 12 }}
        />
        
        {/* 文字骨架 */}
        <View className="py-2 px-2 gap-1.5">
          <SkeletonLoader width="90%" height={14} />
          <SkeletonLoader width="70%" height={14} />
        </View>
      </View>
    );
  };

  // 渲染列表项
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() =>
          router.push(
            activeTab === "inspiration"
              ? `/detail/inspiration/${item._id}`
              : `/detail/video/${item._id}`
          )
        }
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

        <Text className="text-sm text-white leading-6 py-2 px-2" numberOfLines={2}>
          {item?.description || item?.commodity?.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1">
      <View className="px-3 py-4 backdrop-blur-sm">
        <View className="gap-2 flex-row items-center bg-background rounded-xl px-4 py-3">
          <Feather name="search" size={14} color={colors.white} />

          <TextInput
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
            }}
            placeholder="发现精彩内容..."
            placeholderTextColor="#666"
            className="flex-1 text-white"
            style={{
              fontSize: 16,
              fontWeight: "400",
            }}
            returnKeyType="search"
            onSubmitEditing={() => {
              void refetch();
            }}
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                void refetch();
              }}
              className="ml-3"
            >
              <View className="w-6 h-6 rounded-full bg-white/10 items-center justify-center">
                <Text className="text-white/60 text-xs">✕</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* <Text className={"text-white"}>
        {themeMode} {isRefetching ? "true" : "false"}
      </Text> */}
      <View className="flex-row items-center px-4 pb-3 pt-1">
        {
          tabList.map((item) => {
            return (
              <TouchableOpacity
                onPress={() => {
                  if (activeTab !== item.value) {
                    setActiveTab(item.value);
                  }
                }}
                className="mr-8"
                activeOpacity={0.6}
                key={item.id}
              >
                <View className="items-center">
                  <Text
                    className={`mb-1.5 ${
                      activeTab === item.value
                        ? "text-primary font-bold text-lg"
                        : "text-white/70 font-medium text-lg"
                    }`}
                  >
                    {item.name}
                  </Text>
                  {activeTab === item.value ? (
                    <View
                      className="w-6 h-1 bg-primary rounded"
                    />
                  ) : (
                    <View
                      className="w-6 h-1 bg-primary/0 rounded"
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        }
      </View>

      {/* 骨架屏 - 初次加载时显示 */}
      {isLoading && !data ? (
        <View style={{ padding: 10 }}>
          <View className="flex-row flex-wrap justify-between">
            {Array.from({ length: 8 }).map((_, index) => renderSkeletonItem(index))}
          </View>
        </View>
      ) : (
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
          // refreshControl={
          //     <RefreshControl
          //         refreshing={isRefetching}
          //         onRefresh={refetch}
          //         colors={[colors?.primary || '#ff0000']}
          //         tintColor={colors?.primary || '#ff0000'}
          //     />
          // }
          onEndReached={() => {
            console.log("hasNextPage", hasNextPage, isFetchingNextPage);

            if (hasNextPage && !isFetchingNextPage) {
              void fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          // ListFooterComponent={renderFooter}
          // ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          // 性能优化
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      )}
    </View>
  );
}
