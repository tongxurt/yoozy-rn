import * as Updates from "expo-updates";

import Constants from "expo-constants";

//用js的好处是 更改不需要重新打包
export const getConfig = () => {
  const productionConfig = {
    ENV: "production",
    API_URL: "https://y.yoozyai.com",

    TOS_ACCESS_KEY_ID: "AKLTNGUxNTUwYmEyODQwNGU1MjgzMzcwNDFiZDEyZWU4MGU",
    TOS_ACCESS_KEY_SECRET:
      "TVRSallqQmlNR1EwTnpkbE5HSmlNemczWkRBMU9UWmlaRGcwTVRFMk5qVQ==",
    TOS_REGION: "cn-shanghai",
    TOS_ENDPOINT: "tos-cn-shanghai.volces.com",
    TOS_BUCKET: "yoozyres",

    STORAGE: "oss",

    OSS_ACCESSKEY: "LTAI5t7zcYu63DW8JrCNYRwc",
    OSS_ACCESSSECRET: "yR6RznPnoCltvPQSUg8pvBca6YdML5",
    OSS_BUCKET: "yoozy",
    OSS_REGION: "oss-cn-hangzhou",
    OSS_ENDPOINT: "https://oss-cn-hangzhou.aliyuncs.com",

    QINIU_ENDPOINT: "https://res.veogo.cn",
    QINIU_BUCKET: "veogo",

    // ACCESSKEY: 'AKIASHR3RADJRYVND4PV',
    // ACCESSSECRET: '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',
    // REGION: 'ap-southeast-1',
    // BUCKET: 'veogoresources'
    // ENDPOINT: "https://veogoresources.s3.ap-southeast-1.amazonaws.com"

    ACCESSKEY: "AKIAXJQYBNKMHPX6P3PJ",
    ACCESSSECRET: "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",
    REGION: "cn-north-1",
    BUCKET: "veogoresources",
    ENDPOINT: "https://veogoresources.s3.cn-north-1.amazonaws.com.cn",
  };

  const configs = {
    development: productionConfig,
    preview: productionConfig,
    production: productionConfig,
  } as any;

  if (Updates.channel) {
    return configs[Updates.channel] || configs["production"];
  } else {
    return configs[Constants.expoConfig?.extra?.["ENV"] || "production"];
  }
};
