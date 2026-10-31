// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const createConversation = { mutateAsync: vi.fn(), isPending: false }

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock('../../users/hooks/useUsers', () => ({
  useUsers: () => ({
    data: [
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { id: 2, name: 'Bob', email: 'bob@example.com' },
    ],
    isLoading: false,
  }),
}))

vi.mock('../hooks/useChatConversations', () => ({
  useChatConversations: () => ({
    data: [{ id: 10, type: 'group', users: [{ id: 1 }, { id: 2 }] }],
    isLoading: false,
  }),
  useChatConversationMutations: () => ({
    createConversation,
  }),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const labels = {
        'communication.modules.team-chat.create.form.mode.group': 'إنشاء مجموعة',
        'communication.modules.team-chat.create.form.mode.direct': 'محادثة مباشرة جديدة',
        'communication.modules.team-chat.create.form.groupName': 'اسم المجموعة',
        'communication.modules.team-chat.create.form.searchUsersPlaceholder': 'ابحث عن مستخدم...',
        'communication.modules.team-chat.create.form.noUsers': 'لا يوجد مستخدمون متاحون.',
        'communication.modules.team-chat.create.form.userFallback': 'مستخدم',
        'communication.modules.team-chat.create.form.startDirect': 'ابدأ محادثة',
        'communication.modules.team-chat.create.form.creatingDirect': 'جاري الإنشاء...',
        'communication.modules.team-chat.create.form.createGroup': 'إنشاء المجموعة',
        'communication.modules.team-chat.create.form.creatingGroup': 'جاري إنشاء المجموعة...',
      }
      return labels[key] || key
    },
  }),
}))

import { InternalChatCreatePanel } from './InternalChatCreatePanel'

describe('InternalChatCreatePanel', () => {
  it('shows the two creation modes for team chat', () => {
    render(<InternalChatCreatePanel />)

    expect(screen.getByText('إنشاء مجموعة')).toBeTruthy()
    expect(screen.getByText('محادثة مباشرة جديدة')).toBeTruthy()
  })
})
