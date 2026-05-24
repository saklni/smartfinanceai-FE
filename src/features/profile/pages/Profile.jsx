import { useEffect, useState } from 'react'
import { authRepository } from '../../../lib/repositories/authRepository'
import { formatIDR } from '../../../lib/utils/financeAdapters'

const ageOptions = [
  ['<18', 'Di bawah 18 tahun'],
  ['18-24', '18 - 24 tahun'],
  ['25-34', '25 - 34 tahun'],
  ['35+', '35 tahun ke atas'],
]

const spendingOptions = [
  ['frugal', 'Hemat'],
  ['balanced', 'Seimbang'],
  ['impulsive', 'Impulsif'],
]

const goalOptions = [
  ['saving', 'Menabung lebih konsisten'],
  ['control_expense', 'Mengontrol pengeluaran'],
  ['emergency_fund', 'Membangun dana darurat'],
  ['budgeting', 'Mengatur budget bulanan'],
]

const priorityOptions = [
  ['reduce_unnecessary_expense', 'Mengurangi pengeluaran tidak penting'],
  ['understand_spending_pattern', 'Memahami pola pengeluaran'],
  ['increase_saving', 'Meningkatkan tabungan'],
  ['financial_planning', 'Membuat rencana keuangan lebih rapi'],
]

const labelOf = (options, value) => options.find(([key]) => key === value)?.[1] || value || '-'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true

    async function loadProfile() {
      try {
        const profile = await authRepository.getProfile()
        if (mounted) setUser(profile)
      } catch (err) {
        if (mounted) setStatus(err.message || 'Gagal memuat profil')
      }
    }

    loadProfile()
    return () => { mounted = false }
  }, [])

  async function submit(event) {
    event.preventDefault()
    setStatus('')
    setSaving(true)

    try {
      const updated = await authRepository.updateProfile({
        name: user.name,
        email: user.email,
        nickname: user.nickname,
        monthlyIncome: Number(user.monthlyIncome || 0),
        savingTarget: Number(user.savingTarget || 0),
        ageRange: user.ageRange,
        spendingStyle: user.spendingStyle,
        financialGoal: user.financialGoal,
        mainPriority: user.mainPriority,
        riskProfile: user.riskProfile,
      })
      setUser(updated)
      setStatus('Profil tersimpan')
    } catch (err) {
      setStatus(err.message || 'Gagal menyimpan profil')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return <section className="page"><div className="panel"><p>Memuat profil...</p></div></section>

  return (
    <section className="page">
      <div className="page-title">
        <div>
          <p>Pengaturan akun</p>
          <h1>Profil</h1>
        </div>
      </div>

      {status && <div className="panel"><p>{status}</p></div>}

      <div className="profile-grid">
        <div className="panel profile-card">
          <div className="big-avatar">{user.avatar}</div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <div className="profile-metrics">
            <span>Pemasukan <b>{formatIDR(user.monthlyIncome)}</b></span>
            <span>Target <b>{formatIDR(user.savingTarget)}</b></span>
            <span>Gaya <b>{labelOf(spendingOptions, user.spendingStyle)}</b></span>
            <span>Tujuan <b>{labelOf(goalOptions, user.financialGoal)}</b></span>
          </div>
        </div>

        <form className="panel tx-form" onSubmit={submit}>
          <h2>Edit Profil</h2>
          <div className="two">
            <label>Nama<input value={user.name || ''} onChange={(event) => setUser({ ...user, name: event.target.value })} /></label>
            <label>Nama Panggilan<input value={user.nickname || ''} onChange={(event) => setUser({ ...user, nickname: event.target.value })} /></label>
          </div>
          <label>Email<input type="email" value={user.email || ''} onChange={(event) => setUser({ ...user, email: event.target.value })} /></label>
          <div className="two">
            <label>Pemasukan Bulanan<input type="number" min="0" value={user.monthlyIncome || 0} onChange={(event) => setUser({ ...user, monthlyIncome: Number(event.target.value) })} /></label>
            <label>Target Tabungan<input type="number" min="0" value={user.savingTarget || 0} onChange={(event) => setUser({ ...user, savingTarget: Number(event.target.value) })} /></label>
          </div>
          <div className="two">
            <label>Range Usia<select value={user.ageRange || ''} onChange={(event) => setUser({ ...user, ageRange: event.target.value })}>{ageOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label>Gaya Pengeluaran<select value={user.spendingStyle || ''} onChange={(event) => setUser({ ...user, spendingStyle: event.target.value })}>{spendingOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          </div>
          <label>Tujuan Finansial<select value={user.financialGoal || ''} onChange={(event) => setUser({ ...user, financialGoal: event.target.value })}>{goalOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Prioritas Utama<select value={user.mainPriority || ''} onChange={(event) => setUser({ ...user, mainPriority: event.target.value })}>{priorityOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Risk Profile<select value={user.riskProfile || 'moderate'} onChange={(event) => setUser({ ...user, riskProfile: event.target.value })}><option value="conservative">Konservatif</option><option value="moderate">Moderat</option><option value="aggressive">Agresif</option></select></label>
          <button className="btn full" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
        </form>
      </div>
    </section>
  )
}
