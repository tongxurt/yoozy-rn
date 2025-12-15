import { listItems } from "@/api/resource";
import { fetchSession, updateSessionStatus } from "@/api/session";
import CreditEntry from "@/components/CreditEntry";
import useTailwindVars from "@/hooks/useTailwindVars";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import CommoditySelect from "./CommoditySelect";
import Step2 from "./Step2";
import Step3 from "./Step3";

const Session = () => {
    const { id } = useLocalSearchParams();

    const { colors } = useTailwindVars();

    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

    // Step definitions
    const steps = [
        { index: 1, title: "选择商品", icon: (c: string) => <MaterialCommunityIcons name="cube-outline" size={18} color={c} /> },
        { index: 2, title: "选择模板", icon: (c: string) => <FontAwesome name="lightbulb-o" size={18} color={c} /> },
        { index: 3, title: "视频生成", icon: (c: string) => <Ionicons name="videocam" size={18} color={c} /> },
    ];

    // Session Data
    const { data: ur, refetch } = useQuery({
        queryKey: ["session", id],
        queryFn: () => fetchSession({ id: id as string }),
        // refetchInterval: 1000,
    });
    const session = useMemo(() => ur?.data?.data, [ur]);
    const status = session?.status || ''

    const config = useMemo(() => {


    }, [])

    // Templates Data
    const { data: templateList } = useInfiniteQuery({
        queryKey: ["items", "video", ""],
        queryFn: ({ pageParam }) => listItems({ page: pageParam || 1 }),
        getNextPageParam: (lastPage) => {
            const { size, total, page } = lastPage?.data?.data;
            return size * page < total ? page + 1 : undefined;
        },
        enabled: !status?.startsWith('commodity')
    });

    // Derive real step from status
    const realTab = useMemo(() => {
        if (status?.startsWith("commodity")) return 1;
        if (status?.startsWith("hotTemplate")) return 2;
        return 3;
    }, [status]);

    const [tab, setTab] = useState(realTab);
    useEffect(() => { setTab(realTab); }, [realTab]);

    const updateStatus = ({ id, status }: { id: string; status: string }) => {
        updateSessionStatus({ id, status }).then(() => void refetch());
    };

    const handleTabChange = (index: number) => {
        if (realTab >= index) setTab(index);
    };

    // Render bottom button based on current tab
    const renderBottomButton = () => {
        if (tab === 1) {
            return (
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => updateStatus({ id: id as string, status: 'hotTemplateSelecting' })}
                    disabled={status === 'commodityMetadataParsing'}
                    style={{ opacity: status === 'commodityMetadataParsing' ? 0.5 : 1 }}
                >
                    <LinearGradient
                        colors={[colors.primary, colors.primary + 'cc']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={{ borderRadius: 28, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 17 }}>进入模板选择</Text>
                        <MaterialCommunityIcons name="arrow-right" size={22} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            );
        }
        if (tab === 2) {
            return (
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => { if (selectedTemplateId) updateStatus({ id: id as string, status: 'scriptGenerating' }); }}
                    disabled={!selectedTemplateId}
                    style={{ opacity: selectedTemplateId ? 1 : 0.5 }}
                >
                    <LinearGradient
                        colors={[colors.primary, colors.primary + 'cc']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={{ borderRadius: 28, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 17 }}>开始智能生成</Text>
                        <Ionicons name="sparkles" size={22} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            );
        }
        return null;
    };

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <View className="px-5 pt-4 flex-row justify-between items-center">
                <Text className="text-[22px] font-bold" style={{ color: colors.grey0 }}>智能成片</Text>
                <View className="flex-row items-center gap-2">
                    <CreditEntry />
                    <TouchableOpacity onPress={() => router.back()} style={{ width: 32, height: 32, justifyContent: "center", alignItems: "center" }} activeOpacity={0.7}>
                        <MaterialCommunityIcons name="arrow-collapse" size={24} color={colors.grey0} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Top Tab Navigation */}
            <View className="px-5 pt-2 pb-3">
                <View
                    className="flex-row items-center justify-between bg-plain rounded-full p-1"
                    style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}
                >
                    {steps.map((step) => {
                        const isActive = step.index === tab;
                        const isAvailable = realTab >= step.index;
                        return (
                            <TouchableOpacity
                                key={step.index}
                                activeOpacity={0.7}
                                disabled={!isAvailable}
                                onPress={() => handleTabChange(step.index)}
                                className="flex-1"
                                style={{ opacity: isAvailable ? 1 : 0.4 }}
                            >
                                {isActive ? (
                                    <LinearGradient
                                        colors={[colors.primary, colors.primary + 'cc']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={{ height: 38, borderRadius: 19, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                                    >
                                        {step.icon('#fff')}
                                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>{step.title}</Text>
                                    </LinearGradient>
                                ) : (
                                    <View className="h-[38px] flex-row items-center justify-center gap-1.5">
                                        {step.icon(colors.grey2)}
                                        <Text className="text-xs font-medium" style={{ color: colors.grey2 }}>{step.title}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Content Area - Full Screen Scrollable Card */}
            <View className="flex-1 px-5">

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                // contentContainerStyle={{ paddingVertical: 24 }}
                >
                    {tab === 1 && <CommoditySelect session={session} />}
                    {tab === 2 && <Step2 templateList={templateList} selectedTemplateId={selectedTemplateId} setSelectedTemplateId={setSelectedTemplateId} />}
                    {tab === 3 && <Step3 status={status} />}
                </ScrollView>
            </View>

            {/* Fixed Bottom Button */}
            <View style={{ paddingHorizontal: 20, paddingTop: 12, backgroundColor: colors.background }}>
                {renderBottomButton()}
            </View>
        </View>
    );
};

export default Session;
