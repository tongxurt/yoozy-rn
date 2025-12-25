import { useColors } from '@/hooks/uesColors';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { StatusBar, StatusBarStyle, StyleProp, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

interface PageContainerProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    edges?: Edge[];
    className?: string; // For NativeWind support if needed, though usually handled via style or View wrapping
    barStyle?: StatusBarStyle;
    statusBarColor?: string;
    translucent?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
    children,
    style,
    edges = ['top', 'bottom'], // Default to top and bottom safe areas
    className,
    barStyle,
    statusBarColor = 'transparent',
    translucent = true,
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
            <StatusBar
                barStyle={barStyle || (isDarkMode ? "light-content" : "dark-content")}
                backgroundColor={statusBarColor}
                translucent={translucent}
            />
            {children}
        </SafeAreaView>
    );
};
