import { replaceWorkflow } from "@/api/workflow";
import XImageViewer from "@/components/XImageViewer";
import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

interface JobProps {
    index: number;
    job: any;
    asset: any;
    refetch: () => void;
}

const Job = ({ index, job, asset, refetch }: JobProps) => {
    const { colors } = useTailwindVars();
    const [editingScript, setEditingScript] = React.useState(false);
    const [scriptValue, setScriptValue] = React.useState('');
    const [updatingScript, setUpdatingScript] = React.useState(false);

    const data = asset?.workflow?.dataBus?.segmentScript;
    const script = data?.script;
    const images = data?.images;
    const editable = job.status === 'confirming';

    const handleSaveScript = async (index: number) => {
        const currentWorkflow = asset?.workflow;
        if (!currentWorkflow) return;

        setUpdatingScript(true);
        try {
            const newWorkflow = {
                ...currentWorkflow,
                dataBus: {
                    ...currentWorkflow.dataBus,
                    segmentScript: {
                        script: scriptValue,
                    },
                }
            }

            await replaceWorkflow(newWorkflow);
            setEditingScript(false);
            refetch();
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "脚本更新失败");
        } finally {
            setUpdatingScript(false);
        }
    };

    return <ScrollView>
        <View className="p-5">
            {
                images && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 gap-3 py-2">
                        {images?.map((image: any, idx: number) => (
                            <View key={idx} className={`w-28 aspect-[9/16] object-contain bg-card rounded-lg overflow-hidden ${idx !== 0 ? 'ml-2' : ''}`}>
                                <XImageViewer defaultIndex={idx} images={images}>
                                    <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
                                </XImageViewer>
                            </View>
                        ))}
                    </ScrollView>
                )
            }
            {!editingScript && editable && (
                <View className="mb-2 flex-row justify-end">
                    <TouchableOpacity
                        onPress={() => {
                            setScriptValue(script || '');
                            setEditingScript(true);
                        }}
                        className="flex-row items-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm"
                    >
                        <Feather name="edit-2" size={12} color="#6b7280" />
                        <Text className="text-xs text-gray-500 font-medium">编辑脚本</Text>
                    </TouchableOpacity>
                </View>
            )}

            {editingScript ? (
                <View className=" h-full bg-background rounded-xl border border-primary/20 p-1">
                    <View className="bg-gray-50 p-2 flex-row justify-between items-center rounded-t-lg border-b border-gray-100">
                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={() => setEditingScript(false)}
                                disabled={updatingScript}
                                className="px-3 py-1 bg-gray-200 rounded-lg"
                            >
                                <Text className="text-xs text-gray-600">取消</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleSaveScript(index)}
                                disabled={updatingScript}
                                className="px-3 py-1 bg-primary rounded-lg flex-row items-center gap-1"
                            >
                                {updatingScript && <ActivityIndicator size="small" color="white" />}
                                <Text className="text-xs text-white font-bold">保存</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <TextInput
                        value={scriptValue}
                        onChangeText={setScriptValue}
                        multiline
                        className="p-3 text-sm text-gray-800 leading-6 min-h-[200px]"
                        style={{ textAlignVertical: 'top' }}
                        placeholder="输入脚本内容..."
                    />
                </View>
            ) : (
                <View className="p-4 rounded-xl ">
                    <Text className="text-sm text-gray-700 leading-6">{script}</Text>
                </View>
            )}
        </View>
    </ScrollView>
};

export default Job;

