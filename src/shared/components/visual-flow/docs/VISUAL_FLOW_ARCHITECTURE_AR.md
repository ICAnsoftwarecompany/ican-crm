# VisualFlow Architecture

هذا الملف هو المرجع الذي تشير إليه كل تعليقات `see docs/VISUAL_FLOW_ARCHITECTURE_AR.md` و`see docs "..."` المنتشرة داخل `src/shared/components/visual-flow/*`. إذا كنت تقرأ تعليقًا في الكود يشير لقسم هنا بالاسم، ستجده أدناه بنفس العنوان تقريبًا.

هذا ملف عن **VisualFlow نفسه** (الطبقة العامة/المجردة). طبقة الـ Workflow (المُشغّلات/الشروط/الإجراءات الخاصة بـ CRM، الـ Builder، الـ Registry الخاص بالوحدات) لها ملفها الخاص: `src/features/workflow-engine/docs/WORKFLOW_ENGINE_ARCHITECTURE_AR.md`. لا تكرّر محتوى ذلك الملف هنا — كل ما هو "Workflow-specific" ينتمي هناك، وكل ما هو "أي flow بصريًا" ينتمي هنا.

## الهدف والحدود

`shared/components/visual-flow/` مكتبة **محايدة تمامًا تجاه أي دومين**. لا تعرف شيئًا عن Leads/Opportunities/Campaigns/Workflow/Tasks. كل ما هو خاص بدومين معيّن (أنواع العقد، الأيقونات، الحقول، القيم الافتراضية) يصل إليها عبر props من الـ feature المستهلكة — الـ `nodeRegistry`/`edgeRegistry`/`context` بالتحديد. لا تُضِف أبدًا import من هذا الفولدر إلى أي شيء تحت `features/*` — هذا ينتهك حد الاعتماد نفسه الذي يفرضه `scripts/check-architecture.mjs` على كل `shared/*`.

المكتبة مبنية فوق `@xyflow/react` (React Flow) لكنها لا تُسرّب تفاصيله لباقي التطبيق — أي كود خارج هذا الفولدر يتعامل مع عقود VisualFlow الخاصة (`VisualFlowNode`/`VisualFlowEdge`/`VisualFlowModel`)، وليس مع أنواع `@xyflow/react` مباشرة.

## البنية

