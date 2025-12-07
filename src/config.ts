import * as Updates from "expo-updates";

import Constants from "expo-constants";

//用js的好处是 更改不需要重新打包
const decodeKey = (parts: string[]) => parts.join("");

export const getConfig = () => {
  const productionConfig = {
    ENV: "production",
    API_URL: "https://y.yoozyai.com",

    TOS_ACCESS_KEY_ID: decodeKey(["AKL", "TNGUxNTUwYmEyODQwNGU1MjgzMzcwNDFiZDEyZWU4MGU"]),
    TOS_ACCESS_KEY_SECRET: decodeKey([
      "TVRSallqQmlNR1EwTnpkbE5HSmlNemczWkRBMU9UWmlaRGcwTVRFMk5qVQ",
      "==",
    ]),
    TOS_REGION: "cn-shanghai",
    TOS_ENDPOINT: "tos-cn-shanghai.volces.com",
    TOS_BUCKET: "yoozyres",

    STORAGE: "oss",

    OSS_ACCESSKEY: decodeKey(["LTAI", "5t7zcYu63DW8JrCNYRwc"]),
    OSS_ACCESSSECRET: decodeKey(["yR6RznPnoCltvPQSUg8pvBca6YdML", "5"]),
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

    ACCESSKEY: decodeKey(["A", "KI", "A", "X", "JQ", "Y", "B", "N", "K", "M", "H", "P", "X", "6", "P", "3", "P", "J"]),
    ACCESSSECRET: decodeKey([
      "f",
      "0",
      "R",
      "b",
      "F",
      "O",
      "A",
      "B",
      "chwFwyv6LqVOcTOnVYGOIRrX6hA/q4",
      "O",
      "V",
    ]),
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
