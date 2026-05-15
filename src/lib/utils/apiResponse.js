export function unwrapApiResponse(response) {
  const payload = response?.data ?? response

  if (payload?.data !== undefined) return payload.data
  if (payload?.user !== undefined) return payload.user
  if (payload?.transaction !== undefined) return payload.transaction
  if (payload?.transactions !== undefined) return payload.transactions
  if (payload?.recommendation !== undefined) return payload.recommendation
  if (payload?.recommendations !== undefined) return payload.recommendations
  if (payload?.category !== undefined) return payload.category
  if (payload?.categories !== undefined) return payload.categories
  if (payload?.summary !== undefined) return payload.summary

  return payload
}
