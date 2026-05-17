import { supabase } from '@/lib/supabase'
import { apiGet } from '@/lib/apiClient'
import type { User, LoginPayload, RegisterPayload } from '@/types'

export async function login(payload: LoginPayload): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  })
  if (error) throw new Error(translateError(error.message))
  if (!data.session) throw new Error('Não foi possível iniciar a sessão.')
  return fetchMe()
}

export async function register(payload: RegisterPayload): Promise<User> {
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: { data: { name: payload.name.trim() } },
  })
  if (error) throw new Error(translateError(error.message))
  if (!data.user) throw new Error('Cadastro não foi concluído.')
  return {
    id: data.user.id,
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    createdAt: data.user.created_at,
  }
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut()
}

export async function fetchMe(): Promise<User> {
  return apiGet<User>('/api/me')
}

export async function getSessionUser(): Promise<User | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  try {
    return await fetchMe()
  } catch (err) {
    const u = session.user
    return {
      id: u.id,
      name: (u.user_metadata?.name as string) || u.email || 'Usuário',
      email: u.email || '',
      createdAt: u.created_at,
    }
  }
}

function translateError(msg: string): string {
  const map: Record<string, string> = {
    'Invalid login credentials':               'E-mail ou senha inválidos.',
    'Email not confirmed':                      'Confirme seu e-mail antes de entrar.',
    'User already registered':                  'Este e-mail já está em uso.',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
    'signup is disabled':                       'Cadastro desabilitado no momento.',
    'invalid email':                            'E-mail inválido.',
    'Email rate limit exceeded':                'Muitas tentativas. Aguarde alguns minutos.',
  }
  for (const [key, value] of Object.entries(map)) {
    if (msg.toLowerCase().includes(key.toLowerCase())) return value
  }
  return msg
}
