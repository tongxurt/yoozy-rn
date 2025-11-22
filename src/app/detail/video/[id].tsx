import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useLocalSearchParams } from "expo-router";
import useTailwindVars from "@/hooks/useTailwindVars";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import ImagePreview from "@/components/ImagePreview";
import Video from "react-native-video";

const Inspiration = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [paused, setPaused] = useState(true);
  const [previewImages, setPreviewImages] = useState<Array<{ url: string; desc?: string }>>([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  const { width: screenWidth } = Dimensions.get('window');

  const { colors } = useTailwindVars();
  const queryClient = useQueryClient();
  // 取出所有以 ["items"] 开头的查询结果（包含不同 tab、搜索词的分页）
  const allPages = queryClient.getQueriesData({
    queryKey: ["items"],
    type: "all",
  });

  const flatItems = useMemo(() => {
    return allPages.flatMap(([, data]: any) => {
      const pages = data?.pages ?? [];
      return pages.flatMap((p: any) => p?.data?.data?.list ?? []);
    });
  }, [allPages]);

  const current = useMemo(
    () => flatItems.find((it: any) => String(it?._id) === String(id)),
    [flatItems, id]
  );

  const coverUrl =
    current?.root?.coverUrl ||
    current?.highlightFrames?.[0]?.url ||
    current?.coverUrl;

  // 视频详情含 segments（分段）
  const segments: Array<any> = current?.segments || [];

  const videoUrl = current?.url;

  return (
    <>
      <ScrollView
        className="flex-1 bg-background"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* 视频/封面 */}
        {videoUrl ? (
          <View style={{ position: "relative" }}>
            <Video
              source={{ uri: videoUrl }}
              style={{ width: "100%", aspectRatio: 10 / 12 }}
              controls={true}
              paused={paused}
              resizeMode="contain"
            />
            {paused && (
              <TouchableOpacity
                onPress={() => setPaused(false)}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                activeOpacity={1}
              >
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "white", fontSize: 32, marginLeft: 4 }}>▶</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        ) : coverUrl ? (
          <Image
            source={{ uri: coverUrl }}
            className="w-full aspect-[9/12]"
            resizeMode="cover"
          />
        ) : null}

        <View className="px-5 py-6 gap-6">
          {/* 基本信息 */}
          <View className="gap-4">
            <View className="flex-row items-center gap-2">
              <View className="w-1 h-4 rounded-full bg-primary" />
              <Text className="text-white text-lg font-bold">基本信息</Text>
            </View>

            <View className="rounded-2xl p-4 bg-plain gap-4">
              <View className="flex-row gap-4">
                {/* ID */}
                <View className="flex-1 gap-1">
                  <Text className="text-white/60 text-xs">ID</Text>
                  <Text className="text-white text-sm">{current?._id || '-'}</Text>
                </View>

                {/* 状态 */}
                <View className="flex-1 gap-1">
                  <Text className="text-white/60 text-xs">状态</Text>
                  <View className="flex-row items-center gap-1.5">
                    <View className="w-2 h-2 rounded-full bg-green-500" />
                    <Text className="text-white text-sm">
                      {current?.status === 'completed' ? '已完成' : current?.status || '-'}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row gap-4">
                {/* 创建时间 */}
                <View className="flex-1 gap-1">
                  <Text className="text-white/60 text-xs">创建时间</Text>
                  <Text className="text-white text-sm">
                    {current?.createdAt 
                      ? new Date(current.createdAt * 1000).toLocaleString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })
                      : '-'}
                  </Text>
                </View>

                {/* 更新时间 */}
                <View className="flex-1 gap-1">
                  <Text className="text-white/60 text-xs">更新时间</Text>
                  <Text className="text-white text-sm">
                    {current?.updatedAt 
                      ? new Date(current.updatedAt * 1000).toLocaleString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })
                      : '未知'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 商品信息 */}
          {!!current?.commodity && (
            <View className="gap-4">
              <View className="flex-row items-center gap-2">
                <View className="w-1 h-4 rounded-full bg-primary" />
                <Text className="text-white text-lg font-bold">商品信息</Text>
              </View>

              <View className="relative overflow-hidden rounded-2xl">
                <View className="p-5 gap-4 bg-plain rounded-2xl">
                  {/* 商品描述 */}
                  {!!current?.commodity?.name && (
                    <View>
                      <Text className="text-sm text-white/80 leading-6">
                        {current.commodity.name}
                      </Text>
                    </View>
                  )}

                  {/* 商品标签 */}
                  {!!current?.commodity?.tags?.length && (
                    <View className="flex-row flex-wrap gap-2 pt-2 border-t border-white/5">
                      {current.commodity.tags.map((tag: string, i: number) => (
                        <View key={i} className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/5">
                          <Text className="text-xs text-primary font-medium">{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* 分镜头详情 */}
          {!!segments?.length && (
            <View className="gap-6">
              {/* 标题 */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="w-1 h-4 rounded-full bg-primary" />
                  <Text className="text-white text-lg font-bold">分镜头详情</Text>
                </View>
                <View className="px-3 py-1 rounded-full bg-primary/10 border border-primary/5">
                  <Text className="text-primary text-xs font-medium">{segments.length} 个镜头</Text>
                </View>
              </View>

              {/* 横向滚动卡片 */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-5"
                contentContainerStyle={{ paddingHorizontal: 20, gap: 16, alignItems: 'flex-start' }}
              >
                {segments.map((seg, idx) => {
                  const frames: Array<{ url: string; desc?: string }> =
                    seg?.highlightFrames || [];
                  
                  // 提取各类标签
                  const focusPoints = seg?.typedTags?.focusOn || [];
                  const copywriting = seg?.typedTags?.text || [];
                  const characters = seg?.typedTags?.person || [];
                  const actions = seg?.typedTags?.action || [];
                  const frameTags = seg?.typedTags?.picture || [];
                  const scenes = seg?.typedTags?.scene || [];
                  const shots = seg?.typedTags?.shootingStyle || [];
                  const emotions = seg?.typedTags?.emotion || [];

                  return (
                    <View 
                      key={idx} 
                      className="bg-plain rounded-3xl p-4"
                      style={{ width: 320 }}
                    >
                      <View className="flex-row items-center gap-2 mb-4">
                        <View className="w-8 h-8 rounded-full bg-primary items-center justify-center">
                          <Text className="text-plain text-sm font-bold">{idx + 1}</Text>
                          </View>
                        <Text className="text-white text-base font-bold flex-1">
                              {seg.timeStart || 0}s ~ {seg.timeEnd}s
                            </Text>
                            {(seg?.startTime !== undefined || seg?.endTime !== undefined) && (
                          <View className="px-2 py-0.5 rounded bg-primary/20">
                            <Text className="text-primary text-xs font-medium">
                              {seg?.startTime || 0}s - {seg?.endTime || 0}s
                              </Text>
                          </View>
                        )}
                      </View>

                      <View className="gap-4">
                        {!!seg?.description && (
                          <View className="gap-2">
                            <Text className="text-white/60 text-xs font-bold">描述</Text>
                            <Text className="text-sm text-white/80 leading-6" numberOfLines={3}>
                              {seg.description}
                            </Text>
                          </View>
                        )}

                        {!!(seg?.voiceover || seg?.voice || seg?.narration || seg?.subtitle) && (
                          <View className="gap-2">
                            <Text className="text-white/60 text-xs font-bold">📢 配音文案</Text>
                            <View className="bg-white/5 p-3 rounded-lg">
                              <Text className="text-sm text-white/80 leading-6" numberOfLines={4}>
                                {seg?.voiceover || seg?.voice || seg?.narration || seg?.subtitle}
                              </Text>
                            </View>
                          </View>
                        )}

                        {/* 分类标签 */}
                        {(focusPoints.length > 0 || copywriting.length > 0 || characters.length > 0 || 
                          actions.length > 0 || frameTags.length > 0 || scenes.length > 0 || 
                          shots.length > 0 || emotions.length > 0) && (
                          <View className="gap-2">
                            <Text className="text-white/60 text-xs font-bold">分类标签</Text>
                            <View className="gap-2">
                            {!!focusPoints?.length && (
                                <View className="flex-row items-start gap-2">
                                  <Text className="text-white/60 text-xs mt-1">重点:</Text>
                                <View className="flex-1 flex-row flex-wrap gap-1.5">
                                  {focusPoints.slice(0, 3).map((tag: string, i: number) => (
                                      <View key={i} className="px-2 py-0.5 rounded bg-primary/20">
                                        <Text className="text-primary text-xs">{tag}</Text>
                                    </View>
                                  ))}
                                </View>
                              </View>
                            )}

                            {!!copywriting?.length && (
                                <View className="flex-row items-start gap-2">
                                  <Text className="text-white/60 text-xs mt-1">文案:</Text>
                                <View className="flex-1 flex-row flex-wrap gap-1.5">
                                  {copywriting.slice(0, 3).map((tag: string, i: number) => (
                                      <View key={i} className="px-2 py-0.5 rounded bg-primary/20">
                                        <Text className="text-primary text-xs">{tag}</Text>
                                    </View>
                                  ))}
                                </View>
                              </View>
                            )}

                            {!!characters?.length && (
                                <View className="flex-row items-start gap-2">
                                  <Text className="text-white/60 text-xs mt-1.5">人物:</Text>
                                  <View className="flex-1 flex-row flex-wrap gap-2">
                                  {characters.map((tag: string, i: number) => (
                                      <View key={i} className="px-2.5 py-1 rounded bg-primary/20">
                                        <Text className="text-primary text-xs">{tag}</Text>
                                    </View>
                                  ))}
                                </View>
                              </View>
                            )}

                              {!!actions?.length && (
                                <View className="flex-row items-start gap-2">
                                  <Text className="text-white/60 text-xs mt-1.5">动作:</Text>
                                  <View className="flex-1 flex-row flex-wrap gap-2">
                                    {actions.map((tag: string, i: number) => (
                                      <View key={i} className="px-2.5 py-1 rounded bg-primary/20">
                                        <Text className="text-primary text-xs">{tag}</Text>
                                    </View>
                                  ))}
                                  </View>
                                </View>
                              )}

                              {!!frameTags?.length && (
                                <View className="flex-row items-start gap-2">
                                  <Text className="text-white/60 text-xs mt-1.5">画面:</Text>
                                  <View className="flex-1 flex-row flex-wrap gap-2">
                                    {frameTags.map((tag: string, i: number) => (
                                      <View key={i} className="px-2.5 py-1 rounded bg-primary/20">
                                        <Text className="text-primary text-xs">{tag}</Text>
                                      </View>
                                    ))}
                                  </View>
                                </View>
                              )}

                              {!!scenes?.length && (
                                <View className="flex-row items-start gap-2">
                                  <Text className="text-white/60 text-xs mt-1.5">场景:</Text>
                                  <View className="flex-1 flex-row flex-wrap gap-2">
                                    {scenes.map((tag: string, i: number) => (
                                      <View key={i} className="px-2.5 py-1 rounded bg-primary/20">
                                        <Text className="text-primary text-xs">{tag}</Text>
                                      </View>
                                    ))}
                                  </View>
                                    </View>
                                  )}

                              {!!shots?.length && (
                                <View className="flex-row items-start gap-2">
                                  <Text className="text-white/60 text-xs mt-1.5">拍摄:</Text>
                                  <View className="flex-1 flex-row flex-wrap gap-2">
                                    {shots.map((tag: string, i: number) => (
                                      <View key={i} className="px-2.5 py-1 rounded bg-primary/20">
                                        <Text className="text-primary text-xs">{tag}</Text>
                                      </View>
                                    ))}
                                  </View>
                                </View>
                              )}

                              {!!emotions?.length && (
                                <View className="flex-row items-start gap-2">
                                  <Text className="text-white/60 text-xs mt-1.5">情绪:</Text>
                                  <View className="flex-1 flex-row flex-wrap gap-2">
                                    {emotions.map((tag: string, i: number) => (
                                      <View key={i} className="px-2.5 py-1 rounded bg-primary/20">
                                        <Text className="text-primary text-xs">{tag}</Text>
                                      </View>
                                    ))}
                                </View>
                              </View>
                            )}
                            </View>
                          </View>
                        )}


                        {/* 关键帧 */}
                        {!!frames?.length && (
                          <View className="gap-2">
                            <Text className="text-white/60 text-xs font-bold">关键帧</Text>
                            <ScrollView
                              horizontal
                              showsHorizontalScrollIndicator={false}
                              contentContainerStyle={{ gap: 8 }}
                            >
                              {frames.map((f, i) => (
                                <TouchableOpacity
                                  key={`${f.url}-${i}`}
                                  onPress={() => {
                                    setPreviewImages(frames);
                                    setPreviewIndex(i);
                                  }}
                                  activeOpacity={1}
                                >
                                  <Image
                                    source={{ uri: f.url }}
                                    className="w-20 h-28 rounded-lg"
                                    resizeMode="cover"
                                  />
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Image Preview */}
      <ImagePreview
        images={previewImages}
        initialIndex={previewIndex}
        visible={previewImages.length > 0}
        onClose={() => setPreviewImages([])}
        onIndexChange={(index) => setPreviewIndex(index)}
      />
    </>
  );
};

export default Inspiration;
