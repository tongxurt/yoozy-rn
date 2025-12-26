import ScreenContainer from "@/components/ScreenContainer";
import useTailwindVars from "@/hooks/useTailwindVars";
import React from "react";
import { Text, View } from "react-native";
import AssetList from "../asset/list";

export default function MyScreen() {

  const { colors } = useTailwindVars();

  return (
    <ScreenContainer edges={['top']} stackScreenProps={{}}>
      <View className={"px-5 pb-4 flex-row justify-between items-center"}>
        <Text className={"text-[22px] text-white font-bold"}>记录</Text>
      </View>
      <AssetList />
    </ScreenContainer>
  );
}
