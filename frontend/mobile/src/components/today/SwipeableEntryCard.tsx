import React, { useRef } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { Swipeable, RectButton } from 'react-native-gesture-handler'
import { Archive, Trash2, Star } from 'lucide-react-native'
import { useThemeStore } from '@/stores'
import { EntryCard } from './EntryCard'
import { warningNotification, errorNotification, successNotification } from '@/utils/haptics'
import type { Entry } from '@shared/types'

interface SwipeableEntryCardProps {
  entry: Entry
  onPress?: () => void
  onArchive?: (entry: Entry) => void
  onDelete?: (entry: Entry) => void
  onToggleHighlight?: (entry: Entry) => void
}

export function SwipeableEntryCard({
  entry,
  onPress,
  onArchive,
  onDelete,
  onToggleHighlight,
}: SwipeableEntryCardProps) {
  const { colors, isDark } = useThemeStore()
  const swipeableRef = useRef<Swipeable>(null)

  const closeSwipeable = () => {
    swipeableRef.current?.close()
  }

  const handleArchive = () => {
    warningNotification()
    closeSwipeable()
    onArchive?.(entry)
  }

  const handleDelete = () => {
    errorNotification()
    closeSwipeable()
    onDelete?.(entry)
  }

  const handleToggleHighlight = () => {
    successNotification()
    closeSwipeable()
    onToggleHighlight?.(entry)
  }

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [-20, 0, 0, 1],
    })

    return (
      <RectButton style={styles.leftAction} onPress={handleToggleHighlight}>
        <Animated.View
          style={[
            styles.actionContent,
            {
              transform: [{ translateX: trans }],
            },
          ]}
        >
          <Star
            size={20}
            color="#ffffff"
            fill={entry.is_highlight ? '#ffffff' : 'transparent'}
          />
          <Text style={styles.actionText}>
            {entry.is_highlight ? 'Unhighlight' : 'Highlight'}
          </Text>
        </Animated.View>
      </RectButton>
    )
  }

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [160, 0],
    })

    return (
      <View style={styles.rightActions}>
        <Animated.View style={{ transform: [{ translateX: trans }] }}>
          <RectButton
            style={[styles.rightAction, { backgroundColor: '#f59e0b' }]}
            onPress={handleArchive}
          >
            <Archive size={20} color="#ffffff" />
            <Text style={styles.actionText}>Archive</Text>
          </RectButton>
        </Animated.View>
        <Animated.View style={{ transform: [{ translateX: trans }] }}>
          <RectButton
            style={[styles.rightAction, { backgroundColor: '#ef4444' }]}
            onPress={handleDelete}
          >
            <Trash2 size={20} color="#ffffff" />
            <Text style={styles.actionText}>Delete</Text>
          </RectButton>
        </Animated.View>
      </View>
    )
  }

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      leftThreshold={40}
      rightThreshold={40}
      renderLeftActions={onToggleHighlight ? renderLeftActions : undefined}
      renderRightActions={onArchive || onDelete ? renderRightActions : undefined}
      overshootLeft={false}
      overshootRight={false}
    >
      <EntryCard entry={entry} onPress={onPress} />
    </Swipeable>
  )
}

const styles = StyleSheet.create({
  leftAction: {
    flex: 1,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20,
    borderRadius: 12,
    marginRight: 8,
  },
  rightActions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  rightAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 12,
    marginLeft: 8,
  },
  actionContent: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
})
