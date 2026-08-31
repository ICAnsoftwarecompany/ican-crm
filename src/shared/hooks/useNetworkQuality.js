import { useCallback, useEffect, useMemo, useState } from 'react'

const CHECK_URL = 'https://www.gstatic.com/generate_204'
const CHECK_TIMEOUT_MS = 5000
const CHECK_INTERVAL_MS = 30000

function getConnection() {
  if (typeof navigator === 'undefined') return null
  return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null
}

function classifyNetwork({ online, connection, latency }) {
  if (!online) return 'offline'
  if (latency === null && !connection) return 'unknown'

  const effectiveType = connection?.effectiveType || ''
  const downlink = Number(connection?.downlink || 0)
  const rtt = Number(connection?.rtt || 0)

  if (
    connection?.saveData ||
    effectiveType === 'slow-2g' ||
    effectiveType === '2g' ||
    (downlink > 0 && downlink < 1) ||
    rtt > 900 ||
    latency > 1800
  ) {
    return 'weak'
  }

  if (
    effectiveType === '3g' ||
    (downlink > 0 && downlink < 5) ||
    rtt > 300 ||
    latency > 800
  ) {
    return 'medium'
  }

  return 'strong'
}

export function useNetworkQuality() {
  const [online, setOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine
  )
  const [connectionSnapshot, setConnectionSnapshot] = useState(() => {
    const connection = getConnection()
    return connection
      ? {
          downlink: connection.downlink,
          effectiveType: connection.effectiveType,
          rtt: connection.rtt,
          saveData: connection.saveData,
        }
      : null
  })
  const [latency, setLatency] = useState(null)
  const [checking, setChecking] = useState(false)

  const refreshConnectionSnapshot = useCallback(() => {
    const connection = getConnection()
    setConnectionSnapshot(
      connection
        ? {
            downlink: connection.downlink,
            effectiveType: connection.effectiveType,
            rtt: connection.rtt,
            saveData: connection.saveData,
          }
        : null
    )
  }, [])

  const checkConnection = useCallback(async () => {
    if (typeof window === 'undefined') return

    if (!navigator.onLine) {
      setOnline(false)
      setLatency(null)
      return
    }

    const controller = new AbortController()
    const startedAt = performance.now()
    const timeout = window.setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS)

    setChecking(true)

    try {
      await fetch(`${CHECK_URL}?t=${Date.now()}`, {
        cache: 'no-store',
        mode: 'no-cors',
        signal: controller.signal,
      })

      setOnline(true)
      setLatency(Math.round(performance.now() - startedAt))
    } catch {
      setOnline(navigator.onLine)
      setLatency(null)
    } finally {
      window.clearTimeout(timeout)
      setChecking(false)
      refreshConnectionSnapshot()
    }
  }, [refreshConnectionSnapshot])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const connection = getConnection()
    const handleOnline = () => {
      setOnline(true)
      checkConnection()
    }
    const handleOffline = () => {
      setOnline(false)
      setLatency(null)
      refreshConnectionSnapshot()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    connection?.addEventListener?.('change', checkConnection)

    checkConnection()
    const interval = window.setInterval(checkConnection, CHECK_INTERVAL_MS)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      connection?.removeEventListener?.('change', checkConnection)
      window.clearInterval(interval)
    }
  }, [checkConnection, refreshConnectionSnapshot])

  const quality = useMemo(
    () => classifyNetwork({ online, connection: connectionSnapshot, latency }),
    [connectionSnapshot, latency, online]
  )

  return {
    checking,
    connection: connectionSnapshot,
    latency,
    online,
    quality,
  }
}
