# ICAN CRM - ملف تفاصيل المشروع

آخر تحديث: 2026-09-01 - Africa/Cairo

هذا الملف هو المرجع العام لمشروع `ican-crm`. يحتوي على وصف المشروع، التقنيات، هيكل الصفحات، طبقة الـ API، نظام المحادثات، مركز التنبيهات، جدول البيانات، صفحة العملاء، الـ Proposal Builder، وقوالب واتس اب.

---

## نظرة عامة

`ICAN CRM` هو نظام CRM متعدد المستأجرين مبني بـ React لإدارة العملاء المحتملين، العملاء، المحادثات، القنوات، المنتجات، الخدمات، الفرق، المستخدمين، المهام، الحملات، العروض التجارية، والقوالب.

المشروع يدعم:

- Multi-tenant عن طريق الـ subdomain.
- تسجيل دخول وتخزين الجلسة باستخدام Zustand.
- Axios client موحد لكل طلبات الـ API.
- React Query لإدارة بيانات السيرفر والكاش والتحديثات.
- Realtime باستخدام Laravel Echo / Pusher / Reverb.
- DataTable عام وقابل لإعادة الاستخدام مع تخصيص عميق.
- مركز محادثات موحد يدعم Messenger و Gmail و WhatsApp.
- Floating chats داخل درج العميل.
- Notification Center مركزي لكل تنبيهات الـ realtime.
- Proposal Builder مرئي لإنشاء العروض التجارية.
- WhatsApp Templates UI لإدارة القوالب وبدء أول رسالة واتس اب.

---

## التقنيات

| الجزء | التقنية |
|---|---|
| Frontend | React 19 |
| Build | Vite 5 |
| Routing | React Router DOM v6 |
| Server State | TanStack React Query v5 |
| Global State | Zustand |
| HTTP | Axios |
| Styling | Tailwind CSS + CSS Variables |
| Icons | lucide-react + أيقونات القنوات الفعلية |
| Toasts | Sonner |
| Forms | React Hook Form + Zod |
| Realtime | Laravel Echo + Pusher JS + Reverb |
| Drag and Drop | @dnd-kit |
| Export | xlsx |
| i18n | i18next + react-i18next |

---

## أوامر التشغيل

```bash
npm install
npm run dev
npm run build
npm run preview
npm run test
npm run lint
```

تشغيل البناء في المشروع الكبير يفضل أن يتم بهذا الشكل:

```powershell
$env:NODE_OPTIONS="--max-old-space-size=8192"; npm run build
```

آخر تحقق تم للبناء نجح، مع تحذير طبيعي فقط بخصوص كبر حجم بعض الـ chunks.

---

## البيئة والـ Multi-Tenant

أهم ملفات الخدمات:

- `src/services/apiBaseUrl.js`
- `src/services/tenantResolver.js`
- `src/services/httpClient.js`
- `src/realtime/echo.js`

أهم متغيرات البيئة:

```env
VITE_API_ROOT_DOMAIN=
VITE_API_SCHEME=
VITE_API_PASSWORD=
```

الواجهة تستخرج المستأجر من الـ subdomain مثل:

```text
test0002.127.0.0.1.nip.io:3000
test0002.localhost:3000
test0002.3s-export.com
```

كل طلبات الـ tenant API تمر من خلال `httpClient`، ويتم إضافة `api_password` وإرسال التوكن تلقائيا حسب إعدادات المشروع.

---

## خريطة الصفحات

الصفحات الأساسية:

- `/login`
- `/`
- `/leads`
- `/customers`
- `/conversations`
- `/campaigns`
- `/tasks`
- `/products`
- `/teams`
- `/users`
- `/templates`
- `/settings`
- `/playground/datatable`

صفحات العملاء الداخلية:

- `/customers`
- `/customers/new`
- `/customers/follow-up`
- `/customers/inactive`
- `/customers/segments`
- `/customers/assignments`
- `/customers/teams`
- `/customers/duplicates`
- `/customers/customization`
- `/customers/import-export`
- `/customers/trash`
- `/customers/settings`
- `/customers/status-board`
- `/customers/proposals`
- `/customers/proposals/templates`
- `/customers/proposals/:proposalId/builder`

صفحات المنتجات:

- `/products`
- `/products/categories`
- `/products/services`
- `/products/service-categories`

---

## هيكل عام للمجلدات

