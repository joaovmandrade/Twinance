import { useRef, useState, useMemo, useCallback } from 'react'
import {
  View, Text, ScrollView, Pressable, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Plus, Sparkles } from 'lucide-react-native'
import BottomSheet from '@gorhom/bottom-sheet'
import * as Haptics from 'expo-haptics'
import {
  format, isSameDay, parseISO, isAfter, startOfDay,
  getMonth, getYear, addDays,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Skeleton } from '@/components/ui/Skeleton'
import { MonthView, EventModal, EventCard, UpcomingEvents } from '@/features/calendar'
import { useMonthEvents, useEvents, useDeleteEvent } from '@/hooks/useEvents'
import { colors } from '@/theme'
import type { CalendarEvent } from '@/types'

function formatSelectedDate(date: Date): string {
  const today = new Date()
  if (isSameDay(date, today)) return 'Hoje'
  if (isSameDay(date, addDays(today, 1))) return 'Amanhã'
  return format(date, "EEE, d 'de' MMMM", { locale: ptBR })
}

function CalendarSkeleton() {
  return (
    <View className="gap-3 px-4">
      <Skeleton height={320} borderRadius={24} />
      <Skeleton height={24} width="40%" borderRadius={8} />
      <Skeleton height={72} borderRadius={16} />
      <Skeleton height={72} borderRadius={16} />
    </View>
  )
}

export default function CalendarScreen() {
  const today = useMemo(() => new Date(), [])
  const [currentMonth, setCurrentMonth] = useState<Date>(today)
  const [selectedDate, setSelectedDate] = useState<Date>(today)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)

  const sheetRef = useRef<BottomSheet>(null)
  const { mutate: deleteEvent } = useDeleteEvent()

  // Fetch events for the visible month
  const { events: monthEvents, isLoading } = useMonthEvents(
    getYear(currentMonth),
    getMonth(currentMonth) + 1,
  )

  // Upcoming events: from today for next 30 days
  const upcomingEvents = useMemo(() => {
    const from = startOfDay(today)
    return monthEvents
      .filter((e) => {
        try {
          return isAfter(parseISO(e.startDate), from) || isSameDay(parseISO(e.startDate), from)
        } catch {
          return false
        }
      })
      .slice(0, 20)
  }, [monthEvents, today])

  // Events for the selected day
  const selectedDayEvents = useMemo(() => {
    return monthEvents.filter((e) => {
      try {
        return isSameDay(parseISO(e.startDate), selectedDate)
      } catch {
        return false
      }
    })
  }, [monthEvents, selectedDate])

  function openAddEvent() {
    setEditingEvent(null)
    sheetRef.current?.expand()
  }

  function openEditEvent(event: CalendarEvent) {
    setEditingEvent(event)
    sheetRef.current?.expand()
  }

  function handleDeleteEvent(event: CalendarEvent) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    Alert.alert(
      'Excluir evento',
      `Deseja excluir "${event.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteEvent(event.id),
        },
      ],
    )
  }

  const handleMonthChange = useCallback((month: Date) => {
    setCurrentMonth(month)
    // Keep selected date in sync if it's within the new month
  }, [])

  const defaultDate = format(selectedDate, 'yyyy-MM-dd')

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Gradient header */}
      <LinearGradient
        colors={[colors.primary[700], colors.primary[500]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-5 pt-3 pb-5"
      >
        <View className="flex-row items-center justify-between">
          <View className="gap-0.5">
            <View className="flex-row items-center gap-2">
              <Sparkles size={16} color="rgba(255,255,255,0.8)" />
              <Text className="text-white/80 text-xs font-semibold tracking-wide uppercase">
                Calendário do casal
              </Text>
            </View>
            <Text className="text-white text-2xl font-black">
              {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
            </Text>
          </View>

          <Pressable
            onPress={openAddEvent}
            className="w-11 h-11 rounded-full bg-white/20 items-center justify-center active:bg-white/30"
          >
            <Plus size={22} color="#fff" />
          </Pressable>
        </View>
      </LinearGradient>

      {isLoading ? (
        <ScrollView className="flex-1 pt-4" showsVerticalScrollIndicator={false}>
          <CalendarSkeleton />
        </ScrollView>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100, gap: 16, paddingTop: 16 }}
        >
          {/* Month grid */}
          <View className="px-4">
            <MonthView
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              events={monthEvents}
              onSelectDate={setSelectedDate}
              onMonthChange={handleMonthChange}
            />
          </View>

          {/* Selected day events */}
          <View className="px-4 gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-gray-900 capitalize">
                {formatSelectedDate(selectedDate)}
              </Text>
              {selectedDayEvents.length > 0 && (
                <View
                  className="px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: colors.primary[100] }}
                >
                  <Text className="text-xs font-bold" style={{ color: colors.primary[700] }}>
                    {selectedDayEvents.length} evento{selectedDayEvents.length > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>

            {selectedDayEvents.length === 0 ? (
              <Pressable
                onPress={openAddEvent}
                className="flex-row items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-dashed border-gray-200 active:opacity-70"
              >
                <View
                  className="w-9 h-9 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.primary[50] }}
                >
                  <Plus size={18} color={colors.primary[500]} />
                </View>
                <Text className="text-sm text-gray-400 font-medium">
                  Nenhum evento — adicionar algo especial?
                </Text>
              </Pressable>
            ) : (
              <View className="gap-2">
                {selectedDayEvents.map((e) => (
                  <EventCard
                    key={e.id}
                    event={e}
                    onPress={openEditEvent}
                    onLongPress={handleDeleteEvent}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Upcoming events */}
          {upcomingEvents.length > 0 && (
            <View className="px-4 gap-3">
              <Text className="text-base font-bold text-gray-900">Próximos eventos</Text>
              <UpcomingEvents
                events={upcomingEvents}
                onEventPress={openEditEvent}
                onEventLongPress={handleDeleteEvent}
              />
            </View>
          )}

          {/* Empty state for month */}
          {monthEvents.length === 0 && (
            <View className="px-4 items-center py-6 gap-3">
              <Text className="text-4xl">📅</Text>
              <Text className="text-base font-bold text-gray-700 text-center">
                Nenhum evento este mês
              </Text>
              <Text className="text-sm text-gray-400 text-center px-8">
                Planejem juntos: datas especiais, contas, viagens e metas
              </Text>
              <Pressable
                onPress={openAddEvent}
                className="mt-2 px-6 py-3 rounded-full active:opacity-70"
                style={{ backgroundColor: colors.primary[600] }}
              >
                <Text className="text-white font-bold text-sm">Criar primeiro evento</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      )}

      {/* FAB */}
      <Pressable
        onPress={openAddEvent}
        className="absolute bottom-6 right-5 w-14 h-14 rounded-full items-center justify-center active:opacity-80"
        style={{
          backgroundColor: colors.primary[600],
          elevation: 8,
          shadowColor: colors.primary[700],
          shadowOpacity: 0.4,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
        }}
      >
        <Plus size={26} color="#fff" />
      </Pressable>

      <EventModal
        ref={sheetRef}
        event={editingEvent}
        defaultDate={defaultDate}
        onSuccess={() => setEditingEvent(null)}
        onClose={() => setEditingEvent(null)}
      />
    </SafeAreaView>
  )
}
