export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  otpLength: Number(import.meta.env.VITE_OTP_LENGTH || 6),
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
}
