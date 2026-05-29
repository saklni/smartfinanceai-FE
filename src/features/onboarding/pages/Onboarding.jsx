import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, PiggyBank, Target, UserRound, Wallet } from 'lucide-react'
import { authRepository } from '../../../lib/repositories/authRepository'
import { useUser } from '../../../lib/utils/UserContext' 

const ageRanges = [
  { label: 'Di bawah 18 tahun', value: '<18' },
  { label: '18 - 24 tahun', value: '18-24' },
  { label: '25 - 34 tahun', value: '25-34' },
  { label: '35 tahun ke atas', value: '35+' },
]

const spendingStyles = [
  { label: 'Hemat', value: 'frugal', description: 'Aku cukup hati-hati saat menggunakan uang.' },
  { label: 'Seimbang', value: 'balanced', description: 'Aku berusaha menyeimbangkan kebutuhan dan keinginan.' },
  { label: 'Impulsif', value: 'impulsive', description: 'Kadang aku mudah tergoda membeli sesuatu.' },
]

const financialGoals = [
  { label: 'Menabung lebih konsisten', value: 'saving' },
  { label: 'Mengontrol pengeluaran', value: 'control_expense' },
  { label: 'Membangun dana darurat', value: 'emergency_fund' },
  { label: 'Mengatur budget bulanan', value: 'budgeting' },
]

const mainPriorities = [
  { label: 'Mengurangi pengeluaran tidak penting', value: 'reduce_unnecessary_expense' },
  { label: 'Memahami pola pengeluaran', value: 'understand_spending_pattern' },
  { label: 'Meningkatkan tabungan', value: 'increase_saving' },
  { label: 'Membuat rencana keuangan lebih rapi', value: 'financial_planning' },
]

const initialForm = {
  nickname: '',
  age_range: '',
  monthly_income: '',
  saving_target: '',
  spending_style: '',
  financial_goal: '',
  main_priority: '',
}