```text
visual-flow/
├── index.js                     الـ Public API — استورد من هنا فقط
├── VisualFlow.jsx                المكوّن الرئيسي (كل شيء مجمّع)
├── VisualFlowCanvas.jsx          طبقة @xyflow/react الفعلية فقط
├── VisualFlowProvider.jsx        Context (registry/capabilities/executionState/mode/resolveIcon)
├── VisualFlowToolbar.jsx         شريط أدوات اختياري بالكامل (opt-in)
├── VisualFlowControls.jsx        غلاف مُنسَّق لـ Controls من @xyflow/react
├── VisualFlowMiniMap.jsx         غلاف مُنسَّق لـ MiniMap من @xyflow/react
├── VisualFlowBackground.jsx      غلاف مُنسَّق لـ Background من @xyflow/react
├── VisualFlowSidebar.jsx         Sidebar عام لاختيار عنصر (flow/workflow/...) من قائمة
├── VisualFlowEmptyState.jsx      يعيد استخدام shared/components/feedback/EmptyState
├── VisualFlowLoadingState.jsx    يعيد استخدام shared/components/ui/Spinner (PageSpinner)
├── VisualFlowErrorState.jsx      حالة خطأ + إعادة محاولة
├── VisualFlowErrorBoundary.jsx   يعيد استخدام shared/components/feedback/ErrorBoundary
├── types.js                      JSDoc typedefs فقط — لا كود تنفيذي
├── visual-flow.css                أنيميشن الحواف المتحركة فقط
├── constants/
│   ├── flowModes.js               VISUAL_FLOW_MODES + resolveCapabilities()
│   ├── nodeCategories.js          فئات العقد الافتراضية (اختيارية للمستهلك)
│   ├── executionStates.js         حالات التنفيذ + typedefs التنفيذ
│   └── defaults.js                إصدار الـ schema، أبعاد افتراضية، معرّفات المنافذ
├── nodes/
│   ├── BaseNode.jsx                المُعرِّض العام لكل أنواع العقد تقريبًا
│   ├── StartNode.jsx / EndNode.jsx شكل مختلف فعليًا (نقطة بداية/نهاية)
│   ├── UnknownNode.jsx             عقدة type غير مسجَّل — لا يتعطل الرسم أبدًا
│   └── index.js                    defaultNodeComponents map
├── edges/
│   ├── BaseEdge.jsx                مُعرِّض واحد لكل أنواع الحواف
│   └── index.js
├── panels/
│   ├── NodeLibraryPanel.jsx        بحث + سحب/إفلات لإضافة عقدة (drag من HTML5 DnD)
│   ├── PropertiesPanel.jsx         نموذج مُولَّد من definition.properties
│   ├── ExecutionPanel.jsx          عرض executionState فقط — لا يجلبه أبدًا
│   └── FlowValidationPanel.jsx     عرض أخطاء/تحذيرات validateFlow
├── registry/
│   ├── createNodeRegistry.js       Map<type, definition> + combineNodeRegistries
│   ├── createEdgeRegistry.js       نفس الشكل للحواف
│   ├── defaultNodeRegistry.js      start/end/group/data — عقد عامة اختيارية
│   └── defaultEdgeRegistry.js      default/conditional/animated/execution
├── adapters/
│   ├── createFlowAdapter.js        {fromApi, toApi} — المكان الوحيد المسموح لتسرّب شكل الباك إند
│   └── normalizeFlowData.js        تسامح كامل مع مدخلات ناقصة/مشوَّهة
├── utils/
│   ├── flowValidation.js           validateConnection (وقت الوصل) + validateFlow (الفلو كامل)
│   ├── layoutUtils.js              applyLayout — تخطيط طبقي بسيط بدون مكتبة خارجية
│   ├── graphUtils.js               find/getIncomers/getOutgoers/hasCycle/duplicateNodes
│   ├── edgeUtils.js                buildEdge/isDuplicateConnection
│   ├── nodeUtils.js                resolveNodeDefinition/getNodeCapabilities
│   ├── idUtils.js                  generateFlowId (crypto.randomUUID مع fallback)
│   └── serialization.js            serializeFlow/deserializeFlow/migrateFlow
└── hooks/
    ├── useVisualFlow.js             واجهة مُجمِّعة (facade) — "أريد محرِّرًا يعمل" بسرعة
    ├── useVisualFlowState.js        controlled/uncontrolled nodes+edges — المكان الوحيد + Canvas اللي بيستوردوا @xyflow/react
    ├── useVisualFlowSelection.js    selectedNodeIds/selectedEdgeIds خارج @xyflow/react
    ├── useVisualFlowHistory.js      undo/redo عبر commit() صريح
    ├── useVisualFlowClipboard.js    نسخ/لصق (Map في ref، ليس localStorage)
    ├── useVisualFlowKeyboard.js     اختصارات لوحة المفاتيح القياسية
    ├── useVisualFlowViewport.js     zoom/fitView/setViewport — يحتاج ReactFlowProvider
    ├── useVisualFlowValidation.js   يغلِّف validateFlow في useMemo
    └── useVisualFlowPersistence.js  isDirty/markClean فقط — لا حفظ فعلي أبدًا
```

## البيانات الأساسية (types.js)

كل شيء موثّق كـ JSDoc typedefs في `types.js` (الملف لا يُصدِّر كودًا تنفيذيًا — فقط للتوثيق ولـ `@param {import('.../types').X}` في باقي الملفات):

- **`VisualFlowNode`**: `{ id, type, position:{x,y}, data, metadata?, selected? }`. `type` هو معرّف في الـ registry، **ليس** اسم مكوّن React.
- **`VisualFlowEdge`**: `{ id, source, sourceHandle?, target, targetHandle?, type?, data? }`.
- **`VisualFlowModel`**: `{ schemaVersion, metadata?, viewport?, nodes[], edges[] }` — الشكل القانوني الوحيد الذي يتعامل معه VisualFlow، بغض النظر عن شكل أي API خارجي.
- **`VisualFlowNodeDefinition`**: العنصر الذي تسجّله في الـ registry — `type`, `category`, `labelKey`, `icon?` (اسم يحلّه `resolveIcon` الخاص بالمستهلك، وليس مكتبة أيقونات مربوطة داخل core)، `colorToken?` (اسم CSS custom property، لا hex ثابت)، `kind?` (`'start'|'end'|'unknown'|'default'`)، `ports`, `properties`, `validate?`, `capabilities?` (تجاوز لكل عقدة)، `recommended?`, `disabled?`.
- **`VisualFlowPropertyField`**: يصف حقلًا واحدًا في Properties Panel — `type` أحد: `text|textarea|number|select|multiselect|boolean|date|datetime|duration|user|team|entity|template|custom`. `source?` يحدد أي "مصدر بيانات" ديناميكي (VisualFlow لا يجلبه بنفسه، فقط يطلبه عبر `resolveFieldOptions`).
- **`VisualFlowAdapter`**: `{fromApi, toApi}`.

