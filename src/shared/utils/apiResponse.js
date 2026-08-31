export function extractList(response, keys = []) {
  if (Array.isArray(response)) return response

  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key]
  }

  const fallbackKeys = ['data', 'items', 'results', 'records', 'customers', 'leads', 'teams', 'users']

  for (const key of fallbackKeys) {
    if (Array.isArray(response?.[key])) return response[key]
  }

  // Laravel-style pagination wrapper: { success, data: { data: [...], current_page, ... } }
  for (const key of fallbackKeys) {
    const nested = response?.[key]
    if (nested && !Array.isArray(nested) && Array.isArray(nested.data)) return nested.data
  }

  return []
}


export function extractMessage(error, fallback = 'حدث خطأ أثناء تنفيذ الطلب') {
  return error?.response?.data?.message || error?.message || fallback
}

export function displayValue(value, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
