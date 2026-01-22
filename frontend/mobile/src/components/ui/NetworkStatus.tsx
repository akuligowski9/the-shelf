import { View, Text, StyleSheet, Animated } from 'react-native'
import { useEffect, useRef } from 'react'
import { useNetwork } from '../../hooks/useNetwork'
import { useOfflineQueueStore } from '../../stores/offlineQueueStore'

export function NetworkStatus() {
  const { isConnected } = useNetwork()
  const { queue, isSyncing } = useOfflineQueueStore()
  const slideAnim = useRef(new Animated.Value(-100)).current

  const pendingCount = queue.length
  const showBanner = !isConnected || (isConnected && isSyncing) || pendingCount > 0

  useEffect(() => {
    if (showBanner) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start()
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start()
    }
  }, [showBanner, slideAnim])

  if (!showBanner) {
    return null
  }

  let message = ''
  let bgColor = '#f59e0b' // amber

  if (!isConnected) {
    message = `Offline${pendingCount > 0 ? ` • ${pendingCount} pending` : ''}`
    bgColor = '#ef4444' // red
  } else if (isSyncing) {
    message = `Syncing ${pendingCount} changes...`
    bgColor = '#3b82f6' // blue
  } else if (pendingCount > 0) {
    message = `${pendingCount} changes waiting to sync`
    bgColor = '#f59e0b' // amber
  }

  return (
    <Animated.View
      style={[
        styles.banner,
        { backgroundColor: bgColor, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
})
