import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { categoryMeta } from '../../mock/categories'
import { useExpenses } from '../../contexts/ExpenseContext'
import type { ExpenseCategory, ExpenseFormValues } from '../../types'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const categoryOptions = Object.entries(categoryMeta).map(([value, meta]) => ({
  value,
  label: `${meta.emoji} ${meta.label}`,
}))

function today() {
  return new Date().toISOString().split('T')[0]
}

const defaultValues: ExpenseFormValues = {
  amount: '',
  category: 'food',
  description: '',
  recurring: false,
  date: today(),
}

export function AddExpenseModal({ isOpen, onClose }: Props) {
  const { addExpense } = useExpenses()
  const [values, setValues] = useState<ExpenseFormValues>(defaultValues)
  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseFormValues, string>>>({})
  const [loading, setLoading] = useState(false)

  function set<K extends keyof ExpenseFormValues>(key: K, val: ExpenseFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validate(): boolean {
    const next: typeof errors = {}
    if (!values.amount || isNaN(parseFloat(values.amount.replace(',', '.')))) {
      next.amount = 'Informe um valor válido.'
    }
    if (!values.description.trim()) {
      next.description = 'Informe uma descrição.'
    }
    if (!values.date) {
      next.date = 'Informe a data.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await addExpense(values)
      setValues(defaultValues)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo gasto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Amount */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Valor (R$)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">
              R$
            </span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={values.amount}
              onChange={(e) => set('amount', e.target.value)}
              className={[
                'w-full rounded-2xl border bg-white pl-10 pr-4 py-3 text-2xl font-bold text-gray-900 placeholder-gray-300 transition-all',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                errors.amount ? 'border-red-400' : 'border-gray-200',
              ].join(' ')}
            />
          </div>
          {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
        </div>

        <Select
          label="Categoria"
          value={values.category}
          options={categoryOptions}
          onChange={(e) => set('category', e.target.value as ExpenseCategory)}
        />

        <Input
          label="Descrição"
          placeholder="Ex: Mercado, Uber, Netflix..."
          value={values.description}
          onChange={(e) => set('description', e.target.value)}
          error={errors.description}
        />

        <Input
          label="Data"
          type="date"
          value={values.date}
          onChange={(e) => set('date', e.target.value)}
          error={errors.date}
        />

        {/* Recurring toggle */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={values.recurring}
              onChange={(e) => set('recurring', e.target.checked)}
            />
            <div
              className={[
                'h-6 w-11 rounded-full transition-colors duration-200',
                values.recurring ? 'bg-primary-600' : 'bg-gray-200',
              ].join(' ')}
            />
            <div
              className={[
                'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
                values.recurring ? 'translate-x-5' : 'translate-x-0',
              ].join(' ')}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Gasto recorrente</p>
            <p className="text-xs text-gray-500">Repete todo mês</p>
          </div>
        </label>

        <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
          Adicionar gasto
        </Button>
      </form>
    </Modal>
  )
}
