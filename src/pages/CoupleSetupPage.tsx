import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Link as LinkIcon, Plus } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useCouple } from '../contexts/CoupleContext'
import { useAuth } from '../contexts/AuthContext'

export function CoupleSetupPage() {
  const { couple, createCouple, joinCouple } = useCouple()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [joinLoading, setJoinLoading] = useState(false)

  // Already in a couple → go to dashboard
  if (couple) {
    navigate('/dashboard')
    return null
  }

  async function handleCreate() {
    setCreateLoading(true)
    setError('')
    try {
      await createCouple()
      // couple state is now set in context; navigate away
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar casal.')
    } finally {
      setCreateLoading(false)
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteCode.trim()) {
      setError('Informe o código de convite.')
      return
    }
    setJoinLoading(true)
    setError('')
    try {
      await joinCouple(inviteCode.trim())
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código inválido.')
    } finally {
      setJoinLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-white to-violet-50 px-6 py-12">
      <div className="mb-10 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-600 shadow-lg mb-4">
          <Heart size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Configure seu casal</h1>
        <p className="mt-1 text-sm text-gray-500">
          Olá, {user?.name.split(' ')[0]}! Crie um casal ou entre com um convite.
        </p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-4">
        {/* Create couple */}
        <div className="bg-white rounded-3xl shadow-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-2xl bg-primary-100 flex items-center justify-center">
              <Plus size={20} className="text-primary-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Criar casal</h3>
              <p className="text-xs text-gray-500">Gere um código para convidar seu parceiro(a)</p>
            </div>
          </div>
          <Button fullWidth loading={createLoading} onClick={handleCreate}>
            Criar casal
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">ou</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Join couple */}
        <div className="bg-white rounded-3xl shadow-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-2xl bg-violet-100 flex items-center justify-center">
              <LinkIcon size={20} className="text-violet-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Entrar com convite</h3>
              <p className="text-xs text-gray-500">Use o código do seu parceiro(a)</p>
            </div>
          </div>

          <form onSubmit={handleJoin} className="flex flex-col gap-3">
            <Input
              placeholder="Ex: TWIN-AB3X"
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value.toUpperCase())
                setError('')
              }}
              className="text-center font-mono text-lg tracking-widest uppercase"
            />
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            <Button type="submit" fullWidth variant="secondary" loading={joinLoading}>
              Entrar no casal
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
