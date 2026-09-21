# صفحات Deals Workspace

هذا الفولدر يحتوي صفحات واجهة مساحة الصفقات. طبقة API والـ hooks موجودة في `src/features/deals/`، بينما مكوّن لوحة المراحل العام موجود في `src/shared/components/pipeline-board/`.

## الملفات

### `DealsHubPage.jsx`

صفحة مركز الصفقات على المسار:

```text
/deals
```

المسؤوليات:

- جلب جميع الصفقات من `useDeals`.
- عرض الصفقات باستخدام `DataTable` المشترك.
- البحث والفلترة والترتيب والتصدير والتحكم في الأعمدة.
- فتح الصفقة بالنقر المزدوج والانتقال إلى `/deals/:dealId`.
- عرض نموذج إنشاء صفقة.
- جلب قوالب Pipeline المتاحة عبر `usePipelineTemplates`.
- إرسال بيانات الصفقة الجديدة عبر `useDealMutations().create`.
- الانتقال تلقائيًا إلى مساحة الصفقة عندما يرجع API رقم الصفقة الجديدة.

حقول الإنشاء الحالية:

```text
name
pipeline_template_id
type
status
start_date
end_date
target_revenue
target_leads
```

### `DealWorkspacePage.jsx`

صفحة الصفقة الواحدة على المسار:

```text
/deals/:dealId
```

تستخدم query parameter لاختيار القسم:

```text
/deals/10?tab=board
/deals/10?tab=team
/deals/10?tab=products
```

الأقسام المتاحة:

| القسم | المحتوى |
|---|---|
| `overview` | إحصاءات مختصرة عن الصفقة |
| `board` | ليدز الصفقة في Kanban أو DataTable |
| `team` | أعضاء وفرق الصفقة |
| `products` | منتجات الصفقة |
| `contracts` | حالة انتظار API العقود |
| `analytics` | حالة انتظار API التحليلات |

## أوضاع العرض

تدعم الصفحة وضعين:

- `kanban`: يعرض الأقسام كتبات أفقية ولوحة Pipeline.
- `table`: يعرض Sidebar داخليًا قابلًا للطي وجدول الليدز.

يتم حفظ اختيار المستخدم في:

```text
localStorage['deal-workspace:view-mode']
```

الضغط على قسم Board من الـ Sidebar في وضع Table يعيد المستخدم إلى وضع Kanban.

## مصادر البيانات

تستخدم صفحة الصفقة:

- `useDeal(dealId)` لبيانات الصفقة.
- `useDealLeads(dealId)` لليدز.
- `usePipelineTemplates()` للوصول إلى القالب عند عدم تضمينه في بيانات الصفقة.
- `useDealResources(dealId)` للفريق والمنتجات.
- `useDealMutations().changeStage` لنقل الليد بين المراحل.

يتم استخراج المراحل بالأولوية التالية:

1. `deal.pipeline_template.stages`
2. `deal.pipelineTemplate.stages`
3. القالب المطابق لـ `deal.pipeline_template_id`
4. `deal.stages`

بعد ذلك يتم ترتيبها بناءً على `order` وتمريرها إلى `PipelineBoard`.

## توحيد بيانات الليد

الدالة `normalizeLead` تتعامل مع اختلاف شكل الاستجابة؛ فقد تكون بيانات العميل داخل `lead` أو `customer` أو على العنصر مباشرة. الهدف أن يستخدم الجدول واللوحة نفس الشكل النهائي.

## الأدوات

- **التقويم:** ينتقل إلى صفحة التقويم المشتركة `/calendar`.
- **Workflow:** يستخدم `WorkflowLauncher` بسياق الصفقة الحالي.
- **مساعد الصفقة:** يفتح `AgentChat` داخل `AppDrawer`.

## تغيير المرحلة

عند إسقاط كارت على مرحلة عادية يتم إرسال:

```json
{
  "stage_id": 2
}
```

إلى:

```text
POST /api/tenant/deals/leads/{dealLeadId}/change-stage
```

مراحل Won/Lost لا تنفذ تغييرًا صامتًا. يتولى `PipelineBoard` فصلها عبر `onTerminalStageDrop`. لم يتم إنشاء طلب Won/Lost لأن مجموعة Postman الحالية لا توفر هذه الدوال.

## الترجمة والثيم

- مفاتيح النصوص: `dealWorkspace.*`.
- ملفات الترجمة: `src/locales/ar/dealWorkspace.js` و`src/locales/en/dealWorkspace.js`.
- تستخدم الصفحات متغيرات مثل `--surface` و`--surface-2` و`--text` و`--text-muted` و`--border`.
- يجب عدم إضافة نصوص ثابتة أو `bg-white` أو ألوان نص ثابتة عند تطوير الصفحات.

## إضافة قسم جديد

1. أضف اسم القسم إلى مصفوفة `tabs`.
2. أضف مفتاح الترجمة في اللغتين داخل `dealWorkspace.tabs`.
3. أضف العرض الخاص به داخل `sectionContent`.
4. أنشئ API وHook داخل `src/features/deals/` إن كان القسم يحتاج بيانات جديدة.
5. لا تستخدم بيانات وهمية عند غياب عقد API؛ اعرض حالة عدم توفر واضحة.

## القيود الحالية

- لا توجد endpoints للعقود أو التحليلات أو Won/Lost في ملف Postman المرسل.
- مساعد AI يستخدم واجهة `AgentChat` الحالية، لكن لا يوجد عقد backend خاص بتوصيات الصفقات.
- التقويم الحالي هو التقويم العام؛ تصفية أحداث صفقة محددة تحتاج عقد بيانات يربط الأحداث بالصفقة.

