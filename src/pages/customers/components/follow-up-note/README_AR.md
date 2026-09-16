# follow-up-note

هذا الفولدر يحتوي مكونات إضافة متابعة أو ملاحظة على العميل المحتمل.

## الملفات

- `FollowUpNoteDialog.jsx`: ديالوج عائم قابل للسحب لإضافة متابعة على lead.
- `index.js`: نقطة تصدير موحدة للفولدر.

## Payload

الديالوج يرسل دائما:

```json
{
  "lead_id": 44,
  "action": "create_activity",
  "type": "note-to-lead",
  "title": "Follow up call",
  "description": "Calling the client",
  "note": "Client prefers afternoon calls",
  "data": {
    "duration": 15,
    "result": "no_answer"
  },
  "activity_at": "2026-07-27 14:30:00"
}
```

حقول تغيير الحالة اختيارية. لا يتم إرسال `new_status_id` أو `new_status_title` أو `old_status_title` إلا إذا اختار المستخدم "تريد تغيير الحالة؟" وحدد حالة جديدة.
