import { useAuthStore } from '../../../../store/authStore'

/**
 * Deterministic helpers for mock seeds: the same template always produces
 * the same data, so screenshots and bug reports are reproducible.
 */
export function createRandom(seedText) {
  let seed = [...String(seedText)].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7)
  const next = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
  return {
    next,
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    pick: (list) => list[Math.floor(next() * list.length)],
    chance: (probability) => next() < probability,
  }
}

/** The signed-in user, so "assigned to me" works against the real session. */
export function getMockCurrentUser() {
  const user = useAuthStore.getState?.().user
  return {
    id: user?.id != null ? String(user.id) : 'me',
    name: user?.name || user?.full_name || user?.email || 'You',
  }
}

export function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

let counter = 0
export function mockId(prefix) {
  counter += 1
  return `${prefix}-${Date.now().toString(36)}-${counter}`
}
