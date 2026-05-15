import { axiosClient } from './axiosClient'
import { unwrapApiResponse } from '../utils/apiResponse'

export async function getSummary() {
  const response = await axiosClient.get('/analytics/summary')
  return unwrapApiResponse(response)
}

export async function getCategoryData() {
  const response = await axiosClient.get('/analytics/categories')
  return unwrapApiResponse(response)
}

export async function getTrendData() {
  const response = await axiosClient.get('/analytics/trend')
  return unwrapApiResponse(response)
}
