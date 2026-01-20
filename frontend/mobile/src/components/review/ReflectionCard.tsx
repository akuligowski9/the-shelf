import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Trash2 } from 'lucide-react-native'
import { useThemeStore } from '@/stores'
import type { Reflection } from '@shared/types'

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface ReflectionCardProps {
  reflection: Reflection
  onDelete?: (id: number) => void
}

export function ReflectionCard({ reflection, onDelete }: ReflectionCardProps) {
  const { colors } = useThemeStore()

  // Generate period label
  let periodLabel: string
  if (reflection.period_start) {
    const startStr = formatDate(reflection.period_start)
    periodLabel = startStr
  } else {
    periodLabel = formatDate(reflection.created_at)
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.dateLabel, { color: colors.textMuted }]}>{periodLabel}</Text>
        {onDelete && (
          <TouchableOpacity
            onPress={() => onDelete(reflection.id)}
            style={styles.deleteButton}
          >
            <Trash2 size={14} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <Text style={[styles.content, { color: colors.text }]}>
        {reflection.content || '(No content)'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
  },
})
