/**
 * Maps a failed sign-in request to a translation key under `auth.errors.*`.
 *
 * The old behaviour showed "invalid credentials" for every failure, so a down
 * server, a lost connection or a disabled account all looked like a wrong
 * password. Keep this pure: it is the single place that decides what the user
 * is told, and it is covered by loginError.test.js.
 *
 * @param {unknown} error - Axios error (or anything thrown by the mutation).
 * @returns {{ key: string, retryAfter?: number }}
 */
export function resolveLoginError(error) {
  const response = error?.response

  // No response at all: offline, DNS, CORS, server unreachable, timeout.
  if (!response) {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return { key: 'auth.errors.offline' }
    }
    return { key: 'auth.errors.network' }
  }

  const status = Number(response.status)
  const code = String(response.data?.code || response.data?.error || '').toLowerCase()

  if (code.includes('inactive') || code.includes('disabled') || code.includes('suspended')) {
    return { key: 'auth.errors.accountDisabled' }
  }

  if (code.includes('tenant')) {
    return { key: 'auth.errors.tenantNotFound' }
  }

  switch (status) {
    case 400:
    case 401:
    case 422:
      return { key: 'auth.errors.invalidCredentials' }
    case 403:
      return { key: 'auth.errors.accountDisabled' }
    case 404:
      return { key: 'auth.errors.tenantNotFound' }
    case 423:
      return { key: 'auth.errors.accountLocked' }
    case 429: {
      const retryAfter = Number(response.headers?.['retry-after'])
      return Number.isFinite(retryAfter) && retryAfter > 0
        ? { key: 'auth.errors.tooManyAttemptsWait', retryAfter }
        : { key: 'auth.errors.tooManyAttempts' }
    }
    default:
      if (status >= 500) return { key: 'auth.errors.server' }
      return { key: 'auth.errors.unknown' }
  }
}
