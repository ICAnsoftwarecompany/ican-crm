import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowRight, Upload } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { portalEndpoints as P } from '../../../service/portal-transport'
import { portalApi, usePortalDetail, usePortalMutation } from '../../api/portalApi'
import { usePortalAccess } from '../../hooks/usePortalAccess'
import { usePortalFormat } from '../../utils/format'
import { Card, PortalPage, StatusPill, categoryTone } from '../PortalPage'

const DOC_TONE = { missing: 'bad', uploaded: 'warn', verified: 'ok', rejected: 'bad' }

/** Uploads a required document. The mock stores the file name; the server stores the file and scans it. */
export function DocumentUploadButton({ document }) {
  const { t } = useTranslation()
  const input = useRef(null)
  const upload = usePortalMutation((file) => portalApi.post(P.documentUpload(document.id), { file_name: file.name }), { onSuccess: () => toast.success(t('portal.documents.uploaded')) })
  if (!['missing', 'rejected'].includes(document.status)) return null
  return (
    <>
      <input ref={input} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => event.target.files?.[0] && upload.mutate(event.target.files[0])} />
      <Button size="sm" variant="outline" loading={upload.isPending} onClick={() => input.current?.click()}><Upload size={14} aria-hidden="true" />{t('portal.documents.upload')}</Button>
    </>
  )
}

export function PortalRecordDetail() {
  const { t } = useTranslation()
  const format = usePortalFormat()
  const { recordId } = useParams()
  const { can } = usePortalAccess()
  const query = usePortalDetail('record', `${P.records}/${recordId}`)
  const record = query.data
  const [tab, setTab] = useState('overview')

  return (
    <PortalPage
      title={record ? `${format.label(record.type?.label)} · ${record.reference_no}` : t('portal.sections.records')}
      actions={<Link to="/services" className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"><ArrowRight size={16} aria-hidden="true" className="ltr:rotate-180" />{t('portal.records.back')}</Link>}
      query={query}
    >
      {record && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="grid content-start gap-4">
            <Card className="grid gap-3">
              <div className="flex items-center justify-between gap-2">
                <StatusPill tone={categoryTone(record.status?.category)}>{format.label(record.status?.label)}</StatusPill>
                <span className="text-xs text-[var(--text-muted)]">{record.expected_at ? t('portal.records.expected', { date: format.date(record.expected_at) }) : t('portal.records.since', { date: format.date(record.starts_at) })}</span>
              </div>
              <dl className="grid gap-2 sm:grid-cols-2">
                {record.fields.map((field) => (
                  <div key={field.key} className="grid">
                    <dt className="text-xs text-[var(--text-muted)]">{format.label(field.label)}</dt>
                    <dd className="text-sm font-medium"><bdi>{field.type === 'money' ? format.money(field.value) : String(field.value)}</bdi></dd>
                  </div>
                ))}
              </dl>
            </Card>
            <div className="flex gap-1 rounded-lg bg-[var(--surface-2)] p-1" role="tablist">
              {['overview', 'updates', record.entries.length && 'entries', record.documents.length && 'documents'].filter(Boolean).map((key) => (
                <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className={`rounded-md px-3 py-1 text-sm ${tab === key ? 'bg-[var(--surface)] font-semibold shadow-sm' : 'text-[var(--text-muted)]'}`}>{t(`portal.records.tabs.${key}`)}</button>
              ))}
            </div>
            {tab === 'overview' && (
              <Card className="grid gap-3">
                {record.participants.length > 0 && (
                  <div className="grid gap-1">
                    <h2 className="text-sm font-semibold">{t('portal.records.participants')}</h2>
                    <ul className="flex flex-wrap gap-2 text-sm">{record.participants.map((entry) => <li key={entry.id} className="rounded-full bg-[var(--surface-2)] px-3 py-1">{entry.name}</li>)}</ul>
                  </div>
                )}
                {record.components.length > 0 && (
                  <div className="grid gap-1">
                    <h2 className="text-sm font-semibold">{t('portal.records.components')}</h2>
                    <ul className="grid gap-1 text-sm">{record.components.map((entry) => <li key={entry.id} className="flex justify-between gap-2"><span>{format.label(entry.title)}</span><span className="text-xs text-[var(--text-muted)]">{t(`portal.records.componentStatuses.${entry.status}`, { defaultValue: entry.status })}</span></li>)}</ul>
                  </div>
                )}
                {!record.participants.length && !record.components.length && <p className="text-sm text-[var(--text-muted)]">{t('portal.records.nothingMore')}</p>}
              </Card>
            )}
            {tab === 'updates' && (
              <Card>
                {record.timeline.length ? (
                  <ol className="grid gap-3">{record.timeline.map((entry) => <li key={entry.id} className="grid gap-0.5 border-s-2 border-brand-accent ps-3 text-sm"><span>{entry.body ? <bdi>{entry.body}</bdi> : entry.payload?.to ? t('portal.records.statusChanged', { status: format.label(entry.payload.to.label) }) : t(`portal.records.events.${entry.event_type}`, { defaultValue: entry.event_type })}</span><span className="text-xs text-[var(--text-muted)]">{format.dateTime(entry.occurred_at)}</span></li>)}</ol>
                ) : <p className="text-sm text-[var(--text-muted)]">{t('portal.records.noUpdates')}</p>}
              </Card>
            )}
            {tab === 'entries' && (
              <Card>
                <ul className="divide-y divide-[var(--border)]">{record.entries.map((entry) => <li key={entry.id} className="flex justify-between gap-2 py-2 text-sm"><span>{format.label(entry.label, entry.entry_type)} · <bdi>{t(`portal.records.entryValues.${entry.value}`, { defaultValue: entry.value })}</bdi></span><span className="text-xs text-[var(--text-muted)]">{format.date(entry.occurred_at)}</span></li>)}</ul>
              </Card>
            )}
            {tab === 'documents' && (
              <Card>
                <ul className="divide-y divide-[var(--border)]">{record.documents.map((doc) => <li key={doc.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"><span>{t(`portal.documents.types.${doc.document_type}`, { defaultValue: doc.document_type })}{doc.file_name && <span dir="ltr" className="ms-2 text-xs text-[var(--text-muted)]">{doc.file_name}</span>}</span><span className="flex items-center gap-2"><StatusPill tone={DOC_TONE[doc.status]}>{t(`portal.documents.statuses.${doc.status}`)}</StatusPill>{can('document', 'upload') && <DocumentUploadButton document={doc} />}</span></li>)}</ul>
              </Card>
            )}
          </div>
          <Card className="grid content-start gap-2">
            <h2 className="text-sm font-semibold">{t('portal.records.needHelp')}</h2>
            <p className="text-xs text-[var(--text-muted)]">{t('portal.records.needHelpHint')}</p>
            {can('case', 'create') && <Link to={`/requests/new?about=${encodeURIComponent(record.reference_no)}`} className="inline-flex w-fit items-center rounded-lg bg-brand-primary px-3 py-2 text-sm font-medium text-white">{t('portal.cases.new')}</Link>}
          </Card>
        </div>
      )}
    </PortalPage>
  )
}