## الـ Public API

استورد فقط من `shared/components/visual-flow` (أي `index.js`) — **لا تستورد من مسار داخلي مباشرة أبدًا** (مثل `visual-flow/hooks/useVisualFlowState` مباشرة). هذا يحافظ على قدرة إعادة الهيكلة الداخلية دون كسر أي مستهلك. كل ملف جديد يُضاف للمكتبة يجب أن يُصدَّر من `index.js` إذا كان جزءًا من العقد العام.

## VisualFlow — المكوّن الرئيسي

`<VisualFlow>` هو نقطة الدخول لمعظم الاستخدامات — يُركِّب: `VisualFlowProvider` + `VisualFlowCanvas` + Toolbar + panels اليسار/اليمين + سلوك الموبايل (AppDrawer بدل الأعمدة الجانبية تحت 1024px) + الحالات غير المتزامنة (`isLoading`/`error`).

أهم قواعد الـ props:
- **البيانات**: مرِّر إما `nodes`/`edges`/`onNodesChange`/`onEdgesChange` (controlled) أو `defaultNodes`/`defaultEdges` (uncontrolled) — لا تخلط الاثنين لنفس الـ instance.
- **`leftPanel`/`rightPanel`/`bottomPanel`**: تجاوز صريح دائمًا يفوز على الافتراضي المبني من `capabilities`. تمرير `null` صراحة (وليس `undefined`) يعني "لا يوجد panel هنا إطلاقًا"، حتى لو كانت الـ capabilities تسمح بواحد.
- **`toolbar`**: كائن opt-in — لا يظهر أي زر إلا إذا طُلب صراحة (`{ undo: true, save: true, ... }`).
- **`mode`**: يحدد `capabilities` الافتراضية (القسم التالي). `capabilities` prop تكتب فوقها جزئيًا فقط لما تحتاجه فعلًا.

## Modes والـ Capabilities

```js
VISUAL_FLOW_MODES = { CREATE, EDIT, READONLY, LIVE, PREVIEW }
```

كل الكود يقرأ من `resolveCapabilities(mode, overrides)` — **ممنوع** كتابة `if (mode === 'edit')` متفرقة في أي مكوّن. إضافة mode مستقبلي (مثل `debug`) لا يجب أن تلمس أي مكوّن حالي، فقط `constants/flowModes.js`.

`CREATE`/`EDIT` → كل صلاحيات التعديل. `READONLY` → عرض فقط + تحديد. `PREVIEW` → عرض بدون حتى تحديد. `LIVE` → عرض + `showExecutionState`/`canRun`، بدون تعديل. أي `overrides` يمرره المستهلك يفوز دائمًا على افتراضي الـ mode (مثال من الكود: فلو للمعاينة لكن يسمح بالنسخ فقط للفحص).

## Controlled vs Uncontrolled State

`useVisualFlowState` هي نقطة الحسم الوحيدة: إذا كان `nodes` (controlled) موجودًا (`!== undefined`)، الحالة تُدار بالكامل عند المستهلك والـ hook مجرد ممرّر (pass-through) يستدعي `onNodesChange`/`onEdgesChange`. إن غاب، الـ hook يملك state داخلية (`defaultNodes`/`defaultEdges`). **هذا وملف `useVisualFlowViewport.js` هما الملفان الوحيدان المسموح لهما استيراد دوال `@xyflow/react` (`applyNodeChanges`/`applyEdgeChanges`/`addEdge`) مباشرة** — أي كود آخر في هذا الفريمورك يعتمد على عقود VisualFlow نفسها، لا على المكتبة الأساسية (Library Decision) — هذا يعني: لو تغيّرت `@xyflow/react` غدًا لمكتبة أخرى، نقطة التماس محصورة في ملفين فقط.

## History (Undo/Redo)

