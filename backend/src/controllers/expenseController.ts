import { Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../services/supabase'
import { AuthRequest } from '../types'

interface ExpenseRow {
  id: string
  user_id: string
  couple_id: string
  amount: number
  description: string
  is_recurring: boolean
  date: string
  created_at: string
  // Supabase returns joined FK rows as single object at runtime;
  // cast via unknown to bridge the generated array inference
  categories: { slug: string } | null
}

async function getUserCoupleId(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', userId)
    .single()
  return data?.couple_id ?? null
}

export async function getExpenses(req: AuthRequest, res: Response): Promise<void> {
  const coupleId = await getUserCoupleId(req.userId)
  if (!coupleId) {
    res.status(404).json({ message: 'No couple found' })
    return
  }

  const { data, error } = await supabase
    .from('expenses')
    .select('id, user_id, couple_id, amount, description, is_recurring, date, created_at, categories(slug)')
    .eq('couple_id', coupleId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    res.status(500).json({ message: error.message })
    return
  }

  const expenses = ((data ?? []) as unknown as ExpenseRow[]).map((e) => ({
    id: e.id,
    userId: e.user_id,
    coupleId: e.couple_id,
    amount: Number(e.amount),
    category: e.categories?.slug ?? 'other',
    description: e.description,
    recurring: e.is_recurring,
    date: e.date,
    createdAt: e.created_at,
  }))

  res.json(expenses)
}

export async function createExpense(req: AuthRequest, res: Response): Promise<void> {
  const coupleId = await getUserCoupleId(req.userId)
  if (!coupleId) {
    res.status(404).json({ message: 'No couple found. Join or create a couple first.' })
    return
  }

  const { amount, category, description, recurring, date } = req.body as {
    amount?: number
    category?: string
    description?: string
    recurring?: boolean
    date?: string
  }

  if (!amount || !category || !description || !date) {
    res.status(400).json({ message: 'amount, category, description, and date are required' })
    return
  }

  // Resolve category slug → id
  const { data: cat, error: catError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', category)
    .or(`user_id.is.null,user_id.eq.${req.userId}`)
    .order('user_id', { ascending: true }) // prefer system category first
    .limit(1)
    .single()

  if (catError || !cat) {
    res.status(400).json({ message: `Unknown category: ${category}` })
    return
  }

  const { data: expense, error } = await supabase
    .from('expenses')
    .insert({
      id: uuidv4(),
      user_id: req.userId,
      couple_id: coupleId,
      amount,
      category_id: cat.id,
      description,
      is_recurring: recurring ?? false,
      date,
    })
    .select('id, user_id, couple_id, amount, description, is_recurring, date, created_at, categories(slug)')
    .single()

  if (error || !expense) {
    res.status(500).json({ message: error?.message ?? 'Failed to create expense' })
    return
  }

  res.status(201).json({
    id: expense.id,
    userId: expense.user_id,
    coupleId: expense.couple_id,
    amount: Number(expense.amount),
    category: (expense as unknown as ExpenseRow).categories?.slug ?? 'other',
    description: expense.description,
    recurring: expense.is_recurring,
    date: expense.date,
    createdAt: expense.created_at,
  })
}

export async function deleteExpense(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params

  // Verify ownership
  const { data: expense } = await supabase
    .from('expenses')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!expense) {
    res.status(404).json({ message: 'Expense not found' })
    return
  }

  if (expense.user_id !== req.userId) {
    res.status(403).json({ message: 'You can only delete your own expenses' })
    return
  }

  const { error } = await supabase.from('expenses').delete().eq('id', id)

  if (error) {
    res.status(500).json({ message: error.message })
    return
  }

  res.status(204).send()
}

export async function updateExpense(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params

  const { data: existing } = await supabase
    .from('expenses')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!existing) {
    res.status(404).json({ message: 'Expense not found' })
    return
  }

  if (existing.user_id !== req.userId) {
    res.status(403).json({ message: 'You can only edit your own expenses' })
    return
  }

  const { amount, category, description, recurring, date } = req.body as {
    amount?: number
    category?: string
    description?: string
    recurring?: boolean
    date?: string
  }

  const updates: Record<string, unknown> = {}
  if (amount !== undefined) updates.amount = amount
  if (description !== undefined) updates.description = description
  if (recurring !== undefined) updates.is_recurring = recurring
  if (date !== undefined) updates.date = date

  if (category) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .or(`user_id.is.null,user_id.eq.${req.userId}`)
      .limit(1)
      .single()
    if (cat) updates.category_id = cat.id
  }

  const { data: updated, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .select('id, user_id, couple_id, amount, description, is_recurring, date, created_at, categories(slug)')
    .single()

  if (error || !updated) {
    res.status(500).json({ message: error?.message ?? 'Failed to update' })
    return
  }

  res.json({
    id: updated.id,
    userId: updated.user_id,
    coupleId: updated.couple_id,
    amount: Number(updated.amount),
    category: (updated as unknown as ExpenseRow).categories?.slug ?? 'other',
    description: updated.description,
    recurring: updated.is_recurring,
    date: updated.date,
    createdAt: updated.created_at,
  })
}
