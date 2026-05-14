import React, { useState } from 'react'
import { LogOut, Heart, Copy, Check, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCouple } from '../contexts/CoupleContext'
import { useExpenses } from '../contexts/ExpenseContext'
import { Avatar } from '../components/ui/Avatar'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { formatCurrency } from '../utils/format'
import { getTotalByUser } from '../services/expenseService'

export function ProfilePage() {
  const { user, logout } = useAuth()
  const { couple, partner } = useCouple()
  const { expenses } = useExpenses()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)

  const myTotal = user ? getTotalByUser(expenses, user.id) : 0
  const myExpenses = user ? expenses.filter((e) => e.userId === user.id).length : 0

  function copyCode() {
    if (!couple) return
    navigator.clipboard.writeText(couple.inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleLogout() {
    setLogoutLoading(true)
    await logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <div className="pt-6 pb-4 flex flex-col gap-5">
      <h1 className="text-2xl font-extrabold text-gray-900">Perfil</h1>

      {/* User card */}
      <Card padding="lg">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} size="xl" />
          <div>
            <p className="text-lg font-bold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="text-xs text-gray-500">Meus gastos</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(myTotal)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Transações</p>
            <p className="text-lg font-bold text-gray-900">{myExpenses}</p>
          </div>
        </div>
      </Card>

      {/* Couple info */}
      {couple ? (
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-2xl bg-pink-100 flex items-center justify-center">
              <Heart size={18} className="text-pink-500" />
            </div>
            <h3 className="font-bold text-gray-900">Seu casal</h3>
          </div>

          {partner && (
            <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl bg-gray-50">
              <Avatar name={partner.name} size="md" color="bg-violet-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900">{partner.name}</p>
                <p className="text-xs text-gray-500">{partner.email}</p>
              </div>
            </div>
          )}

          {!partner && (
            <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-100">
              <p className="text-xs text-amber-700 font-medium">Nenhum parceiro(a) conectado ainda.</p>
              <p className="text-xs text-amber-600 mt-0.5">Compartilhe o código abaixo para conectar.</p>
            </div>
          )}

          <div className="flex items-center justify-between p-3 rounded-2xl bg-primary-50 border border-primary-100">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Código de convite</p>
              <p className="font-mono font-bold text-primary-700 tracking-widest text-base">
                {couple.inviteCode}
              </p>
            </div>
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-800 transition-colors"
            >
              {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
            </button>
          </div>
        </Card>
      ) : (
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Heart size={18} className="text-gray-400" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Sem casal</p>
              <p className="text-xs text-gray-500">Você ainda não está em um casal.</p>
            </div>
          </div>
          <Button variant="secondary" fullWidth onClick={() => navigate('/couple-setup')}>
            Criar ou entrar em um casal
          </Button>
        </Card>
      )}

      {/* Settings */}
      <Card padding="none">
        {[
          { label: 'Notificações', desc: 'Alertas de gastos' },
          { label: 'Orçamento mensal', desc: 'Defina um limite' },
          { label: 'Exportar dados', desc: 'Baixar relatório CSV' },
        ].map((item, i, arr) => (
          <button
            key={item.label}
            className={[
              'w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left',
              i < arr.length - 1 ? 'border-b border-gray-100' : '',
              i === 0 ? 'rounded-t-3xl' : '',
              i === arr.length - 1 ? 'rounded-b-3xl' : '',
            ].join(' ')}
          >
            <div>
              <p className="text-sm font-semibold text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        ))}
      </Card>

      <Button variant="danger" fullWidth size="lg" loading={logoutLoading} onClick={handleLogout} className="mt-2">
        <LogOut size={18} />
        Sair da conta
      </Button>

      <p className="text-center text-xs text-gray-300 pb-2">Twinance v0.1.0</p>
    </div>
  )
}
