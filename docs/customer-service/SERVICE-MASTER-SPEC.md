# ICAN CRM — Service Operations Platform
## المواصفات النهائية الموحدة للباك إند (Master Specification v1.0)

---

## 0. كيف تقرأ هذا المستند

هذا المستند هو **المرجع الوحيد المعتمد** لمديول Customer Service / Service Operations في ICAN CRM. يحل محل أي مستندات سابقة، ويدمج:
- المواصفات المعمارية الأساسية (Master Architecture).
- مستند Service Operations (Batches، Components، Portfolios، Follow-ups، Workspace).
- قرارات الكتالوج والـ Capabilities والأقساط التي حُسمت في النقاش.
- حلول الثغرات التي ظهرت في المراجعة.

### تصنيف القرارات
كل قرار في المستند له حالة:

| الرمز | المعنى |
|---|---|
| **[محسوم]** | قرار نهائي. لا يُعاد فتحه إلا بـ ADR جديد |
| **[افتراضي]** | القرار المعتمد حاليًا، قابل للتعديل لو ظهر سبب قوي أثناء التنفيذ |
| **[مفتوح]** | لم يُحسم بعد، ومذكور في القسم 60 مع توصية |
| **[لاحقًا]** | خارج النطاق الحالي، لكن التصميم يجب ألا يمنعه |

### تعليمات لأي مطور أو موديل يعمل على المستند
1. لا تُعِد التصميم من الصفر. ابنِ على المستند وفصّل فيه.
2. لو وجدت تعارضًا أو ثغرة، اكتبها كملاحظة واقترح حلًا، ولا تتجاوزها بصمت.
3. المصطلحات التقنية بالإنجليزي عمدًا لأنها أسماء الجداول والـ APIs.
4. أي قرار معماري جديد يُسجل كـ ADR (القسم 57).
5. ابدأ من Phase 0 فقط، ولا تنشئ كل الجداول مرة واحدة.

### الفهرس

**الجزء الأول: الأساس**
1. السياق: النظام الحالي
2. الهدف والنطاق
3. المبادئ الحاكمة والممنوعات
4. المعمارية وحدود الـ Modules
5. المعايير الهندسية العامة

**الجزء الثاني: خدمات المنصة المشتركة (Shared Platform)**
6. Events, Outbox, Queue
7. Audit Log
8. Permissions
9. Packages, Feature Flags, Business Models, Limits
10. Custom Fields Engine و Record Entries
11. Status & Pipeline Engine
12. Assignment Engine, Queues, Portfolios
13. Files, Attachments, Required Documents
14. Numbering Sequences
15. Import / Export Engine
16. Integrations, External References, Webhooks, Public API
17. Messaging Policy (WhatsApp وقنوات التواصل)
18. Workflow Engine و Approvals
19. Scheduling & Resource Capacity
20. Workspace Engine و My Work
21. Search
22. Observability و Operations Dashboard
23. Localization (تعدد اللغات)

**الجزء الثالث: الـ Business Core**
24. نموذج الهوية: Customer, Contact, Participant
25. الكتالوج: Item Types و Capabilities
26. Service Models (A–H)
27. Contracts
28. Document Builder
29. Billing Lite والأقساط
30. Subscriptions Lifecycle
31. Suppliers

**الجزء الرابع: الربط مع السيلز**
32. Sales → Service Handoff

**الجزء الخامس: Service Operations**
33. Service Records, Batches, Components, Entries
34. Assets و Warranty
35. Entitlements
36. Cases
37. SLA و Escalation
38. Work Orders و Field Service
39. Follow-up Programs
40. التواصل: Conversations, Notes, Replies, Macros
41. Knowledge Base
42. Feedback و Quality
43. Customer Portal
44. Service Catalog
45. AI Layer
46. Reports و Analytics
47. الإعدادات و Industry Templates

**الجزء السادس: أدلة المجالات (Industry Playbooks)**
48. أدلة تطبيق كل مجال

**الجزء السابع: البيانات والـ API**
49. قاعدة البيانات
50. استراتيجية الـ Indexes
51. قواعد الـ API
52. Event Catalog
53. Permission Catalog

**الجزء الثامن: التنفيذ**
54. طريقة البناء
55. المراحل و MVP ومعايير القبول
56. Definition of Done و Testing
57. التوثيق و ADRs
58. المتطلبات غير الوظيفية
59. قاموس المصطلحات
60. القرارات المفتوحة

---

# الجزء الأول: الأساس

## 1. السياق: النظام الحالي

ICAN CRM نظام **Multi-Tenant** قائم (كل شركة Tenant معزول تمامًا). الموجود حاليًا ويجب إعادة استخدامه:

| الموجود | الوصف | دوره في المديول |
|---|---|---|
| Customers | السجل المركزي للعميل | Master Identity |
| Leads + Deals + Sales Pipeline | New → Contacted → Qualified → Proposal → Won/Lost | مصدر الـ Handoff |
| Proposal Builder | Template → Version → Section → Block | أساس Document Builder |
| `/definitions/status` | تعريف الحالات (حاليًا للسيلز) | يُعمم ليصبح Status Engine |
| Lead Assignment Rules | توزيع الليدز | يُعمم ليصبح Assignment Engine |
| Conversations | WhatsApp, Messenger, Gmail مربوطة بالعميل | قناة الـ Cases |
| Products & Services | منتجات وخدمات وفئاتها | يُوسع ليصبح Catalog |
| Tasks | `taskable_type/taskable_id`، Assign، Notes، Attachments، Kanban | Subtasks و Follow-ups |
| Calendar | | مواعيد الزيارات والحجوزات |
| Teams / Users | Sales / Marketing / Admin | + أدوار CS |
| Tags | | تصنيف كل الكيانات |
| Customer Drawer | عرض 360 | + تبويب Service |
| DataTable | Generic: بحث، فلاتر، تصدير | كل القوائم |
| Realtime Notifications | | تحديثات الـ Workspace |
| Facebook Campaigns / Lead Forms | | لا تأثير مباشر |
| Auth | API Password (internal) + Bearer Token (users) | + Portal Token + API Clients |

**غير موجود في الباك إند:** أي شيء خاص بالـ Customer Service، Event System، Queue، Contracts ككيان، Billing.

---

## 2. الهدف والنطاق

### 2.1 الهدف
الـ Customer Service في ICAN ليس Ticket System. هو **Service Operations Platform** تدير رحلة العميل بعد البيع:

```
Lead → Deal → Contract / Order → Customer → Handoff
     → Service Delivery → Support → Follow-up → Renewal / Upsell
```

### 2.2 أوضاع التشغيل
- **مع السيلز:** آخر محطة في السيلز (عقد أو طلب) تحوّل العميل للخدمة تلقائيًا.
- **Standalone:** باقة مستقلة لشركة لا تحتاج Sales CRM.

### 2.3 المجالات المستهدفة
شحن، سياحة وسفر، صيانة، أجهزة ومعدات، مدارس، سناتر وكورسات، شركات سوفتوير (SaaS و Software House)، منتجات ديجيتال، عقارات، متاجر، وشركات خدمات. **وأي مجال جديد بدون كود جديد.**

### 2.4 ما يجب أن يستطيعه العميل النهائي
- عميل السياحة يتابع حجزه ومكوناته وآخر تحديث.
- ولي الأمر يتابع بروفايل أبنائه، والابن يتابع بروفايله فقط.
- شركة B2B (عميلة لشركة شحن) تنشئ شحنات وتتابعها بعدة مستخدمين.
- المستلم النهائي يتتبع شحنته برقم تتبع.
- أي عميل يتابع تذاكره، عقوده، أقساطه، ومستنداته.

### 2.5 الشكل النهائي

```
Customer
 ↓
Product / Service / Contract
 ↓
Asset / Subscription / Booking / Shipment / Enrollment / Project
 ↓
Entitlement
 ↓
Case → Assignment + Queue → SLA
 ↓
Conversation + Tasks + Work Orders
 ↓
Resolution → Feedback → Analytics
```

---

## 3. المبادئ الحاكمة والممنوعات

### 3.1 المبادئ [محسوم]
1. **Configuration over Code:** اختلاف المجالات = Configuration + Metadata + Capabilities.
2. **ثلاث طبقات:**
   ```
   Configuration  → Templates, Models, Item Types, Fields, Pipelines, SLA, Workflows, Portal, Terminology
   Engines        → Cases, Records, Assets, Entitlements, SLA, Workflow, Scheduling, AI
   Shared Core    → Customers, Users/Teams, Tags, Status, Assignment, Conversations, Tasks, Calendar, Files
   ```
3. **لا CRM داخل CRM:** الخدمة تبني فوق الـ Shared Core ولا تنسخه.
4. **Modular Monolith** بحدود صارمة.
5. **Event-Driven** مع **Transactional Outbox** و **Idempotency**.
6. **Hybrid Schema:** أعمدة لما يُفلتر ويُحسب + `JSONB` للديناميكي مع `schema_version`.
7. **Snapshot للالتزامات:** العقد، SLA الـ Case، جدول الأقساط، المستند الموقع. تعديل الإعدادات لا يغير التاريخ.
8. **AI يعطي Signals والـ Rules تقرر.**
9. **القفل لا يحذف:** تعطيل Feature عليها بيانات = Read-only.
10. **Read Models للتجميع:** شاشات التجميع (My Work، Dashboards) Projections وليست كيانات أصلية جديدة.

### 3.2 الممنوعات [محسوم]
- ممنوع `if industry == ...` أو `if model == B` منتشرة في الكود. النماذج Presets تُترجم إلى Capabilities.
- ممنوع قاعدة Customers مكررة أو كيان Account موازٍ.
- ممنوع نظام Tasks أو Conversations أو Workflow خاص بالخدمة.
- ممنوع تخزين العقد كـ PDF فقط.
- ممنوع أن يتحكم Document Builder في الحسابات أو المنطق.
- ممنوع تعديل عقد موقع (يُستخدم Amendment).
- ممنوع تعديل جدول أقساط تاريخي (يُنشأ Version جديد).
- ممنوع تغيير SLA تاريخية عند تعديل Policy.
- ممنوع اعتماد قرار حساس على AI مباشرة.
- ممنوع نشر Event غير Atomic مع الـ Transaction.
- ممنوع أي Cross-Tenant access.
- ممنوع عمل قيود محاسبية داخل الـ CRM.
- ممنوع إرسال WhatsApp خارج نافذة الـ 24 ساعة بدون Template معتمد.
- ممنوع حذف Payments أو Audit.

---

## 4. المعمارية وحدود الـ Modules

### 4.1 النمط [محسوم]
**Modular Monolith.** ليس Microservices حاليًا، لكن الحدود قابلة للفصل لاحقًا.

**قواعد الحدود:**
- كل Module يملك جداوله. ممنوع Module يكتب في جداول Module آخر.
- القراءة عبر **Public Service Interface**، والتأثير عبر **Events**.
- السيلز لا يستدعي الخدمة مباشرة: يطلق `ContractSigned` والخدمة تستمع.

### 4.2 خريطة الـ Modules

```
ICAN PLATFORM
│
├── platform/                  ← Shared Platform (لكل ICAN)
│   ├── events/ outbox/ queue/
│   ├── workflows/ approvals/
│   ├── audit/ permissions/ feature-flags/
│   ├── files/ numbering/ imports/
│   ├── integrations/ messaging-policy/
│   ├── scheduling/ workspace/ search/
│   ├── localization/ observability/
│
├── core/                      ← Shared Business Core (موجود + توسيع)
│   ├── customers/ (+ contacts, relationships)
│   ├── catalog/   (Products & Services موسع)
│   ├── users/ teams/ tags/
│   ├── tasks/ calendar/ conversations/ notifications/
│
├── sales/                     ← موجود
├── marketing/                 ← موجود
│
├── contracts/                 ← جديد، مشترك
├── documents/                 ← جديد، تعميم Proposal Builder
├── billing-lite/              ← جديد، مشترك
├── suppliers/                 ← جديد، بسيط [لاحقًا في Phase 4]
│
└── service/                   ← Service Operations
    ├── cases/ queues/ sla/
    ├── records/ (records, batches, components, participants, entries)
    ├── assets/ warranty/ entitlements/
    ├── work-orders/ follow-ups/ portfolios/
    ├── knowledge/ feedback/ quality/
    ├── portal/ service-catalog/
    ├── handoff/ ai/ reports/ settings/
```

طبّق نفس الفكرة بما يناسب الـ Stack الفعلي.

---

## 5. المعايير الهندسية العامة

### 5.1 الوقت [محسوم]
- كل الـ Timestamps في الباك إند **UTC**.
- لكل Tenant `timezone`، وللمستخدم Override اختياري.
- الحسابات التي تعتمد على الوقت المحلي (Business Hours، مواعيد الأقساط، "اليوم") تتم بتوقيت الـ Tenant.
- التواريخ بدون وقت (تاريخ استحقاق قسط، تاريخ سفر) تُخزن كـ `DATE` وليس Timestamp.

### 5.2 المال [محسوم]
- ممنوع Float. استخدم `DECIMAL(18,4)` للحسابات و`DECIMAL(18,2)` للمبالغ المعروضة حسب العملة.
- كل مبلغ معه `currency_code` (ISO 4217).
- التقريب يتم في نقطة واحدة موثقة (محرك الأقساط، الإجماليات).

### 5.3 المعرفات
- IDs: UUID (يفضل v7 لترتيب زمني) [افتراضي].
- الأرقام المعروضة للمستخدم (CS-2026-00123) من Numbering Engine (القسم 14)، منفصلة عن الـ ID.

### 5.4 Multi-Tenant Isolation [محسوم]
- `tenant_id` صراحةً على كل جدول أساسي وفرعي حساس.
- Global Scope يطبق تلقائيًا على كل Query.
- Tests آلية تمنع أي Cross-Tenant access.
- الـ Unique Constraints دائمًا مركبة مع `tenant_id`.

### 5.5 Optimistic Concurrency [محسوم]
الكيانات الحساسة لها `version`:
```
UPDATE ... WHERE id = ? AND version = ?
```
التعارض يرجع `409 Conflict`. الكيانات: Case، Work Order، Contract، Payment Schedule، Entitlement، Handoff، Service Record، Asset.

### 5.6 الحذف والأرشفة [محسوم]
| الكيان | السياسة |
|---|---|
| Case | Close / Archive |
| Service Record | Cancel / Archive |
| Contract | Cancel / Terminate |
| Payment / Payment Record | لا يحذف أبدًا (عكس بـ Reversal) |
| Audit / Timeline | Immutable |
| Workflow | Disable / Version |
| Configuration (Types, Fields) | Deactivate، لا حذف لو عليه بيانات |
| Files | Soft delete + Retention |

### 5.7 Retention و Privacy [لاحقًا لكن التصميم يدعمه]
Retention policies، Archive، Anonymization، Customer data export، Privacy requests.

### 5.8 نمو البيانات
الجداول الكبيرة مصممة لتقبل Partitioning لاحقًا (بالـ `tenant_id` أو الزمن): `timeline_events`، `audit_logs`، `workflow_runs`، `webhook_events`، `messages`، `outbox_events`، `record_entries`.

---

# الجزء الثاني: خدمات المنصة المشتركة

## 6. Events, Outbox, Queue

### 6.1 لا Event Sourcing [محسوم]
مصدر الحقيقة = **حالة قاعدة البيانات الحالية**. الـ Events للتكامل، الأوتوميشن، المعالجة غير المتزامنة، التحليلات، الإشعارات.

### 6.2 Transactional Outbox [محسوم]
```
DB Transaction {
  تعديل بيانات الـ Business
  INSERT outbox_event
}
COMMIT
   ↓
Outbox Relay (Worker) → Queue → Consumers
```

### 6.3 Event Contract
```
event_id          UUID
event_name        "service.case.created"
event_version     1
aggregate_type    "case"
aggregate_id
tenant_id
actor             {type: user|portal|system|ai|integration, id}
payload           JSONB
occurred_at
correlation_id    ← يربط كل ما نتج عن طلب واحد
causation_id      ← الحدث الذي سبب هذا الحدث
idempotency_key
```

### 6.4 Event Versioning [محسوم]
لا يُغير Payload قديم. يُنشأ `CaseCreated.v2`، والـ Consumers تدعم الإصدارات حتى يتم الترحيل.

### 6.5 Domain Events ≠ Timeline [محسوم]
```
Domain Event
 ├── Workflow Engine
 ├── SLA Engine
 ├── Notifications
 ├── Realtime (مختارة فقط)
 ├── Analytics Projections
 ├── Audit (عند الحاجة)
 ├── Work Items Projection (My Work)
 └── Timeline Projection (ما يهم المستخدم فقط)
```

### 6.6 Queue Reliability (من Phase 0) [محسوم]
Retries، Exponential Backoff، Max Attempts، Dead Letter Queue، Replay، Timeouts، Idempotency في كل Consumer (جدول `processed_events(consumer, event_id)`)، Poison Message Handling.

### 6.7 Tenant Fairness
Tenant بـ Jobs ضخمة (Import 50,000 شحنة) لا يوقف الباقي: Per-tenant concurrency، Throttling، Priority queues (الرسائل والـ SLA أعلى أولوية من الـ Imports والتقارير).

### 6.8 Scheduled Jobs
Scheduler مركزي لـ: فحص SLA، انتهاء الحجوزات المؤقتة، تذكيرات الأقساط، التجديدات، الـ Follow-ups، انتهاء الصلاحيات والضمانات، الـ Date Triggers. يعتمد على جدول `scheduled_jobs` (due_at، subject، type) وليس Cron لكل حالة.

### 6.9 Realtime
ليس كل Event يصل للفرونت. القائمة المحددة في Event Catalog (القسم 52) بعلامة `realtime`.

---

## 7. Audit Log

### 7.1 Audit ≠ Timeline [محسوم]
- **Timeline:** "أحمد غيّر الحالة إلى Resolved" (للمستخدم).
- **Audit:** سجل أمني وقانوني كامل.

```
audit_logs:
  tenant_id, actor_type, actor_id, request_id, correlation_id,
  ip, user_agent, source (web|api|portal|workflow|integration|ai),
  entity_type, entity_id, action, before JSONB, after JSONB, occurred_at
```
Immutable. لا Update ولا Delete.

### 7.2 Security Audit
login، failed login، permission denied، export، bulk action، integration change، credential change، portal login، impersonation، API key usage، configuration changes.

---

## 8. Permissions

### 8.1 المستويات
```
Module → Record Type → Record → Field → Action
```

### 8.2 النموذج
- **Roles** قابلة للتخصيص لكل Tenant، مع Roles افتراضية: `cs_agent`، `cs_supervisor`، `cs_admin`، `collections_agent`، `technician`، `courier`، `operations`، `quality_reviewer`.
- **Permission Keys** ثابتة في الكود (القسم 53).
- **Record Scope:** own / team / queue / portfolio / all.
- **Field-level:** حقول حساسة (التكلفة، الهامش، الرقم القومي) قابلة للإخفاء حسب الدور.

### 8.3 Portal Permissions
منفصلة تمامًا (القسم 43).

---

## 9. Packages, Feature Flags, Business Models, Limits

### 9.1 التفرقة [محسوم]
- **Platform capability installed:** الكود موجود في النظام.
- **Tenant feature enabled:** مفعّلة لهذا العميل.