`useVisualFlowHistory` تُخزِّن snapshots كاملة لـ `{nodes, edges}` (بحد أقصى 100). **القاعدة الحرجة**: المستدعي (VisualFlow.jsx نفسه) يستدعي `commit()` صراحة فقط عند حدود منطقية — إضافة/حذف عقدة، إضافة/حذف حافة، تعديل خاصية، **نهاية** السحب (وليس أثناءه) — وليس على كل تغيير وسيط، وإلا سحب عقدة واحدة ينتج مئات إدخالات history. `useVisualFlowKeyboard` تربط Ctrl+Z/Ctrl+Shift+Z تلقائيًا بـ `undo`/`redo` إذا كانت الـ capabilities تسمح.

## Unsaved Changes / Autosave

`useVisualFlowPersistence` تتبّع `isDirty` فقط عبر مقارنة JSON snapshot بخط أساس (baseline) — **لا تستدعي أي API حفظ بنفسها ولا تمنع التنقل (navigation) بنفسها**. تُخبر المستهلك فقط عبر `isDirty`/`onDirtyChange`/`onFlowChange`، وتعرض `markClean()` ليستدعيها المستهلك بعد نجاح حفظ فعلي. لا يوجد Autosave داخل core — أي autosave هو مسؤولية الـ feature المستهلكة (تستمع لـ `onFlowChange` وتقرر التوقيت/الـ debounce بنفسها).

## Clipboard

`useVisualFlowClipboard` تحتفظ بالحافظة في `useRef` (ذاكرة الجلسة فقط، ليست `localStorage`/`navigator.clipboard`). `paste()` تستدعي `duplicateNodes()` من `graphUtils.js` التي: تولّد ids جديدة، تُبقي الحواف **الداخلية** فقط للمجموعة المنسوخة (تُسقط أي حافة تعبر حدود المجموعة)، وتُزيح المواضع (افتراضيًا 40px) حتى لا تتكدّس العقد الملصوقة فوق الأصلية تمامًا.

## Keyboard Shortcuts

`useVisualFlowKeyboard` توصّل: Delete/Backspace، Ctrl/Cmd+C/V/X، Ctrl/Cmd+Z (تراجع)، Ctrl/Cmd+Shift+Z (إعادة)، Ctrl/Cmd+A، Escape. **لا تتدخّل أبدًا** إذا كان التركيز داخل `<input>`/`<textarea>`/عنصر `contentEditable` (`isTypingTarget()`) — حتى لا يحذف مفتاح Delete العقدة المحدَّدة بينما المستخدم يكتب في حقل بـ Properties Panel. مرِّر فقط الـ callbacks المناسبة للـ mode الحالي — الأوضاع للقراءة فقط عادة لا تمرر أيًا من المُغيِّرة.

## Node Components

**السبب** وراء أن Trigger/Action/Condition/Delay/Branch/Data/Group ليست ملفات React منفصلة: كلها تُعرَض عبر `BaseNode` نفسه، والفرق البصري (الأيقونة، اللون، المنافذ، الملخّص) يأتي بالكامل من `definition` في الـ registry، وليس من مكوّن جديد. هذا يعني: **إضافة نوع عقدة جديد لا تحتاج ملف React جديد أبدًا** — فقط entry جديد في registry، ما لم يكن الشكل مختلفًا جوهريًا (كما في Start/End/Unknown، وهي الثلاثة الوحيدة بمكوّنات خاصة، لأن شكلها مختلف فعليًا: بلا مدخل، بلا مخرج، أو تحذير مرئي).

`BaseNode` نفسه يقرأ: الأيقونة عبر `resolveIcon(definition.icon)` من الـ `VisualFlowProvider` context، اللون عبر `definition.colorToken` (CSS var، ليس hex)، حالة التنفيذ عبر `executionState.nodes[id]` (فقط إذا `capabilities.showExecutionState`)، والمنافذ (`ports.inputs`/`ports.outputs`) لرسم `<Handle>` بعددها بالضبط.

## Unknown Nodes

عندما لا يُطابق `node.data.type` أي entry في الـ `nodeRegistry` الحالي (وحدة عُطِّلت، نوع عقدة أُعيدت تسميته/أُزيلت، أو الفلو المحفوظ قديم) — `UnknownNode` يُعرَض بدل تعطُّل الرسم بالكامل. هذا هو **السبب الكامل** وراء أن الفلوهات المحفوظة لا تكسر الـ canvas أبدًا، حتى لو تغيّرت الوحدات المفعَّلة لاحقًا.

## Registry (Node Package Architecture)

`createNodeRegistry(definitions)` تبني `Map<type, definition>` مع `register/unregister/get/has/getAll/getByCategory`. **VisualFlow core لا يعرف أي نوع عقدة موجود مسبقًا** — كل مستهلك يبني (أو يُركِّب) الـ registry الخاص به.

