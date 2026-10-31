import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, UsersRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { useAuthStore } from '../../../store/authStore'
import { useUsers } from '../../users/hooks/useUsers'
import { useChatConversations, useChatConversationMutations } from '../hooks/useChatConversations'
import { getConversationId } from '../utils/conversationHelpers'

function normalizeUserId(user) {
  return Number(user?.id ?? user?.user_id ?? user?.userId)
}

export function InternalChatCreatePanel({ onCreated }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const currentUser = useAuthStore((state) => state.user)
  const currentUserId = Number(currentUser?.id ?? currentUser?.user_id ?? currentUser?.userId ?? 0)
  const usersQuery = useUsers()
  const conversationsQuery = useChatConversations({ per_page: 100 }, { enabled: true })
  const { createConversation } = useChatConversationMutations()

  const [mode, setMode] = useState('direct')
  const [groupName, setGroupName] = useState('')
  const [query, setQuery] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState([])
  const [creatingDirectUserId, setCreatingDirectUserId] = useState(null)

  const users = Array.isArray(usersQuery.data) ? usersQuery.data : []
  const conversations = Array.isArray(conversationsQuery.data) ? conversationsQuery.data : []

  const getSharedGroupCount = (userId) => {
    const targetUserId = Number(userId)
    if (!targetUserId || !currentUserId || targetUserId === currentUserId) return 0

    return conversations.filter((conversation) => {
      const type = String(conversation?.type || '').toLowerCase()
      if (type !== 'group') return false

      const memberIds = (Array.isArray(conversation?.users) ? conversation.users : Array.isArray(conversation?.members) ? conversation.members : [])
        .map((member) => Number(member?.id ?? member?.user_id ?? member?.userId ?? 0))
        .filter(Boolean)

      return memberIds.includes(currentUserId) && memberIds.includes(targetUserId)
    }).length
  }

  const filteredUsers = useMemo(() => {
    const value = String(query || '').trim().toLowerCase()
    if (!value) return users

    return users.filter((user) => {
      const text = [user?.name, user?.username, user?.email].filter(Boolean).join(' ').toLowerCase()
      return text.includes(value)
    })
  }, [query, users])

  const toggleSelectedUser = (userId) => {
    setSelectedUserIds((current) => {
      if (!Number.isFinite(userId)) return current
      const exists = current.includes(userId)
      return exists ? current.filter((id) => id !== userId) : [...current, userId]
    })
  }

  const createGroup = async () => {
    const trimmedName = String(groupName || '').trim()
    if (!trimmedName) {
      toast.error(t('communication.modules.team-chat.create.form.errors.groupNameRequired'))
      return
    }

    if (!selectedUserIds.length) {
      toast.error(t('communication.modules.team-chat.create.form.errors.groupMembersRequired'))
      return
    }

    try {
      const response = await createConversation.mutateAsync({
        type: 'group',
        name: trimmedName,
        user_ids: selectedUserIds,
      })
      const conversationId = getConversationId(response?.data || response)
      toast.success(t('communication.modules.team-chat.create.form.messages.groupCreated'))
      setGroupName('')
      setSelectedUserIds([])
      onCreated?.()
      navigate(conversationId ? `/team-chat?conversation=${encodeURIComponent(String(conversationId))}` : '/team-chat')
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || t('communication.modules.team-chat.create.form.errors.createFailed'))
    }
  }

  const createDirectConversation = async (userId) => {
    if (!Number.isFinite(userId)) return

    try {
      setCreatingDirectUserId(userId)
      const response = await createConversation.mutateAsync({
        type: 'direct',
        user_ids: [userId],
      })
      const conversationId = getConversationId(response?.data || response)
      toast.success(t('communication.modules.team-chat.create.form.messages.directCreated'))
      onCreated?.()
      navigate(conversationId ? `/team-chat?conversation=${encodeURIComponent(String(conversationId))}` : '/team-chat')
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || t('communication.modules.team-chat.create.form.errors.createFailed'))
    } finally {
      setCreatingDirectUserId(null)
    }
  }

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
          <UsersRound size={18} />
        </span>
        <div>
          <h3 className="text-sm font-black text-[var(--text)]">{t('communication.modules.team-chat.create.title')}</h3>
          <p className="text-xs font-semibold text-[var(--text-muted)]">{t('communication.modules.team-chat.create.description')}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-1">
          {[
            { id: 'direct', label: t('communication.modules.team-chat.create.form.mode.direct') },
            { id: 'group', label: t('communication.modules.team-chat.create.form.mode.group') },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={[
                'h-9 rounded-lg px-3 text-xs font-black transition-colors',
                mode === item.id
                  ? 'bg-[var(--brand-accent)] text-white shadow-sm'
                  : 'bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface)]',
              ].join(' ')}
            >
              {item.label}
            </button>
          ))}
        </div>

        {mode === 'group' ? (
          <>
            <div>
              <label className="mb-1 block text-xs font-bold text-[var(--text-muted)]">
                {t('communication.modules.team-chat.create.form.groupName')}
              </label>
              <input
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
                placeholder={t('communication.modules.team-chat.create.form.groupNamePlaceholder')}
                className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--text)] outline-none focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
              />
            </div>

            <label className="relative block">
              <Search size={14} className="pointer-events-none absolute start-2.5 top-2.5 text-[var(--text-muted)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('communication.modules.team-chat.create.form.searchUsersPlaceholder')}
                className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] ps-8 pe-3 text-xs font-semibold text-[var(--text)] outline-none focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
              />
            </label>

            <div className="max-h-[52vh] overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2">
              {usersQuery.isLoading ? (
                <p className="text-xs font-semibold text-[var(--text-muted)]">{t('common.loading')}</p>
              ) : filteredUsers.length ? (
                filteredUsers.map((user) => {
                  const userId = normalizeUserId(user)
                  const selected = selectedUserIds.includes(userId)
                  return (
                    <div key={String(userId || user?.email || user?.username)} className="mb-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 last:mb-0">
                      <div className="flex items-center justify-between gap-2">
                        <label className="flex min-w-0 items-center gap-2 text-xs font-semibold text-[var(--text)]">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleSelectedUser(userId)}
                            className="h-3.5 w-3.5 rounded border-[var(--border)] accent-[#00C2CB]"
                          />
                          <span className="truncate">{user?.name || user?.username || user?.email || t('communication.modules.team-chat.create.form.userFallback')}</span>
                        </label>
                        {selected ? (
                          <span className="rounded-full bg-[var(--brand-accent-soft)] px-2 py-0.5 text-[10px] font-black text-[var(--brand-accent)]">
                            {t('communication.modules.team-chat.create.form.sharedGroups', { count: getSharedGroupCount(userId) })}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-xs font-semibold text-[var(--text-muted)]">{t('communication.modules.team-chat.create.form.noUsers')}</p>
              )}
            </div>

            <button
              type="button"
              onClick={createGroup}
              disabled={createConversation.isPending || !groupName.trim() || !selectedUserIds.length}
              className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-[var(--brand-accent)] px-3 text-xs font-black text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createConversation.isPending
                ? t('communication.modules.team-chat.create.form.creatingGroup')
                : t('communication.modules.team-chat.create.form.createGroup')}
            </button>
          </>
        ) : (
          <>
            <label className="relative block">
              <Search size={14} className="pointer-events-none absolute start-2.5 top-2.5 text-[var(--text-muted)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('communication.modules.team-chat.create.form.searchUsersPlaceholder')}
                className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] ps-8 pe-3 text-xs font-semibold text-[var(--text)] outline-none focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
              />
            </label>

            <div className="max-h-[52vh] overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2">
              {usersQuery.isLoading ? (
                <p className="text-xs font-semibold text-[var(--text-muted)]">{t('common.loading')}</p>
              ) : filteredUsers.length ? (
                filteredUsers.map((user) => {
                  const userId = normalizeUserId(user)
                  return (
                    <div key={String(userId || user?.email || user?.username)} className="mb-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 last:mb-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 text-xs font-semibold text-[var(--text)]">
                          <div className="truncate">{user?.name || user?.username || user?.email || t('communication.modules.team-chat.create.form.userFallback')}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => createDirectConversation(userId)}
                          disabled={createConversation.isPending || creatingDirectUserId === userId}
                          className="inline-flex h-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-[10px] font-black text-[var(--brand-accent)] transition-colors hover:bg-[var(--brand-accent-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {creatingDirectUserId === userId
                            ? t('communication.modules.team-chat.create.form.creatingDirect')
                            : t('communication.modules.team-chat.create.form.startDirect')}
                        </button>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-xs font-semibold text-[var(--text-muted)]">{t('communication.modules.team-chat.create.form.noUsers')}</p>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
