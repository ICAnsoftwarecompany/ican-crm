export const DEFAULT_WIDTH = 400
export const DEFAULT_HEIGHT = 560
export const MIN_WIDTH = 320
export const MIN_HEIGHT = 280
export const MINIMIZED_HEIGHT = 64
export const CHAT_LAYOUT_VERSION = 2

const CHANNEL_LAYOUT_OFFSETS = {
  whatsapp: 0,
  messenger: 28,
  sms: 56,
  mail: 84,
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function getViewport() {
  if (typeof window === 'undefined') {
    return { width: 1280, height: 720 }
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

export function getLayoutStorageKey(channel = 'default') {
  return `floating-customer-chat-layout-${channel}`
}

export function getDefaultChatLayout(dir = 'rtl', channel = 'default') {
  const viewport = getViewport()
  const width = Math.min(DEFAULT_WIDTH, viewport.width - 16)
  const height = Math.min(DEFAULT_HEIGHT, viewport.height - 16)
  const offset = CHANNEL_LAYOUT_OFFSETS[channel] || 0
  const x = dir === 'rtl' ? viewport.width - width - 24 - offset : 24 + offset

  return clampLayoutToViewport({
    layoutVersion: CHAT_LAYOUT_VERSION,
    x,
    y: 96 + offset,
    width,
    height,
    isMinimized: false,
    isMaximized: false,
  })
}

function isValidLayout(layout) {
  return (
    layout &&
    Number.isFinite(layout.x) &&
    Number.isFinite(layout.y) &&
    Number.isFinite(layout.width) &&
    Number.isFinite(layout.height)
  )
}

export function getSavedChatLayout(channel, dir) {
  if (typeof window === 'undefined') return getDefaultChatLayout(dir, channel)

  try {
    const parsed = JSON.parse(window.localStorage.getItem(getLayoutStorageKey(channel)) || 'null')
    if (!isValidLayout(parsed)) return getDefaultChatLayout(dir, channel)
    if (parsed.layoutVersion !== CHAT_LAYOUT_VERSION) return getDefaultChatLayout(dir, channel)
    return clampLayoutToViewport(parsed)
  } catch {
    return getDefaultChatLayout(dir, channel)
  }
}

export function saveChatLayout(channel, layout) {
  if (typeof window === 'undefined' || !isValidLayout(layout)) return
  window.localStorage.setItem(getLayoutStorageKey(channel), JSON.stringify(clampLayoutToViewport(layout)))
}

export function clampLayoutToViewport(layout) {
  const viewport = getViewport()
  const maxWidth = Math.max(MIN_WIDTH, viewport.width - 24)
  const maxHeight = Math.max(MIN_HEIGHT, viewport.height - 24)
  const width = clamp(layout.width, Math.min(MIN_WIDTH, maxWidth), maxWidth)
  const height = layout.isMinimized
    ? MINIMIZED_HEIGHT
    : clamp(layout.height, Math.min(MIN_HEIGHT, maxHeight), maxHeight)

  return {
    ...layout,
    layoutVersion: CHAT_LAYOUT_VERSION,
    width,
    height,
    x: clamp(layout.x, 8, Math.max(8, viewport.width - width - 8)),
    y: clamp(layout.y, 8, Math.max(8, viewport.height - height - 8)),
  }
}

export function getMaximizedLayout() {
  const viewport = getViewport()
  return {
    x: 12,
    y: 12,
    width: Math.max(MIN_WIDTH, viewport.width - 24),
    height: Math.max(MIN_HEIGHT, viewport.height - 24),
    isMinimized: false,
    isMaximized: true,
  }
}

export function calculateResizedLayout({
  direction,
  startPointer,
  currentPointer,
  startLayout,
}) {
  const dx = currentPointer.x - startPointer.x
  const dy = currentPointer.y - startPointer.y
  const viewport = getViewport()
  const maxWidth = viewport.width - 24
  const maxHeight = viewport.height - 24

  let { x, y, width, height } = startLayout

  if (direction.includes('e')) {
    width = clamp(startLayout.width + dx, MIN_WIDTH, maxWidth)
  }

  if (direction.includes('s')) {
    height = clamp(startLayout.height + dy, MIN_HEIGHT, maxHeight)
  }

  if (direction.includes('w')) {
    const nextWidth = clamp(startLayout.width - dx, MIN_WIDTH, maxWidth)
    x = startLayout.x + (startLayout.width - nextWidth)
    width = nextWidth
  }

  if (direction.includes('n')) {
    const nextHeight = clamp(startLayout.height - dy, MIN_HEIGHT, maxHeight)
    y = startLayout.y + (startLayout.height - nextHeight)
    height = nextHeight
  }

  return clampLayoutToViewport({
    ...startLayout,
    x,
    y,
    width,
    height,
    isMinimized: false,
    isMaximized: false,
  })
}
