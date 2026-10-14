import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Search, X } from 'lucide-react'
import { useDebounce } from '../../../../shared/hooks/useDebounce'
import { useCustomers } from '../../../customers'
import { getTaskableType } from '../../constants/taskableTypes'
import { fieldHintClass, fieldInputClass } from './taskFormStyles'

const MIN_QUERY = 2

function flattenPages(data) {
  return (data?.pages || []).flatMap((page) => (Array.isArray(page?.data) ? page.data : []))
}

/**
 * Pick the record a task is about by searching the Leads Center (name / phone / email) instead of
 * typing its number. The chosen record is turned into this type's id by the registry's `fromRecord`.
 * A number typed in the box can still be used as-is.
 */
export function TaskablePicker({ type, value, name, onChange }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const search = useDebounce(query.trim(), 300)
  const entry = getTaskableType(type)
  const enabled = search.length >= MIN_QUERY
  const customersQuery = useCustomers({ per_page: 20, search }, { enabled })
  const results = useMemo(() => (enabled ? flattenPages(customersQuery.data) : []), [customersQuery.data, enabled])
  const typedNumber = /^\d+$/.test(query.trim()) ? query.trim() : ''

  if (value) {
    return (
      <div className="flex h-10 items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm">
        <span className="truncate font-bold text-[var(--text)]">
          {name ? `${name} · ` : ''}<span dir="ltr">#{value}</span>
        </span>
        <button
          type="button"
          onClick={() => onChange('', '')}
          aria-label={t('tasks.taskable.clear')}
          title={t('tasks.taskable.clear')}
          className="text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          <X size={14} />
        </button>
      </div>
    )
  }

  const choose = (record) => {
    const id = entry?.fromRecord?.(record)
    if (id) onChange(String(id), record.name || record.lead?.name || '')
    setQuery('')
  }

  return (
    <div className="relative">
      <Search size={14} className="pointer-events-none absolute start-3 top-3 text-[var(--text-muted)]" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t('tasks.taskable.searchPlaceholder')}
        aria-label={t('tasks.taskable.searchPlaceholder')}
        className={`${fieldInputClass} w-full ps-8`}
      />

      {(enabled || typedNumber) && (
        <div role="listbox" className="absolute inset-x-0 top-11 z-20 max-h-56 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg">
          {enabled && customersQuery.isFetching && (
            <div className="flex items-center gap-2 px-2 py-2 text-xs text-[var(--text-muted)]">
              <Loader2 size={13} className="animate-spin" />
              {t('tasks.taskable.searching')}
            </div>
          )}
          {enabled && customersQuery.isError && (
            <div className="px-2 py-2 text-xs text-red-600 dark:text-red-400">{t('tasks.taskable.searchFailed')}</div>
          )}
          {results.map((record) => (
            <button
              key={record.id}
              type="button"
              role="option"
              aria-selected="false"
              onClick={() => choose(record)}
              className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-start text-xs hover:bg-[var(--surface-2)]"
            >
              <span className="min-w-0">
                <span className="block truncate font-bold text-[var(--text)]">{record.name || record.lead?.name || `#${record.id}`}</span>
                {record.phone && <span dir="ltr" className="block truncate text-[var(--text-muted)]">{record.phone}</span>}
              </span>
              <span dir="ltr" className="shrink-0 text-[var(--text-muted)]">#{entry?.fromRecord?.(record)}</span>
            </button>
          ))}
          {enabled && !customersQuery.isFetching && !customersQuery.isError && !results.length && (
            <div className="px-2 py-2 text-xs text-[var(--text-muted)]">{t('tasks.taskable.noResults')}</div>
          )}
          {typedNumber && (
            <button
              type="button"
              onClick={() => { onChange(typedNumber, ''); setQuery('') }}
              className="w-full rounded-md px-2 py-1.5 text-start text-xs font-bold text-[var(--brand-accent)] hover:bg-[var(--surface-2)]"
            >
              {t('tasks.taskable.useNumber', { id: typedNumber })}
            </button>
          )}
        </div>
      )}
      {!enabled && !typedNumber && <span className={fieldHintClass}>{t('tasks.taskable.searchHint')}</span>}
    </div>
  )
}
