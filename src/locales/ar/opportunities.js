export default {
  "title": "مركز الفرص البيعية",
  "description": "اكتشف فرص البيع التكميلي والترقية والتجديد المحتملة، وتابعها من مكان واحد.",
  "overview": "نظرة عامة",
  "inbox": "صندوق الفرص",
  "table": "كل الفرص",
  "noOpportunities": "لا توجد فرص بيعية بعد",
  "potentialRevenue": "القيمة المحتملة الإجمالية",
  "highPotential": "إمكانية عالية",
  "needsAttention": "تحتاج متابعة",
  "sourceDistribution": "توزيع المصادر",
  "topOpportunities": "أعلى الفرص إمكانية",
  "why": "لماذا هذه الفرصة؟",
  "signals": "الإشارات",
  "noSignals": "لا توجد إشارات مسجلة لهذه الفرصة.",
  "activityTimeline": "سجل النشاط",
  "noActivity": "لا يوجد نشاط مسجل بعد.",
  "scoreBreakdown": "تفاصيل الـ Score",
  "aiConfidence": "AI Confidence",
  "aiConfidenceHint": "مدى ثقة الذكاء الاصطناعي في مصدر الفرصة — منفصل تمامًا عن Score الفرصة نفسه.",
  "aiConfidenceUnavailable": "لا يوجد AI Confidence لأن مصدر هذه الفرصة ليس اقتراحًا من الذكاء الاصطناعي.",
  "dismiss": "رفض",
  "watch": "مراقبة",
  "qualify": "تأهيل",
  "activate": "تفعيل",
  "assign": "إسناد",
  "scoreOutOf100": "Score / 100",
  "estimatedValue": "القيمة المحتملة",
  "unassigned": "غير مسند",
  "types": {
    "new_sale": "بيع جديد",
    "cross_sell": "بيع تكميلي",
    "upsell": "ترقية باقة",
    "expansion": "توسع",
    "renewal": "تجديد",
    "reactivation": "إعادة تفعيل",
    "buying_intent": "نية شراء",
    "campaign_engagement": "تفاعل حملة",
    "referral": "إحالة",
    "other": "أخرى"
  },
  "statuses": {
    "new": "جديدة",
    "reviewing": "قيد المراجعة",
    "watching": "تحت المراقبة",
    "qualified": "مؤهلة",
    "activated": "مفعّلة",
    "dismissed": "مرفوضة",
    "expired": "منتهية"
  },
  "sources": {
    "ai": "AI",
    "system_rule": "قاعدة نظام",
    "segment": "تصنيف",
    "campaign": "حملة",
    "conversation": "محادثة",
    "customer_service": "خدمة عملاء",
    "manual": "يدوي",
    "other": "أخرى"
  },
  "signalTypes": {
    "ai_conversation": "محادثة AI",
    "segment_match": "تطابق تصنيف",
    "campaign_event": "حدث حملة",
    "manual_note": "ملاحظة يدوية",
    "call_report": "تقرير مكالمة",
    "meeting_report": "تقرير اجتماع"
  },
  "dismissReasons": {
    "not_relevant": "غير ذات صلة",
    "wrong_recommendation": "توصية غير صحيحة",
    "already_purchased": "تم الشراء بالفعل",
    "no_need": "لا يوجد احتياج",
    "bad_timing": "توقيت غير مناسب",
    "no_budget": "لا توجد ميزانية",
    "duplicate": "فرصة مكررة",
    "customer_not_eligible": "العميل غير مؤهل",
    "wrong_product": "منتج غير مناسب",
    "other": "سبب آخر"
  },
  "timelineEvents": {
    "detected": "تم اكتشاف الفرصة",
    "signal_added": "تمت إضافة إشارة جديدة",
    "score_changed": "تغيّر Score الفرصة",
    "assigned": "تم إسناد الفرصة",
    "status_changed": "تغيّرت حالة الفرصة",
    "note_added": "تمت إضافة ملاحظة"
  },
  "scoreComponents": {
    "fit": "Fit",
    "intent": "Intent",
    "engagement": "Engagement",
    "timing": "Timing"
  },
  "relativeTime": {
    "now": "الآن",
    "minutesAgo": "منذ {{count}} دقيقة",
    "hoursAgo": "منذ {{count}} ساعة",
    "daysAgo": "منذ {{count}} يوم",
    "monthsAgo": "منذ {{count}} شهر"
  },
  "timelineMeta": {
    "statusChanged": "الحالة الجديدة: {{status}}",
    "scoreChanged": "من {{from}} إلى {{to}}",
    "assignedTo": "تم الإسناد إلى {{name}}"
  },
  "columns": {
    "title": "الفرصة",
    "customer": "العميل",
    "type": "النوع",
    "product": "المنتج",
    "priority": "الأولوية",
    "source": "المصدر",
    "owner": "المسؤول",
    "status": "الحالة",
    "nextAction": "الإجراء القادم",
    "detectedAt": "تاريخ الاكتشاف"
  },
  "dialogs": {
    "optionalPlaceholder": "اختياري",
    "dismiss": {
      "title": "رفض الفرصة",
      "reasonLabel": "سبب الرفض",
      "noteLabel": "ملاحظة",
      "submit": "رفض الفرصة",
      "reasonRequired": "اختر سبب الرفض أولًا",
      "successMsg": "تم رفض الفرصة",
      "errorMsg": "تعذر رفض الفرصة"
    },
    "activate": {
      "title": "تفعيل الفرصة",
      "submit": "تفعيل",
      "successMsg": "تم تفعيل الفرصة بنجاح",
      "errorMsg": "تعذر تفعيل الفرصة",
      "productLabel": "المنتج",
      "estimatedValueLabel": "القيمة المتوقعة",
      "assignToLabel": "إسناد إلى",
      "teamLabel": "الفريق",
      "nextActionLabel": "الإجراء القادم",
      "nextActionAtLabel": "موعد الإجراء القادم",
      "nextActionOptions": {
        "call_customer": "الاتصال بالعميل",
        "send_proposal": "إرسال عرض سعر",
        "schedule_meeting": "جدولة اجتماع",
        "send_email": "إرسال بريد متابعة"
      }
    },
    "watch": {
      "title": "مراقبة الفرصة",
      "submit": "مراقبة",
      "successMsg": "تم وضع الفرصة تحت المراقبة",
      "errorMsg": "تعذر وضع الفرصة تحت المراقبة",
      "reviewDateLabel": "مراجعة مرة أخرى بتاريخ",
      "reasonLabel": "السبب"
    },
    "assign": {
      "title": "إسناد الفرصة",
      "submit": "إسناد",
      "successMsg": "تم إسناد الفرصة",
      "errorMsg": "تعذر إسناد الفرصة",
      "userLabel": "المستخدم المسؤول",
      "teamLabel": "الفريق"
    }
  },
  "groups": {
    "high_potential": "إمكانية عالية",
    "needs_review": "تحتاج مراجعة",
    "needs_attention": "تحتاج متابعة عاجلة",
    "ai_suggested": "مقترحة من AI",
    "system_detected": "مكتشفة من النظام",
    "campaign_generated": "ناتجة عن حملة",
    "watching": "تحت المراقبة"
  },
  "inbox": {
    "emptyGroup": "لا توجد فرص في هذه المجموعة حاليًا",
    "empty": "صندوق الفرص فارغ"
  },
  "actionsBar": {
    "qualifySuccess": "تم تأهيل الفرصة",
    "qualifyError": "تعذر تأهيل الفرصة"
  },
  "customerCard": {
    "title": "بيانات العميل",
    "openProfile": "فتح ملف العميل",
    "nameLabel": "الاسم",
    "industryLabel": "الصناعة",
    "employeesLabel": "عدد الموظفين",
    "currentProductsLabel": "المنتجات الحالية",
    "none": "لا يوجد"
  },
  "drawer": {
    "title": "تفاصيل الفرصة",
    "notFound": "تعذر العثور على بيانات هذه الفرصة."
  },
  "you": "أنت"
}
