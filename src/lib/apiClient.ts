import { supabase } from './supabase'
import { API_URL } from '@/constants/config'
import { logger } from '@/utils/logger'

// 30 s covers Render cold-start (free tier spins up in ~15–25 s)
const TIMEOUT_MS  = 30_000
const MAX_RETRIES = 2

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

// ── Timeout-aware fetch ───────────────────────────────────────────────────────

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timerId = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } catch (err: unknown) {
    if ((err as Error).name === 'AbortError') {
      throw new Error(
        'O servidor demorou para responder.\n' +
        'Se for o primeiro acesso, aguarde ~30 s e tente novamente.',
      )
    }
    throw new Error('Sem conexão. Verifique sua internet e tente novamente.')
  } finally {
    clearTimeout(timerId)
  }
}

// ── Auth headers with silent refresh fallback ─────────────────────────────────

async function authHeaders(): Promise<HeadersInit> {
  let { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    const { data } = await supabase.auth.refreshSession()
    session = data.session
  }

  if (!session) throw new Error('Sessão expirada. Faça login novamente.')

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  }
}

// ── Response parser ───────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response, method: string, path: string): Promise<T> {
  logger.res(method, path, res.status)

  if (res.status === 204) return undefined as T

  const text = await res.text()
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(`Resposta inválida do servidor (HTTP ${res.status})`)
  }

  if (!res.ok) {
    const msg = (json as { message?: string })?.message
    if (res.status === 401) throw new Error('Sessão expirada. Faça login novamente.')
    if (res.status >= 500) throw new Error('Erro no servidor. Tente novamente em instantes.')
    throw new Error(msg ?? `Erro ${res.status}`)
  }

  return json as T
}

// ── Fetch with retry (network errors only) ────────────────────────────────────

async function safeFetch(
  method: string,
  path: string,
  init: RequestInit,
  attempt = 0,
): Promise<Response> {
  const url = `${API_URL}${path}`
  logger.req(method, path)
  try {
    return await fetchWithTimeout(url, init)
  } catch (err) {
    const msg = (err as Error).message
    const retriable = msg.includes('internet') || msg.includes('responder')
    if (retriable && attempt < MAX_RETRIES) {
      const delay = 1500 * (attempt + 1)
      logger.warn(`Retry ${attempt + 1}/${MAX_RETRIES} (${path}) in ${delay}ms`)
      await sleep(delay)
      return safeFetch(method, path, init, attempt + 1)
    }
    throw err
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function apiGet<T>(path: string): Promise<T> {
  const headers = await authHeaders()
  const res = await safeFetch('GET', path, { headers })
  return handleResponse<T>(res, 'GET', path)
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const headers = await authHeaders()
  const res = await safeFetch('POST', path, {
    method: 'POST',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  return handleResponse<T>(res, 'POST', path)
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const headers = await authHeaders()
  const res = await safeFetch('PUT', path, {
    method: 'PUT',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  return handleResponse<T>(res, 'PUT', path)
}

export async function apiDelete(path: string): Promise<void> {
  const headers = await authHeaders()
  const res = await safeFetch('DELETE', path, { method: 'DELETE', headers })
  return handleResponse<void>(res, 'DELETE', path)
}
