export default {
  "description": "إدارة حملات CRM والإعلانات والنماذج المرتبطة.",
  "nameRequired": "اسم الحملة مطلوب",
  "saveSuccess": "تم حفظ الحملة",
  "saveError": "فشل حفظ الحملة",
  "newCampaign": "حملة جديدة",
  "nameLabel": "اسم الحملة",
  "descriptionLabel": "الوصف",
  "statusLabel": "الحالة",
  "statusActive": "نشطة",
  "statusInactive": "غير نشطة",
  "saveCampaign": "حفظ الحملة",
  "noCampaigns": "لا توجد حملات",
  "activeAds": "الإعلانات النشطة",
  "adsCount": "{{count}} إعلان",
  "adForms": "نماذج الإعلانات",
  "formsCount": "{{count}} نموذج",
  "platforms": { "meta": "إعلانات ميتا", "google": "إعلانات Google", "tiktok": "إعلانات TikTok", "snapchat": "إعلانات Snapchat" },
  "connection": { "connected": "متصل", "disconnected": "غير متصل", "expired": "منتهي", "needsAttention": "يحتاج إلى مراجعة" },
  "center": {
    "title": "مركز الحملات", "sidebarDescription": "المنصات والحملات والتحليلات والفوترة", "platforms": "المنصات", "platformNavigation": "التنقل بين منصات الحملات", "openNavigation": "فتح تنقل الحملات", "closeNavigation": "إغلاق تنقل الحملات", "integrationSettings": "إعدادات تكاملات الحملات", "account": "الحساب الإعلاني", "sync": "مزامنة",
    "nav": { "overview": "نظرة عامة", "create": "إنشاء حملة", "list": "الحملات", "analytics": "التحليلات", "billing": "الفوترة والمحفظة" }
  },
  "states": {
    "disconnected": { "title": "المنصة غير متصلة", "description": "اربط منصة الإعلانات من صفحة التكاملات قبل تحميل بيانات الحملات.", "action": "فتح التكاملات" },
    "permission": { "title": "صلاحية مطلوبة", "description": "لا تملك صلاحية الوصول إلى هذه الإمكانية في الحملات." },
    "package": { "title": "المنصة غير متاحة", "description": "منصة الإعلانات هذه غير مشمولة في الباقة الحالية." },
    "unavailable": { "title": "مزوّد المنصة غير مهيأ", "description": "مساحة عمل المنصة جاهزة، لكن API الخاص بها لم يتم ربطه بعد." },
    "notConfigured": { "title": "غير مهيأ", "description": "لا يوجد عقد API لهذا القسم حتى الآن، لذلك لا يتم عرض مؤشرات تجريبية." },
    "noAccount": { "title": "لا يوجد حساب إعلاني", "description": "اربط أو اختر حسابًا إعلانيًا قبل إنشاء الحملة." }
  },
  "overview": { "title": "نظرة عامة على المنصة", "description": "حالة الحساب وآخر نشاط للحملات.", "recentCampaigns": "أحدث الحملات" },
  "list": { "title": "الحملات", "description": "ابحث وصفِّ ورتّب وافتح الحملات العائدة من حساب المنصة المختار." },
  "metrics": { "totalCampaigns": "إجمالي الحملات", "activeCampaigns": "الحملات النشطة", "spend": "الإنفاق", "results": "النتائج", "notAvailable": "غير متاح" },
  "columns": { "campaign": "الحملة", "page": "الصفحة", "platform": "المنصة", "status": "الحالة", "objective": "الهدف", "budget": "الميزانية", "spend": "الإنفاق", "impressions": "مرات الظهور", "reach": "الوصول", "ctr": "معدل النقر (CTR)", "results": "النتائج", "startDate": "تاريخ البداية", "endDate": "تاريخ النهاية", "lastSync": "آخر مزامنة" },
  "create": {
    "title": "إنشاء حملة", "description": "أنشئ حملة باستخدام حساب المنصة المختار.", "name": "اسم الحملة", "page": "صفحة Facebook", "selectPage": "اختر الصفحة", "objective": "الهدف", "submit": "إنشاء الحملة", "required": "اسم الحملة والصفحة مطلوبان", "success": "تم إنشاء الحملة بنجاح", "error": "فشل إنشاء الحملة",
    "saveDraft": "حفظ كمسودة", "continue": "متابعة",
    "steps": { "campaign": "الحملة", "adSet": "المجموعة الإعلانية", "audience": "الجمهور", "creative": "الكرياتيف", "review": "المراجعة" },
    "review": {
      "intro": "راجع بيانات الحملة أدناه قبل إنشائها.",
      "note": "إعداد المجموعة الإعلانية والجمهور والكرياتيف غير متاح بعد عبر API المنصة، لذلك سيتم إنشاء الحملة بالبيانات أدناه فقط."
    }
  },
  "objectives": { "OUTCOME_LEADS": "العملاء المحتملون", "OUTCOME_TRAFFIC": "الزيارات" },
  "analytics": { "title": "تحليلات الحملات", "description": "مساحة أداء وإسناد CRM للحساب المختار." },
  "billing": { "title": "الفوترة والمحفظة", "description": "حسابات الفوترة والأرصدة والمعاملات والفواتير التي تدعمها المنصة." },
  "details": {
    "title": "الحملة {{id}}", "description": "موارد الحملة العائدة من المزوّد المتصل.",
    "adSets": "المجموعات الإعلانية", "noAdSets": "لم تُرجع المنصة مجموعات إعلانية لهذه الحملة.",
    "basics": "نظرة عامة على الحملة", "selectAdSet": "اختر مجموعة إعلانية أدناه لعرض أداءها وبيانات الإعلان.",
    "selectCampaign": "اختر حملة",
    "performance": "أداء الإعلان / الكرياتيف", "noInsights": "لا توجد بيانات أداء لهذه المجموعة الإعلانية حتى الآن.",
    "actionsBreakdown": "تفاصيل الإجراءات", "costPerAction": "التكلفة لكل إجراء", "videoPerformance": "أداء الفيديو",
    "reportingPeriod": "فترة التقرير",
    "stages": { "all": "كل التفاصيل", "campaign": "الحملة", "adset": "المجموعة الإعلانية", "ad": "الإعلان" }
  },
  "adSet": {
    "status": "الحالة", "effectiveStatus": "الحالة الفعلية", "optimizationGoal": "هدف التحسين",
    "billingEvent": "أساس الفوترة", "budgetRemaining": "الميزانية المتبقية", "targeting": "الاستهداف",
    "ageRange": "{{min}}–{{max}}", "countries": "الدول", "createdOn": "تاريخ الإنشاء"
  },
  "insights": {
    "frequency": "التكرار", "cpm": "CPM", "cpc": "CPC", "costPerUniqueClick": "تكلفة النقرة الفريدة",
    "clicks": "النقرات", "uniqueClicks": "النقرات الفريدة", "uniqueCtr": "معدل النقر الفريد",
    "inlineLinkClicks": "نقرات الرابط (ضمن المنشور)", "inlineLinkClickCtr": "معدل نقر الرابط (ضمن المنشور)", "postEngagement": "تفاعل مع المنشور"
  },
  "video": {
    "plays": "مرات تشغيل الفيديو", "avgWatchTime": "متوسط وقت المشاهدة (ثانية)", "watched25": "مشاهدة 25%", "watched50": "مشاهدة 50%",
    "watched75": "مشاهدة 75%", "watched95": "مشاهدة 95%", "watched100": "مشاهدة 100%", "watched30Sec": "مشاهدة 30 ثانية"
  },
  "actionTypes": {
    "linkClick": "نقرات الرابط", "postReaction": "تفاعلات المنشور", "landingPageView": "مشاهدات صفحة الهبوط",
    "omniLandingPageView": "مشاهدات صفحة الهبوط (Omni)", "postEngagement": "تفاعل مع المنشور", "like": "إعجابات",
    "postInteractionGross": "تفاعلات المنشور (إجمالي)", "pageEngagement": "تفاعل مع الصفحة",
    "postInteractionNet": "تفاعلات المنشور (صافي)", "comment": "تعليقات", "post": "منشورات", "photoView": "مشاهدات الصور",
    "videoView": "مشاهدات الفيديو", "lead": "عملاء محتملون", "onsiteWebLead": "عملاء محتملون (نموذج الموقع)",
    "offsiteCompleteRegistration": "تسجيلات مكتملة", "offsiteSearch": "عمليات بحث خارجية",
    "offsiteContentView": "مشاهدات محتوى خارجي", "offsiteSubmitApplication": "طلبات مُرسلة",
    "offsiteContactWebsite": "تواصل عبر الموقع", "conversionLead": "عملاء محتملون (تحويل)",
    "conversionLeadGrouped": "إجمالي العملاء المحتملين", "postSave": "حفظ المنشور", "postNetSave": "حفظ المنشور (صافي)",
    "postNetLike": "إعجابات (صافي)", "postNetComment": "تعليقات (صافي)", "postUnlike": "إلغاء إعجاب",
    "totalMessagingConnection": "محادثات بدأت", "messagingConversationStarted": "محادثات بدأت (٧ أيام)",
    "messagingConversationReplied": "محادثات تم الرد عليها", "messagingFirstReply": "أول رد",
    "messagingWelcomeMessageView": "مشاهدات رسالة الترحيب", "messagingDepth2": "رسائل (المستوى 2)",
    "messagingDepth3": "رسائل (المستوى 3)", "messagingDepth5": "رسائل (المستوى 5)"
  }
}
