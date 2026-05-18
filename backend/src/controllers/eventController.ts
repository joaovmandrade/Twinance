import { Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../services/supabase'
import { AuthRequest } from '../types'

type EventType = 'bill' | 'date' | 'travel' | 'goal' | 'appointment' | 'custom'

const VALID_TYPES: EventType[] = ['bill', 'date', 'travel', 'goal', 'appointment', 'custom']

interface EventRow {
  id: string
  couple_id: string
  created_by: string
  title: string
  description: string | null
  type: EventType
  start_date: string
  end_date: string | null
  all_day: boolean
  location: string | null
  color: string
  amount: string | null
  is_recurring: boolean
  reminder_minutes: number | null
  created_at: string
  updated_at: string
}

function mapEvent(e: EventRow) {
  return {
    id: e.id,
    coupleId: e.couple_id,
    createdBy: e.created_by,
    title: e.title,
    description: e.description ?? '',
    type: e.type,
    startDate: e.start_date,
    endDate: e.end_date,
    allDay: e.all_day,
    location: e.location ?? '',
    color: e.color,
    amount: e.amount !== null ? Number(e.amount) : null,
    isRecurring: e.is_recurring,
    reminderMinutes: e.reminder_minutes,
    createdAt: e.created_at,
    updatedAt: e.updated_at,
  }
}

async function getUserCoupleId(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', userId)
    .single()
  return data?.couple_id ?? null
}

export async function getEvents(req: AuthRequest, res: Response): Promise<void> {
  const coupleId = await getUserCoupleId(req.userId)
  if (!coupleId) {
    res.status(404).json({ message: 'No couple found' })
    return
  }

  const { startDate, endDate, type } = req.query as Record<string, string | undefined>

  let query = supabase
    .from('events')
    .select('*')
    .eq('couple_id', coupleId)
    .order('start_date', { ascending: true })

  if (startDate) query = query.gte('start_date', startDate)
  if (endDate)   query = query.lte('start_date', endDate)
  if (type && VALID_TYPES.includes(type as EventType)) query = query.eq('type', type)

  const { data, error } = await query

  if (error) {
    res.status(500).json({ message: error.message })
    return
  }

  res.json(((data ?? []) as EventRow[]).map(mapEvent))
}

export async function getMonthEvents(req: AuthRequest, res: Response): Promise<void> {
  const coupleId = await getUserCoupleId(req.userId)
  if (!coupleId) {
    res.status(404).json({ message: 'No couple found' })
    return
  }

  const { year, month } = req.query as Record<string, string>

  if (!year || !month) {
    res.status(400).json({ message: 'year and month query params are required' })
    return
  }

  const y = parseInt(year, 10)
  const m = parseInt(month, 10)

  if (isNaN(y) || isNaN(m) || m < 1 || m > 12) {
    res.status(400).json({ message: 'Invalid year or month' })
    return
  }

  const monthStart = new Date(Date.UTC(y, m - 1, 1)).toISOString()
  const monthEnd   = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999)).toISOString()

  // Events that overlap with the month window
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('couple_id', coupleId)
    .lte('start_date', monthEnd)
    .or(`end_date.is.null,end_date.gte.${monthStart}`)
    .order('start_date', { ascending: true })

  if (error) {
    res.status(500).json({ message: error.message })
    return
  }

  // Filter out point-in-time events that start before this month
  const events = ((data ?? []) as EventRow[])
    .filter((e) => e.end_date !== null || e.start_date >= monthStart)
    .map(mapEvent)

  res.json(events)
}

export async function createEvent(req: AuthRequest, res: Response): Promise<void> {
  const coupleId = await getUserCoupleId(req.userId)
  if (!coupleId) {
    res.status(404).json({ message: 'No couple found. Join or create a couple first.' })
    return
  }

  const {
    title, description, type, startDate, endDate,
    allDay, location, color, amount, isRecurring, reminderMinutes,
  } = req.body as {
    title?: string
    description?: string
    type?: EventType
    startDate?: string
    endDate?: string
    allDay?: boolean
    location?: string
    color?: string
    amount?: number
    isRecurring?: boolean
    reminderMinutes?: number
  }

  if (!title || !type || !startDate) {
    res.status(400).json({ message: 'title, type, and startDate are required' })
    return
  }

  if (!VALID_TYPES.includes(type)) {
    res.status(400).json({ message: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` })
    return
  }

  const { data: event, error } = await supabase
    .from('events')
    .insert({
      id: uuidv4(),
      couple_id: coupleId,
      created_by: req.userId,
      title: title.trim(),
      description: description?.trim() ?? '',
      type,
      start_date: startDate,
      end_date: endDate ?? null,
      all_day: allDay ?? false,
      location: location?.trim() ?? '',
      color: color ?? '#8b5cf6',
      amount: amount ?? null,
      is_recurring: isRecurring ?? false,
      reminder_minutes: reminderMinutes ?? null,
    })
    .select('*')
    .single()

  if (error || !event) {
    res.status(500).json({ message: error?.message ?? 'Failed to create event' })
    return
  }

  res.status(201).json(mapEvent(event as EventRow))
}

export async function updateEvent(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params

  const { data: existing } = await supabase
    .from('events')
    .select('created_by')
    .eq('id', id)
    .single()

  if (!existing) {
    res.status(404).json({ message: 'Event not found' })
    return
  }

  if (existing.created_by !== req.userId) {
    res.status(403).json({ message: 'You can only edit your own events' })
    return
  }

  const body = req.body as Record<string, unknown>
  const updates: Record<string, unknown> = {}

  if (body.title !== undefined)           updates.title            = String(body.title).trim()
  if (body.description !== undefined)     updates.description      = String(body.description).trim()
  if (body.type !== undefined)            updates.type             = body.type
  if (body.startDate !== undefined)       updates.start_date       = body.startDate
  if (body.endDate !== undefined)         updates.end_date         = body.endDate
  if (body.allDay !== undefined)          updates.all_day          = body.allDay
  if (body.location !== undefined)        updates.location         = String(body.location).trim()
  if (body.color !== undefined)           updates.color            = body.color
  if (body.amount !== undefined)          updates.amount           = body.amount
  if (body.isRecurring !== undefined)     updates.is_recurring     = body.isRecurring
  if (body.reminderMinutes !== undefined) updates.reminder_minutes = body.reminderMinutes

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ message: 'No fields to update' })
    return
  }

  const { data: updated, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (error || !updated) {
    res.status(500).json({ message: error?.message ?? 'Failed to update event' })
    return
  }

  res.json(mapEvent(updated as EventRow))
}

export async function deleteEvent(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params

  const { data: existing } = await supabase
    .from('events')
    .select('created_by')
    .eq('id', id)
    .single()

  if (!existing) {
    res.status(404).json({ message: 'Event not found' })
    return
  }

  if (existing.created_by !== req.userId) {
    res.status(403).json({ message: 'You can only delete your own events' })
    return
  }

  const { error } = await supabase.from('events').delete().eq('id', id)

  if (error) {
    res.status(500).json({ message: error.message })
    return
  }

  res.status(204).send()
}
