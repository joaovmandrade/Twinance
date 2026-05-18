import { Router } from 'express'
import { AuthRequest } from '../types'
import {
  getEvents,
  getMonthEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController'

const router = Router()

router.get('/',       (req, res) => getEvents(req as AuthRequest, res))
router.get('/month',  (req, res) => getMonthEvents(req as AuthRequest, res))
router.post('/',      (req, res) => createEvent(req as AuthRequest, res))
router.put('/:id',    (req, res) => updateEvent(req as unknown as AuthRequest, res))
router.delete('/:id', (req, res) => deleteEvent(req as unknown as AuthRequest, res))

export default router
