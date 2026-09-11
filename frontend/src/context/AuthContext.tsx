import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, tokenStorage } from '../lib/api'
import type { Profile } from '../types/api'

interface AuthContextValue {
  user: Profile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (input: { name: string; email: string; phone?: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!tokenStorage.get()) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      setUser(await api.auth.me())
    } catch {
      // An expired token is not an error worth showing: just sign the visitor out.
      tokenStorage.clear()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(async (email: string, password: string) => {
    const { token } = await api.auth.login({ email, password })
    tokenStorage.set(token)
    setUser(await api.auth.me())
  }, [])

  const register = useCallback(
    async (input: { name: string; email: string; phone?: string; password: string }) => {
      const { token } = await api.auth.register(input)
      tokenStorage.set(token)
      setUser(await api.auth.me())
    },
    [],
  )

  const logout = useCallback(async () => {
    try {
      await api.auth.logout()
    } finally {
      tokenStorage.clear()
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) throw new Error('useAuth precisa estar dentro de AuthProvider.')

  return context
}
