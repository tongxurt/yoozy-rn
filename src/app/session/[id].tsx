import {router, useLocalSearchParams} from "expo-router";
import {View, Text, ScrollView, FlatList, Image, TouchableOpacity} from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import useTailwindVars from "@/hooks/useTailwindVars";
import {useQuery} from "@tanstack/react-query";
import {fetchSession, updateSessionStatus} from "@/api/session";
import React, {useEffect, useMemo, useState} from "react";
import CommodityView from "@/app/session/CommodityView";
import CommoditySellingPointsView from "@/app/session/CommoditySellingPointsView";
import {Feather, FontAwesome} from "@expo/vector-icons";
import TemplateSelectingView from "@/app/session/TemplateSelectingView";
import ScriptGenerateView from "@/app/session/ScriptGenerateView";
import CreditEntry from "@/components/CreditEntry";


const Session = () => {
    const {id} = useLocalSearchParams();

    const {colors} = useTailwindVars()

    const tabs = [
        {
            index: 1,
            title: '分析理解',
            icon: (color: string) => <MaterialCommunityIcons name="brain" size={20} color={color}/>
        },
        {
            index: 2,
            title: '选择模板',
            icon: (color: string) => <FontAwesome name="lightbulb-o" size={20} color={color}/>

        },
        {
            index: 3,
            title: '脚本生成',
            icon: (color: string) => <MaterialCommunityIcons name="script-outline" size={20} color={color}/>
        }
    ]


    const {data: ur, refetch, isLoading} = useQuery({
        queryKey: ['session'],
        queryFn: () => fetchSession({id: id as string}),
        refetchInterval: 1000,
    });
    const session = useMemo(() => ur?.data?.data, [ur])

    const realTab = useMemo(() => {
        const status = ur?.data?.data?.status as string;
        if (status?.startsWith("commodity")) {
            return 1
        }
        if (status?.startsWith("hotTemplate")) {
            return 2;
        }
        if (status?.startsWith("script")) {
            return 3;
        }
        return 1;

    }, [ur])

    useEffect(() => {
        setTab(realTab)
    }, [realTab])

    const [tab, setTab] = useState(realTab);

    const updateStatus = ({id, status}: { id: string, status: string }) => {
        updateSessionStatus({id, status}).then(() => {
            void refetch()
        });
    }

    return <View className="flex-1 bg-background">
        <View className={'px-5 flex-row justify-between items-center'}>
            <Text className={'text-[22px] text-white font-bold'}>
                智能生视频
            </Text>
            <View className={'flex-row items-center gap-2'}>
                <CreditEntry/>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{
                        width: 32,
                        height: 32,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <MaterialCommunityIcons name="arrow-collapse" size={25} color="black"/>
                </TouchableOpacity>
            </View>
        </View>
        {tab === 1 &&
            <View className="flex-1 m-6 p-5 bg-background0 rounded-lg">
                <ScrollView>
                    <View className={'gap-8 '}>
                        <View className={'flex-row gap-2'}>
                            <MaterialCommunityIcons name="alarm-light-outline" size={16} color={colors.white}/>
                            <Text className={'text-white text-md'}>需求收到，正在为您处理关键信息</Text>
                        </View>
                        <View><CommodityView data={session}/></View>
                        <View> <CommoditySellingPointsView data={session}/> </View>
                    </View>
                </ScrollView>

                {
                    session?.status === "commoditySellingPointsSelected" && <TouchableOpacity
                        onPress={() => {
                            updateStatus({id: id as string, status: 'hotTemplateSelecting'});
                        }}
                        className={'justify-center items-center flex-row gap-2'}>
                        <Text className={'text-white'}>下一步</Text>
                        <Feather name="chevrons-right" size={15} color={colors.white}/>
                    </TouchableOpacity>
                }

            </View>
        }

        {tab === 2 &&
            <View className="flex-1 m-6 p-5 bg-background0 rounded-lg">
                <ScrollView>
                    <View className={'gap-8 '}>
                        <View className={'flex-row gap-2'}>
                            <MaterialCommunityIcons name="alarm-light-outline" size={16} color={colors.white}/>
                            <Text className={'text-white text-md'}>结合抖音热点，选择合适模板</Text>
                        </View>
                        <TemplateSelectingView data={session}/>
                    </View>
                </ScrollView>


                {
                    session?.status === "hotTemplateSelected" && <TouchableOpacity
                        onPress={() => {
                            updateStatus({id: id as string, status: 'scriptGenerating'});
                        }}
                        className={'justify-center items-center flex-row gap-2'}>
                        <Text className={'text-white'}>下一步</Text>
                        <Feather name="chevrons-right" size={15} color={colors.white}/>
                    </TouchableOpacity>
                }

            </View>
        }


        {tab === 3 &&
            <View className="flex-1 m-6 p-5 bg-background0 rounded-lg">
                <ScrollView>
                    <View className={'gap-8 '}>
                        <View className={'flex-row gap-2'}>
                            <MaterialCommunityIcons name="alarm-light-outline" size={16} color={colors.white}/>
                            <Text className={'text-white text-md'}>生成爆款脚本</Text>
                        </View>
                        <ScriptGenerateView data={session}/>
                    </View>
                </ScrollView>

            </View>
        }


        <View className={'gap-10 flex-row justify-center items-center'}>
            {
                tabs?.map((x, index) => {

                    const disabled = realTab < index + 1;

                    if (disabled) {
                        return <TouchableOpacity
                            activeOpacity={1}
                            key={index}
                            className={'gap-3'}
                        >
                            <View
                                className={`
                         w-[60px] h-[40px] rounded-full justify-center items-center bg-background2`}>
                                {x.icon(colors.grey2)}
                            </View>
                            <Text className={'text-grey2'}>{x.title} {realTab}</Text>
                        </TouchableOpacity>
                    }

                    return <TouchableOpacity
                        activeOpacity={0.9}
                        key={index}
                        className={'gap-3'}
                        onPress={() => setTab(x.index)}>
                        <View
                            className={`
                            w-[60px] h-[40px] rounded-full justify-center items-center 
                            ${x.index === tab ? 'border border-primary/80 bg-primary/20' : 'bg-background2'}
                            `}>
                            {x.icon(colors.white)}
                        </View>
                        <Text className={'text-white'}>{x.title}</Text>
                    </TouchableOpacity>
                })
            }

        </View>
    </View>
}

export default Session;
