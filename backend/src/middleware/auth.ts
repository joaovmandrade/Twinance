import { Response, NextFunction } from 'express'
import { supabase } from '../services/supabase'
import { AuthRequest } from '../types'

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing authorization header' })
    return
  }
  const token = header.slice(7)
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    res.status(401).json({ message: 'Invalid or expired token' })
    return
  }
  req.userId = data.user.id
  next()
}
