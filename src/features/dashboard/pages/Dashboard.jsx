import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ArrowDownRight, ArrowUpRight, PiggyBank, PlusCircle, Wallet } from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import { DashboardSkeleton } from '../../../components/common/DashboardSkeleton'
import { formatIDR } from '../../../lib/repositories/financeRepository'
import { authRepository } from '../../../lib/repositories/authRepository'
import { analyticsRepository } from '../../../lib/repositories/analyticsRepository'
import { financeRepository } from '../../../lib/repositories/financeRepository'

function downloadCsv(transactions) {
  const header = ['title', 'type', 'category', 'amount', 'transaction_date', 'note']
  const rows = transactions.map((item) =>
    header.map((key) => JSON.stringify(item[key] ?? item.date ?? '')).join(','),
  )

  const csv = [header.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `smartfinance-transaksi-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()

  URL.revokeObjectURL(url)
}

function formatCompactIDR(value) {
  const numberValue = Number(value || 0)

  if (!numberValue) return 'Rp0'

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(numberValue)
}

function CashflowBarTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0]?.payload || {}
  const income = Number(data.income || 0)
  const expense = Number(data.expense || 0)
  const net = income - expense

  return (
    <div className="cashflow-bar-tooltip">
      <p className="tooltip-month">{label}</p>

      <div className="tooltip-item income">
        <span>Pemasukan</span>
        <b>{formatIDR(income)}</b>
      </div>

      <div className="tooltip-item expense">
        <span>Pengeluaran</span>
        <b>{formatIDR(expense)}</b>
      </div>

      <div className="tooltip-item net">
        <span>Selisih</span>
        <b className={net >= 0 ? 'positive' : 'negative'}>
          {formatIDR(net)}
        </b>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [analytics, setAnalytics] = useState({ summary: null, categories: [], trend: [] })
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadDashboardData() {
      try {
        const [profile, tx, ana] = await Promise.all([
          authRepository.getProfile(),
          financeRepository.getTransactions(),
          analyticsRepository.getDashboardAnalytics(),
        ])

        if (!mounted) return

        setUser(profile)
        setTransactions(tx)
        setAnalytics(ana)
      } catch (err) {
        if (!mounted) return
        setError(err.message || 'Gagal memuat dashboard')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadDashboardData()

    return () => {
      mounted = false
    }
  }, [])

  if (loading) return <DashboardSkeleton />

  if (error) {
    return (
      <section className="page">
        <div className="panel">
          <h2>Gagal memuat data</h2>
          <p>{error}</p>
        </div>
      </section>
    )
  }

  const summary = analytics.summary || {
    income: 0,
    expense: 0,
    balance: 0,
    saving_progress: 0,
    saving_rate: 0,
    expense_ratio: 0,
  }

  const categories = analytics.categories || []
  const trend = analytics.trend || []
  const hasTransactions = transactions.length > 0

  const cashflowTrend = trend.map((item) => {
    const income = Number(item.income || 0)
    const expense = Number(item.expense || 0)

    return {
      ...item,
      income,
      expense,
      incomeBar: income,
      expenseBar: -expense,
    }
  })

  const insightTitle = summary.expense_ratio > 70
    ? 'Rasio pengeluaran cukup tinggi'
    : 'Cashflow mulai terkendali'

  const insightText = summary.expense_ratio > 70
    ? `Pengeluaranmu sekitar ${summary.expense_ratio}% dari pemasukan. Coba kurangi pengeluaran non-prioritas.`
    : `Rasio pengeluaranmu ${summary.expense_ratio}%. Pertahankan dan alokasikan selisihnya untuk tabungan.`

  return (
    <section className="page page-enter">
      <div className="page-title">
        <div>
          <p>Halo, {user?.nickname || user?.name?.split(' ')[0]} 👋</p>
          <h1>Dashboard Keuangan</h1>
        </div>

        <button
          className="btn pulse-click"
          onClick={() => downloadCsv(transactions)}
          disabled={!hasTransactions}
        >
          Unduh Laporan CSV
        </button>
      </div>

      {!hasTransactions && (
        <div className="panel dashboard-empty">
          <PlusCircle size={38} />
          <div>
            <h2>Belum ada transaksi</h2>
            <p>Tambahkan pemasukan atau pengeluaran pertamamu agar grafik dan insight mulai terbentuk.</p>
          </div>
          <Link className="btn" to="/transactions">Tambah Transaksi</Link>
        </div>
      )}

      <div className="stats">
        <StatCard
          label="Saldo"
          value={formatIDR(summary.balance)}
          icon={Wallet}
          caption="Sisa bulan ini"
        />

        <StatCard
          label="Pemasukan"
          value={formatIDR(summary.income)}
          icon={ArrowUpRight}
          tone="blue"
        />

        <StatCard
          label="Pengeluaran"
          value={formatIDR(summary.expense)}
          icon={ArrowDownRight}
          tone="orange"
        />

        <StatCard
          label="Target Tabungan"
          value={`${summary.saving_progress ?? 0}%`}
          icon={PiggyBank}
          tone="purple"
          caption={formatIDR(user?.saving_target)}
        />
      </div>

      <div className="dashboard-grid">
        <div className="panel large interactive-card cashflow-bar-card">
          <div className="panel-head cashflow-bar-head">
            <div>
              <h2>Tren Cashflow</h2>
              <span>Perbandingan pemasukan dan pengeluaran</span>
            </div>

            <div className="cashflow-bar-legend">
              <span>
                <i className="income"></i>
                Pemasukan
              </span>
              <span>
                <i className="expense"></i>
                Pengeluaran
              </span>
            </div>
          </div>

          {cashflowTrend.length ? (
            <ResponsiveContainer width="100%" height={315}>
              <BarChart
                data={cashflowTrend}
                barGap={8}
                barCategoryGap="30%"
                margin={{ top: 14, right: 8, left: 0, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="rgba(148, 163, 184, 0.24)"
                />

                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />

                <YAxis
                  tickFormatter={(value) => formatCompactIDR(Math.abs(value))}
                  tickLine={false}
                  axisLine={false}
                  width={78}
                />

                <ReferenceLine y={0} stroke="rgba(22, 163, 74, 0.35)" />

                <Tooltip
                  cursor={{ fill: 'rgba(22, 163, 74, 0.05)' }}
                  content={<CashflowBarTooltip />}
                />

                <Bar
                  dataKey="incomeBar"
                  name="Pemasukan"
                  fill="#16a34a"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={34}
                />

                <Bar
                  dataKey="expenseBar"
                  name="Pengeluaran"
                  fill="#f97316"
                  radius={[0, 0, 8, 8]}
                  maxBarSize={34}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-state">Grafik akan muncul setelah transaksi ditambahkan.</p>
          )}
        </div>

        <div className="panel interactive-card">
          <div className="panel-head">
            <h2>Kategori Pengeluaran</h2>
            <span>Top kategori</span>
          </div>

          {categories.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categories}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis hide />
                <Tooltip formatter={(value) => formatIDR(value)} />
                <Bar dataKey="value" fill="#16a34a" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-state">Belum ada data kategori pengeluaran.</p>
          )}
        </div>

        <div className="panel insight interactive-card">
          <span className="badge">Insight Bulan Ini</span>
          <h2>{insightTitle}</h2>
          <p>{insightText}</p>
        </div>

        <div className="panel progress-panel interactive-card">
          <h2>Progress Tabungan</h2>

          <div className="progress">
            <span style={{ width: `${summary.saving_progress ?? 0}%` }} />
          </div>

          <p>
            {user?.saving_target
              ? `${summary.saving_progress ?? 0}% dari target ${formatIDR(user.saving_target)}`
              : 'Isi target tabungan di profil agar progress bisa dihitung.'}
          </p>

          <p className="progress-subtext">
            Saving rate: {summary.saving_rate ?? 0}% • Rasio pengeluaran: {summary.expense_ratio ?? 0}%
          </p>
        </div>
      </div>
    </section>
  )
}
