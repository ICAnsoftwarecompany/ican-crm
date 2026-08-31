# توثيق CustomerDetailsDrawer

آخر تحديث: 2026-08-15

هذا الملف يشرح بنية `CustomerDetailsDrawer` وطريقة تطويره لاحقا. الهدف أن يكون مرجعا سريعا لمعرفة أماكن التعديل، تدفق البيانات، المكونات المشتركة، والتكامل مع الـ APIs.

## الفكرة العامة

`CustomerDetailsDrawer` هو مركز عرض تفاصيل العميل داخل صفحة العملاء. نفس المنطق يعمل بطريقتين:

- **Drawer mode**: يفتح كدروار جانبي من صفحة العملاء.
- **Page mode**: يستخدم نفس المحتوى داخل صفحة تفاصيل الليد/العميل، مع sidebar جانبي للمعلومات الأساسية وباقي التابات في المساحة الرئيسية.

المكون الرئيسي موجود هنا:

```txt
src/pages/customers/components/CustomerDetailsDrawer/CustomerDetailsDrawer.jsx
```

## أهم الصادرات

### `CustomerDetailsDrawer`

المكون الخارجي الذي يفتح داخل `AppDrawer`.

يستقبل:

```jsx
<CustomerDetailsDrawer
  customer={customer}
  open={open}
  onClose={onClose}
  onStatusChanged={onStatusChanged}
/>
```

### `CustomerDetailsContent`

المكون الداخلي المشترك بين وضع الدروار ووضع الصفحة.

يستقبل:

```jsx
<CustomerDetailsContent
  customer={customer}
  enabled={true}
  onStatusChanged={handler}
  showOpenPageButton={false}
  mode="drawer" // أو "page"
/>
```

استخدم `CustomerDetailsContent` عندما تريد عرض نفس تفاصيل العميل داخل صفحة كاملة وليس Drawer.

## تدفق البيانات

داخل `CustomerDetailsContent` يتم جلب البيانات التالية:

- بيانات العميل التفصيلية عبر `useCustomerInfo(customer.id)`.
- حالات العملاء عبر `definitionsApi.getStatuses()`.
- تاجات العملاء عبر `definitionsApi.getTags()`.

بعد الجلب يتم تكوين:

- `detailedCustomer`: بيانات العميل النهائية المعروضة.
- `leadStatuses`: حالات نوع `lead`.
- `currentStatus`: الحالة الحالية للعميل.
- `tags`: كل التاجات.
- `currentTag`: التاج الحالي للعميل.

أي تغيير مهم مثل تغيير الحالة أو التاج أو تحديث موعد يتم تمريره إلى:

```js
refreshCustomerDetails(payload)
```

وهذه الدالة تعيد تحميل بيانات العميل وتبلغ الصفحة الأب عبر `onStatusChanged`.

## الهيدر

الهيدر الحديث للعميل يعرض:

- أول حرف من اسم العميل.
- اسم العميل.
- تاريخ إنشاء العميل.
- مصدر العميل من `CustomerSourceBadge`.
- الحالة الحالية ولونها.
- التاج الحالي.
- السيلز/المستخدم المرتبط.
- تاريخ الربط.
- زر فتح صفحة العميل.
- مغير الحالة `CustomerStatusChanger`.
- تغيير التاج.

المكونات المرتبطة:

```txt
CustomerStatusChanger.jsx
CustomerSourceBadge
customerDetailsUtils.js
```

## التابات الرئيسية

التابات معرفة في `DRAWER_TABS` داخل `CustomerDetailsDrawer.jsx`:

```js
const DRAWER_TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'timeline', label: 'Timeline', icon: Clock3 },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'files', label: 'Files', icon: Paperclip },
  { id: 'emails', label: 'Emails', icon: Mail },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
]
```

ترتيب التابات قابل للتغيير بالسحب المطول، ويتم حفظه في:

```txt
localStorage key: customer-details-drawer-tabs-order
```

### إضافة تاب جديد

لإضافة تاب جديد:

1. أنشئ مكون داخل:

```txt
tabs/NewTab.jsx
```

2. أضف تعريفه داخل `DRAWER_TABS`.

3. أضف شرط عرضه داخل `ActiveTabContent`.

مثال:

```jsx
if (activeTab === 'new-tab') return <NewTab customer={customer} />
```

## وضع الصفحة Page Mode

