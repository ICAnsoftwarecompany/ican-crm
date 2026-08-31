import { useEffect, useRef, useState } from 'react'
import { getEcho, isRealtimeConfigured } from '../echo'
import { useAuthStore } from '../../store/authStore'

function getSubscriptionDiagnostic(channel) {
  const subscription = channel?.subscription
  if (!subscription) return null

  return {
    name: subscription.name,
    subscribed: subscription.subscribed,
    auth: subscription.auth ? 'exists' : 'none',
  }
}

export function useRealtimeChannel({
  channelName,
  eventName,
  eventNames,
  enabled = true,
  isPrivate = true,
  listenToAll = false,
  onEvent,
}) {
  const onEventRef = useRef(onEvent)
  const token = useAuthStore((state) => state.token)
  const [connectionStatus, setConnectionStatus] = useState(
    isRealtimeConfigured() ? 'idle' : 'disabled'
  )

  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    const resolvedEventNames = Array.isArray(eventNames) && eventNames.length
      ? eventNames.filter(Boolean)
      : [eventName].filter(Boolean)

    if (!enabled || !channelName || resolvedEventNames.length === 0) {
      console.info('[Realtime diagnostic] Channel skipped', {
        enabled,
        channelName,
        eventNames: resolvedEventNames,
        configured: isRealtimeConfigured(),
      })
      setConnectionStatus(isRealtimeConfigured() ? 'idle' : 'disabled')
      return
    }

    const echo = getEcho()
    if (!echo) {
      console.warn('[Realtime diagnostic] Echo instance unavailable for channel', {
        channelName,
        eventName,
      })
      setConnectionStatus('disabled')
      return
    }

    const channel = isPrivate ? echo.private(channelName) : echo.channel(channelName)
    const connectorState = echo.connector?.pusher?.connection?.state || 'unknown'

    setConnectionStatus('connecting')
    console.groupCollapsed('[Realtime diagnostic] Channel subscribe')
    console.table({
      channelName,
      eventName: resolvedEventNames.join(', '),
      type: isPrivate ? 'private' : 'public',
      hasToken: Boolean(token),
      connectorState,
      strictModeNote: 'In development, React StrictMode can mount/unmount twice and cause duplicate subscribe/leave logs.',
    })
    console.info('[Realtime diagnostic] Subscription object', getSubscriptionDiagnostic(channel))
    if (isPrivate && !token) {
      console.error('[Realtime diagnostic] Private channel started without auth token', {
        channelName,
        eventName,
        hint: 'Private Laravel Reverb channels require a Bearer token for /broadcasting/auth.',
      })
    }
    console.groupEnd()

    channel.subscribed(() => {
      console.info('[Realtime diagnostic] Channel subscribed successfully', {
        channelName,
        eventNames: resolvedEventNames,
        type: isPrivate ? 'private' : 'public',
      })
      setConnectionStatus('connected')
    })

    channel.error((error) => {
      console.error('[Realtime diagnostic] Channel subscription error', {
        channelName,
        eventName,
        type: isPrivate ? 'private' : 'public',
        error,
        hint: isPrivate
          ? 'Private channel failed. Check /broadcasting/auth response, Bearer token, tenant/user permissions, and channel name.'
          : 'Public channel failed. Check channel name and event broadcast.',
      })
      setConnectionStatus('error')
    })

    const canListenToAll = Boolean(listenToAll && typeof channel.listenToAll === 'function')

    if (canListenToAll) {
      channel.listenToAll((currentEventName = '', payload = {}) => {
        console.info('[Realtime diagnostic] Event received', {
          channelName,
          eventName: currentEventName,
          listenToAll: true,
          payload,
        })
        onEventRef.current?.(payload, currentEventName)
      })
    } else {
      resolvedEventNames.forEach((currentEventName) => {
        channel.listen(currentEventName, (payload = {}) => {
          console.info('[Realtime diagnostic] Event received', {
            channelName,
            eventName: currentEventName,
            payload,
          })
          onEventRef.current?.(payload, currentEventName)
        })
      })
    }

    return () => {
      console.info('[Realtime diagnostic] Leaving channel', { channelName })
      echo.leave(channelName)
      setConnectionStatus('disconnected')
    }
  }, [channelName, enabled, eventName, eventNames, isPrivate, listenToAll, token])

  return { connectionStatus }
}
