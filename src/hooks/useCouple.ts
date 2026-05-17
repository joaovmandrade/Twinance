import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/config'
import { createCouple, joinCouple } from '@/services/coupleService'
import { useCoupleStore } from '@/store/coupleStore'

export function useCreateCouple() {
  const setCoupleData = useCoupleStore((s) => s.setCoupleData)
  return useMutation({
    mutationFn: createCouple,
    onSuccess: ({ couple, partner }) => setCoupleData(couple, partner),
  })
}

export function useJoinCouple() {
  const setCoupleData = useCoupleStore((s) => s.setCoupleData)
  return useMutation({
    mutationFn: (inviteCode: string) => joinCouple(inviteCode),
    onSuccess: ({ couple, partner }) => setCoupleData(couple, partner),
  })
}
