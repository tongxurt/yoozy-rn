import InspirationList from "@/app/inspiration/list";
import TemplateList from "@/app/template/list";
import ScreenContainer from "@/components/ScreenContainer";
import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View
} from "react-native";

type TabType = "video" | "inspiration";
const tabList: { id: number; name: string; value: TabType }[] = [
  // {
  //   id: 0,
  //   name: "视频库",
  //   value: "video",
  // },
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


      <View className={"px-5 pb-4 flex-row justify-between items-center"}>
            <Text className="text-[22px] font-bold" style={{ color: colors.foreground }}>{'灵感库'}</Text>
            <View className={"flex-row items-center gap-5"}>
            <TouchableOpacity onPress={() => router.push('/search')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="search" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.navigate('/user/my')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <FontAwesome5 name="user-circle" size={20} color={colors.foreground} />
          </TouchableOpacity>
            </View>
        </View>

      {/* Content Area */}
      <View className="flex-1">
          <InspirationList />
      </View>
    </ScreenContainer>
  );
}
