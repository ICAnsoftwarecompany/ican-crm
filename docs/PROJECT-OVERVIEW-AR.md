# ICAN CRM — وصف شامل للمشروع (بنية + تصميم + خصائص)

> **Documentation update:** 2026-10-25 01:10 (Africa/Cairo)

هذا الملف يقدّم وصفًا عمليًا للمشروع كما هو في الكود الحالي، ويركّز على:
- البنية المعمارية
- منهجية التصميم وتجربة الاستخدام
- الخصائص (Features) والقدرات الوظيفية

إذا اختلف هذا الوصف مع الكود، **الكود هو المرجع النهائي**.

## 1) نظرة عامة

ICAN CRM هو تطبيق CRM متعدد المستأجرين (Multi-tenant) مبني كواجهة أمامية حديثة لإدارة دورة العميل كاملة:
- جذب العملاء المحتملين ومتابعتهم
- إدارة القنوات (محادثات، مكالمات، اجتماعات)
- إدارة الصفقات والمهام
- حملات التسويق (مدفوعة + Outreach)
- أتمتة تدفقات العمل
- تقارير ولوحات معلومات

التطبيق يعتمد على بنية Feature-based، بحيث كل نطاق أعمال له مجلد مستقل يضم API/Hooks/Components/Utils.

## 2) البنية المعمارية

## 2.1 الطبقات الرئيسية

اتجاه الاعتمادية الأساسي:

app/pages -> features -> shared/services

- app/pages:
  - تكوين الراوتر، التنقل، وتجميع الصفحات.
  - الصفحات هنا خفيفة (Composition) وتفاصيل المنطق داخل features.

- features:
  - قلب النظام الوظيفي.
  - كل نطاق أعمال (customers, leads, deals, conversations, internal-chat, tasks, campaigns...) يمتلك وحدته المستقلة.
  - يحتوي عادة على: api, hooks, components, utils, constants, store (عند الحاجة).

- shared/services:
  - shared: مكونات عامة ومحايدة نطاقيًا (DataTable, SubSidebar, Reports, Overlays, UI primitives).
  - services: النقل الشبكي المشترك مثل httpClient وحل المستأجر.

## 2.2 التقنيات الأساسية

- React 19 + Vite 5
- React Router 6
- TanStack Query 5 لإدارة Server State
- Zustand لإدارة Client State العالمي المحدود
- Tailwind + CSS Variables للتصميم والثيم
- i18next لدعم العربية/الإنجليزية
- Vitest + Testing Library للاختبارات

## 2.3 التعدد المستأجر (Multi-tenancy)

- تحديد الـ tenant يتم من الـ subdomain.
- كل الطلبات تمر عبر httpClient المركزي.
- Authorization token + api_password يتم إرفاقهما مركزيًا عبر interceptor.
- هذا يضمن توحيد الاتصال وتجنّب تكرار منطق المصادقة داخل كل Feature.

## 2.4 تنظيم الحالة والبيانات

- Server State:
  - React Query هو المصدر الأساسي (caching, invalidation, loading, error states).

- Client State:
  - Zustand يستخدم فقط للحالة المشتركة عالميًا (مثل auth/theme وبعض حالات UI).

- Realtime:
  - Laravel Echo/Reverb لالتقاط التحديثات اللحظية لبعض الوحدات (محادثات/إشعارات وغيرها).

## 3) التصميم وتجربة الاستخدام

## 3.1 نظام تصميم قائم على Tokens

التصميم مبني على CSS variables (semantic tokens) وليس ألوانًا صلبة داخل JSX.
أمثلة: surface, border, text, brand, status, chart, shell tokens.

الفوائد:
- اتساق بصري عبر النظام
- دعم Light/Dark بطريقة مستقرة
- سهولة تخصيص الهوية لاحقًا

## 3.2 دعم العربية/الإنجليزية وRTL/LTR

- جميع النصوص تظهر عبر i18n keys.
- دعم RTL/LTR يعتمد على خصائص منطقية (start/end, ms/me, ps/pe).
- البنية تُصمّم لتبديل اللغة والاتجاه بدون إعادة بناء مكونات منفصلة.