### 9.2 ثلاث مستويات
```
Package          ← ما تبيعه ICAN: النماذج والـ Features المسموحة + الحدود
   ↓
Tenant Settings  ← الـ Tenant يشغّل/يقفل من المسموح حسب نشاطه
   ↓
Catalog Item     ← كل منتج مربوط بنموذج مفعّل
```

### 9.3 Core دائمًا مفعّل
Cases، Contacts، Timeline، Conversations، Queues، Assignment، SLA، Saved Replies، CSAT، KB الداخلي.

### 9.4 Business Models → Features [محسوم]
الـ Feature تتفعل لو **أي** نموذج مفعّل يحتاجها:

| Feature | النماذج التي تحتاجها |
|---|---|
| Orders | A |
| Assets, Warranty | B |
| Work Orders | B, H |
| Subscriptions, Renewals | C |
| Entitlements | B, C, D |
| Enrollments, Record Entries (حضور/تقدم) | D |
| Bookings, Components, Required Documents | E |
| Shipments, Batches, Courier Assignment | F |
| Projects, Milestones | G |
| Participants | D, E, F |
| Scheduling & Resources | E, H (و D للجداول) |
| Service Batches | D, E, F |

### 9.5 سلوك التعطيل [محسوم]
| الحالة | السلوك |
|---|---|
| Enabled | كامل |
| Disabled + فيه بيانات | Read-only: ظاهرة ومربوطة، لا إنشاء جديد |
| Disabled + بدون بيانات | تختفي من الـ Sidebar والإعدادات |
| إعادة التفعيل | ترجع كما كانت |

### 9.6 Validation قبل التعطيل
يرجع الـ API قائمة تأثيرات قبل التأكيد:
- منتجات مربوطة بالنموذج (يتوقف بيعها).
- عقود/اشتراكات Active (تكمل لنهايتها بدون تجديد).
- Workflows تعتمد عليه (تتوقف).
- Features مشتركة مع نموذج آخر مفعّل (تبقى).

### 9.7 الحدود والاستهلاك (Limits & Usage)
الباقة تحدد حدودًا: عدد الموظفين، مستخدمي البورتال، الـ Records الشهرية، الرسائل، استهلاك الـ AI، مساحة الملفات، عدد الـ Workflows.
```
package_limits: package_id, limit_key, value
usage_counters: tenant_id, limit_key, period, used
```
عند تجاوز الحد: تحذير عند 80%، ثم منع أو Soft limit حسب نوع الحد [افتراضي: رسائل وAI = منع، Records = Soft].

### 9.8 التنفيذ
```
feature_enabled(tenant, "work_orders")
  = feature في الباقة AND (أي نموذج مفعّل يحتاجها OR مفعّلة يدويًا)
```
Cached، ويُمسح عند تغيير الإعدادات. الباك إند يرسل للفرونت **Capabilities Manifest** يبني منه الـ Sidebar:
```
GET /me/capabilities → { features: [...], models: [...], permissions: [...], terminology: {...} }
```

---

## 10. Custom Fields Engine و Record Entries

### 10.1 Custom Fields
معلومات وصفية يعرّفها الـ Tenant على أي كيان يدعمها: Case، Case Type، Service Record Type، Item Type، Asset، Contact، Customer، Work Order، Component.

```
custom_field_definitions:
  id, tenant_id, entity_type, scope_id (مثلًا record_type_id),
  key, label (i18n), type, options JSONB, validation JSONB,
  required, default_value, visible_in_portal, editable_in_portal,
  filterable, reportable, sensitive, order, group,
  status (active|deprecated), introduced_in_version
```

**الأنواع:** text، long_text، number، decimal، money، date، datetime، boolean، select، multi_select، phone، email، url، file، relation (إلى كيان آخر)، address، user، json.

**التخزين:** في عمود `custom_data JSONB` للكيان، مع `schema_version`.

**Versioning [محسوم]:** كل تعديل على مجموعة الحقول ينتج `schema_version` جديد. السجل يعرف بأي نسخة أُنشئ. الحقول لا تُحذف بل `deprecated`.

### 10.2 الفلترة على الحقول الديناميكية [محسوم]
- الفلترة والترتيب مسموحة فقط على الحقول المعلّمة `filterable`.
- عند تعليم حقل `filterable`، يُنشأ Expression Index بشكل غير متزامن (Job).
- صيغة الـ API:
  ```
  GET /service/records?type=booking&filter[custom.destination][eq]=Sharm
  &filter[custom.nights][gte]=3&sort=custom.travel_date
  ```
- الحقول `reportable` تُنقل لـ Read Models التقارير (القسم 46).

### 10.3 Record Entries (السجلات المتكررة) [محسوم]
بعض البيانات **تتكرر داخل السجل** ولا تصلح كـ Custom Field ولا Timeline:
- حضور الطالب ودرجاته.
- قراءات العداد وزيارات الصيانة الدورية.
- محاولات التوصيل وإثبات الاستلام.
- ساعات العمل على مشروع.

الحل: **Entry Types** يعرّفها الـ Tenant على الـ Record Type:

```
record_entry_types:
  id, tenant_id, record_type_id, key, label (i18n),
  field_schema JSONB, schema_version,
  visible_in_portal, portal_fields,
  aggregation JSONB   ← مثلًا: attendance_rate = count(status=present)/count(*)
  triggers_events     ← يطلق Event عند الإضافة؟

record_entries:
  id, tenant_id, record_id, entry_type_id, occurred_at,
  data JSONB, schema_version, created_by, source
```

**أمثلة:**
| المجال | Entry Type | الحقول |
|---|---|---|
| مدرسة | attendance | date، status (present/absent/late)، note |
| مدرسة | grade | subject، exam، score، max_score |
| صيانة | meter_reading | reading، unit، photo |
| شحن | delivery_attempt | attempt_no، result، reason، proof |
| Software House | time_log | hours، milestone، description |

إضافة Entry تطلق `RecordEntryAdded` → يستطيع Workflow مثلًا إبلاغ ولي الأمر عند الغياب.

---

## 11. Status & Pipeline Engine

### 11.1 التعميم [محسوم]
جدول الحالات الحالي يُعمم:
```
pipelines:          id, tenant_id, entity_type, scope_id, name
pipeline_versions:  id, pipeline_id, version, status (draft|active|retired), published_at
statuses:           id, pipeline_version_id, key, label (i18n), color, order,
                    category (open|pending|in_progress|resolved|closed|cancelled),
                    is_initial, is_terminal, sla_behavior (run|pause|stop),
                    customer_visible, customer_label (i18n)
status_transitions: id, pipeline_version_id, from_status_id, to_status_id,
                    required_permission, required_fields JSONB,
                    conditions JSONB, approval_required, side_effects JSONB
```

- `entity_type`: lead، deal، case، service_record، component، work_order، contract، handoff.
- **Category ثابتة منطقيًا** حتى لو غيّر الـ Tenant الأسماء، فالـ SLA والتقارير تعمل على الـ Category.
- **كل سجل يحمل `pipeline_version_id`** فتعديل الـ Pipeline لا يغير السجلات القديمة.
- **Backward compatibility:** حالات السيلز الحالية تُرحّل كـ Pipeline للـ `lead` بدون كسر الـ Endpoints الحالية.

### 11.2 Transitions
مثال: `In Progress → Resolved` يتطلب `resolution_code` و`resolution_summary`. الانتقال غير المسموح يرجع `CASE_TRANSITION_NOT_ALLOWED`.

### 11.3 Customer-facing Status
كل حالة لها `customer_label`: الحالة الداخلية "Pending Supplier Confirmation" تظهر للعميل "جاري التأكيد".

---

## 12. Assignment Engine, Queues, Portfolios

### 12.1 التعميم [محسوم]
Lead Assignment Rules الحالي يصبح عامًا:
```
target_entity = lead | case | handoff | work_order | service_record | follow_up | customer
```

### 12.2 Team ≠ Queue [محسوم]
- **Team:** مجموعة موظفين تنظيمية.
- **Queue:** طابور عمل له قواعد دخول (Technical، Billing، VIP، Alexandria، Escalations، Shipping Issues). قد يخدمه أكثر من Team.

```
queues: id, tenant_id, name, entity_type, entry_conditions JSONB,
        team_ids, assignment_strategy, sla_policy_id?, business_calendar_id?
```

التدفق: الكيان يدخل Queue (بالقواعد) → الـ Assignment يوزعه على Agent داخل الـ Queue.

### 12.3 Strategies
Manual، Round Robin، Least Loaded، Skill Based، Product Based، Language Based، Region/Zone Based، Customer Tier، Priority Based، Portfolio Owner (العميل له موظف ثابت).

### 12.4 بيانات الموظف
- **الآن:** Skills، Products، Languages، Regions/Zones، Capacity (أقصى حمل لكل نوع كيان).
- **لاحقًا:** Presence، Working Hours/Shifts، Certifications، Vehicle (للمناديب).

```
agent_profiles: user_id, tenant_id, skills[], languages[], regions[], products[],
                capacity JSONB {case: 15, work_order: 6}, is_available
```

### 12.5 Customer Portfolios
توزيع **العملاء أنفسهم** على الموظفين (Customer Success / Account Management):
```
portfolios: id, tenant_id, name, team_id, criteria JSONB (مدينة، شريحة، قيمة)
portfolio_members: portfolio_id, customer_id, owner_user_id, assigned_at
```
مثال: "عملاء الإسكندرية Premium" (800 عميل) موزعين على 4 موظفين. الـ Cases والـ Follow-ups يمكن أن تذهب تلقائيًا لصاحب الـ Portfolio.

---

## 13. Files, Attachments, Required Documents

### 13.1 Shared File System [محسوم]
```
files: id, tenant_id, storage_provider, path, original_name, mime_type, size,
       checksum, uploaded_by, virus_scan_status, created_at
attachments: id, tenant_id, file_id, attachable_type, attachable_id,
             category, visibility (internal|customer), uploaded_via (web|portal|whatsapp|api)
```
الملفات الواردة من WhatsApp تُخزن في نفس النظام وتُربط.

### 13.2 Required Documents
متطلبات مستندات بحالة تشغيلية (باسبور، فيزا، عقد موقع، بطاقة):
```
document_requirements:
  id, tenant_id, subject_type, subject_id, participant_id?,
  document_type, required, status (missing|uploaded|verified|rejected|expired),
  file_id?, expires_at, verified_by, verified_at, rejection_reason, due_at
```
تُنشأ تلقائيًا من إعدادات الـ Item أو Record Type. الناقص يظهر في My Work وفي البورتال، ويطلق Events للتذكير.

---

## 14. Numbering Sequences

```
number_sequences:
  id, tenant_id, entity_type, pattern, next_value, reset_policy (never|yearly|monthly),
  scope (مثلًا لكل Record Type)
```
- Pattern مثال: `CS-{YYYY}-{00000}`، `SHP-{BRANCH}-{000000}`، `BK-{YY}{MM}-{0000}`.
- التخصيص داخل Transaction مع Lock على السطر لمنع التكرار.
- أرقام العقود والفواتير قد يُفضل مصدرها ERP حسب الـ Source of Truth.

---

## 15. Import / Export Engine

### 15.1 Import [محسوم وجوده، Phase 5]
مطلوب لـ: ترحيل عملاء Tenant جديد، رفع B2B لـ 150 شحنة، تسجيل طلاب بداية سنة، رفع وحدات مشروع عقاري.

```
import_jobs: id, tenant_id, entity_type, scope_id, file_id, mapping_id,
             mode (create|upsert), match_key, status, dry_run,
             total, succeeded, failed, error_file_id, created_by
import_mappings: id, tenant_id, entity_type, name, columns JSONB
```
**التدفق:** رفع → Mapping الأعمدة → **Dry Run** (Validation بدون حفظ) → تقرير أخطاء → تنفيذ غير متزامن → ملف أخطاء قابل للتصحيح وإعادة الرفع.
- Upsert بمفتاح (رقم الهاتف، الـ Serial، رقم المرجع).
- يطلق Events لكل سجل (مع Batching حتى لا يغرق الـ Queue).
- يخضع لـ Tenant Fairness.

### 15.2 Export
عبر DataTable الحالي، غير متزامن للأحجام الكبيرة، ومسجل في Security Audit.

---

## 16. Integrations, External References, Webhooks, Public API

### 16.1 Source of Truth Matrix [محسوم وجوده]
وثيقة داخل المشروع تحدد لكل Domain:

| Data | Owner (افتراضي) | ملاحظة |
|---|---|---|
| Customer / Contact | CRM | |
| Case / Service Record | CRM | |
| Contract | CRM | نسخة للـ ERP |
| Payment Schedule | CRM | |
| Invoice | ERP (أو CRM لو لا يوجد ERP) | |
| Payment | ERP / Gateway / CRM | حسب `payments_source` |
| Inventory | ERP | |
| Conversation | Channel provider | |

### 16.2 Integration Platform
```
integrations/: connectors, credentials (مشفرة), mappings, webhooks, sync-jobs,
               external-references, logs
external_references: tenant_id, provider, entity_type, entity_id,
                     external_type, external_id, metadata, last_synced_at
```

### 16.3 Inbound Webhooks [محسوم]
```
Receive → Verify Signature → Store → Deduplicate → Return 200 fast → Async Process
webhook_events: tenant_id, provider, external_event_id, payload, signature_valid,
                received_at, processed_at, status, attempts, error
```

### 16.4 Outbound Webhooks
الـ Tenant يشترك في Events لنظامه الخارجي:
```
webhook_subscriptions: tenant_id, url, secret, events[], api_client_id?, status
webhook_deliveries: subscription_id, event_id, status, attempts, response_code
```
موقعة بـ HMAC، مع Retries.

### 16.5 Public API و API Clients [محسوم وجوده، Phase 5]
نوع رابع من المصادقة بجانب API Password و Bearer و Portal Token:
```
api_clients: id, tenant_id, name, key_hash, scopes[], bound_customer_id?,
             rate_limit, ip_allowlist, status, last_used_at
```
- `bound_customer_id`: لو المفتاح لعميل B2B (مثل شركة ترسل شحنات)، لا يرى إلا بيانات هذا العميل.
- Rate limiting لكل Client.
- كل الاستخدام في Security Audit.

---

## 17. Messaging Policy (WhatsApp وقنوات التواصل)

أي رسالة تخرج من النظام (رد موظف، Workflow، تذكير قسط، AI) تمر بـ **Messaging Policy Layer** واحدة قبل الإرسال.

### 17.1 قواعد WhatsApp [محسوم]
- **داخل نافذة الـ 24 ساعة** (آخر رسالة من العميل): رسالة حرة مسموحة.
- **خارج النافذة:** مسموح فقط بـ **Template معتمد من Meta**. أي أوتوميشن (تذكير، تحديث حالة) يجب أن يُعرّف له Template.
- فئات الـ Templates: Utility (خدمة)، Marketing، Authentication (OTP). الفئة تؤثر في التكلفة والموافقة.

```
message_templates:
  id, tenant_id, channel, provider_template_name, category, language,
  body, variables[], provider_status (pending|approved|rejected|paused),
  quality_rating, last_synced_at
```

### 17.2 الموافقات (Consents)
```
communication_consents:
  tenant_id, customer_id | contact_id | participant_ref, channel,
  purpose (service|marketing), status (opted_in|opted_out), source, updated_at
```
رسائل الخدمة مسموحة افتراضيًا، والتسويق يحتاج Opt-in. أي Opt-out يُحترم فورًا.

### 17.3 تفضيلات وحدود
- **Quiet Hours** لكل Tenant (مثلًا لا رسائل آلية بعد 10 مساءً إلا العاجل).
- **Frequency caps** (لا أكثر من X رسالة آلية للعميل يوميًا).
- **Channel fallback:** WhatsApp فشل → SMS → Email حسب إعداد.
- **Notification Preferences** للموظفين (حسب Event، Channel، Priority، Working Hours) وللعملاء.

### 17.4 نتيجة الفحص
```
MessagingPolicy.evaluate(recipient, channel, content_type)
  → allowed | requires_template | blocked(reason) | deferred(until)
```
الرسائل المؤجلة تذهب للـ Scheduler.

---

## 18. Workflow Engine و Approvals

### 18.1 Shared [محسوم]
Workflow Engine واحد لكل ICAN: Sales، Service، Campaigns، Collections، Follow-ups. ممنوع Engine خاص بالخدمة.

### 18.2 النموذج
```
Trigger → Conditions → Actions (خطوات، قد تتضمن انتظار أو فروع)
```
**Triggers:** Event، Schedule (Cron)، Date-relative (قبل انتهاء العقد بـ 30 يوم)، Manual، Webhook.

**Conditions:** على بيانات الكيان، الحقول المخصصة، العميل، الوقت، نتائج AI (كـ Signals).

**Actions:**
Send message (عبر Messaging Policy)، Change status (عبر Transitions)، Assign / Move to Queue، Add/Remove tag، Create Case، Create Task، Create Work Order، Create Follow-up enrollment، Add Timeline update (customer-visible)، Notify، Escalate، Request Approval، Update field، Pause/Resume SLA، Suspend/Restore Entitlement، Webhook، AI Step، Wait (مدة أو حتى حدث).

### 18.3 Versioning [محسوم]
- كل Workflow له Versions.
- الـ Run الشغال يكمل على النسخة التي بدأ بها.
```
workflows: id, tenant_id, name, module, status, active_version_id
workflow_versions: id, workflow_id, version, definition JSONB, published_at
workflow_runs: id, workflow_version_id, subject_type, subject_id, status,
               current_step, started_at, completed_at, logs JSONB, error, correlation_id
```

### 18.4 الحماية
- Idempotency على مستوى الخطوة (الرسالة لا تُرسل مرتين).
- منع الحلقات: حد أقصى لعمق السلسلة عبر `causation_id`.
- حد أقصى للـ Runs لكل Tenant (Limits).

### 18.5 Approvals [محسوم]
Engine مشترك، ويُستخدم كخطوة في الـ Workflow أو مباشرة من الـ Transitions:
- Single، Sequential، Parallel (الكل أو أي واحد).
- Timeout مع Escalation.
```
approval_requests: id, tenant_id, subject_type, subject_id, policy JSONB, status,
                   requested_by, reason, expires_at
approval_steps: request_id, order, approver_type (user|role|team), approver_id,
                decision, decided_at, comment
```
أمثلة: Refund > 5000 → مدير. تعديل خطة أقساط خارج الحدود → مدير مبيعات. Replacement → فني ثم مالية.

---

## 19. Scheduling & Resource Capacity

الـ Calendar الحالي يعرض المواعيد، لكن لا يدير **السعة**. مطلوب محرك مشترك [محسوم وجوده، Phase 4]:

### 19.1 المفاهيم
- **Resource:** شيء له سعة ووقت: فني، مندوب، غرفة، قاعة، مقاعد كورس، سيارة، عيادة، مقاعد رحلة.
- **Availability:** أوقات العمل والإجازات لكل Resource.
- **Reservation:** حجز سعة، مؤقت (Hold بمدة) أو مؤكد.

```
resources: id, tenant_id, type, name, user_id?, capacity, calendar_id, skills[], zones[], status
resource_calendars: id, tenant_id, working_hours JSONB, holidays, timezone
reservations: id, tenant_id, resource_id?, item_instance_id?, subject_type, subject_id,
              starts_at, ends_at, quantity, status (hold|confirmed|released|expired),
              hold_expires_at, created_by
```

