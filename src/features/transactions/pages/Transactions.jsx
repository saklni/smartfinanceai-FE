import { useEffect, useMemo, useState } from 'react'
import { Edit3, Plus, Save, Search, Trash2, X } from 'lucide-react'
import { financeRepository, formatIDR } from '../../../lib/repositories/financeRepository'
import { categoryRepository } from '../../../lib/repositories/categoryRepository'
import { formatCategoryLabel } from '../../../lib/utils/financeAdapters'

const initialForm = {
  title: '',
  type: 'expense',
  category: 'Food',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  note: '',
}

function toForm(item) {
  return {
    title: item.title || '',
    type: item.type || 'expense',
    category: item.category || 'Food',
    amount: item.amount || '',
    date: item.transaction_date || item.date || new Date().toISOString().slice(0, 10),
    note: item.note || '',
  }
}

export default function Transactions() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')

  const expenseCategories = categories.filter((category) => category.type === 'expense')
  const incomeCategories = categories.filter((category) => category.type === 'income')
  const visibleCategories = form.type === 'income' ? incomeCategories : expenseCategories

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const query = search.trim().toLowerCase()
      const matchesType = filterType === 'all' || item.type === filterType
      const matchesSearch = !query || [item.title, item.category, item.note].some((value) => String(value || '').toLowerCase().includes(query))
      return matchesType && matchesSearch
    })
  }, [filterType, items, search])

  useEffect(() => {
    let mounted = true

    async function loadData() {
      try {
        const [transactionData, categoryData] = await Promise.all([
          financeRepository.getTransactions(),
          categoryRepository.getCategories(),
        ])
        if (!mounted) return
        setItems(transactionData)
        setCategories(categoryData)
      } catch (err) {
        if (mounted) setError(err.message || 'Gagal memuat transaksi')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadData()
    return () => { mounted = false }
  }, [])

  function updateType(type) {
    const nextCategory = type === 'income' ? (incomeCategories[0]?.name || 'Income') : (expenseCategories[0]?.name || 'Food')
    setForm({ ...form, type, category: nextCategory })
  }

  function resetForm(type = form.type) {
    setEditingId(null)
    setForm({ ...initialForm, type, category: type === 'income' ? (incomeCategories[0]?.name || 'Income') : (expenseCategories[0]?.name || 'Food') })
  }

  function validateForm() {
    if (!form.title.trim()) return 'Judul transaksi wajib diisi.'
    if (!Number(form.amount) || Number(form.amount) <= 0) return 'Nominal harus lebih dari 0.'
    if (!form.date) return 'Tanggal transaksi wajib diisi.'
    if (!form.category) return 'Kategori wajib dipilih.'
    return ''
  }

  async function submit(event) {
    event.preventDefault()
    setError('')

    const validationMessage = validateForm()
    if (validationMessage) {
      setError(validationMessage)
      return
    }

    setSubmitting(true)

    try {
      const payload = { ...form, amount: Number(form.amount) }

      if (editingId) {
        const updated = await financeRepository.updateTransaction(editingId, payload)
        setItems((current) => current.map((item) => (Number(item.id) === Number(editingId) ? updated : item)))
        resetForm(form.type)
        return
      }

      const created = await financeRepository.createTransaction(payload)
      setItems((current) => [created, ...current])
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
    const confirmed = window.confirm(`Yakin ingin menghapus transaksi "${item.title}"?`)
    if (!confirmed) return

    try {
      await financeRepository.deleteTransaction(item.id)
      setItems((current) => current.filter((currentItem) => Number(currentItem.id) !== Number(item.id)))
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
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari transaksi, kategori, atau catatan..." />
        </div>
        <select value={filterType} onChange={(event) => setFilterType(event.target.value)}>
          <option value="all">Semua tipe</option>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </select>
      </div>

      <div className="tx-layout">
        <form className="panel tx-form" onSubmit={submit}>
          <div className="form-title-row">
            <h2>{editingId ? 'Edit Transaksi' : 'Tambah Transaksi'}</h2>
            {editingId && <button className="icon-mini" type="button" onClick={() => resetForm()} aria-label="Batal edit"><X size={17} /></button>}
          </div>
          <label>Judul<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Contoh: makan siang" /></label>
          <div className="two">
            <label>Tipe<select value={form.type} onChange={(event) => updateType(event.target.value)}><option value="expense">Pengeluaran</option><option value="income">Pemasukan</option></select></label>
            <label>Kategori<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{visibleCategories.map((category) => <option key={category.id || category.name} value={category.name}>{category.label || formatCategoryLabel(category.name)}</option>)}</select></label>
          </div>
          <label>Nominal<input min="0" type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="100000" /></label>
          <label>Tanggal<input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label>
          <label>Catatan<input value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Opsional" /></label>
          <button className="btn full" disabled={submitting}>{editingId ? <Save size={18} /> : <Plus size={18} />} {submitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Simpan'}</button>
        </form>

        <div className="panel tx-list">
          <div className="panel-head">
            <h2>Riwayat Transaksi</h2>
            <span>{loading ? 'Memuat...' : `${filteredItems.length} dari ${items.length} data`}</span>
          </div>
          {loading && <p className="empty-state">Memuat transaksi...</p>}
          {!loading && filteredItems.length === 0 && <p className="empty-state">Belum ada transaksi yang cocok. Tambahkan transaksi atau ubah filter pencarian.</p>}
          {filteredItems.map((item) => (
            <div className="tx-item" key={item.id}>
              <div className={`tx-dot ${item.type}`} />
              <div>
                <b>{item.title}</b>
                <p>{formatCategoryLabel(item.category)} • {item.transaction_date || item.date}</p>
              </div>
              <strong className={item.type}>{item.type === 'income' ? '+' : '-'}{formatIDR(item.amount)}</strong>
              <div className="tx-actions">
                <button type="button" aria-label={`Edit ${item.title}`} onClick={() => startEdit(item)} className="edit"><Edit3 size={17} /></button>
                <button type="button" aria-label={`Hapus ${item.title}`} onClick={() => removeTransaction(item)} className="delete"><Trash2 size={17} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
