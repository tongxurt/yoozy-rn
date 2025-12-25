import ScreenContainer from "@/components/ScreenContainer";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useColors } from "@/hooks/uesColors";
import useAppUpdate from "@/hooks/useAppUpdate";
import { useAuthUser } from "@/hooks/useAuthUser";
import useTailwindVars from "@/hooks/useTailwindVars";
import { useTranslation } from "@/i18n/translation";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { router, Tabs } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import "../../global.css";

const barHeight = 50;

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const { t } = useTranslation();

  const { colors } = useTailwindVars();
  const { user } = useAuthUser();

  return (
    <>
      <View
        className={`flex-row justify-around items-center h-[${barHeight}px] bg-background absolute bottom-0 left-0 right-0`}
      >
        {state?.routes.map((route, index) => {
          const { options } = descriptors[route.key];

          const isFocused = state.index === index;

          const onPress = async () => {
            console.log("onPress", route);
            if (route.name === "record" && !user) {
              router.navigate("/login");
              return;
            }

            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              className="flex-1 items-center gap-2 justify-center h-full"
              onPress={onPress}
            >
              {options.tabBarIcon?.({
                focused: isFocused,
                size: 20,
                color: isFocused ? colors.white : colors.grey4,
              })}
              <Text
                style={{ fontWeight: 600 }}
                className={`text-xs mt-[2px] ${isFocused ? "text-white" : "text-grey3"
                  }`}
              >
                {t(`tab.${route.name}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

export default function TabLayout() {
  const { t } = useTranslation();
  const { plain } = useColors();
  useAppUpdate();
  const { user } = useAuthUser({ fetchImmediately: true });

  return (
    <ScreenContainer>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          tabBarStyle: {
            display: "none", // Hide default tab bar
          },
          headerShown: useClientOnlyValue(false, false),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            // title: t("tab.index"),
            sceneStyle: { marginBottom: barHeight, backgroundColor: plain },
            tabBarIcon: ({ size, color }) => (
              <FontAwesome6 name="house-fire" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="commodity"
          options={{
            // title: t("tab.session"),
            sceneStyle: { marginBottom: barHeight, backgroundColor: plain },
            tabBarIcon: ({ size, color }) => (
              <FontAwesome5 name="briefcase" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="new"
          options={{
            // title: t("tab.session"),
            sceneStyle: { marginBottom: barHeight, backgroundColor: plain },
            tabBarIcon: ({ size, color }) => (
              <FontAwesome5
                name="star-and-crescent"
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="record"
          options={{
            // title: t("tab.my"),
            sceneStyle: { marginBottom: barHeight, backgroundColor: plain },
            tabBarIcon: ({ size, color }) => (
              <FontAwesome5 name="history" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="my"
          options={{
            // title: t("tab.my"),
            sceneStyle: { marginBottom: barHeight },
            tabBarIcon: ({ size, color }) => (
              <FontAwesome5 name="user-alt" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </ScreenContainer>
  );
}
