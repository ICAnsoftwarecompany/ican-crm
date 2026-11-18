const customerColumns = {
  devices: ['id', 'lead_id', 'name', 'code', 'phone', 'email', 'company', 'type', 'source', 'general_status', 'agent_id', 'linked_type', 'linked_by', 'tag', 'link_date', 'created_at', 'updated_at'],
  tourism: ['id', 'name', 'phone', 'email', 'company', 'general_status', 'source', 'agent_id', 'created_at'],
  school: ['id', 'name', 'phone', 'email', 'company', 'general_status', 'tag', 'agent_id', 'created_at'],
  shipping: ['id', 'name', 'code', 'phone', 'email', 'company', 'general_status', 'source', 'agent_id', 'created_at'],
}


export const CUSTOMER_MANAGEMENT_TEMPLATES = {
  devices: {
    directory: { columns: customerColumns.devices },
    tickets: { key: 'devices', termKey: 'maintenanceRequest', wordingKey: 'devices' },
    reports: { tabs: ['overview', 'feedback', 'quality', 'advanced'] },
  },
  tourism: {
    directory: { columns: customerColumns.tourism },
    tickets: { key: 'tourism', termKey: 'request', wordingKey: 'default' },
    reports: { tabs: ['overview', 'feedback'] },
  },
  school: {
    directory: { columns: customerColumns.school },
    tickets: { key: 'school', termKey: 'request', wordingKey: 'default' },
    reports: { tabs: ['overview', 'quality'] },
  },
  shipping: {
    directory: { columns: customerColumns.shipping },
    tickets: { key: 'shipping', termKey: 'shippingRequest', wordingKey: 'shipping' },
    reports: { tabs: ['overview', 'feedback', 'quality'] },
  },
}

export function resolveCustomerManagementTemplate(key) {
  const normalizedKey = String(key || '').trim().toLowerCase()
  const resolvedKey = Object.prototype.hasOwnProperty.call(CUSTOMER_MANAGEMENT_TEMPLATES, normalizedKey) ? normalizedKey : 'devices'
  return { key: resolvedKey, ...CUSTOMER_MANAGEMENT_TEMPLATES[resolvedKey] }
}
