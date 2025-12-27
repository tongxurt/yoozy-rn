import { getAsset } from "@/api/asset";
import { replaceWorkflow } from "@/api/workflow";
import ScreenContainer from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import ModalVideoPlayer from "@/components/VideoPlayer";
import XImageViewer from "@/components/XImageViewer";
import { assetWorkflowJobConfig } from "@/consts";
import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { ResizeMode, Video } from "expo-av";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

const AssetEditorScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { colors } = useTailwindVars();
    const [editingScript, setEditingScript] = React.useState(false);
    const [scriptValue, setScriptValue] = React.useState('');
    const [updatingScript, setUpdatingScript] = React.useState(false);
    const [videoPreview, setVideoPreview] = React.useState<string | null>(null);

    const { data: asset, isLoading, refetch } = useQuery({
        queryKey: ["asset", id],
        queryFn: () => getAsset({ id: id! }),
        enabled: !!id,
        refetchInterval: 5000,
    });

    const handleConfirm = (index: number) => {
        Alert.alert(
            "确认结果",
            "确认当前生成结果并继续下一步？",
            [
                { text: "取消", style: "cancel" },
                {
                    text: "确认",
                    onPress: async () => {
                        try {
                            const currentWorkflow = asset?.data?.data?.workflow;
                            if (!currentWorkflow) return;

                            const newWorkflow = {
                                ...currentWorkflow,
                                jobs: currentWorkflow?.jobs.map((job: any) => {
                                    if (job.index === index) {
                                        return { ...job, status: "completed" };
                                    }
                                    return job;
                                }),
                            };
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

    const handleRetry = (index: number, dataKey: string) => {
        Alert.alert(
            "确认重试",
            "确认重新执行当前任务？数据将被清空。",
            [
                { text: "取消", style: "cancel" },
                {
                    text: "确认",
                    onPress: async () => {
                        try {
                            const currentWorkflow = asset?.data?.data?.workflow;
                            if (!currentWorkflow) return;

                            const newWorkflow = {
                                ...currentWorkflow,
                                jobs: currentWorkflow?.jobs.map((job: any) => {
                                    if (job.index === index) {
                                        return { ...job, status: "running" };
                                    }
                                    return job;
                                }),
                                dataBus: {
                                    ...currentWorkflow.dataBus,
                                    [dataKey]: null,
                                },
                            };
                            await replaceWorkflow(newWorkflow);
                            refetch();
                        } catch (e) {
                            Alert.alert("Error", "重试提交失败");
                        }
                    },
                },
            ]
        );
    };

    const handleSaveScript = async (index: number) => {
        const currentWorkflow = asset?.data?.data?.workflow;
        if (!currentWorkflow) return;

        setUpdatingScript(true);
        try {
            const newWorkflow = {
                ...currentWorkflow,
                jobs: currentWorkflow.jobs.map((job: any) => {
                    if (job.index === index) {
                        return {
                            ...job,
                            dataBus: {
                                ...job.dataBus,
                                segmentScript: {
                                    script: scriptValue,
                                },
                            },
                        };
                    }
                    return job;
                }),
            };

            await replaceWorkflow(newWorkflow);
            setEditingScript(false);
            refetch();
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "脚本更新失败");
        } finally {
            setUpdatingScript(false);
        }
    };

    const renderJobData = (index: number, dataKey: string, data: any) => {
        if (!data && dataKey !== 'segmentScript') return null; // segmentScript can be empty if editing

        if (dataKey === "keyFrames") {
            if (!data?.frames) return null;
            const images = data.frames.map((frame: any) => frame.url)
            return (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 gap-3 py-2">
                    {data.frames?.map((frame: any, idx: number) => (
                        <View key={idx} className={`w-28 aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden ${idx !== 0 ? 'ml-2' : ''}`}>
                            <XImageViewer defaultIndex={idx} images={images}>
                                <Image source={{ uri: frame.url }} className="w-full h-full" resizeMode="cover" />
                            </XImageViewer>
                        </View>
                    ))}
                </ScrollView>
            );
        }

        if (dataKey === 'segmentScript') {
            const script = data?.script;

            if (!script && !editingScript) {
                return <Text className="text-gray-400 text-xs mt-2 italic">暂无脚本数据</Text>;
            }

            return (
                <View className="mt-4">
                    {!editingScript && (
                        <View className="mb-2 flex-row justify-end">
                            <TouchableOpacity
                                onPress={() => {
                                    setScriptValue(script || '');
                                    setEditingScript(true);
                                }}
                                className="flex-row items-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm"
                            >
                                <Feather name="edit-2" size={12} color="#6b7280" />
                                <Text className="text-xs text-gray-500 font-medium">编辑脚本</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {editingScript ? (
                        <View className="bg-white rounded-xl border border-primary/20 p-1">
                            <View className="bg-gray-50 p-2 flex-row justify-between items-center rounded-t-lg border-b border-gray-100">
                                <Text className="text-xs font-bold text-primary">Markdown 编辑</Text>
                                <View className="flex-row gap-2">
                                    <TouchableOpacity
                                        onPress={() => setEditingScript(false)}
                                        disabled={updatingScript}
                                        className="px-3 py-1 bg-gray-200 rounded-lg"
                                    >
                                        <Text className="text-xs text-gray-600">取消</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleSaveScript(index)}
                                        disabled={updatingScript}
                                        className="px-3 py-1 bg-primary rounded-lg flex-row items-center gap-1"
                                    >
                                        {updatingScript && <ActivityIndicator size="small" color="white" />}
                                        <Text className="text-xs text-white font-bold">保存</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <TextInput
                                value={scriptValue}
                                onChangeText={setScriptValue}
                                multiline
                                className="p-3 text-sm text-gray-800 leading-6 min-h-[200px]"
                                style={{ textAlignVertical: 'top' }}
                                placeholder="输入脚本内容..."
                            />
                        </View>
                    ) : (
                        <View className="bg-white p-4 rounded-xl border border-gray-100">
                            <Text className="text-sm text-gray-700 leading-6">{script}</Text>
                        </View>
                    )}
                </View>
            );
        }

        if (dataKey === "segmentsRemix") {
            if (data.url) {
                return (
                    <View className="mt-4 w-40 aspect-[9/16] bg-black rounded-lg overflow-hidden">
                        <Video
                            source={{ uri: data.url }}
                            style={{ width: "100%", height: "100%" }}
                            resizeMode={ResizeMode.COVER}
                            useNativeControls
                        />
                        <View className="absolute top-2 left-2 bg-black/50 rounded px-1.5 py-0.5">
                            <Text className="text-[10px] text-white font-medium">Result</Text>
                        </View>
                    </View>
                );
            }
            return null;
        }

        if (dataKey === "videoGenerations") {
            // ... existing implementation
            const images = data.map((item: any) => item.lastFrame).filter((url: string) => !!url);

            return (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 gap-3 py-2">
                    {data.map((item: any, index: number) => (
                        <View key={index} className={`w-36 aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 ${index !== 0 ? 'ml-2' : ''}`}>
                            {item.status === 'running' ? (
                                <View className="flex-1 items-center justify-center gap-2">
                                    <ActivityIndicator size="small" color={colors.primary} />
                                    <Text className="text-[10px] text-gray-400">生成中...</Text>
                                </View>
                            ) : item.status === 'completed' && item.lastFrame ? (
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    className="w-full h-full relative"
                                    onPress={() => setVideoPreview(item.url)}
                                >
                                    <Image source={{ uri: item.lastFrame }} className="w-full h-full" resizeMode="cover" />
                                    <View className="absolute inset-0 items-center justify-center bg-black/10">
                                        <Feather name="play-circle" size={24} color="white" />
                                    </View>
                                </TouchableOpacity>
                            ) : (
                                <View className="flex-1 items-center justify-center">
                                    <Text className="text-[10px] text-gray-300">Queuing</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>
            );
        }

        if (dataKey === 'videoFramesChanges' && Array.isArray(data)) {
            return (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 gap-4 py-2">
                    {data.map((item: any, index: number) => (
                        <View key={index} className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-3 w-[300px] ${index !== 0 ? 'ml-3' : ''}`}>
                            <View className="flex-row items-center gap-2 mb-3 pb-2 border-b border-gray-50">
                                <View className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                <Text className="text-xs font-bold text-gray-700">片段 #{index + 1}</Text>
                            </View>

                            <View className="flex-row gap-3">
                                {item.ref && (
                                    <View className="w-16">
                                        <Text className="text-[8px] text-gray-400 font-bold mb-1 uppercase">Ref</Text>
                                        <Image source={{ uri: item.ref }} className="w-full aspect-[9/16] rounded-lg bg-gray-50" resizeMode="cover" />
                                    </View>
                                )}

                                <View className="flex-1 flex-row items-center justify-between gap-2">
                                    <View>
                                        <Text className="text-[8px] text-gray-400 font-bold mb-1 uppercase">Original</Text>
                                        <View className="w-16 aspect-[9/16] bg-gray-50 rounded-lg overflow-hidden">
                                            <Image source={{ uri: item.firstFrame }} className="w-full h-full opacity-80" resizeMode="cover" />
                                        </View>
                                    </View>

                                    <Feather name="arrow-right" size={14} color="#d1d5db" />

                                    <View>
                                        <Text className="text-[8px] text-purple-500 font-bold mb-1 uppercase">AI Output</Text>
                                        <View className="w-16 aspect-[9/16] bg-purple-50 rounded-lg overflow-hidden border border-purple-100">
                                            <Image source={{ uri: item.newFirstFrame }} className="w-full h-full" resizeMode="cover" />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )
        }

        return null;
    };

    const RenderJobStatus = ({ job }: { job: any }) => {
        const jobConfig = assetWorkflowJobConfig[job.name as keyof typeof assetWorkflowJobConfig];
        // Default to waiting if status is unknown or pending
        const statusKey = (job.status === 'completed' || job.status === 'running' || job.status === 'confirming') ? job.status : 'waiting';
        const statusConfig = (jobConfig?.status as any)?.[statusKey];
        const dataKey = jobConfig?.dataKey;

        const isCompleted = job.status === 'completed';
        const isRunning = job.status === 'running';
        const isConfirming = job.status === 'confirming';

        const displayName = statusConfig?.name || job.status;
        const borderColor = isCompleted ? "border-green-200" : isRunning ? "border-blue-200" : isConfirming ? "border-yellow-200" : "border-gray-100";
        const bgColor = isCompleted ? "bg-green-50" : isRunning ? "bg-blue-50" : isConfirming ? "bg-yellow-50" : "bg-gray-50/50";
        const textColor = isCompleted ? "text-green-600" : isRunning ? "text-blue-600" : isConfirming ? "text-yellow-600" : "text-gray-400";

        return (
            <View className={`mt-3 p-3 rounded-xl border ${borderColor} ${bgColor}`}>
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="font-medium text-gray-700 text-xs">状态</Text>
                    <View className="flex-row items-center gap-2">
                        <Text className={`font-bold text-xs ${textColor}`}>{displayName}</Text>
                        {isConfirming && (
                            <View className="flex-row gap-2">
                                <TouchableOpacity
                                    onPress={() => handleRetry(job.index, dataKey)}
                                    className="bg-white border border-yellow-500 px-2.5 py-1 rounded shadow-sm"
                                >
                                    <Text className="text-yellow-600 text-[10px] font-bold">重试</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleConfirm(job.index)}
                                    className="bg-yellow-500 px-2.5 py-1 rounded shadow-sm"
                                >
                                    <Text className="text-white text-[10px] font-bold">确认</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                {job.startedAt && <Text className="text-[10px] text-gray-400">Start: {new Date(job.startedAt * 1000).toLocaleTimeString()}</Text>}
                {asset?.data?.data?.workflow?.dataBus && renderJobData(job.index, dataKey, asset.data.data.workflow.dataBus[dataKey])}
            </View>
        );
    };

    const InputCard = ({ title, iconName, data, type }: any) => {
        if (!data) return null;
        const imageSrc = type === 'video' ? (data?.root?.coverUrl || data?.coverUrl) : data?.images?.[0];

        return (
            <View className="bg-background0 border border-gray-100 rounded-xl p-3 shadow-sm flex-row gap-3 items-center mb-3">
                <View className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden relative">
                    <Image source={{ uri: imageSrc }} className="w-full h-full" resizeMode="cover" />
                    {type === 'video' && (
                        <View className="absolute inset-0 items-center justify-center bg-black/20">
                            <Feather name="play-circle" size={20} color="white" />
                        </View>
                    )}
                </View>
                <View className="flex-1">
                    <View className="flex-row items-center gap-1.5 mb-1">
                        <Feather name={iconName as any} size={10} color="#9ca3af" />
                        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{title}</Text>
                    </View>
                    <Text className="font-bold text-gray-800 text-sm" numberOfLines={1}>
                        {data?.title || data?.name || "Untitled"}
                    </Text>
                    {type === 'product' && data?.brand && (
                        <View className="self-start bg-purple-50 px-1.5 py-0.5 rounded mt-1">
                            <Text className="text-purple-600 text-[10px]">{data.brand}</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    }

    const realAsset = asset?.data?.data;
    const realWorkflow = realAsset?.workflow;
    const jobs = realWorkflow?.jobs || [];
    const currentStepIndex = realWorkflow?.current || 0;
    const realCommodity = realWorkflow?.dataBus?.commodity;
    const realInspiration = realWorkflow?.dataBus?.segment;

    // Loading State
    if (isLoading && !realAsset) {
        return (
            <ScreenContainer stackScreenProps={{ title: "Loading..." }}>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScreenHeader title="复刻灵感" />
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                <View className="px-5 py-6">
                    {/* Header */}
                    <View className="mb-6">
                        <View className="flex-row items-center gap-2 mb-2">
                            <View className={`px-2 py-0.5 rounded-full ${realWorkflow?.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'}`}>
                                <Text className={`text-[10px] font-bold ${realWorkflow?.status === 'completed' ? 'text-green-700' : 'text-blue-700'}`}>
                                    {realWorkflow?.status?.toUpperCase()}
                                </Text>
                            </View>
                            <Text className="text-gray-400 text-[10px] font-mono">ID: {id?.substring(0, 8)}...</Text>
                        </View>
                        <Text className="text-xl font-bold text-gray-800">
                            {realCommodity?.title ? `项目: ${realCommodity.title}` : "视频生成项目"}
                        </Text>
                    </View>

                    {/* Input configuration */}
                    <View className="mb-6">
                        <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">输入配置</Text>
                        <InputCard title="参考视频" iconName="video" data={realInspiration} type="video" />
                        <InputCard title="关联商品" iconName="shopping-bag" data={realCommodity} type="product" />
                    </View>

                    {/* Workflow Steps */}
                    <View className="bg-background0 rounded-2xl shadow-sm border border-gray-100 p-4">
                        <View className="border-b border-gray-50 pb-3 mb-2">
                            <Text className="text-sm font-bold text-gray-800">执行流程</Text>
                        </View>

                        <View className="gap-6">
                            {jobs.map((job: any, index: number) => {
                                const isCurrent = index === currentStepIndex;
                                const jobConfig = assetWorkflowJobConfig[job.name as keyof typeof assetWorkflowJobConfig];

                                return (
                                    <View key={job.name || index} className="flex-row gap-3">
                                        {/* Timeline Line */}
                                        <View className="items-center">
                                            <View className={`w-6 h-6 rounded-full items-center justify-center border ${job.status === 'completed' ? 'bg-green-50 border-green-200' :
                                                job.status === 'running' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                                                }`}>
                                                {job.status === 'completed' ? (
                                                    <Feather name="check" size={12} color="#16a34a" />
                                                ) : job.status === 'running' ? (
                                                    <ActivityIndicator size={10} color="#2563eb" />
                                                ) : (
                                                    <View className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                                )}
                                            </View>
                                            {index !== jobs.length - 1 && (
                                                <View className="w-[1px] flex-1 bg-gray-100 my-1" />
                                            )}
                                        </View>

                                        <View className="flex-1 pb-4">
                                            <Text className={`text-sm font-medium ${isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>
                                                {jobConfig?.label || job.name}
                                            </Text>
                                            <RenderJobStatus job={job} />
                                        </View>
                                    </View>
                                )
                            })}
                        </View>
                    </View>
                </View>
            </ScrollView>
            <ModalVideoPlayer
                visible={!!videoPreview}
                videoUrl={videoPreview || undefined}
                onClose={() => setVideoPreview(null)}
            />
        </ScreenContainer>
    );
};

export default AssetEditorScreen;