// Sales teams + lead distribution rules (/LeadsCenter/teams, features/leads/sales-teams), 2026-10-15.
export default {
  "title": "فرق السيلز وتوزيع الليدز",
  "description": "كوّن فرق السيلز وحدد قائد كل فريق وأعضاءه، ثم حدد قواعد توزيع الليدز الجديدة على الفرق أو على موظف بعينه.",
  "tabs": {
    "teams": "الفرق",
    "rules": "قواعد التوزيع"
  },
  "kpis": {
    "teams": "الفرق",
    "rules": "قواعد التوزيع",
    "users": "المستخدمون",
    "unassigned": "بدون فريق",
    "unassignedHint": "ليسوا قادة ولا أعضاء في أي فريق",
    "activeOf": "{{count}} نشطة"
  },
  "common": {
    "active": "نشط",
    "inactive": "غير نشط",
    "loading": "جاري التحميل...",
    "noResults": "لا توجد نتائج مطابقة",
    "save": "حفظ التعديلات"
  },
  "filters": {
    "allTypes": "كل الأنواع",
    "allStatuses": "كل الحالات",
    "allAssignTypes": "كل طرق التوزيع",
    "status": "الحالة",
    "clear": "مسح الفلاتر"
  },
  "teamTypes": {
    "general": { "label": "عام", "hint": "فريق عام بدون تخصص محدد." },
    "sales": { "label": "مبيعات", "hint": "يستقبل الليدز ويتابعها حتى الكسب أو الخسارة." },
    "support": { "label": "دعم فني", "hint": "يتابع طلبات ومشاكل العملاء." },
    "collections": { "label": "تحصيل", "hint": "يتابع الأقساط والمدفوعات المتأخرة." },
    "onboarding": { "label": "تهيئة العملاء", "hint": "يستلم العميل بعد الكسب ويجهز بدايته." },
    "operations": { "label": "عمليات", "hint": "تنفيذ وتشغيل الخدمات بعد البيع." }
  },
  "teams": {
    "new": "فريق جديد",
    "create": "إنشاء الفريق",
    "createTitle": "إنشاء فريق جديد",
    "editTitle": "تعديل الفريق",
    "edit": "تعديل الفريق",
    "editNamed": "تعديل فريق {{name}}",
    "dialogDescription": "اسم الفريق ونوعه وقائده والأعضاء اللي هيستقبلوا الليدز.",
    "name": "اسم الفريق",
    "namePlaceholder": "مثال: فريق مبيعات القاهرة",
    "type": "نوع الفريق",
    "typeLocked": "نوع الفريق يتحدد عند الإنشاء فقط.",
    "leader": "قائد الفريق",
    "noLeader": "بدون قائد",
    "activeLabel": "الفريق نشط ويستقبل ليدز",
    "members": "الأعضاء",
    "membersCount": "{{count}} عضو",
    "membersCount_one": "عضو واحد",
    "noMembers": "لا يوجد أعضاء بعد",
    "searchPlaceholder": "ابحث باسم الفريق أو القائد أو عضو",
    "searchUsers": "ابحث باسم المستخدم أو البريد",
    "noUsers": "لا يوجد مستخدمون مطابقون",
    "selectShown": "تحديد الظاهرين",
    "unselectShown": "إلغاء تحديد الظاهرين",
    "receivesFrom": "يستقبل من {{count}} قاعدة نشطة",
    "receivesFrom_one": "يستقبل من قاعدة نشطة واحدة",
    "noRules": "لا توجد قاعدة توزيع لهذا الفريق",
    "addRule": "قاعدة توزيع",
    "emptyTitle": "لا توجد فرق بعد",
    "emptyDescription": "أنشئ أول فريق، اختر قائده وأعضاءه، ثم وجّه له الليدز بقاعدة توزيع.",
    "created": "تم إنشاء الفريق",
    "updated": "تم حفظ الفريق",
    "saveFailed": "تعذر حفظ الفريق"
  },
  "assignTypes": {
    "round_robin": { "label": "بالدور (Round robin)", "description": "الليدز تتوزع على أعضاء الفريق واحد ورا التاني بالتساوي." },
    "team": { "label": "للفريق", "description": "الليد يروح للفريق كله، وأي عضو فيه يقدر يستلمه." },
    "team_leader": { "label": "لقائد الفريق", "description": "الليد يروح لقائد الفريق، وهو يوزعه بعد كده." },
    "user": { "label": "لموظف محدد", "description": "الليد يروح مباشرة لموظف واحد تختاره (مثلاً عملاء VIP)." }
  },
  "conditions": {
    "source": "المصدر",
    "campaign_id": "الحملة",
    "ad_id": "الإعلان",
    "form_id": "نموذج الليد"
  },
  "sources": {
    "facebook": "فيسبوك",
    "messenger": "ماسنجر",
    "whatsapp": "واتساب",
    "lead_form": "نموذج ليد",
    "website": "الموقع",
    "google": "جوجل",
    "referral": "ترشيح",
    "manual": "يدوي",
    "other": "أخرى"
  },
  "rules": {
    "new": "قاعدة توزيع جديدة",
    "create": "إنشاء القاعدة",
    "createTitle": "قاعدة توزيع جديدة",
    "editTitle": "تعديل قاعدة التوزيع",
    "edit": "تعديل القاعدة",
    "dialogDescription": "حدد أي ليدز تنطبق عليها القاعدة، وتروح لمين وبأي طريقة.",
    "name": "اسم القاعدة",
    "namePlaceholder": "مثال: ليدز فيسبوك رمضان",
    "nameForTeam": "ليدز {{team}}",
    "fallbackName": "قاعدة #{{id}}",
    "priority": "الأولوية",
    "priorityHint": "رقم صحيح، الأكبر يظهر أولاً",
    "conditionsTitle": "الليدز المستهدفة",
    "conditionsHint": "سيب أي شرط فاضي عشان يقبل أي قيمة. لو كل الشروط فاضية القاعدة تنطبق على كل الليدز.",
    "anyValue": "أي قيمة",
    "allLeads": "كل الليدز",
    "assignType": "طريقة التوزيع",
    "targetTeam": "الفريق",
    "targetUser": "الموظف",
    "teamPreview": "الفريق فيه {{count}} عضو غير القائد.",
    "teamPreview_one": "الفريق فيه عضو واحد غير القائد.",
    "teamLeaderPreview": "الليدز هتروح لـ {{name}}.",
    "activeLabel": "القاعدة نشطة",
    "activate": "تفعيل القاعدة",
    "deactivate": "إيقاف القاعدة",
    "activated": "تم تفعيل القاعدة",
    "deactivated": "تم إيقاف القاعدة",
    "searchPlaceholder": "ابحث باسم القاعدة أو الفريق أو الحملة",
    "emptyTitle": "لا توجد قواعد توزيع",
    "emptyDescription": "بدون قواعد، الليدز الجديدة مش هتتوزع تلقائياً. أضف قاعدة لكل مصدر أو حملة.",
    "created": "تم إنشاء القاعدة",
    "updated": "تم حفظ القاعدة",
    "saveFailed": "تعذر حفظ القاعدة"
  },
  "guide": {
    "title": "إزاي توزيع الليدز بيشتغل؟",
    "step1": "لما ليد جديد يدخل (إعلان، نموذج، واتساب...) السيرفر يدور على القواعد النشطة اللي شروطها تنطبق عليه.",
    "step2": "الشرط الفاضي يقبل أي قيمة. القواعد معروضة حسب الأولوية، الأكبر أولاً.",
    "step3": "القاعدة المطابقة تحدد مين يستلم الليد حسب طريقة التوزيع:",
    "backendNote": "التوزيع نفسه بيتم على السيرفر؛ الصفحة دي بتعرّف القواعد بس."
  },
  "warnings": {
    "missingTeam": "لم يتم اختيار فريق",
    "missingUser": "لم يتم اختيار موظف",
    "inactiveTeam": "الفريق غير نشط، الليدز مش هتوصل له",
    "noLeader": "الفريق بدون قائد",
    "emptyTeam": "الفريق بدون أعضاء",
    "unknownUser": "الموظف غير موجود في قائمة المستخدمين"
  },
  "errors": {
    "nameRequired": "الاسم مطلوب",
    "typeRequired": "اختر نوع الفريق",
    "assignTypeRequired": "اختر طريقة التوزيع",
    "teamRequired": "اختر الفريق",
    "userRequired": "اختر الموظف",
    "priorityInvalid": "الأولوية لازم تكون رقم صحيح 0 أو أكبر"
  }
}
