import { describe, expect, it } from 'vitest'
import { findRoute, matchPath, normalizePath } from './router'

describe('normalizePath', () => {
  it('strips origin and query string', () => {
    expect(normalizePath('https://acme.example.com/api/tenant/me/capabilities?api_password=x')).toBe('/api/tenant/me/capabilities')
    expect(normalizePath('api/tenant/service/cases')).toBe('/api/tenant/service/cases')
  })
})

describe('matchPath', () => {
  it('extracts params', () => {
    expect(matchPath('/service/cases/:caseId', '/service/cases/42')).toEqual({ caseId: '42' })
  })

  it('rejects different shapes', () => {
    expect(matchPath('/service/cases/:caseId', '/service/cases')).toBeNull()
    expect(matchPath('/service/cases', '/service/records')).toBeNull()
  })

  it('ignores trailing slashes', () => {
    expect(matchPath('/service/cases', '/service/cases/')).toEqual({})
  })
})

describe('findRoute', () => {
  const routes = [
    { method: 'GET', path: '/service/cases', handler: () => 'list' },
    { method: 'GET', path: '/service/cases/:caseId', handler: () => 'one' },
    { method: 'POST', path: '/service/cases', handler: () => 'create' },
  ]

  it('matches by method and path', () => {
    expect(findRoute(routes, 'get', '/service/cases/7')?.params).toEqual({ caseId: '7' })
    expect(findRoute(routes, 'post', '/service/cases')?.route.handler()).toBe('create')
  })

  it('returns null when nothing matches', () => {
    expect(findRoute(routes, 'delete', '/service/cases/7')).toBeNull()
  })
})
