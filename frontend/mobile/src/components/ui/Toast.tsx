import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react-native'
import { useThemeStore } from '@/stores'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  visible: boolean
  message: string
  type?: ToastType
  duration?: number
  onHide: () => void
}

export function Toast({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
}: ToastProps) {
  const { colors, isDark } = useThemeStore()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(-100)).current

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }),
      ]).start()

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [visible])

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide()
    })
  }

  if (!visible) return null

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: isDark ? '#166534' : '#dcfce7',
          textColor: isDark ? '#86efac' : '#166534',
          iconColor: '#22c55e',
        }
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: isDark ? '#7f1d1d' : '#fee2e2',
          textColor: isDark ? '#fca5a5' : '#991b1b',
          iconColor: '#ef4444',
        }
      case 'warning':
        return {
          icon: AlertCircle,
          bgColor: isDark ? '#78350f' : '#fef3c7',
          textColor: isDark ? '#fcd34d' : '#92400e',
          iconColor: '#f59e0b',
        }
      default:
        return {
          icon: Info,
          bgColor: isDark ? '#1e3a8a' : '#dbeafe',
          textColor: isDark ? '#93c5fd' : '#1e40af',
          iconColor: '#3b82f6',
        }
    }
  }

  const config = getTypeConfig()
  const Icon = config.icon

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.bgColor,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Icon size={20} color={config.iconColor} />
      <Text style={[styles.message, { color: config.textColor }]} numberOfLines={2}>
        {message}
      </Text>
      <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
        <X size={16} color={config.textColor} />
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 9999,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
  },
})
