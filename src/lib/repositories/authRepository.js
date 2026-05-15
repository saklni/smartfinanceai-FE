import * as authApi from '../api/authApi'
import { STORAGE_KEYS } from '../utils/storageKeys'
import { normalizeUser } from '../utils/financeAdapters'

function persistToken(result) {
  const token =
    result?.token ||
    result?.accessToken ||
    result?.data?.token ||
    result?.data?.accessToken

  if (token) {
    localStorage.setItem(STORAGE_KEYS.accessToken, token)
  }

  return token
}

function extractUser(result) {
  return normalizeUser(result?.user || result?.data?.user || result?.data || result)
}

export const authRepository = {
  isAuthenticated() {
    return Boolean(localStorage.getItem(STORAGE_KEYS.accessToken))
  },

  async login(payload) {
    const result = await authApi.login(payload)
    persistToken(result)
    return extractUser(result)
  },

  async register(payload) {
    const result = await authApi.register(payload)
    return {
      ...result,
      user: extractUser(result),
      requiresOtp: result?.requiresOtp ?? result?.requires_otp ?? true,
    }
  },

  async loginWithGoogle(credential) {
    const result = await authApi.loginWithGoogle(credential)
    persistToken(result)
    return extractUser(result)
  },

  async verifyOtp(payload) {
    const result = await authApi.verifyOtp(payload)
    persistToken(result)
    return extractUser(result)
  },

  async resendOtp(payload) {
    return authApi.resendOtp(payload)
  },

  async getProfile() {
    return authApi.getProfile()
  },

  async updateProfile(payload) {
    return authApi.updateProfile(payload)
  },

  async logout() {
    localStorage.removeItem(STORAGE_KEYS.accessToken)
  },
}
