import { axiosClient } from './axiosClient'
import { unwrapApiResponse } from '../utils/apiResponse'
import { normalizeCategory } from '../utils/financeAdapters'

export async function getCategories() {
  const response = await axiosClient.get('/categories')
  const data = unwrapApiResponse(response)
  return Array.isArray(data) ? data.map(normalizeCategory) : []
}

export async function createCategory(payload) {
  const response = await axiosClient.post('/categories', payload)
  return normalizeCategory(unwrapApiResponse(response))
}
