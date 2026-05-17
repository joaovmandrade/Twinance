import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/config'
import {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} from '@/services/expenseService'
import type { ExpenseFormValues } from '@/types'

export function useExpenses() {
  const { data: expenses = [], isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.expenses,
    queryFn: getExpenses,
  })

  return { expenses, isLoading, error }
}

export function useAddExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (values: ExpenseFormValues) => addExpense(values),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.expenses }),
  })
}

export function useUpdateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<ExpenseFormValues> }) =>
      updateExpense(id, values),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.expenses }),
  })
}

export function useDeleteExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.expenses }),
  })
}
