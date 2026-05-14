import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as expenseService from '../services/expenseService'
import { useAuth } from './AuthContext'
import { useCouple } from './CoupleContext'
import type { Expense, ExpenseFormValues } from '../types'

interface ExpenseContextValue {
  expenses: Expense[]
  isLoading: boolean
  addExpense: (values: ExpenseFormValues) => Promise<void>
  removeExpense: (id: string) => Promise<void>
  refresh: () => void
}

const ExpenseContext = createContext<ExpenseContextValue | null>(null)

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const { couple } = useCouple()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const load = useCallback(async () => {
    if (!isAuthenticated || !couple) {
      setExpenses([])
      return
    }
    setIsLoading(true)
    try {
      const data = await expenseService.getExpenses()
      setExpenses(data)
    } catch {
      setExpenses([])
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, couple])

  useEffect(() => {
    load()
  }, [load])

  async function addExpense(values: ExpenseFormValues) {
    const expense = await expenseService.addExpense(values)
    setExpenses((prev) => [expense, ...prev])
  }

  async function removeExpense(id: string) {
    await expenseService.deleteExpense(id)
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <ExpenseContext.Provider
      value={{ expenses, isLoading, addExpense, removeExpense, refresh: load }}
    >
      {children}
    </ExpenseContext.Provider>
  )
}

export function useExpenses() {
  const ctx = useContext(ExpenseContext)
  if (!ctx) throw new Error('useExpenses must be used within ExpenseProvider')
  return ctx
}
