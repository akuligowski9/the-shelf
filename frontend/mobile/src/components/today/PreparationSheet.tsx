import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Sun, Check } from 'lucide-react-native'
import { useThemeStore } from '@/stores'
import { Button } from '@/components/ui'
import type { Preparation } from '@shared/types'

interface PreparationSheetProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (preparation: Partial<Preparation>) => void
  existingPreparation?: Preparation | null
  selectedDate: string
}

export function PreparationSheet({
  isOpen,
  onClose,
  onSubmit,
  existingPreparation,
  selectedDate,
}: PreparationSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null)
  const { colors, isDark } = useThemeStore()

  // Form state
  const [note, setNote] = useState('')
  const [isRestDay, setIsRestDay] = useState(false)

  const snapPoints = useMemo(() => ['55%', '75%'], [])

  // Reset form
  const resetForm = useCallback(() => {
    setNote('')
    setIsRestDay(false)
  }, [])

  // Populate form when editing
  useEffect(() => {
    if (existingPreparation) {
      setNote(existingPreparation.note || '')
      setIsRestDay(existingPreparation.rest_day || false)
    } else {
      resetForm()
    }
  }, [existingPreparation, resetForm])

  // Handle open/close
  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand()
    } else {
      bottomSheetRef.current?.close()
    }
  }, [isOpen])

  const handleSubmit = () => {
    const preparation: Partial<Preparation> = {
      id: existingPreparation?.id,
      period_type: 'day',
      period_start: selectedDate,
      occurred_at: existingPreparation?.occurred_at || new Date().toISOString(),
      note: note.trim() || null,
      rest_day: isRestDay,
    }

    onSubmit(preparation)
    resetForm()
    onClose()
  }

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  )

  const isEditing = !!existingPreparation

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.textMuted }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerIcon}>
            <Sun size={24} color="#f59e0b" />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]}>
              {isEditing ? 'Edit Preparation' : 'Start Your Day'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Set your intention for today. What matters given your reality right now?
            </Text>
          </View>
        </View>

        <BottomSheetScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Note */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>
              What's the focus?
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={note}
              onChangeText={setNote}
              placeholder="What do you want to accomplish today? Any constraints or priorities?"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          {/* Rest Day Toggle */}
          <TouchableOpacity
            style={[styles.checkboxRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setIsRestDay(!isRestDay)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: isRestDay ? colors.primary : 'transparent',
                  borderColor: isRestDay ? colors.primary : colors.border,
                },
              ]}
            >
              {isRestDay && (
                <Check size={14} color={isDark ? '#1a1a1a' : '#ffffff'} strokeWidth={3} />
              )}
            </View>
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>
              This is an intentional rest day
            </Text>
          </TouchableOpacity>
        </BottomSheetScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Button variant="ghost" onPress={onClose}>
            Cancel
          </Button>
          <Button onPress={handleSubmit}>
            {isEditing ? 'Update' : 'Set Intention'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  headerIcon: {
    marginTop: 2,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    minHeight: 120,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
  },
})
