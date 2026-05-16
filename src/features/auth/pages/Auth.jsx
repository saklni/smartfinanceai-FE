import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Wallet } from 'lucide-react'
import { authRepository } from '../../../lib/repositories/authRepository'
import { env } from '../../../config/env'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

/* ─── Google One-Tap / Sign-In button loader ─────────────────────────────── */
function useGoogleScript(clientId) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!clientId) return
    if (window.google?.accounts?.id) { setReady(true); return }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => setReady(true)
    document.head.appendChild(script)

    return () => {
      // cleanup jika komponen unmount sebelum script load
    }
  }, [clientId])

  return ready
}

export default function Auth() {
  const navigate = useNavigate()
  const location = useLocation()
  const isRegister = location.pathname === '/register'

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState(
    location.state?.passwordReset ? 'Password berhasil diubah! Silakan masuk dengan password baru.' : ''
  )

  const googleReady = useGoogleScript(env.googleClientId)

  /* ── Render Google button ketika SDK siap dan bukan halaman register ── */
  useEffect(() => {
    if (!googleReady || !env.googleClientId || isRegister) return

    window.google.accounts.id.initialize({
      client_id: env.googleClientId,
      callback: handleGoogleCallback,
      auto_select: false,
      cancel_on_tap_outside: true,
    })

    window.google.accounts.id.renderButton(
      document.getElementById('google-signin-btn'),
      {
        type: 'standard',
        shape: 'rectangular',
        theme: 'outline',
        text: 'signin_with',
        size: 'large',
        logo_alignment: 'left',
        width: '100%',
      },
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleReady, isRegister])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const validateForm = () => {
    if (isRegister && !form.name.trim()) return 'Nama lengkap wajib diisi.'
    if (!form.email.trim()) return 'Email wajib diisi.'
    if (!emailRegex.test(form.email)) return 'Format email tidak valid.'
    if (!form.password) return 'Password wajib diisi.'
    if (!passwordRegex.test(form.password)) return 'Password minimal 8 karakter dan harus mengandung huruf serta angka.'
    if (isRegister && !form.confirmPassword) return 'Konfirmasi password wajib diisi.'
    if (isRegister && form.password !== form.confirmPassword) return 'Password dan konfirmasi password tidak sama.'
    return ''
  }

  const handleLoginRedirect = (user) => {
    if (user.status === 'pending') {
      navigate('/verify-otp', { state: { email: user.email } })
      return
    }
    if (!user.onboarding_completed && !user.onboardingCompleted) {
      navigate('/onboarding')
      return
    }
    const redirectTo =
      location.state?.from && location.state.from !== '/login'
        ? location.state.from
        : '/dashboard'
    navigate(redirectTo)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationMessage = validateForm()
    if (validationMessage) { setError(validationMessage); return }

    try {
      setLoading(true)
      setError('')

      if (isRegister) {
        await authRepository.register({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        })
        navigate('/verify-otp', { state: { email: form.email.trim().toLowerCase() } })
        return
      }

      const user = await authRepository.login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })
      handleLoginRedirect(user)
    } catch (err) {
      setError(err?.message || 'Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Callback dari Google SDK setelah user pilih akun ── */
  async function handleGoogleCallback(response) {
    if (!response?.credential) {
      setError('Login Google dibatalkan atau gagal.')
      return
    }
    try {
      setGoogleLoading(true)
      setError('')
      const user = await authRepository.loginWithGoogle(response.credential)
      handleLoginRedirect(user)
    } catch (err) {
      setError(err?.message || 'Login dengan Google gagal. Coba lagi.')
    } finally {
      setGoogleLoading(false)
    }
  }

  /* ── Fallback manual trigger One-Tap (jika renderButton tidak muncul) ── */
  const handleGoogleButtonClick = () => {
    if (!env.googleClientId) {
      setError('Google Client ID belum dikonfigurasi. Tambahkan VITE_GOOGLE_CLIENT_ID di .env')
      return
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt()
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-brand">
          <span className="brand-icon"><Wallet size={22} /></span>
          <span>SmartFinance AI</span>
        </Link>

        <div className="auth-header">
          <p className="eyebrow">{isRegister ? 'Buat akun baru' : 'Selamat datang kembali'}</p>
          <h1>{isRegister ? 'Mulai kelola keuanganmu' : 'Masuk ke akunmu'}</h1>
          <p>
            {isRegister
              ? 'Daftar, verifikasi OTP, lalu lengkapi profil finansial awalmu.'
              : 'Masuk untuk melanjutkan pengelolaan keuanganmu.'}
          </p>
        </div>

        {successMsg && <div className="form-alert success">{successMsg}</div>}
        {location.state?.reason === 'session_expired' && (
          <div className="form-alert error">Sesi kamu berakhir. Silakan masuk kembali.</div>
        )}
        {error && <div className="form-alert error">{error}</div>}

        {/* ── Google Sign-In (login only) ── */}
        {!isRegister && (
          <>
            {env.googleClientId ? (
              <div className="google-signin-wrapper">
                {googleLoading && (
                  <div className="google-loading">
                    <Loader2 size={18} className="spin" />
                    <span>Menghubungkan dengan Google...</span>
                  </div>
                )}
                {/* Google renderButton target */}
                <div id="google-signin-btn" className={googleLoading ? 'hidden' : ''} />

                {/* Fallback: jika SDK belum load atau tidak ada client ID */}
                {!googleReady && !googleLoading && (
                  <button
                    type="button"
                    className="btn google-btn"
                    onClick={handleGoogleButtonClick}
                    disabled={googleLoading}
                  >
                    <GoogleIcon />
                    Masuk dengan Google
                  </button>
                )}
              </div>
            ) : (
              /* Tampilkan tombol disabled dengan tooltip jika VITE_GOOGLE_CLIENT_ID belum diisi */
              <div className="google-signin-wrapper">
                <button
                  type="button"
                  className="btn google-btn"
                  onClick={handleGoogleButtonClick}
                >
                  <GoogleIcon />
                  Masuk dengan Google
                </button>
                <p className="google-hint">Tambahkan VITE_GOOGLE_CLIENT_ID di .env untuk mengaktifkan</p>
              </div>
            )}

            <div className="auth-divider">
              <span>atau masuk dengan email</span>
            </div>
          </>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <label className="form-group">
              <span>Nama Lengkap</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
                autoComplete="name"
              />
            </label>
          )}

          <label className="form-group">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="nama@email.com"
              autoComplete="email"
            />
          </label>

          <label className="form-group">
            <span>Password</span>
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimal 8 karakter + angka"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {!isRegister && (
            <div className="forgot-password-link">
              <Link to="/forgot-password">Lupa password?</Link>
            </div>
          )}

          {isRegister && (
            <label className="form-group">
              <span>Konfirmasi Password</span>
              <div className="password-field">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Ulangi password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  aria-label={showConfirmPassword ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
          )}

          <button className="btn primary auth-submit" type="submit" disabled={loading}>
            {loading && <Loader2 size={18} className="spin" />}
            {isRegister ? 'Daftar Sekarang' : 'Masuk'}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
          <Link to={isRegister ? '/login' : '/register'}>
            {isRegister ? 'Masuk di sini' : 'Daftar di sini'}
          </Link>
        </p>
      </section>
    </main>
  )
}

/* ── Google SVG Icon ─────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
