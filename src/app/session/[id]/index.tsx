import { router, useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import useTailwindVars from "@/hooks/useTailwindVars";
import { useQuery } from "@tanstack/react-query";
import { fetchSession, updateSessionStatus } from "@/api/session";
import React, { useEffect, useMemo, useState } from "react";
import CommodityView from "@/app/session/CommodityView";
import CommoditySellingPointsView from "@/app/session/[id]/CommoditySellingPointsView";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import TemplateSelectingView from "@/app/session/[id]/TemplateSelectingView";
import ScriptGenerateView from "@/app/session/[id]/ScriptGenerateView";
import { SessionSkeleton } from "@/app/session/[id]/SessionSkeleton";

const Session = () => {
  const { id } = useLocalSearchParams();

  const { colors } = useTailwindVars();

  const tabs = [
    {
      index: 1,
      title: "分析理解",
      icon: (color: string) => (
        <MaterialCommunityIcons name="brain" size={20} color={color} />
      ),
    },
    {
      index: 2,
      title: "选择模板",
      icon: (color: string) => (
        <FontAwesome name="lightbulb-o" size={20} color={color} />
      ),
    },
    {
      index: 3,
      title: "视频生成",
      icon: (color: string) => (
        <Ionicons name="videocam" size={20} color={color} />
      ),
    },
  ];

  const {
    data: ur,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["session"],
    queryFn: () => fetchSession({ id: id as string }),
    refetchInterval: 1000,
  });
  const session = useMemo(() => ur?.data?.data, [ur]);

  const realTab = useMemo(() => {
    const status = ur?.data?.data?.status as string;
    if (status?.startsWith("commodity")) {
      return 1;
    }
    if (status?.startsWith("hotTemplate")) {
      return 2;
    }
    if (status?.startsWith("script")) {
      return 3;
    }
    return 1;
  }, [ur]);

  useEffect(() => {
    setTab(realTab);
  }, [realTab]);

  const [tab, setTab] = useState(realTab);

  const updateStatus = ({ id, status }: { id: string; status: string }) => {
    updateSessionStatus({ id, status }).then(() => {
      void refetch();
    });
  };

  const handleTabChange = (index: number) => {
    if (realTab >= index) {
      setTab(index);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* 顶部 Tab 导航栏 */}
      <View className="bg-plain border-b border-white/5 px-5 pt-4 pb-2">
        <View className="flex-row justify-around">
          {tabs?.map((x, index) => {
            const isActive = x.index === tab;
            const isAvailable = realTab >= x.index;
            const isCompleted = realTab > x.index;

            return (
              <TouchableOpacity
                key={index}
                activeOpacity={isAvailable ? 0.7 : 1}
                disabled={!isAvailable}
                onPress={() => handleTabChange(x.index)}
                className="items-center pb-2"
              >
                <View className="flex-row items-center gap-2">
                  {isCompleted ? (
                    <Feather
                      name="check-circle"
                      size={18}
                      color={colors.primary}
                    />
                  ) : (
                    x.icon(
                      isActive
                        ? colors.primary
                        : isAvailable
                        ? colors.white
                        : colors.grey2
                    )
                  )}
                  <Text
                    className={`text-sm font-semibold ${
                      isActive
                        ? "text-primary"
                        : isAvailable
                        ? "text-white"
                        : "text-grey2"
                    }`}
                  >
                    {x.title}
                  </Text>
                </View>
                {/* 底部指示线 */}
                {isActive && (
                  <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View className="flex-1">
        {isLoading ? (
          <SessionSkeleton tab={tab} />
        ) : (
          <>
            {tab === 1 && (
              <View className="flex-1">
                <ScrollView
                  className="flex-1"
                  showsVerticalScrollIndicator={false}
                  contentContainerClassName="px-5 pt-3 pb-4"
                >
                  <View className="gap-5">
                    <View className="bg-plain rounded-2xl p-3.5 flex-row items-center gap-3">
                      <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
                        <MaterialCommunityIcons
                          name="brain"
                          size={20}
                          color={colors.primary}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-sm font-semibold mb-0.5">
                          智能分析中
                        </Text>
                        <Text className="text-white/70 text-xs">
                          正在为您处理商品关键信息
                        </Text>
                      </View>
                    </View>
                    <View className="bg-plain rounded-2xl p-3.5 gap-5">
                      <CommodityView data={session} />
                      <CommoditySellingPointsView data={session} />
                    </View>
                  </View>
                </ScrollView>
                {session?.status === "commoditySellingPointsSelected" && (
                  <View className="px-5 pb-5 pt-3">
                    <TouchableOpacity
                      onPress={() => {
                        updateStatus({
                          id: id as string,
                          status: "hotTemplateSelecting",
                        });
                      }}
                      className="bg-primary rounded-2xl py-4 px-6 flex-row items-center justify-center gap-2"
                      activeOpacity={0.8}
                    >
                      <Text className="text-white font-semibold text-base">
                        进入下一步
                      </Text>
                      <Feather
                        name="arrow-right"
                        size={18}
                        color={colors.white}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {tab === 2 && (
              <View className="flex-1">
                <ScrollView
                  className="flex-1"
                  showsVerticalScrollIndicator={false}
                  contentContainerClassName="px-5 pt-3 pb-4"
                >
                  <View className="gap-3">
                    <View className="bg-plain rounded-2xl p-3.5 flex-row items-center gap-3">
                      <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
                        <FontAwesome
                          name="lightbulb-o"
                          size={20}
                          color={colors.primary}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-sm font-semibold mb-0.5">
                          模板推荐
                        </Text>
                        <Text className="text-white/70 text-xs">
                          基于抖音热门趋势为您精选
                        </Text>
                      </View>
                    </View>
                    <TemplateSelectingView data={session} />
                  </View>
                </ScrollView>
                {session?.status === "hotTemplateSelected" && (
                  <View className="px-5 pb-5 pt-3">
                    <TouchableOpacity
                      onPress={() => {
                        updateStatus({
                          id: id as string,
                          status: "scriptGenerating",
                        });
                      }}
                      className="bg-primary rounded-2xl py-4 px-6 flex-row items-center justify-center gap-2"
                      activeOpacity={0.8}
                    >
                      <Text className="text-white font-semibold text-base">
                        开始生成视频
                      </Text>
                      <Feather
                        name="arrow-right"
                        size={18}
                        color={colors.white}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {tab === 3 && (
              <View className="flex-1 px-5 pt-4">
                <ScriptGenerateView
                  data={session}
                  onReload={() => void refetch()}
                />
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default Session;
