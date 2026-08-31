import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { customersApi } from '../api/customersApi'
import { QUERY_KEYS } from '../../../shared/constants/queryKeys'
import { extractList } from '../../../shared/utils/apiResponse'

export function useCustomers(filters) {
  return useInfiniteQuery({
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
