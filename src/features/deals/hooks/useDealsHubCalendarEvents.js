import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useCalendarEvents } from '../../calendar'
import { buildDealMilestoneEvents, buildInstallmentEvents } from '../utils/dealCalendar'
import { buildDealsLinkIndex, getActivityDealLink, getTaskDealLink } from '../utils/dealLinks'
import { buildDealLeadIndex } from '../utils/dealLeads'
import { useDealContracts } from './useDealContracts'
import { useDeals } from './useDeals'
import { useDealsQuickInfo } from './useDealsQuickInfo'

/**
 * Events of every deal (hub `/deals/calendar`): each deal's start / end, every contract installment, and the
 * tasks, calls and meetings linked to any deal, its contracts or its leads (same caches as the hub list).
 */
export function useDealsHubCalendarEvents() {
  const { t } = useTranslation()
  const dealsQuery = useDeals()
  const contractsQuery = useDealContracts({})
  const quick = useDealsQuickInfo(dealsQuery.deals)
  const calendar = useCalendarEvents()

  const index = useMemo(() => buildDealsLinkIndex({
    dealIds: dealsQuery.deals.map((deal) => deal.id),
    leadIndexes: [...quick.leadsByDeal.values()].map(buildDealLeadIndex),
    contracts: contractsQuery.contracts,
  }), [contractsQuery.contracts, dealsQuery.deals, quick.leadsByDeal])

  const events = useMemo(() => {
    const shared = calendar.events.filter((event) => (
      event.sourceId === 'tasks' ? getTaskDealLink(event.raw, index) : getActivityDealLink(event.raw, index)
    ))
    const labels = { start: t('dealWorkspace.calendar.dealStart'), end: t('dealWorkspace.calendar.dealEnd') }
    return [
      ...shared,
      ...buildInstallmentEvents(contractsQuery.contracts, { installment: t('dealWorkspace.calendar.installment') }),
      ...dealsQuery.deals.flatMap((deal) => buildDealMilestoneEvents(deal, labels)),
    ]
  }, [calendar.events, contractsQuery.contracts, dealsQuery.deals, index, t])

  return {
    events,
    isLoading: calendar.isLoading || contractsQuery.isLoading || dealsQuery.isLoading,
    error: calendar.error || contractsQuery.error || dealsQuery.error,
    refetch: () => {
      calendar.refetch()
      contractsQuery.refetch()
      dealsQuery.refetch()
    },
  }
}
