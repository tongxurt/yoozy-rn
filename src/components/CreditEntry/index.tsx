import {Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import React from "react";


const CreditEntry = () => {

    return (
        <View className={'bg-background0 flex-row rounded-full px-2 py-1'}>
            <View className={'flex-row items-center mr-3'}>
                <Ionicons name="diamond" size={18} color="#A855F7"/>
                <Text className={'text-white text-base font-medium ml-1'}>95</Text>
            </View>
            <TouchableOpacity>
                <Text className={'text-white text-base mr-3'}>开会员</Text>
            </TouchableOpacity>
        </View>
    )
}

export default CreditEntry;
