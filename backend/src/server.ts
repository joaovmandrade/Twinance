import 'dotenv/config'
import app from './app'
import { supabase } from './services/supabase'

const PORT = process.env.PORT || 3001

async function start() {
  // Validate Supabase connection on startup
  const { error } = await supabase.from('profiles').select('count').limit(1)
  if (error) {
    console.error('❌ Supabase connection failed:', error.message)
    console.error('   Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env')
    process.exit(1)
  }

  app.listen(PORT, () => {
    console.log(`✅ Twinance backend running on http://localhost:${PORT}`)
    console.log(`   Accepting requests from: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
  })
}

start().catch((err) => {
  console.error('❌ Startup error:', err)
  process.exit(1)
})
