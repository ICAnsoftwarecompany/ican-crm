import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Ban, MessagesSquare, UserPlus } from 'lucide-react'
import { cn } from '../../../../shared/utils/cn'
import { useChatConversations } from '../../../internal-chat'
import { collectTeamUserIds, nextDealGroupName, otherGroups } from '../../utils/dealGroups'
import { dealInputClass } from '../common/FieldLabel'

const MODES = [
  { id: 'new', icon: MessagesSquare },
  { id: 'existing', icon: UserPlus },
  { id: 'none', icon: Ban },
]
const CHAT_PARAMS = { per_page: 100 }

/**
 * Team step — internal chat group for the deal's sales team (2026-10-16):
 * - new: `POST /chat { type: 'group', name: '<deal name> G<n>', user_ids }` (G1, or the next number when groups with
 *   this deal name exist; the deal's groups page finds it by that name),
 * - existing: add the team to a group (`POST /chat/{id}/members { user_ids }`) — that group is not linked to the deal,
 * - none.
 * `value`: `team.chat` `{ mode, groupId, userIds }`; `userIds` is kept in sync here (it needs the teams' members).
 */
export function TeamChatGroupSection({ value, team, ownerId, dealName, teamsData = [], users = [], onChange, error }) {
  const { t, i18n } = useTranslation()
  const chatsQuery = useChatConversations(CHAT_PARAMS)
  const chats = useMemo(() => (Array.isArray(chatsQuery.data) ? chatsQuery.data : []), [chatsQuery.data])
  const groups = useMemo(() => otherGroups(chats, dealName).sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''))), [chats, dealName])
  const previewName = nextDealGroupName(dealName, chats)
  const userIds = useMemo(() => collectTeamUserIds({ members: team.members, ownerId, addOwner: team.addOwner, teams: teamsData }), [ownerId, team.addOwner, team.members, teamsData])
  const key = userIds.join(',')

  useEffect(() => {
    if ((value.userIds || []).join(',') !== key) onChange({ userIds })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const names = userIds.map((id) => users.find((user) => user.id === String(id))?.name || `#${id}`)
  const listed = names.length ? new Intl.ListFormat(i18n.language, { type: 'conjunction' }).format(names.slice(0, 5)) + (names.length > 5 ? ` +${names.length - 5}` : '') : ''

  return (
    <section className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
      <header>
        <h3 className="text-sm font-bold text-[var(--text)]">{t('dealWorkspace.wizard.team.chat.title')}</h3>
        <p className="text-xs leading-5 text-[var(--text-muted)]">{t('dealWorkspace.wizard.team.chat.description')}</p>
      </header>
      <div role="radiogroup" aria-label={t('dealWorkspace.wizard.team.chat.title')} className="grid gap-2 md:grid-cols-3">
        {MODES.map(({ id, icon: Icon }) => {
          const active = value.mode === id
          return (
            <label key={id} className={cn('flex cursor-pointer items-start gap-2 rounded-lg border p-2.5', active ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]' : 'border-[var(--border)] hover:bg-[var(--surface-2)]')}>
              <input type="radio" name="deal-team-chat" className="sr-only" checked={active} onChange={() => onChange({ mode: id })} aria-label={t(`dealWorkspace.wizard.team.chat.modes.${id}.title`)} />
              <Icon size={16} className={cn('mt-0.5 shrink-0', active ? 'text-[var(--brand-accent)]' : 'text-[var(--text-muted)]')} />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[var(--text)]">{t(`dealWorkspace.wizard.team.chat.modes.${id}.title`)}</span>
                <span className="block text-xs leading-5 text-[var(--text-muted)]">{t(`dealWorkspace.wizard.team.chat.modes.${id}.text`)}</span>
              </span>
            </label>
          )
        })}
      </div>

      {value.mode === 'new' && (
        <p className="rounded-md bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)]">
          {t('dealWorkspace.wizard.team.chat.nameLabel')} <bdi className="font-bold">{dealName.trim() ? previewName : t('dealWorkspace.wizard.team.chat.nameMissing')}</bdi>
          <span className="block text-xs text-[var(--text-muted)]">{t('dealWorkspace.wizard.team.chat.nameHint')}</span>
        </p>
      )}

      {value.mode === 'existing' && (
        <label className="block space-y-1 text-sm text-[var(--text)]">
          <span className="font-medium">{t('dealWorkspace.wizard.team.chat.pickGroup')}</span>
          <select className={dealInputClass} value={value.groupId || ''} onChange={(event) => onChange({ groupId: event.target.value })} disabled={chatsQuery.isLoading}>
            <option value="">{chatsQuery.isLoading ? t('dealWorkspace.common.loading') : groups.length ? t('dealWorkspace.common.choose') : t('dealWorkspace.wizard.team.chat.noGroups')}</option>
            {groups.map((group) => <option key={group.id} value={group.id}>{group.name || group.display_name} ({t('dealWorkspace.wizard.team.membersCount', { count: group.users_count || 0 })})</option>)}
          </select>
          <span className="block text-xs text-[var(--text-muted)]">{t('dealWorkspace.wizard.team.chat.existingHint')}</span>
        </label>
      )}

      {value.mode !== 'none' && (
        <p className="text-xs text-[var(--text-muted)]">
          {listed ? t('dealWorkspace.wizard.team.chat.members', { count: userIds.length, names: listed }) : t('dealWorkspace.wizard.team.chat.noMembers')}
        </p>
      )}
      {chatsQuery.error && value.mode !== 'none' && <p className="text-xs text-amber-700 dark:text-amber-300">{t('dealWorkspace.wizard.team.chat.loadFailed')}</p>}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </section>
  )
}
