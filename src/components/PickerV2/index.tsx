import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";

interface MediaItem {
  uri: string;
  type: "image" | "video";
  duration?: number;
  id: string;
}

const Picker = ({
  files,
  onFilesChange,
}: {
  files: MediaItem[];
  onFilesChange: (items: MediaItem[]) => void;
}) => {
  // 请求媒体权限
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return false;
    }
    return true;
  };

  // 选择图片
  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets) {
      const newFiles = result.assets.map((asset, index) => ({
        uri: asset.uri,
        type: asset.type === "video" ? "video" : ("image" as "image" | "video"),
        duration: asset.duration,
        id: `${Date.now()}-${index}`,
      }));

      // @ts-ignore
      onFilesChange([...files, ...newFiles]);
    }
  };

  // 移除文件
  const removeFile = (id: string) => {
    onFilesChange(files.filter((file) => file.id !== id));
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={"mb-5"}
      contentContainerStyle={{ paddingRight: 10 }}
    >
      {/* 上传素材按钮 */}
      <TouchableOpacity
        onPress={pickImage}
        className={
          "w-24 h-24 bg-gray-100 rounded-xl border-2 border-dashed border-gray-100 items-center justify-center mr-3"
        }
        activeOpacity={0.7}
      >
        <Ionicons name="camera-outline" size={25} />
        <Text className={"text-gray-500 text-xs mt-2"}>上传素材</Text>
      </TouchableOpacity>

      {/* 已上传的文件预览 */}
      {files.map((file) => (
        <View key={file.id} className={"relative mr-3"}>
          <Image
            source={{ uri: file.uri }}
            className={"w-24 h-24 rounded-xl"}
            resizeMode="cover"
          />
          {/* 删除按钮 */}
          <TouchableOpacity
            className={"absolute top-1 right-1 bg-black/70 rounded-full p-1"}
            onPress={() => removeFile(file.id)}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={14} color="white" />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

export default Picker;
