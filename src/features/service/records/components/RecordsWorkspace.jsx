import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Search } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { useDebounce } from '../../../../shared/hooks/useDebounce'
import { cn } from '../../../../shared/utils/cn'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { useRecordList, useRecordSummary } from '../hooks/useRecords'
import { RecordCreateDialog } from './RecordCreateDialog'
import { RecordsTable } from './RecordsTable'

export const RECORD_VIEWS = ['active', 'attention', 'done', 'all']

/**
 * Records of one type: server views (active / needs attention / done / all),
 * search, table and manual create. State in the URL (?view=&q=).
 */
export function RecordsWorkspace({ recordType, detailPath }) {
  const { t, i18n } = useTranslation()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('q') || '')
  const [createOpen, setCreateOpen] = useState(false)
  const debounced = useDebounce(search, 350)
  const view = RECORD_VIEWS.includes(params.get('view')) ? params.get('view') : 'active'
  const list = useRecordList({ type: recordType.key, view, search: debounced || undefined })
  const summary = useRecordSummary({ type: recordType.key })
  const counts = summary.data?.views || {}
  const typeLabel = localizeLabel(recordType.label, i18n.language, recordType.key)

  const setParam = (key, value, fallback) => {
    const next = new URLSearchParams(params)
    if (!value || value === fallback) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setParam('q', event.target.value)
            }}
            placeholder={t('service.records.searchPlaceholder')}
            aria-label={t('service.records.searchPlaceholder')}
            startIcon={<Search size={16} aria-hidden="true" />}
          />
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={16} aria-hidden="true" />
          {t('service.records.create.button', { type: typeLabel })}
        </Button>
      </div>

      <div role="tablist" aria-label={t('service.records.viewsLabel')} className="flex gap-1 overflow-x-auto border-b border-[var(--border)]">
        {RECORD_VIEWS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={view === key}
            onClick={() => setParam('view', key, 'active')}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent',
              view === key ? 'border-brand-accent font-semibold text-[var(--text)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
            )}
          >
            {t(`service.records.views.${key}`)}
            {counts[key] != null && <span className="rounded-full bg-[var(--surface-2)] px-1.5 text-xs text-[var(--text-muted)]" dir="ltr">{counts[key]}</span>}
          </button>
        ))}
      </div>

      <RecordsTable query={list} recordType={recordType} detailPath={detailPath} emptyMessage={t('service.records.empty', { type: typeLabel })} />
      <RecordCreateDialog open={createOpen} onClose={() => setCreateOpen(false)} recordType={recordType} detailPath={detailPath} />
    </div>
  )
}
