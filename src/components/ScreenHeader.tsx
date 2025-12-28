import CreditEntry from "@/components/CreditEntry";
import useTailwindVars from "@/hooks/useTailwindVars";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ScreenHeaderProps {
    title?: string;
    closeable?: boolean;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title = "", closeable = true }) => {
    const { colors } = useTailwindVars();

    return (
        <View className={"px-5 pb-4 flex-row justify-between items-center"}>
            <Text className="text-[22px] font-bold" style={{ color: colors.foreground }}>{title}</Text>
            <View className={"flex-row items-center gap-2"}>
                <CreditEntry />
                {
                    closeable && (
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={{ width: 32, height: 32, justifyContent: "center", alignItems: "center" }}
                        >
                            <MaterialCommunityIcons name="arrow-collapse" size={25} color={colors.foreground} />
                        </TouchableOpacity>
                    )
                }
            </View>
        </View>
    );
};
