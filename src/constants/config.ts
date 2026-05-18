export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://twinance.onrender.com'

export const SUPABASE_URL      = process.env.EXPO_PUBLIC_SUPABASE_URL      ?? ''
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const QUERY_KEYS = {
  expenses:   ['expenses']          as const,
  couple:     ['couple']            as const,
  me:         ['me']                as const,
  events:     ['events']            as const,
  monthEvents: (year: number, month: number) => ['events', 'month', year, month] as const,
} as const
