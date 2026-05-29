import { useCallback, useEffect, useRef, useState } from 'react'
import * as categoryApi from '../api/categoryApi'

let _categoriesCache = null
let _fetchPromise    = null

export const categoryRepository = {
  async getCategories() {
    if (_categoriesCache) return _categoriesCache

    
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
    
    _categoriesCache = null
    return created
  },

  
  clearCache() {
    _categoriesCache = null
    _fetchPromise    = null
  },
}

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
