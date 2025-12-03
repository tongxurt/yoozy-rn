import React from "react";
import { View } from "react-native";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";

interface SessionSkeletonProps {
  tab: number;
}

export const SessionSkeleton: React.FC<SessionSkeletonProps> = ({ tab }) => {
  if (tab === 1) {
    return (
      <View className="flex-1">
        <View className="px-5 pt-3 pb-4">
          <View className="gap-5">
            {/* 智能分析中提示 */}
            <View className="bg-plain rounded-2xl p-3.5">
              <View className="flex-row items-center gap-3">
                <SkeletonLoader width={40} height={40} circle />
                <View className="flex-1 gap-2">
                  <SkeletonLoader width="60%" height={16} />
                  <SkeletonLoader width="80%" height={12} />
                </View>
              </View>
            </View>

            {/* 商品信息和卖点骨架 */}
            <View className="bg-plain rounded-2xl p-3.5 gap-5">
              {/* 商品信息标题 */}
              <View className="gap-3">
                <View className="flex-row items-center gap-2">
                  <SkeletonLoader width={16} height={16} />
                  <SkeletonLoader width={100} height={16} />
                </View>
                <SkeletonLoader width="100%" height={120} />
              </View>

              {/* 卖点分析 */}
              <View className="gap-3">
                <View className="flex-row items-center gap-2">
                  <SkeletonLoader width={16} height={16} />
                  <SkeletonLoader width={100} height={16} />
                </View>
                <View className="gap-2">
                  {[1, 2, 3].map((i) => (
                    <View key={i} className="flex-row items-start gap-2">
                      <SkeletonLoader width={20} height={20} circle />
                      <View className="flex-1 gap-1.5">
                        <SkeletonLoader width="90%" height={14} />
                        <SkeletonLoader width="70%" height={12} />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (tab === 2) {
    return (
      <View className="flex-1">
        <View className="px-5 pt-3 pb-4">
          <View className="gap-3">
            {/* 模板推荐提示 */}
            <View className="bg-plain rounded-2xl p-3.5">
              <View className="flex-row items-center gap-3">
                <SkeletonLoader width={40} height={40} circle />
                <View className="flex-1 gap-2">
                  <SkeletonLoader width="50%" height={16} />
                  <SkeletonLoader width="70%" height={12} />
                </View>
              </View>
            </View>

            {/* 模板列表骨架 */}
            {[1, 2, 3].map((i) => (
              <View key={i} className="bg-plain rounded-2xl p-3 gap-3">
                <View className="flex-row items-center gap-3">
                  <SkeletonLoader width={24} height={24} circle />
                  <View className="flex-1 gap-2">
                    <SkeletonLoader width="60%" height={16} />
                    <SkeletonLoader width="40%" height={12} />
                  </View>
                </View>
                <SkeletonLoader width="100%" height={200} />
                <View className="gap-2">
                  <SkeletonLoader width="100%" height={14} />
                  <SkeletonLoader width="80%" height={14} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  if (tab === 3) {
    return (
      <View className="flex-1 px-5 pt-4">
        <View className="gap-4 flex-1">
          <View className="gap-5">
            {/* 标题 */}
            <View className="flex-row gap-2">
              <SkeletonLoader width={16} height={16} />
              <SkeletonLoader width={120} height={16} />
            </View>

            {/* 加载状态 */}
            <View className="flex-row gap-3 items-center">
              <SkeletonLoader width={15} height={15} circle />
              <SkeletonLoader width={100} height={14} />
            </View>

            {/* 风格和策略 */}
            <View className="bg-plain rounded-lg p-3 gap-3">
              <View className="gap-2">
                <SkeletonLoader width={60} height={12} />
                <SkeletonLoader width="100%" height={16} />
              </View>
              <View className="gap-2">
                <SkeletonLoader width={60} height={12} />
                <SkeletonLoader width="100%" height={16} />
              </View>
            </View>

            {/* 脚本分段 */}
            <View className="gap-3">
              <SkeletonLoader width={150} height={16} />
              {[1, 2].map((i) => (
                <View
                  key={i}
                  className="bg-plain rounded-lg overflow-hidden p-5 gap-5"
                >
                  {/* 头部 */}
                  <View className="flex-row items-center gap-3">
                    <SkeletonLoader width={40} height={40} circle />
                    <View className="flex-1">
                      <SkeletonLoader width={60} height={12} />
                    </View>
                    <SkeletonLoader width={60} height={24} />
                  </View>

                  {/* 文案 */}
                  <View className="gap-2">
                    <SkeletonLoader width={80} height={12} />
                    <SkeletonLoader width="100%" height={14} />
                    <SkeletonLoader width="90%" height={14} />
                  </View>

                  {/* 视频 */}
                  <View className="gap-2">
                    <SkeletonLoader width={100} height={12} />
                    <SkeletonLoader width="100%" height={200} />
                  </View>

                  {/* 按钮 */}
                  <View className="flex-row gap-3">
                    <SkeletonLoader width="50%" height={40} />
                    <SkeletonLoader width="50%" height={40} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  }

  return null;
};
