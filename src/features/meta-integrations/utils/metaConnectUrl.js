function trimSlashes(value = '') {
  return String(value || '').trim().replace(/^\/+|\/+$/g, '')
}

// Facebook's connect-link endpoint returns a path (already containing the
// tenant, e.g. /api/facebook/connect/{tenant}/{token}) relative to the main
// root domain — NOT the tenant subdomain — so it must be opened against
// VITE_API_ROOT_DOMAIN directly, with no subdomain prefixed.
export function resolveMetaConnectUrl(link = '') {
  const value = String(link || '').trim()
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value

  const rootDomain = trimSlashes(import.meta.env.VITE_API_ROOT_DOMAIN || '3s-export.com').replace(/^https?:\/\//i, '')
  const scheme = String(import.meta.env.VITE_API_SCHEME || 'https').replace(/:$/, '')

  if (!rootDomain) return value

  return `${scheme}://${rootDomain}/${trimSlashes(value)}`
}

export function extractMetaConnectLink(response) {
  const payload = response?.data ?? response
  return (
    payload?.facebook_connect_url
    || payload?.link
    || payload?.url
    || payload?.redirect_url
    || payload?.connect_link
    || payload?.data?.facebook_connect_url
    || payload?.data?.link
    || payload?.data?.url
    || ''
  )
}