```text
src/
  features/
    auth/
    conversations/
    customers/
    integrations/
    leads/
    notifications/
    products/
    proposals/
  pages/
    conversations/
    customers/
    products/
    templates/
  realtime/
  services/
  shared/
    components/
      data-table/
      layout/
    constants/
  store/
```

---

## التخطيط العام

ملفات التخطيط الرئيسية:

- `src/shared/components/layout/MainLayout.jsx`
- `src/shared/components/layout/Header.jsx`
- `src/shared/components/layout/Sidebar.jsx`
- `src/shared/components/layout/NetworkStatusIndicator.jsx`

الـ Sidebar يحتوي على:

- لوحة التحكم
- العملاء المحتملون
- العملاء
- المحادثات
- الحملات
- المهام
- المنتجات والخدمات
- الفرق
- المستخدمون
- القوالب
- الإعدادات

الـ Header يعرض عنوان الصفحة وأيقونتها، ويعرض أيقونات القنوات في صفحة المحادثات حسب التاب النشط مثل Messenger و Gmail و WhatsApp، مع شارات التنبيه عند وصول رسائل جديدة.

---

## المصادقة

ملفات مهمة:

- `src/features/auth/`
- `src/store/authStore.js`

الاعتماد الأساسي على:

- تسجيل الدخول من API.
- حفظ التوكن وبيانات المستخدم.
- استخدام التوكن في `httpClient`.
- دعم العمل مع subdomain tenant.

---

## صفحة العملاء

الصفحة الرئيسية:

- `src/pages/customers/CustomersPage.jsx`

تم تقسيم صفحة العملاء إلى مكونات مساعدة لتقليل حجم الملف وتحسين الصيانة، ومن أهم الأجزاء:

- Header واختصارات الصفحة.
- جدول العملاء.
- الأعمدة المخصصة.
- الإجراءات السريعة والجماعية.
- درج تفاصيل العميل.
- تغيير حالة العميل.
- صفحات الإعدادات والتخصيص والحذف.

الصفحة تعرض أنواع مختلفة من العملاء:

- Leads قادمة من Campaign.
- Leads قادمة من Ad.
- Leads قادمة من Form.
- عملاء مرفوعون Manual.
- Customer Services.
- عملاء مرتبطون بقنوات مثل Messenger و Gmail و WhatsApp.

أهم البيانات المعروضة:

- اسم العميل.
- البريد الإلكتروني.
- الهاتف.
- الشركة.
- نوع العميل.
- الحالة.
- السيلز أو الوكيل.
- الشخص الذي ربط العميل.
- بيانات المصدر.
- المنتجات والاهتمامات.
- القنوات المربوطة.
- آخر ملاحظة على العميل.
- نشاط العميل وخط السير.
- أعمدة ديناميكية من `attributes`.

---

## ملاحظات العملاء والمتابعات

تم استخدام:

- `src/features/leads/api/leadsApi.js`
- `getLogs`
- `saveAction`

تم إضافة عامود باسم "آخر ملاحظة على العميل".

يعرض العامود آخر Activity بشرط:

```json
{
  "type": "note-to-lead"
}
```

ويعرض:

- نص `note` أو `description`.
- `title`.
- `activity_at`.
- اسم المستخدم الذي أضاف الملاحظة.

عند الوقوف على نص الملاحظة لمدة نصف ثانية يظهر Hover يعرض النص كاملا مع الوقت والعنوان والمستخدم.

تم إضافة زر داخل خلية الملاحظة لإضافة متابعة جديدة. عند الضغط عليه يفتح Dialog باسم العميل، ويرسل البيانات إلى `saveAction` مع تثبيت:

```json
{
  "action": "create_activity",
  "type": "note-to-lead"
}
```

وفي الإجراءات السريعة يظهر زر "إضافة متابعة" فقط عندما يتم اختيار عميل واحد بالضبط من Checkbox. إذا تم اختيار أكثر من عميل لا يكون الإجراء مفعلا.

---

## درج تفاصيل العميل

المجلد:

- `src/pages/customers/components/CustomerDetailsDrawer/`

مميزات الدرج:

- قابل لتغيير العرض.
- عند زيادة العرض تظهر التابات المخفية داخل `+ more`.
- عند تقليل العرض تعود التابات الزائدة مرة أخرى إلى `+ more`.
- محتوى كل تاب يتكيف مع عرض الدرج.
- يدعم Floating Chats.
- صف العميل المفتوح درج تفاصيله يكون مميزا داخل جدول العملاء.
- يوجد زر بجوار اسم العميل لفتح الدرج.

الإجراءات السريعة داخل الدرج:

