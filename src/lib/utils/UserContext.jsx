/**
 * UserContext.jsx (BARU v2)
 *
 * Global state untuk data user yang sudah login.
 * Menyelesaikan masalah:
 *   - GET /auth/me dipanggil berulang di setiap halaman secara independen
 *   - Update profil di Profile tidak otomatis terlihat di halaman lain
 *
 * Cara pakai:
 *   // Wrap App di main.jsx sudah dilakukan
 *   const { user, setUser, refreshUser } = useUser()
 */

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { authRepository } from '../repositories/authRepository'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const refreshUser = useCallback(async () => {
    setLoading(true)
    try {
      const profile = await authRepository.getProfile()
      setUser(profile)
      return profile
    } catch {
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const value = useMemo(
    () => ({ user, setUser, refreshUser, loading }),
    [user, loading, refreshUser],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser harus digunakan di dalam <UserProvider>')
  return ctx
}
