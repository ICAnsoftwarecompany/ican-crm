export default {
  "status": {
    "scheduled": "مجدول",
    "in_progress": "قيد التنفيذ",
    "completed": "مكتمل",
    "cancelled": "ملغي"
  },
  "priority": {
    "urgent": "عاجل",
    "high": "مرتفعة",
    "medium": "متوسطة",
    "low": "منخفضة"
  },
  "type": {
    "meeting": "اجتماع",
    "call": "مكالمة"
  },
  "duration": {
    "and": " و ",
    "day": "{{count}} يوم",
    "hour": "{{count}} ساعة",
    "minute": "{{count}} دقيقة",
    "second": "{{count}} ثانية",
    "lessThanMinute": "أقل من دقيقة",
    "remaining": "متبقي {{value}}",
    "overdueSince": "متأخر منذ {{hours}} ساعة",
    "inProgressSince": "قيد التنفيذ منذ {{value}}",
    "inProgressNow": "النشاط قيد التنفيذ الآن",
    "elapsedTime": "الوقت المنقضي: {{value}}"
  },
  "preMeetingReport": {
    "title": "تقرير قبل الاجتماع",
    "meetingNumberLabel": "رقم الاجتماع: {{id}}",
    "linkedMeetingLabel": "الاجتماع المرتبط: {{title}}",
    "untitled": "بدون عنوان",
    "chooseTemplateTitle": "اختر قالب التحضير",
    "chooseTemplateHint": "يمكنك عرض القالب أولا ثم تطبيقه على التقرير.",
    "categoryRealEstate": "قطاع العقارات",
    "categoryGeneral": "قالب عام",
    "previewTemplate": "عرض القالب",
    "applyTemplate": "تطبيق القالب",
    "previewPrefix": "معاينة: {{title}}",
    "previewFieldsHint": "الحقول التي سيحتوي عليها التقرير",
    "optionsLabel": "الخيارات: {{options}}",
    "applyThisTemplate": "تطبيق هذا القالب",
    "noTemplateAppliedTitle": "لم يتم تطبيق قالب بعد",
    "noTemplateAppliedHint": "اختر أحد القوالب بالأعلى ثم قم بعرضه أو تطبيقه.",
    "cancel": "إلغاء",
    "saveReport": "حفظ التقرير",
    "chooseTemplateFirst": "اختر قالب أولا.",
    "noMeetingIdError": "لا يوجد رقم اجتماع لإضافة التقرير.",
    "applyTemplateFirst": "اختر وطبّق قالب التقرير أولا.",
    "completeFieldError": "أكمل حقل: {{field}}",
    "savedToast": "تم حفظ تقرير قبل الاجتماع.",
    "options": {
      "apartment": "شقة",
      "villa": "فيلا",
      "townhouse": "تاون هاوس",
      "duplex": "دوبلكس",
      "chalet": "شاليه",
      "office": "مكتب",
      "officeAdmin": "مكتب إداري",
      "shop": "محل",
      "commercialShop": "محل تجاري",
      "land": "أرض",
      "other": "أخرى",
      "unspecified": "غير محدد",
      "residential": "سكن",
      "investment": "استثمار",
      "commercial": "تجاري",
      "administrative": "إداري",
      "resale": "إعادة بيع",
      "cash": "كاش",
      "installment": "تقسيط",
      "cashOrInstallment": "كاش أو تقسيط",
      "trySystem": "تجربة النظام",
      "sendQuote": "إرسال عرض سعر",
      "anotherMeeting": "اجتماع آخر",
      "startNegotiation": "بدء التفاوض",
      "closeDeal": "إغلاق الصفقة"
    },
    "templates": {
      "realEstateDiscovery": {
        "title": "استكشاف عميل عقاري",
        "description": "مناسب لأول اجتماع مع عميل مهتم بشراء أو استئجار عقار.",
        "fields": {
          "meetingObjective": { "label": "هدف الاجتماع", "placeholder": "ما الهدف الأساسي من الاجتماع؟" },
          "propertyType": { "label": "نوع العقار المطلوب" },
          "preferredLocation": { "label": "المنطقة المطلوبة", "placeholder": "مثال: التجمع الخامس" },
          "expectedBudget": { "label": "الميزانية المتوقعة", "placeholder": "مثال: من 5 إلى 7 مليون" },
          "purchasePurpose": { "label": "الغرض من العقار" },
          "paymentMethod": { "label": "طريقة الدفع المفضلة" },
          "decisionMaker": { "label": "صاحب القرار", "placeholder": "من صاحب قرار الشراء؟" },
          "questionsToAsk": { "label": "أسئلة يجب طرحها", "placeholder": "اكتب أهم الأسئلة المطلوب مناقشتها..." }
        }
      },
      "propertyRequirements": {
        "title": "تحديد متطلبات العقار",
        "description": "لجمع احتياجات العميل بالتفصيل قبل ترشيح الوحدات المناسبة.",
        "fields": {
          "propertyType": { "label": "نوع الوحدة" },
          "preferredProjects": { "label": "المشروعات أو المناطق المفضلة", "placeholder": "اذكر المشروعات أو المناطق التي يفضلها العميل." },
          "areaRequirement": { "label": "المساحة المطلوبة", "placeholder": "مثال: من 150 إلى 200 متر" },
          "bedrooms": { "label": "عدد الغرف" },
          "deliveryDate": { "label": "موعد الاستلام المناسب", "placeholder": "فوري / سنة / سنتين / غير محدد" },
          "budget": { "label": "الميزانية" },
          "downPayment": { "label": "المقدم المناسب" },
          "installmentPeriod": { "label": "مدة التقسيط المطلوبة" },
          "mustHaveFeatures": { "label": "المتطلبات الأساسية", "placeholder": "جاردن، دور معين، View، تشطيب، Parking..." }
        }
      },
      "realEstateNegotiation": {
        "title": "تفاوض وإغلاق صفقة عقارية",
        "description": "مناسب للاجتماعات المتقدمة بعد ترشيح الوحدة أو تقديم العرض.",
        "fields": {
          "meetingObjective": { "label": "هدف الاجتماع" },
          "selectedProperty": { "label": "الوحدة أو المشروع محل التفاوض" },
          "offeredPrice": { "label": "السعر الحالي" },
          "customerBudget": { "label": "ميزانية العميل" },
          "customerObjections": { "label": "اعتراضات العميل السابقة" },
          "negotiationPoints": { "label": "نقاط التفاوض", "placeholder": "السعر، المقدم، سنوات التقسيط، الاستلام..." },
          "decisionMaker": { "label": "صاحب القرار" },
          "expectedCloseDate": { "label": "موعد الإغلاق المتوقع" },
          "closingStrategy": { "label": "خطة إغلاق الصفقة" }
        }
      },
      "generalSales": {
        "title": "اجتماع مبيعات عام",
        "description": "قالب عام لأي اجتماع مبيعات أو متابعة مع العميل.",
        "fields": {
          "meetingObjective": { "label": "هدف الاجتماع" },
          "customerNeeds": { "label": "احتياجات العميل" },
          "customerProblems": { "label": "المشكلات الحالية" },
          "interestedProducts": { "label": "المنتجات أو الخدمات المهتم بها" },
          "expectedBudget": { "label": "الميزانية المتوقعة" },
          "decisionMaker": { "label": "صاحب القرار" },
          "objections": { "label": "الاعتراضات المتوقعة" },
          "questionsToAsk": { "label": "الأسئلة المطلوب طرحها" },
          "desiredNextStep": { "label": "الخطوة المستهدفة بعد الاجتماع" }
        }
      },
      "demoPresentation": {
        "title": "عرض أو Demo",
        "description": "مناسب لاجتماع عرض منتج أو خدمة أو تقديم Demo للعميل.",
        "fields": {
          "demoGoal": { "label": "هدف الـ Demo" },
          "currentSolution": { "label": "الحل أو النظام المستخدم حاليًا" },
          "currentProblems": { "label": "المشكلات الحالية" },
          "featuresToShow": { "label": "النقاط أو المميزات المطلوب عرضها" },
          "customerPriorities": { "label": "أولويات العميل" },
          "expectedQuestions": { "label": "الأسئلة المتوقعة" },
          "decisionMaker": { "label": "صاحب القرار" },
          "budget": { "label": "الميزانية المتوقعة" },
          "targetNextStep": { "label": "النتيجة المستهدفة" }
        }
      }
    }
  },
  "meetingDrawer": {
    "live": "مباشر",
    "loadingMeeting": "جاري تحميل بيانات الموعد...",
    "start": "بدء",
    "finish": "إنهاء",
    "elapsedSinceStart": "الوقت منذ البدء: {{value}}",
    "afterMeetingReportLabel": "تقرير بعد الاجتماع",
    "available": "{{count}} متوفر",
    "notAvailable": "غير موجود",
    "importantContentAlert": "تنبيه",
    "importantContentTitle": "يوجد محتوى مهم",
    "itemFallback": "العنصر",
    "openPage": "فتح الصفحة",
    "lockAction": "قفل",
    "unlockAction": "فتح",
    "back": "العودة",
    "previewReportTitle": "معاينة التقرير",
    "detailsTitlePrefix": "تفاصيل {{type}}",
    "scheduleNumberFallback": "موعد رقم {{id}}",
    "noParticipants": "لا يوجد مشاركون.",
    "noNotes": "لا توجد ملاحظات.",
    "noAttachments": "لا توجد مرفقات.",
    "noReportContent": "لا يوجد محتوى نصي للتقرير.",
    "reportFallback": "تقرير",
    "untitledReport": "تقرير بدون عنوان",
    "byPrefix": "بواسطة {{name}} - {{date}}",
    "viewReport": "عرض التقرير",
    "addPreReport": "إضافة تقرير قبل الاجتماع",
    "addAfterReport": "إضافة تقرير بعد الاجتماع",
    "noReportsYet": "لا توجد تقارير.",
    "attachmentFallback": "مرفق",
    "meetingFinished": "تم إنهاء الاجتماع بنجاح.",
    "meetingStarted": "تم بدء الموعد.",
    "meetingCancelled": "تم إلغاء الموعد.",
    "tabs": {
      "overview": "نظرة عامة",
      "timing": "التوقيت",
      "participants": "المشاركون",
      "notes": "الملاحظات",
      "attachments": "المرفقات",
      "reports": "التقارير",
      "call": "بيانات المكالمة"
    },
    "sections": {
      "basicData": "البيانات الأساسية",
      "meetingCreator": "منشئ الموعد",
      "linkedCustomer": "العميل/الكيان المرتبط",
      "timing": "التوقيت",
      "reminders": "التذكير",
      "callData": "بيانات المكالمة",
      "participantsTitle": "المشاركون ({{count}})",
      "reportsTitle": "التقارير ({{count}})",
      "notesTitle": "الملاحظات ({{count}})",
      "attachmentsTitle": "المرفقات ({{count}})"
    },
    "fields": {
      "mode": "الوضع",
      "scope": "النطاق",
      "meetingLink": "رابط الاجتماع",
      "location": "المكان",
      "longitude": "خط الطول",
      "latitude": "خط العرض",
      "source": "المصدر",
      "callProvider": "مزود المكالمة",
      "callerNumber": "رقم المتصل",
      "calleeNumber": "رقم العميل",
      "callStatus": "حالة المكالمة",
      "callDurationSeconds": "مدة المكالمة (ثانية)",
      "externalCallId": "معرف مكالمة خارجي",
      "recordingUrl": "رابط التسجيل",
      "link": "الرابط",
      "outcome": "النتيجة",
      "nextAction": "الإجراء التالي",
      "rating": "التقييم",
      "updatedAt": "تاريخ التحديث",
      "startAt": "بداية الموعد",
      "endAt": "نهاية الموعد",
      "actualStart": "البداية الفعلية",
      "actualEnd": "النهاية الفعلية",
      "elapsedTime": "الوقت المنقضي",
      "reminderType": "نوع التذكير",
      "reminderBefore": "قبل",
      "reminderUnit": "الوحدة",
      "reminderSentAt": "وقت إرسال التذكير",
      "noteFallback": "ملاحظة بدون نص"
    },
    "countdown": {
      "startsIn": "يبدأ بعد {{value}}",
      "overdue": "متأخر منذ {{value}}"
    }
  },
  "scheduleDialog": {
    "call": {
      "modalTitle": "إضافة موعد مكالمة",
      "description": "حدد بيانات المكالمة وسيتم حفظها كموعد مرتبط بالعميل أو الليد.",
      "titleLabel": "عنوان المكالمة",
      "titlePlaceholder": "مثال: متابعة العرض",
      "notesLabel": "وصف أو ملاحظات",
      "notesPlaceholder": "اكتب تفاصيل المكالمة أو سبب المتابعة...",
      "defaultTitle": "مكالمة مع",
      "successMessage": "تم إنشاء موعد المكالمة.",
      "actionTitle": "موعد مكالمة",
      "saveLabel": "حفظ موعد المكالمة",
      "updateLabel": "تحديث موعد المكالمة"
    },
    "meeting": {
      "modalTitle": "إضافة موعد اجتماع",
      "description": "حدد بيانات الاجتماع وسيتم حفظه كموعد مرتبط بالعميل أو الليد.",
      "titleLabel": "عنوان الاجتماع",
      "titlePlaceholder": "مثال: اجتماع متابعة العرض",
      "notesLabel": "وصف أو ملاحظات",
      "notesPlaceholder": "اكتب تفاصيل الاجتماع أو نقاط المتابعة...",
      "defaultTitle": "اجتماع مع",
      "successMessage": "تم إنشاء موعد الاجتماع.",
      "actionTitle": "موعد اجتماع",
      "saveLabel": "حفظ موعد الاجتماع",
      "updateLabel": "تحديث موعد الاجتماع"
    },
    "priorityOptions": {
      "low": "منخفضة",
      "medium": "متوسطة",
      "high": "عالية",
      "urgent": "عاجلة"
    },
    "reminderOptions": {
      "system": "النظام",
      "email": "البريد الإلكتروني"
    },
    "editPrefix": "تعديل {{action}}",
    "customerLabel": "العميل",
    "customerFallback": "العميل",
    "linkEntityTitle": "ربط الموعد",
    "entityTypeLabel": "نوع الكيان",
    "entityIdLabel": "رقم الكيان",
    "entityIdPlaceholder": "اكتب ID",
    "appointmentDataTitle": "بيانات الموعد",
    "priorityLabel": "الأولوية",
    "startLabel": "بداية الموعد",
    "endLabel": "نهاية الموعد",
    "callSettingsTitle": "إعدادات المكالمة",
    "meetingModeTitle": "طريقة الاجتماع",
    "callModeLabel": "طريقة المكالمة",
    "meetingModeLabel": "طريقة الاجتماع",
    "callProviderLabel": "مزود المكالمة",
    "callerNumberLabel": "رقم المتصل",
    "calleeNumberLabel": "رقم العميل",
    "optionalPlaceholder": "اختياري",
    "callLinkLabel": "رابط المكالمة",
    "meetingLinkLabel": "رابط الاجتماع",
    "callLocationLabel": "عنوان المكالمة الحضورية",
    "meetingLocationLabel": "عنوان الاجتماع",
    "addressPlaceholder": "اكتب العنوان",
    "participantsScopeTitle": "المشاركون والنطاق",
    "scopeLabel": "النطاق",
    "teamLabel": "الفريق",
    "chooseTeamPlaceholder": "اختر الفريق",
    "participatingUsersLabel": "المستخدمون المشاركون",
    "chooseUsersButton": "اختيار المستخدمين",
    "participantsCountLabel": "عدد المشاركين:",
    "noParticipantsSelected": "لم يتم اختيار مشاركين بعد.",
    "remindersTitle": "التذكير",
    "reminderUnitLabel": "الوحدة",
    "reminderCountLabel": "العدد",
    "minutesOption": "دقائق",
    "hoursOption": "ساعات",
    "daysOption": "أيام",
    "attachmentsTitle": "المرفقات",
    "filesTabLabel": "ملفات",
    "voiceNoteTabLabel": "ملاحظة صوتية",
    "recordingInProgress": "جارٍ التسجيل ({{seconds}}ث)",
    "recordVoiceNote": "تسجيل نص صوتي",
    "stopRecording": "إيقاف التسجيل",
    "recordButton": "تسجيل",
    "preMeetingSectionTitle": "قبل الاجتماع",
    "openPreMeetingAfterSave": "فتح تقرير قبل الاجتماع بعد الحفظ",
    "linkedToEntity": "سيتم ربط الموعد برقم {{id}}",
    "chooseParticipantsTitle": "اختيار المستخدمين المشاركين",
    "chooseParticipantsDesc": "ابحث وحدد المستخدمين المشاركين في هذا الموعد",
    "done": "تم",
    "searchUserPlaceholder": "بحث عن مستخدم...",
    "noMatchingUser": "لا يوجد مستخدم مطابق للبحث.",
    "micNotSupported": "المتصفح لا يدعم تسجيل الرسالة الصوتية هنا.",
    "micPermissionError": "تعذر الوصول إلى الميكروفون. تأكد من السماح بالإذن.",
    "noEntityLinkedError": "لا يوجد Lead أو Customer مرتبط بهذا الموعد.",
    "chooseStartEndError": "اختر بداية ونهاية {{action}}.",
    "chooseParticipantError": "اختر مشارك واحد على الأقل.",
    "chooseTeamError": "اختر الفريق المسؤول.",
    "updatedToast": "تم تحديث الموعد.",
    "preMeetingReportPendingError": "تم حفظ الاجتماع لكن لم يتم استلام رقم الاجتماع لفتح تقرير قبل الاجتماع."
  },
  "afterMeetingReport": {
    "categoryRealEstate": "عقارات",
    "categoryGeneral": "عام",
    "additionalNotesLabel": "ملاحظات إضافية",
    "drawerDescription": "اختر القالب المناسب لنوع الاجتماع ثم يمكنك معاينته قبل تسجيل النتيجة.",
    "closeConfirm": "لديك محتوى مكتوب في تقرير ما بعد الاجتماع. هل تريد إغلاق الدروَر؟",
    "changeTemplateConfirm": "تغيير القالب سيؤدي إلى مسح البيانات التي تم إدخالها. هل تريد المتابعة؟",
    "savedToast": "تم حفظ تقرير بعد الاجتماع.",
    "elapsedDurationLabel": "الوقت المنقضي: {{value}}",
    "chooseResultTemplateTitle": "اختر قالب تسجيل النتيجة",
    "templateHint": "القالب يحول إجاباتك إلى تقرير واضح ويتم حفظه في ملاحظات التقرير.",
    "documentFormatTitle": "تنسيق التقرير (نمط مستند)",
    "documentFormatHint": "كل عنوان بجواره زر تعديل، وبعد كتابة النص الجديد اضغط حفظ.",
    "mainHeaderLabel": "الهيدر الرئيسي",
    "mainHeaderPlaceholder": "مثال: تقرير بعد الاجتماع",
    "templateTitleLabel": "عنوان القالب",
    "templateTitlePlaceholder": "اكتب عنوان القالب",
    "headerSubtitleLabel": "وصف/مقدمة الهيدر",
    "headerSubtitlePlaceholder": "اكتب مقدمة التقرير",
    "editFieldTitlesSummary": "تعديل عناوين الحقول",
    "fieldTitlePlaceholder": "عنوان الحقل",
    "templateLine": "القالب: {{value}}",
    "meetingLine": "الاجتماع: {{value}}",
    "usedTemplateLabel": "القالب المستخدم: {{value}}",
    "fieldsCountSuffix": "{{count}} حقول",
    "chooseOption": "اختر",
    "options": {
      "interestLevel": {
        "veryHigh": "مرتفع جدا",
        "high": "مرتفع",
        "medium": "متوسط",
        "low": "منخفض",
        "notInterested": "غير مهتم"
      }
    },
    "templates": {
      "realEstateDiscoveryResult": {
        "title": "نتيجة اجتماع استكشاف عميل عقاري",
        "description": "مناسب لتوثيق أول اجتماع مع عميل عقاري بعد معرفة احتياجاته.",
        "fields": {
          "meetingSummary": { "label": "ملخص الاجتماع" },
          "confirmedPropertyType": {
            "label": "نوع العقار المؤكد",
            "options": { "0": "شقة", "1": "فيلا", "2": "تاون هاوس", "3": "دوبلكس", "4": "شاليه", "5": "مكتب إداري", "6": "محل تجاري", "7": "أرض", "8": "غير محدد" }
          },
          "confirmedLocation": { "label": "المناطق أو المشروعات المناسبة" },
          "confirmedBudget": { "label": "الميزانية المؤكدة" },
          "paymentPreference": {
            "label": "طريقة الدفع المناسبة",
            "options": { "0": "كاش", "1": "تقسيط", "2": "كاش أو تقسيط", "3": "غير محدد" }
          },
          "customerInterestLevel": { "label": "مستوى اهتمام العميل" },
          "customerObjections": { "label": "اعتراضات العميل" },
          "decisionMaker": { "label": "صاحب القرار" },
          "informationNeeded": { "label": "معلومات أو تفاصيل طلبها العميل" },
          "nextStep": { "label": "الخطوة التالية المتفق عليها" }
        }
      },
      "propertyPresentationResult": {
        "title": "نتيجة عرض الوحدات العقارية",
        "description": "مناسب بعد عرض مشروع أو مجموعة وحدات على العميل.",
        "fields": {
          "meetingSummary": { "label": "ملخص الاجتماع" },
          "propertiesPresented": { "label": "الوحدات أو المشروعات التي تم عرضها" },
          "preferredProperty": { "label": "الوحدة أو المشروع المفضل لدى العميل" },
          "customerFeedback": { "label": "رأي العميل في الوحدات المعروضة" },
          "preferredFeatures": { "label": "المميزات التي أعجبت العميل" },
          "rejectedFeatures": { "label": "النقاط التي لم تناسب العميل" },
          "priceFeedback": { "label": "رأي العميل في السعر" },
          "paymentFeedback": { "label": "رأي العميل في نظام الدفع" },
          "customerObjections": { "label": "الاعتراضات الرئيسية" },
          "followUpRequirement": { "label": "المطلوب قبل المتابعة القادمة" },
          "nextStep": {
            "label": "الخطوة التالية",
            "options": { "0": "إرسال وحدات إضافية", "1": "إرسال تفاصيل الأسعار", "2": "ترتيب معاينة", "3": "التفاوض على السعر", "4": "حجز مبدئي", "5": "اجتماع متابعة", "6": "لا توجد متابعة حاليا" }
          }
        }
      },
      "realEstateNegotiationResult": {
        "title": "نتيجة تفاوض صفقة عقارية",
        "description": "مناسب بعد اجتماع تفاوض أو محاولة إغلاق صفقة عقارية.",
        "fields": {
          "meetingSummary": { "label": "ملخص الاجتماع" },
          "property": { "label": "الوحدة أو المشروع محل التفاوض" },
          "initialPrice": { "label": "السعر قبل التفاوض" },
          "negotiatedPrice": { "label": "السعر بعد التفاوض" },
          "agreedDownPayment": { "label": "المقدم المتفق عليه" },
          "agreedInstallmentPeriod": { "label": "مدة التقسيط المتفق عليها" },
          "customerObjections": { "label": "اعتراضات العميل" },
          "concessionsOffered": { "label": "التسهيلات أو التنازلات التي تم تقديمها" },
          "dealStatus": {
            "label": "حالة الصفقة",
            "options": { "0": "تم الاتفاق", "1": "موافقة مبدئية", "2": "يحتاج موافقة شريك", "3": "يحتاج موافقة الإدارة", "4": "يحتاج وقت للتفكير", "5": "التفاوض مستمر", "6": "الصفقة مرفوضة", "7": "تم إغلاق الصفقة" }
          },
          "expectedCloseDate": { "label": "موعد الإغلاق المتوقع" },
          "nextStep": { "label": "الخطوة التالية" }
        }
      },
      "generalSalesResult": {
        "title": "نتيجة اجتماع مبيعات عام",
        "description": "قالب عام لتوثيق نتائج اجتماعات المبيعات والمتابعة.",
        "fields": {
          "meetingSummary": { "label": "ملخص الاجتماع" },
          "customerNeeds": { "label": "الاحتياجات التي أكدها العميل" },
          "customerFeedback": { "label": "رأي العميل" },
          "interestedProducts": { "label": "المنتجات أو الخدمات المهتم بها" },
          "customerObjections": { "label": "اعتراضات العميل" },
          "budgetDiscussed": { "label": "الميزانية التي تمت مناقشتها" },
          "decisionMaker": { "label": "صاحب القرار" },
          "decisionTimeline": { "label": "موعد اتخاذ القرار المتوقع" },
          "dealProbability": {
            "label": "احتمالية إتمام الصفقة",
            "options": { "0": "عالية جدا", "1": "عالية", "2": "متوسطة", "3": "منخفضة", "4": "غير متوقعة" }
          },
          "nextStep": {
            "label": "الخطوة التالية",
            "options": { "0": "مكالمة متابعة", "1": "اجتماع متابعة", "2": "إرسال عرض سعر", "3": "إرسال معلومات", "4": "إرسال Proposal", "5": "تجربة / Demo", "6": "بدء التفاوض", "7": "إغلاق الصفقة", "8": "لا توجد متابعة" }
          },
          "followUpDate": { "label": "موعد المتابعة" }
        }
      },
      "demoPresentationResult": {
        "title": "نتيجة العرض أو الـ Demo",
        "description": "مناسب بعد عرض منتج أو خدمة أو Demo للعميل.",
        "fields": {
          "meetingSummary": { "label": "ملخص الاجتماع" },
          "featuresPresented": { "label": "المميزات التي تم عرضها" },
          "customerLiked": { "label": "المميزات التي أعجبت العميل" },
          "customerConcerns": { "label": "المخاوف أو الاعتراضات" },
          "questionsAsked": { "label": "الأسئلة التي طرحها العميل" },
          "missingRequirements": { "label": "المتطلبات غير المتوفرة أو المطلوب إضافتها" },
          "customerInterestLevel": { "label": "مستوى اهتمام العميل" },
          "proposalRequested": {
            "label": "هل طلب العميل عرض سعر؟",
            "options": { "0": "نعم", "1": "لا", "2": "سيتم التحديد لاحقا" }
          },
          "trialRequested": {
            "label": "هل طلب العميل تجربة أو Trial؟",
            "options": { "0": "نعم", "1": "لا", "2": "غير متاح" }
          },
          "nextStep": {
            "label": "الخطوة التالية",
            "options": { "0": "إرسال عرض سعر", "1": "إرسال Proposal", "2": "إرسال معلومات إضافية", "3": "Trial", "4": "اجتماع تقني", "5": "اجتماع تفاوض", "6": "متابعة لاحقة", "7": "إغلاق الصفقة", "8": "لا يوجد" }
          },
          "followUpDate": { "label": "موعد المتابعة" }
        }
      }
    }
  },
  "table": {
    "type": "النوع",
    "relatedLeadCustomer": "Lead / Customer",
    "customerEmail": "البريد",
    "customerCompany": "الشركة",
    "customerAgent": "الوكيل",
    "status": "الحالة",
    "customerLeadStatus": "حالة العميل",
    "title": "النشاط",
    "assigned": "المسؤول",
    "startAt": "البداية",
    "endAt": "النهاية / المدة",
    "report": "التقرير",
    "actions": "الإجراءات",
    "openCustomerTitle": "فتح العميل",
    "elapsedTimePrefix": "الوقت المنقضي {{value}}",
    "reportPresent": "موجود",
    "reportMissing": "ناقص",
    "sinceLabel": "منذ {{value}}",
    "remainingLabel": "متبقي {{value}}",
    "overdueLabel": "متأخر {{value}}",
    "emptyMessage": "لا توجد مكالمات أو اجتماعات مطابقة."
  },
  "report": {
    "noReportSaved": "لا يوجد تقرير محفوظ لهذا النشاط حتى الآن."
  },
  "page": {
    "startedCall": "تم بدء المكالمة.",
    "startedMeeting": "تم بدء الاجتماع.",
    "startFailed": "تعذر بدء النشاط",
    "cancelConfirm": "هل تريد إلغاء هذا النشاط؟",
    "cancelledToast": "تم إلغاء النشاط.",
    "cancelFailed": "تعذر إلغاء النشاط",
    "deleteConfirm": "هل تريد حذف هذا النشاط نهائيا؟",
    "deletedToast": "تم حذف النشاط.",
    "deleteFailed": "تعذر حذف النشاط",
    "followUpTitlePrefix": "متابعة - {{title}}",
    "finishMeetingFailed": "تعذر إنهاء الاجتماع",
    "callLabel": "المكالمة",
    "meetingLabel": "الاجتماع",
    "openDetails": "فتح تفاصيل {{label}}",
    "pageActionsSection": "إجراءات الصفحة",
    "addNewMeeting": "إضافة اجتماع جديد",
    "meetingActionsSection": "إجراءات الاجتماعات",
    "startLabel": "بدء {{label}}",
    "cancelLabel": "إلغاء {{label}}",
    "finishLabel": "إنهاء {{label}}",
    "loadingActivities": "جاري تحميل الأنشطة...",
    "noMatchingResultsTitle": "لا توجد نتائج مطابقة",
    "noActivitiesYetTitle": "لا توجد مكالمات أو اجتماعات بعد",
    "changeFiltersDesc": "غير الفلاتر أو امسحها لعرض أنشطة أخرى.",
    "createFirstActivityDesc": "أنشئ أول نشاط لإدارة متابعة العملاء من مكان واحد."
  },
  "reportDialog": {
    "title": "إنهاء النشاط وإضافة تقرير",
    "description": "سجل نتيجة المكالمة أو الاجتماع وحدد الإجراء التالي بوضوح.",
    "followUpDescription": "متابعة ناتجة عن {{title}}",
    "savedToast": "تم حفظ التقرير وإنهاء النشاط.",
    "saveFailed": "تعذر إنهاء النشاط وحفظ التقرير",
    "saveAndFinish": "حفظ وإنهاء",
    "noRating": "بدون تقييم",
    "summaryLabel": "ملخص التقرير",
    "summaryPlaceholder": "اكتب ما حدث ونتيجة التواصل..."
  },
  "nextActionFields": {
    "dateLabel": "موعد الإجراء التالي"
  },
  "nextActions": {
    "none": "بدون إجراء",
    "call_again": "مكالمة متابعة",
    "schedule_meeting": "اجتماع متابعة",
    "create_task": "إنشاء مهمة",
    "send_proposal": "إرسال Proposal",
    "send_email": "إرسال بريد"
  },
  "outcomes": {
    "call": {
      "connected": "تم التواصل",
      "no_answer": "لا يوجد رد",
      "interested": "مهتم",
      "not_interested": "غير مهتم",
      "wrong_number": "رقم غير صحيح"
    },
    "meeting": {
      "completed": "تم الاجتماع",
      "proposal_requested": "طلب عرض سعر",
      "deal_possible": "فرصة بيع",
      "postponed": "تم التأجيل",
      "no_show": "لم يحضر"
    }
  },
  "form": {
    "typeLabel": "نوع النشاط",
    "titleLabel": "العنوان",
    "titlePlaceholder": "عنوان النشاط",
    "startLabel": "بداية النشاط",
    "endLabel": "نهاية النشاط",
    "descriptionLabel": "الوصف",
    "descriptionPlaceholder": "اكتب أي ملاحظات أو هدف النشاط...",
    "relatedTypeLabel": "نوع الربط",
    "relatedIdLabel": "رقم العميل / الليد",
    "relatedIdPlaceholder": "مثال: 53",
    "assignedUserLabel": "المستخدم المسؤول",
    "assignedUserPlaceholder": "ID المستخدم",
    "teamPlaceholder": "ID الفريق",
    "phoneLabel": "رقم الهاتف",
    "phonePlaceholder": "رقم العميل أو رقم الاتصال",
    "meetingLocationLabel": "مكان الاجتماع",
    "reminderBeforeLabel": "التذكير قبل",
    "reminderUnitLabel": "وحدة التذكير",
    "allStatuses": "كل الحالات",
    "allPriorities": "كل الأولويات",
    "userLabel": "المستخدم"
  },
  "lifecycleActions": {
    "view": "عرض",
    "followUp": "متابعة"
  },
  "drawer": {
    "detailsTitle": "تفاصيل النشاط",
    "tabs": {
      "overview": "البيانات",
      "preparation": "التحضير",
      "files": "الملفات",
      "history": "السجل"
    },
    "durationLabel": "المدة",
    "endLabel": "النهاية",
    "meetingOrCallModeLabel": "طريقة الاجتماع / المكالمة",
    "customerBeforeContactTitle": "بيانات العميل قبل التواصل",
    "preparationNotesTitle": "ملاحظات التحضير",
    "preparationHint": "يتم تجميع هذه البيانات من علاقة النشاط بالـ Lead/Customer. يمكن توسيع هذا التاب لاحقا لعرض آخر مهمة، آخر proposal، وآخر محادثة عند توفرها من الـ API.",
    "noFilesAttached": "لا توجد ملفات مرفقة.",
    "noDetailedHistory": "لا يوجد سجل تاريخي مفصل من الـ API لهذا النشاط.",
    "eventFallback": "حدث",
    "noNotesYet": "لا توجد ملاحظات على هذا النشاط.",
    "noParticipantsRegistered": "لا يوجد مشاركون مسجلون.",
    "invitedStatus": "مدعو"
  },
  "participantStatus": {
    "accepted": "موافق",
    "declined": "رفض",
    "attended": "حضر"
  },
  "reportFields": {
    "callDurationLabel": "مدة المكالمة بالدقائق",
    "callDurationPlaceholder": "مثال: 15",
    "attendeesCountLabel": "عدد الحضور",
    "attendeesCountPlaceholder": "مثال: 3"
  },
  "validation": {
    "titleRequired": "العنوان مطلوب",
    "taskableIdRequired": "رقم العميل أو الليد مطلوب",
    "startAtRequired": "وقت البداية مطلوب",
    "meetingLinkRequired": "رابط الاجتماع مطلوب للاجتماع الأونلاين",
    "locationRequired": "مكان الاجتماع مطلوب للاجتماع الحضوري",
    "endAfterStart": "النهاية يجب أن تكون بعد البداية",
    "outcomeRequired": "النتيجة مطلوبة",
    "summaryRequired": "ملخص التقرير مطلوب",
    "nextActionRequired": "اختر الإجراء التالي",
    "nextActionAtRequired": "وقت الإجراء التالي مطلوب"
  },
  "filters": {
    "searchPlaceholder": "بحث في العنوان، العميل، الشركة...",
    "clear": "مسح",
    "fromDate": "من تاريخ",
    "toDate": "إلى تاريخ"
  },
  "calendar": {
    "noActivities": "لا توجد أنشطة في التقويم.",
    "noDate": "بدون تاريخ"
  },
  "emptyState": {
    "defaultTitle": "لا توجد أنشطة",
    "defaultDescription": "أنشئ أول مكالمة أو اجتماع لبدء متابعة العملاء.",
    "createActivity": "إنشاء نشاط",
    "clearFilters": "مسح الفلاتر"
  },
  "header": {
    "description": "إدارة كل المكالمات والاجتماعات لكل العملاء المحتملين من مكان واحد.",
    "newActivity": "نشاط جديد"
  },
  "formDialog": {
    "updatedToast": "تم تعديل النشاط.",
    "createdToast": "تم إنشاء النشاط.",
    "saveFailed": "تعذر حفظ النشاط",
    "newActivityTitle": "إنشاء نشاط جديد",
    "description": "مكالمة أو اجتماع مرتبط بعميل أو Lead في مركز العملاء المحتملين.",
    "saveActivity": "حفظ النشاط"
  },
  "typeMeta": {
    "all": "الكل",
    "callPlural": "المكالمات",
    "meetingPlural": "الاجتماعات",
    "allShort": "All",
    "callShort": "Call",
    "meetingShort": "Meeting"
  },
  "derivedStates": {
    "today": "اليوم",
    "upcoming": "قادم",
    "overdue": "متأخر"
  },
  "untitledCall": "مكالمة بدون عنوان",
  "untitledMeeting": "اجتماع بدون عنوان",
  "viewModeTabs": {
    "table": "جدول",
    "calendar": "تقويم"
  }
}
