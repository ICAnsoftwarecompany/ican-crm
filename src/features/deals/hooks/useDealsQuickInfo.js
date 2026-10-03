import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { dealLeadsApi, dealResourcesApi } from '../api'
import { dealKeys } from '../constants/dealQueryKeys'
import { buildDealQuickInfo, getMissingQuickInfo } from '../utils/dealQuickInfo'
import { DEAL_LEADS_LIST_PARAMS, normalizeDealLeadList } from './useDealLeads'
import { normalizeDealProducts, normalizeDealTeam } from './useDealResources'

/** At most this many deals get their team / products / leads fetched (the newest first). */
export const QUICK_INFO_LIMIT = 40
const STALE_TIME = 60 * 1000

/**
 * Quick info per deal for the hub: `Map<dealId, { productsCount, productMode, teamCount, lastAction, ... }>`.
 * Only what the list row lacks is fetched, with the same query keys as the workspace (so opening a deal is
 * instant and nothing is fetched twice). When the backend adds the summary fields to the list (spec §9.11),
 * no request is made at all.
 */
export function useDealsQuickInfo(deals = []) {
  const targets = useMemo(
    () => deals.slice(0, QUICK_INFO_LIMIT).map((deal) => ({ id: deal.id, missing: getMissingQuickInfo(deal) })),
    [deals]
  )

  const queries = useMemo(() => targets.flatMap(({ id, missing }) => [
    missing.products && { queryKey: dealKeys.products(String(id)), queryFn: () => dealResourcesApi.getProducts(id), staleTime: STALE_TIME, meta: { id, kind: 'products' } },
    missing.team && { queryKey: dealKeys.team(String(id)), queryFn: () => dealResourcesApi.getTeam(id), staleTime: STALE_TIME, meta: { id, kind: 'team' } },
    missing.leads && { queryKey: dealKeys.leads(String(id), DEAL_LEADS_LIST_PARAMS), queryFn: () => dealLeadsApi.getAll(id, DEAL_LEADS_LIST_PARAMS), staleTime: STALE_TIME, meta: { id, kind: 'leads' } },
  ].filter(Boolean)), [targets])

  const results = useQueries({ queries })
  // useQueries returns a new array each render; key the memo on the data references instead.
  const dataKey = results.map((result) => result.dataUpdatedAt).join('|')

  const infos = useMemo(() => {
    const fetched = new Map()
    results.forEach((result, position) => {
      const { id, kind } = queries[position].meta
      if (!result.data) return
      const entry = fetched.get(String(id)) || {}
      if (kind === 'products') entry.products = normalizeDealProducts(result.data)
      if (kind === 'team') entry.team = normalizeDealTeam(result.data)
      if (kind === 'leads') entry.leads = normalizeDealLeadList(result.data)
      fetched.set(String(id), entry)
    })
    return new Map(deals.map((deal) => {
      const entry = fetched.get(String(deal.id)) || {}
      return [String(deal.id), buildDealQuickInfo({ deal, products: entry.products ?? null, team: entry.team ?? null, leads: entry.leads ?? null })]
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataKey, deals, queries])

  const leadsByDeal = useMemo(() => {
    const map = new Map()
    results.forEach((result, position) => {
      const { id, kind } = queries[position].meta
      if (kind === 'leads' && result.data) map.set(String(id), normalizeDealLeadList(result.data))
    })
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataKey, queries])

  return { infos, leadsByDeal, isLoading: results.some((result) => result.isLoading), limited: deals.length > QUICK_INFO_LIMIT }
}
