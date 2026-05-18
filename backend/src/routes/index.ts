import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth'
import { AuthRequest } from '../types'
import { env } from '../config/env'
import { getMe } from '../controllers/meController'
import coupleRoutes from './couples'
import expenseRoutes from './expenses'
import categoryRoutes from './categories'
import eventRoutes from './events'

const router = Router()

const API_VERSION = '1.0.0'

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: API_VERSION,
  })
})

router.get('/me', authMiddleware, (req, res) => getMe(req as AuthRequest, res))

router.use('/couples',    authMiddleware, coupleRoutes)
router.use('/expenses',   authMiddleware, expenseRoutes)
router.use('/categories', authMiddleware, categoryRoutes)
router.use('/events',     authMiddleware, eventRoutes)

export default router
