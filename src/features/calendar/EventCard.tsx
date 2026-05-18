import { View, Text, Pressable } from 'react-native'
import { MapPin, DollarSign, Repeat2 } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { EVENT_TYPE_META } from '@/constants/events'
import { colors, shadows } from '@/theme'
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
  } catch {
    return ''
  }
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function EventCard({ event, onPress, onLongPress, compact = false }: EventCardProps) {
  const meta = EVENT_TYPE_META[event.type]
  const timeLabel = formatEventTime(event)

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
      className="active:opacity-75"
    >
      <View
        className="bg-white rounded-2xl overflow-hidden flex-row"
        style={[shadows.sm, { borderLeftWidth: 4, borderLeftColor: event.color || meta.color }]}
      >
        {/* Color accent + icon */}
        <View
          className="items-center justify-center px-3"
          style={{ backgroundColor: (event.color || meta.color) + '15' }}
        >
          <Text style={{ fontSize: compact ? 18 : 22 }}>{meta.emoji}</Text>
        </View>

        {/* Content */}
        <View className="flex-1 py-3 px-3 gap-0.5">
          <Text
            className="font-bold text-gray-900"
            style={{ fontSize: compact ? 13 : 14 }}
            numberOfLines={1}
          >
            {event.title}
          </Text>

          <View className="flex-row items-center gap-3 flex-wrap">
            <Text className="text-xs text-gray-400 font-medium">{timeLabel}</Text>

            {event.location ? (
              <View className="flex-row items-center gap-1">
                <MapPin size={10} color={colors.gray[400]} />
                <Text className="text-xs text-gray-400" numberOfLines={1}>
                  {event.location}
                </Text>
              </View>
            ) : null}

            {event.isRecurring ? (
              <Repeat2 size={11} color={colors.gray[400]} />
            ) : null}
          </View>
        </View>

        {/* Right: amount or type label */}
        <View className="justify-center items-end pr-3 pl-1">
          {event.amount !== null ? (
            <View className="items-end gap-0.5">
              <DollarSign size={12} color={meta.color} />
              <Text className="text-xs font-bold" style={{ color: meta.color }}>
                {formatAmount(event.amount)}
              </Text>
            </View>
          ) : (
            <View
              className="px-2 py-0.5 rounded-full"
              style={{ backgroundColor: (event.color || meta.color) + '20' }}
            >
              <Text className="text-xs font-semibold" style={{ color: event.color || meta.color }}>
                {meta.label}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  )
}
