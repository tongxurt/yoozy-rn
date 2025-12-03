import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PulseLoader from "@/components/PulseLoader";
import React, { useMemo, useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import { router } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import useTailwindVars from "@/hooks/useTailwindVars";
import usePicker from "@/hooks/usePicker";
import { upload } from "@/utils/upload/tos";
import { performSingleUpload } from "@/utils/upload/oss_bak";
import { useMutation } from "@tanstack/react-query";
import { compositeProduction, updateProduction } from "@/api/session";
import { Toast } from "react-native-toast-notifications";
import SpinningIcon from "@/components/loading";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

const ScriptGenerateView = ({
  data,
  onReload,
}: {
  data: any;
  onReload: () => void;
}) => {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCompositing, setIsCompositing] = useState(false);
  const { mutate: updateProductionMutation } = useMutation({
    mutationFn: updateProduction,
    onSettled: () => {
      setUploadingIndex(null);
    },
    onSuccess: (res, variables) => {
      if (!res.data.code) {
        Toast.show("成功");
        onReload();
        return;
      }
    },
    onError: (error: any) => {
      Toast.show("创建失败");
    },
  });
  const { mutate: compositeProductionMutation } = useMutation({
    mutationFn: compositeProduction,
    onSettled: () => {
      setIsCompositing(false);
    },
    onSuccess: (res, variables) => {
      if (!res.data.code) {
        Toast.show("成功");
        onReload();
        return;
      }
    },
    onError: (error: any) => {
      Toast.show("创建失败");
    },
  });

  const { colors } = useTailwindVars();

  const { pick } = usePicker();

  const script = data?.script;

  const handleUploadProduction = async (segmentIndex: number) => {
    setUploadingIndex(segmentIndex);
    try {
      // 处理上传成片逻辑
      console.log("上传成片", segmentIndex);

      const result = await pick({ mediaTypes: ["videos"] });

      if (result?.length) {
        const r = await upload(result[0]);

        console.log({
          id: data._id,
          url: r,
          index: segmentIndex.toString(),
        });

        updateProductionMutation({
          id: data._id,
          url: r,
          index: segmentIndex.toString(),
        });
      } else {
        setUploadingIndex(null);
      }
    } catch (error) {
      console.log(error, 1231231);
      setUploadingIndex(null);
    }
  };

  const handleAIGenerate = (segmentIndex: number) => {
    // 处理AI生成逻辑
    console.log("AI生成", segmentIndex);
  };

  const state = useMemo(() => {
    const segments = data?.script?.segments;

    const done = segments?.filter((x: any) => x.production)?.length || 0;

    return {
      done,
      total: segments?.length,
      ok: done && done === segments?.length,
      showDownload: data?.status === "completed_generated",
    };
  }, [data]);

  const handleDownload = async () => {
    if (!data?.production) {
      Toast.show("没有可下载的视频", { type: "warning" });
      return;
    }

    setIsDownloading(true);

    try {
      // 1. 请求相册权限
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Toast.show("需要相册权限才能保存视频", { type: "warning" });
        setIsDownloading(false);
        return;
      }

      // 2. 下载视频到本地临时文件
      const videoUrl = data.production;
      const fileExtension = videoUrl.split(".").pop()?.split("?")[0] || "mp4";
      const fileName = `video_${Date.now()}.${fileExtension}`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      Toast.show("开始下载...", { type: "normal" });

      const downloadResult = await FileSystem.downloadAsync(videoUrl, fileUri);

      if (downloadResult.status !== 200) {
        throw new Error("下载失败");
      }

      // 3. 保存到相册
      const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
      await MediaLibrary.createAlbumAsync("Yoozy", asset, false);

      Toast.show("视频已保存到相册", { type: "success" });

      // 4. 清理临时文件
      try {
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
      } catch (cleanupError) {
        console.log("清理临时文件失败:", cleanupError);
      }
    } catch (error) {
      console.error("下载失败:", error);
      Toast.show("下载失败，请稍后重试", { type: "danger" });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOneClickProduction = () => {
    console.log("一键成片");
    setIsCompositing(true);
    compositeProductionMutation({ id: data._id });
  };

  return (
    <View className={"gap-4 flex-1"}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className={"gap-5"}>
          <View className={"flex-row gap-2"}>
            <MaterialCommunityIcons
              name="alarm-light-outline"
              size={16}
              color={colors.white}
            />
            <Text className={"text-white text-md font-semibold"}>
              生成爆款脚本
            </Text>
          </View>

          {/* 加载状态 */}
          {data?.status === "scriptGenerating" && (
            <View className={"flex-row gap-3 items-center"}>
              <PulseLoader size={15} />
              <Text className={"text-white"}>正在生成脚本</Text>
            </View>
          )}

          {/* 总体风格 */}
          {script && (
            <View className={"gap-3 bg-plain rounded-lg p-3"}>
              <View className={"border-l-2 border-primary pl-3 gap-2"}>
                <Text className={"text-white/60 text-xs"}>风格定位</Text>
                <Text className={"text-white/80 text-sm font-medium leading-5"}>
                  {script.style}
                </Text>
              </View>
              <View className={"border-l-2 border-primary pl-3 gap-2"}>
                <Text className={"text-white/60 text-xs"}>内容策略</Text>
                <Text className={"text-white/80 text-sm font-medium leading-5"}>
                  {script.contentStyle}
                </Text>
              </View>
            </View>
          )}

          {/* 分段列表 */}
          {script?.segments && (
            <View className={"flex-1"}>
              <View className={"pb-3"}>
                <Text className={"text-white text-md font-semibold"}>
                  脚本分段{" "}
                  <Text className={"text-grey1 text-sm font-normal"}>
                    ({script.segments.length})
                  </Text>
                </Text>
              </View>
              <FlatList
                data={script.segments}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
                ItemSeparatorComponent={() => <View className={"h-4"} />}
                renderItem={({ item, index }) => {
                  const timeStart = item.reference?.timeStart || 0;
                  const timeEnd = item.reference?.timeEnd || 0;
                  const duration = timeEnd - timeStart;

                  return (
                    <View
                      className={
                        "bg-plain rounded-lg overflow-hidden p-5 gap-5"
                      }
                    >
                      {/* 头部：序号 + 时间 */}
                      <View className={"flex-row items-center gap-3"}>
                        <View
                          className={
                            "w-10 h-10 bg-primary rounded-full items-center justify-center"
                          }
                        >
                          <Text
                            className={"text-[white] font-semibold text-sm"}
                          >
                            {index + 1}
                          </Text>
                        </View>
                        <View className={"flex-1"}>
                          <Text className={"text-grey1 text-xs"}>
                            {duration.toFixed(1)}s
                          </Text>
                        </View>
                        {/* 镜头类型 */}
                        {item.stage?.name && (
                          <View
                            className={
                              "px-3 py-1 rounded-md bg-primary/10 border border-primary/5"
                            }
                          >
                            <Text
                              className={"text-xs text-primary font-medium"}
                            >
                              {item.stage?.name}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* 字幕文案 */}
                      <View className={""}>
                        <Text
                          className={
                            "text-grey0 text-xs mb-2 border-l-2 border-primary pl-2"
                          }
                        >
                          口播文案
                        </Text>
                        <View className={""}>
                          <Text
                            className={"text-white text-sm leading-relaxed"}
                          >
                            {item.content?.subtitle}
                          </Text>
                        </View>
                      </View>

                      {/* 参考视频画面 */}
                      <View className={""}>
                        <Text
                          className={
                            "text-grey0 text-xs mb-2 border-l-2 border-primary pl-2"
                          }
                        >
                          参考视频画面
                        </Text>
                        <View className={"rounded-lg overflow-hidden"}>
                          <VideoPlayer
                            videoUri={item.reference?.url}
                            timeStart={timeStart}
                            timeEnd={timeEnd}
                          />
                        </View>
                      </View>

                      {/* 场景描述 */}
                      {item.desc && (
                        <View className={""}>
                          <Text
                            className={
                              "text-grey0 text-xs mb-1  border-l-2 border-primary pl-2"
                            }
                          >
                            场景描述
                          </Text>
                          <Text
                            className={"text-white text-sm leading-relaxed"}
                          >
                            {item.desc}
                          </Text>
                        </View>
                      )}

                      {/* 操作按钮 */}
                      <View className={"flex-row gap-3"}>
                        <TouchableOpacity
                          onPress={() => handleUploadProduction(index)}
                          className={`flex-1 bg-white/5 border border-white/10 rounded-lg py-3 items-center ${
                            item.production
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          activeOpacity={0.7}
                          disabled={uploadingIndex === index || item.production}
                        >
                          <Text
                            className={`text-white text-sm font-medium ${
                              uploadingIndex === index
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            {uploadingIndex === index ? (
                              <SpinningIcon
                                name="circle-notch"
                                size={15}
                                color="#333"
                              />
                            ) : item.production ? (
                              "已上传"
                            ) : (
                              "上传成片"
                            )}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleAIGenerate(index)}
                          className={`flex-1 bg-primary rounded-lg py-3 items-center ${
                            item.production
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          activeOpacity={0.7}
                        >
                          <Text className={"text-plain text-sm font-medium"}>
                            AI生成
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* 成片 */}
                      {item.production && (
                        <View className={"border-t border-white/5"}>
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
        {state.showDownload ? (
          <TouchableOpacity
            onPress={handleDownload}
            activeOpacity={0.7}
            disabled={isDownloading}
            className={`rounded-full py-4 items-center flex-row justify-center gap-2 ${
              state.ok ? "bg-primary" : "bg-white/5"
            } ${isDownloading ? "opacity-70" : ""}`}
          >
            {isDownloading && (
              <SpinningIcon name="circle-notch" size={16} color="white" />
            )}
            <Text
              className={`text-white text-sm font-medium ${
                state.ok ? "text-plain" : "text-white"
              }`}
            >
              {isDownloading
                ? "下载中..."
                : state.ok
                ? "下载视频"
                : `已完成${state.done}/${state.total}`}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleOneClickProduction}
            activeOpacity={0.7}
            disabled={!state.ok || isCompositing}
            className={`rounded-full py-4 items-center flex-row justify-center gap-2 ${
              state.ok ? "bg-primary" : "bg-white/5"
            } ${isCompositing ? "opacity-70" : ""}`}
          >
            {isCompositing && (
              <SpinningIcon name="circle-notch" size={16} color="white" />
            )}
            <Text
              className={`text-white text-sm font-medium ${
                state.ok ? "text-plain" : "text-white"
              }`}
            >
              {isCompositing
                ? "合成中..."
                : state.ok
                ? "一键成片"
                : `已完成${state.done}/${state.total}`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ScriptGenerateView;
