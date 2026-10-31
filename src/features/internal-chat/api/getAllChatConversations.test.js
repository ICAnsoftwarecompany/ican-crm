import { expect, it, vi } from 'vitest'
vi.mock('./internalChatApi', () => ({ internalChatApi: { getConversations: vi.fn() } }))
import { internalChatApi } from './internalChatApi'
import { getAllChatConversations } from './getAllChatConversations'
it('loads every page before filtering or numbering deal groups', async () => {
  internalChatApi.getConversations.mockResolvedValueOnce({ data: { data: [{ id: 1 }], current_page: 1, last_page: 2 } }).mockResolvedValueOnce({ data: { data: [{ id: 2 }], current_page: 2, last_page: 2 } })
  expect(await getAllChatConversations()).toEqual([{ id: 1 }, { id: 2 }])
  expect(internalChatApi.getConversations).toHaveBeenLastCalledWith({ page: 2, per_page: 100 })
})
