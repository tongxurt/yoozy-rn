import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "@/i18n/translation";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/uesColors";
import { router } from "expo-router";
import AuthInfo from "@/components/AuthInfo";
import CreditEntry from "@/components/CreditEntry";

// 功能项配置
const FEATURE_ITEMS = [
  {
    id: "generate-video",
    icon: "play",
    sparkle: true,
    title: "输入灵感, 智能生视频",
    route: "/session/starter",
  },
  {
    id: "ai-design",
    icon: "apps",
    sparkle: true,
    title: "AI 图片设计",
    route: "/ai-design",
    badge: "限时免费",
  },
  {
    id: "smooth-transition",
    icon: "videocam",
    sparkle: true,
    title: "一镜到底, 丝滑转场",
    route: "/transition",
  },
  {
    id: "photo-talk",
    icon: "chatbubble-ellipses",
    title: "照片会说话",
    route: "/photo-talk",
  },
  {
    id: "digital-human",
    icon: "person",
    title: "数字人讲解",
    route: "/digital-human",
  },
  {
    id: "change-background",
    icon: "grid",
    title: "智能换背景",
    route: "/change-background",
  },
];

// 功能项组件
function FeatureItem({
  item,
  onPress,
}: {
  item: (typeof FEATURE_ITEMS)[0];
  onPress: () => void;
}) {
  return (
    <View className={"px-5"}>
      <TouchableOpacity
        onPress={onPress}
        className={"mb-3"}
        activeOpacity={0.8}
      >
        <View
          className={
            "flex-row items-center bg-background rounded-full px-4 py-3 self-start"
          }
        >
          <View className={"bg-primary/20 rounded-full p-2 mr-3"}>
            <Ionicons name={item.icon as any} size={13} color="#A855F7" />
          </View>
          {item.sparkle && (
            <Ionicons
              name="sparkles"
              size={14}
              color="#A855F7"
              style={{ marginRight: 6 }}
            />
          )}
          <Text className={"text-white text-base"}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function Screen() {
  const { t } = useTranslation();
  const colors = useColors();

  const handleFeaturePress = (route: string) => {
    router.navigate(route as any);
  };

  const handleCreate = () => {
    router.navigate(`/session/starter`);
  };

  return (
    <View className={"flex-1"}>
      {/* 顶部标题栏 */}
      <View className={"px-5 pb-4 flex-row justify-between items-center"}>
        <Text className={"text-[22px] text-white font-bold"}>创作</Text>
        <View className={"flex-row items-center gap-2"}>
          <CreditEntry />
          <AuthInfo />
        </View>
      </View>

      {/*<AIBanner/>*/}
      {/*<HotFeatureCard onPress={handleCreate}/>*/}

      <View className={"flex-1 justify-end"}>
        <View className={"mb-4"}>
          {FEATURE_ITEMS.map((item) => (
            <FeatureItem
              key={item.id}
              item={item}
              onPress={() => handleFeaturePress(item.route)}
            />
          ))}
        </View>
      </View>

      {/* 底部输入栏 - 新风格 */}
      <View className={"px-5 pb-6 pt-2"}>
        <View
          className={
            "bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-1"
          }
        >
          <TouchableOpacity
            onPress={handleCreate}
            className={
              "bg-background0/80 rounded-xl p-4 flex-row items-center justify-between"
            }
            activeOpacity={0.8}
            style={{
              shadowColor: "#A855F7",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <View className={"flex-row items-center flex-1"}>
              <View className={"bg-primary/30 rounded-full p-2 mr-3"}>
                <Ionicons name="sparkles" size={18} color="#A855F7" />
              </View>
              <View className={"flex-1"}>
                <Text className={"text-white text-sm mb-0.5"}>开始创作</Text>
                <Text className={"text-white/50 text-xs"}>
                  输入灵感, 智能生视频
                </Text>
              </View>
            </View>
            <View className={"bg-primary rounded-full p-3 ml-3"}>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
