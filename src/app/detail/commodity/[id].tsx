import Carousel from '@/components/ui/Carousel';
import ExpandableText from '@/components/ui/ExpandableText';
import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View, TouchableOpacity, ScrollView, Platform, Text, Image, Dimensions, StatusBar, Modal, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { deleteCommodities } from '@/api/commodity';

export default () => {
  const { width: screenWidth } = Dimensions.get("window");
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { colors } = useTailwindVars();
  const [showDropdown, setShowDropdown] = useState(false);

  const {mutate: deleteCommodity} = useMutation({
    mutationFn: () => deleteCommodities(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["commodity"],
      });
      router.back();
    },
  })

  // 取出所有以 ["items"] 开头的查询结果（包含不同 tab、搜索词的分页）
  const allPages = queryClient.getQueriesData({
    queryKey: ["commodity"],
    type: "all",
  });

  const flatItems = useMemo(() => {
    return allPages.flatMap(([, data]: any) => {
      const pages = data?.pages ?? [];
      return pages.flatMap((p: any) => p?.data?.data?.list ?? []);
    });
  }, [allPages]);


  const selectedItem = useMemo(
    () => flatItems.find((it: any) => String(it?._id) === String(id)),
    [flatItems, id]
  );
  
  if (!selectedItem) return null;

  return (
      <View className="flex-1 bg-background">
        {/* 顶部导航栏 - 沉浸式 */}

        <ScrollView 
          className="flex-1 relative" 
          showsVerticalScrollIndicator={false} 
          bounces={false}
        >
        {/* 全屏透明覆盖层 - 用于点击外部关闭下拉菜单 */}
        {showDropdown && (
          <Pressable
            className="absolute inset-0 z-40"
            onPress={() => setShowDropdown(false)}
          />
        )}

        <View 
          className="absolute top-0 left-0 right-0 z-50 flex-row items-center justify-end px-4 pt-5 pb-4"
        >
          <View>
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-white/10"
              activeOpacity={0.7}
              onPress={() => setShowDropdown(!showDropdown)}
            >
              <MaterialIcons name="more-horiz" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Dropdown Menu */}
            {showDropdown && (
              <View 
                className="absolute top-12 right-0 w-40 bg-plain/95 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
                style={{ elevation: 5 }}
              >
                {/* <TouchableOpacity
                  className="flex-row items-center gap-3 px-4 py-3.5 active:bg-white/5"
                  activeOpacity={1}
                  onPress={() => {
                    setShowDropdown(false);
                    // TODO: Implement edit functionality
                    console.log('Edit commodity:', id);
                  }}
                >
                  <Feather name="edit-2" size={18} color="#7150FF" />
                  <Text className="text-white text-base font-medium">编辑</Text>
                </TouchableOpacity>

                <View className="h-px bg-white/5 mx-3" /> */}

                <TouchableOpacity
                  className="flex-row items-center gap-3 px-4 py-3.5 active:bg-white/5"
                  activeOpacity={1}
                  onPress={() => {
                    // setShowDropdown(false);
                    deleteCommodity()
                  }}
                >
                  <Feather name="trash-2" size={18} color="#EF4444" />
                  <Text className="text-red-500 text-base font-medium">删除</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
          {/* 图片轮播区域 */}
          <View className="relative">
            {!!selectedItem.images?.length ? (
              <Carousel
                data={selectedItem.images}
                renderItem={(url: string) => (
                  <View style={{ width: screenWidth, height: screenWidth * 1.1, backgroundColor: '#000' }}>
                    <Image
                      source={{ uri: url }}
                      style={{
                        width: '100%',
                        height: '100%',
                      }}
                      resizeMode="cover"
                    />
                    {/* 底部渐变遮罩 */}
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 }}
                    />
                  </View>
                )}
                itemWidth={screenWidth}
                itemHeight={screenWidth * 1.1}
                showDots={selectedItem.images.length > 1}
              />
            ) : (
              <View style={{ width: screenWidth, height: screenWidth * 0.8, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' }}>
                <Feather name="image" size={48} color="#333" />
              </View>
            )}
          </View>

          {/* 内容区域 - 上浮卡片效果 */}
          <View className="-mt-8 bg-background rounded-t-3xl px-5 pt-8 pb-10 gap-6 min-h-screen">
            
            {/* 基本信息 */}
            <View className="gap-4">
              <View className="flex-row items-center gap-2">
                <View className="w-1 h-4 rounded-full bg-primary" />
                <Text className="text-white text-lg font-bold">基本信息</Text>
              </View>

              <View className="bg-plain rounded-2xl p-5 gap-4">
                {/* 标题与品牌 */}
                <View className="gap-3">
                  {!!selectedItem.brand && (
                    <View className="flex-row self-start">
                      <View className="bg-primary/15 px-3 py-1 rounded-full border border-primary/20">
                        <Text className="text-primary text-xs font-bold tracking-wide uppercase">
                          {selectedItem.brand}
                        </Text>
                      </View>
                    </View>
                  )}
                  <Text className="text-white text-2xl font-bold leading-8 tracking-tight">
                    {selectedItem.title || selectedItem.name}
                  </Text>
                </View>

                {/* 描述 */}
                {!!selectedItem.description && (
                  <View className='gap-2 pt-2 border-t border-white/5'>
                    <ExpandableText
                      content={selectedItem.description}
                      maxLength={150}
                      className="text-base text-white/80 leading-6 font-normal"
                    />
                  </View>
                )}

                {/* 标签 */}
                {!!selectedItem.tags?.length && (
                  <View className="pt-2 border-t border-white/5">
                    <View className="flex-row flex-wrap gap-2">
                      {selectedItem.tags
                        .filter((tag: any) => typeof tag === "string")
                        .map((tag: string, i: number) => (
                          <View
                            key={`${tag}-${i}`}
                            className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/5"
                          >
                            <Text className="text-xs text-primary font-medium">
                              #{tag}
                            </Text>
                          </View>
                        ))}
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* 机会点 - 横向滚动卡片 */}
            {!!selectedItem.chances?.length && (
              <View className="gap-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <View className="w-1 h-4 rounded-full bg-primary" />
                    <Text className="text-white font-bold text-lg">营销机会点</Text>
                  </View>
                  <View className="px-3 py-1 rounded-full bg-primary/10 border border-primary/5">
                    <Text className="text-primary text-xs font-medium">{selectedItem.chances.length} 个机会点</Text>
                  </View>
                </View>
                
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
                  className="-mx-5"
                >
                  {selectedItem.chances.map((chance: any, idx: number) => (
                    <View
                      key={idx}
                      style={{
                        width: screenWidth * 0.8,
                      }}
                    >
                      <View
                        className="rounded-3xl p-5 bg-plain"
                      >
                        {/* 核心卖点 */}
                        {!!chance.sellingPoints?.length && (
                          <View className="mb-6">
                            <View className="flex-row items-center gap-3 mb-2">
                              <View className="w-10 h-10 rounded-full bg-[#7150FF]/10 items-center justify-center">
                                <Feather name="star" size={18} color="#7150FF" />
                              </View>
                              <Text className="text-white font-bold text-lg">核心卖点</Text>
                            </View>
                            <View className="gap-3 pl-1">
                              {chance.sellingPoints
                                .filter((point: any) => point != null)
                                .map((point: any, i: number) => {
                                  let displayText = typeof point === 'object' 
                                    ? (point.description || point.text || point.title || JSON.stringify(point))
                                    : String(point);
                                  
                                  return (
                                    <View key={i} className="flex-row gap-3">
                                      <Text className="text-base text-white/80 flex-1 leading-6 pl-12">
                                        {displayText}
                                      </Text>
                                    </View>
                                  );
                                })}
                            </View>
                          </View>
                        )}

                        {/* 目标受众 */}
                        {!!chance.targetAudience && (
                          <View>
                            <View className="flex-row items-center gap-3 mb-2">
                              <View className="w-10 h-10 rounded-full bg-[#A855F7]/10 items-center justify-center">
                                <Feather name="users" size={18} color="#A855F7" />
                              </View>
                              <Text className="text-white font-bold text-lg">目标受众</Text>
                            </View>
                            <View className="rounded-2xl">
                              {Object.entries(chance.targetAudience).map(([key, value]: [string, any]) => {
                                let displayValue = "";
                                if (typeof value === "string") displayValue = value;
                                else if (Array.isArray(value)) displayValue = value.join(", ");
                                else if (typeof value === "object" && value !== null) {
                                  displayValue = Object.entries(value)
                                    .map(([k, v]) => Array.isArray(v) ? v.join(", ") : String(v))
                                    .join(" • ");
                                } else displayValue = String(value);
                                if (key === "tags") return null
                                return (
                                  <View key={key} className="flex-row gap-3">
                                    <Text className="text-sm text-white/80 leading-5 font-medium pl-12">{displayValue}</Text>
                                  </View>
                                );
                              })}
                            </View>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          
          {/* 底部安全距离 */}
          <View className="h-10" />
        </ScrollView>
      </View>
    );
}