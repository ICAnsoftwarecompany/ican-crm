import { useMemo } from 'react'
import { useCustomers } from '../hooks/useCustomers'

// Deal information comes from GET /api/tenant/customers/data (lead.deal).
// Keep the existing hook interface for the timeline, drawer, count and workspace,
// but never request /api/tenant/customers/:id/deals.
export function useCustomerDeals(customerId) {
  const customersQuery = useCustomers(undefined, { staleTime: 60_000 })
  const data = useMemo(() => {
    const customers = customersQuery.data?.pages?.flatMap((page) => page.data || []) || []
    const customer = customers.find((item) => String(item.id) === String(customerId))
    const embeddedDeal = customer?.lead?.deal
    const deal = embeddedDeal && typeof embeddedDeal === 'object' && !Array.isArray(embeddedDeal) ? embeddedDeal : null
    const deals = deal ? [{
      ...deal,
      deal_id: deal.deal_id ?? deal.id,
      deal: { ...deal, id: deal.deal_id ?? deal.id, name: deal.name || (deal.deal_id != null ? `#${deal.deal_id}` : `#${deal.id}`) },
    }] : []
    return {
      customer: customer || {},
      summary: {
        deals_count: deals.length,
        total_won_value: deal?.won_value != null ? Number(deal.won_value) : 0,
      },
      deals,
    }
  }, [customersQuery.data, customerId])

  return {
    ...customersQuery,
    data,
    isPending: customersQuery.isPending,
    isLoading: customersQuery.isLoading,
    isSuccess: customersQuery.isSuccess,
    isError: customersQuery.isError,
  }
}
