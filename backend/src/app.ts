import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import 'dotenv/config'
import routes from './routes'
import { errorHandler } from './middleware/errorHandler'

const app = express()

// ── CORS ─────────────────────────────────────────────────────
const origin = process.env.FRONTEND_URL || 'http://localhost:5173'
app.use(cors({
  origin,
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ── Body parser ───────────────────────────────────────────────
app.use(express.json())

// ── Request logger ────────────────────────────────────────────
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// ── Routes ────────────────────────────────────────────────────
app.use('/api', routes)

// ── Error handler ─────────────────────────────────────────────
app.use(errorHandler)

export default app
