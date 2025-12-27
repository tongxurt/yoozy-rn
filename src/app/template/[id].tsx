import { getTemplate } from "@/api/resource";
import ImagePreview from "@/components/ImagePreview";
import ScreenContainer from "@/components/ScreenContainer";
import Modal from "@/components/ui/Modal";
import useTailwindVars from "@/hooks/useTailwindVars";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Video from "react-native-video";

const { height } = Dimensions.get("window");

const Template = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [paused, setPaused] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [previewImages, setPreviewImages] = useState<Array<{ url: string; desc?: string }>>([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  const { colors } = useTailwindVars();

  // Data Fetching
  const { data, isLoading } = useQuery({
    queryKey: ["template", id],
    queryFn: () => getTemplate({ id }),
    enabled: !!id,
  });


  const current = data?.data?.data;
  const coverUrl = current?.highlightFrames?.[0]?.url || current?.coverUrl;
  const videoUrl = current?.url;

  // Template specific fields
  const segments: Array<any> = current?.segments || [];
  const commodityTags = current?.commodity?.tags || [];

  const videoRef = useRef<any>(null);

  // Reuse Inspiration logic for progress if needed, but simple repeat is fine for now.

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScreenContainer edges={[]}
      style={{ flex: 1, backgroundColor: 'black' }}
      barStyle="light-content">

      {/* Video Background */}
      {videoUrl ? (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setPaused(!paused)}
          style={StyleSheet.absoluteFill}
        >
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            repeat={true}
            paused={paused}
            poster={coverUrl}
            posterResizeMode="cover"
            progressUpdateInterval={50}
          />
          {paused && (
            <View className="absolute inset-0 justify-center items-center bg-black/20">
              <Ionicons name="play" size={60} color="rgba(255,255,255,0.8)" />
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <Image
          source={{ uri: coverUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      )}

      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute left-4 z-10 w-10 h-10 items-center justify-center rounded-full bg-black/20"
        style={{ top: insets.top + 10 }}
      >
        <Ionicons name="chevron-back" size={28} color="white" />
      </TouchableOpacity>

      {/* Bottom Overlay & Action Bar */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: 34, paddingTop: 120 }}
        pointerEvents="box-none"
      >
        <View className="px-4 gap-4">

          {/* Text Info (Title/Tags) */}
          <TouchableOpacity
            className="gap-2"
            activeOpacity={0.8}
            onPress={() => setDetailsVisible(true)}
          >
            {/* <Text className="font-bold text-lg text-white" numberOfLines={1}>
              {current?.commodity?.name || current?.description || '未命名项目'}
            </Text> */}

            {commodityTags.length > 0 && (
              <View className="flex-row flex-wrap gap-2">
                {commodityTags.map((t: string, i: number) => (
                  <View key={i} className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md">
                    <Text className="text-[white] text-xs font-medium">{t}</Text>
                  </View>
                ))}
              </View>
            )}
            {/* <View className="flex-row items-center gap-1 opacity-60">
              <Text className="text-xs text-white">查看详情</Text>
              <Ionicons name="chevron-forward" size={12} color="white" />
            </View> */}

          </TouchableOpacity>

          {/* <View className="flex-row items-stretch gap-3 mt-2">
            <TouchableOpacity
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 12,
                paddingHorizontal: 20,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                height: 48,
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="heart-outline" size={24} color="white" />
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>{Math.floor(Math.random() * 1000) + 100}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: 'white',
                borderRadius: 12,
                height: 48,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.9}
              onPress={() => {
             
              }}
            >
              <Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold' }}>剪同款</Text>
            </TouchableOpacity>
          </View> */}

        </View>
      </LinearGradient>


      {/* Details Modal */}
      <Modal
        visible={detailsVisible}
        onClose={() => setDetailsVisible(false)}
        position="bottom"
        contentStyle={{ maxHeight: height * 0.7, borderTopLeftRadius: 24, borderTopRightRadius: 24, }}
      >
        <ScrollView className="px-5 py-2 mb-6" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white text-xl font-bold">模板详情</Text>
          </View>

          <View className="gap-6 pb-10">
            {/* Description */}
            {current?.description && (
              <View className="gap-3">
                <Text className="text-white/60 text-sm font-medium">模板描述</Text>
                <Text className="text-white/90 text-base leading-6">
                  {current.description}
                </Text>
              </View>
            )}

            {/* Script Segments */}
            {segments.length > 0 && (
              <View className="gap-4">
                <Text className="text-white/60 text-sm font-medium">分镜详情 ({segments.length})</Text>
                <View className="gap-6">
                  {segments.map((seg: any, i: number) => (
                    <View key={i} className="bg-white/5 p-4 rounded-xl gap-3">
                      {/* Header: Time & Index */}
                      <View className="flex-row justify-between items-center border-b border-white/5 pb-3">
                        <View className="flex-row items-center gap-2">
                          <View className="bg-primary/20 px-2 py-0.5 rounded">
                            <Text className="text-primary font-bold text-xs">镜头 {i + 1}</Text>
                          </View>
                          <Text className="text-white/40 text-xs font-mono">{seg.timeStart ? seg.timeStart.toFixed(1) : '0.0'}s - {seg.timeEnd.toFixed(1)}s</Text>
                        </View>
                      </View>

                      {/* Main Description */}
                      <View className="gap-1">
                        <Text className="text-white/40 text-xs">画面描述</Text>
                        <Text className="text-white/90 text-sm leading-6">{seg.description}</Text>
                      </View>

                      {/* Subtitle/Voiceover */}
                      {(seg.voiceover || seg.subtitle) && (
                        <View className="bg-white/5 p-3 rounded-lg border border-white/5">
                          <Text className="text-white/40 text-xs mb-1">口播/字幕</Text>
                          <Text className="text-white/80 text-sm italic">"{seg.voiceover || seg.subtitle}"</Text>
                        </View>
                      )}

                      {/* Styles Grid */}
                      <View className="flex-row flex-wrap gap-3 pt-2">
                        {seg.sceneStyle && (
                          <View className="w-full gap-1 mb-2">
                            <Text className="text-white/40 text-xs">场景风格</Text>
                            <Text className="text-white/70 text-xs bg-white/5 p-2 rounded">{seg.sceneStyle}</Text>
                          </View>
                        )}
                        {seg.shootingStyle && (
                          <View className="w-full gap-1 mb-2">
                            <Text className="text-white/40 text-xs">拍摄指导</Text>
                            <Text className="text-white/70 text-xs bg-white/5 p-2 rounded leading-5">{seg.shootingStyle}</Text>
                          </View>
                        )}
                        {seg.contentStyle && (
                          <View className="w-full gap-1">
                            <Text className="text-white/40 text-xs">内容逻辑</Text>
                            <Text className="text-white/70 text-xs bg-white/5 p-2 rounded">{seg.contentStyle}</Text>
                          </View>
                        )}
                      </View>

                      {/* Highlight Frames */}
                      {seg.highlightFrames?.length > 0 && (
                        <View className="mt-2 pt-3 border-t border-white/5">
                          <Text className="text-white/40 text-xs mb-3">关键帧演示</Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-3">
                            {seg.highlightFrames.map((frame: any, idx: number) => (
                              <TouchableOpacity
                                key={idx}
                                onPress={() => {
                                  setPreviewImages(seg.highlightFrames);
                                  setPreviewIndex(idx);
                                }}
                                className="w-32 gap-1"
                              >
                                <Image
                                  source={{ uri: frame.url }}
                                  className="w-32 h-20 rounded-lg bg-white/10"
                                  resizeMode="cover"
                                />
                                {frame.desc && (
                                  <Text numberOfLines={2} className="text-white/30 text-[10px] m-1">{frame.desc}</Text>
                                )}
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Commodity Info */}
            {!!current?.commodity?.name && (
              <View className="gap-3">
                <Text className="text-white/60 text-sm font-medium">关联商品/品牌</Text>
                <View className="bg-white/5 rounded-xl p-4 flex-row items-center gap-3">
                  <View className="flex-1">
                    <Text className="text-white/90 text-base font-medium leading-relaxed">{current.commodity.name}</Text>
                    {current.commodity.brand && (
                      <Text className="text-white/50 text-xs mt-1">品牌: {current.commodity.brand}</Text>
                    )}
                  </View>
                </View>
              </View>
            )}

          </View>
        </ScrollView>
      </Modal>

      {/* Image Preview Helper */}
      <ImagePreview
        images={previewImages}
        initialIndex={previewIndex}
        visible={previewImages.length > 0}
        onClose={() => setPreviewImages([])}
        onIndexChange={(index) => setPreviewIndex(index)}
      />
    </ScreenContainer>
  );
};

export default Template;
