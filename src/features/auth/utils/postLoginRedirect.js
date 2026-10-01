const LOGIN_PATH = '/login'

/**
 * Where to send the user after a successful sign-in.
 *
 * PrivateRoute redirects to /login with `state.from` = the location the user
 * was trying to open (a lead link, a conversation…). We send them back there
 * instead of always landing on the dashboard.
 *
 * Only same-app paths are accepted: never an absolute URL (open redirect) and
 * never /login itself (redirect loop).
 *
 * @param {unknown} state - react-router `location.state` of the login page.
 * @returns {string}
 */
export function resolvePostLoginPath(state) {
  const from = state?.from
  if (!from || typeof from !== 'object') return '/'

  const pathname = typeof from.pathname === 'string' ? from.pathname : ''
  if (!pathname.startsWith('/') || pathname.startsWith('//')) return '/'
  if (pathname === LOGIN_PATH || pathname.startsWith(`${LOGIN_PATH}/`)) return '/'

  const search = typeof from.search === 'string' ? from.search : ''
  const hash = typeof from.hash === 'string' ? from.hash : ''
  return `${pathname}${search}${hash}`
}
