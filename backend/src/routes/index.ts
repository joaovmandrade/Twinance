import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth'
import { AuthRequest } from '../types'
import { getMe } from '../controllers/meController'
import coupleRoutes from './couples'
import expenseRoutes from './expenses'
import categoryRoutes from './categories'

const router = Router()

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' })
})

router.get('/me', authMiddleware as any, (req, res) => getMe(req as AuthRequest, res))

router.use('/couples', authMiddleware as any, coupleRoutes)
router.use('/expenses', authMiddleware as any, expenseRoutes)
router.use('/categories', authMiddleware as any, categoryRoutes)

export default router
