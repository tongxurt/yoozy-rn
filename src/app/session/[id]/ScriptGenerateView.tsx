import {FlatList, ScrollView, Text, TouchableOpacity, View} from "react-native";
import PulseLoader from "@/components/PulseLoader";
import React, {useMemo} from "react";
import VideoPlayer from "@/components/VideoPlayer";
import {router} from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import useTailwindVars from "@/hooks/useTailwindVars";
import usePicker from "@/hooks/usePicker";
import {upload} from "@/utils/upload/tos";

const ScriptGenerateView = ({data, onReload}: { data: any, onReload: () => void }) => {

    const {colors} = useTailwindVars()

    const {pick} = usePicker()

    const script = data?.script;

    const handleUploadProduction = (segmentIndex: number) => {
        // 处理上传成片逻辑
        console.log('上传成片', segmentIndex);

        pick({mediaTypes: ['images']}).then(result => {
            console.log(result);
            if (result?.length) {
                upload(result[0]).then(result => {
                    console.log(result);
                })

            }
        })

    };

    const handleAIGenerate = (segmentIndex: number) => {
        // 处理AI生成逻辑
        console.log('AI生成', segmentIndex);
    };


    const state = useMemo(() => {

        const segments = data?.script?.segments

        const done = segments?.filter((x: any) => x.production)?.length || 0

        return {
            done,
            total: segments?.length,
            ok: done && done === segments?.length,
        }

    }, [data])


    return (
        <View className={'gap-4 flex-1'}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className={'gap-8'}>
                    <View className={'flex-row gap-2'}>
                        <MaterialCommunityIcons name="alarm-light-outline" size={16} color={colors.white}/>
                        <Text className={'text-white text-md'}>生成爆款脚本</Text>
                    </View>


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
                            <View className={'border-l-2 border-primary pl-3'}>
                                <Text className={'text-grey2 text-xs mb-1'}>风格定位</Text>
                                <Text className={'text-white text-sm font-medium leading-5'}>{script.style}</Text>
                            </View>
                            <View className={'border-l-2 border-primary pl-3'}>
                                <Text className={'text-grey2 text-xs mb-1'}>内容策略</Text>
                                <Text className={'text-white text-sm  leading-5'}>{script.contentStyle}</Text>
                            </View>
                        </View>
                    )}

                    {/* 分段列表 */}
                    {script?.segments && (
                        <View className={'flex-1'}>
                            <View className={'pb-3'}>
                                <Text className={'text-white font-semibold'}>
                                    脚本分段 <Text
                                    className={'text-grey1 text-sm font-normal'}>({script.segments.length})</Text>
                                </Text>
                            </View>
                            <FlatList
                                data={script.segments}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{paddingBottom: 24}}
                                ItemSeparatorComponent={() => <View className={'h-4'}/>}
                                renderItem={({item, index}) => {
                                    const timeStart = item.reference?.timeStart || 0;
                                    const timeEnd = item.reference?.timeEnd || 0;
                                    const duration = timeEnd - timeStart;

                                    return (
                                        <View className={'bg-background0 rounded-lg overflow-hidden p-5 gap-5'}>
                                            {/* 头部：序号 + 时间 */}
                                            <View className={'flex-row items-center gap-3'}>
                                                <View
                                                    className={'w-10 h-10 bg-primary rounded-full items-center justify-center'}>
                                                    <Text className={'text-[white] font-semibold text-sm'}>
                                                        {index + 1}
                                                    </Text>
                                                </View>
                                                <View className={'flex-1'}>
                                                    <Text className={'text-grey1 text-xs'}>
                                                        {duration.toFixed(1)}s
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
                                            <View className={''}>
                                                <Text
                                                    className={'text-grey0 text-xs mb-2 border-l-2 border-primary pl-2'}>口播文案</Text>
                                                <View className={''}>
                                                    <Text className={'text-white text-sm leading-relaxed'}>
                                                        {item.content?.subtitle}
                                                    </Text>
                                                </View>

                                            </View>

                                            {/* 参考视频画面 */}
                                            <View className={''}>
                                                <Text
                                                    className={'text-grey0 text-xs mb-2 border-l-2 border-primary pl-2'}>参考视频画面</Text>
                                                <View className={'rounded-lg overflow-hidden'}>
                                                    <VideoPlayer
                                                        videoUri={item.reference?.url}
                                                        timeStart={timeStart}
                                                        timeEnd={timeEnd}
                                                    />
                                                </View>
                                            </View>

                                            {/* 场景描述 */}
                                            {item.desc && (
                                                <View className={''}>
                                                    <Text
                                                        className={'text-grey0 text-xs mb-1  border-l-2 border-primary pl-2'}>场景描述</Text>
                                                    <Text className={'text-white text-sm leading-relaxed'}>
                                                        {item.desc}
                                                    </Text>
                                                </View>
                                            )}

                                            {/* 操作按钮 */}
                                            <View className={'flex-row gap-3'}>
                                                <TouchableOpacity
                                                    onPress={() => handleUploadProduction(index)}
                                                    className={'flex-1 bg-white/5 border border-white/10 rounded-lg py-3 items-center'}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text className={'text-white text-sm font-medium'}>
                                                        上传成片
                                                    </Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    onPress={() => handleAIGenerate(index)}
                                                    className={'flex-1 bg-primary rounded-lg py-3 items-center'}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text className={'text-white text-sm font-medium'}>
                                                        AI生成
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>

                                            {/* 成片 */}
                                            {item.production && (
                                                <View className={'border-t border-white/5'}>
                                                    {/* 成片视频展示区域 */}
                                                </View>
                                            )}
                                        </View>
                                    );
                                }}
                            />
                        </View>
                    )}

                </View>
            </ScrollView>
            <View>
                <TouchableOpacity
                    // onPress={handleOneClickProduction}
                    activeOpacity={0.7}
                    className={`rounded-full py-4 items-center ${
                        state.ok
                            ? 'bg-primary'
                            : 'bg-white/5 border border-white/10'

                    }`}
                >
                    <Text className={'text-white text-sm font-medium'}>
                        {state.ok
                            ? "一键成片"
                            : `已完成${state.done}/${state.total}`
                        }
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default ScriptGenerateView;
