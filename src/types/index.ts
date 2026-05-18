export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  createdAt: string
}

export interface Couple {
  id: string
  inviteCode: string
  user1Id: string
  user2Id: string
  createdAt: string
}

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'health'
  | 'entertainment'
  | 'home'
  | 'shopping'
  | 'education'
  | 'travel'
  | 'pets'
  | 'other'

export interface Expense {
  id: string
  userId: string
  coupleId: string
  amount: number
  category: ExpenseCategory
  description: string
  recurring: boolean
  date: string
  createdAt: string
}

export interface CategoryMeta {
  label: string
  color: string
  emoji: string
}

export type LoginPayload = { email: string; password: string }
export type RegisterPayload = { name: string; email: string; password: string }

export interface ExpenseFormValues {
  amount: string
  category: ExpenseCategory
  description: string
  recurring: boolean
  date: string
}

export interface CoupleResponse {
  couple: Couple
  partner: User | null
}

// ── Calendar Events ───────────────────────────────────────────

export type EventType = 'bill' | 'date' | 'travel' | 'goal' | 'appointment' | 'custom'

export interface CalendarEvent {
  id: string
  coupleId: string
  createdBy: string
  title: string
  description: string
  type: EventType
  startDate: string
  endDate: string | null
  allDay: boolean
  location: string
  color: string
  amount: number | null
  isRecurring: boolean
  reminderMinutes: number | null
  createdAt: string
  updatedAt: string
}

export interface CalendarEventFormValues {
  title: string
  description: string
  type: EventType
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  allDay: boolean
  location: string
  color: string
  amount: string
  isRecurring: boolean
  reminderMinutes: number | null
}