`combineNodeRegistries([coreNodes, crmNodes, tasksNodes, ...])` — هذه هي الآلية التي تحدد بها الوحدات المفعَّلة عند tenant معيّن أي عقد تظهر له، دون أن يعرف VisualFlow أي شيء عن الاشتراكات/الباقات. نفس الشكل بالضبط لـ `createEdgeRegistry`/`combineEdgeRegistries` (أصغر، لأن أنواع الحواف تتنوع أقل بكثير من أنواع العقد — `default/conditional/animated/execution` تغطي كل استخدام حقيقي تقريبًا).

`defaultNodeRegistry`/`defaultEdgeRegistry` عناصر **اختيارية** (start/end/group/data للعقد؛ الأربعة أنواع أعلاه للحواف) — عناصر عامة حقًا وليست خاصة بأي دومين، لذلك تعيش داخل core نفسه، لكن أي مستهلك حر في تجاهلها تمامًا.

## Adapter Layer

`createFlowAdapter({fromApi, toApi})` هو **المكان الوحيد المُصرَّح له** بأن يتسرّب شكل استجابة الباك إند إليه — نموذج VisualFlow نفسه (`VisualFlowModel`) لا يتغيّر شكله أبدًا ليُرضي باك إند معيّن. `identityFlowAdapter` جاهز للـ feature التي يُعيد API الخاص بها الشكل القانوني مباشرة.

`normalizeFlowData(input)` مُتسامحة بالكامل: عقدة بلا `position` تأخذ `{x:0,y:0}`، حافة بلا `id` تأخذ id مولَّد، `type` غير مسجَّل يُترك كما هو (القرار في العرض لـ BaseNode/UnknownNode، ليس هنا) — **لا ترمي استثناءً أبدًا** على مدخلات ناقصة/مشوَّهة.

## Schema Versioning

`CURRENT_SCHEMA_VERSION = 1` (في `constants/defaults.js`). `serializeFlow`/`deserializeFlow` يمرّان دائمًا عبر `normalizeFlowData` + `migrateFlow`. لا يوجد محرك ترحيل (migration engine) معقّد اليوم عن قصد — `migrateFlow` هي المكان الوحيد الذي يُبنى عليه أي ترقية مستقبلية للـ schema: كل إصدار جديد يُضيف خطوة `if (flow.schemaVersion === N) { ... }` واحدة تلو الأخرى، ثم يُرفَع `CURRENT_SCHEMA_VERSION`.

## Flow Validation

طبقتان منفصلتان تمامًا:

1. **`validateConnection(connection, context)`** — تُستدعى لحظة محاولة الوصل (من `isValidConnection` في `VisualFlowCanvas`)، قبل أن تُصبح الحافة موجودة أصلًا. تفحص: عدم الوصل بالنفس، عدم تكرار نفس الاتصال، سعة المنفذ القصوى (`port.maxConnections`)، توافق نوع المنفذ (`port.accepts`)، ثم أي `customConnectionValidators` يمرّرها المستهلك.
2. **`validateFlow({nodes, edges, nodeRegistry, requireTrigger?, preventCycles?})`** — تفحص الفلو **كاملًا** (عادة قبل السماح بانتقال "تفعيل"): ids مكرّرة، حقول `required` فارغة، `definition.validate(data)` مخصّصة لكل نوع عقدة، عقد بلا اتصال داخل/خارج (تحذير، ليس خطأ، إلا لعقدة `start`/`end`)، وجود trigger إن طُلب، ودورات (cycles) إن طُلب منعها.

النتيجة دائمًا بنفس الشكل: `{ valid, errors[], warnings[] }` — كل عنصر `{ nodeId?/edgeId?, messageKey, messageParams? }` جاهز لـ `t()` مباشرة.

## Properties Panel

`PropertiesPanel` تُولِّد نموذجًا بالكامل من `definition.properties` — **الوحدة الدومين-محدَّدة لا تشحن مكوّن إعداد خاص بها أبدًا**؛ فقط تصف حقولها (`type`, `labelKey`, `required`, `options`/`source`)، وVisualFlow يرسم النموذج. `resolveFieldOptions(source)` هي الطريقة الوحيدة التي يُجيب بها المستهلك عن "ما خيارات المصدر X" — **VisualFlow core لا يجلب بيانات بنفسه أبدًا** (نفس الحد الذي يرسمه Workflow Engine حول `useDataSourceOptions` في طبقته الخاصة).