في `mode="page"` يتم تقسيم الصفحة إلى:

- Sidebar جانبي يحتوي:
  - `CustomerHeaderModern`
  - `CustomerQuickActions`
  - `HomeTab`
- محتوى رئيسي يحتوي:
  - التابات ما عدا `Home`
  - محتوى التاب المختار

في page mode يتم تحويل `home` تلقائيا إلى `timeline` لأن بيانات `Home` تظهر بالفعل في sidebar.

## الإجراءات السريعة Quick Actions

المكون الرئيسي:

```txt
quick-actions/CustomerQuickActions.jsx
```

الإجراءات الحالية:

- مكالمة.
- ميتنج.
- SMS.
- WhatsApp.
- Messenger.
- Email.

ترتيب الإجراءات قابل للسحب المطول ويتم حفظه في:

```txt
localStorage key: customer-details-quick-actions-order
```

### مكونات مساعدة

```txt
quick-actions/QuickActionButton.jsx
quick-actions/QuickActionMenu.jsx
quick-actions/quickActionUtils.js
```

`QuickActionMenu` يدعم:

- قائمة اختيارات.
- فتح القائمة كـ portal فوق الصفحة.
- حالة تنبيه حمراء عبر:

```jsx
alert={true}
alertTitle="..."
```

تستخدم هذه الحالة حاليا مع:

- `CallQuickAction`
- `MeetingQuickAction`

عند وجود موعد قريب أو متأخر.

## Floating Chats

المحادثات العائمة موجودة داخل:

```txt
floating-chats/
```

القنوات الحالية:

- WhatsApp
- Messenger
- SMS
- Mail

المكون المشترك:

```txt
floating-chats/shared/FloatingCustomerChat.jsx
```

يدعم:

- فتح أكثر من نافذة في نفس الوقت.
- تحريك النافذة بحرية.
- تغيير الحجم.
- وضع كل نافذة فوق الأخرى عبر `zIndex`.
- دعم RTL/LTR في الحركة.

الإدارة تتم داخل `CustomerDetailsContent` عبر:

```js
openFloatingChats
focusFloatingChat(channel)
openFloatingChat(channel)
closeFloatingChat(channel)
getFloatingChatZIndex(channel)
```

## Timeline Tab

المسار:

```txt
tabs/TimeLineTap/TimelineTab.jsx
```

يحتوي على تابات فرعية:

- الحالات.
- المكالمات.
- الاجتماعات.

التحكم من الإجراءات السريعة يتم عبر:

```js
openTimelineAction(actionId, actionOptions)
```

مثال:

```js
onTimelineAction?.('call', { intent: 'schedule' })
onTimelineAction?.('call', { intent: 'history' })
onTimelineAction?.('meeting', { intent: 'schedule' })
onTimelineAction?.('meeting', { intent: 'history' })
```

`intent: schedule` يفتح تبويب المكالمة/الاجتماع ويفتح Dialog الإضافة.

`intent: history` يفتح التبويب فقط بدون فتح Dialog.

## حالات العميل Status Timeline

المسار:

```txt
tabs/TimeLineTap/StatusActionTab.jsx
```

يعرض سجل حالات العميل من `lead_log`، ويعتمد على بيانات العميل والحالة الحالية.

## المكالمات Calls

المسار:

```txt
tabs/TimeLineTap/CallsTap/
```

المكونات:

```txt
CallsActionTab.jsx
CallScheduleDialog.jsx
CallFilters.jsx
CallReminderBanner.jsx
CallAction/CallQuickAction.jsx
```

### `CallsActionTab`

يعرض المكالمات من:

```js
useLeadCallsMeetings(leadId)
```

ثم يفلتر:

```js
type === 'call'
```

ويدعم:

- ترتيب المكالمات من الأحدث للأقدم حسب `start_at`.
- فلتر تاريخ من/إلى.
- فلتر حالة:
  - `scheduled`
  - `in_progress`
  - `completed`
  - `cancelled`
- تنبيه آخر مكالمة نشطة.
- فتح تفاصيل المكالمة عند الضغط على الكارت.

### `CallScheduleDialog`

Dialog إنشاء موعد مكالمة.

يرسل البيانات عبر:

```js
useMeetingMutations().create
```

مع:

```js
type: 'call'
taskable_type: 'App\\Models\\Lead'
taskable_id: leadId
```

### `CallQuickAction`

