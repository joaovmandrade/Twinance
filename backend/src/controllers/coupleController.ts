import { Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../services/supabase'
import { AuthRequest } from '../types'

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'TWIN-'
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

async function getPartnerProfile(coupleId: string, currentUserId: string) {
  const { data: members } = await supabase
    .from('couple_members')
    .select('user_id')
    .eq('couple_id', coupleId)
    .neq('user_id', currentUserId)

  if (!members?.length) return null

  const partnerId = members[0].user_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, email, created_at')
    .eq('id', partnerId)
    .single()

  if (!profile) return null
  return { id: profile.id, name: profile.name, email: profile.email, createdAt: profile.created_at }
}

export async function getMyCouple(req: AuthRequest, res: Response): Promise<void> {
  const { data: membership } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', req.userId)
    .single()

  if (!membership) {
    res.status(404).json({ message: 'No couple found' })
    return
  }

  const { data: couple, error } = await supabase
    .from('couples')
    .select('id, invite_code, created_at')
    .eq('id', membership.couple_id)
    .single()

  if (error || !couple) {
    res.status(404).json({ message: 'Couple not found' })
    return
  }

  const partner = await getPartnerProfile(couple.id, req.userId)

  res.json({
    couple: { id: couple.id, inviteCode: couple.invite_code, createdAt: couple.created_at },
    partner,
  })
}

export async function createCouple(req: AuthRequest, res: Response): Promise<void> {
  // Ensure user doesn't already have a couple
  const { data: existing } = await supabase
    .from('couple_members')
    .select('id')
    .eq('user_id', req.userId)
    .single()

  if (existing) {
    res.status(409).json({ message: 'You already belong to a couple.' })
    return
  }

  let inviteCode = generateInviteCode()
  // Ensure uniqueness
  let attempts = 0
  while (attempts < 5) {
    const { data: clash } = await supabase
      .from('couples')
      .select('id')
      .eq('invite_code', inviteCode)
      .single()
    if (!clash) break
    inviteCode = generateInviteCode()
    attempts++
  }

  const { data: couple, error: coupleError } = await supabase
    .from('couples')
    .insert({ id: uuidv4(), invite_code: inviteCode })
    .select()
    .single()

  if (coupleError || !couple) {
    res.status(500).json({ message: 'Failed to create couple' })
    return
  }

  await supabase
    .from('couple_members')
    .insert({ id: uuidv4(), user_id: req.userId, couple_id: couple.id })

  res.status(201).json({
    couple: { id: couple.id, inviteCode: couple.invite_code, createdAt: couple.created_at },
    partner: null,
  })
}

export async function joinCouple(req: AuthRequest, res: Response): Promise<void> {
  const { inviteCode } = req.body as { inviteCode?: string }
  if (!inviteCode?.trim()) {
    res.status(400).json({ message: 'inviteCode is required' })
    return
  }

  // Check user doesn't already have a couple
  const { data: existing } = await supabase
    .from('couple_members')
    .select('id')
    .eq('user_id', req.userId)
    .single()

  if (existing) {
    res.status(409).json({ message: 'You already belong to a couple.' })
    return
  }

  const { data: couple, error: findError } = await supabase
    .from('couples')
    .select('id, invite_code, created_at')
    .eq('invite_code', inviteCode.trim().toUpperCase())
    .single()

  if (findError || !couple) {
    res.status(404).json({ message: 'Invalid invite code.' })
    return
  }

  // Check couple doesn't already have 2 members
  const { data: members } = await supabase
    .from('couple_members')
    .select('user_id')
    .eq('couple_id', couple.id)

  if ((members?.length ?? 0) >= 2) {
    res.status(409).json({ message: 'This couple is already full.' })
    return
  }

  // Prevent joining your own couple
  const alreadyMember = members?.some((m) => m.user_id === req.userId)
  if (alreadyMember) {
    res.status(409).json({ message: 'You are already in this couple.' })
    return
  }

  await supabase
    .from('couple_members')
    .insert({ id: uuidv4(), user_id: req.userId, couple_id: couple.id })

  const partner = await getPartnerProfile(couple.id, req.userId)

  res.json({
    couple: { id: couple.id, inviteCode: couple.invite_code, createdAt: couple.created_at },
    partner,
  })
}
