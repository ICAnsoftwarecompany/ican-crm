import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Loader2, Plus, Search } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/Button'
import { useDebounce } from '../../../../../shared/hooks/useDebounce'
import { cn } from '../../../../../shared/utils/cn'
import { useCustomers } from '../../../../customers'
import { dealInputClass } from '../../common/FieldLabel'

const leadIdOf = (record) => record?.lead?.id ?? record?.lead_id ?? null
const toLead = (record) => ({ id: String(leadIdOf(record)), name: record.name || record.lead?.name || `#${leadIdOf(record)}`, phone: record.phone || record.lead?.phone || '' })

/** Search the Leads Center (name / phone) and put leads in the basket; click again to take one out. */
export function ExistingLeadSearch({ existing, onChange }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const search = useDebounce(query.trim(), 300)
  const customersQuery = useCustomers({ per_page: 20, search }, { enabled: search.length >= 2 })
  const results = useMemo(() => (customersQuery.data?.pages || []).flatMap((page) => (Array.isArray(page?.data) ? page.data : [])).filter((row) => leadIdOf(row)).map(toLead), [customersQuery.data])
  const picked = new Set(existing.map((lead) => lead.id))
  const toggle = (lead) => onChange(picked.has(lead.id) ? existing.filter((item) => item.id !== lead.id) : [...existing, lead])
  const missing = results.filter((lead) => !picked.has(lead.id))

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute start-3 top-3 text-[var(--text-muted)]" />
        <input className={`${dealInputClass} ps-8`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('dealWorkspace.wizard.source.leads.searchPlaceholder')} aria-label={t('dealWorkspace.wizard.source.leads.search')} />
      </div>
      <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-[var(--border)] p-1">
        {search.length < 2 && <p className="p-3 text-xs leading-5 text-[var(--text-muted)]">{t('dealWorkspace.wizard.source.leads.searchHint')}</p>}
        {search.length >= 2 && customersQuery.isFetching && <p className="flex items-center gap-2 p-3 text-xs text-[var(--text-muted)]"><Loader2 size={14} className="animate-spin" />{t('dealWorkspace.common.loading')}</p>}
        {search.length >= 2 && customersQuery.isError && <p className="p-3 text-xs text-red-600 dark:text-red-400">{t('dealWorkspace.wizard.source.leads.searchFailed')}</p>}
        {search.length >= 2 && !customersQuery.isFetching && !customersQuery.isError && !results.length && <p className="p-3 text-xs text-[var(--text-muted)]">{t('dealWorkspace.leads.existing.noResults')}</p>}
        {results.map((lead) => {
          const checked = picked.has(lead.id)
          return (
            <button key={lead.id} type="button" onClick={() => toggle(lead)} aria-pressed={checked} className={cn('flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-start text-sm', checked ? 'bg-[var(--brand-accent-soft)]' : 'hover:bg-[var(--surface-2)]')}>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-[var(--text)]">{lead.name}</span>
                {lead.phone && <span className="block text-xs text-[var(--text-muted)]" dir="ltr">{lead.phone}</span>}
              </span>
              {checked ? <Check size={16} className="shrink-0 text-[var(--brand-accent)]" /> : <Plus size={16} className="shrink-0 text-[var(--text-muted)]" />}
            </button>
          )
        })}
      </div>
      {missing.length > 1 && (
        <Button variant="outline" size="sm" onClick={() => onChange([...existing, ...missing])}>{t('dealWorkspace.wizard.source.leads.addAllResults', { count: missing.length })}</Button>
      )}
    </div>
  )
}
