/** Laravel-style pagination envelope used by every list mock. */
export function paginate(items, query = {}) {
  const perPage = Math.min(Math.max(Number(query.per_page) || 20, 1), 100)
  const total = items.length
  const lastPage = Math.max(Math.ceil(total / perPage), 1)
  const page = Math.min(Math.max(Number(query.page) || 1, 1), lastPage)
  const start = (page - 1) * perPage
  return {
    data: items.slice(start, start + perPage),
    meta: { current_page: page, per_page: perPage, total, last_page: lastPage },
  }
}

export function matchesSearch(values, search) {
  const needle = String(search || '').trim().toLowerCase()
  if (!needle) return true
  return values.some((value) => String(value ?? '').toLowerCase().includes(needle))
}

export function nowIso() {
  return new Date().toISOString()
}
