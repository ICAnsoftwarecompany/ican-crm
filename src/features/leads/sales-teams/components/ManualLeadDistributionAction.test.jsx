// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getManualDistributionLeadIds, ManualLeadDistributionAction } from './ManualLeadDistributionAction'

const { post, success, error } = vi.hoisted(() => ({ post: vi.fn(), success: vi.fn(), error: vi.fn() }))
vi.mock('../../../../services/httpClient', () => ({ default: { post } }))
vi.mock('sonner', () => ({ toast: { success, error } }))
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }))
afterEach(() => { cleanup(); vi.clearAllMocks() })

function mount(rows, clearSelection = vi.fn()) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  render(<QueryClientProvider client={client}><ManualLeadDistributionAction selectedRows={rows} clearSelection={clearSelection} /></QueryClientProvider>)
  return clearSelection
}

describe('manual lead distribution', () => {
  it('uses linked lead IDs, deduplicates them and rejects customer IDs without a lead', () => {
    expect(getManualDistributionLeadIds([{ id: 100, lead_id: '48' }, { id: 101, lead: { id: 49 } }, { lead_id: 48 }])).toEqual([48, 49])
    expect(getManualDistributionLeadIds([{ id: 100 }])).toBeNull()
    expect(getManualDistributionLeadIds([{ lead_id: 0 }])).toBeNull()
  })

  it('posts only selected lead IDs and clears selection after success', async () => {
    post.mockResolvedValue({ data: { success: true } })
    const clearSelection = mount([{ id: 100, lead_id: 48 }, { id: 101, lead_id: 49 }])
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => expect(clearSelection).toHaveBeenCalledOnce())
    expect(post).toHaveBeenCalledWith('/api/tenant/leads/manual/lead/distribution', { lead_ids: [48, 49] })
    expect(success).toHaveBeenCalled()
  })

  it('keeps selection when the backend rejects distribution', async () => {
    post.mockResolvedValue({ data: { success: false, message: 'Rejected' } })
    const clearSelection = mount([{ lead_id: 48 }])
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => expect(error).toHaveBeenCalled())
    expect(clearSelection).not.toHaveBeenCalled()
  })

  it('disables distribution for empty or invalid selections', () => {
    mount([{ id: 100 }])
    expect(screen.getByRole('button').disabled).toBe(true)
    expect(post).not.toHaveBeenCalled()
  })
})
