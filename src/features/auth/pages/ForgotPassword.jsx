import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, KeyRound, Loader2, Wallet } from 'lucide-react'
import { env } from '../../../config/env'
import * as authApi from '../../../lib/api/authApi'

const RESEND_COOLDOWN = 45
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [cooldown, setCooldown] = useState(0)

  const otpLength = env.otpLength || 6

  
  useEffect(() => {
    if (!cooldown) return undefined
    const t = setInterval(() => setCooldown((c) => Math.max(c - 1, 0)), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  
  async function handleRequestOtp(e) {
    e.preventDefault()
    setError('')
    setInfo('')

    if (!emailRegex.test(email)) {
      setError('Format email tidak valid.')
      return
    }

    setLoading(true)
    try {
      await authApi.forgotPassword({ email: email.trim().toLowerCase() })
      setInfo('Kode OTP telah dikirim ke email kamu. Cek inbox atau folder spam.')
      setCooldown(RESEND_COOLDOWN)
      setStep(2)
    } catch (err) {
      setError(err.message || 'Gagal mengirim OTP. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  
  async function handleResendOtp() {
    setError('')
    setInfo('')
    try {
      await authApi.forgotPassword({ email: email.trim().toLowerCase() })
      setInfo('OTP baru telah dikirim.')
      setCooldown(RESEND_COOLDOWN)
    } catch (err) {
      setError(err.message || 'Gagal mengirim ulang OTP.')
    }
  }

  
  async function handleVerifyOtp(e) {
    e.preventDefault()
    setError('')
    setInfo('')

    if (otp.length !== otpLength) {
      setError(`Kode OTP harus ${otpLength} digit.`)
      return
    }

    setLoading(true)
    try {
      const result = await authApi.verifyResetOtp({
        email: email.trim().toLowerCase(),
        otp_code: otp,
      })
      setResetToken(result.reset_token)
      setInfo('OTP valid. Sekarang buat password baru.')
      setStep(3)
    } catch (err) {
      setError(err.message || 'OTP tidak valid.')
    } finally {
      setLoading(false)
    }
  }

  
  async function handleResetPassword(e) {
    e.preventDefault()
    setError('')
    setInfo('')

    if (!passwordRegex.test(newPassword)) {
      setError('Password minimal 8 karakter dan harus mengandung huruf serta angka.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Password dan konfirmasi password tidak sama.')
      return
    }

    setLoading(true)
    try {
      await authApi.resetPassword({ reset_token: resetToken, new_password: newPassword })
      setInfo('Password berhasil diperbarui!')
      setTimeout(() => navigate('/login', { state: { passwordReset: true } }), 1500)
    } catch (err) {
      setError(err.message || 'Gagal mengubah password.')
    } finally {
      setLoading(false)
    }
  }

  const stepLabel = ['Masukkan Email', 'Verifikasi OTP', 'Password Baru']
  const stepDesc = [
    'Masukkan email akunmu. Kami akan mengirim kode OTP untuk verifikasi.',
    `Masukkan kode OTP ${otpLength} digit yang dikirim ke ${email || 'email kamu'}.`,
    'Buat password baru yang kuat untuk akunmu.',
  ]

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-brand">
          <span className="brand-icon"><Wallet size={22} /></span>
          <span>SmartFinance AI</span>
        </Link>

        {}
        <div className="fp-steps">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`fp-step ${step === s ? 'active' : ''} ${step > s ? 'done' : ''}`}>
              <div className="fp-step-dot">{step > s ? '✓' : s}</div>
              {s < 3 && <div className="fp-step-line" />}
            </div>
          ))}
        </div>

        <div className="auth-header">
          <div className="auth-icon-wrap"><KeyRound size={24} /></div>
          <p className="eyebrow">Lupa Password — {stepLabel[step - 1]}</p>
          <h1>Reset Password</h1>
          <p>{stepDesc[step - 1]}</p>
        </div>

        {error && <div className="form-alert error">{error}</div>}
        {info && <div className="form-alert success">{info}</div>}

        {}
        {step === 1 && (
          <form className="auth-form" onSubmit={handleRequestOtp}>
            <label className="form-group">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                placeholder="nama@email.com"
                autoComplete="email"
                required
              />
            </label>
            <button className="btn primary auth-submit" type="submit" disabled={loading}>
              {loading && <Loader2 size={18} className="spin" />}
              Kirim Kode OTP
            </button>
          </form>
        )}

        {}
        {step === 2 && (
          <form className="auth-form" onSubmit={handleVerifyOtp}>
            <label className="form-group">
              <span>Kode OTP</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={otpLength}
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, otpLength)); setError('') }}
                placeholder={'0'.repeat(otpLength)}
                className="otp-input"
                autoFocus
                required
              />
            </label>
            <button
              className="btn primary auth-submit"
              type="submit"
              disabled={loading || otp.length !== otpLength}
            >
              {loading && <Loader2 size={18} className="spin" />}
              Verifikasi OTP
            </button>
            <button
              type="button"
              className="link-button"
              onClick={handleResendOtp}
              disabled={cooldown > 0 || loading}
            >
              {cooldown > 0 ? `Kirim ulang dalam ${cooldown}s` : 'Kirim ulang OTP'}
            </button>
          </form>
        )}

        {}
        {step === 3 && (
          <form className="auth-form" onSubmit={handleResetPassword}>
            <label className="form-group">
              <span>Password Baru</span>
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError('') }}
                  placeholder="Minimal 8 karakter + angka"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label="Toggle password"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            <label className="form-group">
              <span>Konfirmasi Password</span>
              <div className="password-field">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                  placeholder="Ulangi password baru"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  aria-label="Toggle confirm password"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            <button className="btn primary auth-submit" type="submit" disabled={loading}>
              {loading && <Loader2 size={18} className="spin" />}
              Simpan Password Baru
            </button>
          </form>
        )}

        <p className="auth-switch">
          Ingat password? <Link to="/login">Masuk di sini</Link>
        </p>
      </section>
    </main>
  )
}
