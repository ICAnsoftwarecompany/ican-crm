// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LeadCreateDrawer } from './LeadCreateDrawer'
import { useAuthStore } from '../../../store/authStore'
import { buildLeadCreatePayload, emptyLeadForm } from './leadCreateModel'

window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
const { post } = vi.hoisted(() => ({ post: vi.fn() }))
vi.mock('../../../services/httpClient', () => ({ default: { post, get: async () => ({ data: { data: [] } }) } }))
vi.mock('../../users', () => ({ useUsers: () => ({ data: [{ id: 2, name: 'Agent' }] }) }))
vi.mock('../../products', () => ({ useCatalogProducts: () => ({ data: [] }) }))
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }))
vi.mock('sonner', () => ({ toast: { success: vi.fn() } }))
afterEach(() => { cleanup(); post.mockReset() })

function mount() {
  useAuthStore.setState({ user: { id: 2, tenant_id: 'tenant-test' } })
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const onClose = vi.fn()
  const onCreated = vi.fn()
  render(<QueryClientProvider client={client}><LeadCreateDrawer open onClose={onClose} onCreated={onCreated} /></QueryClientProvider>)
  return { onClose, onCreated, client }
}

describe('lead create drawer', () => {
  it('builds the supplied contract using current tenant/user and lead-only type', () => {
    const form = { ...emptyLeadForm({ id: 2 }), name: ' Ahmed ', phone: '0123', attributes: [{ key: 'budget', value: '5000' }], interesteds: [{ product_id: '1', note: '', interest_level: 'high' }] }
    expect(buildLeadCreatePayload(form, { tenantId: 'tenant-test', userId: 2 })).toMatchObject({ tenant_id: 'tenant-test', automatic_distribution: false, form_id: null, ad_id: null, campaign_id: null, customers: [{ type: 'lead', name: 'Ahmed', agent_id: 2, linked_by: 2, lead_id: null, attributes: { budget: '5000' }, interesteds: [{ product_id: 1, note: null, interest_level: 'high' }] }] })
  })
  it('stays open, resets fields and reports each successful save for live review', async () => {
    post.mockResolvedValue({ data: { success: true } })
    const { onClose, onCreated } = mount()
    for (const name of ['First', 'Second']) {
      fireEvent.change(screen.getByLabelText('customers.name'), { target: { value: name } })
      fireEvent.change(screen.getByLabelText('customers.phone'), { target: { value: '012345' } })
      fireEvent.submit(screen.getByRole('button', { name: 'customers.leadCreate.saveNext' }).closest('form'))
      await waitFor(() => expect(screen.getByLabelText('customers.name').value).toBe(''))
    }
    expect(post).toHaveBeenCalledTimes(2)
    expect(post.mock.calls[0][0]).toBe('/api/tenant/customers/create')
    expect(onCreated).toHaveBeenCalledTimes(2)
    expect(onClose).not.toHaveBeenCalled()
  })
  it('keeps entered data and does not add a review row on failure', async () => {
    post.mockRejectedValue(new Error('Rejected'))
    const { onCreated } = mount()
    fireEvent.change(screen.getByLabelText('customers.name'), { target: { value: 'Keep me' } })
    fireEvent.change(screen.getByLabelText('customers.phone'), { target: { value: '012345' } })
    fireEvent.submit(screen.getByRole('button', { name: 'customers.leadCreate.saveNext' }).closest('form'))
    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(screen.getByLabelText('customers.name').value).toBe('Keep me')
    expect(onCreated).not.toHaveBeenCalled()
  })
})
