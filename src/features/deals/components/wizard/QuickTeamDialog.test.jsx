// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { QuickTeamDialog } from './QuickTeamDialog'

const { post } = vi.hoisted(() => ({ post: vi.fn() }))
vi.mock('../../../../services/httpClient', () => ({ default: { post } }))
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), warning: vi.fn(), error: vi.fn() } }))
afterEach(() => { cleanup(); post.mockReset() })

function mount() {
  const onCreated = vi.fn()
  render(<QueryClientProvider client={new QueryClient()}><QuickTeamDialog open dealName="Deal" defaultLeaderId="1" users={[{ id: '1', name: 'Leader' }, { id: '2', name: 'Member' }]} initialMemberIds={['2']} onCreated={onCreated} onClose={() => {}} /></QueryClientProvider>)
  fireEvent.change(screen.getByLabelText(/^dealWorkspace.wizard.team.quick.name/), { target: { value: 'Sales' } })
  return onCreated
}

describe('deal quick team', () => {
  it('prefixes the deal name and submits the supplied JSON contract, reading the top-level team response', async () => {
    post.mockResolvedValue({ data: { message: 'Team created successfully', team: { id: 8 } } })
    const onCreated = mount()
    expect(screen.getByLabelText(/^dealWorkspace.wizard.team.quick.leader/).value).toBe('1')
    fireEvent.click(screen.getByText('dealWorkspace.wizard.team.quick.submit'))
    await waitFor(() => expect(onCreated).toHaveBeenCalled())
    expect(post).toHaveBeenCalledWith('/api/tenant/teams/create', { name: 'Deal - Sales', team_leader_id: '1', active: true, type: 'sales', members: [1, 2] })
    expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({ teamId: '8', memberIds: ['1', '2'] }))
  })

  it('shows backend validation details and preserves input when the request fails', async () => {
    post.mockRejectedValue({ response: { status: 422, data: { message: 'Validation failed', errors: { name: ['Name already exists'] } } } })
    const onCreated = mount()
    fireEvent.click(screen.getByText('dealWorkspace.wizard.team.quick.submit'))
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Name already exists')
    expect(screen.getByLabelText(/^dealWorkspace.wizard.team.quick.name/).value).toBe('Sales')
    expect(onCreated).not.toHaveBeenCalled()
  })
})
