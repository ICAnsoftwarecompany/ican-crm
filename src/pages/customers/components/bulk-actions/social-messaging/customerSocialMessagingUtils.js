export function getCustomerName(customer) {
  return (
    customer?.lead?.name ||
    customer?.name ||
    customer?.lead?.email ||
    customer?.email ||
    customer?.lead?.phone ||
    customer?.phone ||
    'العميل'
  )
}

export function getCustomerContact(customer) {
  return customer?.lead?.phone || customer?.phone || customer?.lead?.email || customer?.email || ''
}

export function getCustomerLeadId(customer) {
  return customer?.lead?.id ?? customer?.lead_id ?? customer?.id ?? null
}

export function buildSocialMessageRecipients(customers = []) {
  if (!Array.isArray(customers)) return []

  return customers
    .map((customer) => ({
      id: customer?.id ?? null,
      lead_id: getCustomerLeadId(customer),
      name: getCustomerName(customer),
      contact: getCustomerContact(customer),
      phone: customer?.lead?.phone || customer?.phone || '',
      email: customer?.lead?.email || customer?.email || '',
    }))
    .filter((recipient) => recipient.lead_id !== null && recipient.lead_id !== undefined && recipient.lead_id !== '')
}
