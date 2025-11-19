import { commodities } from "@/api/commodity";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import ExpandableText from "@/components/ui/ExpandableText";
import Carousel from "@/components/ui/Carousel";
import {
  AntDesign,
  Entypo,
  Feather,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import useTailwindVars from "@/hooks/useTailwindVars";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");
const cardMargin = 12;
const cardWidth = (screenWidth - cardMargin * 3) / 2;

export default function CommodityScreen() {
  const [selectedItem, setSelectedItem] = useState<any>(null);
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

  // 渲染商品列表项 - 网格布局
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const firstImage = item.images?.[0] || item.medias?.[0]?.url;
    const imageCount = item.images?.length || 0;
    const isLeftColumn = index % 2 === 0;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setSelectedItem(item)}
        style={{
          width: cardWidth,
          marginLeft: isLeftColumn ? cardMargin : cardMargin / 2,
          marginRight: isLeftColumn ? cardMargin / 2 : cardMargin,
          marginBottom: cardMargin,
        }}
      >
        <View
          className="bg-background2 rounded-2xl overflow-hidden"
          style={{
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
              },
              android: {
                elevation: 4,
              },
            }),
          }}
        >
          {/* 图片容器 */}
          <View className="relative">
            {firstImage ? (
              <Image
                source={{ uri: firstImage }}
                style={{
                  width: "100%",
                  aspectRatio: 1,
                }}
                resizeMode="cover"
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
            {/* 图片数量指示器 */}
            {imageCount > 1 && (
              <View
                className="absolute top-2 right-2 bg-black/60 rounded-full px-2 py-1"
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Feather name="image" size={12} color="#fff" />
                <Text className="text-white text-xs font-medium">
                  {imageCount}
                </Text>
              </View>
            )}
            {/* 品牌标签 */}
            {!!item.brand && (
              <View className="absolute top-2 left-2">
                <View className="bg-primary/90 rounded-full px-3 py-1">
                  <Text className="text-black text-xs font-semibold">
                    {item.brand}
                  </Text>
                </View>
              </View>
            )}
            {/* 底部渐变遮罩 */}
            <LinearGradient
              colors={["rgba(0,0,0,0.6)", "transparent"]}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
              className="absolute bottom-0 left-0 right-0"
              style={{ height: 60 }}
            />
          </View>

          {/* 内容区域 */}
          <View className="p-3 gap-2">
            <Text
              className="text-white font-semibold text-sm leading-5"
              numberOfLines={2}
            >
              {item.title || item.name}
            </Text>
            {!!item.description && (
              <Text
                className="text-white/70 text-xs leading-4"
                numberOfLines={2}
              >
                {item.description}
              </Text>
            )}
            {/* 标签 */}
            {!!item.tags?.length && (
              <View className="flex-row flex-wrap gap-1.5 mt-1">
                {item.tags
                  .slice(0, 3)
                  .filter((tag: any) => typeof tag === "string")
                  .map((tag: string, i: number) => (
                    <View
                      key={`${tag}-${i}`}
                      className="px-2 py-0.5 rounded-md bg-white/10"
                    >
                      <Text className="text-white/80 text-[10px]">{tag}</Text>
                    </View>
                  ))}
                {item.tags.length > 3 && (
                  <View className="px-2 py-0.5 rounded-md bg-white/10">
                    <Text className="text-white/80 text-[10px]">
                      +{item.tags.length - 3}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // 商品详情弹窗
  if (selectedItem) {
    return (
      <View className="flex-1 bg-background">
        {/* 顶部导航栏 */}
        <View className="bg-background/95 backdrop-blur-sm border-b border-white/5">
          <View className="flex-row items-center justify-between px-4 py-3">
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={() => setSelectedItem(null)}
                className="w-8 h-8 items-center justify-center rounded-full bg-white/10"
                activeOpacity={0.7}
              >
                <Feather name="arrow-left" size={20} color={colors.white} />
              </TouchableOpacity>
              <Text className="text-white text-lg font-bold">商品详情</Text>
            </View>
            <MaterialIcons name="delete" size={24} color="black" />
          </View>
        </View>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* 图片轮播 */}
          {!!selectedItem.images?.length && (
            <Carousel
              data={selectedItem.images}
              renderItem={(url: string) => (
                <Image
                  source={{ uri: url }}
                  style={{
                    width: screenWidth,
                    height: screenWidth,
                  }}
                  resizeMode="contain"
                />
              )}
              itemWidth={screenWidth}
              itemHeight={screenWidth}
              showDots={selectedItem.images.length > 1}
            />
          )}

          <View className="px-4 py-5 gap-5">
            {/* 标题区域 */}
            <View className="gap-2">
              <Text className="text-white text-2xl font-bold leading-7">
                {selectedItem.title || selectedItem.name}
              </Text>
              {!!selectedItem.brand && (
                <View className="flex-row items-center gap-2">
                  <View className="h-4 w-0.5 bg-primary" />
                  <Text className="text-white/60 text-sm">
                    {selectedItem.brand}
                  </Text>
                </View>
              )}
            </View>

            {/* 描述 */}
            {!!selectedItem.description && (
              <ExpandableText
                content={selectedItem.description}
                maxLength={200}
                className="text-sm text-white/80"
              />
            )}

            {/* 标签 */}
            {!!selectedItem.tags?.length && (
              <View className="gap-3">
                <Text className="text-white font-bold text-base">标签</Text>
                <View className="flex-row flex-wrap gap-2">
                  {selectedItem.tags
                    .filter((tag: any) => typeof tag === "string")
                    .map((tag: string, i: number) => (
                      <View
                        key={`${tag}-${i}`}
                        className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10"
                      >
                        <Text className="text-xs text-white/90 font-medium">
                          {tag}
                        </Text>
                      </View>
                    ))}
                </View>
              </View>
            )}

            {/* 机会点 */}
            {!!selectedItem.chances?.length && (
              <View className="gap-4">
                <View className="flex-row items-center gap-2">
                  <View className="h-5 w-1 bg-primary rounded-full" />
                  <Text className="text-white font-bold text-lg">机会点</Text>
                </View>
                {selectedItem.chances.map((chance: any, idx: number) => (
                  <View
                    key={idx}
                    className="bg-background2 rounded-xl p-4 gap-4"
                    style={{
                      ...Platform.select({
                        ios: {
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                        },
                        android: {
                          elevation: 2,
                        },
                      }),
                    }}
                  >
                    {!!chance.sellingPoints?.length && (
                      <View className="gap-3">
                        <View className="flex-row items-center gap-2">
                          <Feather
                            name="star"
                            size={16}
                            color={colors.primary}
                          />
                          <Text className="text-white font-semibold">
                            核心卖点
                          </Text>
                        </View>
                        <View className="gap-2 pl-6">
                          {chance.sellingPoints
                            .filter(
                              (point: any) =>
                                point !== null && point !== undefined
                            )
                            .map((point: any, i: number) => {
                              // 处理不同类型的卖点数据
                              let displayText = "";
                              if (typeof point === "string") {
                                displayText = point;
                              } else if (
                                typeof point === "object" &&
                                point !== null
                              ) {
                                // 如果是对象，尝试提取描述或文本字段
                                displayText =
                                  point.description ||
                                  point.text ||
                                  point.title ||
                                  JSON.stringify(point);
                              } else {
                                displayText = String(point);
                              }
                              return (
                                <View
                                  key={i}
                                  className="flex-row items-start gap-2"
                                >
                                  <View className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                                  <Text className="text-sm text-white/90 flex-1 leading-5">
                                    {displayText}
                                  </Text>
                                </View>
                              );
                            })}
                        </View>
                      </View>
                    )}
                    {!!chance.targetAudience && (
                      <View className="gap-3">
                        <View className="flex-row items-center gap-2">
                          <Feather
                            name="users"
                            size={16}
                            color={colors.primary}
                          />
                          <Text className="text-white font-semibold">
                            目标受众
                          </Text>
                        </View>
                        <View className="bg-background/60 rounded-lg p-3 border border-white/5">
                          {Object.entries(chance.targetAudience).map(
                            ([key, value]: [string, any]) => {
                              let displayValue = "";
                              if (typeof value === "string") {
                                displayValue = value;
                              } else if (Array.isArray(value)) {
                                displayValue = value.join(", ");
                              } else if (
                                typeof value === "object" &&
                                value !== null
                              ) {
                                displayValue = Object.entries(value)
                                  .map(([k, v]) => {
                                    if (typeof v === "string") return v;
                                    if (Array.isArray(v)) return v.join(", ");
                                    return String(v);
                                  })
                                  .join(" • ");
                              } else {
                                displayValue = String(value);
                              }
                              return (
                                <View key={key} className="mb-3 last:mb-0">
                                  <Text className="text-xs text-white/60 mb-1.5 font-medium uppercase tracking-wide">
                                    {key}
                                  </Text>
                                  <Text className="text-sm text-white/90 leading-5">
                                    {displayValue}
                                  </Text>
                                </View>
                              );
                            }
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  const handleCreate = () => {
    router.navigate(`/session/createProduct`);
  };

  // 商品列表
  return (
    <View className="flex-1 bg-background">
      {/* 顶部标题栏 */}
      <View className="px-4 py-4 bg-background/95 backdrop-blur-sm border-b border-white/5">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-xl font-bold">商品列表</Text>
            <Text className="text-white/50 text-xs mt-0.5">发现精选好物</Text>
          </View>
          {flatData.length > 0 && (
            <View className="bg-primary/20 rounded-full px-3 py-1">
              <Text className="text-primary text-xs font-medium">
                {flatData.length} 件
              </Text>
            </View>
          )}
        </View>
      </View>

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
            <Text className="text-white/40 text-xs">下拉刷新获取最新商品</Text>
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
      <TouchableOpacity className="p-3" onPress={handleCreate}>
        <View className="flex-row items-center justify-between gap-2 border border-white/10 p-4 rounded-full">
          <View className="flex-row items-center gap-3">
            <Entypo name="folder-images" size={20} color="#A855F7" />
            <Text className="text-black/60">新建商品</Text>
          </View>
          <Ionicons name="add-circle-outline" size={20} color="black" />
        </View>
      </TouchableOpacity>
    </View>
  );
}