## Live Execution / Realtime Integration

`ExecutionPanel` (والألوان على العقد/الحواف عبر `EXECUTION_STATE_TONE`) **تعرض فقط** — لا تفتح WebSocket، لا تعمل polling، لا تعرف كيف وصلت البيانات. الـ hook الخاص بالـ feature المستهلكة (اتصال Realtime/Echo/Pusher الخاص بها) يبني `executionState` (الشكل في `constants/executionStates.js` — `VisualFlowExecutionState`) ويمرّره كـ prop. `mode="live"` وحده يُفعِّل `showExecutionState`/`canRun` تلقائيًا.

## Toolbar

كل زر Opt-in بالكامل عبر `toolbar={{ undo, redo, layout, validate, minimap, fullscreen, save }}` — **لا افتراض أن أي زر "ينتمي" هنا بشكل افتراضي**؛ حتى لو طلبه المستهلك، `capabilities` تحجب الأزرار الخاصة بالتعديل في وضع للقراءة فقط بالخطأ. الشريط لا يُعرَض إطلاقًا (يُعيد `null`) إذا لم يُطلب أي زر ولا `children`.

## Auto Layout

`applyLayout({nodes, edges, direction})` تخطيط طبقي بسيط (BFS depth → عمود، الترتيب داخل الطبقة → صف) بدون أي مكتبة خارجية — **ليس** Sugiyama/DAG كامل بتقليل تقاطع الحواف. كل نقاط الاستدعاء تمر عبر هذه الدالة الواحدة، فلو احتاج فلو مستقبلي تخطيطًا أدق، الاستبدال (مثلًا بـ `dagre`) تغيير محلي في ملف واحد، وليس إعادة كتابة core.

## Panel System

`VisualFlowCanvas` هي **الملف الوحيد المسموح له والمكوّن `useVisualFlowState`/`useVisualFlowViewport` استيراد `ReactFlow` مباشرة** من `@xyflow/react`. `<VisualFlow>` يُركِّبها مع الـ panels/toolbar — استخدم `<VisualFlow>` أولًا دائمًا؛ لا تستورد `VisualFlowCanvas` مباشرة إلا عند بناء تخطيط مخصص بالكامل (تخطيط لا يشبه نمط "شريط أدوات + يسار + وسط + يمين" الذي يوفره `<VisualFlow>` نفسه).

كل من `resolvedLeftPanel`/`resolvedRightPanel` قابل للطي (collapse) بشكل مستقل — `<VisualFlow>` نفسه يملك ويعرض زر الطي/الفتح (`leftPanelCollapsed`/`rightPanelCollapsed` كـ state داخلية، ليست props مُتحكَّم بها من الخارج، بنفس منطق `minimapVisible`/`mobilePane`)، **وليس** محتوى الـ panel (`NodeLibraryPanel`/`PropertiesPanel`/`ExecutionPanel` أو أي panel مخصص يمرره المستهلك) — هذا يعني أي panel، حتى المخصص بالكامل عبر `leftPanel`/`rightPanel` prop، يحصل على قابلية الطي تلقائيًا دون أي تعديل فيه. الطي يُصغِّر العمود إلى شريط ضيق (32px) بزر إعادة فتح فقط؛ لا يتحول لوضع "أيقونات فقط" (بخلاف `VisualFlowSidebar` عند `collapsed`) لأن محتوى هذه الـ panels عمومًا نصي/نماذج، لا عناصر قابلة للاختزال لأيقونة واحدة ذات معنى.

## VisualFlowSidebar

Sidebar عام "تصفّح واختر عنصرًا" — **محايد تجاه الدومين تمامًا** مثل باقي المكتبة؛ لا يعرف ما هو "workflow". المستهلك يحوّل قائمته الخاصة (workflows، أو أي كيان مستقبلي مبني على VisualFlow) إلى الشكل العام:

```js
{ id, title, subtitle?, badge?: ReactNode, icon?: ReactNode, actions?: ReactNode }
```

`badge`/`actions` تصل **جاهزة كعناصر React** من المستهلك (مثال: `<WorkflowStatusBadge status={row.status} />`) — نفس نمط الـ slots الذي يستخدمه `VisualFlow.jsx` نفسه لـ `leftPanel`/`rightPanel` بدل أن يحاول Sidebar فهم بنية الـ badge داخليًا. البحث يُدار داخليًا (نفس نمط `NodeLibraryPanel`)، لا يحتاج المستهلك لإدارة حالة بحث خاصة به. لا يرسم `<aside>` أو حدودًا خاصة به — فقط محتواه (بحث + قائمة)، والحاوية (aside/drawer/أي شيء) مسؤولية المستهلك، لنفس السبب الذي يجعل `NodeLibraryPanel` كذلك: إعادة استخدام قابلة لسياقات عرض مختلفة.

