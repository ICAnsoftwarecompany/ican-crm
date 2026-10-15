import { describe, expect, it } from 'vitest'
import { flattenSubSidebarItems, getSubSidebarItemKey, getVisibleSubSidebarGroups } from './subSidebarUtils'

const Icon = () => null

describe('getVisibleSubSidebarGroups', () => {
  it('drops hidden items and groups that end up empty', () => {
    const groups = [
      { id: 'a', items: [{ to: '/a', label: 'A', icon: Icon }, { to: '/b', label: 'B', icon: Icon, hidden: true }] },
      { id: 'b', items: [{ to: '/c', label: 'C', icon: Icon, hidden: true }] },
    ]

    const visible = getVisibleSubSidebarGroups(groups)
    expect(visible).toHaveLength(1)
    expect(visible[0].items.map((item) => item.to)).toEqual(['/a'])
  })

  it('keeps disabled items (they render as "coming soon")', () => {
    const groups = [{ id: 'a', items: [{ to: '/a', label: 'A', icon: Icon, disabled: true }] }]
    expect(getVisibleSubSidebarGroups(groups)[0].items).toHaveLength(1)
  })

  it('tolerates missing input', () => {
    expect(getVisibleSubSidebarGroups()).toEqual([])
    expect(getVisibleSubSidebarGroups([{ id: 'x' }])).toEqual([])
  })
})

describe('children (sub-pages)', () => {
  it('drops hidden children and flattens them after their parent', () => {
    const groups = [{ id: 'a', items: [{ to: '/p', label: 'P', icon: Icon, children: [{ to: '/p/1', label: '1' }, { to: '/p/2', label: '2', hidden: true }] }] }]
    expect(getVisibleSubSidebarGroups(groups)[0].items[0].children.map((child) => child.to)).toEqual(['/p/1'])
    expect(flattenSubSidebarItems(groups).map((item) => item.to)).toEqual(['/p', '/p/1'])
  })
})

describe('flattenSubSidebarItems / getSubSidebarItemKey', () => {
  it('flattens visible items in order and prefers id as key', () => {
    const groups = [
      { id: 'a', items: [{ id: 'first', to: '/a', label: 'A', icon: Icon }] },
      { id: 'b', items: [{ to: '/b', label: 'B', icon: Icon }] },
    ]
    const items = flattenSubSidebarItems(groups)
    expect(items.map(getSubSidebarItemKey)).toEqual(['first', '/b'])
  })
})
