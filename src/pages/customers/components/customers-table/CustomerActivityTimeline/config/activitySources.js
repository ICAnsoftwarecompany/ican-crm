export const activitySources = {
  customer_details_quick_actions: 'الإجراءات السريعة',
  customer_details_drawer: 'بيانات العميل',
  customers_bulk_actions: 'الإجراءات الجماعية',
  follow_up_dialog: 'متابعة العميل',
}

export function getActivitySourceLabel(source) {
  const key = String(source || '').trim()
  if (!key) return 'غير محدد'
  return activitySources[key] || 'مصدر غير معروف'
}
