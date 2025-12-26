import ScreenContainer from "@/components/ScreenContainer";
import useTailwindVars from "@/hooks/useTailwindVars";
import React from "react";
import { Text } from "react-native";

export default function MyScreen() {

  const { colors } = useTailwindVars();

  return (
    <ScreenContainer>
      <Text>record</Text>
      {/* <AssetList /> */}
    </ScreenContainer>
  );
}
