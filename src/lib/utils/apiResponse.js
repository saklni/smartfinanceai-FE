export function unwrapApiResponse(response) {
  
  const payload = response?.data ?? response

  
  if (payload?.data !== undefined) return payload.data

  
  return payload
}
