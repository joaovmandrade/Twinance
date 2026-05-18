import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/apiClient'
import type { CalendarEvent, CalendarEventFormValues } from '@/types'

function buildStartDate(values: CalendarEventFormValues): string {
  if (values.allDay) return `${values.startDate}T00:00:00.000Z`
  return `${values.startDate}T${values.startTime || '00:00'}:00.000Z`
}

function buildEndDate(values: CalendarEventFormValues): string | undefined {
  if (!values.endDate) return undefined
  if (values.allDay) return `${values.endDate}T23:59:59.999Z`
  return `${values.endDate}T${values.endTime || '23:59'}:59.000Z`
}

export async function getEvents(params?: {
  startDate?: string
  endDate?: string
  type?: string
}): Promise<CalendarEvent[]> {
  const qs = new URLSearchParams()
  if (params?.startDate) qs.set('startDate', params.startDate)
  if (params?.endDate)   qs.set('endDate', params.endDate)
  if (params?.type)      qs.set('type', params.type)
  const query = qs.toString() ? `?${qs.toString()}` : ''
  return apiGet<CalendarEvent[]>(`/api/events${query}`)
}

export async function getMonthEvents(year: number, month: number): Promise<CalendarEvent[]> {
  return apiGet<CalendarEvent[]>(`/api/events/month?year=${year}&month=${month}`)
}

export async function addEvent(values: CalendarEventFormValues): Promise<CalendarEvent> {
  return apiPost<CalendarEvent>('/api/events', {
    title: values.title,
    description: values.description,
    type: values.type,
    startDate: buildStartDate(values),
    endDate: buildEndDate(values),
    allDay: values.allDay,
    location: values.location,
    color: values.color,
    amount: values.amount ? parseFloat(values.amount.replace(',', '.')) : undefined,
    isRecurring: values.isRecurring,
    reminderMinutes: values.reminderMinutes,
  })
}

export async function updateEvent(
  id: string,
  values: Partial<CalendarEventFormValues>,
): Promise<CalendarEvent> {
  const body: Record<string, unknown> = {}
  if (values.title !== undefined)       body.title    = values.title
  if (values.description !== undefined) body.description = values.description
  if (values.type !== undefined)        body.type     = values.type
  if (values.allDay !== undefined)      body.allDay   = values.allDay
  if (values.location !== undefined)    body.location = values.location
  if (values.color !== undefined)       body.color    = values.color
  if (values.isRecurring !== undefined) body.isRecurring = values.isRecurring
  if (values.reminderMinutes !== undefined) body.reminderMinutes = values.reminderMinutes
  if (values.amount !== undefined)
    body.amount = values.amount ? parseFloat(values.amount.replace(',', '.')) : null
  if (values.startDate !== undefined)
    body.startDate = values.allDay
      ? `${values.startDate}T00:00:00.000Z`
      : `${values.startDate}T${values.startTime || '00:00'}:00.000Z`
  if (values.endDate !== undefined)
    body.endDate = values.endDate
      ? (values.allDay
          ? `${values.endDate}T23:59:59.999Z`
          : `${values.endDate}T${values.endTime || '23:59'}:59.000Z`)
      : null

  return apiPut<CalendarEvent>(`/api/events/${id}`, body)
}

export async function deleteEvent(id: string): Promise<void> {
  return apiDelete(`/api/events/${id}`)
}
