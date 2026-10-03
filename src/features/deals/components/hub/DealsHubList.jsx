import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Handshake, Plus } from 'lucide-react'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { ModulePageHeader } from '../../../../shared/components/module-pages'
import { Button } from '../../../../shared/components/ui/Button'
import { useDeals } from '../../hooks/useDeals'
import { QUICK_INFO_LIMIT, useDealsQuickInfo } from '../../hooks/useDealsQuickInfo'
import { getDealStatusValue } from '../../utils/dealDisplay'
import { dealInputClass } from '../common/FieldLabel'
import { ViewToggle } from '../common/ViewToggle'
import { DealsBoard } from './DealsBoard'
import { DealsTable } from './DealsTable'

const VIEWS = ['table', 'board']
const GROUPS = ['status', 'type']

/**
 * `/deals` — every deal as a table or a board (`?view=board`, `?group=status|type`), each with its quick
 * info: products (and work template), team, last action. A deal opens its workspace.
 */
export function DealsHubList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const view = VIEWS.includes(params.get('view')) ? params.get('view') : 'table'
  const group = GROUPS.includes(params.get('group')) ? params.get('group') : 'status'
  const query = useDeals()

  // Newest first, so the quick-info limit keeps the deals people work on now.
  const deals = useMemo(() => [...query.deals]
    .sort((left, right) => String(right.created_at || '').localeCompare(String(left.created_at || '')) || Number(right.id) - Number(left.id))
    .map((deal) => ({ ...deal, statusValue: getDealStatusValue(deal.status), leadsCount: Number(deal.leads_count ?? deal.deal_leads_count ?? 0) })), [query.deals])
  const quick = useDealsQuickInfo(deals)

  const setParam = (key, value, fallback) => setParams((current) => {
    const next = new URLSearchParams(current)
    if (value === fallback) next.delete(key)
    else next.set(key, value)
    return next
  }, { replace: true })

  return (
    <div className="space-y-4">
      <ModulePageHeader
        icon={Handshake}
        title={t('dealWorkspace.hub.pages.deals')}
        description={t('dealWorkspace.hub.dealsDescription')}
        actions={<Button onClick={() => navigate('/deals/new')}><Plus size={16} />{t('dealWorkspace.createDeal')}</Button>}
      />
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
        <ViewToggle modes={VIEWS} value={view} onChange={(mode) => setParam('view', mode, 'table')} label={t('dealWorkspace.hub.viewLabel')} />
        {view === 'board' && (
          <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            {t('dealWorkspace.hub.board.groupBy')}
            <select className={`${dealInputClass} h-9 w-auto`} value={group} onChange={(event) => setParam('group', event.target.value, 'status')}>
              {GROUPS.map((value) => <option key={value} value={value}>{t(`dealWorkspace.hub.board.groups.${value}`)}</option>)}
            </select>
          </label>
        )}
        {quick.limited && <p className="ms-auto text-xs text-[var(--text-muted)]">{t('dealWorkspace.quickInfo.limited', { count: QUICK_INFO_LIMIT })}</p>}
      </div>

      {view === 'table' ? (
        <DealsTable deals={deals} infos={quick.infos} query={query} />
      ) : (
        <ResourceState
          isLoading={query.isLoading}
          error={query.error}
          onRetry={query.refetch}
          empty={!deals.length}
          emptyTitle={t('dealWorkspace.empty')}
          emptyDescription={t('dealWorkspace.hub.board.emptyDescription')}
        >
          <DealsBoard deals={deals} infos={quick.infos} groupBy={group} />
        </ResourceState>
      )}
    </div>
  )
}
