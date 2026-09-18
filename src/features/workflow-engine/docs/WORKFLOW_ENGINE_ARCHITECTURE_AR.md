# Workflow Engine — التوثيق المعماري

هذا الملف هو المرجع المعماري الوحيد لكل تطوير مستقبلي متعلق بالـ Workflow/Automation في ICAN CRM. أي Module جديد يريد إضافة قدرات Automation يبدأ من هنا.

---

## 1. الهدف

بناء محرك **Workflow/Automation واحد مركزي** قابل لإعادة الاستخدام من كل الـ Modules (Sales, Growth, Tasks, Customer Service مستقبلًا)، بدلًا من بناء محرك منفصل لكل Module. أي Module يقدر:

- يسجّل الـ Triggers/Conditions/Actions/Variables الخاصة بيه.
- يفتح نفس الـ Workflow Builder.
- الـ Builder يتكيّف تلقائيًا حسب الـ Module اللي فتحه.
- يستخدم Actions من Modules تانية (Cross-module).

## 2. لماذا Engine مركزي

لو كل Module عمل محرك خاص بيه (`SalesWorkflowEngine`, `CampaignWorkflowEngine`, ...) هيحصل:

- تكرار نفس منطق الـ Builder/الـ Validation/الـ Execution في كل Module.
- استحالة عمل Workflow يعبر أكتر من Module (زي: حملة تواصل تنشئ فرصة بيعية وتسند مندوب مبيعات).
- صعوبة الصيانة وأي تحسين لازم يتكرر في كل مكان.

الحل: **Module واحد يملك الـ Engine، وكل Module تاني يملك بس تعريفات (Definitions) يسجلها فيه.**

## 3. الفرق بين Workflow وAutomation

- **Workflow**: التعريف نفسه (Trigger + خطوات + شروط + Actions) — هو "الخطة".
- **Automation**: هو المفهوم الأشمل اللي بيغطي تنفيذ الـ Workflow فعليًا (Execution، الـ Event Bus، الـ Scheduler). في هذا الكود، الـ Workflow (التعريف/الـ UI) **موجود وشغال**، لكن الـ Automation (التنفيذ الفعلي) **غير موجود** لأنه محتاج Backend engine كامل (راجع قسم 43 و`WORKFLOW_ENGINE_BACKEND_REQUIREMENTS.md`).

## 4. Registry Architecture

`src/features/workflow-engine/registry/workflowRegistry.js` هو **مصدر الحقيقة الوحيد**. كل Module بينده `registerWorkflowModule({ module, labelKey, triggers, conditions, actions, variables })` مرة واحدة عند تحميل ملفه. الـ Registry بيوفر:

```js
getModule(id)          getModules()
getTriggers(module?)   getConditions(module?)   getActions(module?)
getTrigger(id)         getAction(id)            getCondition(id)
getActionsForContext({module})     // Recommended / هذا الـ Module / Cross-module
getTriggersForContext({module})
registerDataSource(key, {labelKey})   getDataSource(key)   getDataSources()
```

لا يوجد أي مكان تاني في الكود بيحدد الـ Triggers/Actions المتاحة — كل حاجة بتتقرأ من هنا.

## 5. Module Definitions

كل Module بيعرّف قدراته في ملف واحد:

```
features/leads/workflow/leadWorkflowDefinition.js
features/opportunities/workflow/opportunityWorkflowDefinition.js
features/outreach-campaigns/workflow/outreachWorkflowDefinition.js
features/tasks/workflow/taskWorkflowDefinition.js
```

هذه الملفات **بيانات فقط** — مفيهاش أي منطق تنفيذ، بس `registerWorkflowModule(...)` في آخر السطر. كل ملف موثّق بتعليق يوضح أي Action فعليًا متصل بـ API حقيقي (`backendSupport: true`) وأيهم لسه محتاج Backend (`backendSupport: false`) — راجع كل ملف للتفاصيل الدقيقة.

## 6. Trigger

عنصر بيبدأ الـ Workflow. الشكل:

```js
{ id: 'lead.status_changed', type: 'trigger', module: 'leads', category: 'lead',
  labelKey, descriptionKey, icon, eventName: 'lead.status_changed', fields: [...], backendSupport: false }
```

