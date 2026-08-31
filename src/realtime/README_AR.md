# WebSocket / Reverb

هذا الفولدر هو المكان المركزي لأي كود خاص بالـ WebSocket و Laravel Reverb.

## الملفات

- `echo.js`: إعداد Laravel Echo و Pusher وبناء عنوان Reverb من متغيرات البيئة.
- `hooks/useRealtimeChannel.js`: Hook عام للاشتراك في أي channel/event.
- `hooks/useTableFormatRulesRealtime.js`: Hook خاص بتحديث تنسيقات الجداول لحظيا.
- `hooks/useTenantNotificationsRealtime.js`: Hook خاص بإشعارات المستخدم على قناة `tenant.{tenantId}.notifications.{userId}`.
- `TenantNotificationsRealtime.jsx`: مكون تشغيل عام للإشعارات داخل التطبيق.
- `index.js`: exports موحدة لاستخدامها من باقي المشروع.

## الاستخدام العام

```jsx
import { useRealtimeChannel } from '../../realtime'

useRealtimeChannel({
  channelName: 'tenant.test0002.notifications',
  eventName: '.notification.created',
  enabled: true,
  isPrivate: true,
  onEvent: (payload) => {
    console.log(payload)
  },
})
```

## إشعارات المستخدم

تم تشغيل الاستماع العام داخل `App.jsx` عبر:

```jsx
<TenantNotificationsRealtime />
```

القناة المستخدمة هي نفس صيغة Laravel Echo:

```jsx
Echo.private(`tenant.${tenantId}.notifications.${userId}`)
  .listen('.notification.created', (e) => {
    console.log('Notification received:', e)
  })
```

الاستخدام المباشر عند الحاجة:

```jsx
import { useTenantNotificationsRealtime } from '../../realtime'

useTenantNotificationsRealtime({
  tenantId,
  userId,
  onNotification: (payload) => {
    console.log(payload)
  },
})
```

الـ Hook يحاول تحديد `tenantId` من بيانات المستخدم أو من subdomain الحالي، ويحدد `userId` من بيانات المستخدم المسجلة في `authStore`.

## إعدادات البيئة

```env
VITE_REALTIME_ENABLED=true
VITE_REVERB_APP_KEY=your-reverb-app-key
VITE_REVERB_HOST=localhost
VITE_REVERB_SCHEME=http
VITE_REVERB_PORT=8080
```

إذا لم يتم ضبط `VITE_REVERB_HOST`، يتم بناء host من subdomain الحالي و `VITE_REVERB_ROOT_DOMAIN`.