### 19.2 الاستخدامات
| الحالة | الـ Resource |
|---|---|
| زيارة فني | الفني (Slot زمني) |
| كورس | مقاعد الدورة (سعة عددية) |
| رحلة جماعية | مقاعد الـ Trip Group |
| عيادة | الطبيب + الغرفة |
| وحدة عقارية | الوحدة نفسها (Item Instance، سعة = 1) |

### 19.3 الحجز المؤقت (Hold) [محسوم]
- وحدة عقارية أو مقعد يُحجز مؤقتًا لمدة (مثلًا 7 أيام) مع `hold_expires_at`.
- الـ Scheduler يحرر الحجز تلقائيًا عند الانتهاء ويطلق `ReservationExpired`.
- التأكيد يحوّله `confirmed`.
- **منع الحجز المزدوج:** Constraint أو Lock على (resource، الفترة) أو (item_instance) داخل Transaction.

### 19.4 Slots API
```
GET /scheduling/availability?resource_type=technician&skill=ac&zone=alex&date=2026-10-05
→ [{resource_id, starts_at, ends_at}]
```

---

## 20. Workspace Engine و My Work

### 20.1 Workspace [محسوم]
كل شاشة عمل يومية (Service Center، Shipping Ops، Tourism Ops) تتكون من:
```
Views + Queues + Filters + Saved Views + Bulk Actions + KPIs (counters)
```
```
saved_views: id, tenant_id, owner_type (user|team|tenant), entity_type,
             name, filters JSONB, columns JSONB, sort, is_default
workspace_definitions: id, tenant_id, key, sections JSONB (views + counters)
```
الـ Workspaces الافتراضية تأتي من Industry Templates.

**أمثلة:**
- **Service Center:** My Cases، Team Queue، Unassigned، Waiting Customer، Waiting Internal، SLA At Risk، SLA Breached، Escalated، Follow-ups Today، Reopened، Resolved Today.
- **Shipping:** Incoming، Unassigned، Pickup، In Transit، Out for Delivery، Failed، Returned، Delivered.
- **Tourism:** Upcoming Trips، Pending Confirmation، Missing Documents، Supplier Pending، Traveler Actions.

### 20.2 My Work = Read Model [محسوم]
شاشة موحدة للموظف تجمع كل ما هو مطلوب منه. **ليست كيانًا جديدًا ولا نظام Tasks ثانٍ**، بل Projection:

```
work_items (projection):
  tenant_id, user_id | team_id | queue_id,
  source_type (case|task|work_order|approval|document_requirement|component|follow_up_step),
  source_id, title, due_at, priority, sla_state, customer_id, status, updated_at
```
تتحدث من الـ Events. الضغط على العنصر يفتح الكيان الأصلي. لو الـ Projection فسد، يُعاد بناؤه من المصادر.

---

## 21. Search

### 21.1 البداية [افتراضي]
PostgreSQL: Indexes، `pg_trgm`، Full Text Search (مع دعم العربية: Normalization للألف والياء والتاء المربوطة).

### 21.2 Search Contract
واجهة موحدة حتى يمكن الانتقال لـ OpenSearch/Elasticsearch لاحقًا بدون تغيير الـ API.

### 21.3 Global Search
يشمل: Customer، Contact، Case، Asset (Serial)، Service Record (رقم المرجع، رقم التتبع)، Booking، Shipment، Subscription، Contract، Payment Schedule، Conversation. مع احترام الصلاحيات.

---

## 22. Observability و Operations Dashboard

### 22.1 من Phase 0 [محسوم]
كل Request/Job/Event يحمل: `request_id`، `correlation_id`، `event_id`، `job_id`، `tenant_id`.
Logs منظمة (JSON)، Metrics، Traces.

### 22.2 Operations Dashboard (Admin فقط)
Queue Lag، Failed Jobs، DLQ، Outbox backlog، Webhook failures، Integration failures، Provider errors (WhatsApp)، Realtime status، SLA scheduler health، أبطأ Endpoints.

---

## 23. Localization (تعدد اللغات)

### 23.1 [محسوم]
- كل Label يعرّفه الـ Tenant (Case Types، Statuses، Fields، Record Types، Terminology، Portal) يُخزن كـ:
  ```json
  { "ar": "حجز", "en": "Booking" }
  ```
- اللغة الافتراضية لكل Tenant + لغة المستخدم + لغة العميل (للرسائل والبورتال).
- Templates الرسائل لها نسخة لكل لغة.
- رسائل أخطاء الـ API: `code` ثابت + `message` مترجم.

### 23.2 Terminology
الـ Tenant يعيد تسمية الكيانات الأساسية:
```
Customer → عميل / طالب / مسافر / مشترك / شركة
Case → تذكرة / طلب / شكوى
Service Record → حجز / شحنة / تسجيل / اشتراك / مشروع / وحدة
Service Batch → رحلة جماعية / مانيفست / دفعة / فصل
```
الـ Terminology جزء من الـ Capabilities Manifest.

---

# الجزء الثالث: الـ Business Core

## 24. نموذج الهوية: Customer, Contact, Participant

### 24.1 Customer [محسوم]
**Master Record.** لا يوجد Account موازٍ.
```
customers (موجود) + type: individual | organization
```
قد يكون: شخصًا، شركة، ولي أمر، جهة متعاقدة. هو **الطرف المتعاقد أو الدافع**.

### 24.2 Contact [محسوم]
شخص له **علاقة دائمة** بالـ Customer:
```
contacts: id, tenant_id, customer_id, name, phone, email, role_id,
          is_primary, date_of_birth?, national_id? (sensitive), custom_data, status
contact_roles: id, tenant_id, key, label (i18n)
contact_relationships: id, tenant_id, from_contact_id, to_contact_id, relation_type
```
- العميل الفرد: Customer + Contact أساسي يمثله (يُنشأ تلقائيًا).
- Relation types قابلة للتخصيص: `guardian_of`، `manager_of`، `spouse_of`، `employee_of`.

أمثلة:
```
Customer: شركة ABC           Customer: ولي الأمر (individual)
 ├── CEO                      ├── Contact: ولي الأمر نفسه (primary)
 ├── Accountant               ├── Contact: الابن الأول (Student) ← guardian_of
 └── Operations Manager       └── Contact: الابن الثاني (Student) ← guardian_of
```

### 24.3 Participant [محسوم]
شخص **مشارك في Service Record معين** (Traveler، Recipient، Student، Sender، Beneficiary). قد لا يكون Contact:
```
service_record_participants:
  id, tenant_id, record_id, role, contact_id NULL,
  person_snapshot JSONB   ← {name, phone, email, address, national_id, passport_no, ...}
  portal_access (none|tracking|full)
```
- المستلم في الشحن: `contact_id = NULL` + بياناته في الـ Snapshot. **لا يتحول Customer.**
- الطالب: `contact_id` مملوء (Contact دائم).
- المسافر المرافق: قد يكون Contact أو لا.
- **Promote to Contact:** عملية اختيارية تحول Participant متكرر إلى Contact.
- `person_snapshot` يحفظ البيانات وقت الخدمة حتى لو تغيرت بيانات الـ Contact لاحقًا.

### 24.4 Customer Drawer [محسوم]
تبويب **Service** في الـ Drawer الحالي يعرض: Open/Closed Cases، Service Records، Assets، Contracts، Subscriptions، Warranty، Entitlements، Work Orders، Payment Schedules، Required Documents، Feedback، Service History، صاحب الـ Portfolio.

### 24.5 دمج العملاء المكررين
```
POST /customers/{id}/merge { into: other_id }
```
- ينقل كل المراجع (Cases، Records، Contracts، Conversations، Schedules) للعميل الباقي.
- العميل المدموج يحتفظ بـ `merged_into_customer_id` (لتوجيه الروابط القديمة).
- عملية مُراجَعة (Audit) وقابلة للعرض لكن غير قابلة للتراجع التلقائي [افتراضي].
- يطلق `CustomerMerged` لتحديث الـ Projections والتكاملات.

---

## 25. الكتالوج: Item Types و Capabilities

### 25.1 القاعدة [محسوم]
لا Catalog جديد. يُوسَّع **Products & Services** الحالي. البيانات الموجودة تأخذ Default:
`kind = product|service` (حسب الموجود)، `service_model = A`، `fulfillment_config = {}`.

### 25.2 الهيكل
```
Capabilities Registry (في الكود — محدودة، لكل واحدة Contract)
        ↓ الـ Tenant يختار منها
Item Type (يعرّفه الـ Tenant: "دواء"، "تكييف"، "وحدة سكنية"، "باقة سياحية")
        ↓
Item (المنتج/الخدمة الفعلي بسعره)
        ↓ عند التوفير/البيع
Item Instance (القطعة: Serial، Batch، تاريخ صلاحية، الوحدة A-305)
        ↓ عند الـ Fulfillment (إن لزم)
Asset / Subscription / Booking / Enrollment / ...
```
ليس كل Item Instance يصبح Asset (دواء مباع لا يصبح Asset).

### 25.3 Kind
| Kind | المعنى | مثال |
|---|---|---|
| product | شيء يُسلَّم | تكييف، دواء، رخصة |
| service | شيء يُنفَّذ | تركيب، رحلة، استشارة |
| plan | حق في خدمة لفترة | ضمان ممتد، عقد صيانة، دعم Premium |
| bundle | تركيبة | باقة شاملة |

### 25.4 Capability vs Custom Field [محسوم]
- **Capability** = صفة لها **سلوك** (تنبيه، Unique، توليد جدول، إنشاء كيان). يعرّفها المطورون.
- **Custom Field** = معلومة وصفية فقط. يعرّفها الـ Tenant.

القاعدة: لو النظام يحتاج أن **يفعل** شيئًا بالمعلومة → Capability. لو فقط **يعرضها ويفلترها** → Custom Field.

### 25.5 Capability Contract [محسوم]
كل Capability معرفة برمجيًا بـ:
```
code            warranty
version         1
applies_to      product | service | plan | both
config_schema   JSON Schema لإعداداتها على الـ Item Type / Item
instance_schema JSON Schema لبياناتها على الـ Instance (إن وجد)
validation      قواعد إضافية
runtime_hooks   onSale, onFulfill, onCancel, onExpire ...
events          الأحداث التي تطلقها
permissions     الصلاحيات التي تضيفها
ui_metadata     كيف تُعرض في الإعدادات
migration       كيف تُرحّل الإعدادات بين الإصدارات
depends_on      Capabilities أخرى مطلوبة
```
التسمية: `warranty@v1`، `serial_tracking@v1`، `recurrence@v1`.

### 25.6 مكتبة الـ Capabilities

**للمنتجات:**
| Code | الإعدادات | السلوك |
|---|---|---|
| `units` | وحدة أساسية + وحدات بديلة ومعامل تحويل (علبة = 10 شرايط) | سعر وباركود لكل وحدة، تحويل تلقائي |
| `barcode` | النوع، على مستوى الوحدة | بحث وبيع بالمسح |
| `serial_tracking` | إجباري؟ الصيغة (Regex) | Unique لكل Tenant، يُربط بـ Asset وضمان |
| `unique_unit` | الأبعاد (مشروع/مبنى/دور/رقم) | كل Instance قطعة فريدة (عقارات، سيارات) |
| `availability` | مدة الحجز المؤقت الافتراضية | available / reserved / sold عبر Reservations |
| `batch_lot` | | تتبع الدفعة |
| `expiry` | على الـ Batch أو القطعة، التنبيه قبل X يوم | تنبيهات، منع بيع المنتهي |
| `variants` | الأبعاد (مقاس، لون) | Items فرعية |
| `inventory` | | [لاحقًا — غالبًا من ERP] |
| `digital_delivery` | License Key / رابط / صلاحية الرابط | تسليم تلقائي بعد البيع |

**للخدمات:**
| Code | الإعدادات | السلوك |
|---|---|---|
| `scheduling` | محتاج ميعاد؟ المدة، نوع الـ Resource | Reservation + Calendar |
| `milestones` | Template المراحل والتسليمات | Project بمراحل |
| `capacity` | min/max، نوع السعة | Reservations على مقاعد |
| `participants` | الأدوار، min/max، البيانات المطلوبة لكل مشارك | Participants على الـ Record |
| `onsite` | المهارات، المدة المتوقعة | Work Order لفني |
| `components` | أنواع المكونات المسموحة | Components على الـ Record |
| `required_documents` | أنواع المستندات لكل مشارك/سجل | Document Requirements |
| `usage_metering` | وحدة الاستهلاك | [لاحقًا] |
| `tracking` | Pipeline المراحل، المدة المتوقعة | Shipment Milestones |

**مشتركة:**
| Code | الإعدادات |
|---|---|
| `warranty` | المدة، التغطية (parts/labor)، يبدأ من (sale/installation/delivery)، قابل للتمديد |
| `recurrence` | `every N unit` (day/week/month/year)، تجديد تلقائي، فترة سماح، تنبيه قبل التجديد |
| `entitlements` | قوالب الحقوق (القسم 35) |
| `installments` | خطط السداد المسموحة (القسم 29) |

**صيغة التكرار [محسوم]:** `every N unit` وليس Enum ثابت. يومي `1 day`، أسبوعي `1 week`، شهري `1 month`، ربع سنوي `3 month`، كل 3 سنوات `3 year`.

### 25.7 Item Type
```
item_types:
  id, tenant_id, name (i18n), kind, service_model_preset,
  capabilities JSONB   ← [{code: "expiry", version: 1, config: {alert_days: 60}}, ...]
  field_schema_id, record_type_id?, default_case_types[], status
```
أمثلة:
```
صيدلية ← "دواء":           units, barcode, batch_lot, expiry(60)
وكيل أجهزة ← "تكييف":       serial_tracking, barcode, warranty(24m from installation), installments
Software House ← "تطبيق":   milestones, warranty(6m), installments(milestone_based)
صيانة ← "زيارة":            scheduling, onsite, warranty(3m)
SaaS ← "اشتراك":            recurrence(1 month|1 year), entitlements, digital_delivery
عقارات ← "وحدة سكنية":      unique_unit, availability(7d), warranty(12m finishing), installments
سياحة ← "باقة":             scheduling, participants, components, required_documents, capacity
تعليم ← "سنة دراسية":        participants(student), recurrence?, entitlements, installments
شحن ← "شحنة":              tracking, participants(sender, recipient)
```

### 25.8 طبقات بيانات الـ Item
```
1. Core (أعمدة):   name (i18n), sku, category_id, item_type_id, kind, service_model,
                   price, currency, tax_id, status, media, description
2. Capability values (JSONB): قيم الـ Capabilities على مستوى الـ Item (تتجاوز الـ Type)
3. Fulfillment config (JSONB): ماذا يحدث عند البيع
4. Entitlement templates: الحقوق
5. Custom data (JSONB) + schema_version
+ Relations: الخدمات المرفقة
+ Units: الوحدات والأسعار
```

### 25.9 Fulfillment Config
```json
{
  "creates": "asset | subscription | booking | enrollment | shipment | project | order | work_order | none",
  "record_type_id": "...",
  "asset_type": "air_conditioner",
  "default_team_id": "...",
  "default_queue_id": "...",
  "onboarding_workflow_id": "...",
  "allowed_case_types": ["..."],
  "kb_articles": ["..."],
  "portal_visible": true
}
```
**Validation:** JSON Schema حسب الـ Capabilities والنموذج. لا يُحفظ منتج بنموذج B بدون إعدادات ضمان، ولا حجز بدون تحديد التاريخ.

### 25.10 الخدمات المرفقة (Relations) [محسوم]
```
catalog_item_relations:
  parent_item_id, child_item_id, inclusion (included|optional),
  price_override, quantity, auto_add
```
```
تكييف 1.5 حصان  (Product → Asset)
├── تركيب مجاني       (Service, included) → Work Order
├── ضمان سنتين         (Plan, included)    → Warranty + Entitlement
└── عقد صيانة سنوي     (Plan, optional)    → Subscription + Entitlement (4 زيارات)

برنامج ERP  (Product → Subscription)
├── Onboarding          (Service, included) → Project
├── دعم Standard        (Plan, included)    → Entitlement (SLA 4h)
└── دعم Premium         (Plan, optional)    → Entitlement (SLA 30m)

باقة شرم 5 أيام  (Service → Booking)
├── تأمين سفر           (Plan, optional)
└── انتقالات المطار     (Service, included) → Component
```

### 25.11 Units
```
item_units: id, item_id, unit_name (i18n), factor, barcode, price, is_base
```

### 25.12 Item Instances
```
item_instances:
  id, tenant_id, item_id, serial_number?, batch_no?, expiry_date?,
  unit_attributes JSONB (مبنى/دور/رقم للوحدات), availability_status,
  sold_on_contract_line_id?, asset_id?, status
UNIQUE(tenant_id, item_id, serial_number)
```

---

## 26. Service Models (A–H)

### 26.1 التعريف [محسوم]
**النماذج Presets فقط.** اختيار نموذج على Item Type يفعّل Capabilities افتراضية، والـ Tenant يعدّل. الكود يتعامل مع **Capabilities**، لا مع حرف النموذج.

| كود | النموذج | يفعّل افتراضيًا | الكيان الناتج | أمثلة |
|---|---|---|---|---|
| **A** | بيع لمرة واحدة | — | Order + Cases | متاجر، منتجات ديجيتال |
| **B** | منتج + ما بعد البيع | serial/unique_unit, warranty, entitlements | Asset + Warranty + Entitlement | أجهزة، تكييف، سيارات، ماكينات، POS، وحدات عقارية |
| **C** | اشتراك | recurrence, entitlements | Subscription | SaaS، جيم، إنترنت، عقود صيانة |
| **D** | برنامج / تسجيل | participants, capacity, entitlements | Enrollment + Entries | مدارس، سناتر، كورسات |
| **E** | حجز | scheduling, participants, components, required_documents | Booking | سياحة، فنادق، عيادات، فعاليات |
| **F** | توصيل | tracking, participants | Shipment (+ Batch) | شحن، توصيل |
| **G** | مشروع | milestones | Project | Software House، وكالات، مقاولات |
| **H** | خدمة عند الطلب | onsite, scheduling | Case → Work Order | صيانة، نظافة، تركيبات |

**Cases موجودة في كل النماذج.**

### 26.2 التركيبات
| الشركة | النماذج |
|---|---|
| شركة سوفتوير | C + G + H |
| وكيل أجهزة | A + B + C + H |
| شركة سياحة | E (+ A) |
| مدرسة | D + C |
| سنتر كورسات | D (+ A) |
| شركة شحن | F (+ C) |
| شركة صيانة | H + C |
| متجر ديجيتال | A (+ C) |
| عقارات | B + Service Record متابعة + Billing Lite |

---

## 27. Contracts

### 27.1 Shared Module [محسوم]
يُستخدم من: Sales، Service، Billing، Assets، Subscriptions، Projects، Maintenance.

### 27.2 Contract Types (Dynamic)
Sales Contract، Maintenance Contract، Support Contract، Subscription Contract، Real Estate Contract، Service Agreement، Project Contract، Order (عقد مبسط لنموذج A).

