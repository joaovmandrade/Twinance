import type { CategoryMeta, ExpenseCategory } from '@/types'

export const CATEGORY_META: Record<ExpenseCategory, CategoryMeta> = {
  food:          { label: 'Alimentação',   color: '#f59e0b', emoji: '🍔' },
  transport:     { label: 'Transporte',    color: '#3b82f6', emoji: '🚗' },
  health:        { label: 'Saúde',         color: '#10b981', emoji: '❤️' },
  entertainment: { label: 'Lazer',         color: '#8b5cf6', emoji: '🎬' },
  home:          { label: 'Casa',          color: '#6366f1', emoji: '🏠' },
  shopping:      { label: 'Compras',       color: '#ec4899', emoji: '🛍️' },
  education:     { label: 'Educação',      color: '#14b8a6', emoji: '📚' },
  travel:        { label: 'Viagem',        color: '#f97316', emoji: '✈️' },
  pets:          { label: 'Pet',           color: '#a78bfa', emoji: '🐾' },
  other:         { label: 'Outros',        color: '#94a3b8', emoji: '📦' },
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'food', 'transport', 'health', 'entertainment',
  'home', 'shopping', 'education', 'travel', 'pets', 'other',
]
