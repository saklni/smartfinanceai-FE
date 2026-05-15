import { axiosClient } from './axiosClient'
import { unwrapApiResponse } from '../utils/apiResponse'
import { normalizeTransaction, toApiTransactionPayload } from '../utils/financeAdapters'

export async function getTransactions() {
  const response = await axiosClient.get('/transactions')
  const data = unwrapApiResponse(response)
  return Array.isArray(data) ? data.map(normalizeTransaction) : []
}

export async function createTransaction(payload) {
  const response = await axiosClient.post('/transactions', toApiTransactionPayload(payload))
  return normalizeTransaction(unwrapApiResponse(response))
}

export async function updateTransaction(id, payload) {
  const response = await axiosClient.put(`/transactions/${id}`, toApiTransactionPayload(payload))
  return normalizeTransaction(unwrapApiResponse(response))
}

export async function deleteTransaction(id) {
  const response = await axiosClient.delete(`/transactions/${id}`)
  return unwrapApiResponse(response) || { id }
}
