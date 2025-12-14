import { StripeProvider } from "@stripe/stripe-react-native";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";

import { addEvent } from "@/api/event";
import ErrorFallback from "@/components/ErrorCallback";
import { useColors } from "@/hooks/uesColors";
import { usePermissionExecutor } from "@/hooks/usePermissionExecutor";
import { useSettings } from "@/hooks/useSettings";
import { useThemeMode } from "@/hooks/useThemeMode";
import { useTranslation } from "@/i18n/translation";
import AppThemeProvider from "@/providers/theme";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient } from "@tanstack/react-query";
import {
  PersistedClient,
  Persister,
  persistQueryClient,
  PersistQueryClientProvider,
} from "@tanstack/react-query-persist-client";
import {
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import ErrorBoundary from "react-native-error-boundary";
import "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ToastProvider } from "react-native-toast-notifications";

// @ts-ignore
Text.defaultProps = Text.defaultProps || {};
// @ts-ignore
Text.defaultProps.allowFontScaling = false;
// @ts-ignore
TextInput.defaultProps = TextInput.defaultProps || {};
// @ts-ignore
TextInput.defaultProps.allowFontScaling = false;

// export {
//     // Catch any errors thrown by the Layout component.
//     ErrorBoundary,
// } from "expo-router";

// export const unstable_settings = {
//     // Ensure that reloading on `/modal` keeps a back button present.
//     initialRouteName: '/home',
// };

// Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const createAsyncStoragePersister = (): Persister => {
    return {
      persistClient: async (client: PersistedClient) => {
        try {
          await AsyncStorage.setItem(
            "REACT_QUERY_OFFLINE_CACHE",
            JSON.stringify(client)
          );
        } catch (error) {
          console.error("Error persisting cache:", error);
        }
      },
      restoreClient: async () => {
        try {
          const stringifiedClient = await AsyncStorage.getItem(
            "REACT_QUERY_OFFLINE_CACHE"
          );
          if (stringifiedClient) {
            return JSON.parse(stringifiedClient);
          }
        } catch (error) {
          console.error("Error restoring cache:", error);
        }
        return undefined;
      },
      removeClient: async () => {
        try {
          await AsyncStorage.removeItem("REACT_QUERY_OFFLINE_CACHE");
        } catch (error) {
          console.error("Error removing cache:", error);
        }
      },
    };
  };

  const persister = createAsyncStoragePersister();

  const queryClient = new QueryClient();

  persistQueryClient({
    queryClient: queryClient,
    persister,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    buster: "",
    hydrateOptions: undefined,
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => {
        // 只持久化特定的查询
        return ["myself"].includes(query.queryKey[0] as string);
      },
    },
  });

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <ToastProvider>
        <SafeAreaProvider>
          <StripeProvider
            publishableKey="pk_live_KjsKZTP7GpgdW4PoYATjVfLK"
            merchantIdentifier="com.veogo.app"
          >
            <AppThemeProvider>
              <RootLayoutNav />
            </AppThemeProvider>
          </StripeProvider>
        </SafeAreaProvider>
      </ToastProvider>
    </PersistQueryClientProvider>
  );
}

