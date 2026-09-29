import { describe, expect, it } from 'vitest'
import { applySidebarSectionOrder, moveSidebarSection, normalizeSidebarSectionOrder } from './sidebarSectionOrder'

const sections = [
  { id: 'overview', hideLabel: true },
  { id: 'sales' },
  { id: 'growth' },
  { id: 'administration' },
]

describe('sidebar section ordering', () => {
  it('keeps bare sections fixed before movable groups', () => {
    expect(applySidebarSectionOrder(sections, ['administration', 'sales', 'growth']).map((item) => item.id))
      .toEqual(['overview', 'administration', 'sales', 'growth'])
  })

  it('adds newly available sections to a saved order', () => {
    expect(normalizeSidebarSectionOrder(['growth'], ['sales', 'growth', 'administration']))
      .toEqual(['growth', 'sales', 'administration'])
  })

  it('moves a section to the hovered section position', () => {
    expect(moveSidebarSection(['sales', 'growth', 'administration'], 'administration', 'sales', ['sales', 'growth', 'administration']))
      .toEqual(['administration', 'sales', 'growth'])
  })
})
