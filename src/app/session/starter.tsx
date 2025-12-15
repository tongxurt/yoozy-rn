import { fetchCommodities } from "@/api/commodity";
import { createSession } from "@/api/session";
import CreditEntry from "@/components/CreditEntry";
import { CustomRefreshControl } from "@/components/CustomRefreshControl";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Toast } from "react-native-toast-notifications";

const { width: screenWidth } = Dimensions.get("window");
const columnCount = 2;
const cardGap = 12;
const panelWidth = screenWidth - 32;
const cardWidth = (panelWidth - 32 - cardGap) / columnCount;

const Starter = () => {
  const { colors } = useTailwindVars();
  const insets = useSafeAreaInsets();
  const [queryKeyword, setQueryKeyword] = useState("");
  const searchTimeout = useRef<any>(null);

  // Modal State
  const [confirmItem, setConfirmItem] = useState<any>(null);

  const handleSearch = (text: string) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      setQueryKeyword(text);
    }, 500);
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
    queryKey: ["commodities-list-selection-original", queryKeyword],
    queryFn: ({ pageParam = 1 }) => {
      const params: any = {
        page: pageParam,
        size: 10,
        returnFields: "status,medias,images,title,brand,_id",
      };
      if (queryKeyword) {
        params.keyword = queryKeyword;
      }
      return fetchCommodities(params);
    },
    getNextPageParam: (lastPage) =>
      lastPage?.data?.data?.hasMore
        ? lastPage?.data?.data?.page + 1
        : undefined,
    staleTime: 1000,
    refetchOnWindowFocus: false,
  });

  const flatData = useMemo(() => {
    return data?.pages.flatMap((page) => page?.data?.data?.list || []) || [];
  }, [data]);

  const handleSelect = (item: any) => {
    if (!item._id) return;
    setConfirmItem(item);
  };

  const handleConfirm = async () => {
    if (!confirmItem?._id) return;

    // Close modal first or keep open with loading? 
    // Let's keep it simple: Close immediately, show toast if fail, nav if success.
    // Or maybe showing a loading spinner on the button is better? 
    // Implementing basic close first.

    const item = confirmItem;
    setConfirmItem(null);

    try {
      const payload: any = {
        commodityId: item._id,
        // url: item.link || item.url || "",
        // images:
        //   item.images ||
        //   (item.medias ? item.medias.map((m: any) => m.url) : []),
      };

      const session = await createSession(payload);
      if (session?.data?.data?._id) {
        router.replace(`/session/${session.data.data._id}`);
      } else {
        Toast.show("创建会话失败");
      }
    } catch (error) {
      console.error(error);
      Toast.show("创建会话失败，请重试");
    }
  };

  const renderSkeletonItem = (index: number) => {
    return (
      <View
        key={`skeleton-${index}`}
        style={{ width: cardWidth, marginBottom: 16 }}
      >
        <View className="rounded-lg overflow-hidden mb-2" style={{ backgroundColor: colors.background2 }}>
          <SkeletonLoader
            width="100%"
            height={cardWidth * 1.33}
          />
        </View>
        <View className="gap-1">
          <SkeletonLoader width="40%" height={10} />
          <SkeletonLoader width="80%" height={12} />
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const firstImage = item.images?.[0] || item.medias?.[0]?.url;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleSelect(item)}
        style={{
          width: cardWidth,
          marginBottom: 16,
        }}
      >
        {/* Image */}
        <View className="rounded-lg overflow-hidden mb-2 relative" style={{ backgroundColor: colors.background2 }}>
          {firstImage ? (
            <Image
              source={{ uri: firstImage }}
              style={{
                width: "100%",
                aspectRatio: 0.75,
              }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: "100%",
                aspectRatio: 0.75,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Feather name="image" size={24} color={colors.grey3} />
            </View>
          )}
        </View>

        {/* Content */}
        <View className="px-0.5">
          {item?.brand && (
            <Text
              className="text-[10px] font-bold tracking-widest uppercase mb-0.5"
              style={{ color: colors.grey1 }}
              numberOfLines={1}
            >
              {item.brand}
            </Text>
          )}
          <Text
            className="font-medium text-xs leading-4"
            style={{ color: colors.grey0 }}
            numberOfLines={2}
          >
            {item.title || item.name || "未命名商品"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header - Dynamic Colors */}
      <View className={"px-5 pb-4 flex-row justify-between items-center"}>
        <Text className="text-[22px] font-bold" style={{ color: colors.grey0 }}>智能成片</Text>
        <View className={"flex-row items-center gap-2"}>
          <CreditEntry />
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 32,
              height: 32,
              justifyContent: "center",
              alignItems: "center",
            }}
            activeOpacity={1}
          >
            <MaterialCommunityIcons
              name="arrow-collapse"
              size={25}
              color={colors.grey0}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area - White Rounded Panel */}
      <View
        className="flex-1 mx-4 mb-4 rounded-2xl overflow-hidden"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
          backgroundColor: colors.plain
        }}
      >
        {/* Title & Search Bar inside Panel */}
        <View className="px-4 py-4 border-b border-divider" style={{ borderBottomColor: colors.divider }}>
          <Text className="text-base font-bold mb-3" style={{ color: colors.grey0 }}>
            选择推广商品
          </Text>
          <View className="flex-row items-center gap-3">
            <View className="flex-1 flex-row items-center rounded-lg px-3 py-2" style={{ backgroundColor: colors.background2 }}>
              <Feather name="search" size={16} color={colors.grey2} />
              <TextInput
                className="flex-1 ml-2 text-sm"
                style={{ color: colors.grey0 }}
                placeholder="搜索商品..."
                placeholderTextColor={colors.grey3}
                onChangeText={handleSearch}
                returnKeyType="search"
                autoCapitalize="none"
                clearButtonMode="while-editing"
              />
            </View>
            <TouchableOpacity onPress={() => router.push("/commodity/create")}>
              <Text className="text-sm font-bold" style={{ color: colors.primary }}>去创建</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* List inside Panel */}
        {isLoading && !data ? (
          <View style={{ padding: 16, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {Array.from({ length: 6 }).map((_, index) =>
              renderSkeletonItem(index)
            )}
          </View>
        ) : (
          <FlatList
            data={flatData}
            renderItem={renderItem}
            keyExtractor={(item, index) => `select-commodity-${item._id}-${index}`}
            numColumns={columnCount}
            removeClippedSubviews
            contentContainerStyle={{
              padding: 16,
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
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center justify-center py-20">
                <Feather name="search" size={32} color={colors.grey3} />
                <Text className="text-sm mt-3" style={{ color: colors.grey2 }}>未找到商品</Text>
              </View>
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color={colors.grey3} />
                </View>
              ) : <View className="h-4" />
            }
          />
        )}
      </View>

      {/* Note Text */}
      <Text
        style={{
          marginBottom: Math.max(insets.bottom, 12),
          fontSize: 12,
          color: colors.grey2,
          textAlign: "center",
        }}
      >
        视频每秒消耗1积分, 实际消耗与最终输出的视频时长相关
      </Text>

      {/* Confirmation Modal */}
      <Modal
        transparent
        visible={!!confirmItem}
        animationType="fade"
        onRequestClose={() => setConfirmItem(null)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
          activeOpacity={1}
          onPress={() => setConfirmItem(null)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{
              width: '80%',
              backgroundColor: colors.plain,
              borderRadius: 20,
              padding: 24,
              alignItems: 'center',
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.2,
              shadowRadius: 20,
              elevation: 10
            }}
          >
            <Text className="text-lg font-bold mb-3" style={{ color: colors.grey0 }}>开启创作</Text>

            <Text className="text-center text-sm leading-6 mb-6" style={{ color: colors.grey1 }}>
              是否使用商品
              <Text className="font-bold" style={{ color: colors.grey0 }}>{`【${confirmItem?.title || "未命名商品"}】`}</Text>
              {"\n"}开启视频创作？
            </Text>

            <View className="flex-row gap-4 w-full">
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl items-center justify-center bg-grey5"
                style={{ backgroundColor: colors.background0 }}
                onPress={() => setConfirmItem(null)}
              >
                <Text className="font-bold" style={{ color: colors.grey1 }}>取消</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 py-3 rounded-xl items-center justify-center"
                style={{ backgroundColor: colors.primary }}
                onPress={handleConfirm}
              >
                <Text className="font-bold text-white">确认</Text>
              </TouchableOpacity>
            </View>

          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </View>
  );
};

export default Starter;
