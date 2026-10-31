// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, it, vi } from 'vitest'
import { CustomerActivityLinkBadge } from './CustomerActivityLinkBadge'

const state = vi.hoisted(() => ({ data: undefined }))
vi.mock('../../leads', () => ({ useLeadLog: () => state }))
vi.mock('./CustomerDealBadge', () => ({ CustomerDealBadge: () => <span>embedded-link</span> }))
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }))
afterEach(() => { cleanup(); state.data = undefined })

it('shows the linked deal name with its destination', () => {
  state.data = { linked: true, deal: { deal_id: 14, deal_name: 'Tower' } }
  render(<MemoryRouter><CustomerActivityLinkBadge customer={{ lead_id: 16 }} /></MemoryRouter>)
  expect(screen.getByRole('link').getAttribute('href')).toBe('/deals/14')
  expect(screen.getByRole('link').textContent).toContain('Tower')
})

it('honors explicit unlinked rather than stale embedded linkage', () => {
  state.data = { linked: false }
  render(<CustomerActivityLinkBadge customer={{ lead_id: 16 }} />)
  expect(screen.getByText('customers.activityContext.unlinked')).toBeTruthy()
  expect(screen.queryByText('embedded-link')).toBeNull()
})

it('does not claim unlinked while metadata is unavailable', () => {
  render(<CustomerActivityLinkBadge customer={{ lead_id: 16 }} />)
  expect(screen.queryByText('customers.activityContext.unlinked')).toBeNull()
  expect(screen.getByText('embedded-link')).toBeTruthy()
})
