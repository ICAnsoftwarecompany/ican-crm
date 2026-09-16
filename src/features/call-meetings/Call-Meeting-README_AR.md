# موديول المكالمات والاجتماعات

هذا الفولدر هو المكان المركزي لكل ما يخص مواعيد المكالمات والاجتماعات داخل المشروع.

## الهدف

بدل وجود ملفات المكالمات والاجتماعات داخل `pages/customers` فقط، تم نقلها إلى:

```text
src/features/call-meetings/
```

حتى يتم استخدامها من أي صفحة مثل:

- صفحة العملاء.
- Drawer العميل.
- صفحة الأنشطة داخل العملاء.
- أي صفحة مستقبلية تحتاج إضافة أو عرض أو تعديل مكالمة/اجتماع.

## أهم الملفات

- `components/ScheduleActivityDialog`: Dialog موحد لإضافة موعد مكالمة أو اجتماع.
- `components/Calls`: عرض المكالمات، الفلاتر، التنبيه، والـ quick action.
- `components/Meetings`: عرض الاجتماعات، الفلاتر، التنبيه، والـ quick action.
- `components/ScheduleDetails`: Drawer عرض وتعديل تفاصيل الموعد (ويستخدم الآن العرض الموحد لتفاصيل الاجتماع).
- `components/MeetingDetailView.jsx`: المكوّن الموحد لعرض/تعديل تفاصيل الاجتماع، ويعمل بنفس السلوك داخل الصفحة أو الـ Drawer.
- `utils/scheduleUiUtils.js`: تنسيقات التاريخ وأدوات الهاتف والقيم المشتركة.
- `index.js`: نقطة التصدير العامة التي يجب الاستيراد منها.

## توحيد شاشة تفاصيل الاجتماع

تم توحيد عرض وتعديل بيانات الاجتماع في مكوّن واحد:

- `components/MeetingDetailView.jsx`

ويتم إعادة استخدامه في أكثر من مكان:

- `features/activities/components/ActivityDrawer/ActivityDrawer.jsx` عند فتح نشاط من نوع `meeting`.
- `components/ScheduleDetails/ScheduleDetailsDrawer.jsx` داخل Drawer تفاصيل الموعد.
- `pages/customers/pages/activities/MeetingDetailPage.jsx` داخل صفحة المسار `/LeadsCenter/activities/meeting/:meetingId`.

الهدف من هذا التوحيد:

- إزالة تكرار الكود بين الصفحة والـ Drawer.
- توحيد سلوك التبويبات والتعديل والتقارير.
- تقليل احتمالية اختلافات الواجهة بين الأماكن المختلفة.

## طريقة الاستخدام

```jsx
import {
  ScheduleActivityDialog,
  CallsActionTab,
  MeetingsActionTab,
  CallQuickAction,
  MeetingQuickAction,
} from '../../features/call-meetings'
```

## ملاحظة

الـ API ما زال يستخدم موديول:

```text
features/meetings
```

لأن backend يتعامل مع المكالمات والاجتماعات من خلال نفس resource:

```text
/api/tenant/meetings
```

## إضافات التقارير

- `components/PreMeetingReportDrawer`: Drawer لإضافة تقرير التحضير قبل الاجتماع وربطه بعنوان ورقم الاجتماع.
- `components/AfterMeetingReportDrawer`: Drawer مستقل لتقرير ما بعد الاجتماع، مبني على قوالب ديناميكية، ويرسل دائما `title: 'after-meeting report'` مع محتوى التقرير داخل `notes`.
- `components/AfterMeetingReportDrawer/afterMeetingTemplates.js`: تعريف القوالب الديناميكية لتقرير ما بعد الاجتماع.
- `components/AfterMeetingReportDrawer/AfterMeetingTemplateSelector.jsx`: اختيار القالب قبل بدء تعبئة التقرير.
- `components/AfterMeetingReportDrawer/AfterMeetingTemplateCard.jsx`: بطاقة عرض كل قالب (عنوان/وصف/حقول) مع حالة التحديد.
- `components/MeetingReportsDrawer`: Drawer لعرض تقارير اجتماع محدد من `/api/tenant/meetings/{meetingId}/reports`، مع ترتيب التقارير من الأحدث للأقدم وفتح تفاصيل كل تقرير عند الضغط عليه.
- `components/LiveMeetingIndicator`: مؤشر يظهر في الهيدر عند وجود اجتماع حالته `in_progress` مع hover مختصر وزر فتح التفاصيل.
- `components/LiveMeetingDetailsDrawer`: Drawer جانبي يجلب تفاصيل الاجتماع المباشر من `/api/tenant/meetings/{meetingId}` ويعرض بيانات الاجتماع والمشاركين والتقارير والملاحظات.

## ملاحظات تنفيذية

- صفحة تفاصيل الاجتماع تحفظ التبويب الحالي في الـ query string عبر `?tab=` لتسهيل الرجوع لنفس السياق.
- الرجوع من صفحة تفاصيل الاجتماع يعتمد على `location.state.from`، ومع عدم وجوده يتم الرجوع تلقائيا إلى `/LeadsCenter/activities`.
