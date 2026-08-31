import { useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { resolveTenantId } from '../../services/tenantResolver'
import { QUERY_KEYS } from '../../shared/constants/queryKeys'
import { useRealtimeChannel } from './useRealtimeChannel'

function upsertCustomer(items = [], customer, { prepend = false } = {}) {
  if (!customer?.id) return items

  const exists = items.some((item) => String(item?.id) === String(customer.id))
  if (exists) {
    return items.map((item) => (String(item?.id) === String(customer.id) ? { ...item, ...customer } : item))
  }

  return prepend ? [customer, ...items] : [...items, customer]
}

function removeCustomer(items = [], customerId) {
  if (!customerId) return items
  return items.filter((item) => String(item?.id) !== String(customerId))
}

function updateActiveCustomersCache(current, action, customer) {
  if (!current || !Array.isArray(current.pages)) return current

  const shouldBeDeleted = Boolean(customer?.deleted_at) || action === 'deleted'

  return {
    ...current,
    pages: current.pages.map((page, index) => {
      const currentRows = Array.isArray(page?.data) ? page.data : []
      let nextRows = currentRows

      if (shouldBeDeleted) {
        nextRows = removeCustomer(currentRows, customer?.id)
      } else if (action === 'created') {
        nextRows = index === 0 ? upsertCustomer(currentRows, customer, { prepend: true }) : currentRows
      } else {
        nextRows = upsertCustomer(currentRows, customer)
      }

      return {
        ...page,
        data: nextRows,
      }
    }),
  }
}

function updateDeletedCustomersCache(current = [], action, customer) {
  const rows = Array.isArray(current) ? current : []
  const shouldBeDeleted = Boolean(customer?.deleted_at) || action === 'deleted'

  if (shouldBeDeleted) {
    return upsertCustomer(rows, customer, { prepend: true })
  }

  return removeCustomer(rows, customer?.id)
}

export function useCustomersTableRealtime({ tenantId = '', enabled = true } = {}) {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const resolvedTenantId = useMemo(() => resolveTenantId(user, tenantId), [user, tenantId])
  const channelName = useMemo(() => {
    if (!resolvedTenantId) return ''
    return `tenant.${resolvedTenantId}.customers-table`
  }, [resolvedTenantId])

  const handleCustomerRowUpdated = useCallback((payload = {}) => {
    const action = payload.action || 'updated'
    const customer = payload.customer

    if (!customer?.id) {
      console.warn('[Realtime diagnostic] customers-table payload missing customer.id', payload)
      return
    }

    console.info('[Realtime diagnostic] customers-table event received', {
      channelName,
      action,
      customerId: customer.id,
      deletedAt: customer.deleted_at || null,
    })

    queryClient.setQueriesData(
      { queryKey: ['customers', 'list'] },
      (current) => updateActiveCustomersCache(current, action, customer)
    )

    queryClient.setQueryData(
      QUERY_KEYS.customers.deleted,
      (current) => updateDeletedCustomersCache(current, action, customer)
    )

    queryClient.setQueryData(QUERY_KEYS.customers.detail(customer.id), (current) => {
      if (!current) return current
      return {
        ...current,
        ...customer,
      }
    })
  }, [channelName, queryClient])

  return useRealtimeChannel({
    channelName,
    eventName: '.customer.row.updated',
    enabled: Boolean(enabled && resolvedTenantId),
    isPrivate: true,
    onEvent: handleCustomerRowUpdated,
  })
}
