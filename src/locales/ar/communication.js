export default {
  "pages": {
    "view": "العرض",
    "create": "الإنشاء",
    "reports": "التقارير",
    "calendar": "التقويم",
    "automation": "الأتمتة",
    "customization": "التخصيص",
    "ai": "تهيئة الذكاء الاصطناعي",
    "settings": "الإعدادات"
  },
  "groups": {
    "work": "العمل",
    "insights": "المتابعة",
    "setup": "الإعداد"
  },
  "create": {
    "bindingHint": "يمكن ربط النشاط بعميل محتمل أو عميل أو صفقة من داخل النموذج."
  },
  "reports": {
    "kpis": {
      "total": {
        "call": "المكالمات في الفترة",
        "meeting": "الاجتماعات في الفترة"
      },
      "completed": "مكتملة",
      "completionRate": "نسبة الإنجاز",
      "overdue": "متأخرة",
      "unreadMessages": "رسائل غير مقروءة",
      "activeConversations": "محادثات نشطة في الفترة",
      "activeChannels": "قنوات بها محادثات",
      "groups": "مجموعات"
    },
    "charts": {
      "perDay": {
        "call": "المكالمات يوميًا حسب الحالة",
        "meeting": "الاجتماعات يوميًا حسب الحالة"
      },
      "byAssignee": "حسب الموظف المسؤول",
      "byPriority": "حسب الأولوية",
      "byOutcome": "حسب النتيجة",
      "conversationActivity": "نشاط المحادثات يوميًا حسب القناة",
      "unreadByChannel": "غير المقروء حسب القناة",
      "conversationsByChannel": "توزيع المحادثات على القنوات",
      "chatActivity": "نشاط الشات الداخلي يوميًا",
      "byConversationType": "فردية ومجموعات",
      "unreadByConversation": "أكثر المحادثات بها رسائل غير مقروءة"
    },
    "series": {
      "call": "مكالمات",
      "meeting": "اجتماعات",
      "unread": "غير مقروءة",
      "conversations": "محادثات"
    },
    "conversationTypes": {
      "group": "مجموعات",
      "direct": "فردية"
    },
    "noOutcomes": "لا توجد نتائج مسجلة في هذه الفترة",
    "noUnread": "لا توجد رسائل غير مقروءة"
  },
  "modules": {
    "conversations": {
      "title": "المحادثات",
      "description": "واتساب وماسنجر وجيميل في صندوق واحد",
      "menu": "قائمة المحادثات",
      "calendarNotice": "لا يوجد مصدر مواعيد للمحادثات بعد. سيظهر هنا أي شيء مجدول (مثل الرسائل المجدولة والمتابعات) عند توفره في الباك إند.",
      "calendarDescription": "المواعيد المرتبطة بالمحادثات.",
      "automationDescription": "قواعد تلقائية على المحادثات: التوزيع، الردود، الوسوم.",
      "settingsDescription": "إعدادات المحادثات والقنوات المتصلة.",
      "create": {
        "title": "محادثة جديدة",
        "description": "بدء محادثة مع عميل من أي قناة متصلة.",
        "items": {
          "channel": "اختيار القناة (واتساب، ماسنجر، جيميل)",
          "contact": "اختيار العميل المحتمل أو العميل",
          "template": "إرسال رسالة قالب معتمدة لواتساب",
          "assign": "تحديد الموظف المسؤول عن المحادثة"
        }
      },
      "reports": {
        "title": "تقارير المحادثات",
        "description": "أداء الرد والقنوات والموظفين."
      },
      "customization": {
        "description": "تخصيص صندوق المحادثات.",
        "items": {
          "quickReplies": "الردود السريعة",
          "labels": "وسوم المحادثات",
          "channelsOrder": "ترتيب القنوات وإظهارها",
          "threadColumns": "الحقول الظاهرة في قائمة المحادثات"
        }
      },
      "ai": {
        "pageDescription": "ما يمكن للذكاء الاصطناعي فعله داخل المحادثات.",
        "suggestReplies": {
          "label": "اقتراح ردود",
          "description": "يقترح ردًا يراجعه الموظف قبل الإرسال."
        },
        "summarizeThread": {
          "label": "تلخيص المحادثة",
          "description": "ملخص قصير لأي محادثة طويلة."
        },
        "detectIntent": {
          "label": "اكتشاف نية العميل",
          "description": "يحدد إن كان العميل يسأل أو يشتكي أو جاهز للشراء."
        },
        "autoTag": {
          "label": "وسم تلقائي",
          "description": "يضيف وسومًا للمحادثة حسب محتواها."
        },
        "autoReply": {
          "label": "رد تلقائي",
          "description": "يرد على الأسئلة المتكررة خارج أوقات العمل."
        }
      },
      "settingsItems": {
        "assignment": "توزيع المحادثات الجديدة على الموظفين",
        "businessHours": "أوقات العمل والرد خارجها",
        "sla": "الحد الأقصى لوقت الرد",
        "closing": "إغلاق المحادثات غير النشطة تلقائيًا"
      }
    },
    "calls": {
      "title": "المكالمات",
      "description": "مكالمات المبيعات وخدمة العملاء",
      "menu": "قائمة المكالمات",
      "calendarNotice": "لا يوجد مصدر مواعيد لهذا القسم بعد.",
      "calendarDescription": "كل المكالمات المجدولة على التقويم.",
      "automationDescription": "قواعد تلقائية للمكالمات: تذكير، متابعة، إنشاء مهام.",
      "settingsDescription": "إعدادات المكالمات والمستخدمين.",
      "create": {
        "title": "مكالمة جديدة",
        "description": "جدولة مكالمة مع عميل محتمل أو عميل.",
        "items": {
          "form": "نموذج جدولة المكالمة"
        }
      },
      "reports": {
        "title": "تقارير المكالمات",
        "description": "حجم المكالمات ونتائجها وأداء الفريق."
      },
      "customization": {
        "description": "تخصيص المكالمات لتناسب طريقة عمل فريقك.",
        "items": {
          "outcomes": "نتائج المكالمة",
          "reportFields": "حقول تقرير المكالمة",
          "tableColumns": "أعمدة جدول المكالمات",
          "priorities": "مستويات الأولوية"
        }
      },
      "ai": {
        "pageDescription": "ما يمكن للذكاء الاصطناعي فعله في المكالمات.",
        "prepareBrief": {
          "label": "تحضير ملخص قبل المكالمة",
          "description": "ملخص عن العميل وآخر تواصل قبل الاتصال."
        },
        "summarizeCall": {
          "label": "تلخيص المكالمة",
          "description": "يكتب مسودة تقرير المكالمة."
        },
        "suggestNextAction": {
          "label": "اقتراح الخطوة التالية",
          "description": "يقترح متابعة أو اجتماع أو تغيير حالة."
        },
        "scoreOutcome": {
          "label": "تقييم نتيجة المكالمة",
          "description": "يقدّر مدى اقتراب العميل من الشراء."
        }
      },
      "settingsItems": {
        "outcomes": "نتائج المكالمة المتاحة",
        "reminders": "توقيت التذكير الافتراضي",
        "requiredReport": "إلزام الموظف بتقرير بعد كل مكالمة",
        "recording": "تسجيل المكالمات (عند ربط مزود اتصال)"
      }
    },
    "meetings": {
      "title": "الاجتماعات",
      "description": "اجتماعات العملاء والاجتماعات الداخلية",
      "menu": "قائمة الاجتماعات",
      "calendarNotice": "لا يوجد مصدر مواعيد لهذا القسم بعد.",
      "calendarDescription": "كل الاجتماعات المجدولة على التقويم.",
      "automationDescription": "قواعد تلقائية للاجتماعات: تذكير، تقارير، مهام من القرارات.",
      "settingsDescription": "إعدادات الاجتماعات والمستخدمين.",
      "create": {
        "title": "اجتماع جديد",
        "description": "جدولة اجتماع مع عميل أو اجتماع داخلي للفريق.",
        "items": {
          "form": "نموذج جدولة الاجتماع"
        }
      },
      "reports": {
        "title": "تقارير الاجتماعات",
        "description": "عدد الاجتماعات ونتائجها وأداء الفريق."
      },
      "customization": {
        "description": "تخصيص الاجتماعات لتناسب فريقك.",
        "items": {
          "meetingTypes": "أنواع الاجتماعات (مع عميل / داخلي)",
          "reportTemplates": "قوالب تقارير الاجتماع",
          "agendaTemplates": "قوالب الأجندة",
          "tableColumns": "أعمدة جدول الاجتماعات"
        }
      },
      "ai": {
        "pageDescription": "ما يمكن للذكاء الاصطناعي فعله في الاجتماعات.",
        "prepareAgenda": {
          "label": "تحضير الأجندة",
          "description": "يقترح أجندة من سياق العميل أو الصفقة."
        },
        "summarizeMeeting": {
          "label": "تلخيص الاجتماع",
          "description": "يكتب مسودة المحضر أو تقرير ما بعد الاجتماع."
        },
        "extractActionItems": {
          "label": "استخراج المهام",
          "description": "يحول القرارات إلى مهام مقترحة."
        },
        "suggestNextAction": {
          "label": "اقتراح الخطوة التالية",
          "description": "يقترح متابعة مع العميل أو اجتماعًا جديدًا."
        }
      },
      "settingsItems": {
        "types": "أنواع الاجتماعات وخصوصية الداخلي منها",
        "reminders": "توقيت التذكير الافتراضي",
        "reports": "قالب تقرير ما بعد الاجتماع",
        "kpi": "استبعاد الاجتماعات الداخلية من مؤشرات المبيعات"
      }
    },
    "team-chat": {
      "title": "الشات الداخلي",
      "description": "تواصل الفريق والمجموعات",
      "menu": "قائمة الشات الداخلي",
      "calendarNotice": "لا يوجد مصدر مواعيد للشات الداخلي بعد. ستظهر هنا التذكيرات والرسائل المجدولة عند توفرها في الباك إند.",
      "calendarDescription": "المواعيد المرتبطة بالشات الداخلي.",
      "automationDescription": "قواعد تلقائية للشات: تنبيهات، رسائل مجدولة، مهام من الرسائل.",
      "settingsDescription": "إعدادات الشات الداخلي والمستخدمين.",
      "create": {
        "title": "محادثة أو مجموعة جديدة",
        "description": "بدء محادثة مع زميل أو إنشاء مجموعة للفريق.",
        "items": {
          "direct": "محادثة فردية مع زميل",
          "group": "مجموعة باسم وأعضاء",
          "linked": "مجموعة مرتبطة بصفقة أو طلب خدمة",
          "permissions": "صلاحيات الإضافة والإدارة"
        }
      },
      "reports": {
        "title": "تقارير الشات الداخلي",
        "description": "نشاط الفريق على الشات."
      },
      "customization": {
        "description": "تخصيص الشات الداخلي.",
        "items": {
          "channelTypes": "أنواع المجموعات",
          "reactions": "التفاعلات المتاحة",
          "pinnedLimits": "حدود الرسائل المثبتة",
          "notificationDefaults": "إعدادات الإشعارات الافتراضية"
        }
      },
      "ai": {
        "pageDescription": "ما يمكن للذكاء الاصطناعي فعله في الشات الداخلي.",
        "summarizeUnread": {
          "label": "تلخيص غير المقروء",
          "description": "ملخص لما فات الموظف في المجموعات."
        },
        "suggestReplies": {
          "label": "اقتراح ردود",
          "description": "يقترح ردًا سريعًا على زميل."
        },
        "createTasksFromMessages": {
          "label": "إنشاء مهام من الرسائل",
          "description": "يحول طلبًا في الشات إلى مهمة مقترحة."
        }
      },
      "settingsItems": {
        "retention": "مدة الاحتفاظ بالرسائل",
        "groups": "من يمكنه إنشاء مجموعات",
        "attachments": "أنواع وحجم المرفقات المسموحة",
        "notifications": "الإشعارات الافتراضية للمستخدمين الجدد"
      }
    }
  }
}
