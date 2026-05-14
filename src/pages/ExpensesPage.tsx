import React, { useMemo, useState } from 'react'
import { Search, SlidersHorizontal, Receipt } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCouple } from '../contexts/CoupleContext'
import { useExpenses } from '../contexts/ExpenseContext'
import { categoryMeta } from '../utils/categoryMeta'
import { formatCurrency } from '../utils/format'
import { ExpenseCard } from '../components/expenses/ExpenseCard'
import { Spinner } from '../components/ui/Spinner'
import type { User } from '../types'

const ALL_CATEGORIES = [
  { value: 'all', label: 'Todas' },
  ...Object.entries(categoryMeta).map(([v, m]) => ({ value: v, label: `${m.emoji} ${m.label}` })),
]

export function ExpensesPage() {
  const { user } = useAuth()
  const { partner } = useCouple()
  const { expenses, isLoading, removeExpense } = useExpenses()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  function getUserById(id: string): User | null {
    if (id === user?.id) return user
    if (id === partner?.id) return partner
    return null
  }

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch =
        !search ||
        e.description.toLowerCase().includes(search.toLowerCase()) ||
        categoryMeta[e.category as keyof typeof categoryMeta]?.label.toLowerCase().includes(search.toLowerCase())
      const matchCat = categoryFilter === 'all' || e.category === categoryFilter
      const matchUser = userFilter === 'all' || e.userId === userFilter
      return matchSearch && matchCat && matchUser
    })
  }, [expenses, search, categoryFilter, userFilter])

  const total = useMemo(() => filtered.reduce((s, e) => s + e.amount, 0), [filtered])

  return (
    <div className="pt-6 pb-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">Gastos</h1>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={[
            'flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-semibold transition-colors',
            showFilters
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50',
          ].join(' ')}
        >
          <SlidersHorizontal size={14} />
          Filtros
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar gastos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {showFilters && (
        <div className="bg-white rounded-3xl shadow-card p-4 flex flex-col gap-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Categoria</p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategoryFilter(c.value)}
                  className={[
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    categoryFilter === c.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  ].join(' ')}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Pessoa</p>
            <div className="flex gap-1.5">
              {[
                { value: 'all', label: 'Todos' },
                { value: user?.id ?? '', label: user?.name.split(' ')[0] ?? 'Você' },
                { value: partner?.id ?? '', label: partner?.name.split(' ')[0] ?? 'Parceiro(a)' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setUserFilter(opt.value)}
                  className={[
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    userFilter === opt.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-sm">
        <span className="text-sm text-gray-500">{filtered.length} gastos encontrados</span>
        <span className="text-sm font-bold text-gray-900">{formatCurrency(total)}</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : filtered.length > 0 ? (
        <div className="flex flex-col gap-2">
          {filtered.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              user={getUserById(expense.userId)}
              onDelete={removeExpense}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="h-16 w-16 rounded-3xl bg-gray-100 flex items-center justify-center">
            <Receipt size={28} className="text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-400">Nenhum gasto encontrado</p>
          <p className="text-xs text-gray-300">
            {search || categoryFilter !== 'all' || userFilter !== 'all'
              ? 'Tente outros filtros.'
              : 'Adicione seu primeiro gasto com o botão +'}
          </p>
        </div>
      )}
    </div>
  )
}