لكل Type: Pipeline، Document Template، الحقول، هل يحتاج توقيع، سياسة التجديد.

### 27.3 الكيان
```
contracts:
  id, tenant_id, contract_number, type_id, customer_id, deal_id?,
  start_date, end_date, status_id, pipeline_version_id,
  currency, total_value, renewal_type (none|manual|auto),
  payment_schedule_id?, signed_at, activated_at,
  effective_version_id, parent_contract_id? (renewal/amendment),
  created_by, version
contract_versions:     contract_id, version, snapshot JSONB, status, created_at
contract_parties:      contract_id, party_type (customer|contact|company|guarantor), party_id, role
contract_items:        contract_id, item_id, item_instance_id?, quantity, unit_id,
                       unit_price, discount, total, payment_plan_id?, fulfillment_status
contract_assets:       contract_id, asset_id
contract_entitlements: contract_id, entitlement_id
contract_signatures:   contract_id, version, signer_type, signer_ref, signed_at, method, ip, reference
contract_documents:    contract_id, document_id
contract_amendments:   id, contract_id, number, changes JSONB, status, effective_date, signed_at
```

### 27.4 Versioning [محسوم]
- قبل التوقيع: V1، V2، V3...
- النسخة الموقعة **Immutable Snapshot**.
- بعد التوقيع: **Amendment** (إضافة Asset، تغيير سعر، مد فترة، إضافة Entitlement). لا تعديل مباشر.
- التجديد: **عقد جديد** مرتبط بالأصل (`parent_contract_id`).

### 27.5 Statuses (افتراضية، قابلة للتخصيص)
Draft → Pending Approval → Approved → Sent → Partially Signed → Signed → Active → Expiring → Expired / Terminated / Cancelled / Renewed.

---

## 28. Document Builder

### 28.1 تعميم الـ Proposal Builder [محسوم]
```
Template → Version → Section → Block
```
يصبح **Document Builder Engine** لكل المستندات.

### 28.2 الفئات والأنواع
- **Agreement:** Contract، Quotation، Proposal.
- **Financial:** Invoice Print، Receipt، Payment Schedule Statement.
- **Fulfillment:** Delivery Note، Handover Certificate، Work Completion، Proof of Delivery.
- **Certificates:** Warranty Certificate، Service Certificate، Course Certificate.

### 28.3 Business Logic ≠ Template [محسوم]
الـ Builder مسؤول عن: Presentation، Layout، Sections، Blocks، Branding، Variables، PDF.
**ليس** مسؤولًا عن الحسابات. حذف Block من الـ PDF لا يلغي Entitlement.

### 28.4 Smart Blocks
CustomerInfo، CompanyInfo، ContractInfo، ContractItems، PaymentSchedule، InvoiceLines، Totals، AssetDetails، Warranty، Participants، Components، Signature، HandoverChecklist، Terms.

### 28.5 Variables Registry
`customer.*`، `company.*`، `contract.*`، `contract.items.*`، `invoice.*`، `asset.*`، `warranty.*`، `payment_schedule.*`، `service_record.*`، `participants.*`، `case.*`. كل Document Type يرى فقط المسموح له.

### 28.6 Snapshot و Signatures
- عند الاعتماد أو التوقيع: Snapshot للبيانات + الـ PDF.
- الموقعون: Company Signatory، Customer، Witness، Technician، Receiver.
- الحقول: signed_by، signed_at، method (drawn|otp|upload|external)، ip، reference.

### 28.7 Delivery و Handover ككيانات [محسوم]
```
deliveries: id, tenant_id, subject_type, subject_id, delivered_at, received_by, status
delivery_lines: delivery_id, item_id, item_instance_id?, quantity
handovers: id, tenant_id, asset_id | record_id, scheduled_at, completed_at, status
handover_items / handover_checklist
```
المستند يُولّد منها، وليست هي مجرد PDF.

---

## 29. Billing Lite والأقساط

### 29.1 حدود المسؤولية [محسوم]
| الجزء | المسؤول |
|---|---|
| الاتفاق التجاري: الخطة، الجدول، المواعيد | **CRM (Billing Lite)** |
| المتابعة: تذكير، تأخير، تحصيل، بورتال | **CRM (Billing Lite)** |
| المحاسبة: فواتير رسمية، إيصالات محاسبية، قيود، ذمم، ضرائب، COGS | **ERP** |

**Billing Lite ليس نظام محاسبة.** Module مشترك: السيلز ينشئ الجدول، الخدمة تتابعه، البورتال يعرضه.

### 29.2 مصدر المدفوعات [محسوم]
```
tenant_settings.payments_source = crm | erp | gateway
```
| الوضع | التشغيل |
|---|---|
| crm | تسجيل يدوي للدفعة + صورة إيصال |
| erp | الـ CRM يرسل العقد والجدول، الـ ERP يرجع حالة الدفع (Webhook) |
| gateway | دفع من البورتال (Paymob / Fawry / غيرهما) → تسجيل تلقائي → إرسال للـ ERP إن وجد |

ممكن الجمع: gateway للدفع + erp للمحاسبة.

### 29.3 Recurrence مقابل Installments
| | اشتراك | أقساط |
|---|---|---|
| المبلغ الكلي | مفتوح | ثابت ومعروف |
| بعد آخر دفعة | الخدمة تقف لو لم تُجدد | العميل يملك الشيء |
| الكيان | Subscription + Billing cycles | Payment Schedule |

ممكن الاثنين معًا: اشتراك سنوي مدفوع على 4 أقساط.

### 29.4 تعريف الخطة: قواعد لا مبالغ [محسوم]
الخطة تُعرّف كقواعد لأنها تُطبق على أسعار مختلفة:

```json
{
  "name": {"ar": "8 سنين ربع سنوي", "en": "8 Years Quarterly"},
  "type": "installments",
  "components": [
    { "type": "down_payment", "basis": "percent", "value": 10, "due": "on_contract" },
    { "type": "installments", "basis": "remaining", "count": 32,
      "every": "3 month", "first_due": "+3 month" },
    { "type": "delivery", "basis": "percent", "value": 5, "due": "on_delivery" },
    { "type": "maintenance", "basis": "percent", "value": 8,
      "due": "-12 month from delivery", "outside_price": true }
  ],
  "price_adjustment": { "type": "percent", "value": 15 },
  "interest": { "type": "none", "value": 0 },
  "admin_fee": { "type": "fixed", "value": 0 },
  "grace_days": 5,
  "late_fee": { "type": "percent", "value": 1, "per": "month", "cap_percent": 10 },
  "early_payoff": { "allowed": true, "discount_percent": 0 },
  "schedule_mode": "equal",
  "rounding": { "to": 100, "remainder_on": "last" },
  "limits": { "min_down_percent": 5, "max_count": 40, "max_discount_percent": 5 },
  "reservation_fee": { "amount": 50000, "deducted_from": "down_payment", "refundable": false }
}
```

**تفاصيل الحقول:**
- `basis`: `percent` | `fixed` | `remaining` (ما تبقى بعد باقي المكونات داخل السعر).
- `due`: `on_contract` | `on_delivery` | `+N unit` (من التعاقد) | `-N unit from delivery` | `on_milestone:<key>` | تاريخ ثابت.
- `outside_price`: مبلغ إضافي خارج سعر البند (وديعة صيانة، رسوم نادي).
- `schedule_mode`: `equal` (متساوية) | `custom` (مبالغ/تواريخ يدوية) | `milestone_based` (دفعات مع تسليم المراحل — للمشاريع).
- `interest`: `none` | `flat` (نسبة على المبلغ المقسط كله) | `percent_per_period` (على الرصيد المتبقي).
- أنواع سطور الجدول: `reservation`، `down`، `installment`، `delivery`، `maintenance`، `milestone`، `fee`، `custom` (الأقساط في العقارات غير متساوية).

### 29.5 أين تعيش الخطة [محسوم]
```
Tenant Settings                ← تعريف الخطط (مكتبة): payment_plans
   ↓ ربط
Item Type / Category / Project ← الخطط المتاحة + الافتراضية + price_adjustment لكل خطة
   ↓
Item                           ← استثناءات فقط (إخفاء خطة لوحدة معينة)
   ↓
Deal                           ← الخطة المختارة + تعديلات السيلز (plan_overrides)
   ↓
Contract                       ← Snapshot نهائي مقفول
```
**الأولوية:** الأقرب للصفقة يكسب: Deal ← Item ← Project/Category/Item Type ← Tenant.
**المنتج لا يحمل تفاصيل الخطة**، فقط يشير إليها. تعديل خطة لـ 400 وحدة = تعديل واحد.

```
payment_plan_assignments:
  id, tenant_id, scope_type (item_type|category|project|item), scope_id,
  payment_plan_id, is_default, price_adjustment JSONB, is_excluded, valid_from, valid_to
```
**Project:** في العقارات الخطط تختلف حسب المشروع. المشروع يمثّل كـ Category أو Custom grouping على الـ Items [افتراضي: Category من نوع project].

### 29.6 محرك الحساب (Preview Engine) [محسوم]
**الخوارزمية:**
1. السعر الأساسي للبند (مع الوحدة والكمية).
2. تطبيق `price_adjustment` للخطة → السعر النهائي.
3. تطبيق الخصومات (في حدود `limits`).
4. حساب المكونات ذات القيمة الثابتة أو النسبة (`down`، `delivery`...).
5. `remaining` = السعر النهائي − مجموع المكونات داخل السعر.
6. تقسيم `remaining` على `count` حسب `schedule_mode`.
7. تطبيق الفائدة إن وجدت.
8. التقريب حسب `rounding` وتحميل الفرق على `remainder_on`.
9. حساب التواريخ بتقويم الـ Tenant (نهاية الشهر: 31 يناير + شهر = 28/29 فبراير) [محسوم].
10. إضافة المكونات `outside_price`.
11. ترتيب السطور بالتاريخ.
12. التحقق: مجموع السطور داخل السعر = السعر النهائي بالضبط.

**مثال:** وحدة 3,000,000 جنيه، خطة "8 سنين" (بدون price_adjustment للتبسيط)، تعاقد 2026-10-01، استلام 2029-10-01:
```
سعر الوحدة               3,000,000
المقدم 10%               − 300,000   (منه 50,000 رسوم الحجز)
دفعة الاستلام 5%         − 150,000
الباقي                    2,550,000 ÷ 32 = 79,687.5
تقريب لأقرب 100          → 79,700 × 31 = 2,470,700
آخر قسط                  → 79,300
وديعة صيانة 8% (إضافي)    240,000
الإجمالي                 3,240,000
```
| # | النوع | التاريخ | المبلغ |
|---|---|---|---|
| 0 | down (منه 50,000 حجز) | 2026-10-01 | 300,000 |
| 1 | installment | 2027-01-01 | 79,700 |
| 2 | installment | 2027-04-01 | 79,700 |
| … | … | … | … |
| — | maintenance | 2028-10-01 | 240,000 |
| — | delivery | 2029-10-01 | 150,000 |
| 32 | installment (الأخير) | 2034-07-01 | 79,300 |

```
POST /billing/payment-plans/{id}/preview
{ item_id, item_instance_id?, quantity, price?, contract_date, delivery_date?, overrides? }
→ { final_price, lines: [...], totals: {in_price, outside_price, grand_total}, warnings: [] }
```
الـ Preview **لا يحفظ شيئًا**. مغطى بـ Tests حسابية شاملة (القسم 56).

### 29.7 التفاوض في الـ Deal [محسوم]
```
deals + item_instance_id, payment_plan_id, plan_overrides JSONB,
        final_price, schedule_preview JSONB, approval_status
```
- تعديل داخل `limits` (مقدم 7% بدل 10%): مباشر، والجدول يُعاد حسابه فورًا.
- تعديل خارج `limits`: **Approval** (مدير مبيعات) قبل إرسال العرض للعميل.
- العرض يُرسل PDF (Document Builder) أو WhatsApp.

### 29.8 الحجز المؤقت [محسوم]
- رسوم الحجز → `Reservation` بحالة `hold` على الـ Item Instance مع `hold_expires_at` (مثلًا 7 أيام).
- الوحدة `reserved`. انتهاء المدة بدون عقد → ترجع `available` تلقائيًا + `ReservationExpired`.
- رسوم الحجز تُسجل كسطر `reservation` وتُخصم من المقدم عند التعاقد (حسب `deducted_from`).

### 29.9 التعاقد والتجميد
- توقيع العقد → Snapshot: الخطة + السعر + الجدول (`plan_snapshot`).
- الـ Deal يحمل **المعاينة القابلة للتعديل**، والعقد يحمل **الجدول المقفول**.
- لحظة `Deal = Won`: **[افتراضي] عند توقيع العقد**، مع إعداد لكل Tenant: `won_on = contract_signed | down_payment_paid`.
- الوحدة `sold` عند Won.

### 29.10 الجداول
```
payment_plans: id, tenant_id, name (i18n), type, config JSONB, status, version
payment_schedules:
  id, tenant_id, contract_id, customer_id, asset_id?, subscription_id?,
  plan_snapshot JSONB, currency, total_in_price, total_outside_price,
  version, status (active|rescheduled|transferred|cancelled|completed),
  replaces_schedule_id?
payment_schedule_lines:
  id, schedule_id, seq, line_type, due_date, amount, paid_amount,
  status (upcoming|due|partially_paid|paid|overdue|waived|cancelled),
  late_fee_amount, milestone_key?, external_ref
payment_records:
  id, tenant_id, schedule_id, amount, currency, paid_at, method,
  source (manual|erp|gateway), receipt_file_id, external_ref, recorded_by,
  status (confirmed|pending|reversed), reversal_of_id?
payment_allocations: payment_record_id, line_id, amount
```
**Allocation [افتراضي]:** الدفعة توزع على السطور الأقدم استحقاقًا أولًا (الغرامات ثم الأصل)، قابل للتخصيص.

### 29.11 الحالات الخاصة [محسوم]
| الحالة | السلوك |
|---|---|
| **إعادة جدولة** | جدول جديد `version+1` و`replaces_schedule_id`. القديم يُحفظ `rescheduled`. تحتاج Approval |
| **تنازل / إعادة بيع** | نقل الـ Asset والجدول المتبقي لعميل جديد بجدول جديد، القديم `transferred`، مع Amendment للعقد |
| **إلغاء** | حساب المسترد حسب شروط العقد، الجدول `cancelled`، الوحدة ترجع `available` |
| **تعجيل السداد** | حساب المتبقي مع خصم الخطة، سطر تسوية |
| **دفعة جزئية** | `partially_paid` |
| **إعفاء** | `waived` بصلاحية + Audit |
| **عكس دفعة** | `payment_record` عكسي، لا حذف |

### 29.12 الغرامات
تُحسب بـ Job يومي حسب `late_fee` و`grace_days`، وتُضاف في `late_fee_amount` مع حد أقصى. إعفاء الغرامة بصلاحية.

### 29.13 التحصيل (Collections)
Events: `InstallmentUpcoming`، `InstallmentDue`، `InstallmentPaid`، `InstallmentOverdue`، `ScheduleCompleted`.
Workflows افتراضية (قابلة للتعديل):
```
قبل الميعاد بـ 7 أيام   → تذكير WhatsApp (Template)
يوم الاستحقاق           → تذكير + رابط دفع (لو gateway)
تأخير 15 يوم            → Case نوع Collection في Queue التحصيل
تأخير 60 يوم            → تصعيد + غرامة
(اختياري) تأخير X يوم  → Suspend Entitlements
```
Workspace التحصيل: مستحق اليوم، متأخر حسب الفترة (Aging buckets)، وعود بالسداد.

### 29.14 الدفع عند الاستلام (COD) [محسوم وجوده، Phase 4]
مهم للشحن في مصر:
- الشحنة لها `cod_amount`.
- المندوب يسجل التحصيل عند التسليم (`cod_collected`).
- **Remittance:** تجميع المبالغ المحصلة لعميل B2B في دفعة تسوية:
```
cod_remittances: id, tenant_id, customer_id, period, total_collected,
                 fees_deducted, net_amount, status, paid_at, external_ref
cod_remittance_lines: remittance_id, record_id, amount
```
المحاسبة الفعلية في الـ ERP.

### 29.15 تكامل ERP/Gateway
- Outbound: `ContractSigned` → إرسال العقد والجدول، `PaymentRecorded` → إرسال الدفعة.
- Inbound: Webhook حالة الدفع/الفاتورة → تحديث السطور عبر `external_references`.
- التعارض: مصدر الحقيقة حسب `payments_source`.

---

## 30. Subscriptions Lifecycle

```
subscriptions:
  id, tenant_id, customer_id, item_id, contract_id?, plan (recurrence config snapshot),
  status, started_at, current_period_start, current_period_end,
  renewal_type (auto|manual|none), cancel_at_period_end, grace_until?,
  suspended_at?, cancelled_at?, version
subscription_events: subscription_id, type, from, to, occurred_at, reason
```

**الحالات:** trial → active → past_due → suspended → cancelled / expired. (+ paused [لاحقًا])

| العملية | السلوك |
|---|---|
| **التجديد** | قبل النهاية بـ X يوم: تذكير. `auto` → فترة جديدة + سطر مستحق. `manual` → Follow-up/Task لمدير الحساب |
| **Past due** | عدم الدفع بعد الاستحقاق → `past_due` حتى `grace_until` |
| **Suspension** | بعد فترة السماح → `suspended` + تعليق الـ Entitlements (حسب إعداد) |
| **الإلغاء** | فوري أو `cancel_at_period_end` |
| **الترقية/التخفيض** | [افتراضي] يسري من الفترة القادمة. الـ Proration [لاحقًا] |
| **الانتهاء** | `expired` + Entitlements `expired` |

الفواتير الدورية: في وضع `crm` يولد Billing Lite سطر مستحق لكل فترة. في وضع `erp` الفوترة من الـ ERP.

---

## 31. Suppliers

مطلوب لمكونات الخدمة (فنادق، طيران، ناقلين، مقاولين من الباطن) [Phase 4، بسيط]:
```
suppliers: id, tenant_id, name, type, contacts JSONB, phone, email,
           payment_terms, status, custom_data, external_ref
```
- لا يدير حسابات الموردين (ERP).
- يتيح: ربط المكونات بالمورد، متابعة تأكيدات المورد (Supplier Pending)، تقارير الأداء.
- بوابة موردين [لاحقًا].

---

# الجزء الرابع: الربط مع السيلز

## 32. Sales → Service Handoff

### 32.1 الفلو [محسوم]
```
Deal Won (عقد موقع أو Order مؤكد)
   ↓
Event: ContractSigned / OrderConfirmed (Outbox)
   ↓
Handoff Processor (Idempotent بمفتاح contract_id + contract_version)
   • Lead → Customer (أو تحديث الموجود) + Contacts
   • لكل بند في العقد حسب Fulfillment Config:
       creates=asset        → Item Instance → Asset (+ Warranty + Entitlements)
       creates=subscription → Subscription (+ Entitlements)
       creates=enrollment   → Enrollment Record (+ Participants)
       creates=booking      → Booking Record (+ Participants + Components + Required Docs)
       creates=shipment     → Shipment Record
       creates=project      → Project Record (+ Milestones)
       creates=work_order   → Work Order (مثل التركيب)
       creates=order/none   → لا شيء إضافي
   • البنود المرفقة (included/optional المشتراة) تُعالج بنفس الطريقة وتُربط بالأصل
   • Payment Plan → Payment Schedule (من Snapshot العقد)
   • CS Owner / Team / Portfolio عبر Assignment Engine
   ↓
Handoff Record
   ↓
Accept من CS Agent
   ↓
Onboarding Workflow (رسالة ترحيب، دعوة البورتال، مهام أولية، Follow-up Program)
```

