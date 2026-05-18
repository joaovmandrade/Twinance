import { View, Text } from 'react-native'
import { Calendar } from 'lucide-react-native'
import { format, parseISO, isToday, isTomorrow, isThisWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { colors } from '@/theme'
import { EVENT_TYPE_META } from '@/constants/events'
import { EventCard } from './EventCard'
import type { CalendarEvent } from '@/types'

interface UpcomingEventsProps {
  events: CalendarEvent[]
  onEventPress: (event: CalendarEvent) => void
  onEventLongPress: (event: CalendarEvent) => void
}

function getDayLabel(dateStr: string): string {
  try {
    const d = parseISO(dateStr)
    if (isToday(d))    return 'Hoje'
    if (isTomorrow(d)) return 'Amanhã'
    if (isThisWeek(d, { weekStartsOn: 0 }))
      return format(d, "EEEE", { locale: ptBR })
    return format(d, "d 'de' MMMM", { locale: ptBR })
  } catch {
    return dateStr
  }
}

function groupByDay(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>()
  for (const e of events) {
    const dayKey = e.startDate.slice(0, 10)
    const group = map.get(dayKey) ?? []
    group.push(e)
    map.set(dayKey, group)
  }
  return map
}

export function UpcomingEvents({ events, onEventPress, onEventLongPress }: UpcomingEventsProps) {
  if (events.length === 0) {
    return (
      <View className="items-center py-8 gap-3">
        <View className="w-14 h-14 rounded-full bg-gray-100 items-center justify-center">
          <Calendar size={26} color={colors.gray[400]} />
        </View>
        <Text className="text-sm font-semibold text-gray-400">Nenhum evento próximo</Text>
        <Text className="text-xs text-gray-300 text-center px-8">
          Toque em + para adicionar seu primeiro evento compartilhado
        </Text>
      </View>
    )
  }

  const groups = groupByDay(events)

  return (
    <View className="gap-4">
      {Array.from(groups.entries()).map(([dayKey, dayEvents]) => (
        <View key={dayKey} className="gap-2">
          <View className="flex-row items-center gap-2">
            <View className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            <Text className="text-xs font-bold text-gray-500 capitalize">
              {getDayLabel(dayKey + 'T00:00:00.000Z')}
            </Text>
          </View>

          <View className="gap-2">
            {dayEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={onEventPress}
                onLongPress={onEventLongPress}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  )
}

export function EventTypeLegend() {
  return (
    <View className="flex-row flex-wrap gap-2">
      {Object.entries(EVENT_TYPE_META).map(([type, meta]) => (
        <View
          key={type}
          className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ backgroundColor: meta.color + '18' }}
        >
          <Text style={{ fontSize: 11 }}>{meta.emoji}</Text>
          <Text className="text-xs font-semibold" style={{ color: meta.color }}>
            {meta.label}
          </Text>
        </View>
      ))}
    </View>
  )
}