- إضافة متابعة، وتظهر قبل إجراء المكالمة.
- واتس اب بأيقونة واتس اب فقط.
- Gmail / Mail بأيقونة البريد فقط.
- مكالمة وباقي الإجراءات حسب المتاح.

Dialog "إضافة متابعة":

- قابل للسحب من خلال ضغط مطول.
- لا يمنع Scroll داخل درج العميل.
- يسمح بالتنقل بين تابات الدرج أثناء فتحه.

---

## DataTable

المجلد:

- `src/shared/components/data-table/`

التوثيق:

- `src/shared/components/data-table/docs/DATATABLE_ARCHITECTURE_AR.md`

الميزات:

- بحث عام.
- فلاتر لكل عامود.
- ترتيب Sort.
- إظهار وإخفاء الأعمدة.
- إعادة ترتيب الأعمدة من قائمة الأعمدة بالسحب المطول.
- قائمة الأعمدة تتمدد وتدعم Scroll عند كثرة الأعمدة.
- تغيير عرض الأعمدة.
- تثبيت الأعمدة.
- تحديد صفوف.
- Ctrl+A للتحديد.
- Ctrl+Click للتحديد المتعدد.
- Double click على الصف.
- Right click actions.
- نسخ قيمة الخلية.
- تصدير Excel.
- طباعة.
- مقارنة صفوف.
- اختصارات لوحة المفاتيح.
- إعدادات تنسيق الجدول.

تم إضافة أوضاع عرض متقدمة:

### تقسيم الصف إلى صفين

- زر تشغيل/إيقاف محفوظ في Local Storage.
- عند التشغيل يظهر Dialog لاختيار أعمدة الصف الرئيسي وأعمدة الصف الفرعي.
- الصف الرئيسي يكون مشابها لرأس الجدول في ترتيب الأعمدة.
- الصف الفرعي يظهر أسفل الصف الرئيسي.
- الصف الرئيسي والفرعي داخل إطار واحد خفيف يميز المجموعة عن باقي الصفوف.
- الخلايا مسطرة صفوفا وأعمدة لمنع تداخل البيانات.
- النص يلتف داخل الخلية حسب عرض العامود.
- زر إعادة تهيئة يعيد الأعمدة والصفوف والتقسيم للوضع الافتراضي.

### تقسيم الأعمدة

- طريقة عرض تقسم الجدول إلى يمين ويسار.
- المستخدم يختار أعمدة الجانب الأيمن وأعمدة الجانب الأيسر.
- الصف في النصفين يكون بنفس الارتفاع.
- مفيد للجداول العريضة ذات البيانات الكثيرة.

### تخصيص الجدول

- قواعد تنسيق شخصية ومشتركة.
- حفظ الإعدادات عبر API.
- دعم realtime لتحديث قواعد التنسيق المشتركة.
- زر إعادة تهيئة داخل تخصيص الجدول يعيد الأعمدة للترتيب والعرض الافتراضي المناسب للمحتوى.

---

## المحادثات

الصفحة:

- `src/pages/conversations/ConversationsPage.jsx`

المركز يدعم أكثر من قناة:

- Messenger
- Gmail
- WhatsApp

كل تاب يعرض عدد الرسائل غير المقروءة الخاصة به.

يوجد Header ديناميكي يعرض أيقونة القناة النشطة، ومع وصول رسالة جديدة تظهر شارة تنبيه على أيقونة القناة المناسبة.

ميزات مشتركة:

- قائمة محادثات.
- عرض الرسائل.
- إرسال رسائل.
- إرسال مرفقات.
- ربط المحادثة بعميل.
- تحويل المحادثة إلى عميل محتمل.
- إنهاء المحادثة مع رسالة تأكيد.
- إعادة فتح المحادثة.
- عرض المستخدم المسؤول `assigned_user`.
- عرض حالة المحادثة المفتوحة أو المنتهية.
- منع الإرسال عندما تكون المحادثة منتهية.
- Hover لآخر رسالة من العميل بعد نصف ثانية.
- Hover يظهر فوق أي عنصر آخر في الصفحة.
- فتح صفحة المحادثة من Floating Chat على نفس المحادثة المحددة.

---

## Messenger

ملفات مهمة:

- `src/features/conversations/api/messengerApi.js`
- `src/features/conversations/hooks/useConversations.js`
- `src/features/conversations/components/`
- `src/features/meta-integrations/api/messengerMetaApi.js`

الميزات:

