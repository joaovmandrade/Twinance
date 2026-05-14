import React, { useMemo } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { TrendingUp, Award, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCouple } from '../contexts/CoupleContext'
import { useExpenses } from '../contexts/ExpenseContext'
import { categoryMeta } from '../utils/categoryMeta'
import { formatCurrency } from '../utils/format'
import { Card } from '../components/ui/Card'
import { Avatar } from '../components/ui/Avatar'
import { Spinner } from '../components/ui/Spinner'
import { ExpenseCard } from '../components/expenses/ExpenseCard'
import { getTotalByUser, getTotalByCategory } from '../services/expenseService'
import type { User } from '../types'

const PARTNER_COLOR = '#a78bfa'
const USER_COLOR = '#7c3aed'

export function DashboardPage() {
  const { user } = useAuth()
  const { partner } = useCouple()
  const { expenses, isLoading } = useExpenses()
  const navigate = useNavigate()

  const userTotal = useMemo(
    () => (user ? getTotalByUser(expenses, user.id) : 0),
    [expenses, user],
  )
  const partnerTotal = useMemo(
    () => (partner ? getTotalByUser(expenses, partner.id) : 0),
    [expenses, partner],
  )
  const grandTotal = userTotal + partnerTotal

  const categoryData = useMemo(() => {
    const totals = getTotalByCategory(expenses)
    return Object.entries(totals)
      .map(([cat, value]) => ({
        name: categoryMeta[cat as keyof typeof categoryMeta]?.label ?? cat,
        value,
        color: categoryMeta[cat as keyof typeof categoryMeta]?.color ?? '#94a3b8',
        emoji: categoryMeta[cat as keyof typeof categoryMeta]?.emoji ?? '📦',
      }))
      .sort((a, b) => b.value - a.value)
  }, [expenses])

  const barData = [
    { name: user?.name.split(' ')[0] ?? 'Você', total: userTotal, fill: USER_COLOR },
    { name: partner?.name.split(' ')[0] ?? 'Parceiro(a)', total: partnerTotal, fill: PARTNER_COLOR },
  ]

  const topSpender: User | null =
    userTotal >= partnerTotal ? (user ?? null) : (partner ?? null)
  const topAmount = topSpender?.id === user?.id ? userTotal : partnerTotal

  function getUserById(id: string): User | null {
    if (id === user?.id) return user
    if (id === partner?.id) return partner
    return null
  }

  const recentExpenses = expenses.slice(0, 5)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="pt-6 pb-4 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Olá,</p>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {user?.name.split(' ')[0]} 👋
          </h1>
        </div>
        {user && <Avatar name={user.name} size="lg" />}
      </div>

      {/* Total card */}
      <div className="rounded-3xl bg-gradient-to-br from-primary-600 to-violet-700 p-6 text-white shadow-lg">
        <p className="text-sm font-medium text-primary-200 mb-1">Total do casal este mês</p>
        <p className="text-4xl font-black tracking-tight">{formatCurrency(grandTotal)}</p>
        <div className="mt-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-primary-300" />
          <span className="text-sm text-primary-200">
            Mês atual · {expenses.length} transações
          </span>
        </div>
        {grandTotal > 0 && (
          <>
            <div className="mt-4 flex gap-1 h-2 rounded-full overflow-hidden">
              <div
                className="bg-white/90 rounded-full transition-all"
                style={{ width: `${(userTotal / grandTotal) * 100}%` }}
              />
              <div
                className="bg-white/40 rounded-full transition-all"
                style={{ width: `${(partnerTotal / grandTotal) * 100}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-xs text-primary-200">
              <span>{user?.name.split(' ')[0]}: {formatCurrency(userTotal)}</span>
              <span>{partner?.name.split(' ')[0] ?? 'Parceiro(a)'}: {formatCurrency(partnerTotal)}</span>
            </div>
          </>
        )}
      </div>

      {/* Who spent more */}
      {topSpender && grandTotal > 0 && (
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-100 flex items-center justify-center">
              <Award size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Quem gastou mais</p>
              <p className="text-sm font-bold text-gray-900">
                {topSpender.name.split(' ')[0]}{' '}
                <span className="font-normal text-gray-500">— {formatCurrency(topAmount)}</span>
              </p>
            </div>
            <Avatar name={topSpender.name} size="md" className="ml-auto" />
          </div>
        </Card>
      )}

      {/* Bar chart */}
      <Card padding="lg">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Comparação de gastos</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={barData} barCategoryGap="40%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Total']}
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }}
            />
            <Bar dataKey="total" radius={[8, 8, 0, 0]}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Donut chart */}
      <Card padding="lg">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Gastos por categoria</h3>
        {categoryData.length > 0 ? (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={3} dataKey="value">
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 flex flex-col gap-1.5 min-w-0">
              {categoryData.slice(0, 5).map((cat) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-gray-600 truncate flex-1">{cat.emoji} {cat.name}</span>
                  <span className="text-xs font-semibold text-gray-800">{formatCurrency(cat.value)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">Nenhum gasto ainda.</p>
        )}
      </Card>

      {/* Recent expenses */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">Últimos gastos</h3>
          <button onClick={() => navigate('/expenses')} className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:underline">
            Ver todos <ArrowRight size={13} />
          </button>
        </div>
        {recentExpenses.length > 0 ? (
          <div className="flex flex-col gap-2">
            {recentExpenses.map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} user={getUserById(expense.userId)} />
            ))}
          </div>
        ) : (
          <Card padding="md">
            <p className="text-sm text-gray-400 text-center">Adicione seu primeiro gasto com o botão +</p>
          </Card>
        )}
      </div>
    </div>
  )
}
