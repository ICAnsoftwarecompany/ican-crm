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
    "steps": { "objective": "الهدف", "campaignSetup": "إعداد الحملة", "adSets": "مجموعات الإعلانات", "ads": "الإعلانات", "review": "المراجعة" },
    "objectiveStep": {
      "intro": "اختر النتيجة الأهم بالنسبة لهذه الحملة. لن تقدر تغيّرها بعد إنشاء الحملة.",
      "useWhen": {
        "OUTCOME_AWARENESS": "عايز أكبر عدد ناس يشوفوا الإعلان، مش عندك بيانات تحويل كفاية لسه",
        "OUTCOME_TRAFFIC": "عايز زيارات للموقع/الصفحة، أو لسه بتجمّع بيانات لـPixel",
        "OUTCOME_ENGAGEMENT": "عايز لايكات/تعليقات/مشاركات أو محادثات Messenger",
        "OUTCOME_LEADS": "عايز تجمع بيانات تواصل (اسم/إيميل/تليفون) مباشرة",
        "OUTCOME_APP_PROMOTION": "عايز تثبيتات تطبيق أو أحداث جوه التطبيق",
        "OUTCOME_SALES": "عايز عمليات شراء — محتاج Pixel/Conversions API شغال"
      },
      "lockedNote": "مش هتقدر تغيّر الهدف بعد ما الحملة تتنشر — لو غيرت رأيك بعدين، هتعمل نسخة (Duplicate) من الحملة بهدف جديد."
    },
    "campaignSetup": {
      "specialAdCategory": {
        "label": "فئة الإعلان الخاصة",
        "options": { "NONE": "بدون", "CREDIT": "ائتمان", "EMPLOYMENT": "وظائف", "HOUSING": "إسكان" }
      },
      "budgetLevel": {
        "label": "إزاي عايز تتحكم في الميزانية؟",
        "campaign": { "title": "ميزانية واحدة للحملة كلها", "description": "موصى به — فيسبوك بيوزّع الفلوس تلقائيًا على أفضل Ad Set أداءً." },
        "adSet": { "title": "ميزانية منفصلة لكل Ad Set", "description": "تحكم كامل — كل مجموعة إعلانية بتاخد مبلغ ثابت مهما كان أداؤها." },
        "adSetNote": "هتحدد ميزانية كل Ad Set في المرحلة الجاية."
      },
      "budget": {
        "type": { "label": "نوع الميزانية", "daily": "يومية", "lifetime": "دائمة" },
        "amount": "مبلغ الميزانية",
        "startType": { "label": "البداية", "now": "ابدأ الآن", "scheduled": "ابدأ في وقت محدد" },
        "startTime": "وقت البداية",
        "endType": { "label": "النهاية", "never": "بدون نهاية", "scheduled": "انتهِ في وقت محدد" },
        "endTime": "وقت النهاية",
        "bidStrategy": { "label": "استراتيجية العرض", "highest_volume": "أكبر عدد نتائج", "cost_cap": "حد أقصى للتكلفة", "bid_cap": "حد أقصى للعرض" },
        "bidAmount": "مبلغ العرض"
      }
    },
    "guide": {
      "title": "الدليل",
      "empty": "قف على أي حقل أو ركّز عليه عشان تشوف شرحه هنا.",
      "objective": {
        "default": { "title": "اختر النتيجة الأهم", "body": "الهدف اللي تختاره بيحدد أهداف التحسين والوجهات المتاحة في المراحل الجاية." },
        "OUTCOME_AWARENESS": { "title": "الوعي بالعلامة", "body": "اختار ده لو عايز أكبر عدد ناس يشوفوا الإعلان ومش عندك بيانات تحويل كفاية لسه." },
        "OUTCOME_TRAFFIC": { "title": "الزيارات", "body": "اختار ده لو عايز زيارات للموقع أو الصفحة، أو لسه بتجمّع بيانات لـPixel." },
        "OUTCOME_ENGAGEMENT": { "title": "التفاعل", "body": "اختار ده عشان لايكات وتعليقات ومشاركات أو محادثات Messenger." },
        "OUTCOME_LEADS": { "title": "الليدات", "body": "اختار ده لو عايز تجمع بيانات تواصل مباشرة — الأهم بالنسبة للحملات المرتبطة بالـCRM." },
        "OUTCOME_APP_PROMOTION": { "title": "ترويج التطبيق", "body": "اختار ده لو عايز تثبيتات تطبيق أو أحداث جوه التطبيق." },
        "OUTCOME_SALES": { "title": "المبيعات", "body": "اختار ده لو عايز عمليات شراء — لازم يكون عندك Pixel أو Conversions API شغال." }
      },
      "campaignSetup": {
        "default": { "title": "جهّز الأساسيات", "body": "سمّي حملتك وحدد مين المتحكم في الميزانية: الحملة كلها، ولا كل مجموعة إعلانية لوحدها." },
        "name": { "title": "اسم الحملة", "body": "بيُستخدم داخليًا للتعرف على الحملة — العميل مش بيشوفه." },
        "pageId": { "title": "صفحة فيسبوك", "body": "الصفحة اللي هيتنشر منها إعلاناتك." },
        "specialAdCategories": { "title": "فئة الإعلان الخاصة", "body": "إعلانات الائتمان والوظائف والإسكان ليها قيود استهداف مُلزمة قانونيًا في أماكن كتير — اختيار واحدة هنا بيقفل بعض حقول الاستهداف في مرحلة جاية." },
        "budgetLevel": { "title": "ميزانية الحملة مقابل ميزانية المجموعة", "body": "استخدم ميزانية الحملة لو عندك أكتر من جمهور وعايز الخوارزمية تختار الأنسب. استخدم ميزانية منفصلة لكل مجموعة لو عايز تضمن كل جمهور ياخد نفس الفرصة (مفيد وقت اختبار A/B)." },
        "budget": {
          "type": { "title": "نوع الميزانية", "body": "اليومية بتصرف لغاية المبلغ ده كل يوم. الدائمة بتصرف الإجمالي ده على مدار الجدولة كلها." },
          "amount": { "title": "مبلغ الميزانية", "body": "المبلغ اللي فيسبوك ممكن يصرفه، بعملة حسابك الإعلاني." },
          "schedule": { "title": "الجدولة", "body": "ابدأ الآن أو اختار وقت بداية مستقبلي، واختياريًا حدد تاريخ نهاية." },
          "bidStrategy": { "title": "استراتيجية العرض", "body": "أكبر عدد نتائج بيخلي فيسبوك يصرف كل ميزانيتك لأكبر عدد نتائج. حد أقصى للتكلفة وحد أقصى للعرض بيدوك تحكم أكتر في متوسط أو أقصى تكلفة للنتيجة." }
        }
      }
    },
    "draft": {
      "savedAt": "تم الحفظ {{time}}",
      "resumePrompt": "عندك مسودة محفوظة من {{time}}. عايز تكمل عليها؟",
      "resume": "استكمال المسودة",
      "startFresh": "ابدأ من جديد"
    },
    "review": {
      "intro": "راجع بيانات الحملة أدناه قبل إنشائها.",
      "note": "بيانات المجموعات الإعلانية والإعلانات ونماذج الليدات اللي جهزتها محفوظة في المسودة، لكنها غير متاحة بعد عبر API المنصة — هيتم إنشاء الحملة بالبيانات أدناه فقط."
    }
  },
  "objectives": {
    "OUTCOME_AWARENESS": "الوعي بالعلامة",
    "OUTCOME_TRAFFIC": "الزيارات",
    "OUTCOME_ENGAGEMENT": "التفاعل",
    "OUTCOME_LEADS": "العملاء المحتملون",
    "OUTCOME_APP_PROMOTION": "ترويج التطبيق",
    "OUTCOME_SALES": "المبيعات"
  },
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
