import { ExpoConfig, ConfigContext } from "@expo/config";

const config = ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Veogo",
  slug: "veogo",
  version: "2.0.10",
  runtimeVersion: "2.0.10",
  orientation: "portrait",
  icon: "./src/assets/images/app_icon.png",
  scheme: "veogoapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.tuturduck.veogoapp",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSCameraUsageDescription:
        "我们需要访问您的相机，以便您可以拍摄个人头像、扫描文档或在聊天中分享实时照片。所有照片仅用于您指定的功能，不会未经您同意分享给第三方",
      NSPhotoLibraryUsageDescription:
        "我们需要访问您的照片库，以便您可以选择并上传照片作为个人资料图片、分享图片给其他用户，或保存应用内生成的图片到您的设备。您可以选择仅授权访问特定照片而非整个照片库",
      LSApplicationQueriesSchemes: ["xhsdiscover", "itms-apps"],
      NSUserTrackingUsageDescription:
        "我们希望获取您的设备广告标识符（IDFA），以便为您提供更加个性化的广告体验和内容推荐。我们承诺不会将您的信息用于未经您授权的用途，也不会将您的数据泄露给第三方。您可以随时在系统设置中管理您的授权。无论您是否授权，您都可以正常使用本应用的所有核心功能",
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
      },
    },
    entitlements: {
      "com.apple.developer.applesignin": ["Default"],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./src/assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    // edgeToEdgeEnabled: true,
    package: "com.tuturduck.veogoapp",
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./src/assets/images/favicon.png",
  },
  plugins: ["expo-router"],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    ENV: process.env.ENV, // 对应 eas.json中的ENV
    router: {},
    eas: {
      projectId: "8d0ef25f-b839-4094-b191-49f57d2c4e4d",
    },
    // 从环境变量读取密钥，不要硬编码
    TOS_ACCESS_KEY_ID: process.env.TOS_ACCESS_KEY_ID,
    TOS_ACCESS_KEY_SECRET: process.env.TOS_ACCESS_KEY_SECRET,
    OSS_ACCESSKEY: process.env.OSS_ACCESSKEY,
    OSS_ACCESSSECRET: process.env.OSS_ACCESSSECRET,
    ACCESSKEY: process.env.ACCESSKEY,
    ACCESSSECRET: process.env.ACCESSSECRET,
  },
  updates: {
    url: "https://u.expo.dev/8d0ef25f-b839-4094-b191-49f57d2c4e4d",
  },
});

export default config;
