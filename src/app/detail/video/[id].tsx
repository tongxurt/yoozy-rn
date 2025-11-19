import { View, Text, Image, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import useTailwindVars from "@/hooks/useTailwindVars";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import ExpandableText from "@/components/ui/ExpandableText";

const Inspiration = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

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

  const title =
    current?.root?.commodity?.name ||
    current?.description ||
    current?.contentStyle ||
    "";

  const tags: string[] =
    current?.commodity?.tags ||
    current?.root?.commodity?.tags ||
    current?.tags ||
    current?.typedTags?.text ||
    [];

  // 视频详情含 segments（分段）
  const segments: Array<any> = current?.segments || [];

  return (
    <>
      <ScrollView
        className="flex-1 bg-background"
        showsVerticalScrollIndicator={false}
      >
        {/* 封面 */}
        {coverUrl && (
          <Image
            source={{ uri: coverUrl }}
            className="w-full aspect-[9/12]"
            resizeMode="cover"
          />
        )}

        <View className="px-4 py-4 gap-3">
          {/* 标题 / 商品名 */}
          <Text className="text-white text-lg font-semibold">
            {title || "视频详情"}
          </Text>

          {/* 标签 */}
          {!!tags?.length && (
            <View className="flex-row flex-wrap gap-2 mt-1">
              {tags.slice(0, 16).map((t, i) => (
                <View
                  key={`${t}-${i}`}
                  className="px-2 py-1 rounded-full bg-white/10"
                  style={{ borderColor: "#333333", borderWidth: 0.5 }}
                >
                  <Text className="text-xs text-white/80">{t}</Text>
                </View>
              ))}
            </View>
          )}

          {/* 分段区域 */}
          {!!segments?.length && (
            <View className="mt-2 gap-5">
              {segments.map((seg, idx) => {
                const frames: Array<{ url: string; desc?: string }> =
                  seg?.highlightFrames || [];
                return (
                  <View key={idx} className="gap-2">
                    {!!seg?.subtitle && (
                      <Text className="text-white font-semibold">
                        {seg.subtitle}
                      </Text>
                    )}
                    {!!seg?.description && (
                      <ExpandableText
                        content={seg.description}
                        maxLength={140}
                        className="text-sm text-white/80"
                      />
                    )}
                    <View className="gap-2">
                      {!!seg?.sceneStyle && (
                        <View className="gap-1">
                          <Text className="text-white font-medium">
                            场景风格
                          </Text>
                          <Text className="text-sm text-white/80">
                            {seg.sceneStyle}
                          </Text>
                        </View>
                      )}
                      {!!seg?.contentStyle && (
                        <View className="gap-1">
                          <Text className="text-white font-medium">
                            内容风格
                          </Text>
                          <Text className="text-sm text-white/80">
                            {seg.contentStyle}
                          </Text>
                        </View>
                      )}
                      {!!seg?.shootingStyle && (
                        <View className="gap-1">
                          <Text className="text-white font-medium">
                            拍摄说明
                          </Text>
                          <ExpandableText
                            content={seg.shootingStyle}
                            maxLength={160}
                            className="text-sm text-white/80"
                          />
                        </View>
                      )}
                    </View>

                    {!!frames?.length && (
                      <View className="mt-2">
                        <Text className="text-white font-semibold mb-2">
                          关键帧
                        </Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                        >
                          <View className="flex-row gap-3">
                            {frames.map((f, i) => (
                              <View key={`${f.url}-${i}`} className="w-40">
                                <Image
                                  source={{ uri: f.url }}
                                  className="w-40 h-40 rounded-lg"
                                  resizeMode="cover"
                                />
                                {!!f.desc && (
                                  <Text
                                    className="text-xs text-white/70 mt-1"
                                    numberOfLines={2}
                                  >
                                    {f.desc}
                                  </Text>
                                )}
                              </View>
                            ))}
                          </View>
                        </ScrollView>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
};

export default Inspiration;
