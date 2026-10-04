/**
 * Horizontal edge auto-scroll while dragging on the long-press board (2026-10-05).
 *
 * Why not @dnd-kit's own autoScroll: it decides "already at the left edge" with `scrollLeft <= 0`. In RTL the
 * scroll position starts at 0 and goes NEGATIVE towards the hidden columns, so dnd-kit never scrolls there and
 * a card cannot reach a column that needs horizontal scrolling. `scrollBy` is direction-agnostic, so this works
 * in RTL and LTR. Vertical auto-scroll (inside columns) stays with dnd-kit.
 */

/** Pixels to scroll this frame for a pointer at `clientX` over a container `rect` (`{ left, right, width }`). */
export function getEdgeScrollDelta(clientX, rect, { edge = 96, maxSpeed = 22 } = {}) {
  if (!rect || !Number.isFinite(clientX) || !rect.width) return 0
  const size = Math.min(edge, rect.width / 4)
  const fromLeft = clientX - rect.left
  const fromRight = rect.right - clientX
  // Outside the container on a side still scrolls at full speed (dragging past the edge).
  if (fromLeft < size) return -Math.round(maxSpeed * Math.min(1, (size - fromLeft) / size))
  if (fromRight < size) return Math.round(maxSpeed * Math.min(1, (size - fromRight) / size))
  return 0
}

/**
 * Starts the edge auto-scroll on `container` and returns a stop function. Tracks the pointer (mouse + touch) on
 * window and scrolls on every animation frame while the pointer is near a side.
 */
export function startEdgeScroll(container, options) {
  if (!container || typeof window === 'undefined') return () => {}
  let clientX = null
  let frame = 0
  const track = (event) => {
    const point = event.touches?.[0] || event
    if (Number.isFinite(point?.clientX)) clientX = point.clientX
  }
  const tick = () => {
    const delta = clientX === null ? 0 : getEdgeScrollDelta(clientX, container.getBoundingClientRect(), options)
    if (delta) container.scrollBy({ left: delta })
    frame = window.requestAnimationFrame(tick)
  }
  window.addEventListener('mousemove', track, { passive: true })
  window.addEventListener('touchmove', track, { passive: true })
  frame = window.requestAnimationFrame(tick)
  return () => {
    window.cancelAnimationFrame(frame)
    window.removeEventListener('mousemove', track)
    window.removeEventListener('touchmove', track)
  }
}
