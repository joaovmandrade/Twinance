import { apiGet, apiPost, apiPut, apiDelete } from '../lib/apiClient'
import type { Expense, ExpenseFormValues } from '../types'

export async function getExpenses(): Promise<Expense[]> {
  return apiGet<Expense[]>('/api/expenses')
}

export async function addExpense(values: ExpenseFormValues): Promise<Expense> {
  return apiPost<Expense>('/api/expenses', {
    amount: parseFloat(values.amount.replace(',', '.')),
    category: values.category,
    description: values.description,
    recurring: values.recurring,
    date: values.date,
  })
}

export async function updateExpense(id: string, values: Partial<ExpenseFormValues>): Promise<Expense> {
  const body: Record<string, unknown> = {}
  if (values.amount !== undefined) body.amount = parseFloat(values.amount.replace(',', '.'))
  if (values.category !== undefined) body.category = values.category
  if (values.description !== undefined) body.description = values.description
  if (values.recurring !== undefined) body.recurring = values.recurring
  if (values.date !== undefined) body.date = values.date
  return apiPut<Expense>(`/api/expenses/${id}`, body)
}

export async function deleteExpense(id: string): Promise<void> {
  return apiDelete(`/api/expenses/${id}`)
}

// Pure utility helpers (no API calls)
export function getTotalByUser(expenses: Expense[], userId: string): number {
  return expenses.filter((e) => e.userId === userId).reduce((s, e) => s + e.amount, 0)
}

export function getTotalByCategory(expenses: Expense[]): Record<string, number> {
  const totals: Record<string, number> = {}
  for (const e of expenses) {
    totals[e.category] = (totals[e.category] ?? 0) + e.amount
  }
  return totals
}
