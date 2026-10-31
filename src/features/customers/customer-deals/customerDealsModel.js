export function customerDealsPath(customerId, dealId) {
  const path = `/customers/${encodeURIComponent(customerId)}/deals`
  return dealId == null ? path : `${path}?deal=${encodeURIComponent(dealId)}`
}

export function normalizeCustomerDeals(response) {
  const data = response?.data ?? {}
  return {
    customer: data.customer ?? {},
    summary: data.summary ?? {},
    deals: Array.isArray(data.deals) ? data.deals : [],
  }
}
