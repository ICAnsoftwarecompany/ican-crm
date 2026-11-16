import i18n from 'i18next'

export function getCustomerLabel(customer) {
  return customer?.name || customer?.email || customer?.phone || i18n.t('customers.leadDetails.customerNumber', { id: customer?.id })
}

export function filterCustomersByKeyword(customers = [], keyword = '') {
  const normalizedKeyword = keyword.trim().toLowerCase()
  if (!normalizedKeyword) return customers

  return customers.filter((customer) => {
    const values = [
      customer?.name,
      customer?.email,
      customer?.phone,
      customer?.company,
      customer?.code,
    ]

    return values.some((value) => String(value || '').toLowerCase().includes(normalizedKeyword))
  })
}
