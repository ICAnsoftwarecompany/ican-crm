import { describe, expect, it } from 'vitest'
import {
  getItemActivePatterns,
  getVisibleNavigation,
  hasNavigationPermission,
  isModuleEnabled,
  isNavigationItemActive,
  resolveActiveNavigation,
} from './navigation.utils'

describe('isModuleEnabled', () => {
  it('is always enabled when the item declares no module', () => {
    expect(isModuleEnabled(undefined, ['sales'])).toBe(true)
  })

  it('never fabricates a restriction when the backend has not supplied enabled modules', () => {
    expect(isModuleEnabled('growth', null)).toBe(true)
    expect(isModuleEnabled('growth', undefined)).toBe(true)
  })

  it('gates correctly once a real modules list exists', () => {
    expect(isModuleEnabled('growth', ['sales'])).toBe(false)
    expect(isModuleEnabled('sales', ['sales'])).toBe(true)
  })
})

describe('hasNavigationPermission', () => {
  it('is always visible when no permission key is declared', () => {
    expect(hasNavigationPermission(undefined, [])).toBe(true)
  })

  it('never fabricates a restriction when the backend has not supplied permissions', () => {
    expect(hasNavigationPermission('customers.view', null)).toBe(true)
  })

  it('gates correctly once a real permissions list exists', () => {
    expect(hasNavigationPermission('customers.view', ['leads.view'])).toBe(false)
    expect(hasNavigationPermission('customers.view', ['customers.view'])).toBe(true)
  })
})

describe('getItemActivePatterns', () => {
  it('uses declared activePatterns when present', () => {
    const item = { path: '/leads', activePatterns: ['/leads', '/leads/*'] }
    expect(getItemActivePatterns(item)).toEqual(['/leads', '/leads/*'])
  })

  it('defaults an exact-match item ("end") to just its own path', () => {
    expect(getItemActivePatterns({ path: '/', end: true })).toEqual(['/'])
  })

  it('defaults a normal item to itself plus a wildcard prefix', () => {
    expect(getItemActivePatterns({ path: '/settings' })).toEqual(['/settings', '/settings/*'])
  })
})

describe('isNavigationItemActive', () => {
  it('matches an exact-only item only on its exact path', () => {
    const dashboard = { path: '/', end: true }
    expect(isNavigationItemActive(dashboard, '/')).toBe(true)
    expect(isNavigationItemActive(dashboard, '/leads')).toBe(false)
  })

  it('matches nested routes under a wildcard pattern', () => {
    const settings = { path: '/settings', activePatterns: ['/settings', '/settings/*'] }
    expect(isNavigationItemActive(settings, '/settings/integrations')).toBe(true)
    expect(isNavigationItemActive(settings, '/settings')).toBe(true)
    expect(isNavigationItemActive(settings, '/settings-other')).toBe(false)
  })
})

describe('resolveActiveNavigation', () => {
  const sections = [
    {
      id: 'sales',
      items: [
        { id: 'customers', path: '/LeadsCenter', activePatterns: ['/LeadsCenter', '/LeadsCenter/*'] },
        { id: 'proposals', path: '/LeadsCenter/proposals', activePatterns: ['/LeadsCenter/proposals', '/LeadsCenter/proposals/*'] },
      ],
    },
  ]

  it('picks the more specific (longer prefix) match when two items could both match', () => {
    const { activeItem } = resolveActiveNavigation(sections, '/LeadsCenter/proposals/123/builder')
    expect(activeItem.id).toBe('proposals')
  })

  it('falls back to the section-level match when the specific one does not apply', () => {
    const { activeItem, activeSection } = resolveActiveNavigation(sections, '/LeadsCenter/settings')
    expect(activeItem.id).toBe('customers')
    expect(activeSection.id).toBe('sales')
  })

  it('returns nulls when nothing matches (e.g. a 404 route)', () => {
    const { activeItem, activeSection } = resolveActiveNavigation(sections, '/does-not-exist')
    expect(activeItem).toBeNull()
    expect(activeSection).toBeNull()
  })
})

describe('getVisibleNavigation', () => {
  const sections = [
    {
      id: 'growth',
      module: 'growth',
      items: [
        { id: 'campaigns', path: '/campaigns' },
        { id: 'restricted', path: '/restricted', permission: 'growth.restricted' },
        { id: 'hidden-item', path: '/hidden', hidden: true },
      ],
    },
    {
      id: 'always',
      items: [{ id: 'dashboard', path: '/' }],
    },
  ]

  it('shows everything when no module/permission data exists yet (no fabricated restrictions)', () => {
    const visible = getVisibleNavigation(sections, {})
    const growthSection = visible.find((section) => section.id === 'growth')
    expect(growthSection.items.map((item) => item.id)).toEqual(['campaigns', 'restricted'])
  })

  it('drops an explicitly hidden item regardless of module/permission data', () => {
    const visible = getVisibleNavigation(sections, {})
    expect(visible.find((section) => section.id === 'growth').items.some((item) => item.id === 'hidden-item')).toBe(false)
  })

  it('removes an entire section when its module is disabled, and filters permission-gated items once real data exists', () => {
    const visible = getVisibleNavigation(sections, { enabledModules: ['sales'], userPermissions: [] })
    expect(visible.find((section) => section.id === 'growth')).toBeUndefined()
    expect(visible.find((section) => section.id === 'always')).toBeDefined()
  })

  it('drops a section entirely once all of its items are filtered out', () => {
    const onlyRestricted = [{ id: 'growth', module: 'growth', items: [{ id: 'restricted', path: '/restricted', permission: 'growth.restricted' }] }]
    const visible = getVisibleNavigation(onlyRestricted, { userPermissions: [] })
    expect(visible).toEqual([])
  })
})
