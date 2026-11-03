import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUsers } from '../../users'
import { useTeams } from '../../teams'
import { useCreateMention } from '../hooks/useMentions'

export function MentionComposer({ entityType, entityId, onCreated }) {
  const { t } = useTranslation()
  const [userIds, setUserIds] = useState([])
  const [teamIds, setTeamIds] = useState([])
  const [type, setType] = useState('view')
  const [message, setMessage] = useState('')
  const users = useUsers()
  const teams = useTeams()
  const create = useCreateMention()
  const toggle = (setter, id) => setter(previous => previous.includes(id)
    ? previous.filter(value => value !== id) : [...previous, id])
  const canSubmit = Boolean((userIds.length > 0 || teamIds.length > 0) && message.trim() && !create.isPending && !users.isPending && !teams.isPending && !users.isError && !teams.isError)

  async function submit(event) {
    event.preventDefault()
    if (!canSubmit) return
    try {
      await create.mutateAsync({
        entity_type: entityType,
        entity_id: entityId,
        user_ids: userIds,
        team_ids: teamIds,
        type,
        message: message.trim(),
      })
      setMessage('')
      setUserIds([])
      setTeamIds([])
      onCreated?.()
    } catch {
      // The mutation error is rendered below.
    }
  }

  return <form onSubmit={submit} className="space-y-3">
    <label className="block text-sm text-[var(--text)]">{t('mentions.recipients')}</label>
    {users.isPending || teams.isPending ? <p role="status">{t('mentions.loading')}</p> : null}
    {users.isError || teams.isError ? <p role="alert">{t('mentions.recipientsError')}</p> : null}
    <div className="max-h-36 space-y-1 overflow-y-auto rounded-lg border border-[var(--border)] p-2">
      {(users.data ?? []).filter(user => user.id != null).map(user =>
        <label key={user.id} className="flex items-center gap-2 text-sm text-[var(--text)]">
          <input type="checkbox" checked={userIds.includes(user.id)} onChange={() => toggle(setUserIds, user.id)} />
          <span>{user.name ?? user.username ?? user.email ?? user.id}</span>
        </label>)}
      {(teams.data ?? []).filter(team => team.id != null).map(team =>
        <label key={team.id} className="flex items-center gap-2 text-sm text-[var(--text)]">
          <input type="checkbox" checked={teamIds.includes(team.id)} onChange={() => toggle(setTeamIds, team.id)} />
          <span>{team.name ?? team.title ?? team.id} ({t('mentions.team')})</span>
        </label>)}
    </div>
    <label htmlFor="mention-type" className="block text-sm text-[var(--text)]">{t('mentions.kind')}</label>
    <select id="mention-type" value={type} onChange={event => setType(event.target.value)}
      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text)]">
      <option value="view">{t('mentions.view')}</option>
      <option value="action">{t('mentions.action')}</option>
      <option value="transfer">{t('mentions.transfer')}</option>
    </select>
    <label htmlFor="mention-message" className="block text-sm text-[var(--text)]">{t('mentions.message')}</label>
    <textarea id="mention-message" value={message} onChange={event => setMessage(event.target.value)}
      rows={3} maxLength={2000} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text)]" />
    {create.isError && <p role="alert" className="text-sm text-red-600">{t('mentions.sendError')}</p>}
    <button type="submit" disabled={!canSubmit || users.isError || teams.isError}
      className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text)] disabled:opacity-50">
      {create.isPending ? t('mentions.sending') : t('mentions.send')}
    </button>
  </form>
}
