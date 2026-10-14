import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, MinusCircle, PlusCircle, Search } from 'lucide-react'
import { cn } from '../../../../../shared/utils/cn'
import { useGeoLocationSearch } from '../../hooks/useWizardAssets'
import { locationDisplayName } from '../../domain/geoTargeting'
import { DemoDataBadge } from '../fields'
import { GEO_TYPE_ICONS, geoContextLabel } from './geoDisplay'

/**
 * Typeahead like Ads Manager's location box. Enter adds the highlighted
 * result in the current mode; each row also offers the opposite mode.
 */
export function GeoLocationSearch({ tenantId, accountId, mode, selectedKeys, onAdd, onFocus }) {
  const { t, i18n } = useTranslation()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const containerRef = useRef(null)
  const search = useGeoLocationSearch({ tenantId, accountId, query })
  const results = query.trim().length >= 2 ? search.data?.items || [] : []

  useEffect(() => setHighlight(0), [query])
  useEffect(() => {
    const close = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const add = (location, addMode = mode) => {
    onAdd(location, addMode)
    setQuery('')
    setOpen(false)
  }

  const onKeyDown = (event) => {
    if (!results.length) return
    if (event.key === 'ArrowDown') { event.preventDefault(); setHighlight((value) => Math.min(results.length - 1, value + 1)) }
    if (event.key === 'ArrowUp') { event.preventDefault(); setHighlight((value) => Math.max(0, value - 1)) }
    if (event.key === 'Enter') { event.preventDefault(); add(results[highlight]) }
    if (event.key === 'Escape') setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-light)]" />
        <input
          value={query}
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-autocomplete="list"
          aria-label={t('campaignWizard.geo.searchPlaceholder')}
          placeholder={t(mode === 'exclude' ? 'campaignWizard.geo.searchExcludePlaceholder' : 'campaignWizard.geo.searchPlaceholder')}
          onChange={(event) => { setQuery(event.target.value); setOpen(true) }}
          onFocus={() => { setOpen(true); onFocus?.() }}
          onKeyDown={onKeyDown}
          className={cn('h-11 w-full rounded-lg border bg-[var(--surface)] ps-9 pe-10 text-sm text-[var(--text)] focus:outline-none focus:ring-2', mode === 'exclude' ? 'border-[var(--notification-danger)] focus:ring-[var(--notification-danger)]' : 'border-[var(--border)] focus:ring-[var(--brand-accent)]')}
        />
        {search.isFetching && <Loader2 size={15} className="absolute end-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--text-light)]" />}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute inset-x-0 top-full z-30 mt-1 max-h-80 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg" role="listbox">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-1.5">
            <span className="text-[11px] text-[var(--text-muted)]">{t('campaignWizard.geo.resultsHint')}</span>
            <DemoDataBadge show={search.data?.isMock} />
          </div>
          {search.isError && <p className="p-3 text-xs text-[var(--notification-danger)]">{t('campaignWizard.geo.searchError')}</p>}
          {!search.isFetching && !search.isError && !results.length && <p className="p-3 text-xs text-[var(--text-muted)]">{t('campaignWizard.geo.noResults', { query: query.trim() })}</p>}
          {results.map((location, index) => {
            const Icon = GEO_TYPE_ICONS[location.type] || GEO_TYPE_ICONS.city
            const already = selectedKeys.has(location.key)
            return (
              <div key={location.key} role="option" aria-selected={index === highlight} onMouseEnter={() => setHighlight(index)} className={cn('flex items-center gap-2 px-3 py-2', index === highlight && 'bg-[var(--surface-2)]')}>
                <button type="button" disabled={already} onClick={() => add(location)} className="flex min-w-0 flex-1 items-center gap-2.5 text-start disabled:opacity-50">
                  <Icon size={15} className="shrink-0 text-[var(--text-muted)]" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-[var(--text)]">{locationDisplayName(location, i18n.language)}</span>
                    <span className="block truncate text-xs text-[var(--text-muted)]">{[t(`campaignWizard.geo.types.${location.type}`), geoContextLabel(location, i18n.language)].filter(Boolean).join(' · ')}</span>
                  </span>
                </button>
                {already ? (
                  <span className="text-[11px] text-[var(--text-light)]">{t('campaignWizard.geo.alreadyAdded')}</span>
                ) : (
                  <div className="flex shrink-0 gap-1">
                    <button type="button" onClick={() => add(location, 'include')} className="rounded-md p-1 text-[var(--brand-accent)] hover:bg-[var(--surface)]" title={t('campaignWizard.geo.include')} aria-label={t('campaignWizard.geo.include')}><PlusCircle size={16} /></button>
                    <button type="button" onClick={() => add(location, 'exclude')} className="rounded-md p-1 text-[var(--notification-danger)] hover:bg-[var(--surface)]" title={t('campaignWizard.geo.exclude')} aria-label={t('campaignWizard.geo.exclude')}><MinusCircle size={16} /></button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
