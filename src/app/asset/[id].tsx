import { getAsset } from "@/api/asset";
import ScreenContainer from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import { workflowConfig } from "@/consts";
import useTailwindVars from "@/hooks/useTailwindVars";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React from "react";

const AssetEditorScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { colors } = useTailwindVars();

    const { data: d, isLoading, refetch } = useQuery({
        queryKey: ["asset", id],
        queryFn: () => getAsset({ id: id! }),
        enabled: !!id,
        refetchInterval: 5000,
    });

    const asset = d?.data?.data;


    return (
        <ScreenContainer>
            <ScreenHeader title={workflowConfig[asset?.workflow?.name]?.label} />

        </ScreenContainer>
    );
};

export default AssetEditorScreen;