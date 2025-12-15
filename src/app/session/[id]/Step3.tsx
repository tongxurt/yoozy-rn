import useTailwindVars from "@/hooks/useTailwindVars";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface Step3Props {
    status: string;
}

const Step3 = ({ status }: Step3Props) => {
    const { colors } = useTailwindVars();

    return (
        <View className="gap-5">
            {/* Banner */}
            <LinearGradient
                colors={[colors.primary + '15', colors.primary + '08']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{ borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}
            >
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="videocam" size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', fontSize: 15, color: colors.primary, marginBottom: 2 }}>{status === 'completed' ? '视频生成完成' : 'AI 视频生成中'}</Text>
                    <Text style={{ fontSize: 12, color: colors.grey1 }}>{status === 'completed' ? '点击预览查看成片' : '预计剩余 1-2 分钟'}</Text>
                </View>
                {status !== 'completed' && <ActivityIndicator size="small" color={colors.primary} />}
            </LinearGradient>

            {/* Progress Timeline */}
            <View style={{ paddingLeft: 8 }}>
                <View style={{ position: 'absolute', left: 17, top: 12, bottom: 20, width: 2, backgroundColor: colors.background2 }} />
                {[
                    { title: '智能文案生成', done: ['scriptGenerated', 'videoSynthesizing', 'completed'].some(s => status.startsWith(s)) },
                    { title: '素材智能匹配', done: ['videoSynthesizing', 'completed'].some(s => status.startsWith(s)) },
                    { title: 'AI 视频合成', done: status === 'completed' },
                    { title: '画质优化渲染', done: status === 'completed' },
                ].map((item, i, arr) => {
                    const isCurrent = !item.done && (i === 0 || arr[i - 1].done);
                    const isPending = !item.done && !isCurrent;
                    return (
                        <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginBottom: 28 }}>
                            <View
                                style={{
                                    width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', zIndex: 10,
                                    backgroundColor: item.done ? colors.primary : isCurrent ? '#fff' : colors.plain,
                                    borderWidth: isCurrent ? 4 : isPending ? 3 : 0,
                                    borderColor: isCurrent ? colors.primary : colors.background2,
                                    marginTop: 2
                                }}
                            >
                                {item.done && <MaterialCommunityIcons name="check" size={12} color="white" />}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontWeight: '700', fontSize: isCurrent ? 16 : 14, color: isPending ? colors.grey2 : colors.grey0, marginBottom: 4 }}>{item.title}</Text>
                                {isCurrent && (
                                    <LinearGradient colors={[colors.primary + '20', colors.primary + '08']} style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' }}>
                                        <Text style={{ fontSize: 11, fontWeight: '500', color: colors.primary }}>正在处理中...</Text>
                                    </LinearGradient>
                                )}
                            </View>
                        </View>
                    );
                })}
            </View>

            {status === 'completed' && (
                <View style={{ alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.background2 }}>
                    <Text style={{ fontSize: 18, marginBottom: 4 }}>🎉</Text>
                    <Text style={{ fontWeight: '700', color: colors.primary, marginBottom: 4 }}>视频生成完成！</Text>
                    <Text style={{ fontSize: 12, color: colors.grey2 }}>请前往详情页预览及导出</Text>
                </View>
            )}
        </View>
    );
};

export default Step3;
