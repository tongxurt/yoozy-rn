import { getAsset } from "@/api/asset";
import { replaceWorkflow } from "@/api/workflow";
import ScreenContainer from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import { assetWorkflowJobConfig, workflowConfig } from "@/consts";
import useTailwindVars from "@/hooks/useTailwindVars";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
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
    const [videoPreview, setVideoPreview] = React.useState<string | null>(null);


    const { data: d, isLoading, refetch } = useQuery({
        queryKey: ["asset", id],
        queryFn: () => getAsset({ id: id! }),
        enabled: !!id,
        refetchInterval: 5000,
    });


    const { asset, pages, maxEnabledPage } = useMemo(() => {
        const asset = d?.data?.data;
        const pages = asset?.workflow?.jobs;

        const currentJobIndex = pages?.findIndex((x: any) => x.status === "confirming" || x.status === "running");
        const maxEnabledPage = currentJobIndex === -1 ? pages.length - 1 : currentJobIndex;

        return { asset, pages, maxEnabledPage };
    }, [d]);

    const handleConfirm = (job: any) => {
        Alert.alert(
            "确认结果",
            "确认当前生成结果并继续下一步？",
            [
                { text: "取消", style: "cancel" },
                {
                    text: "确认",
                    onPress: async () => {
                        try {
                            const currentWorkflow = asset?.workflow;
                            if (!currentWorkflow) return;

                            const newWorkflow = {
                                ...currentWorkflow,
                                jobs: currentWorkflow?.jobs.map((x: any) => {
                                    if (x.index === job.index) {
                                        return { ...x, status: "completed" };
                                    }
                                    return x;
                                }),
                            };

                            console.log(newWorkflow);

                            await replaceWorkflow(newWorkflow);
                            refetch();
                        } catch (e) {
                            Alert.alert("Error", "提交失败，请重试");
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader title={workflowConfig[asset?.workflow?.name]?.label} />
            <Text>{maxEnabledPage}</Text>
            <PagerView
                ref={pagerRef}
                style={{ flex: 1 }}
                initialPage={maxEnabledPage}
                onPageSelected={(e) => setActiveTabIndex(e.nativeEvent.position)}
            >
                {
                    pages?.map((job: any, index: number) => {
                        return (
                            <View key={index} className="bg-card m-5 rounded-2xl">
                                {job.name === 'videoGenerationJob' && <VideoGenerationJob index={index} job={job} asset={asset} refetch={refetch} />}
                                {job.name === 'segmentScriptJob' && <SegmentScriptJob index={index} job={job} asset={asset} refetch={refetch} />}

                                {
                                    job.status === 'confirming' && (
                                        <TouchableOpacity
                                            onPress={() => handleConfirm(job)}
                                            className="absolute bottom-5 right-5"
                                        >
                                            <Text className="text-white bg-primary px-5 py-2 rounded-full">确认</Text>
                                        </TouchableOpacity>
                                    )
                                }
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