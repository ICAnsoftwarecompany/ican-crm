import { useTranslation } from 'react-i18next'
import { Select } from '../../../../../shared/components/ui/Select'
import { formatDate } from '../../../../../shared/utils/dateTime'
import { localizeLabel } from '../../../core/utils/localizeLabel'
import { useServiceTerminology } from '../../../core/capabilities/useServiceCapabilities'
import { CASE_PRIORITIES, CASE_SEVERITIES } from '../../constants/caseViews'
import { useCaseMutations } from '../../hooks/useCases'

function Row({ label, children }) {
  return (
    <div className="grid gap-1">
      <dt className="text-xs text-[var(--text-muted)]">{label}</dt>
      <dd className="text-sm text-[var(--text)]">{children}</dd>
    </div>
  )
}

/**
 * Editable properties (priority, severity, queue, assignee) + read-only
 * facts. Every change sends the case `version` (409 on stale data).
 */
export function CasePropertiesPanel({ caseItem, setup }) {
  const { t, i18n } = useTranslation()
  const term = useServiceTerminology()
  const { update, assign } = useCaseMutations()
  const language = i18n.language
  const busy = update.isPending || assign.isPending

  const options = {
    priority: CASE_PRIORITIES.map((value) => ({ value, label: t(`service.cases.priority.${value}`) })),
    severity: CASE_SEVERITIES.map((value) => ({ value, label: t(`service.cases.severity.${value}`) })),
    queue: (setup?.queues || []).map((queue) => ({ value: queue.id, label: localizeLabel(queue.label, language, queue.key) })),
    assignee: (setup?.agents || []).map((agent) => ({ value: agent.id, label: agent.name })),
  }

  const base = { caseId: caseItem.id, version: caseItem.version }

  return (
    <aside className="grid content-start gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <h2 className="text-sm font-semibold text-[var(--text)]">{t('service.cases.detail.properties')}</h2>
      <Select
        label={t('service.cases.fields.assignee')}
        options={options.assignee}
        value={caseItem.assignee?.id}
        placeholder={t('service.cases.unassigned')}
        disabled={busy}
        onChange={(value) => assign.mutate({ ...base, assignee_id: value || null })}
      />
      <Select
        label={t('service.cases.fields.queue')}
        options={options.queue}
        value={caseItem.queue?.id}
        placeholder={t('service.cases.noQueue')}
        disabled={busy}
        onChange={(value) => assign.mutate({ ...base, queue_id: value || null })}
      />
      <div className="grid grid-cols-2 gap-3">
        <Select
          label={t('service.cases.fields.priority')}
          options={options.priority}
          value={caseItem.priority}
          disabled={busy}
          onChange={(value) => value && update.mutate({ ...base, priority: value })}
        />
        <Select
          label={t('service.cases.fields.severity')}
          options={options.severity}
          value={caseItem.severity}
          disabled={busy}
          onChange={(value) => value && update.mutate({ ...base, severity: value })}
        />
      </div>

      <dl className="grid gap-3 border-t border-[var(--border)] pt-4">
        <Row label={term('customer')}>
          <span className="block">{caseItem.customer?.name}</span>
          {caseItem.customer?.phone && <span dir="ltr" className="text-xs text-[var(--text-muted)]">{caseItem.customer.phone}</span>}
        </Row>
        <Row label={t('service.cases.fields.type')}>{localizeLabel(caseItem.type?.label, language, '-')}</Row>
        <Row label={t('service.cases.fields.channel')}>
          {t(`service.cases.channels.${caseItem.source_channel}`, { defaultValue: caseItem.source_channel })}
        </Row>
        <Row label={t('service.cases.fields.opened')}>{formatDate(caseItem.opened_at, language, { dateStyle: 'medium', timeStyle: 'short' })}</Row>
        {caseItem.resolution_code && (
          <Row label={t('service.cases.fields.resolutionCode')}>
            {localizeLabel(setup?.resolution_codes?.find((code) => code.key === caseItem.resolution_code)?.label, language, caseItem.resolution_code)}
          </Row>
        )}
        {caseItem.resolution_summary && <Row label={t('service.cases.fields.resolutionSummary')}>{caseItem.resolution_summary}</Row>}
      </dl>
    </aside>
  )
}
