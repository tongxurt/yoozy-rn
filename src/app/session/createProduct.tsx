import { Text, View, TextInput, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { router } from "expo-router";
import React, { useState } from "react";
import useTailwindVars from "@/hooks/useTailwindVars";
import { performSingleUpload } from "@/utils/upload/oss_bak";
import Picker from "@/components/PickerV2";
import { Ionicons } from "@expo/vector-icons";
import CreditEntry from "@/components/CreditEntry";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { createCommodities } from "@/api/commodity";
import { extractLinks, getImageName } from "@/utils/upload/utils";
import { Toast } from "react-native-toast-notifications";
import SpinningIcon from "@/components/loading";
import { useMutation, useQuery } from "@tanstack/react-query";
const Starter = () => {
  const { colors } = useTailwindVars();
  const [files, setFiles] = useState<any[]>([]);
  const [text, setText] = useState("");

  // 计算是否禁用按钮
  const isDisabled = !files.length || !(extractLinks(text).length > 0);

  const { mutate: createQuickSessions, isPending } = useMutation({
    mutationFn: createCommodities,
    onSuccess: (res) => {
      if (res.data.code) {
        Toast.show(res.data.message);
        return;
      }
      Toast.show("商品创建成功");
      router.back();
    },
    onError: (error: any) => {
      Toast.show("创建失败");
    },
  });
  console.log(isPending);

  const confirm = async () => {
    try {
      if (!text && !files.length) {
        return;
      }
      const images = [];
      if (files?.length) {
        for (let i = 0; i < files.length; i++) {
          const url = await performSingleUpload(files[i], (p) => {});
          images.push({
            mimeType: files[i].type,
            name: getImageName(files[i].uri),
            url: url,
          });
        }
      }

      createQuickSessions({
        url: extractLinks(text)[0],
        medias: images,
      });
    } catch (error) {
      Toast.show("商品创建失败");
    }
  };

  return (
    <View className={"flex-1"}>
      <View className={"px-5 pb-4 flex-row justify-between items-center"}>
        <Text className={"text-[22px] text-white font-bold"}>新建商品</Text>
        <View className={"flex-row items-center gap-2"}>
          <CreditEntry />
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 32,
              height: 32,
              justifyContent: "center",
              alignItems: "center",
            }}
            activeOpacity={1}
          >
            <MaterialCommunityIcons
              name="arrow-collapse"
              size={25}
              color="black"
            />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* 主容器 - 白色圆角卡片 */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          {/* 上传资源部分 - 保持不变 */}
          <Picker files={files} onFilesChange={setFiles} />

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="输入商品链接"
            multiline
            style={{
              fontSize: 16,
              color: "#333",
              textAlignVertical: "top",
              minHeight: 80,
            }}
          />

          {/* 底部操作区域 */}
          <View className={"flex-row justify-between"}>
            {/* 左侧按钮组 */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              {/* 设置按钮 */}
              <TouchableOpacity
                disabled={isDisabled}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#f5f5f5",
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 8,
                  gap: 6,
                  opacity: isDisabled ? 0.5 : 1,
                }}
              >
                <Ionicons name="settings-outline" size={18} color="#666" />
                <Text style={{ color: "#666", fontSize: 14 }}>设置</Text>
              </TouchableOpacity>
            </View>

            {/* 右侧发送按钮 */}
            <TouchableOpacity
              onPress={confirm}
              disabled={isDisabled || isPending}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: isDisabled ? "#999" : "#000",
                justifyContent: "center",
                alignItems: "center",
                opacity: isDisabled ? 0.6 : 1,
              }}
            >
              {isPending ? (
                <SpinningIcon name="circle-notch" size={24} color="#fff" />
              ) : (
                <Ionicons name="arrow-up" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* 说明文字 */}
        <Text
          style={{
            marginTop: 12,
            fontSize: 12,
            color: "#999",
            textAlign: "center",
          }}
        >
          视频每秒消耗1积分, 实际消耗与最终输出的视频时长相关
        </Text>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default Starter;
