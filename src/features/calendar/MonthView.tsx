import { useMemo, useRef } from 'react'
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday,
  addMonths, subMonths, getDate, getMonth, getYear, parseISO,
} from 'date-fns'
import * as Haptics from 'expo-haptics'
import { colors } from '@/theme'
import { EVENT_TYPE_META } from '@/constants/events'
import type { CalendarEvent } from '@/types'

const MONTH_NAMES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]
const DAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

interface MonthViewProps {
  currentMonth: Date
  selectedDate: Date
  events: CalendarEvent[]
  onSelectDate: (date: Date) => void
  onMonthChange: (month: Date) => void
}

function getEventDotsForDay(date: Date, events: CalendarEvent[]): string[] {
  const found: string[] = []
  for (const e of events) {
    try {
      const start = parseISO(e.startDate)
      if (isSameDay(start, date)) {
        const meta = EVENT_TYPE_META[e.type]
        const c = e.color || meta.color
        if (!found.includes(c)) found.push(c)
      }
    } catch { /* ignore */ }
    if (found.length >= 3) break
  }
  return found
}

export function MonthView({
  currentMonth,
  selectedDate,
  events,
  onSelectDate,
  onMonthChange,
}: MonthViewProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 })
    const end   = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  function animateAndChange(next: Date) {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start()
    setTimeout(() => onMonthChange(next), 100)
  }

  function handlePrev() {
    Haptics.selectionAsync()
    animateAndChange(subMonths(currentMonth, 1))
  }

  function handleNext() {
    Haptics.selectionAsync()
    animateAndChange(addMonths(currentMonth, 1))
  }

  const monthLabel = `${MONTH_NAMES[getMonth(currentMonth)]} ${getYear(currentMonth)}`

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.navRow}>
        <Pressable onPress={handlePrev} style={styles.navBtn}>
          <ChevronLeft size={18} color={colors.muted} />
        </Pressable>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <Pressable onPress={handleNext} style={styles.navBtn}>
          <ChevronRight size={18} color={colors.muted} />
        </Pressable>
      </View>

      {/* Day labels */}
      <View style={styles.dayLabelsRow}>
        {DAY_LABELS.map((label, i) => (
          <View key={i} style={styles.dayLabelCell}>
            <Text style={styles.dayLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Grid */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.grid}>
          {days.map((day, index) => {
            const inMonth  = isSameMonth(day, currentMonth)
            const selected = isSameDay(day, selectedDate)
            const todayDay = isToday(day)
            const dots     = inMonth ? getEventDotsForDay(day, events) : []

            return (
              <Pressable
                key={index}
                onPress={() => {
                  if (inMonth) {
                    Haptics.selectionAsync()
                    onSelectDate(day)
                  }
                }}
                style={styles.dayCell}
              >
                <View style={[
                  styles.dayCircle,
                  selected ? styles.dayCircleSelected : todayDay ? styles.dayCircleToday : undefined,
                ]}>
                  <Text style={[
                    styles.dayText,
                    selected ? styles.dayTextSelected
                      : todayDay ? styles.dayTextToday
                      : inMonth  ? styles.dayTextInMonth
                      : styles.dayTextOutMonth,
                  ]}>
                    {getDate(day)}
                  </Text>
                </View>

                {dots.length > 0 ? (
                  <View style={styles.dotsRow}>
                    {dots.map((dotColor, di) => (
                      <View
                        key={di}
                        style={[
                          styles.dot,
                          { backgroundColor: selected ? 'rgba(255,255,255,0.8)' : dotColor },
                        ]}
                      />
                    ))}
                  </View>
                ) : (
                  <View style={styles.dotsPlaceholder} />
                )}
              </Pressable>
            )
          })}
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  card:            { backgroundColor: '#1A1827', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#2D2A3E' },
  navRow:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  navBtn:          { width: 36, height: 36, borderRadius: 18, backgroundColor: '#221F32', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2D2A3E' },
  monthLabel:      { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#F0EEF8', textTransform: 'capitalize' },
  dayLabelsRow:    { flexDirection: 'row', paddingHorizontal: 8, paddingBottom: 4 },
  dayLabelCell:    { flex: 1, alignItems: 'center' },
  dayLabel:        { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#544F68' },
  grid:            { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, paddingBottom: 12 },
  dayCell:         { width: `${100 / 7}%`, paddingVertical: 2, alignItems: 'center' },
  dayCircle:       { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  dayCircleSelected: { backgroundColor: '#FF4D8D' },
  dayCircleToday:    { backgroundColor: '#2D1624' },
  dayText:         { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  dayTextSelected: { color: '#fff' },
  dayTextToday:    { color: '#FF4D8D' },
  dayTextInMonth:  { color: '#F0EEF8' },
  dayTextOutMonth: { color: '#2D2A3E' },
  dotsRow:         { flexDirection: 'row', gap: 2, marginTop: 2, height: 6, alignItems: 'center' },
  dot:             { width: 4, height: 4, borderRadius: 2 },
  dotsPlaceholder: { height: 6 },
})