يوفر:

- مكالمة الآن.
- إضافة موعد مكالمة.
- عرض سجل المكالمات.

ويحول زر المكالمة للون أحمر عند وجود مكالمة:

- `in_progress`
- أو `scheduled` واقترب موعدها أو مضى.

## الاجتماعات Meetings

المسار:

```txt
tabs/TimeLineTap/MeetingTap/
```

المكونات:

```txt
MeetingsActionTab.jsx
MeetingScheduleDialog.jsx
MeetingFilters.jsx
MeetingReminderBanner.jsx
MeetingAction/MeetingQuickAction.jsx
```

### `MeetingsActionTab`

يعرض الاجتماعات من:

```js
useLeadCallsMeetings(leadId)
```

ثم يفلتر:

```js
type === 'meeting'
```

ويدعم:

- ترتيب الاجتماعات من الأحدث للأقدم حسب `start_at`.
- فلتر تاريخ من/إلى.
- فلتر حالة.
- تنبيه آخر اجتماع نشط.
- فتح تفاصيل الاجتماع عند الضغط على الكارت.

### `MeetingScheduleDialog`

Dialog إنشاء موعد اجتماع.

يرسل البيانات عبر:

```js
useMeetingMutations().create
```

مع:

```js
type: 'meeting'
taskable_type: 'App\\Models\\Lead'
taskable_id: leadId
```

### `MeetingQuickAction`

يوفر:

- إضافة موعد اجتماع.
- عرض سجل الاجتماعات.
- Google Meet.
- Zoom.

ويحول زر الميتنج للون أحمر عند وجود اجتماع:

- `in_progress`
- أو `scheduled` واقترب موعده أو مضى.

## تفاصيل المكالمة/الاجتماع المشتركة

المسار:

```txt
tabs/TimeLineTap/ScheduleDetails/
```

المكونات:

```txt
ScheduleDetailsDrawer.jsx
scheduleDetailsUtils.js
```

هذا الجزء هو التجريد المشترك بين المكالمات والاجتماعات.

يفتح عند الضغط على كارت مكالمة أو اجتماع.

### `ScheduleDetailsDrawer`

يدعم:

- عرض تفاصيل الموعد.
- عرض اسم العميل بجوار نوع الموعد والحالة.
- تعديل بيانات الموعد.
- تغيير الحالة.
- حذف الموعد.
- إضافة وعرض وحذف التقارير.
- إضافة وعرض وحذف الملاحظات.
- رفع وحذف المرفقات.
- عرض وإضافة وحذف المشاركين.
- تغيير حالة المشارك.

### الدوال المستخدمة

من:

```txt
src/features/meetings/hooks/useMeetings.js
```

تستخدم:

```js
useMeetingInfo(meetingId)
useMeetingReports(meetingId)
useMeetingMutations()
```

ومن `useMeetingMutations` تستخدم:

```js
create
update
remove
createReport
deleteReport
addNote
updateNote
deleteNote
uploadAttachments
deleteAttachment
assignParticipants
removeParticipant
changeStatus
changeParticipantStatus
```

ومن:

```txt
src/features/users/hooks/useUsers.js
```

تستخدم:

```js
useUsers()
```

لإضافة المشاركين.

## meetingsApi

المسار:

```txt
src/features/meetings/api/meetingsApi.js
```

الـ base path:

```js
const BASE_PATH = '/api/tenant/meetings'
```

الدوال الأساسية:

```js
createMeetingOrCall(payload)
updateMeetingOrCall(meetingId, payload)
getMeetings(params)
getLeadCallsMeetings(leadId, params)
getMeetingInfo(meetingId, params)
deleteMeetingOrCall(meetingId)
createReport(meetingId, payload)
getReports(meetingId, params)
deleteReport(meetingId, reportId)
addNote(meetingId, payload)
updateNote(meetingId, noteId, payload)
deleteNote(meetingId, noteId)
uploadAttachments(meetingId, payload)
deleteAttachment(meetingId, attachmentId)
assignParticipants(meetingId, payload)
removeParticipant(meetingId, userId)
getReportsSummary(params)
changeStatus(meetingId, payload)
changeParticipantStatus(meetingId, userId, payload)
```

### FormData

الإنشاء والتعديل يستخدمان `toMeetingFormData`.

يدعم:

