# مرجع ماسنجر شات — شرح وصيانة

هذا الملف مرجع عملي لأي تطوير لاحق متعلق بشات ماسنجر داخل المشروع.

الهدف منه:
- شرح كيف يعمل Messenger chat الآن
- توضيح أماكن الملفات المهمة
- توثيق التحديث اللحظي Realtime
- توضيح مسار الصوت والتنبيهات
- توضيح المكوّنات المشتركة التي يجب تعديلها بدل تكرار التعديل في كل شاشة

---

## نظرة عامة

شات ماسنجر في المشروع موجود في أكثر من واجهة، لكن تم توحيد الجزء الأساسي الخاص بعرض الرسائل وكتابة الرسالة حتى يكون التعديل في مكان واحد فقط.

أماكن العرض الأساسية:
- صفحة المحادثات الرئيسية
- الشريط الجانبي لمحادثات ماسنجر
- الشات العائم داخل تفاصيل العميل

تم توحيدهم بحيث يعتمدوا على مكوّن مشترك واحد لواجهة الشات.

---

## الملفات المهمة

### 1. واجهات العرض

- `src/pages/conversations/ConversationsPage.jsx`
  صفحة المحادثات الرئيسية.

- `src/features/conversations/components/MessengerSidebarPanel.jsx`
  شريط جانبي سريع لعرض محادثات ماسنجر والتنقل بينها.

- `src/pages/customers/components/CustomerDetailsDrawer/floating-chats/messenger/FloatingMessengerChat.jsx`
  شات ماسنجر العائم داخل تفاصيل العميل.

### 2. المكوّنات المشتركة

- `src/features/conversations/components/MessengerChatThread.jsx`
  المكوّن المشترك الحالي لجسم الشات.
  هذا هو المكان الأساسي الذي يجمّع:
  - شريط معلومات المحادثة
  - قائمة الرسائل
  - صندوق الكتابة

- `src/pages/customers/components/CustomerDetailsDrawer/floating-chats/shared/FloatingChatMessages.jsx`
  المكوّن المسؤول عن:
  - عرض الرسائل
  - النزول التلقائي لآخر رسالة
  - زر النزول لآخر رسالة عند الصعود للأعلى
  - تمييز الرسالة الجديدة
  - منطقة scroll الداخلية

- `src/pages/customers/components/CustomerDetailsDrawer/floating-chats/shared/FloatingChatComposer.jsx`
  المكوّن المسؤول عن:
  - كتابة الرسائل
  - إرسال الرسالة
  - auto focus
  - auto resize حتى 5 سطور

- `src/pages/customers/components/CustomerDetailsDrawer/floating-chats/shared/FloatingCustomerChat.jsx`
  حاوية الشات العائم التي تستخدم `MessengerChatThread` داخليًا.

### 3. Hooks و Realtime

- `src/features/conversations/hooks/useConversations.js`
  hooks الخاصة بجلب:
  - قائمة المحادثات
  - معلومات المحادثة
  - رسائل المحادثة
  - إرسال الرسالة

- `src/realtime/hooks/useMessengerRealtime.js`
  hook الاشتراك في قنوات ماسنجر realtime.

- `src/pages/customers/components/CustomerDetailsDrawer/floating-chats/messenger/useMessengerFloatingChat.js`
  منطق الشات العائم، بما فيه تحديث الرسائل لحظيًا.

- `src/features/conversations/hooks/useRealtimeMessageHighlight.js`
  hook لتحديد الرسالة الجديدة مؤقتًا داخل الشات.

### 4. Utilities

- `src/features/conversations/utils/messengerConversations.js`
  دوال موحّدة للتعامل مع:
  - query keys
  - extract الرسائل والمحادثات من response
  - normalize الرسائل
  - upsert للمحادثات والرسائل داخل الكاش

- `src/features/conversations/utils/messengerNotificationSound.js`
  تشغيل صوت التنبيه مع منع التكرار عند وجود أكثر من واجهة مفتوحة.

---

## القنوات والأحداث Realtime

### القنوات الحالية

#### 1. قناة المحادثة نفسها

```js
Echo.private(`messenger.conversation.${conversationId}`)
  .listen('.messenger.message.received', (e) => {
    // e.message
    // e.conversation
  })
```

هذه القناة مسؤولة عن وصول الرسائل الجديدة داخل المحادثة المفتوحة.

#### 2. قناة إشعارات المستخدم

```js
Echo.private(`tenant.${tenantId}.notifications.${userId}`)
  .listen('.notification.created', (e) => {
    // notification fallback / badge / toast / refresh
  })
```

