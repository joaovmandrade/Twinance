export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001'
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const QUERY_KEYS = {
  expenses: ['expenses'] as const,
  couple:   ['couple']   as const,
  me:       ['me']       as const,
} as const
