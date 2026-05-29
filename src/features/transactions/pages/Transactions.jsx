import { useEffect, useMemo, useRef, useState } from 'react'
import { Edit3, Plus, Save, Search, Trash2, X } from 'lucide-react'
import { financeRepository } from '../../../lib/repositories/financeRepository'
import { useLiveCategories } from '../../../lib/repositories/categoryRepository'
import { formatCategoryLabel, formatIDR } from '../../../lib/utils/financeAdapters'

function makeInitialForm(expenseCategories = []) {
  return {
    title:            '',
    type:             'expense',
    category:         expenseCategories[0]?.name || '',
    amount:           '',
    transaction_date: new Date().toISOString().slice(0, 10),
    note:             '',
  }
}

function toForm(item) {
  return {
    title:            item.title || '',
    type:             item.type  || 'expense',
    category:         item.category || item.category_name || '',
    amount:           item.amount   || '',
    transaction_date: item.transaction_date || item.date || new Date().toISOString().slice(0, 10),
    note:             item.note || '',
  }
}

export default function Transactions() {
  const { categories, expenseCategories, incomeCategories, loading: catLoading } = useLiveCategories()

  const [items,       setItems]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState('')
  const [form,        setForm]        = useState(() => makeInitialForm())
  const [editingId,   setEditingId]   = useState(null)
  const [search,      setSearch]      = useState('')
  const [filterType,  setFilterType]  = useState('all')
  const initRef = useRef(false)

  
  useEffect(() => {
    if (!catLoading && expenseCategories.length > 0 && !initRef.current) {
      initRef.current = true
      setForm((prev) => ({
        ...prev,
        category: prev.category || expenseCategories[0]?.name || '',
      }))
    }
  }, [catLoading, expenseCategories])

  const visibleCategories = form.type === 'income' ? incomeCategories : expenseCategories

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const query       = search.trim().toLowerCase()
      const matchesType = filterType === 'all' || item.type === filterType
      const matchesSearch = !query || [item.title, item.category, item.category_label, item.note]
        .some((v) => String(v || '').toLowerCase().includes(query))
      return matchesType && matchesSearch
    })
  }, [filterType, items, search])

  useEffect(() => {
    let mounted = true

    async function loadTransactions() {
      try {
        const data = await financeRepository.getTransactions()
        if (mounted) setItems(data)
      } catch (err) {
        if (mounted) setError(err.message || 'Gagal memuat transaksi')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadTransactions()
    return () => { mounted = false }
  }, [])

  function updateType(type) {
    const cats    = type === 'income' ? incomeCategories : expenseCategories
    const defCat  = cats[0]?.name || ''
    setForm({ ...form, type, category: defCat })
  }

  function resetForm(type = form.type) {
    setEditingId(null)
    const cats   = type === 'income' ? incomeCategories : expenseCategories
    const defCat = cats[0]?.name || ''
    setForm({ ...makeInitialForm(), type, category: defCat })
  }

  function validateForm() {
    if (!form.title.trim())             return 'Judul transaksi wajib diisi.'
    if (!Number(form.amount) || Number(form.amount) <= 0) return 'Nominal harus lebih dari 0.'
    if (!form.transaction_date)         return 'Tanggal transaksi wajib diisi.'
    if (!form.category)                 return 'Kategori wajib dipilih.'
    return ''
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    const msg = validateForm()
    if (msg) { setError(msg); return }

    setSubmitting(true)
    try {
      const payload = { ...form, amount: Number(form.amount) }

      if (editingId) {
        const updated = await financeRepository.updateTransaction(editingId, payload)
        setItems((cur) => cur.map((item) => (Number(item.id) === Number(editingId) ? updated : item)))
        resetForm(form.type)
        return
      }

      const created = await financeRepository.createTransaction(payload)
      setItems((cur) => [created, ...cur])
      resetForm(form.type)
    } catch (err) {
      setError(err.message || 'Gagal menyimpan transaksi')
    } finally {
      setSubmitting(false)
    }
  }

  function startEdit(item) {
    setEditingId(item.id)
    setForm(toForm(item))
    setError('')
  }

  async function removeTransaction(item) {
    setError('')
    if (!window.confirm(`Yakin ingin menghapus transaksi "${item.title}"?`)) return
    try {
      await financeRepository.deleteTransaction(item.id)
      setItems((cur) => cur.filter((i) => Number(i.id) !== Number(item.id)))
      if (Number(editingId) === Number(item.id)) resetForm()
    } catch (err) {
      setError(err.message || 'Gagal menghapus transaksi')
    }
  }

  return (
    <section className="page">
      <div className="page-title">
        <div>
          <p>Kelola cashflow</p>
          <h1>Transaksi</h1>
        </div>
      </div>

      {error && <div className="panel form-alert error"><p>{error}</p></div>}

      <div className="tx-toolbar panel">
        <div className="tx-search">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari transaksi, kategori, atau catatan..."
          />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">Semua tipe</option>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </select>
      </div>

      <div className="tx-layout">
        <form className="panel tx-form" onSubmit={submit}>
          <div className="form-title-row">
            <h2>{editingId ? 'Edit Transaksi' : 'Tambah Transaksi'}</h2>
            {editingId && (
              <button className="icon-mini" type="button" onClick={() => resetForm()} aria-label="Batal edit">
                <X size={17} />
              </button>
            )}
          </div>

          <label>
            Judul
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Contoh: makan siang"
            />
          </label>

          <div className="two">
            <label>
              Tipe
              <select value={form.type} onChange={(e) => updateType(e.target.value)}>
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
              </select>
            </label>
            <label>
              Kategori
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                disabled={catLoading || visibleCategories.length === 0}
              >
                {catLoading && <option value="">Memuat kategori...</option>}
                {visibleCategories.map((cat) => (
                  <option key={cat.id || cat.name} value={cat.name}>
                    {cat.label || formatCategoryLabel(cat.name, categories)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Nominal
            <input
              min="0"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="100000"
            />
          </label>

          <label>
            Tanggal
            <input
              type="date"
              value={form.transaction_date}
              onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
            />
          </label>

          <label>
            Catatan
            <input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Opsional"
            />
          </label>

          <button className="btn full" disabled={submitting || catLoading}>
            {editingId ? <Save size={18} /> : <Plus size={18} />}
            {submitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Simpan'}
          </button>
        </form>

        <div className="panel tx-list">
          <div className="panel-head">
            <h2>Riwayat Transaksi</h2>
            <span>{loading ? 'Memuat...' : `${filteredItems.length} dari ${items.length} data`}</span>
          </div>

          {loading && <p className="empty-state">Memuat transaksi...</p>}
          {!loading && filteredItems.length === 0 && (
            <p className="empty-state">
              Belum ada transaksi yang cocok. Tambahkan transaksi atau ubah filter pencarian.
            </p>
          )}

          {filteredItems.map((item) => (
            <div className="tx-item" key={item.id}>
              <div className={`tx-dot ${item.type}`} />
              <div>
                <b>{item.title}</b>
                <p>
                  {}
                  {item.category_label || formatCategoryLabel(item.category, categories)}
                  {' '}•{' '}
                  {item.transaction_date || item.date}
                </p>
              </div>
              <strong className={item.type}>
                {item.type === 'income' ? '+' : '-'}{formatIDR(item.amount)}
              </strong>
              <div className="tx-actions">
                <button
                  type="button"
                  aria-label={`Edit ${item.title}`}
                  onClick={() => startEdit(item)}
                  className="edit"
                >
                  <Edit3 size={17} />
                </button>
                <button
                  type="button"
                  aria-label={`Hapus ${item.title}`}
                  onClick={() => removeTransaction(item)}
                  className="delete"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
