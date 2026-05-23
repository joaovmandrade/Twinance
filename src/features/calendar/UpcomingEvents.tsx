import { View, Text, StyleSheet } from 'react-native'
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
  } catch { return dateStr }
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
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Calendar size={26} color={colors.muted} />
        </View>
        <Text style={styles.emptyTitle}>Nenhum evento próximo</Text>
        <Text style={styles.emptySubtitle}>
          Toque em + para adicionar seu primeiro evento compartilhado
        </Text>
      </View>
    )
  }

  const groups = groupByDay(events)

  return (
    <View style={{ gap: 20 }}>
      {Array.from(groups.entries()).map(([dayKey, dayEvents]) => (
        <View key={dayKey} style={{ gap: 8 }}>
          <View style={styles.dayLabelRow}>
            <View style={styles.dayDot} />
            <Text style={styles.dayLabel}>
              {getDayLabel(dayKey + 'T00:00:00.000Z')}
            </Text>
          </View>
          <View style={{ gap: 8 }}>
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
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {Object.entries(EVENT_TYPE_META).map(([type, meta]) => (
        <View
          key={type}
          style={[styles.legend, { backgroundColor: meta.color + '18' }]}
        >
          <Text style={{ fontSize: 11 }}>{meta.emoji}</Text>
          <Text style={[styles.legendText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  empty:       { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyIcon:   { width: 56, height: 56, borderRadius: 28, backgroundColor: '#221F32', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2D2A3E' },
  emptyTitle:  { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#9B97B2' },
  emptySubtitle: { fontSize: 12, color: '#544F68', fontFamily: 'Inter_400Regular', textAlign: 'center', paddingHorizontal: 32 },
  dayLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dayDot:      { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF4D8D' },
  dayLabel:    { fontSize: 12, fontFamily: 'Inter_700Bold', color: '#9B97B2', textTransform: 'capitalize' },
  legend:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  legendText:  { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
})
