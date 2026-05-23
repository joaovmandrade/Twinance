import { View, Text, Pressable, StyleSheet } from 'react-native'
import { MapPin, DollarSign, Repeat2 } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { EVENT_TYPE_META } from '@/constants/events'
import { colors } from '@/theme'
import type { CalendarEvent } from '@/types'

interface EventCardProps {
  event: CalendarEvent
  onPress?: (event: CalendarEvent) => void
  onLongPress?: (event: CalendarEvent) => void
  compact?: boolean
}

function formatEventTime(event: CalendarEvent): string {
  if (event.allDay) return 'Dia todo'
  try {
    return format(parseISO(event.startDate), "HH'h'mm", { locale: ptBR })
  } catch { return '' }
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function EventCard({ event, onPress, onLongPress, compact = false }: EventCardProps) {
  const meta      = EVENT_TYPE_META[event.type]
  const timeLabel = formatEventTime(event)
  const accentColor = event.color || meta.color

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync()
        onPress?.(event)
      }}
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        onLongPress?.(event)
      }}
      style={({ pressed }) => [styles.card, { borderLeftColor: accentColor, opacity: pressed ? 0.75 : 1 }]}
    >
      {/* Color accent */}
      <View style={[styles.iconArea, { backgroundColor: accentColor + '18' }]}>
        <Text style={{ fontSize: compact ? 18 : 22 }}>{meta.emoji}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[styles.title, { fontSize: compact ? 13 : 14 }]}
          numberOfLines={1}
        >
          {event.title}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.time}>{timeLabel}</Text>

          {event.location ? (
            <View style={styles.locationRow}>
              <MapPin size={10} color={colors.muted} />
              <Text style={styles.locationText} numberOfLines={1}>{event.location}</Text>
            </View>
          ) : null}

          {event.isRecurring ? (
            <Repeat2 size={11} color={colors.muted} />
          ) : null}
        </View>
      </View>

      {/* Right */}
      <View style={styles.right}>
        {event.amount !== null ? (
          <View style={styles.amountCol}>
            <DollarSign size={12} color={accentColor} />
            <Text style={[styles.amountText, { color: accentColor }]}>
              {formatAmount(event.amount)}
            </Text>
          </View>
        ) : (
          <View style={[styles.typeBadge, { backgroundColor: accentColor + '22' }]}>
            <Text style={[styles.typeBadgeText, { color: accentColor }]}>{meta.label}</Text>
          </View>
        )}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card:       { backgroundColor: '#1A1827', borderRadius: 14, overflow: 'hidden', flexDirection: 'row', borderLeftWidth: 4, borderWidth: 1, borderColor: '#2D2A3E' },
  iconArea:   { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  content:    { flex: 1, paddingVertical: 12, paddingHorizontal: 12, gap: 3 },
  title:      { fontFamily: 'Inter_700Bold', color: '#F0EEF8' },
  metaRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  time:       { fontSize: 11, color: '#9B97B2', fontFamily: 'Inter_500Medium' },
  locationRow:{ flexDirection: 'row', alignItems: 'center', gap: 3 },
  locationText: { fontSize: 11, color: '#9B97B2', fontFamily: 'Inter_400Regular' },
  right:      { justifyContent: 'center', alignItems: 'flex-end', paddingRight: 12, paddingLeft: 4 },
  amountCol:  { alignItems: 'flex-end', gap: 2 },
  amountText: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  typeBadge:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  typeBadgeText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
})