- عرض المحادثات والرسائل.
- عرض بيانات جهة الاتصال.
- عرض العميل المرتبط إن وجد.
- إذا لم يوجد عميل تظهر أزرار الربط أو التحويل.
- عرض `assigned_user.name`.
- Read/Delivered ticks:
  - `read` يعرض علامتين صح باللون الأزرق.
  - `delivered` يعرض علامتين صح فقط.
- Reaction على الرسائل.
- إزالة Reaction بالضغط مرتين.
- Hover على Reaction يعرض من قام بها: العميل أو مستخدم CRM.
- تمييز Reaction الخاصة بالعميل عن Reaction الخاصة بالـ CRM.
- Reply على الرسائل والانتقال للرسالة الأصلية.
- Gallery للصور والفيديوهات والملفات.
- Voice note بتصميم متوافق مع RTL.
- خيارات سرعة الصوت، ومنها 1x و 2x و 3x.
- تلوين مختلف للرسائل الصادرة من CRM والواردة من العميل.

تم العمل على مشكلة تحديث الـ websocket بحيث يلاحظ:

- رسالة جديدة.
- Reply جديد.
- Reaction جديد على رسالة موجودة.
- تحديث حالة Read.
- تحديث حالة Delivered.

---

## Gmail

ملفات مهمة:

- `src/features/conversations/api/gmailApi.js`
- `src/features/conversations/hooks/`

الدوال المدعومة:

- جلب محادثات Gmail.
- جلب تفاصيل محادثة.
- جلب رسائل محادثة.
- إرسال رسالة Gmail.
- إرسال مرفقات.
- ربط المحادثة بعميل.
- إنهاء المحادثة.
- إعادة فتح المحادثة.
- جلب محادثة بواسطة Customer.
- جلب محادثة بواسطة Lead.
- جلب Mailboxes الخاصة بالمستخدم.
- جلب Business Emails.
- حفظ Business Emails.

واجهة Gmail في صفحة المحادثات تدعم:

- تاب Gmail.
- عدد غير المقروء.
- شارة تنبيه في الهيدر.
- اختلاف تنبيهات Gmail عن Messenger و WhatsApp.
- ضرورة تسجيل دخول Gmail قبل استخدام المحادثات.

---

## WhatsApp

ملفات مهمة:

- `src/features/conversations/hooks/useWhatsappConversations.js`
- `src/features/integrations/whatsapp/api/whatsappIntegrationApi.js`
- `src/features/integrations/whatsapp/hooks/useWhatsappIntegration.js`
- `src/features/conversations/components/WhatsappTemplatesDialog.jsx`

الميزات:

- محادثات واتس اب داخل صفحة المحادثات.
- Floating WhatsApp chat داخل درج العميل.
- إرسال رسائل ومرفقات.
- ربط محادثة واتس اب بعميل.
- إنهاء وإعادة فتح المحادثة.
- البحث عن محادثة بواسطة العميل أو الليد.
- تنبيهات Realtime.
- صوت تنبيه خاص عند وصول رسالة واتس اب من:

```text
public/notifications/whatsAppTone
```

إذا لم يكن للرقم محادثة واتس اب موجودة، يتم استخدام دالة بداية المحادثة عن طريق إرسال Template Message.

---

## قوالب واتس اب

تمت إضافة صفحة رئيسية للقوالب:

- `/templates`
- `src/pages/templates/TemplatesPage.jsx`

أول نوع قوالب مدعوم:

- WhatsApp Templates

الدوال المضافة في:

- `src/features/integrations/whatsapp/api/whatsappIntegrationApi.js`

الدوال:

- `sendTemplateMessage(payload)`
- `getTemplates(params)`
- `createTemplate(integrationId, payload)`
- `updateTemplate(integrationId, payload)`
- `uploadTemplateMedia(integrationId, payload)`
- `syncTemplateStatus(templateId)`
- `toggleTemplateActive(templateId, payload)`
- `deleteTemplate(templateId)`

Hooks:

- `useWhatsappTemplates`
- `useSendWhatsappTemplateMessage`
- `useCreateWhatsappTemplate`
- `useUpdateWhatsappTemplate`
- `useUploadWhatsappTemplateMedia`
- `useSyncWhatsappTemplateStatus`
- `useToggleWhatsappTemplateActive`
- `useDeleteWhatsappTemplate`

واجهة `WhatsappTemplatesDialog` تدعم:

