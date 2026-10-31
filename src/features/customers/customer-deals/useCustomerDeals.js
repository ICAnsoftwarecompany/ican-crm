import { useQuery } from '@tanstack/react-query'
import { customersApi } from '../api/customersApi'
import { normalizeCustomerDeals } from './customerDealsModel'

export function customerDealsQueryOptions(customerId) {
  return {
    queryKey: ['customers', 'deals', String(customerId)],
    queryFn: async () => {
      const response = await customersApi.getDeals(customerId)
      if (response?.success === false) throw new Error(response.message || 'customer_deals_failed')
      return response
    },
    select: normalizeCustomerDeals,
    enabled: Boolean(customerId),
    staleTime: 60_000,
  }
}

export function useCustomerDeals(customerId) {
  return useQuery(customerDealsQueryOptions(customerId))
}