تستخدم كمسار إضافي/احتياطي للتحديث عندما لا يكفي event الرسالة وحده.

---

## كيف يتم تحديث الرسائل لحظيًا

### السيناريو الأساسي

عند وصول event من القناة:

```js
messenger.message.received
```

يتم تنفيذ الآتي:

1. تحديث قائمة المحادثات في React Query cache
2. تحديث معلومات المحادثة الحالية
3. تحديث رسائل المحادثة الحالية داخل الكاش
4. تمييز الرسالة الجديدة داخل الشات
5. تشغيل صوت التنبيه إذا كانت الرسالة incoming

### لماذا يوجد fallback عبر notification؟

بعض السيناريوهات قد يصل فيها notification أو conversation patch بدون payload كامل للرسالة أو بدون كل البيانات المطلوبة للواجهة.

لهذا تم دعم path إضافي يقوم بـ:
- `invalidateQueries` لقائمة المحادثات
- `invalidateQueries` لمعلومات المحادثة
- `invalidateQueries` لرسائل المحادثة الحالية إذا كانت الإشعارات تخص نفس المحادثة المفتوحة

هذا يجعل الواجهة resilient حتى لو تغير شكل event من الباكند.

---

## Query Keys الخاصة بماسنجر

في `messengerConversations.js`:

```js
export const MESSENGER_CONVERSATIONS_QUERY_KEY = ['messenger', 'conversations']
export const MESSENGER_CONVERSATION_INFO_QUERY_KEY = (conversationId) => [
  'messenger',
  'conversation-info',
  String(conversationId || ''),
]
export const MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY = (conversationId) => [
  'messenger',
  'conversation-messages',
  String(conversationId || ''),
]
```

### ملاحظة مهمة

تم توحيد `conversationId` إلى `String(...)` لمنع مشكلة اختلاف المفتاح بين:
- `24`
- `'24'`

هذه كانت سببًا سابقًا في أن الرسالة تصل في console لكنها لا تظهر في الشات.

---

## لماذا تم توحيد `MessengerChatThread`

سابقًا كان كل مكان يكتب واجهة الرسائل بنفسه:
- الصفحة
- السايدبار
- الشات العائم

هذا سبب تكرارًا في:
- الشكل
- الـ scroll
- الـ composer
- تمييز الرسالة الجديدة
- سلوك auto focus

الآن التعديل على جسم الشات يتم من مكان واحد:

```txt
src/features/conversations/components/MessengerChatThread.jsx
```

أي تعديل فيه ينعكس على كل أماكن عرض شات ماسنجر.

---

## سلوك الرسائل داخل الشات

### 1. النزول التلقائي لآخر رسالة

المكوّن `FloatingChatMessages.jsx` يقوم بالنزول لآخر رسالة تلقائيًا عندما:
- يتم فتح المحادثة
- يتم اختيار محادثة أخرى
- تكون الواجهة أصلًا قريبة من آخر الرسائل ثم تصل رسالة جديدة

### 2. زر "آخر رسالة"

إذا صعد المستخدم للأعلى داخل المحادثة، يظهر زر في منتصف الأسفل:

```txt
آخر رسالة
```

بالضغط عليه يتم الرجوع لآخر رسالة داخل الـ scroll الداخلي.

### 3. تمييز الرسالة الجديدة

الرسالة الجديدة يتم تمييزها مؤقتًا بواسطة:
- ring
- shadow
- كلمة `جديد`

المنطق موجود في:

```txt
src/features/conversations/hooks/useRealtimeMessageHighlight.js
```

---

## سلوك صندوق الكتابة

المكوّن `FloatingChatComposer.jsx` الآن يدعم:

- Auto focus عند فتح المحادثة
- Enter للإرسال
- Shift + Enter لسطر جديد
- Auto resize حتى 5 سطور
- بعد 5 سطور يظهر scroll داخل textarea نفسها
- بعد الإرسال يعود الحجم إلى سطر واحد

هذا يعني أن الرسالة الطويلة تكبر تدريجيًا وتزق الرسائل لأعلى بدل كسر التصميم.

---

## الصوت والتنبيهات

### مكان ملف الصوت

```txt
public/notifications/Messenger - QuickSounds.com.mp3
```

### مسار الصوت في الكود

```js
export const MESSENGER_NOTIFICATION_SOUND_PATH = '/notifications/Messenger - QuickSounds.com.mp3'
```

### منع التكرار

بما أن نفس الرسالة قد تصل لعدة واجهات مفتوحة في نفس الوقت:
- صفحة المحادثات
- MessengerSidebarPanel
- FloatingMessengerChat
- إشعار عام

