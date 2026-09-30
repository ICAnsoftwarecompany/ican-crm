import { describe, expect, it } from 'vitest'
import {
  COMMUNICATION_MODULES,
  COMMUNICATION_PAGES,
  getCommunicationModule,
  getCommunicationPagePath,
} from '../constants/communicationModules'
import { getCommunicationSidebarConfig } from './communicationNavigation'

const t = (key) => key

describe('communication modules registry', () => {
  it('has unique ids and base paths', () => {
    const ids = COMMUNICATION_MODULES.map((module) => module.id)
    const paths = COMMUNICATION_MODULES.map((module) => module.basePath)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('keeps the existing conversations and team-chat URLs', () => {
    expect(getCommunicationModule('conversations').basePath).toBe('/conversations')
    expect(getCommunicationModule('team-chat').basePath).toBe('/team-chat')
  })

  it('builds page paths with the index at the base path', () => {
    const calls = getCommunicationModule('calls')
    expect(getCommunicationPagePath(calls, 'view')).toBe('/calls')
    expect(getCommunicationPagePath(calls, 'ai')).toBe('/calls/ai')
    expect(getCommunicationPagePath(calls, 'unknown')).toBeNull()
    expect(getCommunicationPagePath(null, 'view')).toBeNull()
  })
})

describe('getCommunicationSidebarConfig', () => {
  it('returns null for an unknown module', () => {
    expect(getCommunicationSidebarConfig('nope', t)).toBeNull()
  })

  it('links every page exactly once (groups + footer)', () => {
    COMMUNICATION_MODULES.forEach((module) => {
      const config = getCommunicationSidebarConfig(module.id, t)
      const links = [...config.groups.flatMap((group) => group.items), ...config.footerItems].map((item) => item.to)
      const expected = COMMUNICATION_PAGES.map((page) => getCommunicationPagePath(module, page.id))
      expect([...links].sort()).toEqual([...expected].sort())
    })
  })

  it('marks only the index view as exact-match and pins settings in the footer', () => {
    const config = getCommunicationSidebarConfig('meetings', t)
    const items = config.groups.flatMap((group) => group.items)
    expect(items.filter((item) => item.end).map((item) => item.to)).toEqual(['/meetings'])
    expect(config.footerItems.map((item) => item.to)).toEqual(['/meetings/settings'])
  })
})
