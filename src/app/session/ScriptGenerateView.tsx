import {FlatList, Text, View} from "react-native";
import PulseLoader from "@/components/PulseLoader";
import React from "react";
import useTailwindVars from "@/hooks/useTailwindVars";

const ScriptGenerateView = ({data}: { data: any }) => {
    const {colors} = useTailwindVars();
    const script = data?.script;

    return (
        <View className={'gap-4 flex-1'}>
            {/* 加载状态 */}
            {data?.status === 'scriptGenerating' && (
                <View className={'flex-row gap-3 items-center'}>
                    <PulseLoader size={15}/>
                    <Text className={'text-white'}>正在生成脚本</Text>
                </View>
            )}

            {/* 总体风格 */}
            {script && (
                <View className={'gap-2'}>
                    <View className={'border-l-2 border-white/20 pl-3'}>
                        <Text className={'text-gray-400 text-xs mb-1'}>风格定位</Text>
                        <Text className={'text-white text-sm font-medium'}>{script.style}</Text>
                    </View>
                    <View className={'border-l-2 border-white/20 pl-3'}>
                        <Text className={'text-gray-400 text-xs mb-1'}>内容策略</Text>
                        <Text className={'text-white text-sm'}>{script.contentStyle}</Text>
                    </View>
                </View>
            )}

            {/* 分段列表 */}
            {script?.segments && (
                <View className={'flex-1'}>
                    <View className={'pb-2'}>
                        <Text className={'text-white font-semibold'}>
                            脚本分段 <Text className={'text-grey1 text-sm'}>({script.segments.length})</Text>
                        </Text>
                    </View>

                    <FlatList
                        data={script.segments}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{}}
                        ItemSeparatorComponent={() => <View className={'h-3'}/>}
                        renderItem={({item, index}) => {
                            const timeStart = item.reference?.timeStart || 0;
                            const timeEnd = item.reference?.timeEnd || 0;
                            const duration = timeEnd - timeStart;

                            return (
                                <View className={'bg-white/5 border border-white/10 rounded-lg overflow-hidden'}>
                                    {/* 头部：序号 + 时间 */}
                                    <View className={'flex-row items-center gap-3 p-3 border-b border-white/5'}>
                                        <View className={'w-8 h-8 bg-primary rounded items-center justify-center'}>
                                            <Text className={'text-[white] font-bold text-sm'}>
                                                {index + 1}
                                            </Text>
                                        </View>

                                        <View className={'flex-1'}>
                                            {/*<Text className={'text-white text-xs font-mono'}>*/}
                                            {/*    {timeStart.toFixed(1)}s - {timeEnd.toFixed(1)}s*/}
                                            {/*</Text>*/}
                                            <Text className={'text-gray-500 text-xs'}>
                                                时长 {duration.toFixed(1)}s
                                            </Text>
                                        </View>

                                        {/* 镜头类型 */}
                                        {item.stage?.name && (
                                            <View className={'bg-white/5 px-2 py-1 rounded'}>
                                                <Text className={'text-grey1 text-xs'}>
                                                    {item.stage?.name}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* 字幕文案 */}
                                    <View className={'p-3 border-b border-white/5'}>
                                        <Text className={'text-white text-sm leading-relaxed'}>
                                            {item.content?.subtitle}
                                        </Text>
                                    </View>

                                    {/* 拍摄风格 */}
                                    <View className={'px-3 py-2 border-b border-white/5'}>
                                        <Text className={'text-grey0 text-xs mb-1'}>拍摄方式</Text>
                                        <Text className={'text-grey2 text-xs leading-relaxed'}>
                                            {item.shootingStyle}
                                        </Text>
                                    </View>

                                    {/* 场景描述 */}
                                    {item.desc && (
                                        <View className={'px-3 py-2'}>
                                            <Text className={'text-grey0 text-xs mb-1'}>场景描述</Text>
                                            <Text className={'text-grey2 text-xs leading-relaxed'}>
                                                {item.desc}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            );
                        }}
                    />
                </View>
            )}
        </View>
    );
}

export default ScriptGenerateView;
