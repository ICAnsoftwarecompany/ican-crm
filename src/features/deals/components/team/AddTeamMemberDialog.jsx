import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { cn } from '../../../../shared/utils/cn'
import { TEAM_ROLES } from '../../constants/dealOptions'
import { useDealResourceMutations } from '../../hooks/useDealResources'
import { buildTeamMemberPayload } from '../../utils/dealTeam'
import { FieldLabel, dealInputClass } from '../common/FieldLabel'
import { PersonSelect } from '../common/PersonSelect'

/** Add ONE user or ONE team to the deal with a role (backend rule: never both in one assignment). */
export function AddTeamMemberDialog({ dealId, users = [], teams = [], open, onClose }) {
  const { t } = useTranslation()
  const [kind, setKind] = useState('user')
  const [refId, setRefId] = useState('')
  const [role, setRole] = useState('sales_rep')
  const { addTeamMember } = useDealResourceMutations(dealId)

  useEffect(() => {
    if (open) {
      setKind('user')
      setRefId('')
      setRole('sales_rep')
    }
  }, [open])

  const payload = buildTeamMemberPayload({ dealId, kind, refId, role })
  const submit = async () => {
    if (!payload) return
    try {
      await addTeamMember.mutateAsync(payload)
      toast.success(t(kind === 'team' ? 'dealWorkspace.team.add.teamAdded' : 'dealWorkspace.team.add.userAdded'))
      onClose()
    } catch (error) {
      toast.error(extractMessage(error, t('dealWorkspace.team.add.failed')))
    }
  }

  return (
    <FormDialog open={open} onClose={onClose} onSubmit={submit} size="sm" loading={addTeamMember.isPending} submitDisabled={!payload} title={t('dealWorkspace.team.add.title')} description={t('dealWorkspace.team.add.description')} submitText={t('dealWorkspace.team.add.submit')}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t('dealWorkspace.team.add.kind')}>
          {['user', 'team'].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={kind === value}
              onClick={() => { setKind(value); setRefId('') }}
              className={cn('h-10 rounded-lg border text-sm font-semibold', kind === value ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-muted)]')}
            >
              {t(`dealWorkspace.team.add.kinds.${value}`)}
            </button>
          ))}
        </div>
        <FieldLabel label={t(`dealWorkspace.team.add.kinds.${kind}`)}>
          <PersonSelect people={kind === 'team' ? teams.map((team) => ({ id: String(team.id), name: team.name })) : users} value={refId} onChange={setRefId} />
        </FieldLabel>
        <FieldLabel label={t('dealWorkspace.team.role')} hint={t(`dealWorkspace.team.roleHints.${role}`)}>
          <select className={dealInputClass} value={role} onChange={(event) => setRole(event.target.value)}>
            {TEAM_ROLES.map((value) => <option key={value} value={value}>{t(`dealWorkspace.options.teamRole.${value}`)}</option>)}
          </select>
        </FieldLabel>
        <p className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.team.add.notifyHint')}</p>
      </div>
    </FormDialog>
  )
}
