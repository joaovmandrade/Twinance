import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/config'
import {
  getEvents,
  getMonthEvents,
  addEvent,
  updateEvent,
  deleteEvent,
} from '@/services/eventService'
import type { CalendarEventFormValues, EventType } from '@/types'

export function useMonthEvents(year: number, month: number) {
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.monthEvents(year, month),
    queryFn: () => getMonthEvents(year, month),
    staleTime: 60_000,
  })
  return { events, isLoading, error }
}

export function useEvents(params?: { startDate?: string; endDate?: string; type?: EventType }) {
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: [...QUERY_KEYS.events, params],
    queryFn: () => getEvents(params),
    staleTime: 60_000,
  })
  return { events, isLoading, error }
}

export function useAddEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (values: CalendarEventFormValues) => addEvent(values),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.events }),
  })
}

export function useUpdateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<CalendarEventFormValues> }) =>
      updateEvent(id, values),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.events }),
  })
}

export function useDeleteEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.events }),
  })
}
