import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Sun, Moon, Smartphone, Download, Upload, ChevronRight } from 'lucide-react-native'
import { useThemeStore, useHabitsStore, useEntriesStore } from '@/stores'
import { Card, CardContent, Button } from '@/components/ui'
import * as api from '@shared/api'

// Common timezones
const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern (ET)' },
  { value: 'America/Chicago', label: 'Central (CT)' },
  { value: 'America/Denver', label: 'Mountain (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
  { value: 'America/Anchorage', label: 'Alaska (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (HT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central Europe (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
  { value: 'UTC', label: 'UTC' },
]

type ThemeMode = 'light' | 'dark' | 'auto'

export default function SettingsScreen() {
  const { colors, isDark, themeMode, setThemeMode } = useThemeStore()
  const { habits } = useHabitsStore()
  const { entries } = useEntriesStore()

  const [timezone, setTimezoneState] = useState('America/New_York')
  const [showTimezoneOptions, setShowTimezoneOptions] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Load settings from API
  useEffect(() => {
    api.getSettings()
      .then((settings: any[]) => {
        const tzSetting = settings.find((s) => s.key === 'timezone')
        if (tzSetting?.value) setTimezoneState(tzSetting.value)
      })
      .catch((err) => console.error('Failed to load settings:', err))
  }, [])

  // Save timezone setting
  const handleTimezoneChange = (tz: string) => {
    setTimezoneState(tz)
    setShowTimezoneOptions(false)
    api.setSetting('timezone', tz).catch((err) => console.error('Failed to save timezone:', err))
  }

  // Handle export
  const handleExport = async () => {
    setExporting(true)
    try {
      const data = await api.exportData()
      const jsonStr = JSON.stringify(data, null, 2)

      await Share.share({
        message: jsonStr,
        title: `the-shelf-export-${new Date().toISOString().split('T')[0]}.json`,
      })
    } catch (err: any) {
      if (err.message !== 'Share dismissed') {
        Alert.alert('Export Failed', err.message || 'Failed to export data')
      }
    } finally {
      setExporting(false)
    }
  }

  // Compute data health metrics
  const metrics = useMemo(() => {
    const activeEntries = entries.filter((e) => !(e as any).archived_at)
    const habitEntries = activeEntries.filter((e) => e.type === 'habit')

    // Date range
    const dates = activeEntries
      .map((e) => new Date((e as any).occurred_at || e.created_at))
      .sort((a, b) => a.getTime() - b.getTime())
    const firstEntry = dates[0]
    const lastEntry = dates[dates.length - 1]

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const lastEntryStr = lastEntry ? lastEntry.toISOString().split('T')[0] : null
    const isLastEntryToday = lastEntryStr === todayStr

    const daysSinceStart = firstEntry
      ? Math.ceil((today.getTime() - firstEntry.getTime()) / (1000 * 60 * 60 * 24))
      : 0

    return {
      totalEntries: activeEntries.length,
      firstEntry: firstEntry
        ? firstEntry.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '—',
      lastEntry: isLastEntryToday
        ? 'Today'
        : lastEntry
        ? lastEntry.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '—',
      daysSinceStart,
      habitsCount: habits.filter((h) => h.active).length,
    }
  }, [entries, habits])

  const selectedTimezone = TIMEZONES.find((tz) => tz.value === timezone)

  const themeOptions: { mode: ThemeMode; label: string; icon: any }[] = [
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'dark', label: 'Dark', icon: Moon },
    { mode: 'auto', label: 'Auto', icon: Smartphone },
  ]

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Configure your system</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Preferences */}
        <Card>
          <CardContent>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>

            {/* Theme */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Theme</Text>
                <Text style={[styles.settingDescription, { color: colors.textMuted }]}>
                  Choose light, dark, or auto mode
                </Text>
              </View>
            </View>

            <View style={styles.themeOptions}>
              {themeOptions.map((option) => {
                const Icon = option.icon
                const isSelected = themeMode === option.mode
                return (
                  <TouchableOpacity
                    key={option.mode}
                    style={[
                      styles.themeOption,
                      { backgroundColor: isSelected ? colors.primary : colors.card },
                    ]}
                    onPress={() => setThemeMode(option.mode)}
                  >
                    <Icon
                      size={18}
                      color={isSelected ? (isDark ? '#1a1a1a' : '#ffffff') : colors.text}
                    />
                    <Text
                      style={[
                        styles.themeOptionLabel,
                        { color: isSelected ? (isDark ? '#1a1a1a' : '#ffffff') : colors.text },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {/* Timezone */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setShowTimezoneOptions(!showTimezoneOptions)}
            >
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Timezone</Text>
                <Text style={[styles.settingDescription, { color: colors.textMuted }]}>
                  All times are displayed in this timezone
                </Text>
              </View>
              <View style={styles.settingValue}>
                <Text style={[styles.settingValueText, { color: colors.text }]}>
                  {selectedTimezone?.label || 'Select'}
                </Text>
                <ChevronRight size={18} color={colors.textMuted} />
              </View>
            </TouchableOpacity>

            {showTimezoneOptions && (
              <View style={[styles.optionsList, { backgroundColor: colors.background }]}>
                {TIMEZONES.map((tz) => (
                  <TouchableOpacity
                    key={tz.value}
                    style={[
                      styles.optionItem,
                      timezone === tz.value && { backgroundColor: `${colors.primary}20` },
                    ]}
                    onPress={() => handleTimezoneChange(tz.value)}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        { color: timezone === tz.value ? colors.primary : colors.text },
                      ]}
                    >
                      {tz.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardContent>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Management</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Export Data</Text>
                <Text style={[styles.settingDescription, { color: colors.textMuted }]}>
                  Download all your data as JSON
                </Text>
              </View>
              <Button
                variant="outline"
                size="sm"
                onPress={handleExport}
                disabled={exporting}
              >
                <View style={styles.buttonContent}>
                  <Download size={16} color={colors.text} />
                  <Text style={[styles.buttonText, { color: colors.text }]}>
                    {exporting ? 'Exporting...' : 'Export'}
                  </Text>
                </View>
              </Button>
            </View>
          </CardContent>
        </Card>

        {/* Data Health */}
        <Card>
          <CardContent>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Health</Text>

            <View style={styles.metricsGrid}>
              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Tracking since</Text>
                <Text style={[styles.metricValue, { color: colors.text }]}>
                  {metrics.firstEntry}
                  {metrics.daysSinceStart > 0 && ` (${metrics.daysSinceStart} days)`}
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Last entry</Text>
                <Text style={[styles.metricValue, { color: colors.text }]}>{metrics.lastEntry}</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Total entries</Text>
                <Text style={[styles.metricValue, { color: colors.text }]}>{metrics.totalEntries}</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Active habits</Text>
                <Text style={[styles.metricValue, { color: colors.text }]}>{metrics.habitsCount}</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardContent>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
            <Text style={[styles.aboutText, { color: colors.textMuted }]}>
              The Shelf is a personal system for managing attention, balance, and long-term memory
              of effort. It is designed to be used for years.
            </Text>
            <Text style={[styles.versionText, { color: colors.textMuted }]}>Version 0.1.0</Text>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingValueText: {
    fontSize: 14,
  },
  separator: {
    height: 1,
    marginVertical: 12,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 4,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  themeOptionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  optionsList: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionLabel: {
    fontSize: 14,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  metricsGrid: {
    gap: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
  },
  versionText: {
    fontSize: 12,
    marginTop: 12,
    opacity: 0.6,
  },
})
