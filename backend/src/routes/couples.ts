import { Router } from 'express'
import { AuthRequest } from '../types'
import { getMyCouple, createCouple, joinCouple } from '../controllers/coupleController'

const router = Router()

router.get('/mine', (req, res) => getMyCouple(req as AuthRequest, res))
router.post('/', (req, res) => createCouple(req as AuthRequest, res))
router.post('/join', (req, res) => joinCouple(req as AuthRequest, res))

export default router
