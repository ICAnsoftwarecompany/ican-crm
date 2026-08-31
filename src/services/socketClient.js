import { io } from 'socket.io-client'
import { getApiRootDomain, resolveTenantServiceBaseURL } from './apiBaseUrl'

let socket
let diagnosticsBound = false

function getSocketDiagnostics(token, url) {
  return {
    url,
    hasToken: Boolean(token),
    hasReverbConfig: Boolean(import.meta.env.VITE_REVERB_APP_KEY),
    realtimeEnabled: import.meta.env.VITE_REALTIME_ENABLED,
    note: 'This client uses Socket.IO protocol, while Laravel Reverb uses Pusher/Echo protocol.',
  }
}

function bindSocketDiagnostics(instance) {
  if (!instance || diagnosticsBound) return

  diagnosticsBound = true
  instance.on('connect', () => {
    console.info('[Socket diagnostic] Socket.IO connected', {
      id: instance.id,
      transport: instance.io.engine?.transport?.name,
    })
  })
  instance.on('connect_error', (error) => {
    console.error('[Socket diagnostic] Socket.IO connect error', {
      message: error?.message,
      description: error?.description,
      context: error?.context,
      hint: 'If your backend is Laravel Reverb, do not use socket.io-client for channel subscriptions. Use src/realtime/echo.js instead.',
    })
  })
  instance.on('disconnect', (reason) => {
    console.warn('[Socket diagnostic] Socket.IO disconnected', { reason })
  })
}

function getSocketUrl() {
  const explicitUrl = import.meta.env.VITE_SOCKET_URL?.trim()
  if (explicitUrl) return explicitUrl

  const rootDomain =
    import.meta.env.VITE_SOCKET_ROOT_DOMAIN ||
    import.meta.env.VITE_REVERB_ROOT_DOMAIN ||
    getApiRootDomain()
  const scheme =
    import.meta.env.VITE_SOCKET_SCHEME ||
    import.meta.env.VITE_REVERB_SCHEME ||
    (typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss' : 'ws')
  const port = import.meta.env.VITE_SOCKET_PORT?.trim()
  const url = new URL(
    resolveTenantServiceBaseURL({
      rootDomain,
      scheme,
      serviceName: 'Socket.io',
    })
  )

  if (port) {
    url.port = port
  }

  return url.toString()
}

export function getSocket(token) {
  const url = getSocketUrl()

  if (!url) {
    console.error('[Socket diagnostic] Socket URL could not be resolved')
    return null
  }

  console.groupCollapsed('[Socket diagnostic] Socket.IO bootstrap')
  console.table(getSocketDiagnostics(token, url))
  if (import.meta.env.VITE_REVERB_APP_KEY) {
    console.warn('[Socket diagnostic] Reverb configuration detected alongside Socket.IO client', {
      hint: 'This is usually a protocol mismatch unless a separate Socket.IO server exists.',
    })
  }
  console.groupEnd()

  if (!socket) {
    socket = io(url, {
      autoConnect: false,
      transports: ['websocket'],
      auth: token ? { token } : undefined,
    })

    bindSocketDiagnostics(socket)
  }

  if (token) {
    socket.auth = { token }
  } else {
    console.warn('[Socket diagnostic] Socket.IO created without auth token')
  }

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = undefined
    diagnosticsBound = false
  }
}
