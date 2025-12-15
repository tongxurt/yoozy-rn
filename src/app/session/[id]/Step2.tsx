import useTailwindVars from "@/hooks/useTailwindVars";
import { FontAwesome } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface Step2Props {
    templateList: any;
    selectedTemplateId: string | null;
    setSelectedTemplateId: (id: string) => void;
}

const Step2 = ({ templateList, selectedTemplateId, setSelectedTemplateId }: Step2Props) => {
    const { colors } = useTailwindVars();

    return (
        <View className="gap-5">
            {/* Banner */}
            <LinearGradient
                colors={[colors.primary + '15', colors.primary + '08']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{ borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesome name="lightbulb-o" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', fontSize: 14, color: colors.primary, marginBottom: 2 }}>智能推荐已就绪</Text>
                    <Text style={{ fontSize: 11, color: colors.grey1 }}>根据商品属性为您精选高转化模板</Text>
                </View>
            </LinearGradient>

            {/* Template List */}
            <View className="gap-3">
                {(templateList?.pages?.[0]?.data?.data?.list || []).slice(0, 4).map((item: any, i: number) => (
                    <TouchableOpacity
                        key={i}
                        activeOpacity={0.8}
                        style={{
                            backgroundColor: colors.background2,
                            borderRadius: 16,
                            padding: 12,
                            flexDirection: 'row',
                            gap: 12,
                            borderWidth: selectedTemplateId === item._id ? 2 : 0,
                            borderColor: colors.primary
                        }}
                        onPress={() => setSelectedTemplateId(item._id)}
                    >
                        <View style={{ width: 80, height: 100, borderRadius: 10, backgroundColor: '#e5e5e5', overflow: 'hidden' }}>
                            <Image source={{ uri: item.coverUrl || item.highlightFrames?.[0]?.url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                        </View>
                        <View style={{ flex: 1, paddingVertical: 4, justifyContent: 'space-between' }}>
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <Text style={{ fontWeight: '700', fontSize: 15, color: colors.grey0 }} numberOfLines={1}>{item.description || '热门模板'}</Text>
                                    {selectedTemplateId === item._id && <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />}
                                </View>
                                <Text style={{ fontSize: 12, color: colors.grey2, lineHeight: 18 }} numberOfLines={2}>{item.commodity?.name || '适合带货、种草视频，转化率高。'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 6 }}>
                                {(item.tags || ['爆款', '高转化']).slice(0, 2).map((tag: string, idx: number) => (
                                    <View key={idx} style={{ backgroundColor: '#fff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                        <Text style={{ fontSize: 10, color: colors.grey2 }}>{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

export default Step2;
