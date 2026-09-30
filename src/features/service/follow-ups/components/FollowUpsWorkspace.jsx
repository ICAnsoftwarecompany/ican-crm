import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlarmClock, CalendarCheck, CalendarClock, CheckCircle2, ListChecks, Plus, Search } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { DataTable } from '../../../../shared/components/data-table'
import { useDebounce } from '../../../../shared/hooks/useDebounce'
import { formatDate, formatRelativeTime } from '../../../../shared/utils/dateTime'
import { cn } from '../../../../shared/utils/cn'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { useServiceTerminology } from '../../core/capabilities/useServiceCapabilities'
import { FOLLOW_UP_VIEWS } from '../constants/followUps'
import { useFollowUpList } from '../api/followUpsApi'
import { FollowUpDrawer } from './FollowUpDrawer'
import { EnrollFollowUpDialog } from './EnrollFollowUpDialog'

const ICONS = { overdue: AlarmClock, due_today: CalendarCheck, upcoming: CalendarClock, completed: CheckCircle2, all: ListChecks }
const TONE = { overdue: 'text-sla-breached', due_today: 'text-sla-at-risk', upcoming: 'text-[var(--text-muted)]' }

/** Follow-ups workspace (spec §39): today's calls and visits by due bucket; record an outcome from the drawer. */
export function FollowUpsWorkspace() {
  const { t, i18n } = useTranslation()
  const term = useServiceTerminology()
  const language = i18n.language
  const [view, setView] = useState('due_today')
  const [mine, setMine] = useState(false)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(null)
  const [enrolling, setEnrolling] = useState(false)
  const debounced = useDebounce(search, 300)
  const query = useFollowUpList({ view, mine: mine ? 1 : undefined, search: debounced || undefined })
  const summary = query.data?.summary

  const rows = useMemo(() => (query.data?.data || []).map((entry) => ({
    ...entry,
    customer_name: entry.customer?.name || '',
    program_name: localizeLabel(entry.program?.name, language, ''),
    task: entry.step ? localizeLabel(entry.step.task_title, language, entry.step.key) : '',
    owner_name: entry.owner?.name || '',
    due: entry.next_due_at || entry.completed_at || '',
  })), [query.data, language])

  const columns = useMemo(() => [
    { id: 'customer', header: term('customer'), accessor: 'customer_name', filterType: 'text', render: (row) => <span className="grid"><span className="font-medium text-[var(--text)]">{row.customer_name}</span><span dir="ltr" className="text-start text-xs text-[var(--text-muted)]">{row.customer?.phone}</span></span> },
    { id: 'task', header: t('service.followUps.columns.task'), accessor: 'task', render: (row) => (row.step ? <span className="grid"><span className="text-sm text-[var(--text)]">{row.task}</span><span className="text-xs text-[var(--text-muted)]">{t(`service.followUps.channels.${row.step.channel}`)} · {t('service.followUps.stepOf', { n: row.step_number, total: row.steps_total })}{row.attempts ? ` · ${t('service.followUps.attempt', { n: row.attempts + 1 })}` : ''}</span></span> : <span className="text-xs text-[var(--text-muted)]">{t(`service.followUps.statuses.${row.status}`)}</span>) },
    { id: 'program', header: t('service.followUps.columns.program'), accessor: 'program_name', filterType: 'select' },
    { id: 'due', header: t('service.followUps.columns.due'), accessor: 'due', sortable: true, render: (row) => (row.next_due_at ? <span className={cn('text-xs font-medium', TONE[row.bucket])} title={formatDate(row.next_due_at, language)}>{formatRelativeTime(row.next_due_at, language)}</span> : <span className="text-xs text-[var(--text-muted)]">{row.completed_at ? formatDate(row.completed_at, language) : '—'}</span>) },
    { id: 'owner', header: t('service.followUps.columns.owner'), accessor: 'owner_name', filterType: 'select' },
  ], [t, term, language])

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" role="tablist" aria-label={t('service.hub.followUps')}>
        {FOLLOW_UP_VIEWS.map((key) => {
          const Icon = ICONS[key]
          return (
            <button key={key} type="button" role="tab" aria-selected={view === key} onClick={() => setView(key)} className={cn('grid gap-1 rounded-lg border bg-[var(--surface)] p-3 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent', view === key ? 'border-brand-accent' : 'border-[var(--border)] hover:bg-[var(--surface-2)]')}>
              <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><Icon size={14} aria-hidden="true" />{t(`service.followUps.views.${key}`)}</span>
              <span className={cn('text-lg font-bold text-[var(--text)]', summary?.[key] && TONE[key])}>{summary?.[key] ?? (view === key ? query.data?.meta?.total ?? '—' : '—')}</span>
            </button>
          )
        })}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-2 sm:max-w-xl sm:flex-row sm:items-center">
          <div className="flex-1"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('service.followUps.search')} aria-label={t('service.followUps.search')} startIcon={<Search size={16} aria-hidden="true" />} /></div>
          <label className="inline-flex shrink-0 items-center gap-2 text-sm text-[var(--text)]">
            <input type="checkbox" checked={mine} onChange={(event) => setMine(event.target.checked)} />
            {t('service.followUps.mineOnly')}
          </label>
        </div>
        <Button className="shrink-0 whitespace-nowrap" onClick={() => setEnrolling(true)}><Plus size={16} aria-hidden="true" />{t('service.followUps.enroll')}</Button>
      </div>
      <DataTable
        data={rows}
        columns={columns}
        tableId="service-follow-ups"
        isLoading={query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        emptyMessage={t(`service.followUps.empty.${view}`)}
        onRowClick={setOpen}
        onRowDoubleClick={setOpen}
        enableSorting
        enableFiltering
        enableColumnVisibility
        enableExport
        showToolbar
        showFooter
      />
      <FollowUpDrawer enrollment={open} onChange={setOpen} onClose={() => setOpen(null)} />
      <EnrollFollowUpDialog open={enrolling} onClose={() => setEnrolling(false)} />
    </div>
  )
}
