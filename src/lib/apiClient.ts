import { supabase } from './supabase'

const BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001'

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
    // fetch() itself threw — server unreachable or CORS hard-block
    throw new Error(
      `Não foi possível conectar ao servidor (${BASE}). ` +
      'Verifique se o backend está rodando com "npm run dev:backend".',
    )
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T
  const text = await res.text()
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
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
  const res = await safeFetch(`${BASE}${path}`, { headers })
  return handleResponse<T>(res)
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const headers = await authHeaders()
  const res = await safeFetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  return handleResponse<T>(res)
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const headers = await authHeaders()
  const res = await safeFetch(`${BASE}${path}`, {
    method: 'PUT',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  return handleResponse<T>(res)
}

export async function apiDelete(path: string): Promise<void> {
  const headers = await authHeaders()
  const res = await safeFetch(`${BASE}${path}`, { method: 'DELETE', headers })
  return handleResponse<void>(res)
}
