import { Router } from 'express'
import { AuthRequest } from '../types'
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController'

const router = Router()

router.get('/', (req, res) => getExpenses(req as AuthRequest, res))
router.post('/', (req, res) => createExpense(req as AuthRequest, res))
router.put('/:id', (req, res) => updateExpense(req as unknown as AuthRequest, res))
router.delete('/:id', (req, res) => deleteExpense(req as unknown as AuthRequest, res))

export default router
