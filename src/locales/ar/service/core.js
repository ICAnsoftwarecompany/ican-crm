export default {
  title: 'خدمة العملاء',
  overview: {
    title: 'عمليات الخدمة',
    subtitle: 'إيه اللي مفعّل في مساحة العمل دي، ومسمياته، ووصلنا لفين في كل جزء.',
    models: 'نماذج النشاط',
    features: 'الخصائص المفعّلة',
    featuresHint: 'الخصائص بتتحدد من نماذج النشاط المفعّلة وباقة الشركة.',
    terminology: 'المسميات',
    entities: {
      customer: 'العميل',
      case: 'الطلب',
      record: 'سجل الخدمة',
      batch: 'المجموعة',
    },
  },
  mock: {
    title: 'بيانات تجريبية',
    description: '{{count}} من {{total}} جزء في خدمة العملاء شغال ببيانات تجريبية لحد ما الباك إند يجهز.',
    template: 'معاينة نشاط',
    templates: {
      devices: 'أجهزة وصيانة',
      tourism: 'سياحة وسفر',
      school: 'مدرسة',
      shipping: 'شحن',
    },
  },
  roadmap: {
    title: 'مراحل البناء',
    milestones: {
      mvp1: 'إصدار أول',
      mvp2: 'إصدار ثاني',
    },
    source: {
      mock: 'تجريبي',
      live: 'حقيقي',
    },
  },
}
