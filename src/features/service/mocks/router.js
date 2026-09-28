/**
 * Minimal route matcher for mock handlers.
 * Patterns use `:param` segments: `/api/tenant/service/cases/:caseId`.
 */

function toSegments(path) {
  return path.split('?')[0].replace(/\/+$/, '').split('/').filter(Boolean)
}

/**
 * Accepts absolute URLs, baseURL-relative paths and paths without a leading slash.
 * @param {string} url
 */
export function normalizePath(url = '') {
  let path = url
  try {
    if (/^https?:\/\//i.test(url)) path = new URL(url).pathname
  } catch {
    path = url
  }
  path = path.split('?')[0]
  return path.startsWith('/') ? path : `/${path}`
}

/**
 * @param {string} pattern
 * @param {string} path
 * @returns {Record<string, string> | null}
 */
export function matchPath(pattern, path) {
  const patternSegments = toSegments(pattern)
  const pathSegments = toSegments(path)
  if (patternSegments.length !== pathSegments.length) return null

  const params = {}
  for (let index = 0; index < patternSegments.length; index += 1) {
    const expected = patternSegments[index]
    const actual = pathSegments[index]
    if (expected.startsWith(':')) {
      params[expected.slice(1)] = decodeURIComponent(actual)
    } else if (expected !== actual) {
      return null
    }
  }
  return params
}

/**
 * @typedef {Object} MockRoute
 * @property {string} method - GET | POST | PUT | PATCH | DELETE
 * @property {string} path
 * @property {(request: MockRequest) => unknown | Promise<unknown>} handler
 *
 * @typedef {Object} MockRequest
 * @property {Record<string, string>} params
 * @property {Record<string, unknown>} query
 * @property {unknown} body
 */

/**
 * @param {MockRoute[]} routes
 * @param {string} method
 * @param {string} url
 */
export function findRoute(routes, method, url) {
  const path = normalizePath(url)
  const upperMethod = method.toUpperCase()
  for (const route of routes) {
    if (route.method !== upperMethod) continue
    const params = matchPath(route.path, path)
    if (params) return { route, params }
  }
  return null
}
