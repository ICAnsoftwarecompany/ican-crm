import { internalChatApi } from './internalChatApi'
import { extractConversationsList } from '../utils/conversationHelpers'

/** Follow numbered pagination rather than silently omitting groups beyond page one. */
export async function getAllChatConversations() {
  const conversations = new Map()
  for (let page = 1; ; page += 1) {
    const response = await internalChatApi.getConversations({ page, per_page: 100 })
    const list = extractConversationsList(response)
    list.forEach((item) => conversations.set(String(item.id ?? item.conversation_id), item))
    const pagination = response?.data?.last_page != null ? response.data : response
    if (pagination.last_page != null) {
      if (page >= Number(pagination.last_page)) break
    } else if (!pagination.next_page_url) break
    if (!list.length) break
  }
  return [...conversations.values()]
}
