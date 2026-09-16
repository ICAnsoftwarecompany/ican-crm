# social-messaging

هذا الفولدر يحتوي مكونات الرسائل الاجتماعية التابعة لشريط إجراءات العملاء المحتملين.

تم نقله داخل `bulk-actions` لأن استخدامه الحالي مرتبط مباشرة بالشريط: المستخدم يحدد عملاء من الجدول، ثم يختار قناة مثل Messenger أو WhatsApp أو Mail أو SMS، وبعدها يفتح مودال كتابة الرسالة.

## الملفات

- `CustomerSocialMessagingPanel.jsx`: المودال الرئيسي لكتابة الرسالة وتجهيز Payload الإرسال.
- `SocialChannelsList.jsx`: قائمة أزرار القنوات.
- `SocialChannelButton.jsx`: زر قناة واحدة.
- `SocialChannelBadge.jsx`: شارة صغيرة بلون وأيقونة القناة.
- `SocialMessageRecipientsPreview.jsx`: معاينة أول المستلمين مع عدد الزيادة.
- `SocialMessageComposer.jsx`: مربع كتابة الرسالة.
- `SocialMessageDialogFooter.jsx`: أزرار إلغاء وإرسال داخل المودال.
- `SocialMessageHelpText.jsx`: نص توضيحي مختصر أسفل مربع الرسالة.
- `socialMessageChannels.js`: تعريف القنوات المتاحة وألوانها وأيقوناتها.
- `customerSocialMessagingUtils.js`: دوال استخراج اسم العميل، وسيلة التواصل، ورقم الـ lead.
- `index.js`: نقطة تصدير موحدة للفولدر.

## Payload الحالي

عند الإرسال يتم تجهيز بيانات بالشكل التالي:

```json
{
  "channel": "messenger",
  "recipients": [],
  "message": "text",
  "source": "customers_bulk_actions",
  "status": "draft"
}
```

حاليا المودال جاهز للربط مع API إرسال فعلي عبر `onSendMessage`.
