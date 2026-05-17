import { supabase } from './supabase'
import { API_URL } from '@/constants/config'

async function authHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Sessão expirada. Faça login novamente.')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  }
}

async function safeFetch(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init)
  } catch {
    throw new Error(
      `Não foi possível conectar ao servidor (${API_URL}). ` +
      'Verifique se o backend está rodando.',
    )
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T
  const text = await res.text()
  let json: unknown
  try { json = JSON.parse(text) } catch {
    throw new Error(`Resposta inválida do servidor (HTTP ${res.status})`)
  }
  if (!res.ok) {
    const msg = (json as { message?: string })?.message || `Erro ${res.status}`
    throw new Error(msg)
  }
  return json as T
}

export async function apiGet<T>(path: string): Promise<T> {
  const headers = await authHeaders()
  const res = await safeFetch(`${API_URL}${path}`, { headers })
  return handleResponse<T>(res)
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const headers = await authHeaders()
  const res = await safeFetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  return handleResponse<T>(res)
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const headers = await authHeaders()
  const res = await safeFetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  return handleResponse<T>(res)
}

export async function apiDelete(path: string): Promise<void> {
  const headers = await authHeaders()
  const res = await safeFetch(`${API_URL}${path}`, { method: 'DELETE', headers })
  return handleResponse<void>(res)
}
