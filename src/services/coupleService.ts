import { apiGet, apiPost } from '@/lib/apiClient'
import type { CoupleResponse } from '@/types'

export async function getMyCouple(): Promise<CoupleResponse> {
  return apiGet<CoupleResponse>('/api/couples/mine')
}

export async function createCouple(): Promise<CoupleResponse> {
  return apiPost<CoupleResponse>('/api/couples')
}

export async function joinCouple(inviteCode: string): Promise<CoupleResponse> {
  return apiPost<CoupleResponse>('/api/couples/join', { inviteCode })
}
