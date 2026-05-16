import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './features/landing/pages/Landing'
import Auth from './features/auth/pages/Auth'
import VerifyOtp from './features/auth/pages/VerifyOtp'
import ForgotPassword from './features/auth/pages/ForgotPassword'
import Onboarding from './features/onboarding/pages/Onboarding'
import Dashboard from './features/dashboard/pages/Dashboard'
import Transactions from './features/transactions/pages/Transactions'
import Recommendations from './features/recommendations/pages/Recommendations'
import Profile from './features/profile/pages/Profile'
import DashboardLayout from './layouts/dashboard/DashboardLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('sf-theme') || 'light')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('sf-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))

  return (
    <Routes>
      <Route path="/" element={<Landing theme={theme} onToggleTheme={toggleTheme} />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<DashboardLayout theme={theme} onToggleTheme={toggleTheme} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