### 32.2 Handoff Record
```
handoffs:
  id, tenant_id, deal_id?, contract_id, contract_version, customer_id,
  status (pending|needs_review|accepted|onboarding|active|rejected),
  sales_owner_id, cs_owner_id, cs_team_id,
  notes, promises JSONB, pending_issues JSONB, checklist JSONB,
  ai_summary, created_entities JSONB, errors JSONB, version
```
- **Promises:** وعود السيلز للعميل (خصم على التجديد، زيارة مجانية) حتى لا تضيع.
- **Checklist:** قابلة للتخصيص حسب Contract Type.
- **Reject:** الـ CS يرجع الـ Handoff للسيلز بسبب (بيانات ناقصة).

### 32.3 التعامل مع الفشل [محسوم]
- بند بدون Fulfillment Config أو Record Type مفقود → الـ Handoff `needs_review` مع `errors`، وما أمكن إنشاؤه يُنشأ، والباقي يُكمَّل يدويًا.
- إعادة المعالجة Idempotent: لا تكرار للكيانات.
- **Amendment بعد الـ Handoff:** `ContractAmended` → Processor يطبق الفرق فقط (إضافة Asset، مد Subscription) ويسجله على الـ Handoff.
- **إلغاء العقد بعد الـ Handoff:** `ContractCancelled` → الكيانات تُلغى/تُعلق حسب نوعها، لا تُحذف.

### 32.4 Standalone Mode
لو `sales` غير مفعّل: Customers و Records و Assets و Contracts تُنشأ يدويًا أو Import أو Public API أو من محادثة واردة. الـ Handoff لا يعمل.

---

# الجزء الخامس: Service Operations

## 33. Service Records, Batches, Components, Entries

### 33.1 Service Record [محسوم]
**Customer-facing service instance**: الخدمة الفعلية المقدمة للعميل.

**هو:** Booking، Shipment، Subscription (كعرض)، Enrollment، Project، Service Contract، متابعة وحدة عقارية.
**ليس:** Case، Task، Work Order، Asset، Invoice، Payment. (كيانات مستقلة لتجنب God Entity.)

> ملاحظة: Subscription له جدول خاص (القسم 30) لأن له منطق فوترة، ويُعرض كـ Service Record Type عبر ربط `subscription_id`.

### 33.2 Record Types (Dynamic)
```
record_types:
  id, tenant_id, key, label (i18n), icon, capabilities JSONB,
  field_schema_id, schema_version, pipeline_id,
  participants_config JSONB   ← الأدوار المسموحة، min/max، البيانات المطلوبة
  components_config JSONB     ← أنواع المكونات المسموحة
  entry_types[]               ← Record Entry Types
  batch_type_id?              ← لو السجلات تتجمع في Batches
  portal_config JSONB         ← الحقول والأقسام الظاهرة للعميل
  timeline_config JSONB       ← ما يظهر للعميل من التحديثات
  numbering_sequence_id
```

### 33.3 الجدول
```
service_records:
  id, tenant_id, record_type_id, reference_no, customer_id, primary_contact_id?,
  batch_id?, status_id, pipeline_version_id, assigned_user_id?, assigned_team_id?,
  queue_id?, source_type (contract_line|manual|import|api|portal), source_id,
  starts_at?, ends_at?, expected_at?, location JSONB?,
  subscription_id?, asset_id?, data JSONB, schema_version, version
```

### 33.4 Service Batches [محسوم]
تجميع عدة سجلات تحت كيان واحد:
| المجال | الاسم في الـ UI |
|---|---|
| شحن | Manifest |
| سياحة | Trip Group |
| تعليم | Cohort / فصل |
| صيانة | Visit Batch |

```
service_batch_types: id, tenant_id, key, label (i18n), record_type_id, pipeline_id, field_schema_id
service_batches: id, tenant_id, batch_type_id, reference_no, customer_id?,
                 status_id, starts_at?, ends_at?, capacity?, data JSONB, version
```
- `customer_id` اختياري: Manifest لعميل B2B واحد، أما Trip Group فيضم عملاء مختلفين.
- **Bulk Actions:** تحديث حالة الـ Batch ينعكس اختياريًا على السجلات (مثلًا "خرج المانيفست" → كل الشحنات "In Transit") عبر Workflow.
- للـ Batch Timeline وتحديثات للعملاء.

```
Manifest #500 — Customer: United Company
├── Shipment #1 → Recipient: Ahmed → Alexandria
├── Shipment #2 → Recipient: Sara → Cairo
└── Shipment #120 ...

Trip Group: Turkey October
├── Booking: Ahmed (+2 travelers)
├── Booking: Sara
└── Booking: Mohamed (+3)
```

### 33.5 Service Components [محسوم]
الخدمة المركبة:
```
Booking
├── Flight (ذهاب)
├── Hotel
├── Airport Transfer
├── Istanbul Tour
├── Insurance
└── Flight (عودة)
```
```
component_types: id, tenant_id, record_type_id, key, label (i18n), field_schema_id, pipeline_id?
service_record_components:
  id, tenant_id, record_id, component_type_id, item_id?, supplier_id?,
  starts_at?, ends_at?, status_id?, supplier_reference?,
  cost_amount?, sell_amount?, currency, data JSONB, assigned_user_id?, version
component_participants: component_id, participant_id
```
- **الهامش** = sell − cost (محسوب، حقول التكلفة حساسة بالصلاحيات).
- لكل مكون حالة (Requested → Pending Supplier → Confirmed → Issued → Completed / Cancelled).
- المكونات غير المؤكدة تظهر في My Work وفي Workspace السياحة.
- المحاسبة الفعلية للتكلفة في الـ ERP.
- المكون قد يكون على مستوى الـ Batch (أتوبيس الرحلة الجماعية) [افتراضي: `batch_id` اختياري على المكون].

### 33.6 Participants
موضح في القسم 24.3. لكل Participant متطلبات مستندات خاصة به (باسبور كل مسافر).

### 33.7 Record Entries
موضح في القسم 10.3 (حضور، درجات، محاولات توصيل، قراءات).

### 33.8 Timeline والتحديثات للعميل
```
timeline_events:
  id, tenant_id, subject_type, subject_id, event_type, title (i18n), body,
  payload JSONB, visibility (internal|customer), actor_type, actor_id,
  source_event_id, occurred_at
```
- Projection من الـ Domain Events.
- **Customer Update يدوي:** الموظف يكتب تحديثًا للعميل ("تم تأكيد الفندق") بـ `visibility=customer`، ويُرسل اختياريًا عبر القناة.
- الحالات لها `customer_label` لإظهارها بلغة مفهومة.

---

## 34. Assets و Warranty

### 34.1 Asset [محسوم]
الشيء الذي أصبح مملوكًا أو مخصصًا للعميل بعد الـ Fulfillment.
```
customer_assets:
  id, tenant_id, customer_id, contact_id?, item_id, item_instance_id?,
  asset_type, name, serial_number?, model_number?,
  purchase_date, installation_date?, delivery_date?,
  status (active|in_repair|replaced|retired|transferred),
  location JSONB, parent_asset_id?, custom_data, schema_version, version
```
- `parent_asset_id`: مكونات الأصل (ماكينة وأجزاؤها) [لاحقًا في الاستخدام].
- **النقل:** Asset ينتقل لعميل آخر (بيع مستعمل، تنازل وحدة) مع حفظ التاريخ.
- Service History = Cases + Work Orders + Entries المرتبطة.

### 34.2 Warranty [محسوم]
كيان مستقل:
```
warranties:
  id, tenant_id, asset_id, type (manufacturer|standard|extended),
  source_type (item|contract|plan), source_id,
  starts_at, ends_at, coverage JSONB (parts, labor, exclusions),
  status (active|expired|void), terms_snapshot
```
- ينشأ تلقائيًا من Capability `warranty` على الـ Item، ويبدأ من `sale|installation|delivery`.
- **Extended Warranty:** Plan مشترى → Contract → Warranty (extended) + Entitlement.
- الضمان يولّد Entitlement تلقائيًا.
- انتهاء الضمان يطلق `WarrantyExpiring` (فرصة بيع تمديد) و`WarrantyExpired`.

---

## 35. Entitlements

### 35.1 الغرض
يجيب: **هل العميل يحق له هذه الخدمة؟**

### 35.2 الكيان
```
entitlements:
  id, tenant_id, customer_id, asset_id?, subscription_id?, contract_id?, warranty_id?,
  type (support|visits|warranty_service|usage|priority_support|custom),
  quota (NULL = غير محدود), period (per_term|per_year|per_month), 
  period_start, period_end, starts_at, ends_at,
  sla_policy_id?, channels[], coverage JSONB, case_types[],
  source_type, source_id, status (active|suspended|expired|exhausted), version
```

### 35.3 Entitlement Ledger [محسوم]
لا يُعتمد على `used = 3`:
```
entitlement_transactions:
  id, tenant_id, entitlement_id, type (consume|restore|adjust|expire|reset),
  quantity, source_type (case|work_order|manual), source_id, reason, created_by, created_at
```
الرصيد = quota − Σ(consume) + Σ(restore) ± adjust. إعادة ضبط الفترة (سنوي) = `reset`.

### 35.4 الفحص
```
POST /service/entitlements/check
{ customer_id, asset_id?, case_type_id?, service_item_id?, channel? }
→ { result: covered | not_covered | expired | exhausted | suspended | paid_required,
    entitlement_id?, sla_policy_id?, remaining?, reason }
```
- عند فتح Case: يُحفظ `entitlement_status` على الـ Case.
- الاستهلاك يحدث عند حدث محدد (إكمال Work Order، أو فتح Case حسب النوع) وليس عند الفحص.
- `paid_required`: يمكن إنشاء عرض سعر للخدمة المدفوعة.

---

## 36. Cases

### 36.1 التسمية [محسوم]
الكيان في الباك إند **Case**. الـ UI يسميه حسب الـ Terminology (Ticket / طلب / شكوى / Issue).

### 36.2 Case Types = Process Templates
أمثلة: Inquiry، Complaint، Technical Support، Maintenance، Installation، Training، Replacement، Return، Warranty Claim، Service Request، Billing Issue، Delivery Issue، Account Issue، Collection، General Request.

**Complaint و Service Request ليسا Modules** بل Case Types، ويمكن عرضهما كـ Views.

```
case_types:
  id, tenant_id, key, label (i18n), icon, color,
  default_priority, default_severity?, default_queue_id, default_team_id,
  pipeline_id, sla_policy_id?, required_fields[], field_schema_id,
  workflow_ids[], resolution_requirements JSONB, channels[],
  escalation_rule_ids[], entitlement_required, entitlement_consumption (none|on_open|on_resolve),
  reopen_policy JSONB, follow_up_program_id?, quality_checklist_id?,
  skills_required[], portal_visible, portal_form JSONB, status
case_categories: id, tenant_id, case_type_id?, parent_id?, label (i18n)
```

**Complaint** إضافاته المقترحة كحقول: Source، Against (قسم/موظف/مورد)، Reason، Business Impact، Requested Resolution، Compensation، Root Cause، Corrective Action، Preventive Action.
Pipeline مثال: Intake → Investigation → Review → Resolution → Customer Confirmation → Closed.

### 36.3 Core Fields
```
cases:
  id, tenant_id, case_number,
  customer_id, contact_id?, participant_id?,
  type_id, category_id?, subcategory_id?,
  subject, description,
  priority (low|normal|high|urgent), severity (minor|moderate|major|critical),
  status_id, pipeline_version_id,
  queue_id?, assigned_user_id?, assigned_team_id?, owner_user_id?,
  service_record_id?, component_id?, asset_id?, item_id?, contract_id?,
  work_order_id?, conversation_id?, batch_id?,
  source_channel (whatsapp|messenger|email|phone|portal|web_form|api|internal|workflow),
  created_by_type, created_by,
  opened_at, first_response_at, resolved_at, closed_at, reopened_count,
  resolution_code?, resolution_summary?, root_cause_id?,
  corrective_action?, preventive_action?,
  parent_case_id?, merged_into_id?, is_major_incident,
  entitlement_status?, entitlement_id?,
  ai_summary?, ai_signals JSONB (sentiment, suggested_type, urgency),
  custom_data JSONB, schema_version, version,
  created_at, updated_at, archived_at?
```

### 36.4 Priority ≠ Severity [محسوم]
- **Priority:** سرعة التعامل (Low / Normal / High / Urgent).
- **Severity:** حجم التأثير (Minor / Moderate / Major / Critical).
- مثال: VIP بمشكلة بسيطة = Minor + High. نظام متوقف لـ 100 مستخدم = Critical + Urgent.
- **[افتراضي]** الـ SLA تُختار بالـ Priority + Customer Tier + Entitlement، والـ Severity تؤثر في التصعيد.

### 36.5 Lifecycle
Pipeline افتراضية:
```
New → Open → Assigned → In Progress → Pending Customer → Pending Internal → Resolved → Closed
+ Escalated, Reopened, Cancelled
```
Field Service مثال:
```
New → Scheduled → Technician Assigned → On The Way → On Site → Work Completed
    → Customer Confirmation → Closed
```
الـ SLA والتقارير تعمل على `category` وليس الاسم.

### 36.6 المشاركون [محسوم]
| الدور | المعنى |
|---|---|
| Creator | من أنشأ |
| Owner | المسؤول (Accountable) |
| Assignee | المنفذ الحالي |
| Collaborator | يساعد |
| Follower | يستقبل التحديثات |
```
case_participants: case_id, user_id, role (collaborator|follower), added_at
```

### 36.7 Case Activities [محسوم]
لا يُعتمد على Messages فقط:
```
case_activities:
  id, tenant_id, case_id, type, direction (inbound|outbound|internal),
  channel?, body?, conversation_message_id?, visibility (internal|customer),
  author_type, author_id, attachments[], metadata JSONB, occurred_at
```
الأنواع: reply، internal_note، call، meeting، email، whatsapp، messenger، status_change، assignment، escalation، approval، work_order، attachment، feedback، ai_suggestion، merge.

**Internal Note لا تظهر للعميل أبدًا** (فحص في طبقة الـ Portal والـ Messaging).

### 36.8 Conversation → Case [محسوم]
```
POST /service/cases/from-conversation/{conversation_id}
```
- يربط الـ Customer، الـ Conversation، القناة، ويستخدم آخر الرسائل كوصف/سياق (+ اقتراح AI للنوع لاحقًا).
- الرد من الـ Case يخرج من نفس القناة عبر Messaging Policy.
- رسالة واردة جديدة على محادثة مربوطة بـ Case مفتوح → تضاف كـ Activity وتطلق `CaseCustomerReplied`.
- إعداد [افتراضي]: إنشاء Case تلقائيًا للرسائل الجديدة من عملاء لديهم خدمة نشطة = معطّل، ويُفعّل بـ Workflow.

### 36.9 العلاقات [محسوم]
- **Parent / Child:** `parent_case_id`. حل الـ Parent يمكن أن يحل الأبناء (عبر Workflow/Bulk).
- **Related:** `case_relations(case_id, related_case_id, type: related|follow_up|caused_by|duplicate_of)`.
- **Duplicate Detection:** اقتراح (نفس العميل + نفس الأصل/السجل + فترة قصيرة + تشابه نص).
- **Merge:** `merged_into_id`، نقل الـ Activities والمرفقات والمشاركين، الـ Timeline محفوظة، الـ Case المدموج `closed` بسبب `merged`.
- **Major Incident [لاحقًا]:** Parent خاص بتحديث واحد يصل لكل العملاء المتأثرين.

### 36.10 Reopen Policy [محسوم]
Configurable على الـ Case Type:
```json
{ "reopen_window_days": 7, "new_case_after_days": 30, "linked": true }
```
- رد العميل على Resolved خلال 7 أيام → Reopen نفس الـ Case (`reopened_count++`).
- بين 7 و 30 → [افتراضي] Reopen مع تنبيه للمشرف.
- بعد 30 → Case جديد مرتبط بالقديم.

### 36.11 Subtasks
Task Engine الحالي: `taskable_type = service_case`، `taskable_id = case_id`.

### 36.12 Root Cause
```
root_causes: id, tenant_id, label (i18n), category, parent_id?
```
تحليل الأسباب المتكررة (مثال: 26% من الحالات سببها انتهاء شهادة).

---

## 37. SLA و Escalation

### 37.1 SLA Engine مستقل [محسوم]
لا يعتمد على الـ Workflow Engine لحساب SLA. له Scheduler خاص يعمل على الـ Queue.

### 37.2 المقاييس
- **الآن:** First Response، Resolution.
- **لاحقًا:** Next Response، Update SLA.
- **خارج الـ Cases [افتراضي، Phase 4]:** SLA على Service Records (مثلًا مدة التوصيل المتوقعة) عبر نفس المحرك بـ `subject_type`.

### 37.3 Policy
```
sla_policies:
  id, tenant_id, name, priority_order, conditions JSONB
  (case_type, priority, severity, customer_tier, entitlement, channel, queue),
  targets JSONB {first_response: "30m", resolution: "8h"},
  business_calendar_id, pause_on_status_categories [pending_customer],
  status
```
اختيار الـ Policy: أول Policy تنطبق شروطها بالترتيب، أو الـ Policy المرتبطة بالـ Entitlement (أولوية أعلى) [محسوم].

### 37.4 Business Calendar
```
business_calendars: id, tenant_id, name, timezone, working_hours JSONB (لكل يوم)
holidays: calendar_id, date, name, recurring
```
مثال: السبت → الخميس 09:00–18:00، إجازات رسمية مصرية.

### 37.5 SLA Instances [محسوم]
```
sla_instances:
  id, tenant_id, subject_type (case|service_record), subject_id, metric,
  policy_id, policy_snapshot JSONB, started_at, due_at,
  paused_at?, total_paused_seconds, breached_at?, completed_at?,
  status (running|paused|met|breached|cancelled)
```
- `due_at` يُحسب بالـ Business Calendar.
- **Pause** عند دخول حالة من فئة `pending_customer` (حسب الـ Policy)، و**Resume** عند الخروج مع إعادة حساب `due_at`.
- تغيير Priority → إعادة تقييم: [افتراضي] يُلغى الـ Instance ويُنشأ جديد بنفس `started_at` مع الـ Policy الجديدة.
- تعديل Policy لا يغير الـ Instances الموجودة.

### 37.6 Escalation
```
escalation_rules:
  id, tenant_id, name, conditions JSONB,
  triggers: [{at_percent: 80, action: notify, target: assignee},
             {at_percent: 90, action: notify, target: team_leader},
             {at: breach, action: escalate, target: manager, set_priority: urgent}]
```
- المستهدف: User، Team، Team Leader، Queue، Department، Manager.
- تصعيد فوري للـ Critical.
- `SLAWarning` و`SLABreached` Events.

---

## 38. Work Orders و Field Service

