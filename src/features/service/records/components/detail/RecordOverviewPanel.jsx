import { useTranslation } from 'react-i18next'
import { Select } from '../../../../../shared/components/ui/Select'
import { formatDate } from '../../../../../shared/utils/dateTime'
import { localizeLabel } from '../../../core/utils/localizeLabel'
import { useServiceTerminology } from '../../../core/capabilities/useServiceCapabilities'
import { useRecordMutations } from '../../hooks/useRecords'

function Row({ label, children }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-xs text-[var(--text-muted)]">{label}</dt>
      <dd className="text-sm text-[var(--text)]">{children ?? '—'}</dd>
    </div>
  )
}

/** Core fields + tenant fields (`record_type.fields` schema) + assignee. */
export function RecordOverviewPanel({ record, recordType, agents = [] }) {
  const { t, i18n } = useTranslation()
  const term = useServiceTerminology()
  const { update } = useRecordMutations(record.id)
  const language = i18n.language
  const date = (value) => (value ? formatDate(value, language, { dateStyle: 'medium' }) : null)
  const number = (value) => (value == null ? null : new Intl.NumberFormat(language).format(value))
  const value = (field) => {
    const raw = record.data?.[field.key]
    if (raw == null || raw === '') return null
    if (field.type === 'money') return <span dir="ltr">{new Intl.NumberFormat(language, { style: 'currency', currency: record.data?.currency || 'EGP', maximumFractionDigits: 0 }).format(raw)}</span>
    if (field.type === 'number') return <span dir="ltr">{number(raw)}</span>
    return <bdi>{String(raw)}</bdi>
  }

  return (
    <section className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <dl className="grid gap-3 sm:grid-cols-2">
        <Row label={term('customer')}>
          <span className="font-medium">{record.customer?.name}</span>
          {record.customer?.phone && <span className="block text-xs text-[var(--text-muted)]" dir="ltr">{record.customer.phone}</span>}
        </Row>
        {recordType?.batch_enabled && <Row label={localizeLabel(recordType.batch_label, language, t('service.records.fields.batch'))}>{record.batch ? `${record.batch.reference_no} · ${localizeLabel(record.batch.name, language, '')}` : null}</Row>}
        <Row label={t('service.records.fields.startsAt')}>{date(record.starts_at)}</Row>
        <Row label={t('service.records.fields.endsAt')}>{date(record.ends_at)}</Row>
        {record.expected_at && <Row label={t('service.records.fields.expectedAt')}>{date(record.expected_at)}</Row>}
        <Row label={t('service.records.fields.source')}>{t(`service.records.sources.${record.source_type}`, { defaultValue: record.source_type })}</Row>
        {(recordType?.fields || []).map((field) => (
          <Row key={field.key} label={localizeLabel(field.label, language, field.key)}>{value(field)}</Row>
        ))}
      </dl>
      <div className="max-w-xs">
        <Select
          label={t('service.records.fields.assignee')}
          placeholder={t('service.cases.unassigned')}
          value={record.assigned_user?.id || ''}
          disabled={update.isPending}
          onChange={(next) => update.mutate({ id: record.id, version: record.version, assigned_user_id: next || null })}
          options={agents.map((agent) => ({ value: agent.id, label: agent.name }))}
        />
      </div>
    </section>
  )
}
