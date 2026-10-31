// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CustomerTransferWorkspace } from './CustomerTransferWorkspace'
import { useAuthStore } from '../../../store/authStore'

const { post } = vi.hoisted(() => ({ post: vi.fn() }))
vi.mock('../../../services/httpClient', () => ({ default: { post } }))
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }))
vi.mock('./customerTransfer', () => ({ readCustomerFile: async () => [{ name: 'First', phone: '01', email: '', company: '' }, { name: 'Second', phone: '02', email: '', company: '' }], fetchAllCustomers: vi.fn() }))
vi.mock('../lead-create/LeadCreateDrawer', () => ({ LeadCreateDrawer: ({ onCreated }) => <button onClick={() => onCreated({ success: true }, [{ name: 'Manual customer', phone: '03' }])}>save manual customer</button> }))
afterEach(() => { cleanup(); post.mockReset() })
function mount() {
  useAuthStore.setState({ user: { id: 2, tenant_id: 'tenant-test' } })
  render(<QueryClientProvider client={new QueryClient()}><CustomerTransferWorkspace /></QueryClientProvider>)
}

describe('customer import workspace', () => {
  it('shows manually saved customers immediately and keeps the drawer mounted', async () => {
    mount()
    fireEvent.click(screen.getByText('customers.leadCreate.title'))
    fireEvent.click(screen.getByText('save manual customer'))
    expect(screen.getByText('Manual customer')).toBeTruthy()
    expect(screen.getByText('customers.transfer.saved')).toBeTruthy()
    expect(screen.getByText('save manual customer')).toBeTruthy()
    fireEvent.click(screen.getByRole('tab', { name: 'customers.transfer.export' }))
    expect(screen.getByText('customers.transfer.download')).toBeTruthy()
  })
  it('retries only failed import rows and never resends successful rows', async () => {
    let firstAttempts = 0
    post.mockImplementation(async (_url, payload) => ({ data: payload.customers[0].name === 'First' && firstAttempts++ === 0 ? { success: false, message: 'Rejected' } : { success: true } }))
    mount()
    fireEvent.change(screen.getByLabelText('customers.transfer.upload'), { target: { files: [new File([''], 'leads.csv')] } })
    await screen.findByDisplayValue('First')
    fireEvent.click(screen.getByText('customers.transfer.saveRows'))
    await waitFor(() => expect(screen.getByText('customers.transfer.saved')).toBeTruthy())
    expect(screen.getByText('Rejected')).toBeTruthy()
    await waitFor(() => expect(screen.getByText('customers.transfer.saveRows').closest('button').disabled).toBe(false))
    fireEvent.click(screen.getByText('customers.transfer.saveRows'))
    await waitFor(() => expect(screen.getAllByText('customers.transfer.saved')).toHaveLength(2))
    expect(post.mock.calls.map(([, payload]) => payload.customers[0].name)).toEqual(['First', 'Second', 'First'])
  })
})
