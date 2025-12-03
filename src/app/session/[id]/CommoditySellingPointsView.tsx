import { Text, TextInput, View } from "react-native";
import PulseLoader from "@/components/PulseLoader";
import React, { useState } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import useTailwindVars from "@/hooks/useTailwindVars";

const EditableText = ({
  value,
  onConfirm,
  editable,
}: {
  value: string;
  onConfirm: (text: string) => void;
  editable?: boolean;
}) => {
  const { colors } = useTailwindVars();

  const [tmpText, setTmpText] = useState(value);

  return (
    <View className={"items-center gap-1 flex-row"}>
      <TextInput
        multiline
        editable={editable}
        style={{ fontSize: 15 }}
        className={"text-grey1 flex-1 text-sm"}
        value={tmpText || value}
        onChangeText={setTmpText}
        onBlur={() => {
          onConfirm(tmpText);
          setTmpText("");
        }}
      />

      {editable && (
        <MaterialCommunityIcons
          name="square-edit-outline"
          size={17}
          color={colors.grey2}
        />
      )}
    </View>
  );
};

const CommoditySellingPointsView = ({ data }: { data: any }) => {
  const onConfirm = (text: string) => {};

  return (
    <View className={"gap-5"}>
      {data?.status === "commoditySellingPointsSelecting" && (
        <View className={"flex-row gap-3 items-center"}>
          <PulseLoader size={15} />
          <Text className={"text-white"}>正在解析商品卖点</Text>
        </View>
      )}
      {data?.commodity?.targetAudience?.[0] && (
        <View className={"gap-1"}>
          <Text className={"text-white/90 text-base font-medium"}>
            目标受众
          </Text>
          <EditableText
            editable={data?.status === "commoditySellingPointsSelected"}
            value={data?.commodity?.targetAudience?.[0]}
            onConfirm={onConfirm}
          />
        </View>
      )}
      {data?.commodity?.sellingPoints?.[0] && (
        <View className={"gap-1"}>
          <Text className={"text-white/90 text-base font-medium"}>
            目标卖点
          </Text>
          <EditableText
            editable={data?.status === "commoditySellingPointsSelected"}
            value={data?.commodity?.sellingPoints?.[0]}
            onConfirm={onConfirm}
          />
        </View>
      )}
    </View>
  );
};

export default CommoditySellingPointsView;
