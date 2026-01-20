import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Sun, Moon, Bookmark } from 'lucide-react-native'
import { useThemeStore } from '@/stores'

interface StatsData {
  habits: number
  life: number
  caution: number
  minutes: number
  highlights?: number
}

interface ActivityStatsProps {
  title: string
  stats: StatsData
  hasPreparation?: boolean
  hasClosure?: boolean
  highlights?: Array<{
    id: number
    habit?: string
    type: string
    practice?: string
    note?: string
  }>
}

export function ActivityStats({
  title,
  stats,
  hasPreparation,
  hasClosure,
  highlights,
}: ActivityStatsProps) {
  const { colors } = useThemeStore()

  const isEmpty = stats.habits + stats.life + stats.caution === 0

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      {isEmpty ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>
          No entries {title === 'Today' ? 'yet' : `this ${title.toLowerCase()}`}
        </Text>
      ) : (
        <View style={styles.stats}>
          <View style={styles.statsRow}>
            {stats.habits > 0 && (
              <>
                <Text style={[styles.statText, { color: colors.text }]}>
                  {stats.habits} {stats.habits === 1 ? 'habit' : 'habits'}
                </Text>
                <Text style={[styles.separator, { color: colors.textMuted }]}>
                  ·
                </Text>
              </>
            )}
            {stats.life > 0 && (
              <>
                <Text style={[styles.statText, { color: colors.text }]}>
                  {stats.life} life
                </Text>
                <Text style={[styles.separator, { color: colors.textMuted }]}>
                  ·
                </Text>
              </>
            )}
            {stats.caution > 0 && (
              <>
                <Text style={[styles.statText, { color: colors.text }]}>
                  {stats.caution} caution
                </Text>
                <Text style={[styles.separator, { color: colors.textMuted }]}>
                  ·
                </Text>
              </>
            )}
            <Text style={[styles.statText, { color: colors.text }]}>
              {formatMinutes(stats.minutes)}
            </Text>

            {hasPreparation && (
              <>
                <Text style={[styles.separator, { color: colors.textMuted }]}>
                  ·
                </Text>
                <Sun size={14} color="#f59e0b" />
              </>
            )}
            {hasClosure && (
              <>
                <Text style={[styles.separator, { color: colors.textMuted }]}>
                  ·
                </Text>
                <Moon size={14} color="#6366f1" />
              </>
            )}
          </View>

          {/* Highlights for today */}
          {highlights && highlights.length > 0 && (
            <View style={styles.highlights}>
              {highlights.map((entry) => (
                <View key={entry.id} style={styles.highlight}>
                  <Bookmark size={14} color={colors.textMuted} />
                  <View style={styles.highlightContent}>
                    <Text style={[styles.highlightTitle, { color: colors.text }]}>
                      {entry.habit || entry.type}
                      {entry.practice && (
                        <Text style={{ color: colors.textMuted }}>
                          {' '}
                          · {entry.practice}
                        </Text>
                      )}
                    </Text>
                    {entry.note && (
                      <Text
                        style={[styles.highlightNote, { color: colors.textMuted }]}
                        numberOfLines={2}
                      >
                        {entry.note}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  )
}

interface WeekMonthStatsProps {
  title: string
  stats: StatsData & { transitions?: number }
}

export function WeekMonthStats({ title, stats }: WeekMonthStatsProps) {
  const { colors } = useThemeStore()

  const isEmpty = stats.habits + stats.life + stats.caution === 0

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      {isEmpty ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>
          No entries this {title.toLowerCase().replace('this ', '')}
        </Text>
      ) : (
        <View style={styles.statsRow}>
          <Text style={[styles.statText, { color: colors.textMuted }]}>
            {stats.habits} habits
          </Text>
          <Text style={[styles.separator, { color: colors.textMuted }]}>·</Text>
          <Text style={[styles.statText, { color: colors.textMuted }]}>
            {stats.life} life
          </Text>
          <Text style={[styles.separator, { color: colors.textMuted }]}>·</Text>
          <Text style={[styles.statText, { color: colors.textMuted }]}>
            {stats.caution} caution
          </Text>
          {stats.highlights !== undefined && stats.highlights > 0 && (
            <>
              <Text style={[styles.separator, { color: colors.textMuted }]}>
                ·
              </Text>
              <Text style={[styles.statText, { color: colors.textMuted }]}>
                {stats.highlights} highlights
              </Text>
            </>
          )}
          <Text style={[styles.separator, { color: colors.textMuted }]}>·</Text>
          <Text style={[styles.statText, { color: colors.textMuted }]}>
            {formatMinutes(stats.minutes)}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
  },
  empty: {
    fontSize: 13,
  },
  stats: {
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  statText: {
    fontSize: 13,
  },
  separator: {
    fontSize: 13,
  },
  highlights: {
    gap: 10,
    paddingTop: 4,
  },
  highlight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  highlightContent: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  highlightNote: {
    fontSize: 12,
    marginTop: 2,
  },
})
