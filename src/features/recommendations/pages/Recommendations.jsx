import { Brain, Sparkles, TrendingDown, TrendingUp, Target,
         AlertCircle, RefreshCw, ChevronRight, Lightbulb } from 'lucide-react'
import { useRecommendations } from '../../../lib/repositories/recommendationRepository'

/* ── Konfigurasi label ─────────────────────────────────────────────────── */
const LABEL_CONFIG = {
  Boros:  { emoji: '⚠️', color: 'boros',  icon: TrendingDown, title: 'Perlu Perhatian',  desc: 'Pengeluaran melebihi batas aman' },
  Normal: { emoji: '👍', color: 'normal', icon: Target,       title: 'Cukup Baik',       desc: 'Keuangan berjalan cukup sehat' },
  Hemat:  { emoji: '🌟', color: 'hemat',  icon: TrendingUp,   title: 'Keuangan Sehat',   desc: 'Kamu mengelola uang dengan baik' },
}

const PRIORITY_CONFIG = {
  high:   { label: 'Prioritas tinggi', color: 'high' },
  medium: { label: 'Perlu diperhatikan', color: 'medium' },
  low:    { label: 'Tips tambahan', color: 'low' },
}

const CATEGORY_ICON = {
  makanan_minuman:    '🍜',
  transportasi:       '🚗',
  hiburan:            '🎮',
  belanja_online:     '🛍️',
  tagihan_utilitas:   '💡',
  kesehatan:          '❤️',
  pendidikan:         '📚',
  tabungan_investasi: '💰',
}

