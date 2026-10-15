// صفحة النظرة العامة للمنتجات والخدمات /products/overview (اتضاف 2026-10-15).
export default {
  title: 'نظرة عامة',
  description: 'منتجاتك وخدماتك في لمحة: عددهم، وقيمتهم، ومتوزعين فين، وبياناتهم مكتملة قد إيه.',
  loadFailed: 'مقدرناش نحمل النظرة العامة.',
  none: 'مش محدد',
  empty: { title: 'الكتالوج لسه فاضي', description: 'ضيف أنواع الأصناف، وبعدها أول منتجاتك وخدماتك.' },
  alerts: {
    noTypes: {
      product: 'مفيش أنواع منتجات لسه، فالمنتجات بتتضاف من غير قدرات ولا وحدات ولا قطع.',
      service: 'مفيش أنواع خدمات لسه، فالخدمات بتتضاف من غير حجز ولا زيارات ولا مشاركين.',
    },
    noCategories: {
      product: 'مفيش تصنيفات للمنتجات لسه، فالمنتجات مش هتتجمع ولا تتفلتر بالتصنيف.',
      service: 'مفيش تصنيفات للخدمات لسه، فالخدمات مش هتتجمع ولا تتفلتر بالتصنيف.',
    },
    addCategory: { product: 'إضافة تصنيف منتجات', service: 'إضافة تصنيف خدمات' },
    addType: { product: 'إضافة نوع منتج', service: 'إضافة نوع خدمة' },
  },
  total: {
    count: 'المنتجات والخدمات',
    listValue: 'قيمة الكتالوج',
    listValueHint: 'مجموع الأسعار',
    products: 'المنتجات',
    services: 'الخدمات',
  },
  section: {
    title: { product: 'المنتجات', service: 'الخدمات' },
    openList: { product: 'فتح المنتجات', service: 'فتح الخدمات' },
    count: { product: 'المنتجات', service: 'الخدمات والخطط والباقات' },
    activeHint: '{{count}} مفعّل',
    listValue: 'القيمة (مجموع الأسعار)',
    averagePrice: 'متوسط السعر {{value}}',
    stockValue: 'قيمة المخزون',
    itemTypesHint: '{{count}} نوع منتج',
    itemTypes: 'أنواع الخدمات والخطط والباقات',
    withoutType: '{{count}} من غير نوع',
    completeness: 'متوسط الاكتمال',
    incomplete: '{{count}} محتاجين بيانات',
  },
  charts: {
    topCategories: 'الفئات اللي فيها أصناف أكتر',
    topItemTypes: 'الأنواع اللي فيها أصناف أكتر',
    completeness: 'اكتمال البيانات',
    itemsLabel: { product: 'المنتجات', service: 'الخدمات' },
    empty: 'لسه مفيش بيانات.',
  },
  levels: { complete: 'مكتمل', good: 'قرب يكمل', low: 'محتاج بيانات' },
}
