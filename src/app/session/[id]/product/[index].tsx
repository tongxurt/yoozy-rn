import {View, Text} from "react-native";
import {Stack, useFocusEffect, useLocalSearchParams} from "expo-router";
import React, {useCallback, useMemo} from "react";
import {useQuery} from "@tanstack/react-query";
import {fetchSession} from "@/api/session";
import VideoPlayer from "@/components/VideoPlayer";


const Product = () => {

    const {id, index} = useLocalSearchParams()

    const {data: ur, refetch, isLoading} = useQuery({
        queryKey: ['session_segment'],
        queryFn: () => fetchSession({id: id as string}),
        // refetchInterval: 1000,
    });
    const segment = useMemo(() => ur?.data?.data?.script?.segments?.[parseInt(index as string)], [ur])

    useFocusEffect(useCallback(() => {
        void refetch()
    }, []))

    return (
        <View className={'flex-1'}>
            <Stack.Screen
                options={{
                    title: `镜头${parseInt(index as string) + 1}`,
                }}
            />
            <View className="flex-1 p-5">
                {segment?.production ?
                    <VideoPlayer videoUri={segment?.production} style={{width: '100%', height: 'auto', borderRadius: 10}}/>
                    :
                    <View className={'w-[250px] mx-auto aspect-9/16 bg-red-400 rounded-[10px]'}>
                        <Text className={'text-white'}>{JSON.stringify(segment)}</Text>
                    </View>
                }
            </View>
        </View>
    )
}

export default Product;
