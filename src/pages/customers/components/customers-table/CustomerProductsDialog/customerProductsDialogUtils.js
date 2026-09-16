import { parseMarketingData } from '../customerMarketingUtils'

export function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatDataItems(items = []) {
  return items
    .flatMap((item) => Object.entries(item || {}).map(([key, value]) => ({ key, value })))
    .filter((item) => item.key)
}

export function getProductDate(product) {
  return (
    product?.linkRaw?.created_at ||
    product?.linkRaw?.updated_at ||
    product?.raw?.created_at ||
    product?.raw?.updated_at ||
    product?.created_at ||
    product?.updated_at ||
    ''
  )
}

export function getCustomerLead(row) {
  return row?.lead || row?.customer?.lead || {}
}

export function getCustomerName(row) {
  return getCustomerLead(row)?.name || row?.name || row?.customer?.name || ''
}

export function normalizeProduct(product = {}, sourceKind = 'catalog') {
  const raw = product?.raw || product
  const linkRaw = product?.linkRaw || {}
  const productId = product?.productId || product?.product_id || raw?.product_id || raw?.id || product?.id || ''
  const data = product?.data || raw?.data || linkRaw?.data || null

  return {
    id: product?.id || productId || `${sourceKind}-${raw?.name || Math.random()}`,
    productId,
    sourceKind: product?.sourceKind || sourceKind,
    name: product?.name || raw?.name || '',
    code: product?.code || raw?.code || '',
    description: product?.description || product?.desc || raw?.desc || raw?.description || '',
    image: product?.image || raw?.image || '',
    price: product?.price || raw?.price || '',
    status: product?.status ?? raw?.status ?? '',
    note: product?.note || product?.notes || linkRaw?.note || linkRaw?.notes || '',
    interestLevel: product?.interestLevel || product?.interest_level || linkRaw?.interest_level || '',
    isMain: Boolean(product?.isMain || Number(product?.is_main || linkRaw?.is_main || 0) === 1),
    categoryName: raw?.categroy?.name || raw?.category?.name || '',
    categoryType: raw?.categroy?.type || raw?.category?.type || '',
    data,
    dataItems: product?.dataItems?.length ? product.dataItems : parseMarketingData(data),
    raw,
    linkRaw,
  }
}

export function getProductIdentity(product = {}) {
  return String(product?.productId || product?.product_id || product?.raw?.id || product?.id || '').trim()
}

export function isActiveProduct(product = {}) {
  const rawStatus = product?.status ?? product?.raw?.status
  return Number(rawStatus) === 1 || String(rawStatus).trim() === '1'
}

export function splitProductsByInterest(allProducts = [], interestedProducts = []) {
  const interested = interestedProducts.map((product) => normalizeProduct(product, product?.sourceKind || 'interested'))
  const interestedIds = new Set(interested.map(getProductIdentity).filter(Boolean))
  const available = allProducts
    .map((product) => normalizeProduct(product, 'catalog'))
    .filter(isActiveProduct)
    .filter((product) => {
      const identity = getProductIdentity(product)
      return !identity || !interestedIds.has(identity)
    })

  return { interested, available }
}
