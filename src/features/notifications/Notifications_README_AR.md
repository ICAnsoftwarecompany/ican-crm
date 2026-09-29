# مركز التنبيهات المركزي

> **آخر تحديث:** 2026-09-30 01:00 (Africa/Cairo)

هذا المجلد يملك مركز التنبيهات الدائم في ICAN CRM. مصدر الحقيقة هو Backend API وكاش React Query، بينما Realtime يحدّث الكاش نفسه فور وصول `.notification.created`. لا ينشئ هذا الـfeature اتصال Echo أو Axios جديدًا.

## الهيكل

- `api/notificationsApi.js`: استدعاءات unread وhistory وقراءة تنبيه واحد أو عدة تنبيهات.
- `hooks/useNotifications.js`: استعلامات React Query وعمليات القراءة المتفائلة مع rollback.
- `components/NotificationCenterButton.jsx`: زر الجرس والعداد في الهيدر.
- `components/NotificationCenterPanel.jsx`: لوحة All/Unread وفلتر النوع.
- `components/NotificationTypeFilter.jsx`: فلتر أنواع التنبيهات.
- `components/NotificationList.jsx`: حالات التحميل والخطأ والفراغ والتجميع الزمني.
- `components/NotificationItem.jsx`: عرض الرمز والعنوان والرسالة والقسم والخطورة والوقت.
- `utils/normalizeNotification.js`: تحويل استجابة Backend إلى UI model ثابت.
- `utils/notificationRegistry.js`: تعريف الأنواع وترجمتها وأيقوناتها ومساراتها.
- `utils/notificationIcons.js`: تحويل `data.icon` إلى Lucide icon ولون دلالي.
- `utils/notificationCache.js`: الدمج ومنع التكرار وتحديث حالة القراءة.
- `utils/notificationTime.js`: الوقت النسبي والتجميع إلى اليوم/أمس/سابقًا.
- `utils/notificationSound.js`: تشغيل `/notifications/NewNotification.mp3` عند وصول تنبيه دائم جديد.
- `store/notificationCenterStore.js`: توافق قديم لحالة فتح اللوحة وتنبيهات المحادثات المؤقتة فقط، وليس مصدر history الدائم.

## عقد البيانات الموحد

ينتج `normalizeNotification()` الشكل التالي:

```js
{
  id,
  type,
  category,
  title,
  titleKey,
  message,
  icon,
  iconName,
  iconColor,
  iconTone,
  severity,
  alertableType,
  area,
  areaKey,
  entityType,
  entityId,
  target,
  isRead,
  readAt,
  createdAt,
  raw,
}
```

يدعم المستخرج الاستجابة المباشرة والقائمة المتداخلة paginated بالشكل `data.data`. يتم ترتيب العناصر بالأحدث ومنع تكرارها باستخدام `id`.

## الأنواع المدعومة في الفلتر

| Backend type | مفتاح الترجمة | القسم الافتراضي |
|---|---|---|
| `deal_assigned` | `dealAssigned` | المبيعات |
| `alert.classification_sla_breached` | `classificationSlaBreached` | المبيعات |
| `deal_lead_added` | `dealLeadAdded` | المبيعات |
| `alert.stale_lead` | `staleLead` | المبيعات |
| `task.shared` | `taskShared` | المهام |
| `task.reminder` | `taskReminder` | المهام |
| `meeting.created` | `meetingCreated` | التقويم |
| `meeting.reminder` | `meetingReminder` | التقويم |
| `messenger.conversation.assigned` | `messengerConversationAssigned` | التواصل |
| `gmail.conversation.assigned` | `gmailConversationAssigned` | التواصل |
| `whatsapp.conversation.assigned` | `whatsappConversationAssigned` | التواصل |
| `chat.added_to_group` | `chatAddedToGroup` | التواصل |
| `proposal.viewed` | `proposalViewed` | المبيعات |
| `proposal.option_selected` | `proposalOptionSelected` | المبيعات |
| `proposal.accepted` | `proposalAccepted` | المبيعات |
| `campaign.chat.assigned` | `campaignChatAssigned` | التسويق |

أي نوع غير معروف يستخدم `notifications.types.general` ولا يعطل الواجهة.

## الرموز والألوان

القيمة `data.icon` تمر عبر `notificationIcons.js`. الرموز المعروفة مثل `alert-triangle`, `mail`, `message`, `calendar`, `briefcase` و`check` تحصل على Lucide icon ولون دلالي. الرمز غير المعروف يعود إلى `Bell`.

الألوان معرفة كـCSS variables في `src/index.css` تحت `--notification-*` ولها قيم منفصلة للوضع الداكن. عند وجود `severity` معروفة فإن لون الخطورة له الأولوية على لون الرمز الافتراضي.

## صوت التنبيه الجديد

يشغّل `useTenantNotificationsRealtime` الملف `public/notifications/NewNotification.mp3` عند استقبال `.notification.created`. مصنع الصوت العام موجود في `shared/utils/createNotificationSound.js` ويُنشئ عنصر `Audio` بصورة lazy، ويمنع تكرار الصوت لنفس `notification.id` خلال 1.2 ثانية. قد يمنع المتصفح التشغيل قبل أول تفاعل للمستخدم؛ يتم التعامل مع ذلك بدون تعطيل الواجهة.

قناة التنبيهات المركزية لا تشغّل نغمة WhatsApp فوق النغمة الجديدة، حتى لا يصدر صوتان لنفس event. تبقى أصوات المحادثات الخاصة مستخدمة داخل realtime الخاص بكل قناة.

## درجة الخطورة

القيم المهيأة: `critical`, `danger`, `high`, `warning`, `medium`, `low`, `info`, `success`. تعرض كشارة مترجمة. القيمة الجديدة غير المعروفة تعرض كما أرسلها Backend دون انهيار.

## قسم العميل

- `alertable_type === "App\\Models\\Lead"` يصنف التنبيه تحت `leads` ويعرض "العملاء المحتملون".
- `App\\Models\\Customer` أو أي قيمة أخرى تصنف تحت `customers` وتعرض "إدارة العملاء".

هذا التصنيف مخصص للعرض ولا يغير بيانات Backend.

## إضافة نوع جديد

1. أضف النوع إلى `notificationRegistry` مع `category`, `icon`, `tone`, `titleKey` و`getTarget` فقط إذا كان المسار موجودًا فعلًا.
2. أضف مفتاح الاسم نفسه في `src/locales/ar/notifications.js` و`src/locales/en/notifications.js`.
3. أضفه إلى `notificationTypeOptions` إذا كان مطلوبًا في الفلتر.
4. أضف اختبار normalization/navigation مناسب.
5. شغّل `npm run check:i18n`, الاختبارات و`npm run build`.

## إضافة رمز جديد

أضف اسم Backend إلى `iconRegistry` داخل `notificationIcons.js` واختر Lucide icon و`tone` موجودًا. لا تستخدم SVG يدويًا أو لونًا hardcoded داخل component.

## حدود Backend الحالية

- لا توجد endpoints للحذف أو الأرشفة أو الإعدادات أو read-all مستقل.
- قراءة الكل تجمع IDs غير المقروءة وترسلها إلى `POST /read/many`.
- history paginated، لكن واجهة الـquick panel تعرض حاليًا الصفحة التي يعيدها Backend فقط. دعم infinite pagination يحتاج تمرير `page` والحفاظ على ترتيب صفحات الخادم.
