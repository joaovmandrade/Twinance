import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import * as authService from '../services/authService'
import type { User, LoginPayload, RegisterPayload } from '../types'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const initialized = useRef(false)

  useEffect(() => {
    // Restore session on mount
    authService.getSessionUser().then((u) => {
      setUser(u)
      setIsLoading(false)
      initialized.current = true
    })

    // Sync with Supabase auth state changes (sign-in / sign-out from other tabs, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!initialized.current) return // Let the initial getSessionUser() handle first load

      if (!session) {
        setUser(null)
        return
      }

      // Session exists — fetch full profile from backend
      const u = await authService.getSessionUser()
      setUser(u)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function login(payload: LoginPayload) {
    const u = await authService.login(payload)
    setUser(u)
  }

  async function register(payload: RegisterPayload) {
    const u = await authService.register(payload)
    setUser(u)
  }

  async function logout() {
    await authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
