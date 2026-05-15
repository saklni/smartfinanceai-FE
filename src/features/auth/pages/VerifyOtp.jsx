import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShieldCheck, WalletCards } from 'lucide-react'
import { env } from '../../../config/env'
import { authRepository } from '../../../lib/repositories/authRepository'

const RESEND_COOLDOWN = 45

export default function VerifyOtp() {
  const navigate = useNavigate()
  const location = useLocation()
  const initialEmail = location.state?.email || ''

  const [email, setEmail] = useState(initialEmail)
  const [otpCode, setOtpCode] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(initialEmail ? RESEND_COOLDOWN : 0)

  const otpLength = env.otpLength || 6
  const canSubmit = useMemo(
    () => email.trim() && otpCode.length === otpLength && !loading,
    [email, loading, otpCode, otpLength],
  )

  useEffect(() => {
    if (!cooldown) return undefined
    const timer = setInterval(() => setCooldown((c) => Math.max(c - 1, 0)), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  async function submit(event) {
    event.preventDefault()
    setError('')
    setStatus('')

    if (!email.trim()) { setError('Email wajib diisi.'); return }
    if (otpCode.length !== otpLength) { setError(`Kode OTP harus ${otpLength} digit.`); return }

    setLoading(true)
    try {
      const user = await authRepository.verifyOtp({
        email: email.trim().toLowerCase(),
        otp_code: otpCode,
        purpose: 'register',
      })

      if (!user.onboarding_completed && !user.onboardingCompleted) {
        navigate('/onboarding')
        return
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Verifikasi OTP gagal')
    } finally {
      setLoading(false)
    }
  }

  async function resendOtp() {
    setError('')
    setStatus('')
    if (!email.trim()) { setError('Isi email terlebih dahulu.'); return }
    try {
      await authRepository.resendOtp({ email: email.trim().toLowerCase(), purpose: 'register' })
      setStatus('OTP baru sudah dikirim ke email kamu.')
      setCooldown(RESEND_COOLDOWN)
    } catch (err) {
      setError(err.message || 'Gagal mengirim ulang OTP')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand center">
          <div className="brand-mark"><WalletCards size={24} /></div>
          <b>SmartFinance <span>AI</span></b>
        </div>

        <div className="auth-icon"><ShieldCheck size={28} /></div>
        <h1>Verifikasi Email</h1>
        <p>Masukkan kode OTP {otpLength} digit yang dikirim ke email kamu untuk mengaktifkan akun.</p>

        {!initialEmail && (
          <p className="helper-text">Buka halaman ini dari proses register, atau isi email yang kamu daftarkan.</p>
        )}

        {error && <div className="form-alert error">{error}</div>}
        {status && <div className="form-alert success">{status}</div>}

        <form onSubmit={submit}>
          <label>
            Email
            <input
              required
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Kode OTP
            <input
              required
              inputMode="numeric"
              maxLength={otpLength}
              placeholder="123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, otpLength))}
            />
          </label>
          <button className="btn full" disabled={!canSubmit}>
            {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
          </button>
        </form>

        <button className="link-button" type="button" onClick={resendOtp} disabled={cooldown > 0}>
          {cooldown > 0 ? `Kirim ulang dalam ${cooldown}s` : 'Kirim ulang OTP'}
        </button>
        <span className="switch">Salah email? <Link to="/register">Daftar ulang</Link></span>
      </div>
    </div>
  )
}
