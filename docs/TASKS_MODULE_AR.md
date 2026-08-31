# Tasks Module - مرجع التنفيذ

آخر تحديث: 2026-08-17 - Africa/Cairo

هذا الملف يوثق وضع نظام المهام داخل المشروع، ما تم تنفيذه فعليا، وكيف تم ربطه بالبنية الحالية دون كسر المعمارية.

---

## 1) الهدف

إضافة نظام مهام CRM متكامل تدريجيا مع:

- API Layer مركزي.
- Hooks مبنية على TanStack Query.
- أيقونة Tasks في الهيدر.
- Quick Sidebar للتاسكات مثل Messenger.
- صفحة Tasks أساسية (Dashboard + List).
- توثيق واضح لنقاط الربط الحالية وما يحتاج backend إضافي.

---

## 2) الملفات الحالية المهمة

### API + Hooks

- src/features/tasks/api/tasksApi.js
- src/features/tasks/hooks/useTasks.js
- src/shared/constants/queryKeys.js

### UI جديدة تمت إضافتها

- src/features/tasks/utils/taskMeta.js
- src/features/tasks/components/TasksNavbarButton.jsx
- src/features/tasks/components/TasksSidebarPanel.jsx
- src/features/tasks/components/TaskForm.jsx
- src/features/tasks/components/TaskFormDialog.jsx
- src/features/tasks/components/TaskDrawer.jsx
- src/features/tasks/components/TaskKanbanView.jsx
- src/features/tasks/components/TaskCalendarView.jsx
- src/pages/tasks/TasksPage.jsx

### ملفات تم تعديلها للربط

- src/shared/components/layout/Header.jsx
- src/shared/components/layout/MainLayout.jsx
- src/shared/components/layout/Sidebar.jsx
- src/app/router/index.jsx
- src/shared/constants/routes.js
- src/locales/ar/common.json
- src/locales/en/common.json

---

## 3) API المتكاملة حاليا

تم ربط endpoints التالية عبر tasksApi:

- POST /api/tenant/tasks
- PUT /api/tenant/tasks/{task}
- GET /api/tenant/tasks
- GET /api/tenant/tasks/{task}
- DELETE /api/tenant/tasks/{task}
- POST /api/tenant/tasks/{task}/assign-users
- POST /api/tenant/tasks/{task}/assign-teams
- POST /api/tenant/tasks/{task}/notes
- PUT /api/tenant/tasks/{task}/notes/{note}
- DELETE /api/tenant/tasks/{task}/notes/{note}
- POST /api/tenant/tasks/{task}/attachments
- DELETE /api/tenant/tasks/{task}/attachments/{attachment}
- PATCH /api/tenant/tasks/{task}/read
- PATCH /api/tenant/tasks/{task}/status
- DELETE /api/tenant/tasks/{task}/users/{user}
- DELETE /api/tenant/tasks/{task}/teams/{team}

ملاحظة: payload في create/update يستخدم FormData ويدعم users[] وteams[] وattachments[].

---

## 4) ما تم تنفيذه فعليا الآن

### 4.1 أيقونة Tasks في الهيدر

- إضافة زر Tasks في Header بجانب Messenger.
- الزر يفتح/يغلق Quick Sidebar للتاسكات.
- يوجد badge unread عند توفر حقول القراءة في response.

### 4.2 Quick Sidebar للتاسكات

- Sidebar سريع من جهة اليمين بنفس نمط Messenger panel.
- بحث داخل المهام.
- عرض مؤشرات سريعة: total, today, overdue, in_progress, completed, urgent.
- قائمة مهام مختصرة.
- عرض تفاصيل مهمة مختارة داخل نفس panel.
- إجراءات سريعة:
  - mark as read
  - quick status transition (pending -> in_progress -> completed)
- زر فتح صفحة المهام الكاملة.

### 4.3 صفحة Tasks

- مسار: /tasks
- تعرض:
  - Header section
  - Search
  - Summary cards قابلة للنقر
  - View switcher: List / Board / Calendar
  - فلتر حالة + فلتر نوع
  - قائمة المهام حسب الفلتر السريع
- تعتمد على useTasks + metrics helpers.

### 4.4 Task Drawer

- فتح تفاصيل المهمة من list/board/calendar عبر drawer جانبي.
- عرض: النوع، الحالة، الأولوية، الموعد، الوصف.
- إجراءات: تعديل، تغيير حالة سريع، تعليم كمقروءة، حذف.
- Notes: إضافة/حذف ملاحظات.
- Attachments: رفع/حذف مرفقات.

### 4.5 Task Form Reusable

