import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { authRepository } from '../../lib/repositories/authRepository'

const PUBLIC_AUTH_PATHS = ['/login', '/register', '/verify-otp']

export default function ProtectedRoute() {
  const location = useLocation()
  const [state, setState] = useState({ loading: true, user: null, error: '' })

  useEffect(() => {
    let mounted = true

    async function validateSession() {
      if (!authRepository.isAuthenticated()) {
        if (mounted) setState({ loading: false, user: null, error: 'unauthenticated' })
        return
      }

      try {
        const user = await authRepository.getProfile()
        if (mounted) setState({ loading: false, user, error: '' })
      } catch (err) {
        await authRepository.logout()
        if (mounted) setState({ loading: false, user: null, error: err.message || 'session_invalid' })
      }
    }

    validateSession()

    const handleSessionExpired = () => {
      setState({ loading: false, user: null, error: 'session_expired' })
    }

    window.addEventListener('smartfinance:session-expired', handleSessionExpired)

    return () => {
      mounted = false
      window.removeEventListener('smartfinance:session-expired', handleSessionExpired)
    }
  }, [location.pathname])

  if (state.loading) {
    return (
      <section className="page auth-check-page">
        <div className="panel auth-check-card">
          <p>Memeriksa sesi akun...</p>
        </div>
      </section>
    )
  }

  if (!state.user) {
    return <Navigate to="/login" replace state={{ from: location.pathname, reason: state.error }} />
  }

  if (state.user.status === 'pending' && !PUBLIC_AUTH_PATHS.includes(location.pathname)) {
    return <Navigate to="/verify-otp" replace state={{ email: state.user.email }} />
  }

  const onboardingCompleted = state.user.onboarding_completed || state.user.onboardingCompleted

  if (!onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  if (onboardingCompleted && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
