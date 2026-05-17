import { QueryClient } from '@tanstack/react-query'

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false
  const msg = (error as Error)?.message ?? ''
  // Never retry auth or client errors
  if (msg.includes('expirada') || msg.includes('login') || msg.includes('Erro 4')) return false
  return true
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,   // 2 min — data considered fresh
      gcTime:    1000 * 60 * 10,  // 10 min — keep in cache after unmount
      retry: shouldRetry,
      retryDelay: (attempt) => Math.min(1500 * (attempt + 1), 8000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
