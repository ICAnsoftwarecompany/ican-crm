import { create } from 'zustand'

export const useInternalChatUiStore = create((set) => ({
  activeConversationId: '',
  openedThreadId: '',
  detailsPanelOpen: true,
  sidebarCollapsed: false,
  replyingTo: null,
  editingMessage: null,
  drafts: {},
  quickPanelOpen: false,

  setActiveConversationId: (id) => set({ activeConversationId: String(id || '') }),
  setOpenedThreadId: (id) => set({ openedThreadId: String(id || '') }),
  setDetailsPanelOpen: (open) => set({ detailsPanelOpen: Boolean(open) }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: Boolean(collapsed) }),
  setReplyingTo: (message) => set({ replyingTo: message || null }),
  setEditingMessage: (message) => set({ editingMessage: message || null }),
  setQuickPanelOpen: (open) => set({ quickPanelOpen: Boolean(open) }),

  setDraft: (conversationId, text) => set((state) => ({
    drafts: {
      ...state.drafts,
      [String(conversationId || '')]: text,
    },
  })),
}))
