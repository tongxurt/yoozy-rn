import InspirationList from "@/app/inspiration/list";
import TemplateList from "@/app/template/list";
import ScreenContainer from "@/components/ScreenContainer";
import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View
} from "react-native";

type TabType = "video" | "inspiration";
const tabList: { id: number; name: string; value: TabType }[] = [
  {
    id: 0,
    name: "视频库",
    value: "video",
  },
  {
    id: 1,
    name: "灵感库",
    value: "inspiration",
  },
];


export default function HomeScreen() {
  const { colors } = useTailwindVars();
  const [activeTab, setActiveTab] = useState<TabType>(tabList[0].value);


  return (
    <ScreenContainer edges={['top']} >
      {/* Premium Header Area - Clean & Spacious */}

      {/* Minimalist Tab Bar with Search */}
      <View className="flex-row items-center justify-between px-5 border-b0 h-10">

        {/* Left Spacer to balance layout */}
        <View className="flex-1" />

        {/* Centered Tabs */}
        <View className="flex-row items-center justify-center gap-8">
          {tabList.map((item, index) => {
            const isActive = activeTab === item.value;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setActiveTab(item.value)}
                className="pb-3 relative"
                activeOpacity={0.8}
              >
                <Text
                  className={`text-base tracking-wide ${isActive ? "font-bold" : "text-muted-foreground font-medium"}`}
                  style={{ fontSize: isActive ? 16 : 16 }}
                >
                  {item.name}
                </Text>

                {/* Active Indicator Dot/Line */}
                {isActive && (
                  <View
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-sm"
                    style={{
                      shadowColor: colors.primary,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.5,
                      shadowRadius: 4,
                    }}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Right Search Entry */}
        <View className="flex-1 items-end">
          <TouchableOpacity onPress={() => router.push('/search')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="search" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Area */}
      <View className="flex-1">
        {activeTab === "video" ? (
          <TemplateList query={""} />
        ) : (
          <InspirationList />
        )}
      </View>
    </ScreenContainer>
  );
}
