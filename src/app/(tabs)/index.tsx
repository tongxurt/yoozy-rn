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
import { useThemeMode } from "@/hooks/useThemeMode";

const { width: screenWidth } = Dimensions.get("window");
const numColumns = 2;
const itemMargin = 8;
const columnWidth =
  (screenWidth - 20 - itemMargin * (numColumns - 1)) / numColumns;

export default function HomeScreen() {
  const { colors } = useTailwindVars();
  const [searchQuery, setSearchQuery] = useState("");
  // activeTab: 'video' | 'inspiration'
  const [activeTab, setActiveTab] = useState<"video" | "inspiration">("video");

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

  // 渲染列表项
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          router.push(
            activeTab === "inspiration"
              ? `/detail/inspiration/${item._id}`
              : `/detail/video/${item._id}`
          )
        }
        style={{
          width: columnWidth,
          // marginRight: isLeftColumn ? itemMargin : 0,
          // marginBottom: itemMargin,
        }}
        className="bg-background2 gap-1"
      >
        <Image
          source={{ uri: item.highlightFrames?.[0]?.url || item.coverUrl }}
          className="aspect-[9/12] rounded-lg"
          resizeMode="cover"
        />

        <Text className="text-sm text-white leading-6" numberOfLines={2}>
          {item.description || item.commodity.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const { themeMode } = useThemeMode();

  return (
    <View className="flex-1 bg-background">
      <View className="px-3 py-4 bg-background/95 backdrop-blur-sm">
        <View className="gap-2 flex-row items-center bg-background2 rounded-xl px-4 py-3">
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

      <Text className={"text-white"}>
        {themeMode} {isRefetching ? "true" : "false"}
      </Text>
      <View className="flex-row gap-2 px-3 py-2">
        <TouchableOpacity
          onPress={() => {
            if (activeTab !== "inspiration") {
              setActiveTab("inspiration");
            }
          }}
          activeOpacity={0.7}
        >
          <View
            className="px-3 py-1 rounded-full"
            style={{
              backgroundColor:
                activeTab === "inspiration" ? colors.primary : "transparent",
              borderWidth: 1,
              borderColor:
                activeTab === "inspiration" ? colors.primary : "#333333",
            }}
          >
            <Text
              style={{
                color: activeTab === "inspiration" ? "#000" : "#FFFFFF",
                fontWeight:
                  activeTab === "inspiration"
                    ? ("700" as const)
                    : ("500" as const),
              }}
            >
              灵感库
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            if (activeTab !== "video") {
              setActiveTab("video");
            }
          }}
          activeOpacity={0.7}
        >
          <View
            className="px-3 py-1 rounded-full"
            style={{
              backgroundColor:
                activeTab === "video" ? colors.primary : "transparent",
              borderWidth: 1,
              borderColor: activeTab === "video" ? colors.primary : "#333333",
            }}
          >
            <Text
              style={{
                color: activeTab === "video" ? "#000" : "#FFFFFF",
                fontWeight:
                  activeTab === "video" ? ("700" as const) : ("500" as const),
              }}
            >
              视频库
            </Text>
          </View>
        </TouchableOpacity>
      </View>
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
    </View>
  );
}
