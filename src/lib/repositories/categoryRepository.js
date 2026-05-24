/**
 * categoryRepository.js (v2-fixed)
 *
 * PERUBAHAN v2:
 *   - Tambah useLiveCategories() hook — sumber kebenaran tunggal untuk kategori
 *   - Komponen tidak perlu lagi lookup ke static categoryOptions
 *   - Cache di-share via module-level variable (ringan, cukup untuk 1 sesi)
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import * as categoryApi from '../api/categoryApi'

// Module-level cache agar tidak re-fetch setiap mount komponen
let _categoriesCache = null
let _fetchPromise    = null

export const categoryRepository = {
  async getCategories() {
    if (_categoriesCache) return _categoriesCache

    // Deduplicate concurrent calls
    if (!_fetchPromise) {
      _fetchPromise = categoryApi.getCategories().then((data) => {
        _categoriesCache = data
        _fetchPromise    = null
        return data
      }).catch((err) => {
        _fetchPromise = null
        throw err
      })
    }

    return _fetchPromise
  },

  async createCategory(payload) {
    const created = await categoryApi.createCategory(payload)
    // Invalidate cache saat ada kategori baru
    _categoriesCache = null
    return created
  },

  /** Hapus cache paksa (berguna setelah migrasi kategori) */
  clearCache() {
    _categoriesCache = null
    _fetchPromise    = null
  },
}

/**
 * Hook untuk menggunakan kategori live dari API.
 * Menggantikan import static categoryOptions dari financeAdapters.
 *
 * @returns {{ categories, expenseCategories, incomeCategories, loading, error }}
 */
export function useLiveCategories() {
  const [categories,       setCategories]       = useState([])
  const [loading,          setLoading]          = useState(true)
  const [error,            setError]            = useState('')
  const mountedRef = useRef(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await categoryRepository.getCategories()
      if (mountedRef.current) setCategories(data)
    } catch (err) {
      if (mountedRef.current) setError(err.message || 'Gagal memuat kategori')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    load()
    return () => { mountedRef.current = false }
  }, [load])

  const expenseCategories = categories.filter((c) => c.type === 'expense')
  const incomeCategories  = categories.filter((c) => c.type === 'income')

  return { categories, expenseCategories, incomeCategories, loading, error }
}
