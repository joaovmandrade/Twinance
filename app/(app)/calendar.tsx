import { useRef, useState, useMemo, useCallback } from 'react'
import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from 'react-native'
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
import { useMonthEvents, useDeleteEvent } from '@/hooks/useEvents'
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
    <View style={{ gap: 12, padding: 16 }}>
      <Skeleton height={320} borderRadius={24} />
      <Skeleton height={24} width="40%" borderRadius={8} />
      <Skeleton height={72} borderRadius={14} />
      <Skeleton height={72} borderRadius={14} />
    </View>
  )
}

export default function CalendarScreen() {
  const today = useMemo(() => new Date(), [])
  const [currentMonth, setCurrentMonth] = useState<Date>(today)
  const [selectedDate,  setSelectedDate]  = useState<Date>(today)
  const [editingEvent,  setEditingEvent]  = useState<CalendarEvent | null>(null)

  const sheetRef = useRef<BottomSheet>(null)
  const { mutate: deleteEvent } = useDeleteEvent()

  const { events: monthEvents, isLoading } = useMonthEvents(
    getYear(currentMonth),
    getMonth(currentMonth) + 1,
  )

  const upcomingEvents = useMemo(() => {
    const from = startOfDay(today)
    return monthEvents
      .filter((e) => {
        try {
          return isAfter(parseISO(e.startDate), from) || isSameDay(parseISO(e.startDate), from)
        } catch { return false }
      })
      .slice(0, 20)
  }, [monthEvents, today])

  const selectedDayEvents = useMemo(() => {
    return monthEvents.filter((e) => {
      try { return isSameDay(parseISO(e.startDate), selectedDate) }
      catch { return false }
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
        { text: 'Excluir', style: 'destructive', onPress: () => deleteEvent(event.id) },
      ],
    )
  }

  const handleMonthChange = useCallback((month: Date) => {
    setCurrentMonth(month)
  }, [])

  const defaultDate = format(selectedDate, 'yyyy-MM-dd')

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Gradient header */}
      <LinearGradient
        colors={['#9B6CFF', '#FF4D8D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <View style={styles.headerRow}>
          <View style={{ gap: 2 }}>
            <View style={styles.headerBadge}>
              <Sparkles size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.headerBadgeText}>Calendário do casal</Text>
            </View>
            <Text style={styles.headerMonth}>
              {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
            </Text>
          </View>
          <Pressable onPress={openAddEvent} style={styles.addBtn}>
            <Plus size={22} color="#fff" />
          </Pressable>
        </View>
      </LinearGradient>

      {isLoading ? (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <CalendarSkeleton />
        </ScrollView>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={{ paddingHorizontal: 16 }}>
            <MonthView
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              events={monthEvents}
              onSelectDate={setSelectedDate}
              onMonthChange={handleMonthChange}
            />
          </View>

          {/* Selected day */}
          <View style={styles.section}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>
                {formatSelectedDate(selectedDate)}
              </Text>
              {selectedDayEvents.length > 0 && (
                <View style={styles.eventCountBadge}>
                  <Text style={styles.eventCountText}>
                    {selectedDayEvents.length} evento{selectedDayEvents.length > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>

            {selectedDayEvents.length === 0 ? (
              <Pressable onPress={openAddEvent} style={styles.emptyDay}>
                <View style={styles.emptyDayIcon}>
                  <Plus size={18} color={colors.primary[500]} />
                </View>
                <Text style={styles.emptyDayText}>
                  Nenhum evento — adicionar algo especial?
                </Text>
              </Pressable>
            ) : (
              <View style={{ gap: 8 }}>
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

          {upcomingEvents.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Próximos eventos</Text>
              <UpcomingEvents
                events={upcomingEvents}
                onEventPress={openEditEvent}
                onEventLongPress={handleDeleteEvent}
              />
            </View>
          )}

          {monthEvents.length === 0 && (
            <View style={styles.emptyMonth}>
              <Text style={styles.emptyEmoji}>📅</Text>
              <Text style={styles.emptyTitle}>Nenhum evento este mês</Text>
              <Text style={styles.emptySubtitle}>
                Planejem juntos: datas especiais, contas, viagens e metas
              </Text>
              <Pressable onPress={openAddEvent} style={styles.createBtn}>
                <LinearGradient
                  colors={['#FF4D8D', '#9B6CFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.createBtnGradient}
                >
                  <Text style={styles.createBtnText}>Criar primeiro evento</Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}
        </ScrollView>
      )}

      {/* FAB */}
      <Pressable onPress={openAddEvent} style={styles.fab}>
        <LinearGradient
          colors={['#FF4D8D', '#9B6CFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Plus size={26} color="#fff" />
        </LinearGradient>
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

const styles = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: '#0F0E17' },
  gradientHeader:  { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  headerRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerBadge:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerBadgeText: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.5 },
  headerMonth:     { color: '#fff', fontSize: 24, fontFamily: 'Inter_900Black', textTransform: 'capitalize', marginTop: 2 },
  addBtn:          { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  scrollContent:   { paddingBottom: 100, gap: 20, paddingTop: 16 },
  section:         { paddingHorizontal: 16, gap: 12 },
  dayHeader:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dayTitle:        { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#F0EEF8', textTransform: 'capitalize' },
  eventCountBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#2D1624' },
  eventCountText:  { fontSize: 11, fontFamily: 'Inter_700Bold', color: '#FF4D8D' },
  emptyDay:        { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1A1827', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: '#2D2A3E', borderStyle: 'dashed' },
  emptyDayIcon:    { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2D1624', alignItems: 'center', justifyContent: 'center' },
  emptyDayText:    { fontSize: 13, color: '#9B97B2', fontFamily: 'Inter_500Medium', flex: 1 },
  sectionTitle:    { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#F0EEF8' },
  emptyMonth:      { paddingHorizontal: 16, alignItems: 'center', paddingVertical: 24, gap: 10 },
  emptyEmoji:      { fontSize: 40 },
  emptyTitle:      { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#F0EEF8', textAlign: 'center' },
  emptySubtitle:   { fontSize: 13, color: '#9B97B2', textAlign: 'center', paddingHorizontal: 32, fontFamily: 'Inter_400Regular' },
  createBtn:       { marginTop: 8 },
  createBtnGradient: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999 },
  createBtnText:   { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 14 },
  fab:             { position: 'absolute', bottom: 88, right: 20 },
  fabGradient:     { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#9B6CFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 10 },
})
