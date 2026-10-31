import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { customersApi } from '../api/customersApi'
import { QUERY_KEYS } from '../../../shared/constants/queryKeys'
import { extractList } from '../../../shared/utils/apiResponse'

export function useCustomers(filters, options = {}) {
  return useInfiniteQuery({
    ...options,
    queryKey: QUERY_KEYS.customers.list(filters),
    queryFn: async ({ pageParam }) => {
      const params = {
        ...(filters || {}),
        ...(pageParam ? { cursor: pageParam } : {}),
      }

      const response = await customersApi.getCustomers(params)

      return {
        ...response,
        data: Array.isArray(response?.data) ? response.data : extractList(response, ['data']),
      }
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => (lastPage?.has_more ? lastPage?.next_cursor : undefined),
  })
}

const selectFreshCustomers = (data) => ({
  ...data,
  pages: data.pages.map((page) => ({
    ...page,
    data: (page.data || []).filter((customer) => customer.lead_type === 'fresh lead'),
  })),
})

export function useFreshCustomers() {
  return useCustomers(undefined, { select: selectFreshCustomers })
}

export function useLostCustomers(filters = {}, options = {}) {
  return useCustomerSegment('lost', filters, options)
}

export function useDoneCustomers(filters = {}, options = {}) {
  return useCustomerSegment('done', filters, options)
}

export function useRetargetingCustomers(filters = {}, options = {}) {
  return useCustomerSegment('retargeting', filters, options)
}

function useCustomerSegment(segment, filters, options) {
  const fetchers = {
    lost: customersApi.getLostCustomers,
    done: customersApi.getDoneCustomers,
    retargeting: customersApi.getRetargetingCustomers,
  }
  return useInfiniteQuery({
    ...options,
    queryKey: QUERY_KEYS.customers[segment](filters),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await fetchers[segment]({ ...filters, page: pageParam })
      return response?.data ?? { data: [] }
    },
    getNextPageParam: (lastPage) => {
      const current = Number(lastPage?.current_page)
      const last = Number(lastPage?.last_page)
      return current > 0 && current < last ? current + 1 : undefined
    },
  })
}

export function useDeletedCustomers(enabled = false) {
  return useQuery({
    queryKey: QUERY_KEYS.customers.deleted,
    queryFn: () => customersApi.getDeletedCustomers(),
    select: (data) => {
      console.log('[useDeletedCustomers] extractList input:', data)
      const result = extractList(data, ['data', 'customers', 'deleted'])
      console.log('[useDeletedCustomers] extractList output:', result)
      return result
    },
    enabled,
  })
}

export function useCustomerInfo(customerId, params, options = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.customers.detail(customerId), params],
    queryFn: () => customersApi.getCustomerInfo(customerId, params),
    enabled: Boolean(customerId) && (options.enabled ?? true),
    ...options,
  })
}

export function useCustomerMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers.all })

  return {
    create: useMutation({ mutationFn: customersApi.createCustomers, onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, payload }) => customersApi.updateCustomer(id, payload),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: customersApi.deleteCustomers, onSuccess: invalidate }),
    restore: useMutation({ mutationFn: customersApi.restoreDeletedCustomers, onSuccess: invalidate }),
    forceDelete: useMutation({ mutationFn: customersApi.forceDeleteCustomers, onSuccess: invalidate }),
  }
}
