import { describe, expect, it } from 'vitest'
import { getDealsHubSidebarConfig, getDealWorkspaceSidebarConfig } from './dealNavigation'

const t = (key) => key

describe('deal navigation', () => {
  it('builds the workspace sidebar with the deal in the header and settings in the footer', () => {
    const config = getDealWorkspaceSidebarConfig({ dealId: 7, deal: { name: 'Q4', status: 'active' }, t })
    expect(config.header).toMatchObject({ title: 'Q4', description: 'dealWorkspace.options.dealStatus.active' })
    expect(config.groups.map((group) => group.id)).toEqual(['work', 'collaboration', 'catalog', 'insights', 'setup'])
    expect(config.groups[0].items[0]).toMatchObject({ to: '/deals/7', end: true })
    expect(config.groups[0].items[1].to).toBe('/deals/7/pipeline')
    expect(config.footerItems.map((item) => item.to)).toEqual(['/deals/7/settings'])
    expect(config.groups.flatMap((group) => group.items).some((item) => item.to === '/deals/7/reports')).toBe(true)
  })

  it('builds the hub sidebar', () => {
    const config = getDealsHubSidebarConfig(t)
    expect(config.groups.flatMap((group) => group.items).map((item) => item.to)).toEqual(['/deals', '/deals/contracts', '/deals/reports', '/deals/pipelines'])
  })
})
