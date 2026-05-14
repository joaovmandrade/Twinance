import React from 'react'
import { RefreshCw, Trash2 } from 'lucide-react'
import type { Expense, User } from '../../types'
import { categoryMeta } from '../../mock/categories'
import { formatCurrency, formatDate } from '../../utils/format'
import { Badge } from '../ui/Badge'
import { Avatar } from '../ui/Avatar'

interface Props {
  expense: Expense
  user: User | null
  onDelete?: (id: string) => void
}

export function ExpenseCard({ expense, user, onDelete }: Props) {
  const meta = categoryMeta[expense.category]

  return (
    <div className="flex items-center gap-3 py-3 px-4 bg-white rounded-2xl shadow-sm hover:shadow-card transition-shadow">
      {/* Category icon */}
      <div
        className="h-11 w-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ backgroundColor: meta.color + '22' }}
      >
        {meta.emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-semibold text-gray-900 truncate">{expense.description}</p>
          {expense.recurring && (
            <Badge color="purple">
              <RefreshCw size={10} />
              Recorrente
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded-md"
            style={{ color: meta.color, backgroundColor: meta.color + '22' }}
          >
            {meta.label}
          </span>
          <span className="text-xs text-gray-400">{formatDate(expense.date)}</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className="text-sm font-bold text-gray-900">
          {formatCurrency(expense.amount)}
        </span>
        <div className="flex items-center gap-1.5">
          {user && <Avatar name={user.name} size="sm" />}
          {onDelete && (
            <button
              onClick={() => onDelete(expense.id)}
              className="p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
