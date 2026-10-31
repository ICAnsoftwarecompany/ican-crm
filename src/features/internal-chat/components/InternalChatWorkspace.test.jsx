// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
const { messages, markRead } = vi.hoisted(() => ({ messages: vi.fn(() => ({ data: [] })), markRead: vi.fn() }))
vi.mock('../../conversations', () => ({ ConversationThread: ({ title }) => <div data-testid="thread">{title}</div> }))
vi.mock('../hooks/useChatConversations', () => ({
  useChatConversations: () => ({ data: [{ id: 99, name: 'Unrelated group' }] }),
  useChatConversationMutations: () => ({ markAsRead: { mutate: markRead } }),
}))
vi.mock('../hooks/useChatMessages', () => ({ useChatMessages: messages, useChatMessageMutations: () => ({ sendMessage: {} }) }))
vi.mock('../hooks/useChatRealtime', () => ({ useChatRealtime: () => ({}) }))
vi.mock('../../users/hooks/useUsers', () => ({
  useUsers: () => ({ data: [] }),
  useOnlineUsers: () => ({ data: [] }),
}))
vi.mock('../store/internalChatUiStore', () => ({
  useInternalChatUiStore: (select) => select({
    activeConversationId: 99,
    setActiveConversationId: vi.fn(),
    sidebarCollapsed: false,
    setSidebarCollapsed: vi.fn(),
    detailsPanelOpen: false,
    setDetailsPanelOpen: vi.fn(),
  }),
}))
import { InternalChatWorkspace } from './InternalChatWorkspace'
afterEach(() => { cleanup(); vi.clearAllMocks() })

it('isolates deal conversation list, selection and message requests from global chat', async () => {
  render(<InternalChatWorkspace scopeKey="deal-1" conversations={[{ id: 4, type: 'group', name: 'Tower - G1' }]} />)
  await waitFor(() => expect(screen.getByTestId('thread').textContent).toBe('Tower - G1'))
  expect(screen.queryByText('Unrelated group')).toBeNull()
  expect(messages.mock.calls.some(([id]) => id === 99)).toBe(false)
  expect(markRead).toHaveBeenCalledWith(4)
})
it('does not select or load an unrelated conversation when no deal groups exist', () => {
  render(<InternalChatWorkspace scopeKey="deal-1" conversations={[]} />)
  expect(screen.queryByText('Unrelated group')).toBeNull()
  expect(messages.mock.calls.some(([id]) => id === 99)).toBe(false)
  expect(markRead).not.toHaveBeenCalled()
})
