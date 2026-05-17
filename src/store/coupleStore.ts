import { create } from 'zustand'
import type { Couple, User } from '@/types'

interface CoupleStore {
  couple: Couple | null
  partner: User | null
  setCouple: (couple: Couple | null) => void
  setPartner: (partner: User | null) => void
  setCoupleData: (couple: Couple | null, partner: User | null) => void
  reset: () => void
}

export const useCoupleStore = create<CoupleStore>((set) => ({
  couple: null,
  partner: null,
  setCouple: (couple) => set({ couple }),
  setPartner: (partner) => set({ partner }),
  setCoupleData: (couple, partner) => set({ couple, partner }),
  reset: () => set({ couple: null, partner: null }),
}))
