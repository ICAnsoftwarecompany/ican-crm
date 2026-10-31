export function normalizeDealProduct(row = {}) {
  const product = row.product || row
  const details = row.details && typeof row.details === 'object' && !Array.isArray(row.details) ? row.details : {}
  return { ...product, id: row.product_id ?? product.id, linkId: row.product ? row.id : null, dealId: row.deal_id, details, name: product.name || product.title || '', catalogPrice: product.price ?? null, price: details.unit_price ?? product.price ?? row.price ?? null }
}

export function buildDealProductsPayload(ids, details = {}) {
  return { products: [...new Set(ids.map(String))].map((id) => ({ product_id: Number(id), details: { ...(details[id] || {}) } })) }
}

export function validProductDetails(details = {}) {
  return ['quantity', 'unit_price', 'discount'].every((key) => details[key] == null || details[key] === '' || (Number.isFinite(Number(details[key])) && Number(details[key]) >= 0))
}