- عرض القوالب.
- إنشاء قالب جديد.
- تحديث قالب.
- رفع Media للـ Header.
- مزامنة حالة القالب.
- تفعيل وتعطيل القالب.
- حذف القالب.
- إرسال أول رسالة واتس اب باستخدام:

```json
{
  "phone_number_id": "1168175123041297",
  "to": "201275886491",
  "template_name": "crm_test"
}
```

---

## Floating Chats

داخل درج العميل يوجد دعم للنوافذ العائمة للمحادثات.

الميزات:

- فتح محادثة Messenger.
- فتح محادثة Gmail.
- فتح محادثة WhatsApp.
- Minimize / Maximize.
- Resize.
- Drag.
- Reset position.
- حفظ مكان وحجم النافذة في Local Storage.
- زر فتح صفحة المحادثات يفتح صفحة المحادثات على نفس المحادثة.
- زر Esc يغلق نافذة الشات العائمة فقط ولا يغلق درج العميل.

---

## مركز التنبيهات

المجلد:

- `src/features/notifications/`

الفكرة:

- تجميع كل تنبيهات الـ realtime في مكان واحد.
- دعم تنبيهات مؤقتة Temporary.
- دعم تنبيهات ثابتة Persistent.
- فصل شكل تنبيهات Messenger عن Gmail عن WhatsApp.
- عرض شارات على أيقونات القنوات في Header.
- مركز التنبيهات يفتح فوق أي شيء في الصفحة باستخدام z-index مرتفع.

أمثلة مصادر التنبيهات:

- رسائل Messenger.
- رسائل Gmail.
- رسائل WhatsApp.
- تحديثات المحادثات.
- تنبيهات المهام.
- تحديثات عامة من websocket.

---

## Proposal Builder

المجلد:

- `src/pages/customers/pages/proposals/`

ملفات مهمة:

- `CustomerProposalsPage.jsx`
- `CustomerProposalTemplatesPage.jsx`
- `CustomerProposalBuilderPage.jsx`
- `PROPOSAL.md`
- `PROPOSAL_ARCHITECTURE_AR.md`

الموديول يضيف إدارة كاملة للعروض التجارية داخل إدارة العملاء.

صفحات Proposal:

- قائمة العروض.
- قوالب العروض.
- Builder مرئي للعرض.

الـ Builder ليس مجرد JSON editor، بل واجهة مرئية من ثلاث مناطق:

- يسار: بنية العرض ومكتبة البلوكات.
- وسط: Canvas للمعاينة والتحرير.
- يمين: Properties و Pricing و Versions.

يدعم:

- إنشاء Proposal.
- إنشاء أول Version.
- Autosave.
- Manual save.
- Preview.
- Sections.
- Blocks.
- Drag and Drop.
- Pricing options.
- Option items.
- Recommended option.
- Current version.
- Template based proposal.

أنواع البلوكات:

- Cover.
- Heading.
- Text.
- Image.
- Button.
- Divider.
- Spacer.
- Customer Info.
- Company Info.
- Products.
- Pricing.
- Terms.
- Signature.
- Page Break.
- Video.
- Custom.
- Link.

---

## Proposal APIs

ملف API:

- `src/features/proposals/api/proposalsApi.js`

الدوال:

- `getProposals`
- `getProposalInfo`
- `createProposal`
- `updateProposal`
- `deleteProposal`
- `createProposalVersion`
- `getProposalVersions`
- `getProposalVersionInfo`
- `updateProposalVersion`
- `deleteProposalVersion`
- `setCurrentProposalVersion`
- `getProposalOptions`
- `createProposalOption`
- `reorderProposalOptions`
- `updateProposalOption`
- `setRecommendedProposalOption`
- `deleteProposalOption`
- `getProposalOptionItems`
- `createProposalOptionItem`
- `reorderProposalOptionItems`
- `updateProposalOptionItem`
- `deleteProposalOptionItem`

ملف قوالب العروض:

- `src/features/proposals/api/proposalTemplatesApi.js`

يدعم:

- جلب القوالب.
- إنشاء قالب.
- تحديث قالب.
- حذف قالب.
- نسخ قالب.
- تفعيل وتعطيل قالب.
- إصدارات القوالب.
- Sections.
- Blocks.
- Reorder.
- Toggle visibility.

Hooks:

- `useProposals`
- `useProposalInfo`
- `useProposalVersions`
- `useProposalVersionInfo`
- `useProposalOptions`
- `useProposalOptionItems`
- `useProposalMutations`
- `useProposalTemplates`
- `useProposalTemplateInfo`
- `useProposalTemplateMutations`

