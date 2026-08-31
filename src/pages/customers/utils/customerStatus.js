export function extractLeadStatuses(response) {
  const data = response?.data ?? response
  const leadStatuses = Array.isArray(data?.lead) ? data.lead : []

  return leadStatuses
    .filter((status) => String(status?.type || 'lead') === 'lead')
    .filter((status) => Number(status?.active ?? 1) === 1)
    .sort((left, right) => {
      const leftPriority = left?.priority ?? null
      const rightPriority = right?.priority ?? null
      const hasLeftPriority = leftPriority !== null && leftPriority !== undefined && leftPriority !== ''
      const hasRightPriority = rightPriority !== null && rightPriority !== undefined && rightPriority !== ''

      if (hasLeftPriority || hasRightPriority) {
        return Number(leftPriority ?? Number.MAX_SAFE_INTEGER) - Number(rightPriority ?? Number.MAX_SAFE_INTEGER)
      }

      return new Date(left?.created_at || 0).getTime() - new Date(right?.created_at || 0).getTime()
    })
}

export function getCustomerLeadStatusTypeId(customer) {
  return (
    customer?.lead?.status_type_id ??
    customer?.lead?.status?.id ??
    customer?.lead?.status?.status_type_id ??
    customer?.status_type_id ??
    customer?.status?.id ??
    customer?.status?.status_type_id
  )
}

export function getCustomerLeadStatusName(customer) {
  return (
    customer?.lead?.status?.name ??
    customer?.lead?.status?.status ??
    customer?.lead?.status ??
    customer?.status?.name ??
    customer?.status?.status ??
    customer?.status
  )
}

export function countCustomersByStatus(customers = []) {
  return customers.reduce((counts, customer) => {
    const statusId = getCustomerLeadStatusTypeId(customer)
    if (statusId === null || statusId === undefined || statusId === '') return counts

    const key = String(statusId)
    counts[key] = (counts[key] || 0) + 1
    return counts
  }, {})
}

export function filterCustomersByStatusId(customers = [], statusId) {
  if (statusId === null || statusId === undefined || statusId === '') return customers

  const selectedId = String(statusId)
  return customers.filter((customer) => String(getCustomerLeadStatusTypeId(customer) ?? '') === selectedId)
}
