import InspirationList from "@/app/inspiration/list";
import TemplateList from "@/app/template/list";
import useTailwindVars from "@/hooks/useTailwindVars";
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
    <View className="flex-1 bg-background">
      {/* Premium Header Area - Clean & Spacious */}

      {/* Minimalist Tab Bar */}
      <View className="flex-row items-baseline px-5 gap-8 border-b border-white/5 pb-0">
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
                className={`text-base tracking-wide ${isActive ? "text-primary font-bold" : "text-grey2 font-medium"}`}
                style={{ fontSize: isActive ? 18 : 16 }}
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

      {/* Content Area */}
      <View className="flex-1">
        {activeTab === "video" ? (
          <TemplateList />
        ) : (
          <InspirationList />
        )}
      </View>
    </View>
  );
}
