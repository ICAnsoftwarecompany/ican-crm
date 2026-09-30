import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { formatRelativeTime } from '../../../../shared/utils/dateTime'
import { cn } from '../../../../shared/utils/cn'
import { getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { useIncidentMutations, useIncidents } from '../api/incidentsApi'
import { INCIDENT_SEVERITIES, IncidentSeverity, IncidentStatus } from './IncidentBadges'

const TEXTAREA = 'min-h-[72px] w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-brand-accent'

/** /service/incidents — active and past major incidents; declare a new one. */
export function IncidentsWorkspace() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [status, setStatus] = useState('active')
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', severity: 'major', message: '', public: false })
  const incidents = useIncidents({ status: status || undefined })
  const { create } = useIncidentMutations()
  const errors = getServiceFieldErrors(create.error)
  const submit = () => create.mutate(form, { onSuccess: (incident) => { setCreating(false); navigate(`/service/incidents/${incident.id}`) } })
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2" role="tablist" aria-label={t('service.incidents.title')}>
          {['active', 'resolved', ''].map((key) => (
            <button key={key || 'all'} type="button" role="tab" aria-selected={status === key} onClick={() => setStatus(key)} className={cn('rounded-full border px-3 py-1 text-xs', status === key ? 'border-brand-accent font-semibold text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-muted)]')}>{t(`service.incidents.filters.${key || 'all'}`)}</button>
          ))}
        </div>
        <Button onClick={() => { setForm({ title: '', severity: 'major', message: '', public: false }); create.reset(); setCreating(true) }}><Plus size={16} aria-hidden="true" />{t('service.incidents.declare')}</Button>
      </div>
      <ResourceState isLoading={incidents.isLoading} error={incidents.error} onRetry={incidents.refetch} empty={!incidents.data?.length} emptyTitle={t('service.incidents.empty')}>
        <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          {(incidents.data || []).map((incident) => (
            <li key={incident.id}>
              <Link to={`/service/incidents/${incident.id}`} className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-[var(--surface-2)]">
                <span className="grid min-w-0 flex-1">
                  <span className="text-sm font-medium text-[var(--text)]"><span dir="ltr" className="font-mono text-xs text-[var(--text-muted)]">{incident.number}</span> <bdi>{incident.title}</bdi></span>
                  <span className="text-xs text-[var(--text-muted)]">{[t('service.incidents.linkedCount', { count: incident.linked_count, open: incident.open_linked }), formatRelativeTime(incident.started_at, i18n.language)].join(' · ')}</span>
                </span>
                <IncidentSeverity severity={incident.severity} />
                <IncidentStatus status={incident.status} />
              </Link>
            </li>
          ))}
        </ul>
      </ResourceState>
      <FormDialog open={creating} onClose={() => setCreating(false)} title={t('service.incidents.declare')} description={t('service.incidents.declareHint')} submitText={t('service.incidents.declare')} loading={create.isPending} onSubmit={submit}>
        <Input label={t('service.incidents.fields.title')} dir="auto" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} error={errors.title && t('service.settings.validation.required')} />
        <Select label={t('service.incidents.fields.severity')} value={form.severity} onChange={(severity) => setForm((current) => ({ ...current, severity: severity || 'major' }))} options={INCIDENT_SEVERITIES.map((value) => ({ value, label: t(`service.incidents.severities.${value}`) }))} />
        <label className="grid gap-1.5 text-sm font-medium text-[var(--text)]">
          {t('service.incidents.fields.firstUpdate')}
          <textarea dir="auto" className={TEXTAREA} value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} />
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-[var(--text)]"><input type="checkbox" checked={form.public} onChange={(event) => setForm((current) => ({ ...current, public: event.target.checked }))} />{t('service.incidents.fields.public')}</label>
      </FormDialog>
    </div>
  )
}
