
import useTailwindVars from "@/hooks/useTailwindVars";
import React, { ReactNode } from "react";
import { ActivityIndicator, StyleProp, Text, TouchableOpacity, ViewStyle } from "react-native";

interface ButtonV2Props {
    onPress?: () => void;
    icon?: ReactNode;
    text: string;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    style?: StyleProp<ViewStyle>;
}

const ButtonV2 = ({
    onPress,
    icon,
    text,
    disabled = false,
    loading = false,
    variant = 'primary',
    size = 'md',
    style
}: ButtonV2Props) => {
    const { colors } = useTailwindVars();

    // Size Configurations
    const sizeConfig = {
        sm: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 13, iconSize: 16, borderRadius: 20 },
        md: { paddingVertical: 12, paddingHorizontal: 20, fontSize: 15, iconSize: 20, borderRadius: 24 },
        lg: { paddingVertical: 16, paddingHorizontal: 24, fontSize: 17, iconSize: 24, borderRadius: 28 },
    };
    const currentSize = sizeConfig[size];

    // Variant Colors
    const getVariantStyle = () => {
        const baseStyle: ViewStyle = {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            borderRadius: currentSize.borderRadius,
            paddingVertical: currentSize.paddingVertical,
            paddingHorizontal: currentSize.paddingHorizontal,
        };

        if (disabled) {
            return {
                ...baseStyle,
                backgroundColor: variant === 'outline' || variant === 'ghost' ? 'transparent' : colors['muted-foreground'],
                borderWidth: variant === 'outline' ? 1 : 0,
                borderColor: variant === 'outline' ? colors['muted-foreground'] : undefined,
            };
        }

        switch (variant) {
            case 'primary':
                return { ...baseStyle, backgroundColor: colors.primary };
            case 'secondary':
                return { ...baseStyle, backgroundColor: colors.primary + '15' }; // 15% opacity
            case 'outline':
                return { ...baseStyle, backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary };
            case 'ghost':
                return { ...baseStyle, backgroundColor: 'transparent' };
            default:
                return { ...baseStyle, backgroundColor: colors.primary };
        }
    };

    const getTextColor = () => {
        if (disabled) return variant === 'outline' || variant === 'ghost' ? colors['muted-foreground'] : '#fff';

        switch (variant) {
            case 'primary':
                return '#fff';
            case 'secondary':
                return colors.primary;
            case 'outline':
                return colors.primary;
            case 'ghost':
                return colors.primary;
            default:
                return '#fff';
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            disabled={disabled || loading}
            style={[getVariantStyle(), style, { opacity: disabled && variant !== 'primary' ? 0.6 : 1 }]}
        >
            {loading ? (
                <ActivityIndicator size="small" color={getTextColor()} />
            ) : (
                <>
                    <Text style={{
                        color: getTextColor(),
                        fontWeight: '700',
                        fontSize: currentSize.fontSize
                    }}>
                        {text}
                    </Text>
                    {icon}
                </>
            )}
        </TouchableOpacity>
    );
};

export default ButtonV2;