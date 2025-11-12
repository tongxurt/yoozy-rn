import {Text, View} from "react-native";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {router} from "expo-router";
import {useState} from "react";
import Ionicons from '@expo/vector-icons/Ionicons';
import useTailwindVars from "@/hooks/useTailwindVars";
import {performSingleUpload} from "@/utils/upload/oss_bak";
import Picker from "@/components/Picker";
import AdvancedInput from "@/components/AdvancedInput";
import Button from "@/components/ui/Button";
import {createSession} from "@/api/session";

const Starter = () => {
    const {colors} = useTailwindVars();
    const [url, setUrl] = useState('https://v.douyin.com/POVeTk_M8gU/');
    const [files, setFiles] = useState<any[]>([]);

    const confirm = async () => {
        if (!url && !files.length) {
            return;
        }

        const images = [];

        if (files?.length) {
            for (let i = 0; i < files.length; i++) {
                const url = await performSingleUpload(files[i], (p) => {
                });
                images.push(url);
            }
        }

        const session = await createSession({url, images});
        router.navigate(`/session/${session?.data?.data?._id}`)
        // router.navigate(`/session/68fb732937bfcd7cdc1fe68f`)

    };

    const isSubmitDisabled = !url && !files.length;

    return (
        <KeyboardAwareScrollView style={{backgroundColor: colors.background}}>
            <View className={'flex-row justify-between items-center m-5'}>
                <Text className={'text-xl text-white'}>智能生成视频</Text>
                <Ionicons name="close-sharp" size={24} color={colors.grey2} onPress={() => router.back()}/>
            </View>
            <View className={'flex-1 justify-end'}>
                <View className={'mx-6 flex-col gap-5 bg-background0 rounded-[20px]'}>
                    <AdvancedInput
                        value={url}
                        placeholder={'输入抖音商品链接'}
                        autoFocus
                        onChangeText={setUrl}
                        style={{height: 150, borderWidth: 0, backgroundColor: colors.background0}}
                    />

                    <View className={'p-5'}>
                        <Picker files={files} allowedTypes={['image']} onChange={setFiles}/>
                    </View>

                    <View className={'p-5'}>
                        <Button text={'开始创作'} disabled={isSubmitDisabled} onPress={() => confirm()}/>
                    </View>
                </View>
            </View>
        </KeyboardAwareScrollView>
    );
};

export default Starter;
