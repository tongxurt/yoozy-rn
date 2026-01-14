import { getAsset } from "@/api/asset";
import { backWorkflowJob, confirmWorkflowJob, retryWorkflowJob } from "@/api/workflow";

import ScreenContainer from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import { assetWorkflowJobConfig, workflowConfig } from "@/consts";
import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import PagerView from "react-native-pager-view";
import KeyFramesGenerationJob from "./KeyFramesGenerationJob";
import SegmentScriptJob from "./SegmentScriptJob";
import VideoGenerationJob from "./VideoGenerationJob";
import VideoSegmentsGenerationJob from "./VideoSegmentsGenerationJob";

const AssetEditorScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { colors } = useTailwindVars();

    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const pagerRef = useRef<PagerView>(null);


    const [jobSelections, setJobSelections] = useState<Record<number, any>>({});


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

    const handleConfirm = useCallback((job: any) => {
        Alert.alert(
            "确认结果",
            "确认当前生成结果并继续下一步吗？",
            [
                { text: "取消", style: "cancel" },
                {
                    text: "确认",
                    onPress: async () => {
                        try {
                            await confirmWorkflowJob({
                                id: asset.workflow._id,
                                index: job.index,
                            });
                            refetch();
                        } catch (e) {
                            Alert.alert("Error", "提交失败，请重试");
                        }
                    },
                },
            ]
        );
    }, [asset?.workflow?._id, refetch]);

    const handleRetry = useCallback((job: any) => {
        Alert.alert(
            "确认重新执行当前任务？",
            "当前步骤以及后续步骤的所有任务数据将被清除，重新执行将生成新的数据。",
            [
                { text: "取消", style: "cancel" },
                {
                    text: "确认",
                    onPress: async () => {
                        try {
                            await retryWorkflowJob({
                                id: asset?.workflow?._id,
                                index: job.index,
                            });
                            refetch();
                        } catch (e) {
                            Alert.alert("Error", "重新执行失败，请重试");
                        }
                    },
                },
            ]
        );
    }, [asset?.workflow?._id, refetch]);

    const handleBack = useCallback((job: any) => {
        Alert.alert(
            "确认回到上一步吗？",
            "当前步骤的所有任务数据将被清除",
            [
                { text: "取消", style: "cancel" },
                {
                    text: "确认",
                    onPress: async () => {
                        try {
                            await backWorkflowJob({
                                id: asset?.workflow?._id,
                                index: job.index,
                            });
                            refetch();
                        } catch (e) {
                            Alert.alert("Error", "回到上一步失败，请重试");
                        }
                    },
                },
            ]
        );
    }, [asset?.workflow?._id, refetch]);

    return (
        <ScreenContainer>
            <ScreenHeader title={workflowConfig[asset?.workflow?.name]?.label || "任务详情"} />
            <PagerView
                ref={pagerRef}
                style={{ flex: 1 }}
                initialPage={maxEnabledPage}
                scrollEnabled={true}
                onPageScroll={(e) => {
                    const position = e.nativeEvent.position;
                    // Prevent scrolling beyond maxEnabledPage
                    if (position >= maxEnabledPage && e.nativeEvent.offset > 0) {
                        pagerRef.current?.setPage(maxEnabledPage);
                    }
                }}
                onPageSelected={(e) => {
                    if (e.nativeEvent.position > maxEnabledPage) {
                        pagerRef.current?.setPage(maxEnabledPage);
                    } else {
                        setActiveTabIndex(e.nativeEvent.position);
                    }
                }}
            >
                {
                    pages?.map((job: any, index: number) => {
                        return (
                            <View key={index} className="bg-card m-5 flex-1 overflow-hidden rounded-[24px] border border-gray-100">
                                <View className="flex-1">
                                    {/* {
                                        job.status === 'running' && (
                                            <View className="w-full h-full items-center justify-center gap-2 bg-primary/20">
                                                <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center">
                                                    <ActivityIndicator size="small" color={colors.primary} />
                                                </View>
                                                <Text className="text-primary text-sm font-bold tracking-wide">创作进行中</Text>
                                            </View>
                                        )
                                    } */}

                                                {job.name === 'videoGenerationJob' && <VideoGenerationJob index={index} job={job} asset={asset} refetch={refetch} />}
                                                {job.name === 'keyFramesGenerationJob' && <KeyFramesGenerationJob index={index} job={job} asset={asset} refetch={refetch} />}
                                                {job.name === 'segmentScriptJob' && <SegmentScriptJob index={index} job={job} asset={asset} refetch={refetch} />}
                                                {job.name === 'videoSegmentsGenerationJob' && (
                                                    <VideoSegmentsGenerationJob
                                                        index={index}
                                                        job={job}
                                                        asset={asset}
                                                        refetch={refetch}
                                                        selectedItem={jobSelections[index]}
                                                        onSelect={(item: any) => setJobSelections(prev => ({ ...prev, [index]: item }))}
                                                    />
                                                )}
                                </View>
                                {
                                    job.status === 'confirming' && (
                                        <View className="p-4 flex-row items-center justify-end gap-3 bg-white border-t border-gray-100">
                                            {job.index > 0 && (
                                                <TouchableOpacity
                                                    onPress={() => handleBack(job)}
                                                    className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-200"
                                                >
                                                    <Feather name="arrow-left" size={16} color="#6b7280" />
                                                </TouchableOpacity>
                                            )}

                                            <TouchableOpacity
                                                onPress={() => handleRetry(job)}
                                                className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-200"
                                            >
                                                <Feather name="refresh-ccw" size={16} color="#6b7280" />
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={() => handleConfirm(job)}
                                                className="h-10 px-5 bg-primary rounded-full flex-row items-center justify-center shadow-sm shadow-primary/30"
                                            >
                                                <Feather name="check" size={16} color="white" style={{ marginRight: 6 }} />
                                                <Text className="text-white font-bold text-sm">{activeTabIndex === pages.length - 1 ? '点击完成' : '点击进入下一步'}</Text>
                                            </TouchableOpacity>
                                        </View>
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
                        const isDisabled = index > maxEnabledPage;

                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => {
                                    if (!isDisabled) {
                                        pagerRef.current?.setPage(index);
                                    }
                                }}
                                disabled={isDisabled}
                                className={`flex-col gap-2 items-center justify-center}`}
                            >
                                <View className={`rounded-full px-5 py-2 bg-card ${isActive ? 'bg-primary/20 border-primary/30 border' : ''} ${isDisabled ? 'opacity-50' : ''}`}>
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