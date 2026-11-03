# Lead Customer 360 — ICAN CRM

## الهدف
إعادة تصميم صفحة العميل `/lead/:customerId` كمساحة Customer 360 مع الاحتفاظ ببيانات ووظائف الـ CRM الحالية. الواجهة عربية RTL ومتجاوبة. لا تستخدم أرقامًا أو مؤشرات تجريبية من صورة التصميم؛ جميع بيانات العميل يجب أن تأتي من المصادر الحقيقية.

## نطاق التعديل
- الفرع: `feature/lead-360-redesign` (الفرع الأساسي `master` لم يُعدل).
- مدخل الراوت: `src/pages/customers/pages/lead-details/CustomerLeadDetailsPage.jsx`.
- المكون الرئيسي: `customer-360/Customer360Page.jsx`.
- واجهة التفاصيل الحالية: `src/pages/customers/components/CustomerDetailsDrawer/CustomerDetailsDrawer.jsx`، أضيف لها `mode="360"` بدون استبدال وضع `drawer` أو `page`.

## هيكل الملفات
```text
customer-360/
├── README.md
├── Customer360Page.jsx                 # تجميع أقسام الصفحة
└── components/
    ├── Customer360Navigation.jsx       # Breadcrumbs + التنقل بين العملاء
    ├── Customer360Intro.jsx            # مقدمة الصفحة ورقم السجل
    ├── Customer360Workspace.jsx        # تمرير معرف العميل إلى مصدر البيانات الحقيقي
    ├── Customer360Layout.jsx           # تقسيم الصفحة إلى مناطق باستخدام slots
    ├── Customer360Panel.jsx            # غلاف موحد للأقسام
    ├── Customer360Actions.jsx          # قسم الإجراءات والتواصل
    ├── Customer360Activity.jsx         # التبويبات والأنشطة
    ├── Customer360Profile.jsx          # بيانات العميل
    └── Customer360Deals.jsx            # الصفقات المرتبطة
Customer360Layout.test.jsx              # اختبارات عرض RTL والأقسام الاختيارية
```

## تدفق البيانات
1. `CustomerLeadDetailsPage` يقرأ `customerId` من `useParams` ويقرأ `tab` من query string.
2. `Customer360Page` يجمع التنقل والمقدمة ومساحة العمل.
3. `Customer360Workspace` يستدعي `CustomerDetailsContent` مع `mode="360"`.
4. `CustomerDetailsContent` يجلب بيانات العميل بواسطة `useCustomerInfo`، والحالات والتصنيفات بواسطة `definitionsApi.getStatuses/getTags`، ويحتفظ بمنطق التعديل والتحديث والدردشات.
5. `Customer360Layout` يستقبل عناصر React جاهزة (slots) ولا يجلب بيانات بنفسه: header, actions, overview, tabs, content, deals, floatingChats.

## الأقسام ووظائفها
| القسم | المصدر / الوظيفة |
| --- | --- |
| رأس العميل | `CustomerHeaderModern`: الاسم، البيانات، الحالة، المصدر، التصنيف وتغييرهما |
| الإجراءات | `CustomerQuickActions`: الإجراءات التشغيلية وفتح قنوات التواصل |
| الملف الشامل | `HomeTab`: معلومات العميل التفصيلية الحالية |
| التبويبات | `DrawerTabs` و`ActiveTabContent` مع نفس سلوك التبويب المحفوظ |
| Timeline | `TimelineTab` |
| خدمة العملاء | `CustomerServiceTabSlot` |
| الاهتمامات | `InterestsTab` |
| الملاحظات | `NotesTab` |
| المهام | `TasksTab` |
| المكالمات | `CallsActionTab` |
| الاجتماعات | `MeetingsActionTab` |
| التقويم | `CalendarTab` |
| الملفات | `FilesTab` |
| البريد | `EmailsTab` |
| الصفقات | `CustomerDealsDrawerSection` |
| محادثات القنوات | FloatingWhatsappChat, FloatingMessengerChat, FloatingSmsChat, FloatingMailChat |
| تقارير الاجتماعات | `PreMeetingReportDrawer` و`AfterMeetingReportDrawer` ما زالا في مدخل الصفحة |

## قرارات التصميم
- عرض كامل للـ header والإجراءات، ثم Grid رئيسي 8/12 للمحتوى و4/12 للملف الجانبي على شاشات XL؛ ترتيب عمودي للشاشات الأصغر.
- لا توجد بيانات ثابتة للعميل أو قيم Health/SLA مصطنعة.
- لا تُكرر طلبات الـ API في المكونات الشكلية؛ مصدر الحقيقة هو `CustomerDetailsContent`.
- تبقى صلاحيات الأزرار وحفظ التغييرات في المكونات الحالية، وليس في layout.
- يجب ألا يتغير سلوك Drawer عند فتح العميل من قائمة العملاء.

## كيفية الاختبار
1. شغّل المشروع بالطريقة الموثقة في جذر الريبو وافتح `/lead/11` بحساب مصرح له.
2. راجع بيانات الاسم والهاتف والبريد والمصدر والحالة والتصنيف والموظف المسؤول مقارنة بالصفحة القديمة.
3. جرّب تغيير الحالة والتصنيف وإضافة ملاحظة ومهمة وموعد ومكالمة واجتماع.
4. افتح واتساب والبريد والرسائل وتأكد من عمل نوافذ التواصل وإغلاقها.
5. تحقق من Timeline والتبويبات والملفات والاهتمامات والصفقات وتقارير الاجتماعات وروابط query string.
6. راجع حالات التحميل والأخطاء والعميل غير الموجود والصلاحيات وRTL والموبايل والتابلت والشاشات الواسعة.
7. نفّذ lint/build/tests الموجودة في package.json وقارن عدم وجود regression في Drawer.

## الحالة الحالية والمهام المتبقية
**تم:** إنشاء هيكل مكونات الصفحة، تركيب الـ Dashboard الجديد، إعادة استخدام الاستعلامات والوظائف الحالية، إبقاء التقارير والتبويبات والصفقات.

**تمت إضافة اختبارات آلية:** `Customer360Layout.test.jsx` لاختبار RTL ووجود أقسام الواجهة والصفقات الاختيارية. **لم تُشغّل الاختبارات بعد.**

**لم يُتحقق منه بعد:** تشغيل build/lint/tests، اختبار الصفحة داخل المتصفح، التحقق من كل الإجراءات على بيانات حقيقية. بيئة التنفيذ الحالية لا تستطيع الاتصال بـ GitHub من الطرفية لتنزيل الريبو وتشغيل أدوات المشروع؛ لذلك تم حفظ التعديلات عبر موصل GitHub دون الادعاء بنجاح الاختبارات.

**تحسينات تالية:** فصل المنطق الضخم داخل `CustomerDetailsDrawer.jsx` إلى hooks ومكونات أصغر بدون تكرار البيانات؛ تحسين كثافة العرض؛ بناء كروت KPI فقط بعد التأكد من وجود مصدر بيانات حقيقي؛ تحسين Timeline كعمود مستقل حسب التصميم المرجعي؛ اختبارات تفاعلية وتكاملية.

## إضافة مكون جديد
أنشئه داخل `components/`، مرّر له بياناته أو عناصره عبر props، ولا تضع API calls داخل مكونات العرض العامة. إذا احتاج المكون mutation، أعد استخدام الـ hooks الموجودة واحترم الصلاحيات وحالات التحميل والخطأ. حدّث هذا الملف عند أي تغيير في الأقسام أو تدفق البيانات.
