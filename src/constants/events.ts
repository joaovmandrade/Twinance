import type { EventType } from '@/types'

export interface EventTypeMeta {
  emoji: string
  label: string
  color: string
  description: string
}

export const EVENT_TYPE_META: Record<EventType, EventTypeMeta> = {
  bill:        { emoji: '💸', label: 'Conta',         color: '#ef4444', description: 'Contas e pagamentos' },
  date:        { emoji: '💕', label: 'Encontro',      color: '#ec4899', description: 'Momentos a dois' },
  travel:      { emoji: '✈️', label: 'Viagem',        color: '#3b82f6', description: 'Viagens e passeios' },
  goal:        { emoji: '🎯', label: 'Meta',          color: '#10b981', description: 'Metas financeiras' },
  appointment: { emoji: '📅', label: 'Compromisso',   color: '#8b5cf6', description: 'Consultas e reuniões' },
  custom:      { emoji: '⭐', label: 'Personalizado', color: '#f59e0b', description: 'Qualquer evento' },
}

export const EVENT_TYPES = Object.keys(EVENT_TYPE_META) as EventType[]

export const EVENT_COLORS = [
  '#8b5cf6',
  '#ec4899',
  '#3b82f6',
  '#10b981',
  '#ef4444',
  '#f59e0b',
  '#f97316',
  '#14b8a6',
]

export const REMINDER_OPTIONS = [
  { label: 'No momento',        value: 0 },
  { label: '5 min antes',       value: 5 },
  { label: '15 min antes',      value: 15 },
  { label: '30 min antes',      value: 30 },
  { label: '1 hora antes',      value: 60 },
  { label: '1 dia antes',       value: 1440 },
]