function RootLayoutNav() {
  const { background, grey0, plain } = useColors();
  const { t } = useTranslation();
  const { themeMode, isDarkMode } = useThemeMode();

  const { fetchAsync: fetchSettings } = useSettings();
  // const {fetchAsync: fetchAccounts} = useAccounts();

  const [appReady, setAppReady] = useState<boolean>(false);

  usePermissionExecutor({
    onAllGranted: () => {
      console.log("--------------- 权限已获取");
      void addEvent({ name: "visit" });
    },
    onElse: () => {
      void addEvent({ name: "visit" });
    },
  });
  // const {fetchAsync: fetchAccounts} = useAccounts();

  useEffect(() => {
    // SplashScreen.hideAsync();
    // void checkToUpdate();
    void load();
    // void addEvent({name: "visit"})
  }, []);

  const load = async () => {
    await fetchSettings();
    // await fetchAccounts()

    setTimeout(() => {
      setAppReady(true);
    }, 1000);
  };

  // 显示自定义启动屏幕
  if (!appReady) {
    return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <SafeAreaView
          // edges={Platform.OS === "android" ? ["top","bottom"] : ["top", "bottom"]}
          edges={["top", "bottom"]}
          mode={"padding"}
          style={{
            flex: 1,
            backgroundColor: background,
          }}
        >
          {/* <StatusBar
            barStyle={isDarkMode ? "light-content" : "dark-content"}
            backgroundColor={plain}
          />
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: plain,
              },
              headerTintColor: grey0,
              headerLeft: ({ canGoBack }) =>
                canGoBack ? (
                  <TouchableOpacity
                    onPress={() => {
                      router.back();
                    }}
                    style={{
                      // width: 20,
                      // height: 20,
                      justifyContent: "center",
                      alignItems: "center",
                      marginLeft: Platform.OS === "ios" ? 0 : 8,
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Feather name="arrow-left" size={24} color={grey0} />
                  </TouchableOpacity>
                ) : null,
            }}
          >
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: plain,
                },
              }}
            />
            <Stack.Screen
              name="session/starter"
              options={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: plain,
                },
                animation: "fade",
                animationDuration: 1,
              }}
            />
            <Stack.Screen
              name="session/product"
              options={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: background,
                },
              }}
            />
            <Stack.Screen
              name="session/[id]/index"
              options={{
                // headerShown: false,
                headerTitle: t("details"),
                contentStyle: {
                  backgroundColor: background,
                },
              }}
            />
            <Stack.Screen
              name="inspiration/[id]"
              options={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: background,
                },
              }}
            />
            <Stack.Screen
              name="settings/index"
              // @ts-ignore
              options={({ navigation }) => ({
                // headerShown: false,
                title: null,
              })}
            />
            <Stack.Screen
              name="user/me"
              options={({ navigation }) => ({
                headerTitle: t("user.profile"),
              })}
            />

            <Stack.Screen
              name="login"
              options={{
                headerShown: false,
                animation: "slide_from_bottom",
              }}
            />

            <Stack.Screen
              name="(other)/accountAndSecure"
              options={{
                title: t("accountAndSecure"),
              }}
            />
            <Stack.Screen
              name="(other)/deleteAccount"
              options={{
                title: t("deleteAccount"),
              }}
            />
            <Stack.Screen
              name="(other)/community"
              options={{
                title: t("creatorCommunity"),
              }}
            />
            <Stack.Screen
              name="(other)/sub_terms"
              options={{
                title: t("subTerms"),
              }}
            />
            <Stack.Screen
              name="(other)/contact"
              options={{
                title: t("contactUs"),
              }}
            />
            <Stack.Screen
              name="(other)/problem"
              options={{
                title: t("faq"),
              }}
            />
            <Stack.Screen
              name="(other)/privacy"
              options={{
                title: t("privacyPolicy"),
              }}
            />
            <Stack.Screen
              name="(other)/terms"
              options={{
                title: t("serviceTerms"),
              }}
            />
            <Stack.Screen
              name="(other)/about"
              options={{
                title: t("aboutUs"),
              }}
            />
          </Stack> */}
        </SafeAreaView>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <SafeAreaView
        // edges={Platform.OS === "android" ? ["top","bottom"] : ["top", "bottom"]}
        edges={["top", "bottom"]}
        mode={"padding"}
        style={{
          flex: 1,
          backgroundColor: background,
        }}
      >
        {/*<OngoingQuestion/>*/}
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor={background}
        />
        {/*<Text style={{color: 'white'}}>{pathname}</Text>*/}
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: background,
            },
            headerTintColor: grey0,
            headerLeft: ({ canGoBack }) =>
              canGoBack ? (
                <TouchableOpacity
                  onPress={() => {
                    router.back();
                  }}
                  style={{
                    // width: 20,
                    // height: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    marginLeft: Platform.OS === "ios" ? 0 : 8,
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name="arrow-left" size={24} color={grey0} />
                </TouchableOpacity>
              ) : null,
          }}
        >
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              contentStyle: {
                backgroundColor: background,
              },
            }}
          />
          <Stack.Screen
            name="session/starter"
            options={{
              headerShown: false,
              contentStyle: {
                backgroundColor: background,
              },
              animation: "fade",
              animationDuration: 1,
            }}
          />
          <Stack.Screen
            name="session/createProduct"
            options={{
              headerShown: false,
              contentStyle: {
                backgroundColor: background,
              },
              animation: "fade",
              animationDuration: 1,
            }}
          />
          <Stack.Screen
            name="session/[id]/index"
            options={{
              // headerShown: false,
              headerTitle: t("details"),
              contentStyle: {
                backgroundColor: background,
              },
            }}
          />
          <Stack.Screen
            name="commodity/[id]"
            options={{
              headerTitle: "商品详情",
              contentStyle: {
                backgroundColor: background,
              },
            }}
          />
          <Stack.Screen
            name="commodity/create"
            options={{
              headerTitle: "添加商品",
              contentStyle: {
                backgroundColor: background,
              },
            }}
          />
          <Stack.Screen
            name="inspiration/[id]"
            options={{
              title: t("details"),
              contentStyle: {
                backgroundColor: background,
              },
            }}
          />

          <Stack.Screen
            name="template/[id]"
            options={{
              title: t("details"),
              contentStyle: {
                backgroundColor: background,
              },
            }}
          />
          <Stack.Screen
            name="settings/index"
            // @ts-ignore
            options={({ navigation }) => ({
              // headerShown: false,
              title: null,
            })}
          />
          <Stack.Screen
            name="user/me"
            options={({ navigation }) => ({
              headerTitle: t("user.profile"),
            })}
          />

          <Stack.Screen
            name="login"
            options={{
              headerShown: false,
              animation: "slide_from_bottom",
            }}
          />

          <Stack.Screen
            name="(other)/accountAndSecure"
            options={{
              title: t("accountAndSecure"),
            }}
          />
          <Stack.Screen
            name="(other)/deleteAccount"
            options={{
              title: t("deleteAccount"),
            }}
          />
          <Stack.Screen
            name="(other)/community"
            options={{
              title: t("creatorCommunity"),
            }}
          />
          <Stack.Screen
            name="(other)/sub_terms"
            options={{
              title: t("subTerms"),
            }}
          />
          <Stack.Screen
            name="(other)/contact"
            options={{
              title: t("contactUs"),
            }}
          />
          <Stack.Screen
            name="(other)/problem"
            options={{
              title: t("faq"),
            }}
          />
          <Stack.Screen
            name="(other)/privacy"
            options={{
              title: t("privacyPolicy"),
            }}
          />
          <Stack.Screen
            name="(other)/terms"
            options={{
              title: t("serviceTerms"),
            }}
          />
          <Stack.Screen
            name="(other)/about"
            options={{
              title: t("aboutUs"),
            }}
          />
        </Stack>
      </SafeAreaView>
    </ErrorBoundary>
  );
}
