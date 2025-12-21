import { getTemplate } from "@/api/resource";
import ImagePreview from "@/components/ImagePreview";
import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Video from "react-native-video";

const { width: screenWidth } = Dimensions.get("window");

const Template = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [paused, setPaused] = useState(true);
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

  const coverUrl =
    current?.highlightFrames?.[0]?.url ||
    current?.coverUrl;

  const segments: Array<any> = current?.segments || [];
  const videoUrl = current?.url;

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* Full Width Video Area - No Overlap */}
        <View style={{ width: screenWidth, height: screenWidth * 1.2, backgroundColor: '#000' }}>
          {videoUrl ? (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setPaused(!paused)}
              className="w-full h-full justify-center items-center"
            >
              <Video
                source={{ uri: videoUrl }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="contain"
                paused={paused}
                repeat={true}
              />
              {paused && (
                <View className="absolute inset-0 justify-center items-center bg-black/20">
                  <View className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md items-center justify-center border border-white/30">
                    <Feather name="play" size={28} color="white" style={{ marginLeft: 3 }} />
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ) : coverUrl ? (
            <Image
              source={{ uri: coverUrl }}
              className="w-full h-full"
              resizeMode="contain"
            />
          ) : null}
        </View>

        {/* Content Body - Starts Below Video */}
        <View className="px-5 pt-6">

          {/* Header Info */}
          <View className="mb-6 border-b border-grey0/5 pb-6">
            <Text className="text-xl font-bold text-grey0 mb-2 leading-tight">
              {current?.commodity?.name || current?.description || '未命名项目'}
            </Text>

            {current?.commodity?.tags?.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mt-3">
                {current.commodity.tags.map((tag: string, i: number) => (
                  <Text key={i} className="text-xs text-grey1 bg-grey5 px-2 py-1 rounded">#{tag}</Text>
                ))}
              </View>
            )}
          </View>

          {/* Timeline Section */}
          {segments.length > 0 && (
            <View>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-base font-bold text-grey0">分镜详情</Text>
                <Text className="text-xs text-grey2">{segments.length} 个镜头</Text>
              </View>

              <View className="ml-2 relative">
                {/* Vertical Line */}
                <View
                  className="absolute left-[7px] top-2 bottom-4 w-[1px] bg-grey0/10"
                />

                {segments.map((seg, idx) => {
                  const frames = seg?.highlightFrames || [];
                  return (
                    <View key={idx} className="flex-row mb-10 last:mb-0">
                      {/* Dot */}
                      <View className="mr-4 pt-1.5 relative z-10">
                        <View className="w-4 h-4 bg-background border border-primary rounded-full items-center justify-center">
                          <View className="w-1.5 h-1.5 bg-primary rounded-full" />
                        </View>
                      </View>

                      {/* Content */}
                      <View className="flex-1 bg-plain p-3 rounded-lg border border-grey0/5">
                        <View className="flex-row justify-between mb-2">
                          <Text className="text-sm font-bold text-primary">{seg.timeStart || 0}s - {seg.timeEnd}s</Text>
                          <Text className="text-[10px] text-grey3 font-mono">#{idx + 1}</Text>
                        </View>

                        {!!seg?.description && (
                          <Text className="text-xs text-grey0 leading-5 mb-2">
                            {seg.description}
                          </Text>
                        )}

                        {!!(seg?.voiceover || seg?.subtitle) && (
                          <View className="bg-background p-2 rounded mb-2">
                            <Text className="text-[10px] text-grey2 italic">
                              "{seg?.voiceover || seg?.subtitle}"
                            </Text>
                          </View>
                        )}

                        {frames.length > 0 && (
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-1">
                            {frames.map((f: any, i: number) => (
                              <TouchableOpacity
                                key={i}
                                onPress={() => {
                                  setPreviewImages(frames);
                                  setPreviewIndex(i);
                                }}
                                className="mr-2 rounded overflow-hidden"
                              >
                                <Image source={{ uri: f.url }} className="w-16 h-10 bg-grey5" resizeMode="cover" />
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        )}
                      </View>
                    </View>
                  )
                })}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <ImagePreview
        images={previewImages}
        initialIndex={previewIndex}
        visible={previewImages.length > 0}
        onClose={() => setPreviewImages([])}
        onIndexChange={(index) => setPreviewIndex(index)}
      />
    </View>
  );
};

export default Template;
