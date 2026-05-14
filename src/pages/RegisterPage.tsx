import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User } from 'lucide-react'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    setLoading(true)
    try {
      await register({ name, email, password })
      navigate('/couple-setup')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-white to-violet-50 px-6 py-12">
      <div className="mb-10 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-600 shadow-lg mb-4">
          <span className="text-3xl">💜</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Twinance</h1>
        <p className="mt-1 text-sm text-gray-500">Finanças a dois, simples assim.</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-card p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Criar conta</h2>
        <p className="text-sm text-gray-500 mb-6">Comece a organizar suas finanças.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nome"
            type="text"
            placeholder="Seu nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User size={16} />}
            autoComplete="name"
            required
          />
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail size={16} />}
            autoComplete="email"
            required
          />
          <Input
            label="Senha"
            type="password"
            placeholder="Mín. 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock size={16} />}
            autoComplete="new-password"
            required
          />

          {error && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
            Criar conta
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Já tem conta?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
