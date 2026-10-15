import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { cn } from '../../../../shared/utils/cn'
import { useTeamMutations } from '../../../teams'
import { extractCreatedId } from '../../utils/dealWizard'
import { buildQuickTeamPayload, validateQuickTeam } from '../../utils/quickTeam'
import { FieldLabel, dealInputClass } from '../common/FieldLabel'
import { PersonSelect } from '../common/PersonSelect'

/**
 * Quick team (2026-10-16): create a sales team without leaving the wizard (`POST /teams/create`), then hand its id
 * back so the step adds it to the deal. Starts with the users already picked in the step.
 * `onCreated({ teamId, memberIds, replaceUsers })`; the teams list refreshes by itself (query invalidation).
 */
export function QuickTeamDialog({ open, users, initialMemberIds = [], onClose, onCreated }) {
  const { t } = useTranslation()
  const { create } = useTeamMutations()
  const [name, setName] = useState('')
  const [leaderId, setLeaderId] = useState('')
  const [memberIds, setMemberIds] = useState([])
  const [replaceUsers, setReplaceUsers] = useState(true)
  const [query, setQuery] = useState('')
  const [showErrors, setShowErrors] = useState(false)

  useEffect(() => {
    if (!open) return
    setName('')
    setLeaderId('')
    setMemberIds(initialMemberIds.map(String))
    setReplaceUsers(true)
    setQuery('')
    setShowErrors(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const errors = validateQuickTeam({ name, leaderId, memberIds })
  const err = (key) => (showErrors && errors[key] ? t(`dealWorkspace.wizard.errors.${errors[key]}`) : null)
  const visible = useMemo(() => {
    const text = query.trim().toLowerCase()
    return text ? users.filter((user) => `${user.name} ${user.meta || ''}`.toLowerCase().includes(text)) : users
  }, [query, users])
  const toggle = (id) => setMemberIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  const pickedFromStep = initialMemberIds.length > 0

  const submit = async () => {
    if (Object.keys(errors).length) {
      setShowErrors(true)
      return
    }
    const payload = buildQuickTeamPayload({ name, leaderId, memberIds })
    try {
      const teamId = extractCreatedId(await create.mutateAsync(payload), 'team')
      if (!teamId) {
        toast.warning(t('dealWorkspace.wizard.team.quick.noId'))
        onClose()
        return
      }
      toast.success(t('dealWorkspace.wizard.team.quick.created', { name: payload.name }))
      onCreated({ teamId: String(teamId), memberIds: payload.members.map(String), replaceUsers: pickedFromStep && replaceUsers })
    } catch (error) {
      toast.error(extractMessage(error, t('dealWorkspace.wizard.team.quick.failed')))
    }
  }

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={submit}
      loading={create.isPending}
      size="lg"
      title={t('dealWorkspace.wizard.team.quick.title')}
      description={t('dealWorkspace.wizard.team.quick.description')}
      submitText={t('dealWorkspace.wizard.team.quick.submit')}
      cancelText={t('dealWorkspace.wizard.cancel')}
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldLabel label={t('dealWorkspace.wizard.team.quick.name')} hint={t('dealWorkspace.wizard.team.quick.nameHint')} error={err('name')}>
            <input className={dealInputClass} value={name} onChange={(event) => setName(event.target.value)} placeholder={t('dealWorkspace.wizard.team.quick.namePlaceholder')} />
          </FieldLabel>
          <FieldLabel label={t('dealWorkspace.wizard.team.quick.leader')} hint={t('dealWorkspace.wizard.team.quick.leaderHint')}>
            <PersonSelect people={users} value={leaderId} onChange={setLeaderId} placeholder={t('dealWorkspace.wizard.team.quick.noLeader')} />
          </FieldLabel>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-[var(--text)]">{t('dealWorkspace.wizard.team.quick.members', { count: memberIds.length })}</legend>
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute start-3 top-3 text-[var(--text-muted)]" />
            <input className={`${dealInputClass} ps-8`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('dealWorkspace.wizard.team.search')} aria-label={t('dealWorkspace.wizard.team.search')} />
          </div>
          <ul className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-[var(--border)] p-1">
            {visible.map((user) => {
              const checked = memberIds.includes(user.id) || user.id === String(leaderId)
              return (
                <li key={user.id}>
                  <label className={cn('flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5', checked ? 'bg-[var(--brand-accent-soft)]' : 'hover:bg-[var(--surface-2)]')}>
                    <input type="checkbox" checked={checked} disabled={user.id === String(leaderId)} onChange={() => toggle(user.id)} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-[var(--text)]">{user.name}</span>
                      {user.id === String(leaderId)
                        ? <span className="block text-xs text-[var(--text-muted)]">{t('dealWorkspace.wizard.team.quick.leaderMember')}</span>
                        : user.meta && <span className="block truncate text-xs text-[var(--text-muted)]">{user.meta}</span>}
                    </span>
                  </label>
                </li>
              )
            })}
            {!visible.length && <li className="p-3 text-center text-xs text-[var(--text-muted)]">{t('dealWorkspace.wizard.team.noMatch')}</li>}
          </ul>
          {err('members') && <p className="text-xs text-red-600 dark:text-red-400">{err('members')}</p>}
        </fieldset>

        {pickedFromStep && (
          <label className="flex items-start gap-2 text-sm text-[var(--text)]">
            <input type="checkbox" className="mt-1" checked={replaceUsers} onChange={(event) => setReplaceUsers(event.target.checked)} />
            <span>
              {t('dealWorkspace.wizard.team.quick.replaceUsers')}
              <span className="block text-xs text-[var(--text-muted)]">{t('dealWorkspace.wizard.team.quick.replaceUsersHint')}</span>
            </span>
          </label>
        )}
        <p className="text-xs leading-5 text-[var(--text-muted)]">{t('dealWorkspace.wizard.team.quick.footnote')}</p>
      </div>
    </FormDialog>
  )
}
