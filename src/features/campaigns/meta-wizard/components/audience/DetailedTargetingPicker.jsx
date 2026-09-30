import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Search, X } from 'lucide-react'
import { useMetaWizard } from '../../context/MetaWizardContext'
import { useInterestSearch } from '../../hooks/useWizardAssets'
import { DemoDataBadge } from '../fields'

const formatSize = (value, language) => (value ? new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en', { notation: 'compact' }).format(value) : '')

/** Detailed targeting (interests, behaviours) — include or narrow-exclude. */
export function DetailedTargetingPicker({ label, value, onChange, disabled, disabledReason }) {
  const { t, i18n } = useTranslation()
  const { tenantId, accountId } = useMetaWizard()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const search = useInterestSearch({ tenantId, accountId, query })
  const selectedIds = new Set(value.map((item) => item.id))
  const name = (item) => (i18n.language === 'ar' ? item.name?.ar : item.name?.en) || item.name?.en || item.name

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-[var(--text)]">{label}</span>
        <DemoDataBadge show={search.data?.isMock} />
      </div>
      {disabled ? (
        <p className="rounded-md bg-[var(--surface-2)] p-2 text-xs text-[var(--text-muted)]">{disabledReason}</p>
      ) : (
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-light)]" />
          <input
            value={query}
            onChange={(event) => { setQuery(event.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder={t('campaignWizard.audience.interestsPlaceholder')}
            aria-label={label}
            className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] ps-9 pe-9 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
          />
          {search.isFetching && <Loader2 size={14} className="absolute end-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--text-light)]" />}
          {open && (
            <ul className="absolute inset-x-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg">
              {(search.data?.items || []).filter((item) => !selectedIds.has(item.id)).map((item) => (
                <li key={item.id}>
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { onChange([...value, item]); setQuery('') }} className="flex w-full items-center justify-between gap-3 px-3 py-2 text-start hover:bg-[var(--surface-2)]">
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-[var(--text)]">{name(item)}</span>
                      <span className="block truncate text-[11px] text-[var(--text-muted)]">{t(`campaignWizard.audience.targetingTypes.${item.type}`)}</span>
                    </span>
                    {item.audienceSize && <span className="shrink-0 text-[11px] text-[var(--text-light)]" dir="ltr">{formatSize(item.audienceSize, i18n.language)}</span>}
                  </button>
                </li>
              ))}
              {!search.isFetching && !(search.data?.items || []).length && <li className="px-3 py-2 text-xs text-[var(--text-muted)]">{t('campaignWizard.audience.noInterests')}</li>}
            </ul>
          )}
        </div>
      )}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item) => (
            <span key={item.id} className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-2)] py-0.5 ps-2.5 pe-1 text-xs text-[var(--text)]">
              {name(item)}
              <button type="button" onClick={() => onChange(value.filter((entry) => entry.id !== item.id))} className="rounded-full p-0.5 text-[var(--text-muted)] hover:bg-[var(--surface)]" aria-label={t('campaignWizard.common.remove')}><X size={12} /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
