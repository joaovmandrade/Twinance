import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as coupleService from '../services/coupleService'
import { useAuth } from './AuthContext'
import type { Couple, User } from '../types'

interface CoupleContextValue {
  couple: Couple | null
  partner: User | null
  isLoading: boolean
  createCouple: () => Promise<void>
  joinCouple: (code: string) => Promise<void>
  refetch: () => void
}

const CoupleContext = createContext<CoupleContextValue | null>(null)

export function CoupleProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [couple, setCouple] = useState<Couple | null>(null)
  const [partner, setPartner] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const load = useCallback(async () => {
    if (!isAuthenticated) return
    setIsLoading(true)
    try {
      const { couple: c, partner: p } = await coupleService.getMyCouple()
      setCouple(c)
      setPartner(p)
    } catch {
      // 404 = user has no couple yet; that's normal
      setCouple(null)
      setPartner(null)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!authLoading) load()
  }, [authLoading, load])

  async function createCouple() {
    const { couple: c, partner: p } = await coupleService.createCouple()
    setCouple(c)
    setPartner(p)
  }

  async function joinCouple(code: string) {
    const { couple: c, partner: p } = await coupleService.joinCouple(code)
    setCouple(c)
    setPartner(p)
  }

  return (
    <CoupleContext.Provider value={{ couple, partner, isLoading, createCouple, joinCouple, refetch: load }}>
      {children}
    </CoupleContext.Provider>
  )
}

export function useCouple() {
  const ctx = useContext(CoupleContext)
  if (!ctx) throw new Error('useCouple must be used within CoupleProvider')
  return ctx
}
