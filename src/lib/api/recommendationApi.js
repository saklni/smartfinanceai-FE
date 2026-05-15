import { axiosClient } from './axiosClient'
import { unwrapApiResponse } from '../utils/apiResponse'
import { normalizeRecommendation } from '../utils/financeAdapters'

export async function getRecommendations() {
  const response = await axiosClient.get('/recommendations')
  const data = unwrapApiResponse(response)
  return Array.isArray(data) ? data.map(normalizeRecommendation) : []
}
