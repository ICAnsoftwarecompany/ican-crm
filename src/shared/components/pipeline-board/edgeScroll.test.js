import { describe, expect, it } from 'vitest'
import { getEdgeScrollDelta } from './edgeScroll'

const rect = { left: 100, right: 1100, width: 1000 }

describe('getEdgeScrollDelta', () => {
  it('does nothing in the middle', () => {
    expect(getEdgeScrollDelta(600, rect)).toBe(0)
  })

  it('scrolls left (negative) near the left side and right near the right side, faster closer to the edge', () => {
    expect(getEdgeScrollDelta(150, rect)).toBeLessThan(0)
    expect(getEdgeScrollDelta(101, rect)).toBeLessThan(getEdgeScrollDelta(150, rect))
    expect(getEdgeScrollDelta(1050, rect)).toBeGreaterThan(0)
  })

  it('keeps full speed when the pointer goes past the side', () => {
    expect(getEdgeScrollDelta(20, rect)).toBe(-22)
    expect(getEdgeScrollDelta(1300, rect)).toBe(22)
  })

  it('ignores missing input', () => {
    expect(getEdgeScrollDelta(undefined, rect)).toBe(0)
    expect(getEdgeScrollDelta(150, null)).toBe(0)
  })
})
