/**
 * المسميات الافتراضية ومسميات الأنشطة. ملف الخصائص بيربط كل كيان
 * (customer, case, record, batch) بمفتاح من دول، أو يبعت مسمى خاص `{ ar, en }`.
 */
export default {
  customer: { one: 'عميل', other: 'العملاء' },
  case: { one: 'طلب', other: 'الطلبات' },
  record: { one: 'سجل خدمة', other: 'سجلات الخدمة' },
  batch: { one: 'مجموعة', other: 'المجموعات' },
  ticket: { one: 'تذكرة', other: 'التذاكر' },
  request: { one: 'طلب', other: 'الطلبات' },
  serviceContract: { one: 'عقد خدمة', other: 'عقود الخدمة' },
  visitBatch: { one: 'دفعة زيارات', other: 'دفعات الزيارات' },
  traveler: { one: 'مسافر', other: 'المسافرون' },
  booking: { one: 'حجز', other: 'الحجوزات' },
  tripGroup: { one: 'رحلة جماعية', other: 'الرحلات الجماعية' },
  guardian: { one: 'ولي أمر', other: 'أولياء الأمور' },
  enrollment: { one: 'تسجيل', other: 'التسجيلات' },
  merchant: { one: 'تاجر', other: 'التجار' },
  shipment: { one: 'شحنة', other: 'الشحنات' },
  manifest: { one: 'مانيفست', other: 'المانيفستات' },
}