function buildInitialForm(profile = {}) {
  const fallbackName = profile.name || ''

  return {
    nickname: profile.nickname || fallbackName.split(' ')[0] || '',
    age_range: profile.age_range || profile.ageRange || '',
    monthly_income: profile.monthly_income || profile.monthlyIncome || '',
    saving_target: profile.saving_target || profile.savingTarget || '',
    spending_style: profile.spending_style || profile.spendingStyle || '',
    financial_goal: profile.financial_goal || profile.financialGoal || '',
    main_priority: profile.main_priority || profile.mainPriority || '',
  }
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { setUser } = useUser() 
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const totalSteps = 3
  const progress = useMemo(() => Math.round((step / totalSteps) * 100), [step])

  useEffect(() => {
    let mounted = true

    async function loadProfile() {
      try {
        const profile = await authRepository.getProfile()
        if (mounted) setForm((current) => ({ ...current, ...buildInitialForm(profile) }))
      } catch (err) {
        if (mounted) setError(err?.message || 'Gagal memuat data onboarding.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadProfile()
    return () => { mounted = false }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleSelect = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const validateStep = () => {
    if (step === 1) {
      if (!form.nickname.trim()) return 'Nama panggilan wajib diisi.'
      if (!form.age_range) return 'Pilih range usia kamu.'
    }

    if (step === 2) {
      if (form.monthly_income === '') return 'Penghasilan bulanan wajib diisi.'
      if (Number(form.monthly_income) < 0) return 'Penghasilan bulanan tidak boleh negatif.'
      if (form.saving_target === '') return 'Target tabungan bulanan wajib diisi.'
      if (Number(form.saving_target) < 0) return 'Target tabungan tidak boleh negatif.'
      if (Number(form.saving_target) > Number(form.monthly_income || 0)) return 'Target tabungan sebaiknya tidak melebihi penghasilan bulanan.'
      if (!form.spending_style) return 'Pilih gaya pengeluaran kamu.'
    }

    if (step === 3) {
      if (!form.financial_goal) return 'Pilih tujuan finansial kamu.'
      if (!form.main_priority) return 'Pilih prioritas utama kamu.'
    }

    return ''
  }

  const handleNext = () => {
    const validationMessage = validateStep()
    if (validationMessage) {
      setError(validationMessage)
      return
    }
    setError('')
    setStep((prev) => Math.min(prev + 1, totalSteps))
  }

  const handleBack = () => {
    setError('')
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    const validationMessage = validateStep()
    if (validationMessage) {
      setError(validationMessage)
      return
    }

    try {
      setSaving(true)
      setError('')

      await authRepository.updateProfile({
        nickname: form.nickname.trim(),
        age_range: form.age_range,
        monthly_income: Number(form.monthly_income),
        saving_target: Number(form.saving_target),
        spending_style: form.spending_style,
        financial_goal: form.financial_goal,
        main_priority: form.main_priority,
        onboarding_completed: true,
        onboardingCompleted: true,
      })

      setUser((prev) => ({ ...prev, onboarding_completed: true, onboardingCompleted: true }))

      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err?.message || 'Gagal menyimpan onboarding. Silakan coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="onboarding-page">
        <section className="onboarding-shell single">
          <div className="onboarding-card"><p>Memuat onboarding...</p></div>
        </section>
      </main>
    )
  }

  return (
    <main className="onboarding-page">
      <section className="onboarding-shell">
        <div className="onboarding-visual">
          <div className="visual-badge"><Wallet size={22} /><span>SmartFinance AI</span></div>
          <div className="visual-content">
            <p className="eyebrow">Personalisasi Finansial</p>
            <h1>Bantu kami memahami kondisi keuanganmu.</h1>
            <p>Jawab beberapa pertanyaan singkat agar dashboard, insight, dan rekomendasi keuanganmu terasa lebih relevan.</p>
          </div>
          <div className="visual-card">
            <div><span>Progress onboarding</span><strong>{progress}%</strong></div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          </div>
        </div>

        <div className="onboarding-card">
          <div className="step-indicator">
            <span>Step {step} dari {totalSteps}</span>
            <div className="step-dots">
              {[1, 2, 3].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={item <= step ? 'active' : ''}
                  aria-label={`Step ${item}`}
                  onClick={() => item < step && (setStep(item), setError(''))}
                />
              ))}
            </div>
          </div>

          {error && <div className="form-alert error">{error}</div>}

          {step === 1 && (
            <section className="onboarding-step">
              <div className="step-heading">
                <div className="step-icon"><UserRound size={22} /></div>
                <div>
                  <p className="eyebrow">Tentang Kamu</p>
                  <h2>Kenali pengguna terlebih dahulu</h2>
                  <p>Data ini membantu SmartFinance AI menyesuaikan pengalaman berdasarkan profil awalmu.</p>
                </div>
              </div>
              <div className="form-grid">
                <label className="form-group span-2">
                  <span>Nama panggilan</span>
                  <input type="text" name="nickname" value={form.nickname} onChange={handleChange} placeholder="Contoh: Candra" autoComplete="given-name" />
                </label>
                <div className="form-group span-2">
                  <span>Range usia</span>
                  <div className="choice-grid">
                    {ageRanges.map((item) => (
                      <button key={item.value} type="button" className={form.age_range === item.value ? 'choice-card selected' : 'choice-card'} onClick={() => handleSelect('age_range', item.value)}>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="onboarding-step">
              <div className="step-heading">
                <div className="step-icon"><PiggyBank size={22} /></div>
                <div>
                  <p className="eyebrow">Kondisi Keuangan</p>
                  <h2>Bagaimana kondisi finansialmu saat ini?</h2>
                  <p>Informasi ini digunakan untuk menghitung ringkasan dan rekomendasi awal yang lebih masuk akal.</p>
                </div>
              </div>
              <div className="form-grid">
                <label className="form-group">
                  <span>Penghasilan bulanan</span>
                  <input type="number" name="monthly_income" value={form.monthly_income} onChange={handleChange} placeholder="Contoh: 2500000" min="0" inputMode="numeric" />
                </label>
                <label className="form-group">
                  <span>Target tabungan bulanan</span>
                  <input type="number" name="saving_target" value={form.saving_target} onChange={handleChange} placeholder="Contoh: 500000" min="0" inputMode="numeric" />
                </label>
                <div className="form-group span-2">
                  <span>Gaya pengeluaran</span>
                  <div className="choice-grid three">
                    {spendingStyles.map((item) => (
                      <button key={item.value} type="button" className={form.spending_style === item.value ? 'choice-card selected' : 'choice-card'} onClick={() => handleSelect('spending_style', item.value)}>
                        <strong>{item.label}</strong><small>{item.description}</small>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="onboarding-step">
              <div className="step-heading">
                <div className="step-icon"><Target size={22} /></div>
                <div>
                  <p className="eyebrow">Tujuan Finansial</p>
                  <h2>Apa yang ingin kamu capai?</h2>
                  <p>Tujuan ini menjadi dasar rekomendasi finansial yang muncul di dashboard dan halaman rekomendasi.</p>
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group span-2">
                  <span>Tujuan finansial utama</span>
                  <div className="choice-grid">
                    {financialGoals.map((item) => (
                      <button key={item.value} type="button" className={form.financial_goal === item.value ? 'choice-card selected' : 'choice-card'} onClick={() => handleSelect('financial_goal', item.value)}>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group span-2">
                  <span>Prioritas utama</span>
                  <div className="choice-grid">
                    {mainPriorities.map((item) => (
                      <button key={item.value} type="button" className={form.main_priority === item.value ? 'choice-card selected' : 'choice-card'} onClick={() => handleSelect('main_priority', item.value)}>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="completion-note"><CheckCircle2 size={20} /><p>Setelah onboarding selesai, SmartFinance AI akan menyiapkan dashboard awal berdasarkan profil finansialmu.</p></div>
            </section>
          )}

          <div className="onboarding-actions">
            {step > 1 ? (
              <button type="button" className="btn ghost" onClick={handleBack} disabled={saving}><ArrowLeft size={18} />Kembali</button>
            ) : <span />}

            {step < totalSteps ? (
              <button type="button" className="btn primary" onClick={handleNext}>Lanjut<ArrowRight size={18} /></button>
            ) : (
              <button type="button" className="btn primary" onClick={handleSubmit} disabled={saving}>{saving ? 'Menyimpan...' : 'Selesaikan'}{!saving && <CheckCircle2 size={18} />}</button>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
