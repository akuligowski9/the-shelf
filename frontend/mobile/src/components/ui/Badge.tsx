import React from 'react'
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native'
import { useThemeStore } from '@/stores'
import { getHabitColor } from '@shared/colors'

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'habit'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  color?: string // For habit variant
  style?: ViewStyle
  textStyle?: TextStyle
}

export function Badge({
  children,
  variant = 'default',
  color,
  style,
  textStyle,
}: BadgeProps) {
  const { colors, isDark } = useThemeStore()

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'secondary':
        return {
          container: {
            backgroundColor: colors.card,
          },
          text: {
            color: colors.textMuted,
          },
        }
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colors.border,
          },
          text: {
            color: colors.text,
          },
        }
      case 'habit':
        if (color) {
          const habitColor = getHabitColor(color)
          return {
            container: {
              backgroundColor: isDark ? habitColor.darkLight : habitColor.light,
              borderWidth: 1,
              borderColor: habitColor.main,
            },
            text: {
              color: habitColor.main,
            },
          }
        }
        return {
          container: {
            backgroundColor: colors.primary,
          },
          text: {
            color: isDark ? '#1a1a1a' : '#ffffff',
          },
        }
      default:
        return {
          container: {
            backgroundColor: colors.primary,
          },
          text: {
            color: isDark ? '#1a1a1a' : '#ffffff',
          },
        }
    }
  }

  const variantStyles = getVariantStyles()

  return (
    <View style={[styles.badge, variantStyles.container, style]}>
      <Text style={[styles.text, variantStyles.text, textStyle]}>
        {children}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
})
