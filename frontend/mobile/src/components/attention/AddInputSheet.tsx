import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet'
import { useThemeStore } from '@/stores'
import { Button } from '@/components/ui'

interface AddInputSheetProps {
  title: string
  placeholder: string
  visible: boolean
  onClose: () => void
  onSubmit: (value: string) => void
}

export function AddInputSheet({
  title,
  placeholder,
  visible,
  onClose,
  onSubmit,
}: AddInputSheetProps) {
  const { colors } = useThemeStore()
  const [value, setValue] = useState('')
  const inputRef = useRef<TextInput>(null)

  const snapPoints = useMemo(() => ['30%'], [])

  useEffect(() => {
    if (visible) {
      setValue('')
      // Focus input after sheet animates in
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [visible])

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim())
      setValue('')
      onClose()
    }
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

  if (!visible) return null

  return (
    <BottomSheet
      index={0}
      snapPoints={snapPoints}
      onClose={onClose}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.textMuted }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          autoFocus
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
        />

        <View style={styles.actions}>
          <Button variant="outline" onPress={onClose} style={{ flex: 1 }}>
            Cancel
          </Button>
          <Button
            onPress={handleSubmit}
            disabled={!value.trim()}
            style={{ flex: 1 }}
          >
            Add
          </Button>
        </View>
      </View>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
})
