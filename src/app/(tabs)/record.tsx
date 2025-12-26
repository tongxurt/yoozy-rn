import ScreenContainer from "@/components/ScreenContainer";
import useTailwindVars from "@/hooks/useTailwindVars";
import React from "react";
import AssetList from "../asset/list";

export default function MyScreen() {

  const { colors } = useTailwindVars();

  return (
    <ScreenContainer edges={['top']} stackScreenProps={{ headerTitle: "记录", headerShown: true }}>
      <AssetList />
    </ScreenContainer>
  );
}
