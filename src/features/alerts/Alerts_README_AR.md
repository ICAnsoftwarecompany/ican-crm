# نظام التنبيهات التشغيلية الحرجة

> **آخر تحديث:** 2026-09-30 01:14 (Africa/Cairo)

## الهدف والفصل عن Notification Center

Alerts تمثل مشكلة تشغيلية أو SLA أو مخاطرة تحتاج انتباه المستخدم، وليست مجرد معلومة. Notification تستخدم `read/unread` وتبقى في التاريخ؛ Alert تستخدم حالات Backend: `open`, `acknowledged`, `resolved`. تنفيذ Acknowledge يعني أن المستخدم اطّلع واختار إخفاء التنبيه، ولا يعني Resolve.

الميزة مستقلة في `src/features/alerts/` ولا تشارك API أو cache أو UI state مع `features/notifications`.

## الهيكل

- `api/alertsApi.js`: `GET /api/tenant/alerts` و`POST /api/tenant/alerts/{id}/acknowledge` عبر `httpClient`.
- `hooks/useAlerts.js`: active alerts query، اكتشاف IDs الجديدة أثناء الجلسة، وoptimistic acknowledge مع rollback.
- `components/AlertsStack.jsx`: مجموعة كروت متراصة في منتصف أعلى محتوى التطبيق وprogressive disclosure.
- `components/AlertCompactCard.jsx`: الكارت المختصر المستخدم داخل المجموعة المتراصة.
- `components/AlertBanner.jsx`: العنوان والرسالة والخطورة والوقت والتنقل وAcknowledge.
- `components/AlertsIndicator.jsx`: مؤشر مستقل عن جرس Notifications في الهيدر.
- `components/AlertsDrawer.jsx`: عرض جميع Alerts داخل `AppDrawer`.
- `components/AlertsSummary.jsx`: ملخص client-side حسب severity.
- `utils/normalizeAlert.js`: تحويل Backend payload إلى model ثابت.
- `utils/alertRegistry.js`: تعريف الأنواع ومساراتها وأيقوناتها.
- `utils/alertPriority.js`: ترتيب severity ثم `created_at DESC`.
- `utils/alertSound.js`: إدارة `/Alerts/NewAlert.mp3`.

## نموذج البيانات الموحد

```js
{
  id, type, title, message, severity, status, icon,
  alertableType, alertableId, entityType, entityId,
  assignedUserId, createdAt, updatedAt,
  resolvedAt, resolvedBy, data, target, actionKey, raw
}
```

الواجهة تعرض فقط Alerts ذات `status === "open"`. النوع غير المعروف يستخدم fallback آمن ويعرض عنوان ورسالة Backend.

## الأنواع الحالية

- `classification_sla_breached`: افتراضيًا `critical`، مرتبط بالـLead.
- `stale_lead`: افتراضيًا `warning`، مرتبط بالـLead.

التنقل يستخدم المسار الفعلي `/lead/:customerId`. لا يُنشأ route لنوع غير معروف.

## Severity والترتيب

الأولوية: `critical` ثم `danger`, `high`, `warning`, `medium`, `info`, `low`. القيمة غير المعروفة تحصل على أولوية آمنة ولا تكسر العرض. عند تساوي الأولوية، يظهر الأحدث أولًا.

## Acknowledge lifecycle

عند الضغط على "إخفاء التنبيه" يُزال العنصر فورًا من `QUERY_KEYS.alerts.active`. عند فشل الطلب يعود snapshot السابق ويظهر feedback. بعد انتهاء العملية يحدث reconciliation مع API. لا توجد Resolve action لأن Backend لم يوفر endpoint لها.

## الصوت

الملف الفعلي هو `public/Alerts/NewAlert.mp3`. أول استجابة من GET تسجل IDs كـknown ولا تشغل الصوت. عند refetch وظهور ID جديد أثناء الجلسة يُشغل الصوت مرة واحدة للدفعة، مع حماية المصنع العام من التداخل والتكرار. لا يوجد Alert realtime event موثق حاليًا، لذلك لم يتم اختراع channel أو event.

## UI وResponsive

`AlertsStack` يظهر كطبقة عائمة ثابتة أسفل Header وفوق محتوى الصفحة دون أن يحجز مساحة أو يدفع المحتوى إلى الأسفل. يحترم عرض Sidebar الحالي والـDrawers الجانبية المفتوحة. يعرض حتى أربعة Alerts ككروت صغيرة متراكبة من الأقدم إلى الأحدث، ويكون الأحدث في المقدمة. عند hover أو keyboard focus على سطح مكتبي، تنتشر الكروت بجوار بعضها باستخدام logical inline positioning: من اليمين إلى اليسار في العربية والعكس في الإنجليزية. على الموبايل تظل متراصة. العدد المتبقي يظهر في زر صغير يفتح Drawer؛ الضغط على مؤشر الهيدر يفتح الـDrawer نفسه. جميع الألوان semantic ويدعم العرض RTL/LTR والوضع الداكن.

آخر تعديل: `2026-09-30 01:17 (Africa/Cairo)` — تحويل التنبيهات إلى overlay عائم لا يؤثر على تدفق الصفحة.

## إضافة نوع جديد

1. أضف entry في `alertRegistry.js` مع icon وseverity fallback وresolver لمسار موجود فقط.
2. لا تضف endpoint أو حالة lifecycle غير موثقة.
3. أضف اختبار normalization/target/priority.
4. حدّث هذا الملف بختم وقت القاهرة.

## حدود حالية وتحسينات مستقبلية

- لا يوجد realtime contract موثق للـAlerts.
- لا يوجد Resolve endpoint أو history endpoint.
- لا توجد إعدادات صوت للمستخدم؛ `playAlertSound({ severity })` مهيأة للتوسع مستقبلًا.
- GET الحالي يعيد active list بلا pagination موثقة.
