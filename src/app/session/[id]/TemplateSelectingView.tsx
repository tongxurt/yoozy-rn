import {FlatList, Text, TouchableOpacity, View} from "react-native";
import PulseLoader from "@/components/PulseLoader";
import React, {useRef, useState} from "react";
import {Video} from 'expo-av';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import useTailwindVars from "@/hooks/useTailwindVars";


const ItemView = ({item}: { item: any }) => {
    const [segmentIndex, setSegmentIndex] = useState<any>(undefined)
    const videoRef = useRef<any>(null)

    const seekToTime = async (timeStart: number) => {
        if (videoRef.current) {
            await videoRef.current.setPositionAsync(timeStart * 1000);
            await videoRef.current.playAsync();
        }
    };

    return (
        <View className={'gap-2'}>
            <Video
                ref={videoRef}
                source={{uri: item?.url}}
                style={{height: 250, borderRadius: 10}}
                useNativeControls
                isLooping={false}
            />

            {/* 分段列表 */}
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={item?.segments || []}
                contentContainerStyle={{}}
                ItemSeparatorComponent={() => <View className={'w-2.5'}/>}
                renderItem={({item: segment, index: i}) => {
                    const isSelected = segmentIndex === i;
                    const duration = (segment.timeEnd || 0) - (segment.timeStart || 0);
                    const order = i + 1; // 分段序号（1 起）

                    return (
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => {
                                setSegmentIndex(i);
                                if (segment.timeStart) {
                                    seekToTime(segment.timeStart);
                                }
                            }}
                            className={`p-3 rounded-lg max-w-[180px] bg-background1 ${
                                isSelected ? 'border-[1.5px] border-primary' : ''
                            }`}
                        >
                            {/* 分段序号 */}
                            <View className={'flex-row items-center justify-between mb-1'}>
                                <Text className={'text-primary text-xs font-bold'}>镜头 {order}</Text>
                            </View>

                            {/* 字幕 */}
                            {segment.subtitle && (
                                <Text className={'text-white font-bold text-base mb-2'}>
                                    {segment.subtitle}
                                </Text>
                            )}
                            {/* 描述 */}
                            {segment.description && (
                                <Text className={'text-grey2 text-sm mb-2'}>
                                    {segment.description}
                                </Text>
                            )}
                            {/* 时间信息 */}
                            <View className={'flex-row items-center gap-2 mb-2'}>
                                <Text className={'text-grey3 text-xs'}>
                                    {segment.timeStart?.toFixed(2) || 0}s - {segment.timeEnd?.toFixed(2)}s
                                </Text>
                                <Text className={'text-gray-400 text-xs'}>
                                    ({duration.toFixed(2)}s)
                                </Text>
                            </View>
                            {/* 标签 */}
                            {segment.tags && segment.tags.length > 0 && (
                                <View className={'flex-row flex-wrap gap-1 mb-2'}>
                                    {segment.tags.slice(0, 3).map((tag: string, idx: number) => (
                                        <View key={idx} className={'bg-primary/50 px-2 py-1 rounded'}>
                                            <Text className={'text-gray-200 text-xs'}>{tag}</Text>
                                        </View>
                                    ))}
                                    {segment.tags.length > 3 && (
                                        <View className={'bg-primary/50 px-2 py-1 rounded'}>
                                            <Text className={'text-gray-200 text-xs'}>
                                                +{segment.tags.length - 3}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}
                            {/* 风格标签 */}
                            {segment.typedTags && (
                                <View className={'mt-2 pt-2'}>
                                    {segment.typedTags?.person?.length && (
                                        <Text className={'text-grey3 text-xs mb-1'}>
                                            人物: {segment.typedTags.person.join(', ')}
                                        </Text>
                                    )}
                                    {segment.typedTags?.scene?.length && (
                                        <Text className={'text-grey3 text-xs mb-1'}>
                                            场景: {segment.typedTags.scene.join(', ')}
                                        </Text>
                                    )}
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    )
}
const TemplateSelectingView = ({data}: { data: any }) => {

    const {colors} = useTailwindVars()

    return (
        <View className={'gap-3'}>
            {
                data?.status === 'hotTemplateSelecting' &&
                <View className={'flex-row gap-3 items-center'}>
                    <PulseLoader size={15}/>
                    <Text className={'text-white'}>正在选择爆款模板</Text>
                </View>
            }

            <ItemView item={data?.templates?.[0]}/>

            {data?.status === 'hotTemplateSelected' && <>
                <View className={'flex-row justify-end'}>
                    <TouchableOpacity className={'items-center gap-2 flex-row'}>
                        <MaterialCommunityIcons name="reload" size={15} color={colors.grey2}/>
                        <Text className={'text-grey2'}>换一个</Text>
                    </TouchableOpacity>
                </View>
            </>

            }

        </View>
    )
}

export default TemplateSelectingView;
