export default {
  "settings": {
    "sections": {
      "general": "عام",
      "generalHint": "الاسم والحالة والتواريخ والأهداف والمسؤول.",
      "stages": "المراحل",
      "stagesHint": "مراحل هذه الصفقة.",
      "preferences": "التفضيلات",
      "preferencesHint": "شكل مساحة العمل عندك.",
      "danger": "الحذف",
      "dangerHint": "حذف هذه الصفقة."
    },
    "save": "حفظ",
    "saved": "تم حفظ الصفقة.",
    "saveFailed": "تعذّر حفظ الصفقة.",
    "stagesNote": "تم نسخ المراحل من قالب المراحل عند إنشاء الصفقة. تعديل القالب لا يغيّر هذه الصفقة.",
    "wonStage": "مرحلة الكسب",
    "lostStage": "مرحلة الخسارة",
    "manageTemplates": "إدارة قوالب المراحل",
    "browserOnly": "محفوظ في هذا المتصفح فقط.",
    "defaultView": "العرض الافتراضي لمراحل البيع",
    "planned": {
      "lostReasons": "أسباب خسارة مخصصة",
      "paymentDefaults": "شروط دفع افتراضية",
      "cardFields": "الحقول الظاهرة على كروت العملاء",
      "notifications": "إشعارات فريق الصفقة",
      "stageRules": "قواعد لكل مرحلة (حقول إلزامية، مدة استجابة)"
    },
    "delete": "حذف الصفقة",
    "deleteHint": "حذف الصفقة يزيل مساحة عملها ولا يمكن التراجع عنه.",
    "deleteTitle": "حذف الصفقة",
    "deleteMessage": "حذف {{name}}؟ لا يمكن التراجع عن هذا.",
    "deleted": "تم حذف الصفقة.",
    "deleteFailed": "تعذّر حذف الصفقة."
  },
  "form": {
    "title": "صفقة جديدة",
    "description": "كل صفقة لها مساحة عمل خاصة: العملاء والفريق والمنتجات والعقود والتقارير.",
    "save": "إنشاء الصفقة",
    "created": "تم إنشاء الصفقة.",
    "createFailed": "تعذّر إنشاء الصفقة.",
    "templateHint": "الصفقة تنسخ مراحل هذا القالب.",
    "templateLocked": "لا يمكن تغييره بعد الإنشاء.",
    "errors": {
      "nameRequired": "الاسم مطلوب.",
      "pipelineRequired": "اختر قالب المراحل.",
      "endBeforeStart": "تاريخ النهاية قبل تاريخ البداية."
    }
  },
  "pipelines": {
    "description": "قوالب المراحل. الصفقة الجديدة تنسخ مراحل قالبها، والتعديلات اللاحقة لا تغيّر الصفقات الموجودة.",
    "newTitle": "قالب مراحل جديد",
    "editTitle": "تعديل قالب المراحل",
    "dialogHint": "يُفضّل وجود مرحلة كسب واحدة ومرحلة خسارة واحدة.",
    "name": "اسم القالب",
    "stageName": "اسم المرحلة",
    "stageColor": "لون المرحلة",
    "addStage": "إضافة مرحلة",
    "removeStage": "حذف المرحلة",
    "moveUp": "تحريك لأعلى",
    "moveDown": "تحريك لأسفل",
    "stagesCount": "{{count}} مرحلة",
    "nameRequired": "اسم القالب مطلوب.",
    "stagesRequired": "أضف مرحلة واحدة على الأقل باسم.",
    "created": "تم إنشاء القالب.",
    "updated": "تم تحديث القالب.",
    "saveFailed": "تعذّر حفظ القالب.",
    "edit": "تعديل",
    "delete": "حذف",
    "deleteTitle": "حذف قالب المراحل",
    "deleteMessage": "حذف {{name}}؟ الصفقات المنشأة منه تحتفظ بمراحلها.",
    "deleted": "تم حذف القالب.",
    "deleteFailed": "تعذّر حذف القالب.",
    "emptyTitle": "لا توجد قوالب مراحل بعد",
    "emptyDescription": "أنشئ قالب مراحل قبل إنشاء الصفقات.",
    "defaultStages": {
      "0": "جديد",
      "1": "مكسوب",
      "2": "خاسر"
    }
  }
}
