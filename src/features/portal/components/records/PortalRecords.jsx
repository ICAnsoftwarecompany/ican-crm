import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft } from 'lucide-react'
import { cn } from '../../../../shared/utils/cn'
import { portalEndpoints as P } from '../../../service/portal-transport'
import { usePortalList } from '../../api/portalApi'
import { usePortalAccess } from '../../hooks/usePortalAccess'
import { usePortalFormat } from '../../utils/format'
import { PortalPage, StatusPill, categoryTone } from '../PortalPage'

/** "My services": the customer's records of every permitted type (bookings, enrollments, shipments…). */
export function PortalRecords() {
  const { t } = useTranslation()
  const format = usePortalFormat()
  const { recordTypes } = usePortalAccess()
  const [type, setType] = useState('')
  const query = usePortalList('records', P.records, type ? { type } : undefined)
  const records = query.data || []

  return (
    <PortalPage title={t('portal.sections.records')} description={t('portal.records.description')} query={query} empty={!records.length} emptyTitle={t('portal.records.empty')}
      actions={recordTypes.length > 1 && (
        <div className="flex flex-wrap gap-1 rounded-lg bg-[var(--surface-2)] p-1">
          {[{ key: '' }, ...recordTypes].map((entry) => (
            <button key={entry.key || 'all'} type="button" aria-pressed={type === entry.key} onClick={() => setType(entry.key)} className={cn('rounded-md px-3 py-1 text-sm', type === entry.key ? 'bg-[var(--surface)] font-semibold shadow-sm' : 'text-[var(--text-muted)]')}>
              {entry.key ? format.label(entry.label, entry.key) : t('portal.records.all')}
            </button>
          ))}
        </div>
      )}
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {records.map((record) => (
          <li key={record.id}>
            <Link to={`/services/${record.id}`} className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-brand-accent">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-[var(--text-muted)]">{format.label(record.type?.label)} · <span dir="ltr" className="font-mono">{record.reference_no}</span></span>
                <StatusPill tone={categoryTone(record.status?.category)}>{format.label(record.status?.label)}</StatusPill>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {record.fields.slice(0, 3).map((field) => <span key={field.key}><span className="text-[var(--text-muted)]">{format.label(field.label)}: </span><bdi>{field.type === 'money' ? format.money(field.value) : String(field.value)}</bdi></span>)}
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                {record.expected_at ? t('portal.records.expected', { date: format.date(record.expected_at) }) : t('portal.records.since', { date: format.date(record.starts_at) })}
                <ChevronLeft size={14} aria-hidden="true" className="ms-auto ltr:rotate-180" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </PortalPage>
  )
}
