import { axiosClient } from './axiosClient'
import { unwrapApiResponse } from '../utils/apiResponse'
import { normalizeUser, toApiProfilePayload } from '../utils/financeAdapters'

export async function login(payload) {
  const response = await axiosClient.post('/auth/login', payload)
  return unwrapApiResponse(response)
}

export async function register(payload) {
  const response = await axiosClient.post('/auth/register', payload)
  return unwrapApiResponse(response)
}

export async function loginWithGoogle(credential) {
  const response = await axiosClient.post('/auth/google', { credential })
  return unwrapApiResponse(response)
}

export async function getProfile() {
  const response = await axiosClient.get('/auth/me')
  return normalizeUser(unwrapApiResponse(response))
}

export async function updateProfile(payload) {
  const response = await axiosClient.put('/auth/me', toApiProfilePayload(payload))
  return normalizeUser(unwrapApiResponse(response))
}

export async function changePassword(payload) {
  const response = await axiosClient.put('/auth/me/password', payload)
  return unwrapApiResponse(response)
}
