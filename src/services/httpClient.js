import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { resolveHttpClientBaseURL } from './apiBaseUrl'

const apiBaseURL = resolveHttpClientBaseURL()
const apiPassword = import.meta.env.VITE_API_PASSWORD?.trim()

if (!apiPassword) {
  throw new Error('Missing VITE_API_PASSWORD. Add it to .env and restart the Vite dev server.')
}

const httpClient = axios.create({
  baseURL: apiBaseURL,
})


httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token

  config.headers = config.headers || {}

  config.headers.Accept = 'application/json'
  config.headers['ngrok-skip-browser-warning'] = 'true'

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  const params =
    config.params instanceof URLSearchParams
      ? Object.fromEntries(config.params.entries())
      : { ...(config.params || {}) }

  config.params = {
    ...params,
    api_password: params.api_password || apiPassword,
  }

  return config
})

httpClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const authState = useAuthStore.getState()
      const isAlreadyRefreshing = authState.sessionRefreshNeeded
      const shouldSkipSessionRefresh = error.config?.skipSessionRefresh

      if (!isAlreadyRefreshing && !shouldSkipSessionRefresh) {
        authState.setSessionRefreshNeeded(true)
        window.dispatchEvent(new CustomEvent('ican:session-expired'))
      }
    }

    return Promise.reject(error)
  }
)

export default httpClient
