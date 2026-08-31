const IGNORED_SUBDOMAINS = new Set(['www', 'app', 'crm', 'dashboard'])
const DEFAULT_ROOT_DOMAIN = '3s-export.com'

function normalizeTenantValue(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return ''
  return String(value).trim()
}

function normalizeRootDomain(rootDomain = DEFAULT_ROOT_DOMAIN) {
  return String(rootDomain)
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '')
    .toLowerCase()
}

export function resolveTenantFromHostname(hostname = '', rootDomain = DEFAULT_ROOT_DOMAIN) {
  const rawHost =
    hostname ||
    (typeof window !== 'undefined' ? window.location.hostname : '')
  const host = rawHost.split(':')[0].toLowerCase()
  const normalizedRootDomain = normalizeRootDomain(rootDomain)

  if (!host || host === 'localhost' || host === '0.0.0.0' || host.startsWith('127.')) {
    return ''
  }

  if (host === normalizedRootDomain) return ''

  const subdomainPart = host.endsWith(`.${normalizedRootDomain}`)
    ? host.slice(0, -(normalizedRootDomain.length + 1))
    : host
  if (!subdomainPart) return ''

  const parts = subdomainPart.split('.').filter(Boolean)
  if (parts.length < 2 && !host.endsWith(`.${normalizedRootDomain}`)) return ''

  const subdomain = parts[0]
  if (IGNORED_SUBDOMAINS.has(subdomain)) return ''

  return subdomain
}

export function resolveTenantId(user = null, explicitTenantId = '') {
  const candidates = [
    explicitTenantId,
    user?.tenant_id,
    user?.tenantId,
    user?.tenant_slug,
    user?.tenantSlug,
    user?.tenant_key,
    user?.tenantKey,
    user?.tenant?.id,
    user?.tenant?.slug,
    user?.tenant?.key,
    user?.company?.tenant_id,
    user?.company?.tenantId,
    resolveTenantFromHostname(),
  ]

  return candidates.map(normalizeTenantValue).find(Boolean) || ''
}

export function requireTenantId(tenantId) {
  const resolvedTenantId = normalizeTenantValue(tenantId)

  if (!resolvedTenantId) {
    throw new Error('Tenant id is required for this request.')
  }

  return resolvedTenantId
}
