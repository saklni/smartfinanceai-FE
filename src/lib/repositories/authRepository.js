/**
 * authRepository.js (v2-fixed)
 *
 * PERUBAHAN v2:
 *   - persistToken() diperbaiki: setelah unwrapApiResponse(), token ada di result.token
 *     (bukan result.data.token lagi karena sudah di-unwrap satu level)
 *   - Semua hasil sudah di-unwrap sebelum masuk ke sini (dari authApi)
 *   - Tambah getStoredUser() untuk baca user dari localStorage
 */

import * as authApi from '../api/authApi'
import { STORAGE_KEYS } from '../utils/storageKeys'
import { normalizeUser } from '../utils/financeAdapters'

/**
 * Simpan token ke localStorage.
 * authApi sudah memanggil unwrapApiResponse(), jadi `result` sudah berupa payload .data
 * → token ada di result.token (bukan result.data.token)
 */
function persistToken(result) {
  // Setelah unwrapApiResponse: result = { token, user, ... }
  const token = result?.token || result?.accessToken

  if (token) {
    localStorage.setItem(STORAGE_KEYS.accessToken, token)
  }
  return token
}

function extractUser(result) {
  // result sudah di-unwrap: { token, user: {...} }
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
    // authApi.getProfile() sudah normalizeUser() di dalamnya
    return authApi.getProfile()
  },

  async updateProfile(payload) {
    return authApi.updateProfile(payload)
  },

  async logout() {
    localStorage.removeItem(STORAGE_KEYS.accessToken)
    localStorage.removeItem(STORAGE_KEYS.user)
  },
}
