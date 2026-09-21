# Pipeline Board

مكوّن عام لعرض عناصر موزعة على مراحل ديناميكية مع دعم السحب والإفلات وSwimlanes. المكوّن غير مرتبط بالصفقات، ويمكن استخدامه في أي Feature تحتاج Pipeline بمراحل قادمة من API.

## الملفات

### `PipelineBoard.jsx`

المكوّن الرئيسي المسؤول عن:

- رسم أعمدة المراحل.
- توزيع العناصر حسب المرحلة.
- رسم صفوف Swimlanes اختيارية.
- عرض عدد العناصر داخل كل مرحلة.
- تمرير العناصر إلى `renderCard`.
- منع تغيير مراحل Won/Lost مباشرة.

### `PipelineCard.jsx`

غلاف بصري اختياري للكارت. يوفر:

- سطحًا وحدودًا متوافقة مع الوضع الداكن.
- حالة hover وظلًا خفيفًا.
- مؤشرات cursor مناسبة للسحب.

لا يحتوي بيانات أو نصوصًا خاصة بأي Domain.

### `usePipelineDragDrop.js`

Hook يحتوي منطق HTML5 Drag and Drop:

- كتابة رقم العنصر ومرحلته الحالية في `dataTransfer`.
- تحديد منطقة الإسقاط الحالية.
- منع الإسقاط الافتراضي للمتصفح.
- قراءة البيانات بأمان والتحقق من JSON.
- تجاهل النقل إلى المرحلة نفسها.
- استدعاء `onItemMove` عند اكتمال الإسقاط.

## الاستخدام الأساسي

```jsx
import { PipelineBoard, PipelineCard } from '../../shared/components/pipeline-board'

<PipelineBoard
  stages={stages}
  items={leads}
  itemStageKey="stage_id"
  itemIdKey="id"
  renderCard={(lead) => (
    <PipelineCard>
      <strong>{lead.name}</strong>
    </PipelineCard>
  )}
  onItemMove={(itemId, fromStageId, toStageId) => {
    updateStage({ itemId, stageId: toStageId })
  }}
/>
```

## الخصائص

| الخاصية | النوع | الافتراضي | الوصف |
|---|---|---|---|
| `stages` | Array | `[]` | المراحل الديناميكية المطلوب عرضها |
| `items` | Array | `[]` | العناصر التي سيتم توزيعها |
| `itemStageKey` | string | `stage_id` | اسم حقل المرحلة داخل العنصر |
| `itemIdKey` | string | `id` | اسم حقل المعرّف داخل العنصر |
| `groupBy` | object/null | `null` | إعداد Swimlanes |
| `renderCard` | function | - | يرسم محتوى الكارت |
| `renderEmpty` | function | - | يرسم حالة المرحلة الفارغة |
| `onItemMove` | function | - | ينفذ النقل إلى مرحلة عادية |
| `onTerminalStageDrop` | function | - | يعالج الإسقاط على Won/Lost |
| `isInteractive` | boolean | `true` | تشغيل أو تعطيل السحب |

## شكل المرحلة

```js
{
  id: 10,
  name: 'Negotiation',
  label: 'Negotiation',
  order: 2,
  color: '#f39c12',
  is_won_stage: false,
  is_lost_stage: false
}
```

المكوّن يتعرف أيضًا على:

```text
is_terminal_won
is_terminal_lost
```

لا توجد أسماء مراحل أو أعداد أعمدة ثابتة داخل المكوّن.

## مراحل Won/Lost

إذا كانت المرحلة تحمل أي علامة نهائية، لا يتم استدعاء `onItemMove`. بدلًا من ذلك يتم استدعاء:

```js
onTerminalStageDrop({
  itemId,
  fromStageId,
  stage,
  laneId,
})
```

يجب على المكوّن المستهلك فتح Dialog مناسب، ثم تنفيذ endpoint الربح أو الخسارة بعد تأكيد المستخدم. هذا يمنع اعتبار نقل المرحلة مساويًا لإغلاق الصفقة.

## Swimlanes

يمكن تقسيم اللوحة إلى صفوف، مثل الفرق:

```jsx
<PipelineBoard
  stages={stages}
  items={items}
  groupBy={{
    key: 'team_id',
    lanes: [
      { id: 1, label: 'Team A' },
      { id: 2, label: 'Team B' },
    ],
  }}
  renderCard={renderCard}
/>
```

كل Lane يرسم مجموعة كاملة من أعمدة المراحل. العناصر التي لا تطابق Lane معرّفًا لا تظهر، لذلك يجب تمرير جميع القيم الموجودة في البيانات داخل `lanes`.

## عقد السحب

عند الإسقاط على مرحلة عادية يتم استدعاء:

```js
onItemMove(itemId, fromStageId, toStageId, laneId)
```

المكوّن لا ينفذ optimistic update داخليًا؛ مصدر البيانات يظل مملوكًا للصفحة أو React Query. يمكن للمستهلك تحديث الكاش قبل الطلب وإرجاعه عند الفشل.

## الترجمة

المكوّن لا يستخدم نصوصًا داخلية، لذلك يجب تمرير:

- `stage.label` مترجمًا.
- محتوى `renderCard` مترجمًا.
- حالة `renderEmpty` مترجمة.

بهذا يظل المكوّن صالحًا لأي Namespace وأي لغة.

## الثيم والـ RTL

- الأسطح والحدود والنصوص تستخدم متغيرات الثيم.
- لون المرحلة يأتي من البيانات لأنه لون Domain وليس لون واجهة ثابتًا.
- التخطيط يستخدم خصائص CSS منطقية ولا يفرض اتجاه LTR أو RTL.
- عند اختيار ألوان مراحل مخصصة يجب التحقق من التباين في الوضعين الفاتح والداكن.

## إرشادات التطوير

- لا تضف مراحل ثابتة داخل `PipelineBoard`.
- لا تضف استدعاءات API داخل المكوّن المشترك.
- لا تربط الكارت بشكل بيانات Deal أو Task محدد.
- استخدم `renderCard` لأي واجهة خاصة بالـ Domain.
- استخدم `onTerminalStageDrop` للعمليات التي تحتاج تأكيدًا أو بيانات إضافية.
- اختبر اللوحة بعدد قليل وكبير من المراحل، ومع وبدون Swimlanes.

