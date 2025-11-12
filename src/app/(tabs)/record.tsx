import React, {useCallback} from "react";
import SessionList from "@/components/session/List";
import {View, Text} from "react-native";
import AuthInfo from "@/components/AuthInfo";


export default function MyScreen() {
    return (
        <View className={'flex-1 bg-background'}>
            <View className={'px-5 pb-6 flex-row justify-between items-center'}>
                <Text className={'text-[25px] text-white font-bold'}>记录</Text>
                <AuthInfo/>
            </View>
            <SessionList/>
        </View>
    );
}
