import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/Button'
import { DropdownMenu } from '../../../../../shared/components/overlays/DropdownMenu'
import { ResourceState } from '../../../../../shared/components/data/ResourceState'
import { cn } from '../../../../../shared/utils/cn'
import { localizeLabel } from '../../../core/utils/localizeLabel'
import { CaseStatusBadge } from '../../../cases/components/CaseBadges'
import { CaseTypeIcon } from '../../../cases/components/CaseTypeIcon'
import { STATUS_CATEGORY_TONE } from '../../../cases/utils/caseStatus'
import { useRecord, useRecordMutations, useRecordSection, useRecordsSetup } from '../../hooks/useRecords'
import { allowedRecordTransitions, findRecordType, recordTabs } from '../../utils/recordType'
import { RecordFlags } from '../RecordFlags'
import { ComponentsPanel } from './ComponentsPanel'
import { DocumentsPanel } from './DocumentsPanel'
import { EntriesPanel } from './EntriesPanel'
import { ParticipantsPanel } from './ParticipantsPanel'
import { RecordOverviewPanel } from './RecordOverviewPanel'
import { RecordTimelinePanel } from './RecordTimelinePanel'

/** Record screen: header + status menu, then tabs derived from the record type configuration. */
export function RecordDetailView({ recordId, backTo }) {
  const { t, i18n } = useTranslation()
  const record = useRecord(recordId)
  const setup = useRecordsSetup()
  const documents = useRecordSection(recordId, 'documents')
  const { transition } = useRecordMutations(recordId)
  const [tab, setTab] = useState('overview')
  const item = record.data
  const recordType = findRecordType(setup.data, item?.record_type?.id)
  const tabs = recordTabs(recordType, { hasDocuments: Boolean(documents.data?.length) })
  const active = tabs.includes(tab) ? tab : 'overview'
  const language = i18n.language
  const targets = item ? allowedRecordTransitions(recordType, item.status?.id) : []

  return (
    <div className="grid gap-4">
      {backTo && (
        <Link to={backTo} className="inline-flex w-fit items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
          <ArrowLeft size={16} aria-hidden="true" className="rtl:-scale-x-100" />
          {t('service.records.back', { type: localizeLabel(recordType?.label, language, '') })}
        </Link>
      )}
      <ResourceState isLoading={record.isLoading || setup.isLoading} error={record.error || setup.error} onRetry={() => { record.refetch(); setup.refetch() }}>
        {item && (
          <>
            <header className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                  <span dir="ltr" className="font-mono">{item.reference_no}</span>
                  <CaseStatusBadge status={item.status} />
                  <RecordFlags counts={item.counts} />
                </div>
                <h1 className="flex items-center gap-2 text-lg font-bold text-[var(--text)]">
                  <CaseTypeIcon icon={item.record_type?.icon} size={18} className="shrink-0 text-[var(--text-muted)]" />
                  {localizeLabel(item.record_type?.label, language, '')} · {item.customer?.name}
                </h1>
              </div>
              <DropdownMenu
                align="end"
                items={targets.map((status) => ({
                  id: status.id,
                  label: localizeLabel(status.label, language, status.key),
                  icon: <span className={cn('h-2 w-2 rounded-full', STATUS_CATEGORY_TONE[status.category])} aria-hidden="true" />,
                  onSelect: () => transition.mutate({ id: item.id, version: item.version, to_status_id: status.id }),
                }))}
                trigger={
                  <Button variant="outline" disabled={!targets.length || transition.isPending}>
                    {targets.length ? t('service.cases.transition.menu') : t('service.cases.transition.none')}
                    <ChevronDown size={16} aria-hidden="true" />
                  </Button>
                }
              />
            </header>

            <div role="tablist" aria-label={t('service.records.tabsLabel')} className="flex gap-1 overflow-x-auto border-b border-[var(--border)]">
              {tabs.map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active === key}
                  onClick={() => setTab(key)}
                  className={cn(
                    'shrink-0 border-b-2 px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent',
                    active === key ? 'border-brand-accent font-semibold text-[var(--text)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
                  )}
                >
                  {t(`service.records.tabs.${key}`)}
                </button>
              ))}
            </div>

            <div role="tabpanel">
              {active === 'overview' && <RecordOverviewPanel record={item} recordType={recordType} agents={setup.data?.agents} />}
              {active === 'participants' && <ParticipantsPanel record={item} recordType={recordType} />}
              {active === 'components' && <ComponentsPanel record={item} recordType={recordType} statuses={setup.data?.component_statuses} />}
              {active === 'entries' && <EntriesPanel record={item} recordType={recordType} />}
              {active === 'documents' && <DocumentsPanel record={item} participants={item.participants} />}
              {active === 'timeline' && <RecordTimelinePanel record={item} />}
            </div>
          </>
        )}
      </ResourceState>
    </div>
  )
}
