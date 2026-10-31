// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useBoardPan } from './useBoardPan'

function pointer(target, type, x = 200) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.assign(event, { pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0, clientX: x, clientY: 100 })
  act(() => target.dispatchEvent(event))
}

function setup() {
  vi.useFakeTimers()
  const element = document.createElement('div')
  element.dir = 'rtl'
  element.scrollLeft = -300
  Object.defineProperties(element, { scrollWidth: { value: 2000 }, clientWidth: { value: 800 } })
  document.body.append(element)
  const ref = { current: element }
  const hook = renderHook(() => useBoardPan(ref, true))
  return { element, ...hook }
}

afterEach(() => {
  cleanup()
  document.body.replaceChildren()
  vi.useRealTimers()
})

describe('board long-press pan', () => {
  it('pans horizontally in both directions after holding, and stops on release', () => {
    const { element, result } = setup()
    pointer(element, 'pointerdown')
    act(() => vi.advanceTimersByTime(250))
    expect(result.current).toBe(true)
    pointer(window, 'pointermove', 260)
    expect(element.scrollLeft).toBe(-360)
    pointer(window, 'pointermove', 160)
    expect(element.scrollLeft).toBe(-260)
    pointer(window, 'pointerup', 160)
    expect(result.current).toBe(false)
    pointer(window, 'pointermove', 100)
    expect(element.scrollLeft).toBe(-260)
  })

  it('leaves card dragging and button interactions alone', () => {
    const { element, result } = setup()
    const card = document.createElement('div')
    card.dataset.pipelineItem = 'true'
    const button = document.createElement('button')
    element.append(card, button)
    for (const target of [card, button]) {
      pointer(target, 'pointerdown')
      act(() => vi.advanceTimersByTime(300))
      pointer(window, 'pointermove', 260)
      expect(result.current).toBe(false)
      expect(element.scrollLeft).toBe(-300)
    }
  })

  it('does not pan on a short click or movement before the hold delay', () => {
    const { element, result } = setup()
    pointer(element, 'pointerdown')
    pointer(window, 'pointerup')
    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe(false)
    pointer(element, 'pointerdown')
    pointer(window, 'pointermove', 220)
    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe(false)
    expect(element.scrollLeft).toBe(-300)
  })
})
