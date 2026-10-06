/**
 * Request builders for the Products & Catalog API (Postman collection "Products & Catalog", 2026-10-06).
 *
 * - Create products: `POST /api/tenant/product/create` as multipart, one `products[i][field]` per field, alternative
 *   units as `products[i][units][j][field]`, JSON fields (`capability_values`, `fulfillment_config`, `data`) as JSON
 *   strings, booleans as 1/0 (Laravel's `boolean` rule rejects the strings "true"/"false").
 * - Update product: `POST /api/tenant/product/update/{id}` as multipart with flat field names.
 * Empty values (undefined, null, '') are never sent, so a field left blank keeps its server value.
 */

const JSON_FIELDS = new Set(['capability_values', 'fulfillment_config', 'data'])

const isFile = (value) => (typeof File !== 'undefined' && value instanceof File) || (typeof Blob !== 'undefined' && value instanceof Blob)

const isEmpty = (value) => value === undefined || value === null || value === ''

export function toBoolFlag(value) {
  if (value === true || value === 1 || value === '1' || value === 'true') return '1'
  return '0'
}

function isEmptyObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) && !isFile(value) && Object.keys(value).length === 0
}

function serialize(key, value) {
  if (typeof value === 'boolean') return toBoolFlag(value)
  if (JSON_FIELDS.has(key) && typeof value === 'object' && !isFile(value)) return JSON.stringify(value)
  if (Array.isArray(value) || (typeof value === 'object' && !isFile(value))) return JSON.stringify(value)
  return value
}

function appendField(formData, name, key, value) {
  if (isEmpty(value) || isEmptyObject(value)) return
  formData.append(name, serialize(key, value))
}

const PRODUCT_FIELDS = [
  'name', 'price', 'kind', 'item_type_id', 'category_id', 'description', 'is_stock_tracked', 'stock_quantity',
  'capability_values', 'fulfillment_config', 'data', 'status', 'image',
]
const UNIT_FIELDS = ['unit_id', 'factor', 'price', 'barcode', 'is_default']

/** Multipart body for `POST /tenant/product/create` (accepts one product or an array). */
export function buildProductsFormData(products = []) {
  const list = Array.isArray(products) ? products : [products]
  const formData = new FormData()

  list.forEach((product, index) => {
    PRODUCT_FIELDS.forEach((key) => appendField(formData, `products[${index}][${key}]`, key, product?.[key]))
    const units = Array.isArray(product?.units) ? product.units.filter((unit) => !isEmpty(unit?.unit_id)) : []
    units.forEach((unit, unitIndex) => {
      UNIT_FIELDS.forEach((key) => appendField(formData, `products[${index}][units][${unitIndex}][${key}]`, key, unit[key]))
    })
  })

  return formData
}

const UPDATE_FIELDS = PRODUCT_FIELDS.filter((key) => key !== 'kind')

/** Multipart body for `POST /tenant/product/update/{id}`. `kind` and the base unit never change after creation. */
export function buildProductUpdateFormData(payload = {}) {
  const formData = new FormData()
  UPDATE_FIELDS.forEach((key) => appendField(formData, key, key, payload[key]))
  return formData
}

/** Drops empty keys from a JSON body (`'' | null | undefined`), keeping `false` and `0`. */
export function compactBody(body = {}) {
  return Object.fromEntries(Object.entries(body).filter(([, value]) => !isEmpty(value)))
}

/** `id` from a create response: `{ data: { id } }`, `{ data: [{ id }] }`, `{ id }`. */
export function getCreatedId(response) {
  const data = response?.data ?? response
  if (Array.isArray(data)) return data[0]?.id ?? null
  if (Array.isArray(data?.data)) return data.data[0]?.id ?? null
  return data?.id ?? data?.data?.id ?? null
}
