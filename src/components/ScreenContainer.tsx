import { useColors } from '@/hooks/uesColors';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { StatusBarStyle, StyleProp, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

interface ScreenContainerProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    edges?: Edge[];
    className?: string; // For NativeWind support if needed, though usually handled via style or View wrapping
    barStyle?: StatusBarStyle;
    statusBarColor?: string;
    translucent?: boolean;
    stackScreenProps?: NativeStackNavigationOptions;
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({
    children,
    style,
    edges = ['top', 'bottom'],
    className,
    barStyle,
    statusBarColor = 'transparent',
    translucent = true,
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
            <Stack.Screen
                options={{
                    headerStyle: { backgroundColor: 'transparent' }, // Optional: customizable
                    headerTransparent: true, // Optional: useful for full screen
                    headerShown: false,
                    ...stackScreenProps,
                }}
            />

            <StatusBar
                style={barStyle === 'light-content' ? 'light' : barStyle === 'dark-content' ? 'dark' : (isDarkMode ? 'light' : 'dark')}
                backgroundColor={statusBarColor}
                translucent={translucent}
            />
            {children}
        </SafeAreaView>
    );
};

export default ScreenContainer;
