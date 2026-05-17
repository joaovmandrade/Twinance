import 'dotenv/config'
import { env } from './config/env'
import app from './app'
import { supabase } from './services/supabase'

process.on('uncaughtException', (err) => {
  console.error('[fatal] Uncaught exception:', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error('[fatal] Unhandled rejection:', reason)
  process.exit(1)
})

async function start() {
  console.log(`[startup] Validating Supabase connection...`)

  const { error } = await supabase.from('profiles').select('count').limit(1)
  if (error) {
    console.error('[startup] Supabase connection failed:', error.message)
    console.error('[startup] Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env')
    process.exit(1)
  }

  console.log('[startup] Supabase OK.')

  app.listen(env.PORT, () => {
    console.log(`[startup] Twinance API running — port ${env.PORT} — ${env.NODE_ENV}`)
    console.log(`[startup] CORS origin: ${env.FRONTEND_URL}`)
  })
}

start().catch((err) => {
  console.error('[startup] Fatal error:', err)
  process.exit(1)
})
