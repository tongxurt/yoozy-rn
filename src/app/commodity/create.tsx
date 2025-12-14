import { createCommodities } from "@/api/commodity";
import SpinningIcon from "@/components/loading";
import Picker from "@/components/PickerV2";
import useTailwindVars from "@/hooks/useTailwindVars";
import { upload } from "@/utils/upload/tos";
import { extractLinks, getImageName } from "@/utils/upload/utils";
import { Feather } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Keyboard,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Toast } from "react-native-toast-notifications";

export default function CreateCommodityScreen() {
    const { colors } = useTailwindVars();
    const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();

    const [files, setFiles] = useState<any[]>([]);
    const [text, setText] = useState("");

    const isDisabled = !files.length && !(extractLinks(text).length > 0);

    const { mutate: createCommodity, isPending } = useMutation({
        mutationFn: createCommodities,
        onSuccess: (res) => {
            if (res.data?.code) {
                Toast.show(res.data.message || "创建失败");
                return;
            }
            Toast.show("商品创建成功");
            queryClient.invalidateQueries({ queryKey: ["commodities-list"] });
            router.back();
        },
        onError: (error: any) => {
            Toast.show("创建失败，请稍后重试");
            console.error(error);
        },
    });

    const handleCreate = async () => {
        Keyboard.dismiss();
        try {
            const medias = [];
            if (files?.length) {
                for (let file of files) {
                    const url = await upload(file);
                    if (url) {
                        medias.push({
                            mimeType: file.type || "image/jpeg",
                            name: getImageName(file.uri),
                            url: url,
                        });
                    }
                }
            }

            const urls = extractLinks(text);

            createCommodity({
                url: urls[0],
                medias: medias.length > 0 ? medias : undefined,
                description: text // Optional: send full text as description? Or just rely on URL
            });

        } catch (e) {
            console.error(e);
            Toast.show("上传资源失败");
        }
    };

    return (
        <View className="flex-1 bg-background">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAwareScrollView
                    className="flex-1"
                    contentContainerStyle={{ padding: 16 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View
                        className="bg-background2 rounded-2xl p-4 gap-4"
                        style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 8,
                            elevation: 2,
                        }}
                    >
                        {/* File Picker */}
                        <View>
                            <Text className="text-sm font-medium text-black mb-3">上传图片/视频</Text>
                            <Picker files={files} onFilesChange={setFiles} />
                        </View>

                        <View className="h-[1px] bg-divider" />

                        {/* Link Input */}
                        <View>
                            <Text className="text-sm font-medium text-black mb-3">商品链接</Text>
                            <TextInput
                                value={text}
                                onChangeText={setText}
                                placeholder="粘贴商品链接..."
                                placeholderTextColor={colors.grey3}
                                multiline
                                className="text-base text-black leading-6 min-h-[100px]"
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                </KeyboardAwareScrollView>
            </TouchableWithoutFeedback>

            {/* Floating Submit Button or Bottom Bar */}
            <View
                className="px-4 py-4 bg-background"
                style={{ paddingBottom: Math.max(insets.bottom, 16) }}
            >
                <TouchableOpacity
                    onPress={handleCreate}
                    disabled={isDisabled || isPending}
                    className={`w-full py-3.5 rounded-full flex-row items-center justify-center gap-2 ${isDisabled ? "bg-grey4" : "bg-primary"
                        }`}
                    activeOpacity={0.8}
                >
                    {isPending ? (
                        <SpinningIcon name="circle-notch" size={20} color="white" />
                    ) : (
                        <>
                            <Feather name="plus" size={20} color="white" />
                            <Text className={`text-base font-bold text-white`}>
                                立即创建
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
