export default {
  title: 'إدارة العملاء',
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
  errors: {
    PIPELINE_STATUS_IN_USE: 'حالة حذفتها ما زالت مستخدمة في طلبات أو سجلات. انقلها أولًا أو احتفظ بالحالة.',
    generic: 'حصلت مشكلة. حاول مرة تانية.',
    CONFLICT_VERSION: 'حد تاني عدّل السجل ده. اتحملت آخر نسخة، حاول تاني.',
    CASE_TRANSITION_NOT_ALLOWED: 'مينفعش تغيّر الحالة دي من الحالة الحالية.',
    VALIDATION_FAILED: 'من فضلك كمّل الحقول المطلوبة.',
    NOT_FOUND: 'السجل ده مش موجود.',
    FORBIDDEN: 'مش عندك صلاحية تعمل ده.',
    FEATURE_DISABLED: 'الخاصية دي مش مفعّلة في مساحة العمل بتاعتك.',
    MOCK_ROUTE_NOT_FOUND: 'البيانات التجريبية مش متاحة للإجراء ده لسه.',
    RESOURCE_IN_USE: 'العنصر ده مستخدم في سجلات تانية. عطّله بدل ما تحذفه.',
  },
  mock: {
    title: 'بيانات تجريبية',
    description: '{{count}} من {{total}} جزء في إدارة العملاء شغال ببيانات تجريبية لحد ما الباك إند يجهز.',
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