### 38.1 التفرقة [محسوم]
- **Case** = المشكلة أو الطلب ("التكييف لا يعمل").
- **Work Order** = التنفيذ الفعلي ("الفني أحمد يزور العميل الثلاثاء 2 ظهرًا").
- Case واحد → عدة Work Orders. Work Order قد ينشأ بدون Case (تركيب من عقد، زيارة صيانة دورية).

### 38.2 الكيان
```
work_orders:
  id, tenant_id, number, case_id?, asset_id?, service_record_id?, contract_id?,
  type (installation|repair|maintenance|inspection|delivery|pickup|custom),
  assigned_user_id?, assigned_team_id?, resource_reservation_id?,
  scheduled_start, scheduled_end, location JSONB,
  status_id, pipeline_version_id,
  parts JSONB, labor JSONB, check_in_at?, check_in_location?, check_out_at?,
  work_notes, completion_status (completed|partial|failed|rescheduled),
  failure_reason?, customer_signature_file_id?, photos[],
  entitlement_id?, billable, version
```

### 38.3 MVP [Phase 4]
```
Case / Contract → Work Order → Assign Technician (Skills + Zone + Slot) → Schedule (Reservation)
→ On the way → Check-in → Work → Check-out → Signature/Photos → Complete
→ Consume Entitlement → Case Resolution → CSAT
```

### 38.4 المناديب (الشحن)
نفس المنطق بتعميم Assignment:
- المندوب = User بدور `courier` + Agent Profile (zones، vehicle، capacity).
- توزيع الشحنات حسب: Zone، Capacity، Vehicle، Shift، Priority، Delivery Window.
- محاولات التوصيل = Record Entries (`delivery_attempt`).
- **Proof of Delivery:** توقيع / صورة / OTP للمستلم → Entry + File.
- الفشل → Workflow ينشئ Case "Delivery Issue" (الشحنة نفسها ليست Case).

### 38.5 لاحقًا
Routes، Territories، Parts Inventory، تطبيق موبايل للفني والمندوب (Offline)، GPS tracking.

---

## 39. Follow-up Programs

### 39.1 الفكرة [محسوم]
المتابعة المخططة ليست Case. **Follow-up Program** برنامج زمني يولّد **Tasks من الـ Task Engine الحالي** (لا نظام مهام جديد).

### 39.2 التعريف
```
follow_up_programs:
  id, tenant_id, name, subject_type (customer|contract|subscription|asset|record|case),
  enrollment_trigger (event|manual|workflow), audience_conditions JSONB,
  steps JSONB, assignment JSONB (owner|portfolio_owner|queue|team),
  exit_conditions JSONB, quality_checklist_id?, status, version
```
Step:
```json
{ "key": "day7", "offset": "+7 day", "channel": "call",
  "task_title": {"ar": "مكالمة متابعة بعد أسبوع"},
  "checklist": ["هل التركيب تم بشكل سليم؟", "هل فيه ملاحظات؟"],
  "outcomes": ["satisfied", "issue_found", "no_answer"],
  "on_outcome": {"issue_found": "create_case:Complaint", "no_answer": "retry:+1 day:max2"} }
```

### 39.3 التشغيل
```
follow_up_enrollments: id, tenant_id, program_id, program_version, subject_type, subject_id,
                       status (active|completed|exited), current_step, next_due_at
```
- عند استحقاق خطوة: يُنشأ Task (`taskable = follow_up_enrollment`) للمسؤول.
- نتيجة الـ Task (Outcome) تحدد الخطوة التالية.
- شرط الخروج (العميل ألغى، جدد) ينهي البرنامج.

### 39.4 أمثلة
- **After Sale:** يوم 2، 7، 30، 90.
- **Contract Renewal:** قبل الانتهاء بـ 30، 14، 7 أيام.
- **Onboarding SaaS:** يوم 1، 3، 14.
- **ما بعد حل شكوى:** بعد 3 أيام "هل المشكلة لم تتكرر؟".

---

## 40. التواصل

### 40.1 Saved Replies
```
saved_replies: id, tenant_id, owner_type (user|team|tenant), title, body (i18n),
               variables[], case_types[], channels[]
```
Variables: `{{customer.name}}`، `{{case.number}}`، `{{agent.name}}`، `{{item.name}}`، `{{record.reference_no}}`، `{{schedule.next_due_date}}`.

### 40.2 Macros
مجموعة أفعال بضغطة:
```
macros: id, tenant_id, name, actions JSONB, visibility
```
مثال "Waiting for info": إرسال رد + Status = Pending Customer + Pause SLA + Tag "Need Info".

### 40.3 القنوات
كل رسالة خارجة تمر بـ Messaging Policy (القسم 17). الإشعارات الداخلية عبر Notifications الحالي مع Preferences.

---

## 41. Knowledge Base

```
kb_categories: id, tenant_id, parent_id?, label (i18n), visibility
kb_articles:
  id, tenant_id, category_id, slug, visibility (internal|agent|customer|public),
  status (draft|review|published|archived), current_version_id,
  owner_id, reviewer_id, language, tags[], related_items[], related_case_types[],
  published_at, expires_at, view_count, helpful_count
kb_article_versions: article_id, version, title, body, created_by, created_at
```
- الأنواع: Articles، FAQs، Troubleshooting، Internal Procedures، Scripts، Product Guides.
- **RAG يستخدم Published فقط** [محسوم]، والمقالات المنتهية (`expires_at`) تُستبعد.
- المقالات ترتبط بالـ Items والـ Case Types لاقتراحها.
- البورتال يعرض `customer` و`public` فقط.

---

## 42. Feedback و Quality

### 42.1 Feedback
```
feedback_surveys: id, tenant_id, type (csat|nps|ces), trigger JSONB, questions JSONB, channel
feedback_responses: id, tenant_id, survey_id, subject_type, subject_id, customer_id,
                    score, comment, answers JSONB, agent_id?, responded_at
```
- **البداية:** CSAT (1–5 + تعليق) بعد إغلاق الـ Case، يُرسل عبر WhatsApp/البورتال.
- **لاحقًا:** NPS، CES.
- تقييم منخفض → Workflow (Case متابعة للمشرف).

### 42.2 Quality Management [Phase 6]
```
quality_checklists: id, tenant_id, name, criteria JSONB (Communication, Accuracy,
                    Resolution, Process Compliance, Documentation) + weights
quality_reviews: id, tenant_id, checklist_id, subject_type (case|follow_up|call),
                 subject_id, agent_id, reviewer_id, scores JSONB, total, comments, reviewed_at
```
المشرف يراجع عينات (Sampling rules). تُستخدم في التدريب وتقارير الأداء. Root Cause و Corrective/Preventive Actions جزء من الجودة.

---

## 43. Customer Portal

### 43.1 نموذج هوية البورتال الموحد [محسوم]
البورتال يخدم 3 أنواع وصول بنموذج واحد:

```
portal_accounts:        ← الهوية (شخص يسجل الدخول)
  id, tenant_id, phone?, email?, password_hash?, name, locale,
  status, mfa_enabled, last_login_at

portal_memberships:     ← ماذا يستطيع هذا الحساب أن يرى
  id, portal_account_id, customer_id, contact_id?,
  membership_type (self|guardian|organization_member),
  role_id (للـ B2B: admin|operations|warehouse|customer_service|accounting),
  policy_id, status

portal_guest_access:    ← وصول مؤقت لسجل واحد (تتبع شحنة)
  id, tenant_id, subject_type, subject_id, reference, otp_target, expires_at
```

| النوع | مثال | الدخول | النطاق |
|---|---|---|---|
| **Self** | عميل فرد، مسافر | OTP (WhatsApp/SMS) أو Email | بياناته |
| **Guardian / Relationship** | ولي أمر | OTP | بياناته + من له علاقة بهم حسب الـ Policy |
| **Organization Member (B2B)** | موظف في شركة المتحدة | Email + Password (+ MFA اختياري) أو OTP | بيانات الشركة حسب دوره |
| **Guest Tracking** | المستلم النهائي | رقم التتبع + OTP على رقمه | سجل واحد، قراءة محدودة |

- حساب واحد قد يملك أكثر من Membership (ولي أمر وموظف في شركة عميلة) → **Profile Switcher**.
- B2B Admin يدير مستخدمي شركته (دعوة، أدوار، تعطيل) في حدود الحد المسموح.

### 43.2 المصادقة والأمان [محسوم]
- Portal Token منفصل عن جلسات الموظفين.
- OTP: Rate limiting، حد المحاولات، انتهاء صلاحية قصير، منع التعداد (Enumeration).
- Sessions: انتهاء، Device sessions، Revocation، تسجيل كل الدخولات في Security Audit.
- الـ Portal API مقيد بالـ Memberships دائمًا (لا يعتمد على IDs مرسلة من العميل وحدها).

### 43.3 Portal Policy [محسوم]
الوصول = **Relationship/Membership + Role + Object Policy**:
```
portal_policies:
  id, tenant_id, name, rules JSONB
  -- [{object: "record:enrollment", actions: ["view"], fields: [...]},
  --  {object: "record_entry:grade", actions: ["view"]},
  --  {object: "case", actions: ["view","create","reply"]},
  --  {object: "payment_schedule", actions: ["view","pay"]},
  --  {object: "contact", actions: ["view"], deny: ["edit"]}]
```
مثال ولي أمر: عرض بروفايل الابن ✅، عرض الدرجات والحضور ✅، عرض الأقساط والدفع ✅، فتح تذكرة ✅، تعديل بيانات الطالب ❌.
مثال B2B Accounting: عرض الفواتير والـ COD Remittances ✅، إنشاء شحنات ❌.

### 43.4 ما يراه العميل (حسب الـ Features والـ Policy)
- Service Records: Bookings، Shipments، Enrollments، Projects، Subscriptions، متابعة الوحدة.
- لكل سجل: الحالة (`customer_label`)، Timeline (`visibility=customer`)، المكونات، المشاركون، الـ Entries المسموحة.
- Assets والضمان والـ Entitlements المتبقية.
- Cases: عرض، فتح (من Case Types المسموحة أو Service Catalog)، رد، إرفاق.
- Payment Schedules: المدفوع، المتبقي، القادم، الدفع (gateway).
- Contracts والمستندات (PDF).
- Required Documents: رفع المطلوب ومتابعة حالته.
- KB (customer/public).
- Feedback.

### 43.5 B2B Capabilities (مثال الشحن)
إنشاء شحنة، Bulk Upload (Import Engine)، تتبع، عرض المانيفستات، فتح Cases، التقارير، الفواتير والـ Remittances، تحميل المستندات، إدارة API Keys (Public API مربوطة بالعميل) [Phase 5+].

### 43.6 التخصيص
لوجو، ألوان، دومين مخصص (Subdomain افتراضيًا)، اللغة (عربي/إنجليزي، RTL)، الأقسام الظاهرة، نصوص الترحيب.

---

## 44. Service Catalog

### 44.1 التفرقة [محسوم]
- **Case Type:** تصنيف وسلوك داخلي.
- **Service Catalog Item:** ما يطلبه العميل (أو الموظف نيابة عنه).

أمثلة: تركيب جهاز POS، طلب شهادة، حجز زيارة صيانة، تغيير اشتراك، طلب نسخة عقد، تغيير ميعاد التوصيل.

### 44.2 الكيان
```
service_catalog_items:
  id, tenant_id, name (i18n), description, category, icon,
  form_schema JSONB, required_documents[], price?, requires_payment,
  approval_policy?, entitlement_type?, sla_policy_id?,
  case_type_id, work_order_template?, scheduling (resource_type)?,
  audience_conditions JSONB (من يرى الخدمة), portal_visible, status
```
الطلب ينتج Case من الـ Type المحدد (+ Work Order / Reservation / Approval حسب الإعداد).
**Data Model مبكرًا (Phase 4)، والـ UI للعميل Phase 5.**

---

## 45. AI Layer

### 45.1 المبدأ [محسوم]
AI يعطي: Signal، Suggestion، Classification، Summary. **الـ Rules تقرر.**
مثال: `sentiment=negative AND tier=VIP AND case_age>1h → priority=high` (القاعدة في Workflow، والـ Sentiment مجرد إدخال).

### 45.2 الميزات (تدريجيًا)
| الميزة | المخرج |
|---|---|
| Auto-Triage | نوع/فئة/أولوية مقترحة + ثقة |
| Sentiment / Urgency | Signal في `ai_signals` |
| Suggested Reply | مسودة للموظف (لا تُرسل تلقائيًا إلا بإعداد صريح) |
| Suggested Articles | من KB المنشورة |
| Summarization | ملخص Case، محادثة، Handoff |
| Duplicate Detection | اقتراح Cases متشابهة |
| Smart Assignment | اقتراح Agent |
| AI Agent (WhatsApp/Portal) | إجابة الأسئلة الروتينية: "شحنتي فين؟"، "حجزي إمتى؟"، "القسط الجاي؟" |
| Health / Churn Score | من الـ Cases، التقييمات، النشاط، التأخر في الأقساط |
| Document extraction | [لاحقًا] قراءة باسبور/إيصال مرفوع |

### 45.3 AI Agent [محسوم]
- وصول عبر **Tools** محددة فقط (قراءة سجلات العميل، إنشاء Case، البحث في KB).
- Tenant-scoped و Customer-scoped و Least privilege.
- لا يصل لبيانات Tenant آخر أو عميل آخر.
- `handoff_to_human` دائمًا متاح، ويُفعَّل تلقائيًا عند: طلب العميل، ثقة منخفضة، موضوع حساس (فلوس، شكوى، إلغاء).
- كل ردوده مسجلة كـ Activities (actor = ai).
- يحترم Messaging Policy.

### 45.4 الإعدادات والاستهلاك
تشغيل/إيقاف كل ميزة، النبرة، اللغة، حدود الرد التلقائي، الموضوعات الممنوعة. الاستهلاك محسوب في Usage Counters. مزود الموديل [مفتوح].

---

## 46. Reports و Analytics

### 46.1 المعمارية [محسوم]
- التقارير **لا تُحسب مباشرة** من الجداول التشغيلية الثقيلة.
- **Read Models / Projections** تتحدث من الـ Events + **Daily Snapshots** للمؤشرات التاريخية (Backlog يومي).
- الحقول المخصصة `reportable` تُنسخ للـ Read Models.
- Customer Service Analytics منفصلة عن Sales Analytics.

### 46.2 المؤشرات الأساسية (MVP)
Cases Created / Resolved / Closed، Backlog، First Response Time، Average Resolution Time، SLA Compliance، SLA Breaches، Reopen Rate، Escalation Rate، First Contact Resolution، CSAT، Handoff Acceptance Time.

الأبعاد: Agent، Team، Queue، Channel، Type، Category، Priority، Product، Asset، Service/Record Type، Customer Segment، Date.

### 46.3 لاحقًا
Handle Time، Wait Time، Assignment Time، SLA At Risk، Case Aging / Age Buckets، Deflection، Self-Service Resolution، Repeat Contact، Top Root Causes، Problem Products، AI resolution rate، Agent Occupancy، Workload.

### 46.4 تقارير المجالات
- **التحصيل:** مستحق، محصّل، متأخر، Aging، نسبة التحصيل.
- **الشحن:** نسبة التسليم من أول محاولة، أسباب الفشل، أداء المناديب، COD.
- **السياحة:** مكونات غير مؤكدة، أداء الموردين، الهوامش.
- **التعليم:** نسب الحضور (من الـ Entries Aggregation).
- **Follow-ups:** نسبة الإنجاز والنتائج.

### 46.5 Agent Performance
Assigned، Resolved، Open، Overdue، Avg First Response، Avg Resolution، SLA %، Reopen %، Rating، Quality Score — **مع مراعاة الصعوبة** (Severity/Type) وليس العدد فقط.

---

## 47. الإعدادات و Industry Templates

### 47.1 شاشات الإعدادات
1. Setup Wizard
2. Business Models
3. Terminology & Languages
4. Item Types & Capabilities
5. Custom Fields
6. Record Types (Participants، Components، Entries، Portal)
7. Batch Types
8. Pipelines & Statuses & Transitions
9. Contact Roles & Relationships
10. Case Types & Categories & Root Causes
11. Queues & Assignment Rules & Agent Profiles
12. Portfolios
13. SLA Policies & Business Calendars
14. Escalation Rules
15. Workflows
16. Follow-up Programs
17. Handoff Rules & Checklists
18. Contract Types & Document Templates
19. Payment Plans & Payments Source
20. Channels, Message Templates, Consents, Quiet Hours
21. Saved Replies & Macros
22. Service Catalog
23. Portal (Branding، Policies، Sections)
24. Knowledge Base
25. Feedback Surveys
26. AI Settings
27. Roles & Permissions
28. Numbering Sequences
29. Integrations & API Clients & Webhooks
30. Workspaces & Saved Views

**[محسوم]** في البداية الإعدادات عبر **Admin API + Seed Files**. الواجهات المعقدة (Form Builder، Workflow Builder) لاحقًا.

### 47.2 Industry Templates [محسوم]
Template = **تركيبة جاهزة (Seed Data)**:
نماذج مفعلة + Item Types + Record Types + Batch Types + Component Types + Entry Types + Case Types + Pipelines + SLA + Queues + Workflows + Follow-up Programs + Workspaces + Portal Policies + Terminology + Catalog أمثلة + Message Templates.

- **مطلوب مبكرًا:** Template للمجالين الـ Pilot (Phase 3).
- **Setup Wizard:** يسأل عن النشاط → يطبق الـ Template → الـ Tenant يعدّل.
- **Versioning [لاحقًا، Phase 6]:**
```
industry_templates → industry_template_versions → tenant_template_installations → tenant overrides
```
مع "Upgrade available" + Diff + Migration بدون تدمير تعديلات الـ Tenant. التصميم من الآن يسجل `installed_from_template_version` على الكيانات المنشأة.

### 47.3 Sidebar (Feature-driven)
```
Service Operations
├── Service Center (Workspace + My Work)
├── Cases (All, My, Unassigned, Escalated, SLA Breaches)
├── Complaints (View)
├── Handoffs
├── Customer Records (بمسميات الـ Tenant)
├── Batches (Manifests / Trip Groups / Cohorts)
├── Operations Workspaces (Shipping / Tourism ...)
├── After-Sales (Assets, Warranty, Service Contracts, Work Orders)
├── Scheduling
├── Collections
├── Follow-ups
├── Portfolios
├── Service Catalog
├── Knowledge Base
├── Automations
├── Feedback & Quality
├── Reports
└── Settings
```
يظهر حسب: Package + Tenant Features + Permissions + Business Models.

---

# الجزء السادس: أدلة المجالات

## 48. أدلة تطبيق كل مجال

كل دليل يوضح أن المجال **Configuration فقط** فوق نفس الـ Engines.

