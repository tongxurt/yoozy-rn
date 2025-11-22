import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import useTailwindVars from "@/hooks/useTailwindVars";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import ExpandableText from "@/components/ui/ExpandableText";
import ImagePreview from "@/components/ImagePreview";
import Video from "react-native-video";
import { Ionicons, AntDesign } from '@expo/vector-icons';

const Inspiration = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [paused, setPaused] = useState(true);
  const [previewImages, setPreviewImages] = useState<Array<{ url: string; desc?: string }>>([]);
  const [previewIndex, setPreviewIndex] = useState(0);

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

  const videoUrl = current?.root?.url;

  const tags: string[] =
    current?.tags ||
    [];

  const highlightFrames: Array<{ url: string; desc?: string }> =
    current?.highlightFrames || [];

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
              activeOpacity={0.8}
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
        {/* 基本信息 (描述 + 标签) */}
        <View className="gap-4">
          <View className="flex-row items-center gap-2">
            <View className="w-1 h-4 rounded-full bg-primary" />
            <Text className="text-white text-lg font-bold">基本信息</Text>
          </View>

          <View className="bg-plain rounded-2xl p-5 gap-4">
            {/* 描述 */}
            <View>
              <Text className="text-white/80 text-lg font-semibold leading-tight">
                {current?.description}
              </Text>
            </View>

            {/* 标签 */}
            {!!tags?.length && (
              <View className="flex-row flex-wrap gap-2 pt-4 border-t border-white/5">
                {tags.slice(0, 12).map((t, i) => (
                  <View
                    key={`${t}-${i}`}
                    className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/5"
                  >
                    <Text className="text-xs text-primary font-medium">{t}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* 商品信息 */}
        {!!current?.root?.commodity?.name && (
          <View className="gap-4">
            <View className="flex-row items-center gap-2">
              <View className="w-1 h-4 rounded-full bg-primary" />
              <Text className="text-white text-lg font-bold">商品信息</Text>
            </View>
            
            <View className="bg-plain rounded-2xl p-5">
              <Text className="text-base text-white/80 leading-6">
                {current?.root?.commodity?.name}
              </Text>
            </View>
          </View>
        )}
       

        {/* 关键帧预览 */}
        {!!highlightFrames?.length && (
          <View className="gap-4">
            <View className="flex-row items-center gap-2">
              <View className="w-1 h-4 rounded-full bg-primary" />
              <Text className="text-white text-lg font-bold">关键帧</Text>
            </View>
            
            <View className="bg-plain rounded-2xl p-5">
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                scrollEnabled={true}
                nestedScrollEnabled={false}
                contentContainerStyle={{ gap: 12 }}
              >
                {highlightFrames.map((f, i) => (
                  <TouchableOpacity
                    key={`${f.url}-${i}`}
                    onPress={() => {
                      setPreviewImages(highlightFrames);
                      setPreviewIndex(i);
                    }}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: f.url }}
                      className="w-32 h-44 rounded-lg bg-white/5"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* 拍摄说明 */}
        {!!current?.shootingStyle && (
          <View className="gap-4">
            <View className="flex-row items-center gap-2">
              <View className="w-1 h-4 rounded-full bg-primary" />
              <Text className="text-white text-lg font-bold">拍摄说明</Text>
            </View>
            
            <View className="bg-plain rounded-2xl p-5">
              <ExpandableText
                content={current?.shootingStyle}
                maxLength={150}
                className="text-sm text-white/80 leading-6"
              />
            </View>
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
