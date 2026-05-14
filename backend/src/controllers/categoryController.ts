import { Response } from 'express'
import { supabase } from '../services/supabase'
import { AuthRequest } from '../types'

export async function getCategories(req: AuthRequest, res: Response): Promise<void> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, name, user_id')
    .or(`user_id.is.null,user_id.eq.${req.userId}`)
    .order('user_id', { ascending: true }) // system categories first
    .order('name')

  if (error) {
    res.status(500).json({ message: error.message })
    return
  }

  res.json(data ?? [])
}
