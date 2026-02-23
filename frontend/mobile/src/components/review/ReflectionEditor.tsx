import React, { useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import { useThemeStore } from '@/stores'
import { Card, CardContent, Button } from '@/components/ui'

interface ReflectionEditorProps {
  periodLabel: string
  onSave: (content: string) => Promise<void>
}

export function ReflectionEditor({ periodLabel, onSave }: ReflectionEditorProps) {
  const { colors, isDark } = useThemeStore()
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!content.trim() || saving) return
    setSaving(true)
    try {
      await onSave(content.trim())
      setContent('')
    } catch {
      // Error already handled by parent via handleError toast
      // Don't clear content so user can retry
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card style={styles.card}>
      <CardContent>
        <Text style={[styles.title, { color: colors.text }]}>Write a Reflection</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          What patterns do you notice? What does this period mean to you?
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? colors.background : '#f5f5f5',
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Take a moment to reflect..."
          placeholderTextColor={colors.textMuted}
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        <View style={styles.footer}>
          <Text style={[styles.periodInfo, { color: colors.textMuted }]}>
            For: {periodLabel}
          </Text>
          <Button
            size="sm"
            onPress={handleSave}
            disabled={!content.trim() || saving}
          >
            {saving ? 'Saving...' : 'Save Reflection'}
          </Button>
        </View>
      </CardContent>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 120,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodInfo: {
    fontSize: 12,
  },
})