---

## المنتجات والخدمات

المجلد:

- `src/pages/products/`

يدعم:

- المنتجات.
- فئات المنتجات.
- الخدمات.
- فئات الخدمات.
- ربط المنتجات بالحملات والإعلانات والفورم.
- صور المنتجات باستخدام رابط الأساس من البيئة.

ملفات API:

- `src/features/products/api/productsApi.js`
- `src/features/products/api/categoriesApi.js`
- `src/features/products/api/linkProductsApi.js`

---

## الفرق والمستخدمون

الصفحات:

- `/teams`
- `/users`

الملفات:

- `src/features/teams/`
- `src/features/users/`

تستخدم في:

- تعيين العملاء.
- عرض السيلز أو الوكيل.
- عرض الشخص الذي ربط العميل.
- عرض الفريق والحالة بجوار الاسم داخل أعمدة العملاء.

---

## الحملات والمهام والإعدادات

الصفحات:

- `/campaigns`
- `/tasks`
- `/settings`

الحملات تستخدم مع:

- Campaign source.
- Ads.
- Forms.
- Linked products.

المهام مرتبطة بالـ Header والتنبيهات.

الإعدادات تشمل:

- التعريفات.
- الحالات.
- المستخدمين.
- التكاملات.
- تخصيصات العملاء.

---

## Query Keys

ملف ثابت:

- `src/shared/constants/queryKeys.js`

تمت إضافة مفاتيح للـ:

- Customers.
- Leads.
- Conversations.
- Messenger.
- Gmail.
- WhatsApp.
- Notifications.
- Proposal Templates.
- Proposals.

---

## اتجاه اللغة وواجهة المستخدم

المشروع يدعم العربية والإنجليزية.

تم إصلاح مشاكل اتجاه النص العربي في أجزاء كثيرة من المحادثات والجداول. أهم القواعد:

- استخدام `dir` المناسب حسب اللغة أو المحتوى.
- عدم كسر النص العربي داخل الأزرار والخلايا.
- Voice notes تعمل باتجاه مناسب للعربية.
- Hover الخاصة بالرسائل والـ reactions لا تتأثر باتجاه الشات.
- النصوص الطويلة تلتف داخل الخلايا حسب عرض العامود.

---

## ملاحظات تقنية مهمة

- تسجيل الصوت في المتصفح يحتاج Secure Origin. لذلك بعض الروابط مثل `nip.io` على HTTP قد لا تدعم `MediaRecorder` أو صلاحيات الميكروفون، والحل الأفضل استخدام HTTPS أو إعداد محلي آمن.
- مشكلة CORS لا يمكن حلها بالكامل من الواجهة إذا كان السيرفر لا يرسل `Access-Control-Allow-Origin`. تم استخدام إعدادات frontend مؤقتة أثناء التطوير، لكن الحل النهائي من backend.
- إرسال Voice Note بصيغة WebM يعتمد على قبول backend و Meta/Messenger للصيغة، وقد يحتاج تحويل أو قبول MIME مناسب.
- بعض دوال Postman كانت تحتوي أخطاء كتابية في المسار مثل `templats` و `templat` وتم الالتزام بالمسارات كما جاءت من الـ backend.

---

## آخر إضافات مهمة

- إصلاح خطأ `d is not defined` في `CustomerProposalBuilderPage.jsx`.
- إضافة APIs و Hooks لقوالب واتس اب.
- إنشاء صفحة `/templates` في الـ Sidebar الرئيسي.
- استخدام واجهة قوالب واتس اب في صفحة القوالب وفي محادثات واتس اب.
- استخدام دالة إرسال أول رسالة واتس اب عندما لا توجد محادثة للرقم.
- إضافة شارات غير المقروء بجوار Tabs المحادثات.
- إضافة زر متابعة داخل درج العميل.
- جعل إجراءات واتس اب والبريد داخل درج العميل أيقونات فقط.
- رفع مركز التنبيهات فوق كل عناصر الصفحة.
- توسيع Proposal APIs واستخدامها داخل Proposal Builder.

---

## ملفات توثيق إضافية

- `src/shared/components/data-table/docs/DATATABLE_ARCHITECTURE_AR.md`
- `src/pages/customers/pages/proposals/PROPOSAL.md`
- `src/pages/customers/pages/proposals/PROPOSAL_ARCHITECTURE_AR.md`

هذه الملفات تحتوي تفاصيل أعمق عن DataTable و Proposal Builder.

