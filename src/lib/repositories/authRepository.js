import * as authApi from '../api/authApi'
import { STORAGE_KEYS } from '../utils/storageKeys'
import { normalizeUser } from '../utils/financeAdapters'

function persistToken(result) {
  const token = result?.token || result?.accessToken
  if (token) {
    localStorage.setItem(STORAGE_KEYS.accessToken, token)
  }
  return token
}

function extractUser(result) {
  return normalizeUser(result?.user || result)
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
    persistToken(result)
    return extractUser(result)
  },

  async loginWithGoogle(credential) {
    const result = await authApi.loginWithGoogle(credential)
    persistToken(result)
    return extractUser(result)
  },

  async getProfile() {
    return authApi.getProfile()
  },

  async updateProfile(payload) {
    return authApi.updateProfile(payload)
  },

  async changePassword(payload) {
    return authApi.changePassword(payload)
  },

  async logout() {
    localStorage.removeItem(STORAGE_KEYS.accessToken)
    localStorage.removeItem(STORAGE_KEYS.user)
  },
}
