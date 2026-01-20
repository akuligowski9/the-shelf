import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

// Only trigger haptics on iOS (Android vibration requires different handling)
const isHapticsSupported = Platform.OS === 'ios'

/**
 * Light impact - for subtle interactions like selection changes
 */
export function lightImpact() {
  if (isHapticsSupported) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }
}

/**
 * Medium impact - for button presses and confirmations
 */
export function mediumImpact() {
  if (isHapticsSupported) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }
}

/**
 * Heavy impact - for significant actions like delete
 */
export function heavyImpact() {
  if (isHapticsSupported) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
  }
}

/**
 * Selection feedback - for picker/selection changes
 */
export function selectionFeedback() {
  if (isHapticsSupported) {
    Haptics.selectionAsync()
  }
}

/**
 * Success notification - for successful operations
 */
export function successNotification() {
  if (isHapticsSupported) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }
}

/**
 * Warning notification - for warnings or caution actions
 */
export function warningNotification() {
  if (isHapticsSupported) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
  }
}

/**
 * Error notification - for errors or destructive actions
 */
export function errorNotification() {
  if (isHapticsSupported) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
  }
}
