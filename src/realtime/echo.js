import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { useAuthStore } from '../store/authStore'
import { getApiRootDomain, resolveApiBaseURL, resolveTenantServiceBaseURL } from '../services/apiBaseUrl'

let echoInstance = null
let debugBound = false

function maskValue(value = '') {
  const text = String(value || '')
  if (!text) return ''
  if (text.length <= 6) return '***'
  return `${text.slice(0, 3)}***${text.slice(-3)}`
}

function maskUrl(value = '') {
  if (!value) return ''

  try {
    const url = new URL(value)
    if (url.searchParams.has('api_password')) {
      url.searchParams.set('api_password', maskValue(url.searchParams.get('api_password')))
    }
    return url.toString()
  } catch {
    return value
  }
}

function isRealtimeEnabled() {
  return import.meta.env.VITE_REALTIME_ENABLED === 'true'
}

function trimTrailingSlash(value = '') {
  return String(value).replace(/\/+$/, '')
}

function getToken() {
  return useAuthStore.getState().token
}

function normalizeReverbPort(value) {
  const port = String(value || '').trim()
  if (!port) return ''
  return /^\d+$/.test(port) ? port : ''
}

function getWsUrl() {
  const explicitUrl = import.meta.env.VITE_REVERB_URL?.trim()
  if (explicitUrl) {
    try {
      return new URL(explicitUrl)
    } catch {
      return null
    }
  }

  if (typeof window === 'undefined') return null

  try {
    const host = import.meta.env.VITE_REVERB_HOST?.trim()
    const rootDomain = import.meta.env.VITE_REVERB_ROOT_DOMAIN || getApiRootDomain()
    const scheme =
      import.meta.env.VITE_REVERB_SCHEME ||
      (window.location.protocol === 'https:' ? 'wss' : 'ws')
    const port = normalizeReverbPort(import.meta.env.VITE_REVERB_PORT)
    const url = new URL(host
      ? `${scheme}://${host}`
      : resolveTenantServiceBaseURL({
          rootDomain,
          scheme,
          serviceName: 'Reverb',
        })
    )

    if (port) {
      url.port = port
    }

    return url
  } catch (error) {
    console.warn('Reverb URL could not be resolved:', error)
    return null
  }
}

function getAuthEndpoint() {
  const apiBaseUrl = trimTrailingSlash(resolveApiBaseURL())
  const apiPassword = import.meta.env.VITE_API_PASSWORD?.trim()
  const endpoint = new URL(`${apiBaseUrl}/broadcasting/auth`)

  if (apiPassword) {
    endpoint.searchParams.set('api_password', apiPassword)
  }

  return endpoint.toString()
}

export function isRealtimeConfigured() {
  return Boolean(isRealtimeEnabled() && import.meta.env.VITE_REVERB_APP_KEY && getWsUrl())
}

export function getEcho() {
  if (typeof window === 'undefined') return null
  if (!isRealtimeConfigured()) {
    console.warn('[Realtime diagnostic] Echo disabled or incomplete config', {
      enabled: import.meta.env.VITE_REALTIME_ENABLED,
      hasAppKey: Boolean(import.meta.env.VITE_REVERB_APP_KEY),
      wsUrl: getWsUrl()?.toString() || null,
    })
    return null
  }
  if (echoInstance) return echoInstance

  window.Pusher = Pusher
  Pusher.logToConsole = true

  const wsUrl = getWsUrl()
  const isSecure = wsUrl.protocol === 'https:' || wsUrl.protocol === 'wss:'
  const port = Number(wsUrl.port || (isSecure ? 443 : 80))
  const transport = isSecure ? 'wss' : 'ws'
  const enabledTransports = ['ws', 'wss']
  const authEndpoint = getAuthEndpoint()

  console.groupCollapsed('[Realtime diagnostic] Echo bootstrap')
  console.table({
    enabled: import.meta.env.VITE_REALTIME_ENABLED,
    host: import.meta.env.VITE_REVERB_HOST,
    port: import.meta.env.VITE_REVERB_PORT,
    scheme: import.meta.env.VITE_REVERB_SCHEME,
    explicitUrl: import.meta.env.VITE_REVERB_URL || '',
    wsUrl: wsUrl?.toString(),
    resolvedWsHost: wsUrl.hostname,
    resolvedWsPort: port,
    transport,
    enabledTransports: enabledTransports.join(', '),
    secure: isSecure,
    authEndpoint: maskUrl(authEndpoint),
    hasToken: Boolean(getToken()),
    appKey: maskValue(import.meta.env.VITE_REVERB_APP_KEY),
  })
  console.info('[Realtime diagnostic] Expected WebSocket URL pattern:', `${transport}://${wsUrl.hostname}:${port}/app/${maskValue(import.meta.env.VITE_REVERB_APP_KEY)}?...`)
  console.groupEnd()

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: wsUrl.hostname,
    wsPort: port,
    wssPort: port,
    forceTLS: isSecure,
    enabledTransports,
    authEndpoint,
    auth: {
      headers: {
        Accept: 'application/json',
        Authorization: getToken() ? `Bearer ${getToken()}` : '',
        'ngrok-skip-browser-warning': 'true',
      },
    },
  })

  const pusher = echoInstance.connector?.pusher
  if (pusher && !debugBound) {
    debugBound = true
    pusher.connection.bind('state_change', (states) => {
      console.info('[Realtime diagnostic] Connection state changed', states)
    })
    pusher.connection.bind('connected', () => {
      console.info('[Realtime diagnostic] WebSocket connected', {
        socketId: pusher.connection.socket_id,
      })
    })
    pusher.connection.bind('error', (error) => {
      console.error('[Realtime diagnostic] WebSocket connection error', {
        error,
        hint: 'If this appears before subscription/auth logs, check Nginx/SSL proxy from /app to Reverb port.',
      })
    })
    pusher.connection.bind('unavailable', () => {
      console.error('[Realtime diagnostic] WebSocket unavailable', {
        hint: 'Reverb server may be down, blocked, or not proxied on the configured host/port.',
      })
    })
    pusher.connection.bind('failed', () => {
      console.error('[Realtime diagnostic] WebSocket failed', {
        hint: 'Transport failed before auth. Verify Reverb host/port/proxy, and note that Pusher/Echo expects enabledTransports to use ws/wss transport names.',
      })
    })
    pusher.connection.bind('disconnected', () => {
      console.warn('[Realtime diagnostic] WebSocket disconnected')
    })
  }

  return echoInstance
}

export function disconnectEcho() {
  if (!echoInstance) return
  echoInstance.disconnect()
  echoInstance = null
  debugBound = false
}
