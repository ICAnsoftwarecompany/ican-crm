export function toFormData(payload = {}) {
  if (payload instanceof FormData) {
    return payload
  }

  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return
    }

    const isFile = typeof File !== 'undefined' && value instanceof File

    if (Array.isArray(value) || (typeof value === 'object' && !isFile)) {
      formData.append(key, JSON.stringify(value))
      return
    }

    formData.append(key, value)
  })

  return formData
}


export function withTenant(path, tenant) {
  return path.replace('{tenant}', encodeURIComponent(tenant))
}
