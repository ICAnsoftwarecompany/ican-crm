import { afterEach, describe, expect, it } from 'vitest'
import {
  getMyWorkSections,
  isSectionModuleEnabled,
  registerMyWorkSection,
  unregisterMyWorkSection,
} from './myWorkRegistry'

const Component = () => null
const ids = ['t-sales', 't-service', 't-everyone']

afterEach(() => ids.forEach(unregisterMyWorkSection))

function registerFixtures() {
  registerMyWorkSection({ id: 't-sales', order: 2, focuses: ['sales'], module: 'sales', component: Component })
  registerMyWorkSection({ id: 't-service', order: 3, focuses: ['service'], module: 'customer_service', component: Component })
  registerMyWorkSection({ id: 't-everyone', order: 1, focuses: ['sales', 'service'], component: Component })
}

const pick = (list) => list.map((section) => section.id).filter((id) => ids.includes(id))

describe('myWorkRegistry', () => {
  it('shows everything in the "all" focus, sorted by order', () => {
    registerFixtures()
    expect(pick(getMyWorkSections({ focus: 'all' }))).toEqual(['t-everyone', 't-sales', 't-service'])
  })

  it('filters by focus, keeping shared sections', () => {
    registerFixtures()
    expect(pick(getMyWorkSections({ focus: 'sales' }))).toEqual(['t-everyone', 't-sales'])
    expect(pick(getMyWorkSections({ focus: 'service' }))).toEqual(['t-everyone', 't-service'])
  })

  it('hides a section only when the backend sends modules and its module is missing', () => {
    registerFixtures()
    expect(pick(getMyWorkSections({ focus: 'all', enabledModules: undefined }))).toHaveLength(3)
    expect(pick(getMyWorkSections({ focus: 'all', enabledModules: ['sales'] }))).toEqual(['t-everyone', 't-sales'])
    expect(isSectionModuleEnabled({}, [])).toBe(true)
  })

  it('rejects invalid sections', () => {
    expect(() => registerMyWorkSection({ id: 'x' })).toThrow()
    expect(() => registerMyWorkSection({ id: 'x', component: Component, focuses: [] })).toThrow()
  })
})
