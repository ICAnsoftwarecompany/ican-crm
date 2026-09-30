import axios from 'axios'
import { resolveHttpClientBaseURL } from './apiBaseUrl'

/**
 * HTTP transport for the customer portal app. Separate from `httpClient` on purpose: it never reads the staff
 * auth store or sends a staff token. The portal token comes from the portal's own session store (`getToken`).
 * Tenant resolution is the same (subdomain); `api_password` is the tenant API gate, public by nature (VITE_*).
 */
export function createPortalHttpClient({ getToken, onUnauthorized } = {}) {
  const client = axios.create({ baseURL: resolveHttpClientBaseURL() })
  const apiPassword = import.meta.env.VITE_API_PASSWORD?.trim()

  client.interceptors.request.use((config) => {
    config.headers = config.headers || {}
    config.headers.Accept = 'application/json'
    const token = getToken?.()
    if (token) config.headers.Authorization = `Bearer ${token}`
    if (apiPassword) {
      const params = config.params instanceof URLSearchParams ? Object.fromEntries(config.params.entries()) : { ...(config.params || {}) }
      config.params = { ...params, api_password: params.api_password || apiPassword }
    }
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) onUnauthorized?.(error)
      return Promise.reject(error)
    }
  )
  return client
}
