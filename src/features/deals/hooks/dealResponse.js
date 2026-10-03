import { extractList } from '../../../shared/utils/apiResponse'

/** List from any of the backend's wrappers (`data`, `data.data`, `{ success, data }`, plain array). */
export function unwrapList(response, keys = []) {
  const list = extractList(response, keys)
  if (list.length) return list
  const nested = response?.data
  if (nested && !Array.isArray(nested)) return extractList(nested, keys)
  return []
}

/** One entity from `{ data: {...} }`, `{ data: { deal: {...} } }` or the object itself. */
export function unwrapEntity(response, key) {
  if (!response) return null
  const data = response.data !== undefined ? response.data : response
  if (key && data && typeof data === 'object' && data[key] && typeof data[key] === 'object') return data[key]
  if (data && typeof data === 'object' && !Array.isArray(data) && data.data && typeof data.data === 'object' && !Array.isArray(data.data)) return data.data
  return data && typeof data === 'object' && !Array.isArray(data) ? data : null
}