### 48.1 الشحن (F + C)
- **Item Types:** "شحنة عادية"، "شحنة سريعة" (tracking، participants: sender/recipient).
- **Record Type:** Shipment. Pipeline: Created → Picked Up → At Hub → Out for Delivery → Delivered / Failed → Returned.
- **Batch Type:** Manifest (لعميل B2B).
- **Participants:** Recipient (بدون Contact، `person_snapshot` بالعنوان).
- **Entries:** delivery_attempt، proof_of_delivery.
- **Assignment:** المناديب حسب Zone/Capacity/Vehicle.
- **Billing:** COD + Remittances، أو عقد شهري للـ B2B (C).
- **Cases:** Delivery Issue، Damaged، Lost، COD Dispute. الفشل ينشئ Case بـ Workflow.
- **Portal:** B2B كامل (إنشاء، Bulk، تتبع، تقارير، Remittances، API) + Guest Tracking للمستلم.
- **Workspace:** Incoming، Unassigned، Pickup، In Transit، Out for Delivery، Failed، Returned، Delivered.
- **AI Agent:** "شحنتي فين؟".
- **[مفتوح]:** تسعير الشحن (Rate Cards حسب المنطقة والوزن) — انظر القسم 60.

### 48.2 السياحة والسفر (E)
- **Item Type:** "باقة سياحية" (scheduling، participants، components، required_documents، capacity، installments اختياري).
- **Record Type:** Booking. Pipeline: Inquiry → Reserved → Documents Pending → Confirmed → Ticketed → Traveling → Completed / Cancelled.
- **Batch Type:** Trip Group (سعة مقاعد عبر Resources).
- **Components:** Flight، Hotel، Transfer، Tour، Insurance، Visa (مع Supplier وتكلفة وسعر).
- **Participants:** Travelers + مستندات لكل مسافر (باسبور، فيزا، صورة).
- **Workflows:** طلب المستندات، تذكير النواقص، قبل السفر بـ 48 ساعة إرسال التذاكر وتفاصيل الفندق، بعد العودة CSAT.
- **Portal:** الحجز، المكونات، المستندات المطلوبة ورفعها، الأقساط، التذاكر PDF.
- **Workspace:** Upcoming Trips، Pending Confirmation، Missing Documents، Supplier Pending، Traveler Actions.

### 48.3 المدارس (D + C)
- **Customer:** ولي الأمر. **Contacts:** الأبناء (Student) بعلاقة `guardian_of`.
- **Item Types:** "سنة دراسية" (participants: student، entitlements، installments)، "باص" (recurrence).
- **Record Type:** Enrollment لكل ابن. Pipeline: Applied → Accepted → Enrolled → Active → Graduated / Withdrawn.
- **Batch Type:** Cohort / فصل.
- **Entries:** attendance، grade، behavior_note (Aggregation: نسبة الحضور، المعدل).
- **Billing:** أقساط المصاريف.
- **Workflows:** غياب → إشعار ولي الأمر، قسط متأخر → تذكير، نتيجة امتحان → إشعار.
- **Portal:** ولي الأمر (Guardian): بروفايل كل ابن، حضور، درجات، أقساط، تذاكر. الطالب (Self): بروفايله فقط.

### 48.4 سناتر الكورسات (D + A)
مثل المدارس بمدة أقصر: "كورس" (capacity، participants، scheduling للجدول). Batch = مجموعة الكورس. Entries: attendance، exam. بيع مذكرات (A). شهادة إتمام (Document).

### 48.5 الأجهزة والصيانة (A + B + C + H)
- **Item Types:** "تكييف" (serial، warranty 24m from installation، installments)، "عقد صيانة سنوي" (plan، recurrence 1 year، entitlements: 4 visits)، "زيارة صيانة" (onsite، scheduling).
- **Relations:** تركيب مضمن، عقد صيانة اختياري.
- **Handoff:** Asset + Warranty + Work Order تركيب + Subscription صيانة + Entitlement + Schedule.
- **Case:** "عطل" → Entitlement check → Work Order → Technician → Signature → استهلاك زيارة → CSAT.
- **Workflows:** قبل انتهاء الضمان عرض تمديد، زيارات دورية مجدولة، قبل تجديد العقد Follow-up.
- **Portal:** الأجهزة، الضمان، الزيارات المتبقية، طلب زيارة (Service Catalog)، التذاكر.

### 48.6 SaaS (C + G + H)
- **Item Types:** "اشتراك" (recurrence، entitlements، digital_delivery)، "Onboarding" (milestones)، "دعم Premium" (plan، entitlement SLA 30m).
- **Records:** Subscription، Project (Onboarding).
- **Cases:** Technical Issue، Bug، Configuration، Billing، Feature Request. SLA حسب الـ Entitlement.
- **Follow-ups:** Onboarding (يوم 1، 3، 14)، التجديد (قبل 30، 14، 7).
- **Health Score:** من التذاكر والاستخدام والتقييم.
- **Major Incident:** انقطاع الخدمة → Parent Case.

### 48.7 Software House (G + C)
- **Item Type:** "تطوير تطبيق" (milestones، warranty 6m دعم مجاني، installments milestone_based).
- **Record:** Project. Milestones: تحليل → تصميم → تطوير → اختبار → تسليم.
- **Billing:** دفعات مع تسليم المراحل (`on_milestone`).
- **Entries:** time_log.
- **بعد التسليم:** Warranty → Entitlement دعم → Cases.
- **Portal:** المراحل، التسليمات، الدفعات، التذاكر.

### 48.8 العقارات (B + Record + Billing Lite)
- **Item Type:** "وحدة سكنية" (unique_unit، availability 7d، warranty تشطيبات، installments).
- **Categories كمشاريع** بخطط سداد لكل مشروع (مع price_adjustment: كاش −10%، 8 سنين +15%).
- **Deal:** اختيار الوحدة + الخطة → Preview → حجز مؤقت → عقد → Snapshot.
- **Handoff:** الوحدة → Asset، الجدول → Payment Schedule، Record "متابعة الوحدة" (تعاقد → إنشاءات → جاهزة للاستلام → تم الاستلام → ما بعد الاستلام)، Handover entity.
- **التحصيل:** تذكيرات، Cases تحصيل، غرامات، إعادة جدولة، تنازل.
- **بعد الاستلام:** ضمان + طلبات صيانة (H).
- **Portal:** الوحدة، مرحلة الإنشاءات، الجدول، الدفع، المستندات، التذاكر.

### 48.9 المنتجات الديجيتال (A + C)
- **Item Type:** "منتج رقمي" (digital_delivery: license/link)، "اشتراك محتوى" (recurrence).
- **Handoff:** تسليم تلقائي للرخصة/الرابط.
- **Cases:** Access Issue، Refund، License Transfer.
- **AI Agent:** إعادة إرسال الرابط، شرح التفعيل من KB.

### 48.10 متجر / بيع بدون ما بعد البيع (A)
Order + Cases (Inquiry، Complaint، Delivery، Return، Billing). أبسط تهيئة.

### 48.11 Standalone Helpdesk
بدون سيلز وبدون نماذج إضافية: Conversations → Cases → Queues → SLA → KB → CSAT. هذه هي **MVP-1** (القسم 55).

---

# الجزء السابع: البيانات والـ API

## 49. قاعدة البيانات (ملخص موحد)

> كل جدول يحتوي `tenant_id` و`created_at` و`updated_at` ما لم يُذكر غير ذلك. الكيانات الحساسة تحتوي `version`.

```
-- Platform
outbox_events, processed_events, scheduled_jobs
audit_logs
roles, role_permissions, user_roles, record_scopes
packages, package_features, package_limits, usage_counters
tenant_settings, tenant_business_models, tenant_features
custom_field_definitions
pipelines, pipeline_versions, statuses, status_transitions
assignment_rules (معمم), queues, agent_profiles
portfolios, portfolio_members
files, attachments, document_requirements
number_sequences
import_jobs, import_mappings
integrations, integration_credentials, external_references
webhook_events, webhook_subscriptions, webhook_deliveries, api_clients
message_templates, communication_consents, notification_preferences
workflows, workflow_versions, workflow_runs
approval_requests, approval_steps
resources, resource_calendars, reservations
saved_views, workspace_definitions, work_items (projection)
translations (عند الحاجة)

-- Core (موجود + توسيع)
customers (+ type, merged_into_customer_id)
contacts, contact_roles, contact_relationships
item_types, catalog_items (+ columns), item_units, item_instances,
catalog_item_relations, catalog_item_entitlement_templates
suppliers

-- Sales (تعديل)
deals (+ item_instance_id, payment_plan_id, plan_overrides, final_price,
       schedule_preview, approval_status)

-- Contracts & Documents
contract_types, contracts, contract_versions, contract_parties, contract_items,
contract_assets, contract_entitlements, contract_signatures, contract_documents,
contract_amendments
document_templates, document_template_versions, document_sections, document_blocks,
documents, document_snapshots, signatures
deliveries, delivery_lines, handovers, handover_items

-- Billing Lite
payment_plans, payment_plan_assignments
payment_schedules, payment_schedule_lines, payment_records, payment_allocations
cod_remittances, cod_remittance_lines
subscriptions, subscription_events

-- Service Operations
handoffs
record_types, service_records, service_record_participants
service_batch_types, service_batches
component_types, service_record_components, component_participants
record_entry_types, record_entries
timeline_events
customer_assets, warranties
entitlements, entitlement_transactions
case_types, case_categories, root_causes
cases, case_relations, case_participants, case_activities
sla_policies, business_calendars, holidays, sla_instances, escalation_rules
work_orders
follow_up_programs, follow_up_enrollments
saved_replies, macros
kb_categories, kb_articles, kb_article_versions
feedback_surveys, feedback_responses
quality_checklists, quality_reviews
portal_accounts, portal_memberships, portal_guest_access, portal_policies, portal_sessions
service_catalog_items
ai_interactions (سجل استدعاءات AI للمراجعة والاستهلاك)

-- Templates
industry_templates, industry_template_versions, tenant_template_installations
```

---

## 50. استراتيجية الـ Indexes

أمثلة إلزامية:
```
(tenant_id, status_id)
(tenant_id, assigned_user_id, status_id)
(tenant_id, queue_id, status_id)
(tenant_id, customer_id)
(tenant_id, created_at)
UNIQUE (tenant_id, case_number)
UNIQUE (tenant_id, item_id, serial_number)
UNIQUE (tenant_id, record_type_id, reference_no)
(tenant_id, due_at) على sla_instances و payment_schedule_lines و scheduled_jobs
(tenant_id, subject_type, subject_id, occurred_at) على timeline_events
(tenant_id, batch_id) على service_records
GIN على custom_data عند الحاجة + Expression indexes للحقول filterable
pg_trgm على الأسماء، أرقام الهواتف، أرقام المرجع
```
الـ Partial Indexes للحالات المفتوحة (`WHERE status_category NOT IN ('closed','cancelled')`).

---

## 51. قواعد الـ API

### 51.1 عام [محسوم]
RESTful قدر الإمكان، Tenant-scoped، Permission-protected، Version-aware (`/api/v1`)، موثق بـ OpenAPI، Pagination، Sorting، Filtering، أخطاء موحدة، Idempotency-Key للعمليات الحساسة (دفعات، إنشاء من Webhooks، Handoff اليدوي).

### 51.2 الأخطاء
```json
{
  "success": false,
  "code": "CASE_TRANSITION_NOT_ALLOWED",
  "message": "لا يمكن الانتقال من هذه الحالة",
  "errors": { "resolution_code": ["required"] },
  "meta": { "request_id": "..." }
}
```
أكواد ثابتة (Catalog موثق): `VALIDATION_FAILED`، `NOT_FOUND`، `FORBIDDEN`، `CONFLICT_VERSION`، `FEATURE_DISABLED`، `LIMIT_EXCEEDED`، `CASE_TRANSITION_NOT_ALLOWED`، `ENTITLEMENT_NOT_COVERED`، `RESERVATION_CONFLICT`، `MESSAGING_TEMPLATE_REQUIRED`، `PLAN_LIMIT_EXCEEDED_APPROVAL_REQUIRED`...

### 51.3 Pagination و Filtering
- Cursor pagination للكيانات الكبيرة (Cases، Timeline، Audit، Workflow Runs، Messages، Entries)، Offset للصغيرة.
- فلاتر قياسية: search، status، status_category، type، priority، severity، agent، team، queue، customer، date ranges، sla_state، channel، item، asset، record_type، batch، + `filter[custom.<key>][op]`.
- Operators: eq، ne، in، gt، gte، lt، lte، contains، between، is_null.

### 51.4 Endpoints (مبدئي)
```
# Capabilities
GET    /me/capabilities

# Settings (Admin API)
CRUD   /settings/business-models, /settings/terminology
CRUD   /catalog/item-types, /catalog/items (+ /relations, /units, /instances)
CRUD   /custom-fields, /pipelines (+ /versions, /transitions)
CRUD   /service/record-types, /service/batch-types, /service/component-types, /service/entry-types
CRUD   /service/case-types, /service/case-categories, /service/root-causes
CRUD   /queues, /assignment-rules, /agent-profiles, /portfolios
CRUD   /service/sla-policies, /business-calendars, /service/escalation-rules
CRUD   /workflows (+ /versions, /runs), /follow-up-programs
CRUD   /contract-types, /document-templates
CRUD   /billing/payment-plans, /billing/payment-plan-assignments
CRUD   /message-templates, /saved-replies, /macros
CRUD   /service/catalog-items, /portal/policies, /feedback/surveys
CRUD   /number-sequences, /api-clients, /webhook-subscriptions
POST   /settings/templates/{key}/apply

# Identity
CRUD   /customers/{id}/contacts
CRUD   /contacts/{id}/relationships
POST   /customers/{id}/merge

# Sales / Billing
POST   /billing/payment-plans/{id}/preview
PATCH  /deals/{id}/payment  (plan + overrides)
POST   /reservations        DELETE /reservations/{id}
CRUD   /contracts (+ /versions, /sign, /amendments, /renew)
GET    /billing/schedules/{id}
POST   /billing/schedules/{id}/payments | /reschedule | /transfer | /cancel | /payoff-quote
POST   /billing/lines/{id}/waive-fee
CRUD   /subscriptions (+ /cancel, /suspend, /resume, /renew)
CRUD   /billing/cod-remittances

# Handoff
GET    /service/handoffs     POST /service/handoffs/{id}/accept | /reject | /reprocess

# Service Records
CRUD   /service/records?type=...        GET /service/records/{id}/timeline
POST   /service/records/{id}/updates    (customer-facing update)
CRUD   /service/records/{id}/participants | /components | /entries
CRUD   /service/batches    POST /service/batches/{id}/bulk-status
CRUD   /service/assets, /service/warranties
CRUD   /service/entitlements   POST /service/entitlements/check
                               POST /service/entitlements/{id}/transactions

# Cases
CRUD   /service/cases
POST   /service/cases/from-conversation/{conversation_id}
POST   /service/cases/{id}/transition | /assign | /reply | /notes | /merge | /reopen
     | /apply-macro | /participants | /link
GET    /service/cases/{id}/activities
GET    /service/cases/{id}/duplicates

# Work
CRUD   /service/work-orders  POST /service/work-orders/{id}/check-in | /check-out | /complete
GET    /scheduling/availability
GET    /my-work
CRUD   /saved-views    GET /workspaces/{key}

# Documents & Files
POST   /files     CRUD /attachments
POST   /documents/generate   GET /documents/{id}/pdf
CRUD   /document-requirements  POST /document-requirements/{id}/verify | /reject

# Imports
POST   /imports (dry_run)   POST /imports/{id}/execute   GET /imports/{id}

# Knowledge / Feedback / Quality
CRUD   /kb/articles (+ /versions, /publish)
POST   /feedback/responses   CRUD /quality/reviews

# Reports
GET    /service/reports/{report_key}?filters...
GET    /service/dashboard/overview | /agents | /collections | /operations

# Portal (Portal Token)
POST   /portal/auth/otp | /verify | /login | /logout
GET    /portal/me   GET /portal/me/memberships   POST /portal/me/switch
GET    /portal/records | /portal/records/{id}
GET    /portal/assets | /portal/entitlements
GET/POST /portal/cases   POST /portal/cases/{id}/reply
GET    /portal/schedules   POST /portal/payments
GET    /portal/documents   POST /portal/document-requirements/{id}/upload
GET    /portal/catalog     POST /portal/catalog/{id}/request
GET    /portal/kb   POST /portal/feedback
# B2B
CRUD   /portal/org/users   POST /portal/org/imports   GET /portal/org/reports
# Guest
POST   /portal/track   (reference + OTP)

# Public API (API Client)
/public/v1/... (subset: records, cases, tracking, webhooks)

# Webhooks inbound
POST   /webhooks/{provider}
```

---

## 52. Event Catalog (مبدئي)

> الصيغة: `domain.entity.action` + version. عمود Realtime = يُرسل للفرونت.

| Event | Realtime | ملاحظات |
|---|---|---|
| customer.created / updated / merged | | |
| contact.created / relationship.changed | | |
| deal.won | ✅ | |
| reservation.created / expired / confirmed | ✅ | |
| contract.signed / amended / cancelled / renewed / expiring | | expiring من Scheduler |
| order.confirmed | | |
| handoff.created / accepted / rejected / needs_review | ✅ | |
| service_record.created / status_changed / updated | ✅ | |
| service_record.customer_update_posted | | يطلق إشعار العميل |
| batch.created / status_changed | ✅ | |
| component.status_changed / supplier_confirmed | ✅ | |
| record_entry.added | | مثال: غياب |
| participant.added | | |
| document_requirement.missing / uploaded / verified / expired | ✅ | |
| asset.created / transferred | | |
| warranty.created / expiring / expired | | |
| entitlement.created / consumed / exhausted / suspended / expired | | |
| case.created | ✅ | |
| case.assigned / moved_to_queue | ✅ | |
| case.status_changed | ✅ | |
| case.customer_replied / agent_replied | ✅ | |
| case.resolved / closed / reopened / merged | ✅ | |
| sla.warning / breached / met | ✅ | |
| escalation.triggered | ✅ | |
| work_order.created / scheduled / started / completed / failed | ✅ | |
| follow_up.step_due / completed / exited | | |
| installment.upcoming / due / paid / overdue | | |
| payment.recorded / reversed | | |
| schedule.rescheduled / completed | | |
| subscription.renewed / past_due / suspended / cancelled / expired | | |
| cod.collected / remittance.created | | |
| feedback.received / low_score | ✅ | |
| approval.requested / decided | ✅ | |
| message.received / sent / failed | ✅ | من Conversations |
| import.completed / failed | ✅ | |
| portal.login / account.created | | Security Audit |

كل Event موثق بـ Payload Schema وإصدار في `docs/service/EVENTS.md`.

---

## 53. Permission Catalog (مبدئي)

```
cases.view | cases.create | cases.update | cases.assign | cases.transition
cases.resolve | cases.close | cases.reopen | cases.merge | cases.delete_note
cases.view_internal_notes | cases.view_all | cases.export
records.view | records.create | records.update | records.bulk_update
records.view_costs (حساسة) | components.manage | entries.create
batches.manage
assets.view | assets.manage | assets.transfer
entitlements.view | entitlements.adjust
work_orders.view | work_orders.assign | work_orders.complete
contracts.view | contracts.create | contracts.approve | contracts.sign | contracts.amend
billing.view | billing.record_payment | billing.reverse_payment | billing.waive_fee
billing.reschedule | billing.transfer
plans.override_within_limits | plans.approve_exceptions
handoffs.view | handoffs.accept | handoffs.reject
follow_ups.manage | portfolios.manage
kb.view_internal | kb.edit | kb.publish
quality.review | reports.view | reports.view_financial
settings.manage | workflows.manage | templates.apply
imports.run | exports.run | api_clients.manage
portal_users.manage | impersonate.portal (مع Audit)
```