تم إضافة dedupe logic داخل `messengerNotificationSound.js` حتى لا يُشغل الصوت عدة مرات لنفس الرسالة.

يعتمد ذلك على `messageId` أو مفتاح مماثل.

---

## كيف تعمل الرسالة الجديدة في الكاش

### رسائل المحادثة

عند وصول رسالة جديدة:

```js
queryClient.setQueryData(
  MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY(eventConversationId),
  (current) => upsertMessageIntoCachedResponse(current, incomingMessage)
)
```

### قائمة المحادثات

عند وصول conversation patch:

```js
queryClient.setQueryData(
  MESSENGER_CONVERSATIONS_QUERY_KEY,
  (current) => upsertMessengerConversation(current, conversationPatch)
)
```

### معلومات المحادثة الحالية

```js
queryClient.setQueryData(
  MESSENGER_CONVERSATION_INFO_QUERY_KEY(eventConversationId),
  (current) => mergeInfoIntoCachedResponse(current, conversationPatch)
)
```

---

## مشكلة تم حلها سابقًا

### الرسالة تصل في console ولا تظهر في الشات

السبب كان:
- اختلاف query key بين رقم ونص

مثال:
- `24`
- `'24'`

الحل:
- توحيد كل query key المتعلقة بالمحادثة إلى `String(conversationId || '')`

### خطأ `conversations.some is not a function`

السبب كان:
- دالة `upsertMessengerConversation` كانت تتوقع array مباشرة
- لكن React Query cache قد يحتفظ بالـ response الخام مثل:
  - `{ data: [...] }`
  - `{ data: { data: [...] } }`

الحل:
- جعل `upsertMessengerConversation` تدعم array والـ raw response object معًا

---

## ملاحظات مهمة قبل أي تعديل لاحق

1. لا تعدل واجهة الرسائل في الصفحة والسايدبار والشات العائم كلٌ على حدة.
التعديل الصحيح غالبًا يكون في:
- `MessengerChatThread.jsx`
- `FloatingChatMessages.jsx`
- `FloatingChatComposer.jsx`

2. لو حصلت مشكلة أن الرسالة وصلت في console ولم تظهر:
- افحص أولًا query key
- افحص شكل الكاش الخام
- افحص `extractMessengerMessages`

3. لو الصوت اشتغل أكثر من مرة:
- افحص `playMessengerNotificationSound`
- لا تضف تشغيل صوت مباشر في أكثر من مكان بدون مفتاح dedupe

4. لو المحادثة لا تنزل لآخر رسالة:
- افحص `autoFocusKey`
- افحص `autoScrollKey`
- افحص `showScrollToBottom` داخل `FloatingChatMessages.jsx`

5. لو الرسالة الجديدة لا تلمع:
- افحص `highlightedMessageId`
- افحص `useRealtimeMessageHighlight`

---

## الأماكن التي تستخدم الشات الموحّد حاليًا

- `ConversationsPage.jsx`
- `MessengerSidebarPanel.jsx`
- `FloatingMessengerChat.jsx` عبر `FloatingCustomerChat.jsx`

إذا تمت إضافة واجهة ماسنجر جديدة مستقبلًا، يفضل أن تعتمد على نفس `MessengerChatThread` بدل بناء واجهة منفصلة.

---

## اقتراحات تطوير مستقبلية

1. توحيد الهيدر أيضًا في مكوّن مشترك بدل بقاء كل شاشة بهيدر خاص بها.
2. دعم تحميل رسائل أقدم في صفحة المحادثات الرئيسية والسايدبار مثل الشات العائم.
3. إضافة badge بصري على المحادثة في القائمة عند وصول رسالة جديدة.
4. دعم الرسائل المرفقة والملفات داخل `MessengerChatThread` بشكل موحّد.
5. إضافة logger تشخيصي اختياري للمحادثات في وضع التطوير فقط.

---

## ملخص سريع

إذا أردت تعديل أي شيء في شات ماسنجر:

- شكل الرسائل أو سلوكها:
  - `MessengerChatThread.jsx`
  - `FloatingChatMessages.jsx`

- سلوك الكتابة والإرسال:
  - `FloatingChatComposer.jsx`

- realtime:
  - `useMessengerRealtime.js`
  - `useMessengerFloatingChat.js`
  - `ConversationsPage.jsx`
  - `MessengerSidebarPanel.jsx`

- الصوت:
  - `messengerNotificationSound.js`

هذا هو المرجع الأساسي الحالي لماسنجر شات داخل المشروع.