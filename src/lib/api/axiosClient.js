import axios from 'axios'
import { env } from '../../config/env'
import { STORAGE_KEYS } from '../utils/storageKeys'

export const axiosClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.accessToken)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.accessToken)
      window.dispatchEvent(new CustomEvent('smartfinance:session-expired'))
    }

    const message = error.response?.data?.message || error.message || 'Terjadi kesalahan koneksi API'
    return Promise.reject(new Error(message))
  },
)
