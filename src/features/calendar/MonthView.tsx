import { useMemo, useRef } from 'react'
import { View, Text, Pressable, Animated } from 'react-native'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  getDate,
  getMonth,
  getYear,
  parseISO,
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
  const colors: string[] = []
  for (const e of events) {
    try {
      const start = parseISO(e.startDate)
      if (isSameDay(start, date)) {
        const meta = EVENT_TYPE_META[e.type]
        const c = e.color || meta.color
        if (!colors.includes(c)) colors.push(c)
      }
    } catch {
      // ignore parse errors
    }
    if (colors.length >= 3) break
  }
  return colors
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
    <View className="bg-white rounded-3xl overflow-hidden" style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }}>
      {/* Header */}
      <View className="px-5 py-4 flex-row items-center justify-between">
        <Pressable
          onPress={handlePrev}
          className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
        >
          <ChevronLeft size={18} color={colors.gray[600]} />
        </Pressable>

        <Text className="text-base font-bold text-gray-900 capitalize">{monthLabel}</Text>

        <Pressable
          onPress={handleNext}
          className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
        >
          <ChevronRight size={18} color={colors.gray[600]} />
        </Pressable>
      </View>

      {/* Day labels */}
      <View className="flex-row px-2 pb-1">
        {DAY_LABELS.map((label, i) => (
          <View key={i} className="flex-1 items-center">
            <Text className="text-xs font-semibold text-gray-400">{label}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <View className="flex-row flex-wrap px-2 pb-3">
          {days.map((day, index) => {
            const inMonth  = isSameMonth(day, currentMonth)
            const selected = isSameDay(day, selectedDate)
            const today    = isToday(day)
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
                style={{ width: `${100 / 7}%`, paddingVertical: 2 }}
                className="items-center"
              >
                <View
                  className="w-9 h-9 rounded-full items-center justify-center"
                  style={
                    selected
                      ? { backgroundColor: colors.primary[600] }
                      : today
                      ? { backgroundColor: colors.primary[100] }
                      : undefined
                  }
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{
                      color: selected
                        ? '#fff'
                        : today
                        ? colors.primary[700]
                        : inMonth
                        ? colors.gray[800]
                        : colors.gray[300],
                    }}
                  >
                    {getDate(day)}
                  </Text>
                </View>

                {/* Event dots */}
                {dots.length > 0 ? (
                  <View className="flex-row gap-0.5 mt-0.5 h-1.5">
                    {dots.map((dotColor, di) => (
                      <View
                        key={di}
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: 3,
                          backgroundColor: selected ? 'rgba(255,255,255,0.8)' : dotColor,
                        }}
                      />
                    ))}
                  </View>
                ) : (
                  <View className="h-1.5" />
                )}
              </Pressable>
            )
          })}
        </View>
      </Animated.View>
    </View>
  )
}
