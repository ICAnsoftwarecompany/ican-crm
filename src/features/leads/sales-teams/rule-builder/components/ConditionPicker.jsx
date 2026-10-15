import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Check, Search } from 'lucide-react'
import { Input } from '../../../../../shared/components/ui/Input'
import { Skeleton } from '../../../../../shared/components/feedback/Skeleton'
import { cn } from '../../../../../shared/utils/cn'
import { filterOptions } from '../../utils/ruleSources'

const STATUS_CLASS = {
  active: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  paused: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
}

function OptionRow({ option, selected, onSelect }) {
  const { t } = useTranslation()
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn('flex w-full items-center gap-3 border-b border-[var(--border)] px-3 py-2 text-start last:border-b-0 transition-colors', selected ? 'bg-[var(--brand-accent-soft)]' : 'hover:bg-[var(--surface-2)]')}
    >
      <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded-full border', selected ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)] text-white' : 'border-[var(--border)]')}>
        {selected && <Check size={11} aria-hidden="true" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-[var(--text)]">{option.label}</span>
        {option.subtitle && <span className="block truncate text-xs text-[var(--text-muted)]">{option.subtitle}</span>}
      </span>
      {option.platform && (
        <span className="shrink-0 rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--text-muted)]">{t(`salesTeams.picker.platform.${option.platform}`)}</span>
      )}
      {option.status && (
        <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold', STATUS_CLASS[option.status] || 'bg-[var(--surface-2)] text-[var(--text-muted)]')}>
          {t(`salesTeams.picker.status.${option.status}`)}
        </span>
      )}
      {option.missing && <span className="shrink-0 text-[11px] text-[var(--text-light)]">{t('salesTeams.picker.notListed')}</span>}
    </button>
  )
}

/**
 * Searchable single choice for a rule condition (campaign / ad / lead form): "Any" first, then the options with
 * platform, status and a subtitle (page · ad account, or the ad set). `source` = { options, isLoading, error }.
 */
export function ConditionPicker({ id, label, hint, value, onChange, source, emptyText, notice }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const visible = filterOptions(source.options, query)
  const selected = source.options.find((option) => option.value === value)

  return (
    <section className="grid gap-2" aria-labelledby={`${id}-label`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id={`${id}-label`} className="text-sm font-medium text-[var(--text)]">{label}</h3>
        <span className="text-xs text-[var(--text-muted)]">
          {selected ? t('salesTeams.picker.selected', { name: selected.label }) : t('salesTeams.rules.anyValue')}
        </span>
      </div>
      {hint && <p className="text-xs leading-5 text-[var(--text-muted)]">{hint}</p>}
      {source.options.length > 6 && (
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('salesTeams.picker.search')} aria-label={`${label}: ${t('salesTeams.picker.search')}`} startIcon={<Search size={15} />} />
      )}
      <div role="radiogroup" aria-labelledby={`${id}-label`} className="max-h-60 overflow-y-auto rounded-lg border border-[var(--border)]">
        <OptionRow option={{ value: '', label: t('salesTeams.rules.anyValue'), subtitle: t('salesTeams.picker.anyHint') }} selected={!value} onSelect={() => onChange('')} />
        {source.isLoading && <div className="grid gap-2 p-2">{[0, 1, 2].map((key) => <Skeleton key={key} className="h-10" />)}</div>}
        {!source.isLoading && source.error && (
          <p className="flex items-center gap-1.5 p-3 text-xs text-red-700 dark:text-red-300"><AlertTriangle size={13} aria-hidden="true" />{t('salesTeams.picker.loadFailed')}</p>
        )}
        {!source.isLoading && !source.error && visible.length === 0 && (
          <p className="p-3 text-xs text-[var(--text-muted)]">{query ? t('salesTeams.common.noResults') : emptyText}</p>
        )}
        {!source.isLoading && visible.map((option) => (
          <OptionRow key={option.value} option={option} selected={option.value === value} onSelect={() => onChange(option.value)} />
        ))}
      </div>
      {notice && <p className="text-xs leading-5 text-[var(--text-muted)]">{notice}</p>}
    </section>
  )
}