/* ── Hero: status bar keuangan ──────────────────────────────────────────── */
function AiStatusHero({ label, confidence, savingsPct, hasAi }) {
  const cfg = LABEL_CONFIG[label]

  if (!hasAi) {
    return (
      <div className="rec-hero rec-hero-rule">
        <div className="rec-hero-icon-wrap rule"><Lightbulb size={28} /></div>
        <div className="rec-hero-body">
          <p className="rec-hero-tag">Rekomendasi Personal</p>
          <h2 className="rec-hero-title">Analisis dari pola keuanganmu</h2>
          <p className="rec-hero-sub">
            Hubungkan AI API untuk mendapatkan analisis yang lebih mendalam dan personal.
          </p>
        </div>
      </div>
    )
  }

  const Icon = cfg.icon
  return (
    <div className={`rec-hero rec-hero-ai rec-hero-${cfg.color}`}>
      {/* Kiri: status utama */}
      <div className="rec-hero-main">
        <div className={`rec-hero-icon-wrap ${cfg.color}`}>
          <Icon size={28} />
        </div>
        <div className="rec-hero-body">
          <p className="rec-hero-tag"><Brain size={12} /> SmartFinance AI</p>
          <h2 className="rec-hero-title">
            {cfg.emoji} Kamu termasuk: <span className={`rec-hero-label ${cfg.color}`}>{label}</span>
          </h2>
          <p className="rec-hero-sub">{cfg.desc}</p>
        </div>
      </div>

      {/* Kanan: dua metrik */}
      <div className="rec-hero-metrics">
        <div className="rec-metric">
          <span className="rec-metric-num">{Math.round((confidence ?? 0) * 100)}%</span>
          <span className="rec-metric-label">Keyakinan AI</span>
        </div>
        <div className="rec-metric-divider" />
        <div className="rec-metric">
          <span className={`rec-metric-num ${savingsPct >= 20 ? 'good' : savingsPct >= 10 ? 'ok' : 'low'}`}>
            {savingsPct?.toFixed(0) ?? 0}%
          </span>
          <span className="rec-metric-label">Saving rate</span>
        </div>
      </div>

      {/* Progress bar saving rate */}
      {savingsPct !== null && savingsPct !== undefined && (
        <div className="rec-hero-progress">
          <div className="rec-hero-progress-labels">
            <span>Saving rate bulan ini</span>
            <span>Target ideal ≥ 20%</span>
          </div>
          <div className="rec-hero-bar">
            <div
              className={`rec-hero-fill ${savingsPct >= 20 ? 'good' : savingsPct >= 10 ? 'ok' : 'low'}`}
              style={{ width: `${Math.min(100, Math.max(0, savingsPct))}%` }}
            />
            {/* Marker target 20% */}
            <div className="rec-hero-bar-marker" style={{ left: '20%' }} />
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Card: ringkasan AI ──────────────────────────────────────────────────── */
function SummaryCard({ item }) {
  return (
    <div className="rec-card rec-card-full rec-card-summary">
      <div className="rec-card-summary-header">
        <div className="rec-card-summary-icon"><Sparkles size={18} /></div>
        <span>Ringkasan Analisis AI</span>
      </div>
      <p className="rec-card-summary-text">{item.text}</p>
    </div>
  )
}

/* ── Card: per-kategori AI ───────────────────────────────────────────────── */
function CategoryCard({ item }) {
  const catKey   = item.category || ''
  const emoji    = CATEGORY_ICON[catKey] || '📌'
  const catLabel = catKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const pCfg     = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.medium

  return (
    <div className="rec-card rec-card-category">
      <div className="rec-card-category-top">
        <div className="rec-cat-emoji">{emoji}</div>
        <div className="rec-cat-meta">
          <span className={`rec-priority-dot ${pCfg.color}`} />
          <span className="rec-cat-label">{catLabel}</span>
        </div>
      </div>
      <h3 className="rec-card-cat-title">{item.title}</h3>
      <p className="rec-card-cat-text">{item.text}</p>
    </div>
  )
}

/* ── Card: rule-based fallback ───────────────────────────────────────────── */
function RuleCard({ item, index }) {
  const icons = [TrendingDown, Target, Lightbulb, Brain]
  const Icon  = icons[index % icons.length]
  const pCfg  = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.medium

  return (
    <div className="rec-card rec-card-rule">
      <div className="rec-card-rule-top">
        <div className="rec-rule-icon"><Icon size={18} /></div>
        <span className={`rec-priority-badge ${pCfg.color}`}>{pCfg.label}</span>
      </div>
      <h3 className="rec-card-cat-title">{item.title}</h3>
      <p className="rec-card-cat-text">{item.text || item.message}</p>
      <div className="rec-card-rule-footer">
        <ChevronRight size={14} />
      </div>
    </div>
  )
}

/* ── Loading skeleton ────────────────────────────────────────────────────── */
function RecSkeleton() {
  return (
    <div className="rec-skeleton-wrap">
      <div className="rec-skeleton-hero" />
      <div className="rec-skeleton-grid">
        {[1,2,3,4].map(i => <div key={i} className="rec-skeleton-card" />)}
      </div>
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function Recommendations() {
  const { recommendations, aiLabel, loading, error, reload } = useRecommendations()

  const hasAi       = recommendations.some(r => r.source === 'llm')
  const hasContent  = recommendations.length > 0
  const labelCard   = recommendations.find(r => r.recommendation_type === 'ai_classification')
  const summaryCard = recommendations.find(r => r.recommendation_type === 'ai_summary')
  const catCards    = recommendations.filter(r => r.recommendation_type === 'ai_category')
  const ruleCards   = recommendations.filter(r => r.source === 'rule_based')

  return (
    <section className="page">

      {/* Page title */}
      <div className="page-title">
        <div>
          <p>Asisten keuangan personal</p>
          <h1>Rekomendasi</h1>
        </div>
        <button className="rec-refresh-btn" onClick={reload} disabled={loading} type="button">
          <RefreshCw size={15} className={loading ? 'spinning' : ''} />
          {loading ? 'Menganalisis...' : 'Perbarui'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rec-error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && <RecSkeleton />}

      {/* Content */}
      {!loading && (
        <>
          {/* Hero status */}
          <AiStatusHero
            label={aiLabel}
            confidence={labelCard?.confidence}
            savingsPct={labelCard?.savings_pct}
            hasAi={hasAi}
          />

          {/* Empty state */}
          {!hasContent && !error && (
            <div className="rec-empty">
              <Sparkles size={36} />
              <h3>Belum ada rekomendasi</h3>
              <p>Tambahkan beberapa transaksi agar AI bisa membaca pola pengeluaranmu.</p>
            </div>
          )}

          {/* Summary card — full width */}
          {summaryCard && <SummaryCard item={summaryCard} />}

          {/* Category cards dari AI */}
          {catCards.length > 0 && (
            <div className="rec-section">
              <div className="rec-section-title">
                <Brain size={16} />
                <span>Tips per kategori</span>
                <span className="rec-section-count">{catCards.length} kategori</span>
              </div>
              <div className="rec-cards-grid">
                {catCards.map((item, i) => (
                  <CategoryCard key={item.id || i} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Rule-based cards */}
          {ruleCards.length > 0 && (
            <div className="rec-section">
              <div className="rec-section-title">
                <Lightbulb size={16} />
                <span>{hasAi ? 'Tips tambahan' : 'Rekomendasi'}</span>
                <span className="rec-section-count">{ruleCards.length} tips</span>
              </div>
              <div className="rec-cards-grid">
                {ruleCards.map((item, i) => (
                  <RuleCard key={item.id || i} item={item} index={i} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}