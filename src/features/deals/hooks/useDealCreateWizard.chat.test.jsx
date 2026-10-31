// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, it, vi } from 'vitest'
const { create, attach, createChat, list, users } = vi.hoisted(() => ({ create: vi.fn(), attach: vi.fn(), createChat: vi.fn(), list: vi.fn(), users: vi.fn() }))
vi.mock('../api', () => ({ dealsApi: { create }, dealResourcesApi: { addTeamMembers: attach }, dealCampaignsApi: {}, dealLeadsApi: {}, pipelineTemplatesApi: {} }))
vi.mock('../../internal-chat', () => ({ chatKeys: { all: ['internal-chat'] }, getAllChatConversations: list }))
vi.mock('../utils/dealChat', () => ({ canOfferDealChat: () => true, createDealChat: createChat, resolveWizardChatUsers: users, nextDealGroupName: () => 'Tower - G1' }))
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }))
import { useDealCreateWizard } from './useDealCreateWizard'
import { createWizardState } from '../utils/dealWizard'
import { STORAGE_KEY_PREFIX, STORAGE_VERSION } from '../../../shared/components/data-table/constants'

afterEach(() => { cleanup(); localStorage.clear(); vi.clearAllMocks() })
function setup() {
  const state = createWizardState()
  state.pipeline.templateId = '5'
  state.basics.name = 'Tower'
  state.team = { members: [{ kind: 'team', refId: '8', role: 'sales_rep' }], addOwner: false, createChat: true }
  state.source.mode = 'later'
  localStorage.setItem(`${STORAGE_KEY_PREFIX}deals:create-wizard:draft`, JSON.stringify({ _version: STORAGE_VERSION, value: { state } }))
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return renderHook(() => useDealCreateWizard(), { wrapper: ({ children }) => <MemoryRouter><QueryClientProvider client={client}>{children}</QueryClientProvider></MemoryRouter> })
}
it('creates chat only after deal/team and resumes without recreating either on failure', async () => {
  const order = []
  create.mockImplementation(async () => { order.push('deal'); return { data: { id: 12 } } })
  attach.mockImplementation(async () => { order.push('team') })
  list.mockResolvedValue([])
  users.mockResolvedValue([2, 3])
  createChat.mockRejectedValueOnce(new Error('Unavailable')).mockImplementationOnce(async () => { order.push('chat') })
  const hook = setup()
  await act(async () => { await hook.result.current.submit() })
  expect(hook.result.current.error.phase).toBe('chat')
  expect(hook.result.current.created.chatName).toBe('Tower - G1')
  await act(async () => { await hook.result.current.submit() })
  expect(create).toHaveBeenCalledTimes(1)
  expect(attach).toHaveBeenCalledTimes(1)
  expect(createChat).toHaveBeenLastCalledWith('Tower', [2, 3], 'Tower - G1')
  expect(order).toEqual(['deal', 'team', 'chat'])
})
it('recovers an accepted group after a failed response without a second POST', async () => {
  create.mockResolvedValue({ data: { id: 12 } })
  attach.mockResolvedValue({})
  list.mockResolvedValueOnce([]).mockResolvedValueOnce([{ id: 1, type: 'group', name: 'Tower - G1' }])
  users.mockResolvedValue([2, 3])
  createChat.mockRejectedValueOnce(new Error('Response lost'))
  const hook = setup()
  await act(async () => { await hook.result.current.submit() })
  await act(async () => { await hook.result.current.submit() })
  expect(createChat).toHaveBeenCalledTimes(1)
  expect(hook.result.current.error).toBeNull()
})
