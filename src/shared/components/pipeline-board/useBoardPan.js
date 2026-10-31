import { useEffect, useState } from 'react'

export function useBoardPan(scrollRef, enabled, delay = 250) {
  const [panning, setPanning] = useState(false)

  useEffect(() => {
    const element = scrollRef.current
    if (!enabled || !element) return undefined
    let press = null
    let timer
    let suppressUntil = 0
    const originalSelect = element.style.userSelect

    const stop = () => {
      window.clearTimeout(timer)
      if (press?.moved) suppressUntil = Date.now() + 250
      const pointerId = press?.id
      press = null
      if (pointerId != null && element.hasPointerCapture?.(pointerId)) element.releasePointerCapture(pointerId)
      element.style.userSelect = originalSelect
      setPanning(false)
    }
    const start = (event) => {
      if (event.button !== 0 || event.isPrimary === false || event.pointerType === 'touch') return
      if (event.target.closest('[data-pipeline-item], button, a, input, select, textarea, [role="button"], [contenteditable="true"]')) return
      if (element.scrollWidth <= element.clientWidth) return
      stop()
      press = { id: event.pointerId, x: event.clientX, y: event.clientY, scroll: element.scrollLeft, active: false, moved: false }
      timer = window.setTimeout(() => {
        if (!press) return
        press.active = true
        element.style.userSelect = 'none'
        element.setPointerCapture?.(press.id)
        setPanning(true)
      }, delay)
    }
    const move = (event) => {
      if (!press || event.pointerId !== press.id) return
      const dx = event.clientX - press.x
      if (!press.active) {
        if (Math.hypot(dx, event.clientY - press.y) > 8) stop()
        return
      }
      event.preventDefault()
      if (Math.abs(dx) > 3) press.moved = true
      element.scrollLeft = press.scroll - dx
    }
    const end = (event) => { if (press?.id === event.pointerId) stop() }
    const click = (event) => {
      if (Date.now() >= suppressUntil) return
      event.preventDefault()
      event.stopPropagation()
    }
    element.addEventListener('pointerdown', start)
    element.addEventListener('click', click, true)
    window.addEventListener('pointermove', move, { passive: false })
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
    window.addEventListener('blur', stop)
    return () => {
      stop()
      element.removeEventListener('pointerdown', start)
      element.removeEventListener('click', click, true)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
      window.removeEventListener('blur', stop)
    }
  }, [delay, enabled, scrollRef])

  return panning
}