---

# الجزء الثامن: التنفيذ

## 54. طريقة البناء

### 54.1 الترتيب لكل Feature [محسوم]
1. Domain Model
2. تغييرات قاعدة البيانات
3. API Contract (OpenAPI)
4. Events
5. Permissions
6. التنفيذ
7. Tests
8. Documentation

الفرونت يعمل بالتوازي على **Mock Server** من الـ OpenAPI.

### 54.2 Vertical Slices لا طبقات [محسوم]
لا تُبنى قاعدة البيانات كلها ثم الـ APIs كلها. يُبنى مسار كامل رفيع من أوله لآخره، ثم يُعرّض.

**أول Slice (نهاية Phase 1):**
```
رسالة WhatsApp واردة
 → الموظف يضغط "Create Case" من المحادثة
 → Case + OutboxEvent في نفس الـ Transaction
 → Relay → case.created على الـ Queue
 → Consumers: Queue Routing + Assignment → Timeline Projection → Audit → Notification → work_items
 → الـ Case يظهر في My Cases (Realtime)
 → الموظف يرد → الرد يخرج على نفس المحادثة (عبر Messaging Policy)
 → العميل يرد → Activity + case.customer_replied
 → Transition إلى Resolved (بـ resolution_code)
```
هذا أول End-to-End Test فعلي، ويختبر: Outbox، Events، Idempotency، Assignment، Timeline، Audit، Permissions، Tenant Isolation، Messaging Policy.

### 54.3 Pilot مع "اختبار المجال الثاني" [محسوم]
- المجالين المقترحين: **B (أجهزة/صيانة)** + **E (سياحة) أو D (تعليم)** [مفتوح: الاختيار النهائي].
- كل تصميم يُراجع: هل يعمل للمجال الثاني **بدون كود**؟ لو احتاج `if`، يُعاد التصميم.

### 54.4 Backward Compatibility [محسوم]
أي تعديل على Customers، Products، Statuses، Assignment، Tasks، Conversations يجب ألا يكسر الـ Endpoints الحالية. ترحيل البيانات بـ Migrations قابلة للتراجع قدر الإمكان، مع Feature Flags للتحويل التدريجي.

---

## 55. المراحل و MVP ومعايير القبول

### Phase 0 — Platform Foundation
**المحتوى:** Outbox + Relay + Queue (Retry، Backoff، DLQ، Replay، Idempotency، Tenant fairness) · Event Contract + Event Catalog الأولي · Scheduler (`scheduled_jobs`) · Audit Log + Security Audit · Permissions foundation (Roles، Scopes) · Packages + Feature Flags + Business Models + Capabilities Manifest · Observability (Correlation IDs، Logs، Metrics) · Optimistic Concurrency · Custom Fields Engine (schema_version، filterable) · Status/Pipeline Engine المعمم (Versions + Transitions) مع ترحيل حالات السيلز · Assignment Engine المعمم + Queues · Shared Files · Numbering Sequences · Localization (i18n labels) · Messaging Policy (قواعد 24h + Templates + Consents).

**Deliverables:** Migrations، Services، Unit + Integration Tests، ADRs (001–012)، OpenAPI، Event Catalog، Architecture docs.

**Acceptance:**
- Event يُنشر مرة واحدة فقط حتى مع فشل الـ Worker وإعادة التشغيل.
- Consumer يستقبل نفس الـ Event مرتين → تأثير واحد.
- Tests الـ Tenant Isolation تمر على كل الجداول الجديدة.
- الـ Endpoints الحالية للسيلز تعمل بدون تغيير بعد تعميم الـ Status و Assignment.
- تعطيل Feature يرجع `FEATURE_DISABLED` ويختفي من الـ Manifest.
- Workflow يحاول إرسال WhatsApp خارج 24h بدون Template → يُرفض بـ `MESSAGING_TEMPLATE_REQUIRED`.

### Phase 1 — Case Core
**المحتوى:** Customer.type + Contacts + Roles + Relationships + Merge · Cases (Types، Categories، Priority/Severity، Pipelines، Transitions) · Activities + Internal Notes + Attachments · Participants (Owner/Collaborator/Follower) · Parent/Child + Relations + Duplicate suggestion + Merge · Reopen Policy · Queues + Agent Profiles (Skills، Capacity) · Timeline Projection · Conversation → Case + الرد من نفس القناة · Tasks integration · Saved Views + My Work projection (Cases + Tasks) · Customer Drawer Service Tab (Cases).

**Acceptance:** الـ Vertical Slice الأول (54.2) يعمل End-to-End · Internal Note لا تظهر في أي Response موجه للعميل · Merge يحفظ كل الـ Activities · تعارض التعديل المتزامن يرجع 409.

### Phase 2 — Service Operations Basics + Workflow v1 → **MVP-1**
**المحتوى:** SLA Policies + Business Calendars + SLA Instances + Pause/Resume · Escalation Rules · Workflow Engine v1 (Event/Schedule triggers، Conditions، Actions الأساسية، Versioning، Runs) · Saved Replies + Macros · CSAT · KB داخلي (Articles + Versions + Publish) · Notification Preferences · Dashboard و Reports أساسية (46.2) · Service Center Workspace.

**MVP-1 = Standalone Omnichannel Helpdesk:** قابل للبيع لشركة تحتاج خدمة عملاء على WhatsApp/Messenger/Email بـ Queues و SLA و KB و CSAT وتقارير، بدون أي نموذج صناعي.

**Acceptance:** حساب SLA صحيح عبر عطلة نهاية أسبوع وإجازة رسمية (Tests بـ Clock قابل للتحكم) · Pause عند Pending Customer يؤخر `due_at` بدقة · Escalation عند 80% و Breach · Workflow "رد العميل على Pending Customer → In Progress + Resume SLA" يعمل · تعديل Workflow لا يغير Runs الشغالة.

### Phase 3 — Catalog + Service Context + Contracts + Handoff
**المحتوى:** Item Types + Capabilities Framework + Capabilities الـ Pilot · Item Instances + Units + Relations · Record Types + Service Records + Participants + Record Entries + Batches + Components (حسب الـ Pilot) · Timeline customer updates · Assets + Warranty · Entitlements + Ledger + Check · Required Documents · Contracts (Types، Versions، Signatures، Amendments) · Document Builder (تعميم Proposal) · Sales Handoff (كامل مع needs_review و Amendments) · Industry Templates للـ Pilot + Setup Wizard (API) · Customer Drawer Service Tab (كامل).

**Acceptance:** عقد موقع لمنتج B بخدمات مرفقة ينشئ Asset + Warranty + Entitlement + Work Order + Subscription بشكل صحيح وIdempotent · بند بدون Mapping → `needs_review` بدون فشل كامل · نفس الكود يطبق Template المجال الثاني بدون تعديل · Amendment بعد الـ Handoff يضيف الفرق فقط.

### Phase 4 — Billing Lite + Scheduling + Work Orders
**المحتوى:** Payment Plans + Assignments + Price Adjustment + Preview Engine · Deal integration (overrides، approvals) · Reservations/Holds (Scheduling engine) · Payment Schedules + Lines + Payments + Allocations · Reschedule / Transfer / Cancel / Payoff / Waive · Late fees · Collections workflows + Workspace · Subscriptions Lifecycle · ERP/Gateway integration contracts + Webhooks · Approvals Engine · Resources + Availability + Slots · Work Orders + Field visit MVP + Courier assignment + Proof of Delivery · COD + Remittances · Suppliers (بسيط) · Service Catalog data model · SLA على Service Records.

**Acceptance:** مثال العقارات (29.6) يُنتج الجدول بالضبط رقمًا وتاريخًا · مجموع السطور = السعر النهائي دائمًا (Property-based tests) · حجز مؤقت ينتهي تلقائيًا · لا يمكن حجز نفس الوحدة/الفني مرتين في نفس الوقت · إعادة الجدولة تحفظ القديم · استهلاك الـ Entitlement بإكمال Work Order يُسجل في الـ Ledger.

### Phase 5 — Portal + Import + Public API + Follow-ups → **MVP-2 (Pilot Release)**
**المحتوى:** Portal Identity (Accounts، Memberships، Guest) · OTP + Sessions + Security · Portal Policies · Portal APIs (Records، Cases، Schedules، Documents، Required Docs upload، KB، Feedback، Catalog requests) · B2B Org users · Guest Tracking · Online payments (gateway) · Import Engine (Dry run، Upsert، Error files) · Public API + API Clients + Outbound Webhooks · Follow-up Programs · Portfolios · Operations Workspaces للـ Pilot · Service Catalog UI للعميل.

**MVP-2 = نسخة Pilot كاملة** للمجالين المختارين: من السيلز إلى الخدمة إلى البورتال إلى التحصيل.

**Acceptance:** ولي أمر يرى أبناءه فقط، والابن يرى نفسه فقط (Policy tests) · مستخدم B2B Accounting لا يستطيع إنشاء شحنة · Guest tracking يرى سجلًا واحدًا فقط · Import 10,000 سجل لا يؤثر على زمن استجابة Tenants آخرين · API Client مربوط بعميل لا يرى بيانات غيره.

### Phase 6 — Knowledge, Quality, Templates Versioning
KB للعملاء + Self-service · Quality Checklists + Reviews · NPS/CES · Industry Template Versioning + Upgrade/Diff · Settings UIs (Form Builder، Workflow Builder) · Global Search موسع · Major Incidents.

### Phase 7 — AI & Advanced
AI Triage، Suggested Reply/Articles، Summaries، Duplicate AI، Smart Assignment، AI Agent (WhatsApp/Portal)، Health Score · Advanced Analytics · Full Field Service (Routes، Mobile Offline، GPS) · Inventory integration · Proration · Supplier portal.

> **ملاحظة:** الـ AI Step interface في الـ Workflow Engine وحقول `ai_signals` و`ai_summary` موجودة من Phase 2 لتسهيل الإضافة.

---

## 56. Definition of Done و Testing

### 56.1 Definition of Done [محسوم]
أي Feature مكتملة فقط لو فيها: Migration، Entity/Model، Service، Permissions، Validation، API، Events، Audit، Tests، OpenAPI، Documentation، Tenant isolation، Error handling.
وعند الحاجة: Realtime Event، Feature Flag، Workflow Trigger، Portal Policy، Terminology keys، i18n labels.

### 56.2 Tests إلزامية
- Tenant Isolation (لكل جدول جديد).
- Case Transitions و Required fields.
- SLA calculations + Business calendars + Pause/Resume (Clock قابل للتحكم).
- Entitlement consumption و Ledger balance.
- Outbox atomicity (فشل بعد الـ Commit وقبل النشر).
- Event idempotency + Queue retries + DLQ.
- Merge Cases و Merge Customers.
- Optimistic concurrency.
- Contract snapshots و Amendments.
- **Payment schedule calculations:** أمثلة ثابتة + Property-based (المجموع دائمًا صحيح، لا مبالغ سالبة، التواريخ مرتبة، نهاية الشهر).
- Reservations: منع الحجز المزدوج + الانتهاء.
- Permissions و Field-level security.
- Portal policy access (Self، Guardian، Org roles، Guest).
- Messaging Policy (24h، Consents، Quiet hours).
- Handoff idempotency و needs_review.
- Import dry-run و upsert.
- Backward compatibility لـ Endpoints السيلز الحالية.

---

## 57. التوثيق و ADRs

### 57.1 الوثائق داخل المشروع
```
docs/service/
├── README.md
├── ARCHITECTURE.md
├── DOMAIN_MODEL.md          (Diagram)
├── DATABASE.md              (ERD)
├── SOURCE_OF_TRUTH.md
├── EVENTS.md
├── PERMISSIONS.md
├── API.md / openapi.yaml
├── ERROR_CODES.md
├── CASES.md  SERVICE_RECORDS.md  ASSETS.md  ENTITLEMENTS.md
├── WORK_ORDERS.md  SLA.md  ASSIGNMENT.md  SCHEDULING.md
├── CATALOG_AND_CAPABILITIES.md
├── CONTRACTS.md  DOCUMENTS.md  BILLING_LITE.md  SUBSCRIPTIONS.md
├── HANDOFF.md  PORTAL.md  MESSAGING_POLICY.md
├── AUTOMATION.md  FOLLOW_UPS.md  IMPORTS.md  INTEGRATIONS.md
├── AI.md  REPORTS.md  TEMPLATES.md
├── PLAYBOOKS/ (shipping.md, tourism.md, education.md, devices.md, saas.md, real-estate.md)
└── IMPLEMENTATION_PHASES.md
```

### 57.2 ADRs
```
ADR-001 Modular Monolith
ADR-002 Customer is Master Identity (No Account)
ADR-003 Participant Identity (contact_id nullable + person_snapshot)
ADR-004 Event-driven with Transactional Outbox
ADR-005 No Event Sourcing
ADR-006 Hybrid Schema + schema_version
ADR-007 Shared Workflow Engine
ADR-008 Service Record Boundary
ADR-009 Capabilities over Service Models
ADR-010 Billing Lite Boundary (No Accounting)
ADR-011 Payment Plans as Rules + Contract Snapshot
ADR-012 Document Builder vs Business Logic
ADR-013 Optimistic Concurrency
ADR-014 SLA Engine Independent from Workflow
ADR-015 Unified Portal Identity
ADR-016 Read Models for My Work and Reports
ADR-017 Messaging Policy Layer
ADR-018 Record Entries for Repeating Data
```

---

## 58. المتطلبات غير الوظيفية

> القيم التالية **[مفتوح]** وتحتاج تأكيدًا من الإدارة، والمذكور توصية مبدئية للتصميم.

| البند | التوصية المبدئية |
|---|---|
| عدد الـ Tenants خلال سنة | 100–500 |
| أكبر Tenant | 200 موظف، 5,000 Case/يوم، 20,000 شحنة/يوم |
| الرسائل | 100,000 رسالة/يوم على مستوى المنصة |
| زمن استجابة API (p95) | < 300ms للقراءة، < 500ms للكتابة |
| تأخر الـ Events (Outbox → Consumer) | p95 < 5 ثوانٍ |
| دقة الـ SLA Scheduler | < 1 دقيقة |
| Realtime | < 2 ثانية |
| التوفر | 99.5% |
| النسخ الاحتياطي | يومي + Point-in-time recovery |
| Retention الـ Audit | 7 سنوات [يُراجع قانونيًا] |

---

## 59. قاموس المصطلحات

| المصطلح | التعريف |
|---|---|
| Tenant | شركة عميلة لـ ICAN (بيانات معزولة) |
| Customer | الطرف المتعاقد/الدافع لدى الـ Tenant (Master Record) |
| Contact | شخص له علاقة دائمة بالـ Customer |
| Participant | شخص مشارك في Service Record معين (قد لا يكون Contact) |
| Item | منتج/خدمة/خطة/باقة في الكتالوج |
| Item Type | قالب يعرّفه الـ Tenant يحدد Capabilities وحقول الـ Item |
| Capability | صفة لها سلوك برمجي (Serial، Warranty، Recurrence...) |
| Item Instance | قطعة محددة من Item (Serial، وحدة A-305) |
| Service Model | Preset (A–H) يفعّل Capabilities افتراضية |
| Service Record | الخدمة الفعلية المقدمة للعميل (Booking، Shipment...) |
| Service Batch | تجميع سجلات (Manifest، Trip Group، Cohort) |
| Component | جزء من خدمة مركبة (فندق داخل حجز) |
| Record Entry | بيانات متكررة داخل السجل (حضور، محاولة توصيل) |
| Asset | شيء أصبح مملوكًا/مخصصًا للعميل |
| Warranty | ضمان على Asset |
| Entitlement | حق العميل في خدمة، برصيد وفترة |
| Case | مشكلة/طلب/استفسار/شكوى |
| Work Order | تنفيذ فعلي (زيارة، تركيب، توصيل) |
| Queue | طابور عمل بقواعد دخول |
| Portfolio | مجموعة عملاء مسندة لموظفين |
| Follow-up Program | برنامج متابعة زمني يولّد Tasks |
| Handoff | تحويل العميل من السيلز للخدمة |
| Payment Plan | قواعد سداد (ليست مبالغ) |
| Payment Schedule | جدول سداد مجمد لعقد |
| Reservation | حجز سعة (مؤقت أو مؤكد) |
| SLA Instance | نسخة SLA مجمدة على Case |
| Messaging Policy | طبقة تحقق قبل أي رسالة خارجة |
| Work Items | Read Model لشاشة My Work |
| Industry Template | Seed Data جاهزة لمجال |

---

## 60. القرارات المفتوحة

| # | القرار | التوصية | يجب حسمه قبل |
|---|---|---|---|
| 1 | الـ Stack (Framework الباك إند) | الحفاظ على الـ Stack الحالي | Phase 0 |
| 2 | قاعدة البيانات | PostgreSQL (JSONB، GIN، pg_trgm، Partitioning) | Phase 0 |
| 3 | الـ Queue | Redis-based لو الـ Stack يدعمه جيدًا، RabbitMQ لو الحجم أكبر | Phase 0 |
| 4 | مجالا الـ Pilot | B (أجهزة/صيانة) + E (سياحة) أو D (تعليم) | Phase 3 (يفضل Phase 1) |
| 5 | لحظة Deal Won | عند توقيع العقد، مع إعداد لكل Tenant | Phase 3 |
| 6 | Contracts/Invoices الحالية في السيلز | هل يوجد شيء يُرحّل؟ | Phase 3 |
| 7 | ERP المستهدف أولًا | Odoo (شائع في السوق المحلي) | Phase 4 |
| 8 | بوابات الدفع | Paymob + Fawry | Phase 4 |
| 9 | تسعير الشحن (Rate Cards) | Capability `pricing_rules` لاحقة، أو من نظام العميل | Phase 4 (لو الشحن Pilot) |
| 10 | مزود WhatsApp (Cloud API مباشر أم BSP) | حسب الموجود في Conversations | Phase 0 |
| 11 | مزود الـ AI والاستضافة وحدود البيانات | يُحسم مع سياسة الخصوصية | Phase 7 (الواجهة من Phase 2) |
| 12 | تطبيق موبايل للفني/المندوب | PWA أولًا | Phase 4 |
| 13 | أرقام المتطلبات غير الوظيفية | القسم 58 | Phase 0 |
| 14 | سياسة Retention للبيانات | حسب القانون المصري وطلبات العملاء | Phase 6 |
| 15 | توقيع العقود الإلكتروني | OTP داخلي أولًا، مزود خارجي لاحقًا | Phase 3 |

---

## الخلاصة

المطلوب ليس إنهاء كل الـ Features مرة واحدة، بل بناء **Core Architecture ثابتة** بحيث كل مرحلة جديدة **Extension** لا إعادة بناء.

**ابدأ من Phase 0 فقط.** وقبل كتابة الكود:
1. راجع المشروع الحالي وحدد ما سيُعاد استخدامه.
2. احسم القرارات المفتوحة 1، 2، 3، 10، 13.
3. اكتب ADRs.
4. ارسم Domain Diagram و ERD مبدئي.
5. حدد Event Catalog الأولي و API Contracts.
6. ضع Migration Plan يحافظ على التوافق.
7. قدم Implementation Plan تفصيلي لـ Phase 0 و Phase 1.
