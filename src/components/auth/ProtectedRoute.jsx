/**
 * ProtectedRoute.jsx (v2-fixed)
 *
 * PERUBAHAN v2:
 *   - Tidak lagi memanggil getProfile() setiap route change (location.pathname).
 *     Sebelumnya: dependency [location.pathname] → GET /auth/me di setiap navigasi.
 *     Sekarang: validasi sekali saat mount, lalu pakai UserContext.
 *   - Pakai UserContext untuk share user state ke seluruh app (tidak double-fetch).
 *   - Session expired event tetap dihandle.
 */

import { useEffect, useRef, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { authRepository } from '../../lib/repositories/authRepository'
import { useUser } from '../../lib/utils/UserContext'

const PUBLIC_AUTH_PATHS = ['/login', '/register', '/verify-otp']

export default function ProtectedRoute() {
  const location = useLocation()
  const { user, setUser } = useUser()
  const [checking, setChecking] = useState(!user) // skip check jika sudah ada user
  const [authError, setAuthError] = useState('')
  const validatedRef = useRef(false) // flag agar tidak re-validate setelah berhasil

  useEffect(() => {
    // Jika sudah tervalidasi sebelumnya (navigasi antar halaman), skip GET /auth/me
    if (validatedRef.current) return

    let mounted = true

    async function validateSession() {
      if (!authRepository.isAuthenticated()) {
        if (mounted) {
          setUser(null)
          setChecking(false)
          setAuthError('unauthenticated')
        }
        return
      }

      try {
        const profile = await authRepository.getProfile()
        if (mounted) {
          setUser(profile)
          validatedRef.current = true
          setChecking(false)
        }
      } catch (err) {
        await authRepository.logout()
        if (mounted) {
          setUser(null)
          setChecking(false)
          setAuthError(err.message || 'session_invalid')
        }
      }
    }

    validateSession()

    const handleSessionExpired = () => {
      setUser(null)
      setChecking(false)
      setAuthError('session_expired')
      validatedRef.current = false
    }

    window.addEventListener('smartfinance:session-expired', handleSessionExpired)
    return () => {
      mounted = false
      window.removeEventListener('smartfinance:session-expired', handleSessionExpired)
    }
  // Hanya jalankan saat mount — bukan saat setiap navigasi
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (checking) {
    return (
      <section className="page auth-check-page">
        <div className="panel auth-check-card">
          <p>Memeriksa sesi akun...</p>
        </div>
      </section>
    )
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, reason: authError }}
      />
    )
  }

  if (user.status === 'pending' && !PUBLIC_AUTH_PATHS.includes(location.pathname)) {
    return <Navigate to="/verify-otp" replace state={{ email: user.email }} />
  }

  const onboardingCompleted = user.onboarding_completed || user.onboardingCompleted

  if (!onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  if (onboardingCompleted && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