- نموذج موحد قابل لإعادة الاستخدام للإنشاء/التعديل.
- يدعم backend fields الأساسية:
  - title, description, type, priority, visibility
  - due_date, due_time
  - reminder_type, reminder_before, reminder_unit
  - taskable_type, taskable_id
  - users[], teams[], attachments[]
- يعتمد على users/teams hooks الحالية في المشروع.

### 4.6 Kanban View

- Board مقسم حسب status columns الأساسية.
- Drag and drop بين الأعمدة لتغيير الحالة.
- Optimistic update في الواجهة مع rollback عند فشل API.

### 4.7 Calendar View

- تقويم مهام بنمط Month/Week/Day.
- Navigation: Today / Previous / Next.
- عرض الأحداث الزمنية حسب due_date/due_time.
- الضغط على حدث يفتح Task Drawer.
- الإضافة من اليوم المختار تجهز due_date/due_time تلقائيا.

### 4.8 Navigation + Routing

- إضافة Tasks إلى القائمة الجانبية الرئيسية.
- إضافة route: /tasks
- إضافة ترجمة nav.tasks بالعربي والإنجليزي.

---

## 5) تكامل المعمارية الحالية

- Auth: لا تغيير، استخدام نفس httpClient.
- Query/State: لا مكتبات جديدة، استخدام TanStack Query الحالي.
- Realtime: لا إنشاء Echo جديد، لا duplicate socket client.
- Notifications: لم يتم إنشاء نظام ثانوي جديد.
- Design System: نفس AppModal/AppDrawer/Button/الستايل الحالي.

---

## 6) الحالة الحالية مقابل الرؤية الكاملة

المتاح حاليا:

- Task API Layer كاملة.
- Hooks + invalidation.
- Tasks quick panel في الهيدر.
- صفحة Tasks متعددة العروض (List / Board / Calendar).
- Task Drawer + Task Form reusable.
- Notes + Attachments operations داخل drawer.

غير مكتمل بعد (بحاجة مراحل لاحقة):

- تحسينات UX متقدمة للـ Kanban (sorting by lane, swimlanes, bulk actions).
- تقويم متقدم أكثر (event drag-reschedule آمن حسب backend contract).
- deep linking كامل (/tasks/:id) بدل query param فقط.
- URL state أوسع للفلاتر المتقدمة.
- Activity log زمني احترافي مستقل عن notes.
- Realtime task broadcasting sync عبر list/board/calendar (يتطلب events واضحة من backend إن لم تكن متاحة).

---

## 7) ملاحظات backend مطلوبة لرفع الجودة

للوصول للتجربة enterprise بالكامل، يفضّل توفر/تأكيد:

- events broadcasting رسمية لتغييرات task (create/update/status/assignment/read).
- endpoint activity log للمهمة (غير notes).
- توثيق status matrix المسموح (valid statuses + transitions).
- fields صريحة للقراءة unread/read لتوحيد badge behavior.
- pagination/filters server-side موحدة ومؤكدة للمهام الكبيرة.

---

## 8) Checklist اختبار مبدئي

- فتح/غلق Tasks Sidebar من الهيدر.
- التنقل من sidebar إلى /tasks.
- البحث في quick sidebar.
- اختيار مهمة وعرض تفاصيلها.
- mark as read.
- quick status update.
- ظهور Task nav في sidebar الرئيسي.
- تحميل صفحة /tasks وعمل summary filters.
- التبديل بين List/Board/Calendar.
- إنشاء مهمة من New Task.
- فتح drawer من كل view.
- تعديل مهمة من drawer.
- إضافة/حذف note.
- رفع/حذف attachment.
- drag/drop في Kanban وتحديث status.
- إنشاء من calendar date (pre-filled due_date/time).

---

## 9) مبدأ التطوير القادم

المرحلة القادمة المقترحة:

1. Task Drawer كامل على صفحة /tasks.
2. Task Form موحد reusable لكل السياقات (Lead/Customer/Calendar).
3. Kanban with optimistic status change + rollback.
4. Calendar احترافي وربط due_date/due_time.
5. Notes + Attachments + Assignees management متكامل.
6. Realtime task sync مع notifications.

الحالة الحالية:

- ✅ 1 منجز
- ✅ 2 منجز
- ✅ 3 منجز (نسخة أولية عملية)
- ✅ 4 منجز (نسخة أولية عملية)
- ✅ 5 منجز جزئيا (Notes/Attachments داخل drawer)
- ⏳ 6 قيد التنفيذ في المرحلة القادمة (حسب backend events المتاحة)
