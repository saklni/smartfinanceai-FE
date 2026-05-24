/**
 * recommendationApi.js (v2-fixed)
 *
 * PERUBAHAN v2:
 *   - Tidak lagi melakukan .map(normalizeRecommendation) di sini langsung.
 *     Response dari backend v2 sudah berupa array yang siap di-normalize.
 *   - Guard: jika response bukan array (misal null/object), kembalikan [].
 *   - normalizeRecommendation sekarang handle format AI dan rule-based.
 */

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
