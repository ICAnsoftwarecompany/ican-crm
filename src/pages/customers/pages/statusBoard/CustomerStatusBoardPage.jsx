import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'

import { definitionsApi } from '../../../../features/definitions/api/definitionsApi'
import { useCustomers } from '../../../../features/customers/hooks/useCustomers'
import { Button } from '../../../../shared/components/ui/Button'
import { useLocalStorage } from '../../../../shared/components/data-table/hooks/useLocalStorage'
import { extractLeadStatuses, filterCustomersByStatusId } from '../../utils/customerStatus'
import { CustomerStatusBoardBreadcrumbs } from './components/CustomerStatusBoardBreadcrumbs'
import { CustomerStatusBoardHeader } from './components/CustomerStatusBoardHeader'
import { StatusCustomersColumn } from './components/StatusCustomersColumn'
import { StatusTabsSelector } from './components/StatusTabsSelector'

function parseStatusIds(value) {
  if (!value) return []
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function CustomerStatusBoardPage() {
  const [searchParams] = useSearchParams()
  const initialStatusIds = parseStatusIds(searchParams.get('statuses'))
  const [selectedStatusIds, setSelectedStatusIds] = useLocalStorage(
    'customers-status-board-selected-tabs',
    initialStatusIds
  )

  useEffect(() => {
    if (initialStatusIds.length) {
      setSelectedStatusIds(initialStatusIds)
    }
  }, [searchParams])

  const statusesQuery = useQuery({
    queryKey: ['customers', 'status-board', 'statuses'],
    queryFn: () => definitionsApi.getStatuses(),
    staleTime: 1000 * 60,
  })
  const customersQuery = useCustomers()

  const statuses = useMemo(
    () => extractLeadStatuses(statusesQuery.data),
    [statusesQuery.data]
  )
  const customers = customersQuery.data?.pages.flatMap((page) => page.data) || []
  const selectedSet = useMemo(
    () => new Set((selectedStatusIds || []).map(String)),
    [selectedStatusIds]
  )
  const visibleStatuses = useMemo(
    () => statuses.filter((status) => selectedSet.has(String(status.id))),
    [selectedSet, statuses]
  )

  const toggleStatus = (statusId) => {
    const key = String(statusId)
    setSelectedStatusIds((current = []) => {
      const currentSet = new Set(current.map(String))
      if (currentSet.has(key)) {
        currentSet.delete(key)
      } else {
        currentSet.add(key)
      }
      return Array.from(currentSet)
    })
  }

  const gridTemplateColumns = visibleStatuses.length
    ? `repeat(${visibleStatuses.length}, minmax(260px, 1fr))`
    : undefined

  return (
    <div className="space-y-3">
      <CustomerStatusBoardBreadcrumbs />
      <CustomerStatusBoardHeader>
        <StatusTabsSelector
          statuses={statuses}
          selectedStatusIds={selectedStatusIds || []}
          onToggleStatus={toggleStatus}
        />
      </CustomerStatusBoardHeader>

      {(statusesQuery.isLoading || customersQuery.isLoading) && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--text-muted)]">
          جاري تحميل بيانات العرض...
        </div>
      )}

      {(statusesQuery.isError || customersQuery.isError) && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          تعذر تحميل بيانات العرض المتعدد.
        </div>
      )}

      {!statusesQuery.isLoading && visibleStatuses.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#BEEFF2] bg-[#F8FEFF] p-8 text-center text-sm text-[var(--text-muted)]">
          اختر حالتين أو أكثر من الأعلى لعرض العملاء في أعمدة منفصلة.
        </div>
      )}

      {visibleStatuses.length > 0 && (
        <div
          className="grid gap-3 overflow-x-auto"
          style={{ gridTemplateColumns }}
        >
          {visibleStatuses.map((status) => (
            <StatusCustomersColumn
              key={status.id}
              status={status}
              customers={filterCustomersByStatusId(customers, status.id)}
            />
          ))}
        </div>
      )}

      {customersQuery.hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => customersQuery.fetchNextPage()}
            loading={customersQuery.isFetchingNextPage}
          >
            تحميل المزيد من العملاء
          </Button>
        </div>
      )}
    </div>
  )
}
