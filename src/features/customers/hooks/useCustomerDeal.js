import { useQuery } from '@tanstack/react-query'
import { dealKeys, dealsApi } from '../../deals'

export function useCustomerDeal(customer) {
  const link = customer?.lead?.deal ?? customer?.deal
  const dealId = link?.deal_id
  const query = useQuery({
    queryKey: [...dealKeys.all, 'customer-link-directory'],
    enabled: dealId != null,
    staleTime: 60000,
    queryFn: async () => {
      const deals = []
      let page = 1
      let lastPage = 1
      do {
        const response = await dealsApi.getAll({ page })
        const payload = response?.data ?? response
        const rows = Array.isArray(payload) ? payload : payload?.data
        if (Array.isArray(rows)) deals.push(...rows)
        lastPage = Number(payload?.last_page) || 1
        page += 1
      } while (page <= lastPage)
      return deals
    },
  })

  return {
    ...query,
    link,
    dealId,
    deal: query.data?.find((item) => String(item.id) === String(dealId)),
  }
}
