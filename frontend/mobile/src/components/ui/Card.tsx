import React from 'react'
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native'
import { useThemeStore } from '@/stores'

interface CardProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  variant?: 'default' | 'outline'
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  const { colors } = useThemeStore()

  const cardStyles: ViewStyle = {
    backgroundColor: variant === 'default' ? colors.card : 'transparent',
    borderColor: colors.border,
    borderWidth: variant === 'outline' ? 1 : 0,
  }

  return (
    <View style={[styles.card, cardStyles, style]}>
      {children}
    </View>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  style?: ViewStyle
}

export function CardHeader({ children, style }: CardHeaderProps) {
  return <View style={[styles.header, style]}>{children}</View>
}

interface CardContentProps {
  children: React.ReactNode
  style?: ViewStyle
}

export function CardContent({ children, style }: CardContentProps) {
  return <View style={[styles.content, style]}>{children}</View>
}

interface CardFooterProps {
  children: React.ReactNode
  style?: ViewStyle
}

export function CardFooter({ children, style }: CardFooterProps) {
  return <View style={[styles.footer, style]}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  footer: {
    padding: 16,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
})
