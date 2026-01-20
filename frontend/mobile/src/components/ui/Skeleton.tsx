import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, ViewStyle, DimensionValue } from 'react-native'
import { useThemeStore } from '@/stores'

interface SkeletonProps {
  width?: DimensionValue
  height?: number
  borderRadius?: number
  style?: ViewStyle
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const { colors, isDark } = useThemeStore()
  const animatedValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    )
    animation.start()

    return () => animation.stop()
  }, [])

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  })

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: isDark ? '#404040' : '#e5e5e5',
          opacity,
        },
        style,
      ]}
    />
  )
}

// Pre-built skeleton layouts
export function SkeletonCard() {
  const { colors } = useThemeStore()

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        <Skeleton width={80} height={24} borderRadius={12} />
        <Skeleton width={60} height={16} />
      </View>
      <Skeleton width="90%" height={14} style={{ marginTop: 8 }} />
      <Skeleton width="70%" height={14} style={{ marginTop: 6 }} />
    </View>
  )
}

export function SkeletonEntryCard() {
  const { colors } = useThemeStore()

  return (
    <View style={[styles.entryCard, { backgroundColor: colors.card }]}>
      <View style={styles.entryContent}>
        <Skeleton width={100} height={22} borderRadius={11} />
        <Skeleton width="80%" height={14} style={{ marginTop: 8 }} />
      </View>
      <View style={styles.entryMeta}>
        <Skeleton width={50} height={14} />
        <Skeleton width={40} height={14} style={{ marginTop: 4 }} />
      </View>
    </View>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonEntryCard key={i} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  skeleton: {},
  card: {
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryCard: {
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#e5e5e5',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  entryContent: {
    flex: 1,
  },
  entryMeta: {
    alignItems: 'flex-end',
  },
  list: {
    gap: 12,
  },
})
