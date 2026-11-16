import i18n from 'i18next'

export const activitySources = {
  customer_details_quick_actions: 'customers.activityTimeline.sources.quickActions',
  customer_details_drawer: 'customers.activityTimeline.sources.customerDetails',
  customers_bulk_actions: 'customers.activityTimeline.sources.bulkActions',
  follow_up_dialog: 'customers.activityTimeline.sources.followUp',
}

export function getActivitySourceLabel(source) {
  const key = String(source || '').trim()
  if (!key) return i18n.t('customers.activityTimeline.sources.unspecified')
  return activitySources[key] ? i18n.t(activitySources[key]) : i18n.t('customers.activityTimeline.sources.unknown')
}
