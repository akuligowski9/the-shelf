import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native'
import { useThemeStore } from '@/stores'

interface DateNavigatorProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}

export function DateNavigator({ selectedDate, onDateChange }: DateNavigatorProps) {
  const { colors } = useThemeStore()

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    onDateChange(newDate)
  }

  const goToNextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    onDateChange(newDate)
  }

  const goToToday = () => {
    onDateChange(new Date())
  }

  const isToday = () => {
    const today = new Date()
    return selectedDate.toDateString() === today.toDateString()
  }

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={goToPreviousDay}
        style={[styles.button, { backgroundColor: colors.card }]}
      >
        <ChevronLeft size={20} color={colors.text} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={goToToday}
        style={[
          styles.dateButton,
          { backgroundColor: isToday() ? colors.primary : colors.card },
        ]}
      >
        <Calendar
          size={14}
          color={isToday() ? '#ffffff' : colors.textMuted}
          style={styles.calendarIcon}
        />
        <Text
          style={[
            styles.dateText,
            { color: isToday() ? '#ffffff' : colors.text },
          ]}
        >
          {isToday() ? 'Today' : formatShortDate(selectedDate)}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={goToNextDay}
        style={[styles.button, { backgroundColor: colors.card }]}
      >
        <ChevronRight size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  calendarIcon: {
    marginRight: 6,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
  },
})
