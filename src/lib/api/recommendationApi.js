import { axiosClient } from './axiosClient'
import { unwrapApiResponse } from '../utils/apiResponse'
import { normalizeRecommendation } from '../utils/financeAdapters'

export async function getRecommendations() {
  const response = await axiosClient.get('/recommendations')
  const data     = unwrapApiResponse(response)

  if (!Array.isArray(data)) {
    console.warn('[recommendationApi] Response bukan array:', data)
    return []
  }

  return data.map(normalizeRecommendation)
}
