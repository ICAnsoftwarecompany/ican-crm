export function getResponseEntity(response) {
  return response?.data?.data || response?.data || response || null
}

export function getEntityId(entity) {
  return entity?.id || entity?.proposal_id || entity?.version_id || entity?.option_id || entity?.item_id
}

export function getCustomerName(customer) {
  return customer?.name || customer?.full_name || customer?.lead?.name || `عميل #${customer?.id || '-'}`
}

export function getProposalCustomer(proposal) {
  return proposal?.customer || proposal?.metadata?.customer || {
    id: proposal?.metadata?.customer_id,
    name: proposal?.metadata?.customer_name || proposal?.metadata?.client_name,
    email: proposal?.metadata?.customer_email,
    phone: proposal?.metadata?.customer_phone,
    company: proposal?.metadata?.company,
  }
}

export function formatMoney(value, currency = '') {
  if (value === null || value === undefined || value === '') return '-'
  const numberValue = Number(value)
  if (Number.isNaN(numberValue)) return String(value)
  return `${numberValue.toLocaleString()} ${currency || ''}`.trim()
}

export function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function extractCustomersFromInfinite(queryData) {
  return queryData?.pages?.flatMap((page) => page?.data || []) || []
}
