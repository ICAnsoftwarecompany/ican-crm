const DEDUPE_WINDOW_MS = 1200
const DEDUPE_RETENTION_MS = 5000

export function createNotificationSound({ path, volume, logLabel }) {
  let audioInstance = null
  const recentlyPlayed = new Map()

  function shouldSkipPlayback(playKey) {
    if (!playKey) return false
    const now = Date.now()
    const lastPlayedAt = recentlyPlayed.get(playKey) || 0
    recentlyPlayed.set(playKey, now)

    for (const [key, timestamp] of recentlyPlayed.entries()) {
      if (now - timestamp > DEDUPE_RETENTION_MS) recentlyPlayed.delete(key)
    }
    return now - lastPlayedAt < DEDUPE_WINDOW_MS
  }

  return function playNotificationSound(playKey = '') {
    if (typeof window === 'undefined') return
    if (shouldSkipPlayback(String(playKey || ''))) return

    try {
      if (!audioInstance) {
        audioInstance = new Audio(path)
        audioInstance.preload = 'auto'
        audioInstance.volume = volume
      }
      audioInstance.currentTime = 0
      const playPromise = audioInstance.play()
      playPromise?.catch?.((error) => {
        console.info(`[${logLabel}] Playback skipped`, {
          reason: error?.message || error,
          hint: 'Browsers can block sound until the user interacts with the page.',
        })
      })
    } catch (error) {
      console.info(`[${logLabel}] Playback unavailable`, error)
    }
  }
}
