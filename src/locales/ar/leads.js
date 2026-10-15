export default {
  "title": "العملاء المحتملون",
  "newLead": "عميل محتمل جديد",
  "noLeads": "لا يوجد عملاء محتملون",
  "noLeadsDesc": "ابدأ بإضافة عميل محتمل جديد",
  "name": "الاسم",
  "phone": "الهاتف",
  "source": "المصدر",
  "assignedTo": "مسند إلى",
  "createdAt": "تاريخ الإنشاء",
  "tableView": "عرض جدول",
  "kanbanView": "عرض كانبان",
  "created": "تم إنشاء العميل المحتمل بنجاح",
  "page": {
    "newRuleTitle": "قاعدة توزيع جديدة",
    "ruleNameLabel": "اسم القاعدة",
    "activeLabel": "نشطة",
    "inactiveLabel": "غير نشطة",
    "createRule": "إنشاء القاعدة",
    "distributionRulesTitle": "قواعد التوزيع",
    "noRulesFound": "لا توجد قواعد توزيع",
    "ruleFallback": "قاعدة #{{id}}",
    "ruleCreated": "تم إنشاء قاعدة التوزيع",
    "ruleCreateFailed": "فشل إنشاء قاعدة التوزيع"
  },
  "interestDialog": {
    "addTitle": "إضافة اهتمام",
    "editTitle": "تعديل الاهتمام",
    "pickDescription": "العميل: {{name}} — اختار المنتج أو الخدمة اللي مهتم بيها",
    "detailsDescription": "العميل: {{name}} — حدد تفاصيل الاهتمام",
    "submit": "إضافة الاهتمام",
    "save": "حفظ التعديلات",
    "added": "تمت إضافة الاهتمام",
    "updated": "تم تعديل الاهتمام",
    "addFailed": "فشل إضافة الاهتمام",
    "updateFailed": "فشل تعديل الاهتمام",
    "noLead": "العميل ده مش مربوط بليد، فمينفعش يتضاف له اهتمام",
    "changeProduct": "تغيير",
    "openProduct": "فتح صفحة الصنف",
    "backToDetails": "رجوع للتفاصيل",
    "noTypeHint": "الصنف ده من غير نوع، فهتظهر الحقول الأساسية بس. حدد له نوع من صفحة المنتجات عشان تظهر حقوله الخاصة.",
    "serialHint": "الصنف ده بسيريال: السيريال بيتحدد وقت البيع أو التسليم، مش في الاهتمام.",
    "kinds": {
      "all": "الكل",
      "product": "منتجات",
      "service": "خدمات",
      "plan": "خطط واشتراكات",
      "bundle": "باقات"
    },
    "picker": {
      "kindsLabel": "نوع الصنف",
      "typesLabel": "أنواع الأصناف",
      "search": "ابحث بالاسم أو الكود أو الفئة",
      "allTypes": "كل الأنواع",
      "noType": "من غير نوع",
      "noResults": "مفيش أصناف بالبحث ده",
      "loadFailed": "تعذر تحميل المنتجات والخدمات",
      "retry": "إعادة المحاولة",
      "emptyCatalog": "مفيش منتجات أو خدمات لسه",
      "emptyCatalogHint": "ضيف المنتجات والخدمات اللي بتبيعها الأول، وبعدها سجل اهتمام العميل.",
      "addToCatalog": "إضافة منتج أو خدمة"
    },
    "fields": {
      "unit": "الوحدة",
      "baseUnit": "الوحدة الأساسية",
      "quantity": "الكمية",
      "serviceQuantity": "العدد (مرات / زيارات / ساعات)",
      "participants": "عدد الأفراد",
      "participantsRange": "من {{min}} لـ {{max}}",
      "preferredDate": "التاريخ المفضل",
      "level": "درجة الاهتمام",
      "note": "ملاحظة",
      "notePlaceholder": "اكتب ملاحظة عن اهتمام العميل"
    },
    "units": {
      "title": "الوحدات اللي العميل مهتم بيها",
      "hint": "متاح {{available}} من {{total}}. تقدر تختار أكتر من وحدة أو تسيبها فاضية.",
      "holdHint": "الحجز المؤقت للوحدة: {{count}} يوم.",
      "empty": "مفيش وحدات مسجلة للصنف ده لسه",
      "loadFailed": "تعذر تحميل الوحدات"
    },
    "relations": {
      "included": "بييجي معاه",
      "optional": "إضافات العميل ممكن يهتم بيها",
      "free": "مجاناً"
    },
    "estimate": {
      "label": "القيمة المتوقعة",
      "unknown": "غير محددة"
    },
    "facts": {
      "warranty": "ضمان {{count}} شهر",
      "recurrence": "بيتجدد كل {{every}} {{unit}}",
      "perCycle": "/ {{unit}}",
      "perPerson": "السعر للفرد",
      "installments": "متاح بالتقسيط",
      "creates": "البيع بينشئ: {{value}}"
    },
    "cycle": {
      "day": "يوم",
      "week": "أسبوع",
      "month": "شهر",
      "year": "سنة"
    },
    "errors": {
      "chooseProduct": "اختار المنتج أو الخدمة الأول",
      "quantity": "الكمية لازم تكون أكبر من صفر",
      "participants": "عدد الأفراد لازم يكون 1 أو أكتر",
      "participantsMin": "أقل عدد {{min}}",
      "participantsMax": "أكبر عدد {{max}}"
    },
    "chips": {
      "quantity": "الكمية: {{value}}",
      "units": "وحدات مختارة: {{count}}",
      "date": "التاريخ: {{value}}",
      "participants": "أفراد: {{count}}",
      "addOns": "إضافات: {{count}}",
      "value": "القيمة: {{value}}"
    }
  }
}