**مثال استخدام حقيقي** — `pages/automation/AutomationCenterPage.jsx`: تبويب "Workflows" أصبح تخطيط عمودين — `VisualFlowSidebar` يسرد الـ workflows المحفوظة (اسم + Badge حالة + module + إجراءات نسخ/حذف تظهر عند hover)، والعمود الرئيسي يعرض `WorkflowBuilder` (من `workflow-engine`, `embedded`) للعنصر المُختار. لا تخطيط قديم بجدول + Modal بعد الآن لهذا التبويب.

## No Duplicate Infrastructure

مبدأ عام في كل هذا الفولدر: **لا تخترع بنية تحتية جديدة لشيء موجود بالفعل في `shared/`**. `VisualFlowEmptyState` يُعيد استخدام `shared/components/feedback/EmptyState`. `VisualFlowErrorBoundary` يُعيد استخدام `shared/components/feedback/ErrorBoundary`. `VisualFlowLoadingState` يُعيد استخدام `Spinner`/`PageSpinner`. `VisualFlowControls`/`VisualFlowMiniMap`/`VisualFlowBackground` أغلفة تنسيق رفيعة حول مكوّنات `@xyflow/react` الجاهزة (`Controls`/`MiniMap`/`Background`) — لا تُعيد تنفيذ الأزرار أو الخريطة المصغّرة من الصفر. عند إضافة حالة جديدة (فراغ/تحميل/خطأ) لأي جزء من VisualFlow، ابحث أولًا في `shared/components/feedback` و`shared/components/ui` قبل كتابة أي شيء جديد.

## Anti-patterns

**Callback الاختيار يجب أن يكون مُثبَّتًا (memoized) بالهوية:** `@xyflow/react` يُعيد تشغيل الـ effect الداخلي لـ `onSelectionChange` كلما تغيّرت **هوية** الدالة نفسها، ليس فقط عند تغيّر الاختيار الفعلي. دالة سهمية inline (`onSelectionChange={(payload) => ...}`) تكون دالة جديدة كل render → effect داخلي في xyflow يُعاد تشغيله → تحديث حالة تحديد محلية → إعادة رسم → دالة سهمية جديدة مرة أخرى → حلقة لا نهائية. الحل: `useCallback` بمصفوفة اعتماديات مستقرة (كما في `VisualFlow.jsx#handleSelectionChange`) — هذا مطلوب فعليًا وليس تحسين أسلوب فقط.

## RTL / Dark Mode

- لا ألوان hex ثابتة داخل مكوّنات core لأي شيء متعلق بالسطح/الحدود/النص — استخدم CSS custom properties دائمًا (`--surface`, `--border`, `--text`, `--text-muted`). الألوان الدلالية الوحيدة المقبولة كـ hex مباشر هي ألوان "نغمة" التحقق/التنفيذ الثابتة عبر السياقات (`TONE_CLASSES`/`TONE_STROKE`/`TONE_BADGE`)، وحتى تلك مركزية في ملف واحد لكل غرض، وليست متفرقة.
- ألوان تعريف العقدة/الحافة نفسها (`colorToken`) هي دائمًا **اسم CSS variable** (`--vf-node-start`, `--vf-edge-conditional`, ...) يوفّره ثيم التطبيق — ليست hex مكتوبة داخل الـ registry.
- لا اتجاه ثابت (`left`/`right`/`ml`/`mr`) — استخدم `start`/`end`/`ms`/`ps` أو ما يعادلها المنطقي.
- الأيقونات لا تُستورد من مكتبة أيقونات بعينها داخل core — `resolveIcon(name)` الذي يمرره المستهلك هو الجسر الوحيد (مثال: `types.js` توثّق `icon` كـ "اسم يحلّه resolveIcon الخاص بالمستهلك").

## i18n

كل نص داخل هذا الفولدر يمر عبر `t()` بمفاتيح تحت namespace واحد: `visualFlow.*` في `src/locales/{ar,en}/visualFlow.js`. لا نص عربي/إنجليزي مكتوب مباشرة في JSX. تعريفات العقد نفسها (`labelKey`, `descriptionKey`) تحمل **مفاتيح**، ليست نصوصًا محلولة — الحل النهائي يحدث وقت العرض عبر `t(definition.labelKey)`، ما يسمح لنفس الـ definition أن تُترجم بلا أي منطق إضافي.

