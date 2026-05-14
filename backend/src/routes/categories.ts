import { Router } from 'express'
import { AuthRequest } from '../types'
import { getCategories } from '../controllers/categoryController'

const router = Router()

router.get('/', (req, res) => getCategories(req as AuthRequest, res))

export default router