- `users[]`
- `attachments[]`
- `File`
- `Blob`
- Boolean كـ `1` أو `0`
- objects/arrays كـ JSON string

## Tasks Tab

المسار:

```txt
tabs/TasksTab/
```

المكونات:

```txt
TasksTab.jsx
TaskList.jsx
TaskCreateDialog.jsx
TaskCreateForm.jsx
taskUtils.js
```

التاب يعرض مهام العميل ويتيح إنشاء مهمة من خلال Dialog.

## Notes / Files / Emails / Calendar

المسارات:

```txt
tabs/NotesTab.jsx
tabs/FilesTab.jsx
tabs/EmailsTab.jsx
tabs/CalendarTab.jsx
```

هذه التابات حاليا مفصولة وبسيطة، ويمكن توسيعها لاحقا بنفس نمط `TasksTab` أو `ScheduleDetails`.

## أهم مفاتيح LocalStorage

```txt
customer-details-drawer-tabs-order
customer-details-quick-actions-order
```

الأول لترتيب تابات الدروار.

الثاني لترتيب الإجراءات السريعة.

## كيف تضيف Quick Action جديد

1. أنشئ مكون داخل:

```txt
quick-actions/NewQuickAction.jsx
```

أو داخل فولدر التاب المناسب لو الإجراء تابع لتاب معين.

2. استخدم أحد:

```jsx
<QuickActionButton />
<QuickActionMenu />
```

3. أضفه داخل `ACTIONS` في:

```txt
quick-actions/CustomerQuickActions.jsx
```

مثال:

```js
{
  id: 'new-action',
  render: (props) => <NewQuickAction customer={props.customer} />
}
```

## كيف تضيف إجراء داخل Timeline

لو الإجراء يفتح تبويب داخل Timeline:

```js
onTimelineAction?.('call', { intent: 'history' })
```

أو:

```js
onTimelineAction?.('meeting', { intent: 'schedule' })
```

ثم داخل التاب المستهدف استخدم:

```js
useEffect(() => {
  if (actionRequest?.actionId !== 'meeting') return
  if (actionRequest?.intent !== 'schedule') return
  setIsScheduleDialogOpen(true)
}, [actionRequest])
```

## كيف تعدل تصميم تفاصيل المكالمة/الاجتماع

ابدأ من:

```txt
tabs/TimeLineTap/ScheduleDetails/ScheduleDetailsDrawer.jsx
```

أما لو التعديل خاص بالعرض داخل قائمة المكالمات:

```txt
tabs/TimeLineTap/CallsTap/CallsActionTab.jsx
```

ولو خاص بالعرض داخل قائمة الاجتماعات:

```txt
tabs/TimeLineTap/MeetingTap/MeetingsActionTab.jsx
```

## ملاحظات مهمة للتطوير

- المكالمات والاجتماعات يستخدمان نفس API ونفس model تقريبا، لذلك التفاصيل والإجراءات مشتركة في `ScheduleDetailsDrawer`.
- واجهة العرض منفصلة عمدا حتى لا يشعر المستخدم أن المكالمات والاجتماعات شيء واحد.
- عند أي تعديل في موعد، تقرير، ملاحظة، مرفق أو مشارك، يجب استدعاء `onChanged` أو `refetch` لتحديث القائمة وبيانات العميل.
- لا تكرر منطق تفاصيل الموعد داخل `CallsActionTab` أو `MeetingsActionTab`. أضف المنطق المشترك داخل `ScheduleDetails`.
- عند إضافة حالة جديدة للمواعيد، حدث:

```txt
ScheduleDetails/scheduleDetailsUtils.js
CallsTap/CallFilters.jsx
MeetingTap/MeetingFilters.jsx
```

## اختبار سريع بعد أي تعديل

1. افتح صفحة العملاء.
2. افتح تفاصيل عميل.
3. افتح Timeline.
4. جرّب:
   - إضافة موعد مكالمة.
   - إضافة موعد اجتماع.
   - فتح سجل المكالمات.
   - فتح سجل الاجتماعات.
   - الضغط على كارت مكالمة أو اجتماع.
   - تعديل الموعد من Drawer التفاصيل.
   - تغيير الحالة.
   - إضافة تقرير.
   - إضافة ملاحظة.
   - رفع مرفق.
   - إضافة مشارك.
5. شغل:

```bash
npm.cmd run build
```

للتأكد من عدم وجود أخطاء build.

