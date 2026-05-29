import { useCallback, useEffect, useRef, useState } from 'react'
import * as recommendationApi from '../api/recommendationApi'

export const recommendationRepository = {
  async getRecommendations() {
    return recommendationApi.getRecommendations()
  },
}

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState([])
  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState('')
  const mountedRef = useRef(true)

  
  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await recommendationRepository.getRecommendations()
      
      if (mountedRef.current) setRecommendations(Array.isArray(data) ? data : [])
    } catch (err) {
      if (mountedRef.current) setError(err.message || 'Gagal memuat rekomendasi')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    load()
    return () => { mountedRef.current = false }
  }, [load])

  
  const aiCard = recommendations.find((r) => r.recommendation_type === 'ai_classification')
  const aiLabel = aiCard?.label || null
  const aiConfidence = aiCard?.confidence || null

  return { recommendations, aiLabel, aiConfidence, loading, error, reload: load }
}