**كل الـ Triggers في التطبيق حاليًا `backendSupport: false`** — مفيش Event Bus أو Webhook system في الباك إند أصلًا (تم التأكد من هذا بالبحث الكامل في الكود قبل البناء)، فهذا مش خاص بـ Module معين.

## 7. Conditions

شرط قابل لإعادة الاستخدام جوه عنصر `condition`. شكل التعريف (يُسجَّل زي الـ Trigger/Action):

```js
{ id: 'lead.status', type: 'condition', module: 'leads', labelKey,
  operators: ['equals','not_equals','in','not_in'], fields: [{key:'value', type:'select', source:'lead_statuses'}] }
```

النسخة الأولى من الـ UI (`WorkflowNodeProperties.jsx`'s `ConditionEditor`) بسيطة عمدًا (راجع قسم "First UI version may remain simple" في الطلب الأصلي): قائمة قواعد `{field, operator, value}` تُجمع بـ AND افتراضيًا (أو OR لو المستخدم اختار). المستخدم يقدر يختار شرط مسجّل من الـ Registry (بيملأ `field`/`source` تلقائيًا) أو يكتب اسم حقل حر لأي حالة غير مسجّلة.

## 8. Actions

عملية قابلة لإعادة الاستخدام. كل Action تنتمي لـ Module واحد لكنها متاحة للاستخدام من أي Workflow بغض النظر عن الـ Module اللي فتح الـ Builder (Cross-module):

```js
{ id: 'task.create', type: 'action', module: 'tasks', labelKey, icon, recommended: true,
  fields: [...], backendSupport: true }
```

`backendSupport` هنا معناه: **هل العملية دي عندها API حقيقي فعلاً موجود في المشروع** — ده مستقل تمامًا عن كون الـ Workflow ممكن ينفذ فعليًا (محدش ينفذ فعليًا حاليًا لعدم وجود Automation Engine خلفي — راجع قسم 3).

## 9. Branch (Condition Node)

عنصر منطقي بيقسم المسار لفرعين (`true`/`false`). البناء الداخلي شجرة (Tree) مش Graph حر — راجع قسم "لماذا Tree وليس Canvas حر" (قسم 20).

## 10. Wait

عنصر انتظار بمدة ثابتة أو حتى تاريخ محدد:

```js
{ type: 'wait', config: { mode: 'duration', value: 2, unit: 'days' } }
// أو
{ type: 'wait', config: { mode: 'until', until: '2026-10-01T10:00' } }
```

لا يوجد تنفيذ فعلي للانتظار في المتصفح — هذا يحتاج Scheduler/Queue في الباك إند (موثّق في `WORKFLOW_ENGINE_BACKEND_REQUIREMENTS.md`).

## 11. Wait For Event

عنصر بينتظر حدوث Trigger معين (مثلاً "رد العميل") بمهلة قصوى اختيارية، وله فرعان: `resolved` (تم الحدث) و`timeout` (انتهت المهلة):

```js
{ type: 'wait_for_event', config: { eventTriggerId: 'campaign.message_replied', timeout: { value: 2, unit: 'days' } } }
```

هذا العنصر أساسي لسيناريو Outreach Sequence (قسم 25). لا يوجد Scheduler خلفي لتنفيذه فعليًا اليوم — الواجهة توضح هذا بملاحظة دائمة داخل محرر الخاصية.

## 12. Context

كائن بسيط بيوصف مين فاتح الـ Builder ومن أين:

```js
{ module: 'outreach-campaigns', entity: 'campaign', entityId: 123, source: 'campaign-details' }
```

الـ Context بيحدد: القناة الافتراضية للـ Triggers، الـ Actions المقترحة أولًا، وأي متغيرات تظهر. **الـ Context لا ينشئ Engine منفصل** — هو مجرد بيانات تمرر لنفس الـ Builder.

## 13. Full Mode vs Embedded/Context Mode

- **Full Mode** (`<WorkflowBuilder mode="full" />`): يُفتح من مركز الأتمتة (`/automation`)، المستخدم يختار أي Module بنفسه.
- **Context Mode** (`<WorkflowBuilder mode="context" context={{...}} />`): يُفتح من داخل Module معين، الـ Module محدد مسبقًا، الـ Triggers/Actions الخاصة بيه تظهر أولًا، مع بقاء كل الـ Actions من باقي الـ Modules متاحة (Cross-module لا يُخفى أبدًا).

كلا الوضعين نفس المكوّن (`WorkflowBuilder.jsx`) — لا يوجد تكرار.

## 14. Variables System

كل Module يسجّل متغيراته الخاصة ضمن `variables` في ملف التعريف (مثال: `{key: 'lead.name', labelKey: '...'}`). حقل من نوع `variable_text` (`components/fields/VariableTextField.jsx`) بيسمح بإدراج `{{key}}` ومعاينة تقريبية باستخدام بيانات وهمية للعرض فقط (`utils/workflowVariables.js`). **الاستبدال الفعلي للمتغيرات وقت الإرسال الحقيقي مسؤولية الباك إند بالكامل** — لا يوجد أي منطق Interpolation حقيقي هنا، فقط معاينة محلية توضيحية.

## 15. Data Sources

حقل من نوع `select`/`multiselect`/`user`/`team`/`template`/`channel` بيربط بـ `source` (مثال: `'users'`, `'lead_statuses'`, `'whatsapp_phone_numbers'`). `hooks/useDataSourceOptions.js` هو المكان الوحيد اللي بيربط اسم الـ Source بـ Hook حقيقي في المشروع (`useUsers`, `useTeams`, `useFacebookIntegrations`, ...). لا يوجد أي مكوّن حقل بيعمل Fetch مباشر لأي API.

## 16. Templates

`templates/workflowTemplates.js` — 5 قوالب جاهزة (Follow Up New Lead, Retarget No Reply, High Intent → Opportunity, Task Overdue Reminder, Won Deal Follow-up)، كل واحد `build()` بيرجّع كائن `Workflow` كامل جاهز يتفتح في الـ Builder مباشرة. **لا يوجد منطق تنفيذ منفصل للقوالب** — القالب مجرد بيانات ابتدائية.

## 17. Cross-module Workflows

مثال حقيقي مبني في الكود: Workflow يبدأ من حملة تواصل (Trigger: `campaign.message_replied`) وينتهي بإنشاء فرصة بيعية (Action: `opportunity.create` من Module الفرص) وإسناد مستخدم (Action من Module العملاء المحتملين/الفرق). هذا شغال في الـ Registry مباشرة (`getActionsForContext` بترجع دايمًا كل الـ Modules التانية تحت قسم منفصل)، مفيش أي قيد يمنع هذا.

## 18. Events (Event Bus)

**غير موجود في الباك إند اليوم.** كل الـ Triggers مسجّلة بأسماء أحداث ثابتة (`eventName`, مثال: `lead.status_changed`) جاهزة لباك إند يبني عليها Event Bus حقيقي مستقبلًا (راجع `WORKFLOW_ENGINE_BACKEND_REQUIREMENTS.md`). المبدأ المعماري الموصى به: `Module → Domain Event → Event Bus → Workflow Engine → Workflows المطابقة → Execution` — **وليس** ربط مباشر بين خدمتين (`LeadService → CampaignWorkflowService` ممنوع).

## 19. Executions

**غير موجودة اليوم.** لا يوجد أي تخزين محلي وهمي لعمليات تنفيذ — تبويب "Executions" في مركز الأتمتة بيعرض حالة فارغة صادقة ("لا يوجد سجل تنفيذ بعد") بدل ما يخترع بيانات.

## 20. Logs

نفس مبدأ Executions — تبويب "Logs" فاضي بشكل صادق. الشكل المفاهيمي للسجل المستقبلي موثّق في `WORKFLOW_ENGINE_BACKEND_REQUIREMENTS.md` (Workflow Started → Trigger Matched → Condition Evaluated → Action Queued/Sent → Wait Started → ...).

## 21. Versioning

موثّق كمتطلب Backend فقط (`Workflow → WorkflowVersion → WorkflowExecution → WorkflowNodeExecution`). **لا يوجد تخزين نسخ في الفرونت إند** — كل تعديل على Workflow محلي بيحدّث نفس السجل مباشرة (`useWorkflowStore.save`). هذا القيد موثّق بوضوح كفجوة تحتاج حل Backend قبل استخدام حقيقي واسع.

## 22. Retry

موصى به فقط على مستوى الـ Backend workers/queues — لا علاقة للفرونت إند به إطلاقًا.

## 23. Idempotency

نفس الشيء — مسؤولية الـ Backend بالكامل عند تنفيذ Actions فعليًا (تجنب إنشاء 3 فرص/3 مهام من إعادة محاولة فاشلة).

## 24. Loop Protection

موثّق كمتطلب Backend: `execution context`, `causation_id`, `correlation_id`, حد أقصى للعمق، منع تكرار الأحداث. **لا يوجد أي حماية من اللوب في الفرونت إند لأن الفرونت إند لا ينفذ أي شيء أصلًا.**

## 25. Permissions

**لا يوجد نظام صلاحيات حقيقي في المشروع بالكامل** (تم التأكد بالبحث الشامل، كما في باقي الوحدات المبنية في هذا الـ Codebase). مفاتيح محجوزة فقط للمستقبل: `automation.view`, `automation.create`, `automation.edit`, `automation.activate`, `automation.pause`, `automation.delete`, `automation.logs.view`. عند بناء نظام صلاحيات حقيقي، هذه المفاتيح جاهزة للربط من غير تعديل بنية الـ Engine.

## 26. Tenant Capabilities

نفس المبدأ: `automation.basic`, `automation.advanced`, `automation.cross_module` أسماء محجوزة فقط، غير مفعّلة اليوم (مفيش نظام باقات/Entitlements في المشروع كله).

## 27. Backend Requirements

راجع `WORKFLOW_ENGINE_BACKEND_REQUIREMENTS.md` للتفاصيل الكاملة (الـ APIs المقترحة، الـ Domain Model، Event Bus، Action Executors، الفجوات الحالية في كل Module).

## 28. طريقة إضافة Module جديد

1. أنشئ `features/<module>/workflow/<module>WorkflowDefinition.js`.
2. عرّف الـ Triggers (كل واحد `eventName` واضح بصيغة `entity.event`).
3. عرّف الـ Conditions.
4. عرّف الـ Actions — لكل Action تأكد من الـ API الحقيقي قبل ما تحط `backendSupport: true`، وإلا سيبها `false` ووثّق السبب في تعليق.
5. عرّف `variables` لو الـ Module عنده بيانات مفيدة للرسائل (`{{key}}`).
6. نادِ `registerWorkflowModule({...})` في آخر الملف.
7. أضف الملف لقائمة الـ imports في `config/registerBuiltinModules.js` (سطر واحد بس).
8. لو محتاج تفتح الـ Builder من صفحة الـ Module: استخدم `<WorkflowLauncher context={{module:'<module>', entity:'<entity>'}}>نص الزر</WorkflowLauncher>`.

**لا حاجة لتعديل أي ملف جوه `workflow-engine/core`, `registry`, `builder`, أو `nodes` لإضافة Module جديد.**

## 29. طريقة إضافة Trigger

أضف كائن جديد داخل `triggers: [...]` في ملف تعريف الـ Module:

```js
{ id: 'entity.event_name', type: 'trigger', module: '<module>', category: '<category>',
  labelKey: 'workflow.<module>.triggers.eventName.label', icon: '<LucideIconName>',
  eventName: 'entity.event_name', fields: [...], backendSupport: false }
```

أضف الترجمة في `locales/ar/common.json` و`locales/en/common.json` تحت نفس الـ `labelKey`.

## 30. طريقة إضافة Action

نفس الفكرة داخل `actions: [...]`:

```js
{ id: 'entity.action_name', type: 'action', module: '<module>', labelKey: '...',
  icon: '<LucideIconName>', recommended: true|false, fields: [ { key, type, labelKey, source?, required? } ],
  backendSupport: true|false }
```

لو الحقل بيحتاج قائمة بيانات حقيقية (مستخدمين، حالات، ...) استخدم `source` بمفتاح موجود في `hooks/useDataSourceOptions.js`، أو أضف مصدر جديد فيه (خطوة واحدة: أضف `case` جديد + سجّله في `config/registerDataSources.js`).

## 31. طريقة استدعاء الـ Builder من أي Module

**الطريقة الموصى بها (زر جاهز):**
```jsx
import { WorkflowLauncher } from 'src/features/workflow-engine'

<WorkflowLauncher context={{ module: 'leads', entity: 'lead' }}>
  إنشاء أتمتة
</WorkflowLauncher>
```

**الطريقة المرنة (Hook فقط، للتحكم الكامل في مكان الزر/الفتح):**
```jsx
import { useWorkflowBuilder, WorkflowBuilder } from 'src/features/workflow-engine'

const workflow = useWorkflowBuilder({ module: 'tasks', entity: 'task' })
// ...
<button onClick={workflow.open}>...</button>
{workflow.isOpen && (
  <WorkflowBuilder mode="context" context={workflow.context} onCancel={workflow.close} />
)}
```

**الطريقة المدمجة (بدون Modal، داخل تبويب صفحة موجودة بالفعل)** — تمامًا زي تبويب "التسلسل / الأتمتة" داخل تفاصيل حملة التواصل:
```jsx
<WorkflowBuilder mode="context" context={{ module: 'outreach-campaigns', entity: 'campaign', entityId: campaign.id }} embedded />
```

## 32. أمثلة Sales

راجع `features/leads/workflow/leadWorkflowDefinition.js` — مثال حقيقي: Trigger `lead.status_changed` → Action `lead.assign_user` (حقيقي، عبر `leadAssignmentApi.distributeManually`) → Action `task.create` (حقيقي، Cross-module من Tasks).

## 33. أمثلة Campaigns

راجع `features/outreach-campaigns/workflow/outreachWorkflowDefinition.js` وقالب "High Intent → Opportunity" في `templates/workflowTemplates.js` — مثال حقيقي: Trigger `campaign.message_replied` → Condition (القناة = واتساب) → Action `opportunity.create` (Cross-module، لكنه `backendSupport: false` لأن الفرص البيعية Mock بالكامل حاليًا) → Action `task.create` (حقيقي).

## 34. أمثلة Customer Service

**لا توجد أمثلة مبنية** — لأن Module خدمة العملاء/التذاكر غير موجود في هذا الكود أصلًا (لا API، لا صفحات). لم يُسجَّل أي Trigger/Action وهمي له، احترامًا لقاعدة "لا تبني وظائف تذاكر وهمية قبل وجود الـ Module نفسه". لما يُبنى Module خدمة العملاء مستقبلًا، اتبع قسم 28 بالظبط لإضافته — الـ Registry والـ Builder جاهزين لاستقباله من غير أي تعديل.

## 35. Opportunity Center vs Opportunities (تذكير)

مفهوم "Stage" المذكور في المواصفة الأصلية غير موجود فعليًا في الكود — الفرص البيعية عندها `status` مسطح فقط (`new/reviewing/watching/qualified/activated/dismissed/expired`، راجع `features/opportunities/constants/opportunityTypes.js`). تم تعريف Conditions/Actions الفرص البيعية على أساس هذا الواقع الفعلي بدل اختراع حقل "Stage" غير موجود.

## 36. Future Roadmap

بالترتيب المقترح: (1) بناء Backend حقيقي لـ Opportunities (شرط أساسي لتفعيل أي Action خاص بيها)، (2) Event Bus + endpoint تخزين الـ Workflows، (3) Scheduler/Queue لتفعيل عناصر Wait/Wait For Event فعليًا، (4) Campaign Events الحقيقية (Delivered/Read/Replied) لتفعيل مثال "High Intent → Opportunity" فعليًا، (5) Messenger send API حقيقي، (6) نظام صلاحيات حقيقي لتفعيل مفاتيح `automation.*` المحجوزة، (7) Sequence UI مخصص فوق نفس الـ Engine (تسلسل بصري أوضح من عرض الشجرة الحالي)، (8) Customer Service module ثم تسجيل تعريفاته بنفس الطريقة الموثقة في قسم 28.

---

## الخلاصة المعمارية

```
Module
  ├── يعرّف Triggers
  ├── يعرّف Conditions
  ├── يعرّف Actions
  └── يعرّف Variables
         │
         ▼
   Workflow Registry (مصدر الحقيقة الوحيد)
         │
         ▼
   Workflow Builder (مكوّن واحد لكل الـ Modules)
         │
         ▼
   (Backend Automation Engine — غير موجود اليوم، موثّق في WORKFLOW_ENGINE_BACKEND_REQUIREMENTS.md)
```

لا يوجد أي Module في هذا الكود يملك محرك Workflow خاص بيه. الإضافة المستقبلية الوحيدة المطلوبة من أي Module جديد هي **تسجيل قدراته**، مش بناء أي جزء من الـ Engine نفسه.
