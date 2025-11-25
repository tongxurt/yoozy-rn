import {TosClient} from '@volcengine/tos-sdk';
import {calculateMD5, getFileExtension, RNFile, uploadWithProgress} from "@/utils/upload/utils";
import {getConfig} from "@/config";


// 修改：适配 React Native 文件类型
const generateFileName = async (file: RNFile): Promise<string> => {
    const md5 = await calculateMD5(file);
    const extension = getFileExtension(file.name || file.uri);
    return `${md5}.${extension}`;
};

/**
 * 修改：使用 FileSystem.uploadAsync 替代 axios 进行单文件上传
 * 保持原有的逻辑结构不变
 */
export const upload = async (file: RNFile, onProgressChange?: (p: number) => void): Promise<string> => {
    try {
        onProgressChange?.(0);
        const filename = await generateFileName(file);

        const client = new TosClient({
            accessKeyId: getConfig().TOS_ACCESS_KEY_ID,
            accessKeySecret: getConfig().TOS_ACCESS_KEY_SECRET,
            region: getConfig().TOS_REGION,
            endpoint: getConfig().TOS_ENDPOINT,
            bucket: getConfig().TOS_BUCKET,
        });

        const signedUrl = client.getPreSignedUrl({
            key: filename,
            method: 'PUT',
        });

        console.log(signedUrl);

        const response = await fetch(file.uri);
        const blob = await response.blob();

        await uploadWithProgress(
            signedUrl,
            blob,
            file.type,
            onProgressChange
        );

        return `https://${getConfig().TOS_BUCKET}.${getConfig().TOS_ENDPOINT}/${filename}`;
    } catch (error) {
        console.error('Upload Error:', error);
        throw error;
    }
};
