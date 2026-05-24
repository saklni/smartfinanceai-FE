/**
 * apiResponse.js (v2-fixed)
 *
 * PERUBAHAN v2:
 *   unwrapApiResponse() tidak lagi check field `summary` secara agresif,
 *   karena bisa drop field lain dalam satu response object analytics.
 *   Sekarang hanya unwrap envelope standar { success, data }.
 */

/**
 * Unwrap respons dari backend Express.
 * Backend selalu mengembalikan: { success: true, message, data: <payload> }
 *
 * Fungsi ini mengambil payload dari .data satu level saja,
 * tidak mencoba tebak-tebak field spesifik (user/summary/dll)
 * agar tidak silently drop data saat response shape berubah.
 */
export function unwrapApiResponse(response) {
  // Axios wraps di response.data
  const payload = response?.data ?? response

  // Envelope standar backend: { success, message, data }
  if (payload?.data !== undefined) return payload.data

  // Fallback: kembalikan payload apa adanya
  return payload
}
