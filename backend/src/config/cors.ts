import type { CorsOptions } from 'cors'
import { env } from './env'

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Native mobile apps (iOS/Android) don't send an Origin header → allow
    if (!origin) return callback(null, true)

    // Expo Go dev client
    if (origin.startsWith('exp://') || origin.startsWith('exps://')) {
      return callback(null, true)
    }

    // All origins allowed in development
    if (env.isDev) return callback(null, true)

    // Production: match against comma-separated FRONTEND_URL list or wildcard
    const allowed = env.FRONTEND_URL.split(',').map((u) => u.trim())
    if (allowed.includes('*') || allowed.includes(origin)) {
      return callback(null, true)
    }

    callback(new Error(`Origin not allowed: ${origin}`))
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}