## أمثلة عملية: كيف تستخدم VisualFlow في feature جديدة

```jsx
import { useMemo } from 'react'
import {
  VisualFlow,
  createNodeRegistry,
  combineNodeRegistries,
  defaultNodeRegistry,
  VISUAL_FLOW_MODES,
} from '@/shared/components/visual-flow' // المسار الفعلي: '../../../shared/components/visual-flow'

const myNodes = createNodeRegistry([
  {
    type: 'my_feature.some_action',
    category: 'actions',
    labelKey: 'myFeature.nodes.someAction.label',
    icon: 'Zap',
    colorToken: '--my-feature-node',
    ports: { inputs: [{ id: 'input', kind: 'target' }], outputs: [{ id: 'output', kind: 'source' }] },
    properties: [{ key: 'amount', type: 'number', labelKey: 'myFeature.nodes.someAction.amount', required: true }],
  },
])

export function MyFeatureFlowEditor({ flow, onFlowChange, resolveIcon }) {
  const nodeRegistry = useMemo(() => combineNodeRegistries([defaultNodeRegistry, myNodes]), [])

  return (
    <VisualFlow
      nodes={flow.nodes}
      edges={flow.edges}
      onNodesChange={(nodes) => onFlowChange({ ...flow, nodes })}
      onEdgesChange={(edges) => onFlowChange({ ...flow, edges })}
      nodeRegistry={nodeRegistry}
      mode={VISUAL_FLOW_MODES.EDIT}
      resolveIcon={resolveIcon}
      toolbar={{ undo: true, redo: true, layout: true, save: true }}
      requireTrigger
      preventCycles
    />
  )
}
```

النقاط الأساسية في المثال: بناء registry خاص بالـ feature، `combineNodeRegistries` مع الافتراضي إن رغبت، تمرير `mode` بدل فحص شروط يدوية، وتمرير `resolveIcon` بدل ربط مكتبة أيقونات داخل core.

## المستهلكون الحاليون

- **`features/workflow-engine`** — المستهلك الرئيسي اليوم. `WorkflowVisualCanvas.jsx` يبني على `<VisualFlow>` مباشرة مع `createNodeRegistry` خاص بأنواع عقد الـ Workflow. التفاصيل الكاملة (الـ Registry الخاص بالوحدات، الـ Builder، طريقة إضافة Module/Action جديد) في `features/workflow-engine/docs/WORKFLOW_ENGINE_ARCHITECTURE_AR.md`.
- **`pages/automation/AutomationCenterPage.jsx`** — يستخدم `VisualFlowSidebar` (وليس `<VisualFlow>` مباشرة؛ الـ canvas الفعلي يأتي عبر `WorkflowBuilder` من workflow-engine الذي يستخدم VisualFlow داخليًا) لعرض قائمة workflows جانبية + فتح الـ Builder المرئي للعنصر المختار في نفس الصفحة.

## نقاط توسعة مستقبلية

- **نوع عقدة جديد**: عادة entry جديد في registry الـ feature، ليس ملف React جديد (إلا إذا كان الشكل مختلفًا جوهريًا مثل Start/End/Unknown).
- **نوع حافة جديد**: entry في `createEdgeRegistry` بلون/سلوك أنيميشن مختلف — نفس `BaseEdge` يعرضه.
- **Panel جديد**: مكوّن مستقل يُمرَّر عبر `leftPanel`/`rightPanel`/`bottomPanel` — لا يحتاج تعديل `VisualFlow.jsx` نفسه ما دام يقبل props مشابهة (`onClose` إلخ) لسلوك الموبايل drawer المتوقع.
- **Mode جديد**: entry في `CAPABILITIES_BY_MODE` (`constants/flowModes.js`) فقط — لا تفرّع أي مكوّن آخر على اسم mode مباشرة.
- **مكوّن Sidebar/Picker إضافي**: إن احتاج مستهلك مستقبلي شكل تصفّح مختلفًا جوهريًا عن `VisualFlowSidebar` (وليس مجرد تخصيص عبر `renderItem`)، أضِف مكوّنًا جديدًا بنفس بادئة `VisualFlow*` وصدِّره من `index.js` — لا تُعدِّل `VisualFlowSidebar` لتحاول تغطية شكلين مختلفين بشرط واحد ضخم.
