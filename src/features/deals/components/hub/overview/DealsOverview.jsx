import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Columns3, LayoutDashboard, Plus, X } from 'lucide-react'
import { useLocalStorage } from '../../../../../shared/components/data-table/hooks/useLocalStorage'
import { ResourceState } from '../../../../../shared/components/data/ResourceState'
import { EmptyState } from '../../../../../shared/components/feedback/EmptyState'
import { ModulePageHeader } from '../../../../../shared/components/module-pages'
import { Button } from '../../../../../shared/components/ui/Button'
import { cn } from '../../../../../shared/utils/cn'
import { useDeals } from '../../../hooks/useDeals'
import { DealAnalyticsPanel } from '../../analytics/DealAnalyticsPanel'
import { DealOpenPicker } from './DealOpenPicker'
import { DealsCompare } from './DealsCompare'

const COMPARE = 'compare'
const EMPTY = { open: [], active: '' }
const MAX_OPEN = 8

/**
 * `/deals/overview` (2026-10-16) — open one or more deals as tabs and see each one's backend overview
 * (`analytics/overview` + `analytics/owners`), or compare them side by side. The open tabs and the active one are
 * remembered in this browser, and each deal's numbers are kept too (useDealAnalytics), so coming back shows them at once.
 */
export function DealsOverview() {
  const { t } = useTranslation()
  const query = useDeals()
  const [saved, setSaved] = useLocalStorage('deals:overview:tabs', EMPTY)
  const [picking, setPicking] = useState(false)
  const state = { ...EMPTY, ...(saved || {}) }
  const names = useMemo(() => new Map(query.deals.map((deal) => [String(deal.id), deal.name || `#${deal.id}`])), [query.deals])
  const open = state.open.map(String)
  const active = state.active === COMPARE && open.length > 1 ? COMPARE : open.includes(String(state.active)) ? String(state.active) : open[0] || ''

  const openDeal = (id) => {
    const key = String(id)
    const next = open.includes(key) ? open : [...open, key].slice(-MAX_OPEN)
    setSaved({ open: next, active: key })
  }
  const closeDeal = (id) => {
    const next = open.filter((item) => item !== id)
    setSaved({ open: next, active: active === id ? next[next.length - 1] || '' : active })
  }

  return (
    <div className="space-y-4">
      <ModulePageHeader
        icon={LayoutDashboard}
        title={t('dealWorkspace.hub.pages.overview')}
        description={t('dealWorkspace.hub.overview.description')}
        actions={<Button onClick={() => setPicking((value) => !value)}><Plus size={16} />{t('dealWorkspace.hub.overview.openDeals')}</Button>}
      />

      {picking && <DealOpenPicker deals={query.deals} isLoading={query.isLoading} error={query.error} onRetry={query.refetch} openIds={open} onOpen={openDeal} onClose={() => setPicking(false)} />}

      <ResourceState isLoading={query.isLoading && !open.length} error={!open.length ? query.error : null} onRetry={query.refetch}>
        {!open.length ? (
          <EmptyState
            icon={<LayoutDashboard size={24} />}
            title={t('dealWorkspace.hub.overview.emptyTitle')}
            description={t('dealWorkspace.hub.overview.emptyDescription')}
            action={(
              <div className="flex flex-wrap justify-center gap-2">
                {query.deals.slice(0, 4).map((deal) => (
                  <Button key={deal.id} variant="outline" size="sm" onClick={() => openDeal(deal.id)}>{deal.name || `#${deal.id}`}</Button>
                ))}
                {!query.deals.length && <Button size="sm" onClick={() => setPicking(true)}>{t('dealWorkspace.hub.overview.openDeals')}</Button>}
              </div>
            )}
          />
        ) : (
          <div className="space-y-4">
            <div role="tablist" aria-label={t('dealWorkspace.hub.overview.tabsLabel')} className="flex gap-1 overflow-x-auto border-b border-[var(--border)]">
              {open.map((id) => (
                <div key={id} className={cn('flex shrink-0 items-center rounded-t-lg border border-b-0', active === id ? 'border-[var(--border)] bg-[var(--surface)]' : 'border-transparent')}>
                  <button type="button" role="tab" aria-selected={active === id} onClick={() => setSaved({ open, active: id })} className={cn('max-w-[14rem] truncate px-3 py-2 text-sm', active === id ? 'font-bold text-[var(--brand-accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]')}>
                    {names.get(id) || `#${id}`}
                  </button>
                  <button type="button" onClick={() => closeDeal(id)} className="me-1 inline-flex h-6 w-6 items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-red-600" aria-label={t('dealWorkspace.hub.overview.closeTab', { name: names.get(id) || `#${id}` })}><X size={13} /></button>
                </div>
              ))}
              {open.length > 1 && (
                <button type="button" role="tab" aria-selected={active === COMPARE} onClick={() => setSaved({ open, active: COMPARE })} className={cn('ms-auto inline-flex shrink-0 items-center gap-1.5 rounded-t-lg border border-b-0 px-3 py-2 text-sm', active === COMPARE ? 'border-[var(--border)] bg-[var(--surface)] font-bold text-[var(--brand-accent)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]')}>
                  <Columns3 size={14} />{t('dealWorkspace.hub.overview.compare', { count: open.length })}
                </button>
              )}
            </div>
            {active === COMPARE
              ? <DealsCompare dealIds={open} names={names} onOpenTab={(id) => setSaved({ open, active: id })} />
              : <DealAnalyticsPanel key={active} dealId={active} fallbackName={names.get(active)} />}
          </div>
        )}
      </ResourceState>
    </div>
  )
}
