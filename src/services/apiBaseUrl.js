import { resolveTenantFromHostname } from './tenantResolver'

const DEFAULT_API_ROOT_DOMAIN = '3s-export.com'

function trimSlashes(value = '') {
  return String(value).trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '')
}

function normalizeScheme(value = '', fallback = 'https') {
  const scheme = String(value || fallback).trim().replace(/:$/, '')
  return scheme || fallback
}

function getApiScheme() {
  const explicitScheme = import.meta.env.VITE_API_SCHEME?.trim()
  if (explicitScheme) return normalizeScheme(explicitScheme)

  if (typeof window !== 'undefined' && /^https?:$/.test(window.location.protocol)) {
    return normalizeScheme(window.location.protocol)
  }

  return 'https'
}

export function getApiRootDomain() {
  return trimSlashes(import.meta.env.VITE_API_ROOT_DOMAIN || DEFAULT_API_ROOT_DOMAIN)
}

export function resolveTenantServiceBaseURL({
  rootDomain = getApiRootDomain(),
  scheme = getApiScheme(),
  serviceName = 'API',
} = {}) {
  const normalizedRootDomain = trimSlashes(rootDomain)
  const tenantSubdomain = resolveTenantFromHostname(undefined, rootDomain)

  if (!tenantSubdomain) {
    throw new Error(
      `Cannot resolve tenant subdomain for ${serviceName}. Open the app from a tenant subdomain, for example https://{tenant}.${normalizedRootDomain}.`
    )
  }

  return `${normalizeScheme(scheme)}://${tenantSubdomain}.${normalizedRootDomain}`
}

export function resolveApiBaseURL() {
  return resolveTenantServiceBaseURL({
    rootDomain: getApiRootDomain(),
    scheme: getApiScheme(),
    serviceName: 'API',
  })
}

export function resolveHttpClientBaseURL() {
  if (import.meta.env.DEV && import.meta.env.VITE_API_USE_DEV_PROXY === 'true') {
    return ''
  }

  return resolveApiBaseURL()
}
