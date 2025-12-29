import { getAsset } from "@/api/asset";
import ScreenContainer from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import { assetWorkflowJobConfig, workflowConfig } from "@/consts";
import useTailwindVars from "@/hooks/useTailwindVars";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SegmentScriptJob from "./SegmentScriptJob";
import VideoGenerationJob from "./VideoGenerationJob";

const AssetEditorScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { colors } = useTailwindVars();
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const pagerRef = useRef<PagerView>(null);
    const insets = useSafeAreaInsets();

    const { data: d, isLoading, refetch } = useQuery({
        queryKey: ["asset", id],
        queryFn: () => getAsset({ id: id! }),
        enabled: !!id,
        refetchInterval: 5000,
    });

    const asset = d?.data?.data;
    const pages = asset?.workflow?.jobs;

    return (
        <ScreenContainer>
            <ScreenHeader title={workflowConfig[asset?.workflow?.name]?.label} />

            <PagerView
                ref={pagerRef}
                style={{ flex: 1 }}
                initialPage={0}
                onPageSelected={(e) => setActiveTabIndex(e.nativeEvent.position)}
            >
                {
                    pages?.map((job: any, index: number) => {
                        return (
                            <View key={index} className="flex-1 items-center justify-center bg-card m-5 rounded-2xl p-5">
                                {/* <Text>{JSON.stringify(asset)}</Text> */}
                                {job.name === 'videoGenerationJob' && <VideoGenerationJob job={job} asset={asset} refetch={refetch} />}
                                {job.name === 'segmentScriptJob' && <SegmentScriptJob job={job} asset={asset} refetch={refetch} />}
                            </View>
                        );
                    })
                }
            </PagerView>

            <View
                className="flex-row items-center justify-center gap-8"
            >
                {
                    pages?.map((job: any, index: number) => {
                        const isActive = index === activeTabIndex;
                        const config = assetWorkflowJobConfig[job.name];

                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => pagerRef.current?.setPage(index)}
                                className={`flex-col gap-2 items-center justify-center}`}
                            >
                                <View className={`rounded-full px-5 py-2 bg-card ${isActive ? 'bg-primary/20 border-primary/30 border' : ''}`}>
                                    {config?.icon(colors.primary)}
                                </View>
                                <Text className={`text-xs font-bold ${isActive ? 'text-black' : 'text-gray-400'}`}>
                                    {config?.label || job.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })
                }
            </View>
        </ScreenContainer>
    );
};

export default AssetEditorScreen;