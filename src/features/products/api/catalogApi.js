import httpClient from '../../../services/httpClient'

/**
 * Catalog resources — Postman "Products & Catalog" §1, §2, §4, §5, §6 (added 2026-10-06).
 * JSON bodies; updates are PUT, deletes are DELETE, exactly as in the collection.
 */
const BASE = '/api/tenant/product'
const data = (request) => request.then((res) => res.data)

/** §1 Item types (kind, service model, capabilities, fulfillment config). Delete is refused while products use it. */
export const itemTypesApi = {
  list: (params) => data(httpClient.get(`${BASE}/item-types`, { params })),
  get: (id) => data(httpClient.get(`${BASE}/item-types/${id}`)),
  create: (payload) => data(httpClient.post(`${BASE}/item-types`, payload)),
  update: (id, payload) => data(httpClient.put(`${BASE}/item-types/${id}`, payload)),
  remove: (id) => data(httpClient.delete(`${BASE}/item-types/${id}`)),
}

/** §2 Units of measure (code, name, type, decimals, status). */
export const unitsApi = {
  list: (params) => data(httpClient.get(`${BASE}/units`, { params })),
  create: (payload) => data(httpClient.post(`${BASE}/units`, payload)),
  update: (id, payload) => data(httpClient.put(`${BASE}/units/${id}`, payload)),
  remove: (id) => data(httpClient.delete(`${BASE}/units/${id}`)),
}

/** §4 Units of one product (alternative units with factor, price, barcode). `unit_id` is never sent on update. */
export const productUnitsApi = {
  list: (productId) => data(httpClient.get(`${BASE}/products/${productId}/units`)),
  add: (productId, payload) => data(httpClient.post(`${BASE}/products/${productId}/units`, payload)),
  update: (productUnitId, payload) => data(httpClient.put(`${BASE}/product-units/${productUnitId}`, payload)),
  remove: (productUnitId) => data(httpClient.delete(`${BASE}/product-units/${productUnitId}`)),
}

/** §5 Attached products/services (included or optional). */
export const productRelationsApi = {
  list: (productId) => data(httpClient.get(`${BASE}/products/${productId}/relations`)),
  add: (productId, payload) => data(httpClient.post(`${BASE}/products/${productId}/relations`, payload)),
  update: (relationId, payload) => data(httpClient.put(`${BASE}/product-relations/${relationId}`, payload)),
  remove: (relationId) => data(httpClient.delete(`${BASE}/product-relations/${relationId}`)),
}

/**
 * §6 Instances: serial numbers, real-estate units, batches with expiry.
 * List filters: product_id, availability_status, status, search, expiring_within, per_page.
 */
export const productInstancesApi = {
  list: (params) => data(httpClient.get(`${BASE}/product-instances`, { params })),
  create: (productId, instances) => data(httpClient.post(`${BASE}/products/${productId}/instances`, { instances })),
  update: (instanceId, payload) => data(httpClient.put(`${BASE}/product-instances/${instanceId}`, payload)),
  void: (instanceId) => data(httpClient.post(`${BASE}/product-instances/${instanceId}/void`)),
  restore: (instanceId) => data(httpClient.post(`${BASE}/product-instances/${instanceId}/restore`)),
}
