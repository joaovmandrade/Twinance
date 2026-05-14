import { Response } from 'express'
import { supabase } from '../services/supabase'
import { AuthRequest } from '../types'

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  // Fetch the auth user so we always have email + metadata as fallback
  const { data: authData } = await supabase.auth.admin.getUserById(req.userId)
  const authUser = authData?.user

  if (!authUser) {
    res.status(401).json({ message: 'Usuário não encontrado.' })
    return
  }

  // Upsert — handles the edge case where the trigger hasn't fired yet
  const { data: profile, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: req.userId,
        name: (authUser.user_metadata?.name as string) || '',
        email: authUser.email || '',
      },
      { onConflict: 'id', ignoreDuplicates: false },
    )
    .select('id, name, email, created_at')
    .single()

  if (error || !profile) {
    console.error('[getMe] upsert error:', error?.message)
    res.status(500).json({ message: 'Erro ao buscar perfil.' })
    return
  }

  res.json({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    createdAt: profile.created_at,
  })
}
