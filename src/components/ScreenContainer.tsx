import { useColors } from '@/hooks/uesColors';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { StatusBar, StatusBarStyle, StyleProp, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

interface ScreenContainerProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    edges?: Edge[];
    className?: string; // For NativeWind support if needed, though usually handled via style or View wrapping
    barStyle?: StatusBarStyle;
    statusBarColor?: string;
    translucent?: boolean;
    headerShown?: boolean;
    stackScreenProps?: NativeStackNavigationOptions;
    title?: string;
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({
    children,
    style,
    edges = ['top', 'bottom'], // Default to top and bottom safe areas
    className,
    barStyle,
    statusBarColor = 'transparent',
    translucent = true,
    headerShown = false,
    title,
    stackScreenProps,
}) => {
    const { background } = useColors();
    const { colorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    return (
        <SafeAreaView
            edges={edges}
            style={[
                {
                    flex: 1,
                    backgroundColor: background,
                },
                style,
            ]}
            className={className}
        >
            <Stack.Screen options={{
                headerStyle: { backgroundColor: 'transparent' }, // Optional: customizable
                headerTransparent: true, // Optional: useful for full screen
                ...stackScreenProps,
                ...(headerShown !== undefined && { headerShown }),
                ...(title !== undefined && { title }),
            }} />
            <StatusBar
                barStyle={barStyle || (isDarkMode ? "light-content" : "dark-content")}
                backgroundColor={statusBarColor}
                translucent={translucent}
            />
            {children}
        </SafeAreaView>
    );
};

export default ScreenContainer;
