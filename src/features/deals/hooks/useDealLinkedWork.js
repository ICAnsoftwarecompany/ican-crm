import { useMemo } from 'react'
import { useActivities } from '../../activities'
import { useTasks } from '../../tasks'
import { buildDealLinkIndex, getActivityDealLink, getTaskDealLink } from '../utils/dealLinks'
import { useDealContracts } from './useDealContracts'
import { useDealWorkspace } from './useDealWorkspace'

// Same params (and so the same cache) as the calendar and My Work.
const LIST_PARAMS = { per_page: 200 }

/** Link index of the current deal: its id, lead/customer ids and contract ids. */
export function useDealLinkIndex() {
  const { dealId, leadIndex } = useDealWorkspace()
  const contractsQuery = useDealContracts({ deal_id: dealId })
  const index = useMemo(
    () => buildDealLinkIndex({ dealId, leadIndex, contracts: contractsQuery.contracts }),
    [contractsQuery.contracts, dealId, leadIndex]
  )
  return { index, contracts: contractsQuery.contracts, contractsQuery }
}

/**
 * Calls or meetings of the deal: `internal` ones (linked to the deal itself) and `customer` ones (with a lead
 * of the deal). The list endpoint has no deal filter yet, so the latest 200 are filtered here (see spec §9.4).
 */
export function useDealActivities(type) {
  const { index } = useDealLinkIndex()
  const query = useActivities(LIST_PARAMS)
  const items = useMemo(() => {
    const list = Array.isArray(query.data?.data) ? query.data.data : []
    return list
      .filter((activity) => !type || String(activity.type).toLowerCase() === type)
      .map((activity) => ({ ...activity, dealLink: getActivityDealLink(activity, index) }))
      .filter((activity) => activity.dealLink)
      .sort((left, right) => String(right.startAt || '').localeCompare(String(left.startAt || '')))
  }, [index, query.data, type])
  return { items, isLoading: query.isLoading, error: query.error, refetch: query.refetch }
}

/** Tasks of the deal grouped by link: the deal, its contracts (won-flow follow-ups) and its leads. */
export function useDealTasks() {
  const { index } = useDealLinkIndex()
  const query = useTasks(LIST_PARAMS)
  const groups = useMemo(() => {
    const result = { deal: [], contract: [], lead: [] }
    ;(Array.isArray(query.data) ? query.data : []).forEach((task) => {
      const link = getTaskDealLink(task, index)
      if (link === 'deal') result.deal.push(task)
      else if (link === 'contract') result.contract.push(task)
      else if (link === 'lead' || link === 'customer') result.lead.push(task)
    })
    return result
  }, [index, query.data])
  return { groups, isLoading: query.isLoading, error: query.error, refetch: query.refetch }
}
