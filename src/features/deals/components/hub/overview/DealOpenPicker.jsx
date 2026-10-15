import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Plus, Search, X } from 'lucide-react'
import { ResourceState } from '../../../../../shared/components/data/ResourceState'
import { cn } from '../../../../../shared/utils/cn'
import { getDealStatusValue } from '../../../utils/dealDisplay'
import { DealStatusBadge } from '../../common/DealStatusBadge'
import { dealInputClass } from '../../common/FieldLabel'

/** Search the deals and open them as overview tabs (stays open, so several deals can be opened in a row). */
export function DealOpenPicker({ deals, isLoading, error, onRetry, openIds, onOpen, onClose }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const visible = useMemo(() => {
    const text = query.trim().toLowerCase()
    return text ? deals.filter((deal) => `${deal.name} ${deal.type || ''} ${getDealStatusValue(deal.status)}`.toLowerCase().includes(text)) : deals
  }, [deals, query])

  return (
    <section className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3" aria-label={t('dealWorkspace.hub.overview.pickerTitle')}>
      <header className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-[var(--text)]">{t('dealWorkspace.hub.overview.pickerTitle')}</h2>
          <p className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.hub.overview.pickerHint')}</p>
        </div>
        <button type="button" onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)]" aria-label={t('dealWorkspace.common.close')}><X size={16} /></button>
      </header>
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute start-3 top-3 text-[var(--text-muted)]" />
        <input autoFocus className={`${dealInputClass} ps-8`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('dealWorkspace.wizard.team.search')} aria-label={t('dealWorkspace.hub.overview.search')} />
      </div>
      <ResourceState isLoading={isLoading} error={error} onRetry={onRetry} empty={!deals.length} emptyTitle={t('dealWorkspace.empty')}>
        <ul className="grid max-h-72 gap-1 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((deal) => {
            const isOpen = openIds.includes(String(deal.id))
            return (
              <li key={deal.id}>
                <button type="button" onClick={() => onOpen(deal.id)} className={cn('flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-start', isOpen ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]' : 'border-[var(--border)] hover:bg-[var(--surface-2)]')}>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-[var(--text)]">{deal.name || `#${deal.id}`}</span>
                    <DealStatusBadge status={deal.status} />
                  </span>
                  {isOpen ? <Check size={16} className="shrink-0 text-[var(--brand-accent)]" /> : <Plus size={16} className="shrink-0 text-[var(--text-muted)]" />}
                </button>
              </li>
            )
          })}
          {!visible.length && <li className="p-3 text-xs text-[var(--text-muted)]">{t('dealWorkspace.wizard.team.noMatch')}</li>}
        </ul>
      </ResourceState>
    </section>
  )
}
