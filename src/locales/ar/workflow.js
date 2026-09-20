export default {
  "localOnlyNotice": "لا يوجد محرك أتمتة متصل بالباك إند بعد — الحفظ/التفعيل يخزن هذا الـ workflow محليا على هذا الجهاز فقط.",
  "metrics": {
    "notAvailable": "غير متتبع بعد"
  },
  "status": {
    "draft": "مسودة",
    "active": "نشط",
    "paused": "متوقف مؤقتا",
    "archived": "مؤرشف"
  },
  "operators": {
    "equals": "يساوي",
    "notEquals": "لا يساوي",
    "contains": "يحتوي على",
    "notContains": "لا يحتوي على",
    "greaterThan": "أكبر من",
    "lessThan": "أقل من",
    "isEmpty": "فارغ",
    "isNotEmpty": "غير فارغ",
    "in": "ضمن",
    "notIn": "ليس ضمن"
  },
  "modules": {
    "leads": "العملاء المحتملون",
    "opportunities": "الفرص البيعية",
    "outreachCampaigns": "حملات التواصل",
    "tasks": "المهام",
    "notifications": "الإشعارات"
  },
  "dataSources": {
    "users": "المستخدمون",
    "teams": "الفرق",
    "leadStatuses": "حالات العملاء المحتملين",
    "tags": "الوسوم",
    "opportunityStatuses": "حالات الفرص البيعية",
    "outreachCampaigns": "حملات التواصل",
    "whatsappTemplates": "قوالب واتساب",
    "outreachChannels": "قنوات التواصل",
    "whatsappPhoneNumbers": "أرقام واتساب",
    "messengerPages": "صفحات ماسنجر",
    "gmailMailboxes": "صناديق بريد Gmail"
  },
  "fields": {
    "selectPlaceholder": "اختر...",
    "insertVariable": "إدراج متغير",
    "previewLabel": "معاينة",
    "noOptions": "لا توجد خيارات متاحة",
    "unsupportedType": "نوع حقل غير مدعوم: {{type}}"
  },
  "builder": {
    "namePlaceholder": "اسم الـ Workflow",
    "selectModule": "اختر Module",
    "saveDraft": "حفظ كمسودة",
    "draftSaved": "تم حفظ المسودة محليا",
    "activate": "تفعيل",
    "activated": "تم تفعيل الـ Workflow (حالة محلية فقط)",
    "pause": "إيقاف مؤقت",
    "paused": "تم إيقاف الـ Workflow مؤقتا",
    "duplicate": "تكرار",
    "duplicated": "تم تكرار الـ Workflow",
    "saveBeforeDuplicate": "احفظ الـ Workflow أولا قبل تكراره",
    "archive": "أرشفة",
    "archived": "تمت أرشفة الـ Workflow",
    "nameRequiredToast": "أدخل اسما للـ Workflow قبل الحفظ",
    "fixErrorsBeforeActivate": "صحح الأخطاء الظاهرة قبل التفعيل",
    "validationErrorsTitle": "لا يمكن تفعيل هذا الـ Workflow بعد",
    "confirmArchiveTitle": "هل تريد أرشفة هذا الـ Workflow؟",
    "confirmArchiveMessage": "الـ Workflows المؤرشفة تبقى محفوظة لكن لا تظهر كقابلة للتعديل من القائمة. مازال بإمكانك تكرارها.",
    "confirmRemoveBranchTitle": "هل تريد حذف هذه الخطوة؟",
    "confirmRemoveBranchMessage": "سيتم حذف كل الفروع التابعة لهذه الخطوة معها — أي إعدادات بداخلها ستفقد.",
    "nodeLibrary": "مكتبة العناصر",
    "properties": "الإعدادات",
    "libraryHint": "أضف خطوة أو اختر Trigger لعرض الخيارات هنا.",
    "selectNodeHint": "اختر عنصرا لإعداده.",
    "searchNodes": "بحث...",
    "logicSection": "المنطق",
    "recommendedActions": "مقترحة",
    "thisModuleActions": "هذا الـ Module",
    "thisModuleTriggers": "هذا الـ Module",
    "backendNotConnected": "غير متصل بباك إند حقيقي بعد",
    "backendNotConnectedShort": "بدون باك إند",
    "triggerLabel": "Trigger",
    "actionLabel": "Action",
    "conditionLabel": "شرط",
    "waitLabel": "انتظار",
    "waitForEventLabel": "انتظار حدث",
    "endLabel": "نهاية",
    "endDescription": "ينهي هذا الفرع من الـ Workflow. لا يوجد أي إجراء بعده.",
    "pickTriggerHint": "اضغط على الـ Trigger بالأعلى لاختيار متى يبدأ هذا الـ Workflow.",
    "selectTrigger": "اختر Trigger",
    "selectAction": "اختر إجراء",
    "createAutomation": "إنشاء أتمتة",
    "addStep": "إضافة خطوة",
    "addRule": "إضافة قاعدة",
    "quickAddCondition": "إضافة شرط جاهز",
    "noConditionsYet": "لا توجد شروط معدة بعد",
    "noConfigNeeded": "هذا الإجراء لا يحتاج إعدادات.",
    "ruleLabel": "قاعدة {{index}}",
    "fieldLabel": "الحقل",
    "fieldPlaceholder": "مثال: lead.source",
    "operatorLabel": "المعامل",
    "valueLabel": "القيمة",
    "groupOperatorLabel": "دمج القواعد باستخدام",
    "groupOperator": {
      "and": "و (AND)",
      "or": "أو (OR)"
    },
    "branch": {
      "true": "نعم",
      "false": "لا",
      "resolved": "تم الرد",
      "timeout": "انتهت المهلة"
    },
    "waitModeLabel": "نوع الانتظار",
    "waitModeDuration": "لمدة زمنية",
    "waitModeUntil": "حتى تاريخ/وقت محدد",
    "unitLabel": "الوحدة",
    "untilLabel": "حتى",
    "units": {
      "minutes": "دقائق",
      "hours": "ساعات",
      "days": "أيام"
    },
    "waitNotConfigured": "غير معد بعد",
    "waitDurationSummary": "انتظار {{value}} {{unit}}",
    "waitUntilSummary": "انتظار حتى {{date}}",
    "eventLabel": "الحدث المنتظر",
    "timeoutValueLabel": "المهلة القصوى",
    "waitForEventNotConfigured": "غير معد بعد",
    "waitForEventNoTimeout": "انتظار: {{event}}",
    "waitForEventWithTimeout": "انتظار: {{event}} (المهلة {{value}} {{unit}})",
    "waitForEventNoSchedulerNote": "لا يوجد Scheduler في الباك إند حاليا لتنفيذ هذا الانتظار فعليا — راجع WORKFLOW_ENGINE_BACKEND_REQUIREMENTS.md."
  },
  "validation": {
    "triggerRequired": "اختر Trigger قبل التفعيل",
    "invalidTriggerReference": "هذا الـ Trigger لم يعد مسجلا",
    "invalidActionReference": "هذا الإجراء لم يعد مسجلا",
    "fieldRequired": "الحقل \"{{field}}\" مطلوب",
    "conditionRulesRequired": "أضف قاعدة شرط واحدة على الأقل",
    "branchesRequired": "يجب أن يؤدي كل فرع إلى خطوة (حتى لو كانت نهاية)",
    "waitDurationRequired": "حدد مدة الانتظار",
    "waitUntilRequired": "حدد تاريخ ووقت الانتظار",
    "waitForEventRequired": "اختر الحدث المنتظر",
    "waitForEventNoScheduler": "لا يوجد Scheduler في الباك إند لتنفيذ انتظار هذا الحدث فعليا بعد",
    "emptyWorkflow": "لا توجد خطوات بعد الـ Trigger في هذا الـ Workflow",
    "backendNotSupported": "الباك إند الخاص بهذه الخطوة غير متصل بعد — راجع التوثيق"
  },
  "variables": {
    "leadName": "اسم العميل المحتمل",
    "leadPhone": "هاتف العميل المحتمل",
    "leadEmail": "بريد العميل المحتمل",
    "leadSource": "مصدر العميل المحتمل",
    "leadStatus": "حالة العميل المحتمل",
    "opportunityName": "اسم الفرصة",
    "opportunityValue": "قيمة الفرصة",
    "opportunityStatus": "حالة الفرصة",
    "campaignName": "اسم الحملة",
    "campaignChannel": "قناة الحملة",
    "customerName": "اسم العميل",
    "customerPhone": "هاتف العميل",
    "customerEmail": "بريد العميل",
    "taskTitle": "عنوان المهمة",
    "taskStatus": "حالة المهمة",
    "taskPriority": "أولوية المهمة"
  },
  "leads": {
    "triggers": {
      "created": {
        "label": "إنشاء عميل محتمل",
        "description": "يعمل عند إنشاء عميل محتمل جديد."
      },
      "updated": {
        "label": "تعديل عميل محتمل"
      },
      "statusChanged": {
        "label": "تغيّر حالة العميل المحتمل",
        "description": "يعمل عند انتقال العميل المحتمل من حالة إلى أخرى."
      },
      "assigned": {
        "label": "إسناد عميل محتمل"
      }
    },
    "conditions": {
      "status": "حالة العميل المحتمل",
      "source": "مصدر العميل المحتمل",
      "assignedUser": "المستخدم المسؤول",
      "tags": "الوسوم"
    },
    "actions": {
      "changeStatus": {
        "label": "تغيير حالة العميل المحتمل"
      },
      "assignUser": {
        "label": "إسناد مستخدم"
      },
      "addTag": {
        "label": "إضافة وسم"
      },
      "removeTag": {
        "label": "حذف وسم"
      },
      "createOpportunity": {
        "label": "إنشاء فرصة بيعية"
      }
    },
    "fields": {
      "fromStatus": "من حالة",
      "toStatus": "إلى حالة",
      "newStatus": "الحالة الجديدة",
      "assignedUser": "المستخدم المسؤول",
      "tag": "الوسم"
    }
  },
  "opportunities": {
    "triggers": {
      "created": {
        "label": "إنشاء فرصة بيعية"
      },
      "statusChanged": {
        "label": "تغيّر حالة الفرصة"
      },
      "won": {
        "label": "فوز بالفرصة"
      },
      "lost": {
        "label": "خسارة الفرصة"
      }
    },
    "conditions": {
      "status": "حالة الفرصة",
      "value": "قيمة الفرصة",
      "owner": "المسؤول"
    },
    "actions": {
      "changeStatus": {
        "label": "تغيير الحالة"
      },
      "assignUser": {
        "label": "إسناد مستخدم"
      },
      "create": {
        "label": "إنشاء فرصة بيعية"
      },
      "addNote": {
        "label": "إضافة ملاحظة"
      }
    },
    "fields": {
      "toStatus": "الحالة الجديدة",
      "newStatus": "الحالة الجديدة",
      "note": "الملاحظة"
    }
  },
  "outreach": {
    "triggers": {
      "started": {
        "label": "بدء الحملة"
      },
      "customerAdded": {
        "label": "إضافة عميل"
      },
      "messageSent": {
        "label": "إرسال رسالة"
      },
      "messageDelivered": {
        "label": "توصيل الرسالة"
      },
      "messageRead": {
        "label": "قراءة الرسالة"
      },
      "messageReplied": {
        "label": "الرد على الرسالة"
      },
      "customerExited": {
        "label": "خروج العميل من الحملة"
      },
      "completed": {
        "label": "اكتمال الحملة"
      }
    },
    "conditions": {
      "channel": "قناة الحملة"
    },
    "actions": {
      "sendWhatsapp": {
        "label": "إرسال واتساب"
      },
      "sendGmail": {
        "label": "إرسال جيميل"
      },
      "sendMessenger": {
        "label": "إرسال ماسنجر"
      },
      "removeCustomer": {
        "label": "حذف عميل من الحملة"
      },
      "stopForCustomer": {
        "label": "إيقاف الحملة لهذا العميل"
      }
    },
    "fields": {
      "campaign": "الحملة",
      "phoneNumber": "رقم الهاتف",
      "template": "القالب",
      "mailbox": "صندوق البريد",
      "subject": "الموضوع",
      "message": "الرسالة",
      "messengerPage": "صفحة ماسنجر"
    }
  },
  "tasks": {
    "triggers": {
      "created": {
        "label": "إنشاء مهمة"
      },
      "assigned": {
        "label": "إسناد مهمة"
      },
      "due": {
        "label": "استحقاق مهمة"
      },
      "overdue": {
        "label": "تأخر مهمة"
      },
      "completed": {
        "label": "اكتمال مهمة"
      }
    },
    "conditions": {
      "priority": "الأولوية",
      "status": "الحالة",
      "assignedUser": "المستخدم المسؤول"
    },
    "actions": {
      "create": {
        "label": "إنشاء مهمة"
      },
      "assign": {
        "label": "إسناد مهمة"
      },
      "changeStatus": {
        "label": "تغيير الحالة"
      },
      "changePriority": {
        "label": "تغيير الأولوية"
      }
    },
    "fields": {
      "title": "العنوان",
      "description": "الوصف",
      "assignedTo": "المسؤول",
      "priority": "الأولوية",
      "newStatus": "الحالة الجديدة"
    }
  },
  "notifications": {
    "actions": {
      "send": {
        "label": "إرسال إشعار"
      }
    },
    "fields": {
      "recipient": "المستلم",
      "message": "الرسالة"
    }
  },
  "templates": {
    "followUpNewLead": {
      "label": "متابعة عميل محتمل جديد",
      "description": "انتظار 10 دقائق بعد إنشاء عميل محتمل جديد، ثم إنشاء مهمة متابعة."
    },
    "retargetNoReply": {
      "label": "إعادة استهداف بدون رد",
      "description": "بعد إرسال رسالة الحملة، انتظار حتى يومين للرد، ثم إرسال متابعة عبر Gmail في حالة عدم الرد."
    },
    "highIntentToOpportunity": {
      "label": "نية شراء عالية ← فرصة بيعية",
      "description": "عند رد العميل على واتساب، إنشاء فرصة بيعية ومهمة متابعة."
    },
    "taskOverdueReminder": {
      "label": "تذكير بمهمة متأخرة",
      "description": "إشعار عند تأخر مهمة عن موعدها."
    },
    "wonDealFollowUp": {
      "label": "متابعة بعد الفوز بالصفقة",
      "description": "انتظار يوم واحد بعد الفوز بالفرصة، ثم إنشاء مهمة متابعة."
    }
  },
  "center": {
    "pageTitle": "مركز الأتمتة",
    "pageDescription": "أنشئ وأدر الـ Workflows عبر كل الوحدات من مكان واحد.",
    "createWorkflow": "إنشاء Workflow",
    "emptyWorkflows": "لا توجد Workflows بعد.",
    "useTemplate": "استخدام القالب",
    "untitled": "Workflow بدون اسم",
    "deleteSuccess": "تم حذف الـ Workflow",
    "confirmDeleteTitle": "هل تريد حذف هذا الـ Workflow؟",
    "confirmDeleteMessage": "سيتم حذف المسودة المحلية نهائيا. لا يمكن التراجع عن هذا الإجراء.",
    "executionsNotAvailableTitle": "لا يوجد سجل تنفيذ بعد",
    "executionsNotAvailableDescription": "لا يوجد محرك أتمتة متصل بالباك إند بعد، لذلك الـ Workflows لا تعمل فعليا — راجع WORKFLOW_ENGINE_BACKEND_REQUIREMENTS.md.",
    "logsNotAvailableTitle": "لا توجد سجلات بعد",
    "logsNotAvailableDescription": "ستظهر سجلات التنفيذ هنا بمجرد توفر محرك أتمتة متصل بالباك إند.",
    "selectPromptTitle": "اختر Workflow للبدء",
    "selectPromptDescription": "اختر Workflow من القائمة الجانبية، أو أنشئ واحدًا جديدًا لفتحه في Visual Workflow Builder.",
    "tabs": {
      "workflows": "Workflows",
      "templates": "القوالب",
      "executions": "التنفيذات",
      "logs": "السجلات"
    }
  }
}
