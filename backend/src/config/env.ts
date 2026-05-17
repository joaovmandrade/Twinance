// Validates required env vars at startup — imported immediately after dotenv/config in server.ts

const REQUIRED = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'] as const

for (const key of REQUIRED) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

export const env = {
  PORT: Number(process.env.PORT) || 3001,
  NODE_ENV: (process.env.NODE_ENV ?? 'development') as 'development' | 'production' | 'test',
  SUPABASE_URL: process.env.SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  FRONTEND_URL: process.env.FRONTEND_URL ?? '*',
  get isDev() {
    return this.NODE_ENV !== 'production'
  },
} as const
