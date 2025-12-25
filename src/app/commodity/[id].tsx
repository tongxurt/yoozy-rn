import { getCommodity } from "@/api/commodity";
import ScreenContainer from "@/components/ScreenContainer";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState, } from "react";
import {
    Dimensions,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function CommodityDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { colors } = useTailwindVars();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [showAllImages, setShowAllImages] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["commodity", id],
        queryFn: () => getCommodity(id!),
        enabled: !!id,
    });

    const commodity = data?.data?.data;

    const images = useMemo(() => {
        return commodity?.images || commodity?.medias?.map((m: any) => m.url) || [];
    }, [commodity]);

    const displayedImages = useMemo(() => {
        if (showAllImages) {
            return images;
        }
        return images.slice(0, 5);
    }, [images, showAllImages]);

    const hasMoreImages = !showAllImages && images.length > 5;

    if (isLoading) {
        return (
            <ScreenContainer className="flex-1 bg-background" edges={['bottom']}>
                <SkeletonLoader width={screenWidth} height={screenHeight * 0.55} />
                <View className="flex-1 -mt-8 bg-background rounded-t-3xl p-6 gap-6">
                    <View className="gap-2">
                        <SkeletonLoader width="30%" height={14} />
                        <SkeletonLoader width="80%" height={28} />
                    </View>
                    <SkeletonLoader width="100%" height={100} />
                    <SkeletonLoader width="100%" height={150} />
                </View>
            </ScreenContainer>
        );
    }
    const carouselHeight = screenHeight * 0.55;

    return (
        <ScreenContainer className="flex-1 bg-background" edges={[]}>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
            >
                {/* Immersive Horizontal Image List */}
                <View style={{ height: carouselHeight, width: screenWidth }} className="relative bg-background2">
                    <View className="absolute z-10 top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/40 to-transparent" pointerEvents="none" />

                    {images.length > 0 ? (
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            className="flex-1"
                        >
                            {displayedImages.map((img: string, index: number) => (
                                <View key={index} style={{ width: screenWidth, height: carouselHeight }}>
                                    <Image
                                        source={{ uri: img }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                </View>
                            ))}

                            {/* Load All Button as last item if has more */}
                            {hasMoreImages && (
                                <View style={{ width: screenWidth, height: carouselHeight }} className="items-center justify-center bg-black/90">
                                    <Image
                                        source={{ uri: images[4] }}
                                        className="absolute w-full h-full opacity-30"
                                        blurRadius={10}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowAllImages(true)}
                                        className="bg-white px-8 py-4 rounded-full flex-row items-center gap-2"
                                        activeOpacity={0.8}
                                    >
                                        <Text className="text-black font-bold tracking-widest text-sm">
                                            查看全部 {images.length} 张图片
                                        </Text>
                                        <Feather name="arrow-right" size={16} color="black" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </ScrollView>
                    ) : (
                        <View className="flex-1 items-center justify-center bg-grey5">
                            <Feather name="image" size={48} color={colors.grey3} />
                        </View>
                    )}
                </View>

                {/* Content Container */}
                <View className="flex-1 -mt-8 bg-background rounded-t-[32px] overflow-hidden">
                    <View className="px-6 pt-8 pb-4">
                        {/* Header: Brand Only */}
                        {!!commodity.brand && (
                            <View className="flex-row items-center mb-3">
                                <Text className="text-grey1 text-xs font-bold tracking-[0.2em] uppercase opacity-80">
                                    {commodity.brand}
                                </Text>
                            </View>
                        )}

                        {/* Title */}
                        <Text className="text-black text-xl font-light leading-8 tracking-tight mb-2">
                            {commodity.title}
                        </Text>

                        {/* Subtitle / Name */}
                        {!!commodity.name && (
                            <Text className="text-grey1 text-xs font-normal leading-5 opacity-80 mb-4">
                                {commodity.name}
                            </Text>
                        )}

                        {/* Tags */}
                        {commodity.tags && commodity.tags.length > 0 && (
                            <View className="flex-row flex-wrap gap-2 mb-6">
                                {commodity.tags.map((tag: string, index: number) => (
                                    <View key={index} className="bg-background2 px-3 py-1.5 rounded-lg">
                                        <Text className="text-grey1 text-[11px] font-medium">#{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        <View className="h-[1px] bg-divider w-full my-6 opacity-50" />

                        {/* Description - Collapsible */}
                        {!!commodity.description && (
                            <View className="mb-8">
                                <Text
                                    className="text-black/90 text-[14px] leading-6 font-light tracking-wide text-justify"
                                    numberOfLines={isDescriptionExpanded ? undefined : 3}
                                >
                                    {commodity.description}
                                </Text>
                                {/* Toggle Button */}
                                {(commodity.description.length > 100) && (
                                    <TouchableOpacity
                                        onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                        className="mt-2 flex-row items-center"
                                    >
                                        <Text className="text-black/60 text-xs font-medium mr-1">
                                            {isDescriptionExpanded ? '收起' : '展开阅读'}
                                        </Text>
                                        <Feather
                                            name={isDescriptionExpanded ? "chevron-up" : "chevron-down"}
                                            size={12}
                                            color={colors.grey1}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {/* Insights / Marketing Combinations / Chances - Horizontal Layout */}
                        {(commodity.chances && commodity.chances.length > 0) && (
                            <View className="-mx-6">
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
                                    className="pb-8"
                                >
                                    {commodity.chances.map((chance: any, cIdx: number) => (
                                        <View
                                            key={cIdx}
                                            className="bg-background2/50 rounded-2xl p-5 w-[260px] border border-divider/50 shadow-sm"
                                        >
                                            {/* Header: Target Audience */}
                                            {chance.targetAudience?.name && (
                                                <View className="mb-4 flex-row items-center justify-between">
                                                    <View className="bg-white px-2.5 py-1.5 rounded-lg border border-divider shadow-sm">
                                                        <Text className="text-black text-[10px] font-bold tracking-wide">
                                                            {chance.targetAudience.name}
                                                        </Text>
                                                    </View>
                                                    <Feather name="target" size={14} color={colors.grey2} />
                                                </View>
                                            )}

                                            {/* Divider */}
                                            {chance.targetAudience?.name && chance.sellingPoints?.length > 0 && (
                                                <View className="h-[1px] bg-divider/10 mb-4 w-full" />
                                            )}

                                            {/* Selling Points List */}
                                            {chance.sellingPoints?.length > 0 && (
                                                <View className="gap-2">
                                                    {chance.sellingPoints.map((point: any, pIdx: number) => (
                                                        <View key={pIdx} className="flex-row items-start gap-2">
                                                            <View className="mt-1.5 w-1 h-1 rounded-full bg-primary" />
                                                            <Text
                                                                className="flex-1 text-grey1/80 text-[11px] leading-4"
                                                                numberOfLines={3}
                                                            >
                                                                {point?.description || point}
                                                            </Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>



        </ScreenContainer>
    );
}
