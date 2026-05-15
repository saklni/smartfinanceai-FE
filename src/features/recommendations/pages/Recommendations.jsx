import { useEffect, useState } from 'react'
import { Sparkles, Target, TrendingDown } from 'lucide-react'
import { recommendationRepository } from '../../../lib/repositories/recommendationRepository'

const priorityLabel = {
  high: 'Prioritas tinggi',
  medium: 'Prioritas sedang',
  low: 'Prioritas rendah',
}

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadRecommendations() {
      try {
        const data = await recommendationRepository.getRecommendations()
        if (mounted) setRecommendations(data)
      } catch (err) {
        if (mounted) setError(err.message || 'Gagal memuat rekomendasi')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadRecommendations()
    return () => { mounted = false }
  }, [])

  return (
    <section className="page">
      <div className="page-title">
        <div>
          <p>Asisten keuangan personal</p>
          <h1>Rekomendasi</h1>
        </div>
      </div>

      <div className="recommend-hero">
        <Sparkles size={42} />
        <h2>Insight otomatis untuk kebiasaan finansialmu</h2>
        <p>Rekomendasi dibuat dari pola transaksi dan profil keuanganmu. Saat backend selesai, data ini bisa berasal langsung dari recommendation API.</p>
      </div>

      {error && <div className="panel form-alert error"><p>{error}</p></div>}
      {loading && <div className="panel empty-state">Memuat rekomendasi...</div>}
      {!loading && !error && recommendations.length === 0 && (
        <div className="panel empty-state">Belum ada rekomendasi. Tambahkan beberapa transaksi agar sistem bisa membaca pola pengeluaranmu.</div>
      )}

      <div className="rec-grid">
        {recommendations.map((item, index) => (
          <div className="panel rec-card" key={item.id || item.title}>
            <div className="rec-icon">{index === 0 ? <TrendingDown /> : <Target />}</div>
            <span className={`rec-priority ${item.priority || 'medium'}`}>{priorityLabel[item.priority] || priorityLabel.medium}</span>
            <h2>{item.title}</h2>
            <p>{item.text || item.message}</p>
            <div className="rec-footer">
              <small>Sumber: {item.source === 'llm' ? 'LLM' : item.source === 'ml' ? 'Model ML' : 'Rule-based MVP'}</small>
              <button className="btn ghost dark" type="button" disabled title="Fitur aksi rekomendasi akan dihubungkan setelah backend selesai.">Segera hadir</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
