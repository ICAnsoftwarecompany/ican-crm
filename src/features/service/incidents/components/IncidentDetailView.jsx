import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowLeft, Globe, Lock } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { formatRelativeTime } from '../../../../shared/utils/dateTime'
import { getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { CaseStatusBadge } from '../../cases/components/CaseBadges'
import { useIncident, useIncidentMutations } from '../api/incidentsApi'
import { INCIDENT_STATUSES, IncidentSeverity, IncidentStatus } from './IncidentBadges'

const TEXTAREA = 'min-h-[72px] w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-brand-accent'

/** One major incident: status updates (internal or public, optionally sent to every linked request) and linked requests. */
export function IncidentDetailView({ incidentId }) {
  const { t, i18n } = useTranslation()
  const incident = useIncident(incidentId)
  const { update, link } = useIncidentMutations()
  const [form, setForm] = useState({ status: '', message: '', public: true, notify_linked: true })
  const [numbers, setNumbers] = useState('')
  const errors = getServiceFieldErrors(update.error)
  const data = incident.data
  const post = () => update.mutate({ id: incidentId, ...form, status: form.status || data.status }, { onSuccess: () => { toast.success(t('service.incidents.done.updated')); setForm((current) => ({ ...current, message: '' })) } })
  const addLinks = () => link.mutate({ id: incidentId, case_numbers: numbers.split(/[\s,]+/).filter(Boolean) }, { onSuccess: () => { toast.success(t('service.incidents.done.linked')); setNumbers('') } })
  return (
    <div className="grid gap-4">
      <Link to="/service/incidents" className="inline-flex w-fit items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"><ArrowLeft size={16} aria-hidden="true" className="rtl:-scale-x-100" />{t('service.incidents.back')}</Link>
      <ResourceState isLoading={incident.isLoading} error={incident.error} onRetry={incident.refetch}>
        {data && (
          <>
            <header className="grid gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
              <span className="flex flex-wrap items-center gap-2 text-xs"><span dir="ltr" className="font-mono text-[var(--text-muted)]">{data.number}</span><IncidentSeverity severity={data.severity} /><IncidentStatus status={data.status} /></span>
              <h1 className="text-lg font-bold text-[var(--text)]"><bdi>{data.title}</bdi></h1>
              <p className="text-xs text-[var(--text-muted)]">{t('service.incidents.startedBy', { name: data.owner?.name, when: formatRelativeTime(data.started_at, i18n.language) })}</p>
            </header>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
              <section className="grid content-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                <h2 className="text-sm font-semibold text-[var(--text)]">{t('service.incidents.updates')}</h2>
                {data.status !== 'resolved' && (
                  <div className="grid gap-2 rounded-md border border-[var(--border)] p-3">
                    <Select label={t('service.incidents.fields.status')} value={form.status || data.status} onChange={(status) => setForm((current) => ({ ...current, status }))} options={INCIDENT_STATUSES.map((value) => ({ value, label: t(`service.incidents.statuses.${value}`) }))} />
                    <textarea dir="auto" aria-label={t('service.incidents.fields.message')} placeholder={t('service.incidents.fields.message')} className={TEXTAREA} value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} />
                    {errors.message && <p className="text-xs text-status-lost">{t('service.settings.validation.required')}</p>}
                    <label className="inline-flex items-center gap-2 text-sm text-[var(--text)]"><input type="checkbox" checked={form.public} onChange={(event) => setForm((current) => ({ ...current, public: event.target.checked, notify_linked: event.target.checked && current.notify_linked }))} />{t('service.incidents.fields.public')}</label>
                    {form.public && <label className="inline-flex items-center gap-2 text-sm text-[var(--text)]"><input type="checkbox" checked={form.notify_linked} onChange={(event) => setForm((current) => ({ ...current, notify_linked: event.target.checked }))} />{t('service.incidents.fields.notifyLinked', { count: data.open_linked })}</label>}
                    <Button className="w-fit" loading={update.isPending} disabled={!form.message.trim()} onClick={post}>{t('service.incidents.postUpdate')}</Button>
                  </div>
                )}
                <ol className="grid gap-3">
                  {data.updates.map((entry) => (
                    <li key={entry.id} className="grid gap-1 border-s-2 border-[var(--border)] ps-3">
                      <span className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]"><IncidentStatus status={entry.status} />{entry.public ? <Globe size={12} aria-label={t('service.incidents.public')} /> : <Lock size={12} aria-label={t('service.incidents.internal')} />}{[entry.by?.name, formatRelativeTime(entry.at, i18n.language)].filter(Boolean).join(' · ')}</span>
                      <p dir="auto" className="text-sm text-[var(--text)]">{entry.message}</p>
                    </li>
                  ))}
                </ol>
              </section>
              <section className="grid content-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                <h2 className="text-sm font-semibold text-[var(--text)]">{t('service.incidents.linkedTitle', { count: data.linked_count })}</h2>
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                  <Input dir="ltr" label={t('service.incidents.fields.caseNumbers')} placeholder={t('service.incidents.caseNumbersExample')} value={numbers} onChange={(event) => setNumbers(event.target.value)} error={link.error?.response?.status === 422 && t('service.incidents.notFound')} />
                  <Button variant="outline" loading={link.isPending} disabled={!numbers.trim()} onClick={addLinks}>{t('service.incidents.link')}</Button>
                </div>
                <ul className="grid gap-1.5">
                  {data.cases.map((item) => (
                    <li key={item.id}><Link to={`/service/cases/${item.id}`} className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-[var(--surface-2)]"><span className="grid min-w-0"><bdi className="truncate text-[var(--text)]">{item.subject}</bdi><span className="text-xs text-[var(--text-muted)]"><span dir="ltr">{item.case_number}</span> · {item.customer?.name}</span></span><CaseStatusBadge status={item.status} /></Link></li>
                  ))}
                </ul>
              </section>
            </div>
          </>
        )}
      </ResourceState>
    </div>
  )
}
