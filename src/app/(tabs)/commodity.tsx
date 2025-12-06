import { commodities } from "@/api/commodity";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Entypo, Feather } from "@expo/vector-icons";
import useTailwindVars from "@/hooks/useTailwindVars";
import { router } from "expo-router";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";

const { width: screenWidth } = Dimensions.get("window");
const cardMargin = 12;
const cardWidth = (screenWidth - cardMargin * 3) / 2;

export default function CommodityScreen() {
  const { colors } = useTailwindVars();

  const {
    data,
    isLoading,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    refetch,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["commodity"],
    queryFn: ({ pageParam }) => {
      const params = { page: pageParam };
      return commodities(params);
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage?.data?.data?.hasMore
        ? lastPage?.data?.data?.page + 1
        : undefined,
    staleTime: 1000,
    refetchOnWindowFocus: false,
  });

  const flatData = useMemo(() => {
    return data?.pages.flatMap((page) => page?.data?.data?.list || []) || [];
  }, [data]);

  // 渲染骨架屏项
  const renderSkeletonItem = (index: number) => {
    const isLeftColumn = index % 2 === 0;

    return (
      <View
        key={`skeleton-${index}`}
        style={{
          width: cardWidth,
          marginLeft: isLeftColumn ? cardMargin : cardMargin / 2,
          marginRight: isLeftColumn ? cardMargin / 2 : cardMargin,
          marginBottom: cardMargin,
        }}
      >
        <View className="bg-background rounded-lg overflow-hidden">
          {/* 图片骨架 */}
          <SkeletonLoader
            width="100%"
            height={cardWidth}
            style={{ aspectRatio: 1 }}
          />

          {/* 内容区域骨架 */}
          <View className="p-3 gap-2">
            <SkeletonLoader width="80%" height={16} />
            <SkeletonLoader width="60%" height={16} />
          </View>
        </View>
      </View>
    );
  };

  // 渲染商品列表项 - 网格布局
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const firstImage = item.images?.[0] || item.medias?.[0]?.url;
    const isLeftColumn = index % 2 === 0;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          router.push(`/detail/commodity/${item._id}`);
        }}
        style={{
          width: cardWidth,
          marginLeft: isLeftColumn ? cardMargin : cardMargin / 2,
          marginRight: isLeftColumn ? cardMargin / 2 : cardMargin,
          marginBottom: cardMargin,
        }}
      >
        <View className="bg-background rounded-lg overflow-hidden">
          {/* 图片容器 */}
          <View className="relative">
            {firstImage ? (
              <Image
                source={{ uri: firstImage }}
                style={{
                  width: "100%",
                  aspectRatio: 1,
                }}
                resizeMode="contain"
              />
            ) : (
              <View
                className="bg-background/30"
                style={{
                  width: "100%",
                  aspectRatio: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Feather name="image" size={40} color={colors.grey3} />
              </View>
            )}
            {/* 品牌标签 */}
            {!!item.brand && (
              <View className="absolute top-2 left-2">
                <View
                  className="bg-primary/90 rounded-full px-3 py-1"
                  style={{ maxWidth: cardWidth * 0.7 }}
                >
                  <Text
                    className="text-plain text-xs font-semibold"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.brand}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* 内容区域 */}
          <View className="p-3 gap-2">
            <Text
              className="text-white font-semibold text-sm leading-5"
              numberOfLines={2}
            >
              {item.title || item.name}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleCreate = () => {
    router.navigate(`/session/createProduct`);
  };

  // 商品列表
  return (
    <View className="flex-1">
      {/* 顶部标题栏 */}
      <View className="px-4 py-4 backdrop-blur-sm border-b border-white/5">
        <View className="flex-row items-center justify-between">
          <View className="flex gap-2">
            <Text className="text-white text-xl font-bold">商品列表</Text>
            <Text className="text-white/50 text-xs mt-0.5">发现精选好物</Text>
          </View>
          <TouchableOpacity onPress={handleCreate} activeOpacity={1}>
            <Entypo name="plus" size={30} color={colors.primary} />
          </TouchableOpacity>
          {/* {flatData.length > 0 && (
            <View className="bg-primary/20 rounded-full px-3 py-1">
              <Text className="text-primary text-xs font-medium">
                {flatData.length} 件
              </Text>
            </View>
          )} */}
        </View>
      </View>

      {/* 骨架屏 - 初次加载时显示 */}
      {isLoading && !data ? (
        <View
          style={{
            paddingTop: cardMargin,
            paddingBottom: cardMargin * 2,
          }}
        >
          <View className="flex-row flex-wrap">
            {Array.from({ length: 8 }).map((_, index) =>
              renderSkeletonItem(index)
            )}
          </View>
        </View>
      ) : (
        <FlatList
          data={flatData}
          renderItem={renderItem}
          keyExtractor={(item, index) => `commodity-${item._id}-${index}`}
          numColumns={2}
          contentContainerStyle={{
            paddingTop: cardMargin,
            paddingBottom: cardMargin * 2,
          }}
          columnWrapperStyle={{
            justifyContent: "space-between",
          }}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              void fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-32">
              <View className="bg-background2 rounded-full p-6 mb-4">
                <Feather name="package" size={48} color={colors.grey3} />
              </View>
              <Text className="text-white/60 text-base mb-1">暂无商品数据</Text>
              <Text className="text-white/40 text-xs">
                下拉刷新获取最新商品
              </Text>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4 items-center">
                <Text className="text-white/40 text-xs">加载更多...</Text>
              </View>
            ) : null
          }
        />
      )}

      {/* <View className="absolute bottom-10 right-4 items-center justify-center">
        <View
          className="w-20 h-20 rounded-full bg-plain/80 blur-xl justify-center items-center"
          style={{
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
            elevation: 8,
          }}
        >
          <TouchableOpacity onPress={handleCreate} activeOpacity={1}>
            <Entypo name="plus" size={36} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View> */}
    </View>
  );
}
