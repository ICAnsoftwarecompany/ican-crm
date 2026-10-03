import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { useTeams } from '../../../teams'
import { useUsers } from '../../../users'
import { TEAM_ROLES } from '../../constants/dealOptions'
import { FieldLabel, dealInputClass } from '../common/FieldLabel'
import { PersonSelect } from '../common/PersonSelect'

/** Step 4 — who works on the deal: users or whole teams, each with a role (a user OR a team per row). */
export function TeamStep({ value, onChange, ownerId, errors = {} }) {
  const { t } = useTranslation()
  const usersQuery = useUsers()
  const teamsQuery = useTeams()
  const users = (usersQuery.data || []).map((user) => ({ id: String(user.id), name: user.name || user.email || '' }))
  const teams = (teamsQuery.data || []).map((team) => ({ id: String(team.id), name: team.name || '' }))
  const [row, setRow] = useState({ kind: 'user', refId: '', role: 'sales_rep' })
  const nameOf = (member) => (member.kind === 'team' ? teams : users).find((item) => item.id === String(member.refId))?.name || `#${member.refId}`
  const owner = users.find((user) => user.id === String(ownerId))

  const add = () => {
    if (!row.refId) return
    onChange({ members: [...value.members, row] })
    setRow({ ...row, refId: '' })
  }
  const updateRole = (index, role) => onChange({ members: value.members.map((member, position) => (position === index ? { ...member, role } : member)) })

  return (
    <div className="space-y-4">
      <div className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 sm:grid-cols-[8rem_minmax(0,1fr)_10rem_auto] sm:items-end">
        <FieldLabel label={t('dealWorkspace.team.add.kind')}>
          <select className={dealInputClass} value={row.kind} onChange={(event) => setRow({ ...row, kind: event.target.value, refId: '' })}>
            {['user', 'team'].map((kind) => <option key={kind} value={kind}>{t(`dealWorkspace.team.add.kinds.${kind}`)}</option>)}
          </select>
        </FieldLabel>
        <FieldLabel label={t(`dealWorkspace.team.add.kinds.${row.kind}`)}>
          <PersonSelect people={row.kind === 'team' ? teams : users} value={row.refId} onChange={(refId) => setRow({ ...row, refId })} />
        </FieldLabel>
        <FieldLabel label={t('dealWorkspace.team.role')}>
          <select className={dealInputClass} value={row.role} onChange={(event) => setRow({ ...row, role: event.target.value })}>
            {TEAM_ROLES.map((role) => <option key={role} value={role}>{t(`dealWorkspace.options.teamRole.${role}`)}</option>)}
          </select>
        </FieldLabel>
        <Button type="button" onClick={add} disabled={!row.refId}><Plus size={15} />{t('dealWorkspace.team.add.submit')}</Button>
      </div>

      {owner && (
        <label className="flex items-center gap-2 text-sm text-[var(--text)]">
          <input type="checkbox" checked={value.addOwner} onChange={(event) => onChange({ addOwner: event.target.checked })} />
          {t('dealWorkspace.wizard.team.addOwner', { name: owner.name })}
        </label>
      )}

      {!value.members.length
        ? <p className="rounded-lg border border-dashed border-[var(--border)] p-4 text-center text-sm text-[var(--text-muted)]">{t('dealWorkspace.wizard.team.none')}</p>
        : (
          <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            {value.members.map((member, index) => (
              <li key={`${member.kind}-${member.refId}-${index}`} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                <span className="min-w-0 text-sm text-[var(--text)]"><span className="text-xs text-[var(--text-muted)]">{t(`dealWorkspace.team.add.kinds.${member.kind}`)} · </span>{nameOf(member)}</span>
                <span className="flex items-center gap-2">
                  <select className={`${dealInputClass} h-8 w-36`} value={member.role} onChange={(event) => updateRole(index, event.target.value)} aria-label={t('dealWorkspace.team.role')}>
                    {TEAM_ROLES.map((role) => <option key={role} value={role}>{t(`dealWorkspace.options.teamRole.${role}`)}</option>)}
                  </select>
                  <button type="button" onClick={() => onChange({ members: value.members.filter((_, position) => position !== index) })} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-red-600" aria-label={t('dealWorkspace.team.remove')}><Trash2 size={15} /></button>
                </span>
              </li>
            ))}
          </ul>
        )}
      {errors.members && <p className="text-xs text-red-600 dark:text-red-400">{t(`dealWorkspace.wizard.errors.${errors.members}`)}</p>}
      <p className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.team.add.notifyHint')}</p>
    </div>
  )
}