## 3.3 نمط الواجهات المركبة

المشروع يعتمد Engines مشتركة تُستخدم في أكثر من نطاق:
- DataTable Engine
- Pipeline Board Engine
- Reports Engine
- Sub-sidebar Engine
- Calendar/Visual Flow Engines

هذا يقلل التكرار، ويرفع القابلية للصيانة، ويجعل تجربة المستخدم متناسقة بين الوحدات.

## 4) الخصائص الرئيسية (Functional Capabilities)

## 4.1 Sales Domain

- إدارة Leads/Customers
- حالة العميل (Statuses/Tags)
- أنشطة ومتابعات ومهام
- Drawer تفصيلي للعميل
- Board/Table views مع إجراءات سياقية
- إدارة الصفقات Deals ومساراتها
- Opportunities + Proposals

## 4.2 Communication Hub

- Conversations (WhatsApp / Messenger / Gmail)
- Calls
- Meetings
- Team Chat (Internal Chat)

المحور موحد عبر Sub-sidebar مع صفحات: View/Create/Reports/Calendar/Automation/AI.

## 4.3 Internal Chat

- محادثات مباشرة وجماعية داخل الفريق
- واجهة محادثة موحدة عبر ConversationThread
- إدارة unread/mark-as-read + realtime updates
- إنشاء محادثات جماعية واستعراض المجموعات عبر API موحدة

## 4.4 Campaigns & Growth

- Campaign Center للحملات المدفوعة (خصوصًا Meta)
- Outreach Campaigns للرسائل إلى جهات CRM
- Social Media modules (حالة جزئية حسب المنصة)

## 4.5 Tasks & My Work

- Workspace للمهام
- فصل واضح بين Tasks و To-Do
- لوحات، قائمة، تقويم، فلاتر وسيناريوهات ربط بالسجلات
- My Work يجمع ما يخص المستخدم عبر أكثر من وحدة

## 4.6 Workflow Automation

- Workflow Builder مرن متعدد الوحدات
- تسجيل Modules وTriggers/Actions
- يدعم بناء تدفقات مع جاهزية جيدة على الواجهة
- التنفيذ الخلفي ما زال يعتمد على اكتمال عقد الـ backend لبعض الحالات

## 4.7 Customer Hub (Service Operations)

- وحدة كبيرة مخصّصة لخدمة ما بعد البيع
- مبنية على مراحل F0-F7
- نطاقات تشمل: cases, SLA, knowledge, feedback, records, assets, billing, subscriptions, portal, quality, AI
- كثير من أجزاء هذه الوحدة تعمل على Mock/Live switch حسب جاهزية API

## 5) مميزات هندسية قوية

- بنية واضحة بالملكية (Ownership) لكل Feature.
- قواعد فحص معمارية ولغوية (`check:architecture`, `check:i18n`, `check:service`).
- إعادة استخدام عالية للمكونات العامة بدلاً من نسخ الواجهات.
- فصل جيد بين concerns: routing, state, data fetching, presentation.
- قابلية توسعة قوية بإضافة Features جديدة دون كسر الهيكل الحالي.

## 6) ملاحظات تشغيلية وحوكمة

- أي تغيير وظيفي كبير يجب أن يرافقه تحديث توثيقي.
- لا يتم تغيير عقود API أو المسارات الأساسية بدون قرار صريح.
- التحقق القياسي قبل إنهاء أي مهمة:
  - lint
  - i18n checks
  - architecture/service checks
  - tests
  - build

## 7) خلاصة تنفيذية

المشروع ناضج من ناحية المعمارية الأمامية، ويعتمد نهجًا احترافيًا في:
- modularization
- shared engines
- internationalization
- design tokens
- quality gates

وهذا يجعله مناسبًا للتوسع طويل الأمد، بشرط الاستمرار بنفس الانضباط في:
- الالتزام بقواعد الطبقات
- تحديث التوثيق مع الكود
- إبقاء منطق الأعمال داخل Features وليس الصفحات.
