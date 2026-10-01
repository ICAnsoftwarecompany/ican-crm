import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { resolvePostLoginPath } from '../utils/postLoginRedirect'

const LAST_LOGIN_KEY = 'ican-last-login'

/** Last username used on this browser (not a secret) — prefills biometric/PIN sign-in. */
export function readLastLogin() {
  try {
    return window.localStorage.getItem(LAST_LOGIN_KEY) || ''
  } catch {
    return ''
  }
}

function rememberLastLogin(login) {
  try {
    if (login) window.localStorage.setItem(LAST_LOGIN_KEY, login)
  } catch {
    // Private mode / blocked storage: prefill is a convenience only.
  }
}

/**
 * Shared success path for every sign-in method: store the session, remember
 * the username, and go back to the page the user originally asked for.
 */
export function useCompleteSignIn() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useCallback(
    (data, login) => {
      setAuth(data.token, data.user || { login: data.login || login })
      rememberLastLogin(login || data.user?.username || data.user?.email)
      navigate(resolvePostLoginPath(location.state), { replace: true })
    },
    [location.state, navigate, setAuth]
  )
}
