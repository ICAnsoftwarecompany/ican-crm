# توثيق API - CodeA1 (Campaigns & WhatsApp Templates)

توثيق مُعدّ لفريق الفرونت إند بناءً على Postman Collection المرفوعة، يغطي كل الـ Endpoints الخاصة بالحملات (Campaigns) وصور قوالب واتساب (WhatsApp Template Images).

---

## 1. الإعدادات العامة

### Base URL
```
{{url_server}}
```
> يتم استبدالها بالدومين الفعلي للسيرفر (مثال: `https://api.example.com/`)

### المصادقة (Authentication)
معظم الطلبات تحتاج **Bearer Token** يُرسل في الـ Header:
```
Authorization: Bearer {{server_token}}
```
> `server_token` هو التوكن اللي بترجعه عملية تسجيل الدخول (Login).

⚠️ **ملاحظة مهمة:** بعض الـ Endpoints (زي `edite campaign`, `add customers`, `add/remove users`, `remove customers`) مش متسجل عليها Bearer Token في الكولكشن الحالي — لازم تتأكد مع الباك إند إذا كانت تحتاج توكن أو لأ قبل الدمج.

### باراميتر ثابت لكل الطلبات
كل الطلبات لازم تحمل الـ Query Param التالي:
```
?api_password=TenantSecret
```
> غالبًا دي قيمة ثابتة/سر خاص بالـ Tenant، اتأكد من قيمتها الحقيقية مع الباك إند قبل الإنتاج.

---

## 2. مجموعة Message Campaign

### 2.1 إنشاء حملة (Create Campaign)
تُستخدم لإنشاء حملة على أحد 3 قنوات: `whatsapp` / `gmail` / `messenger`.

**Endpoint:**
```
POST /api/tenant/campaigns/create?api_password=TenantSecret
```
**Auth:** Bearer Token

#### أ) حملة واتساب (channel = whatsapp)
```json
{
  "name": "حملة عروض رمضان",
  "channel": "whatsapp",
  "starts_at": "2026-09-06 00:24:00",
  "message": "test",
  "whatsapp_templet_genral": 0,
  "whatsapp_templete_id": 1,
  "metadata": {
    "phone_number_id": "1168175123041297",
    "template_params": {
      "header": ["Ramadan Sale"],
      "body": ["the end of the month", "RAMADAN25", "25%"]
    }
  },
  "customer_ids": [1, 2],
  "user_ids": [1, 2]
}
```

#### ب) حملة Gmail (channel = gmail)
```json
{
  "name": "حملة عروض رمضان",
  "channel": "gmail",
  "starts_at": "2026-09-06 00:56:00",
  "message": "test",
  "subject": "test crm",
  "metadata": {
    "mailbox_email": "slem20280@gmail.com"
  },
  "customer_ids": [1],
  "user_ids": [1, 2]
}
```

#### ج) حملة Messenger (channel = messenger)
```json
{
  "name": "حملة عروض رمضان",
  "channel": "messenger",
  "starts_at": "2026-09-06 02:02:00",
  "message": "test",
  "external_id": 52,
  "metadata": {},
  "customer_ids": [1],
  "user_ids": [1]
}
```

#### شرح الحقول (Body Fields)

| الحقل | النوع | إجباري؟ | الوصف |
|---|---|---|---|
| `name` | string | ✅ | اسم الحملة |
| `channel` | string | ✅ | واحدة من: `whatsapp` \| `gmail` \| `messenger` |
| `starts_at` | string (datetime) | ✅ | تاريخ ووقت بدء الحملة، الفورمات: `YYYY-MM-DD HH:mm:ss` |
| `message` | string \| null | حسب القناة | نص الرسالة (مش مطلوب في messenger مثلاً لو فيه template) |
| `subject` | string | فقط لـ gmail | عنوان الإيميل |
| `whatsapp_templet_genral` | number (0/1) | فقط لـ whatsapp | هل القالب عام أو لا |
| `whatsapp_templete_id` | number | فقط لـ whatsapp | ID القالب المُستخدم |
| `external_id` | number | فقط لـ messenger | معرف خارجي مرتبط بالـ messenger |
| `metadata.phone_number_id` | string | فقط لـ whatsapp | رقم هاتف واتساب بزنس |
| `metadata.mailbox_email` | string | فقط لـ gmail | بريد الإرسال |
| `metadata.template_params.header` | array<string> | فقط لـ whatsapp | قيم متغيرات الـ Header في القالب |
| `metadata.template_params.body` | array<string> | فقط لـ whatsapp | قيم متغيرات الـ Body في القالب |
| `customer_ids` | array<number> | ✅ | قائمة IDs العملاء المستهدفين |
| `user_ids` | array<number> | ✅ | قائمة IDs المستخدمين (الموظفين) المرتبطين بالحملة |

> ملاحظة: في الكولكشن فيه سطر معلّق (Comment) بيشير إن ممكن ترفع `files[]` كمان مع إنشاء الحملة، لكن مفيش تفاصيل إضافية عنه — راجع الباك إند لو محتاج ترفق ملفات وقت الإنشاء مباشرة (وإلا استخدم Endpoint إضافة الصور بعد الإنشاء، شوف 2.2).

---

### 2.2 إضافة صور للحملة
**Endpoint:**
```
POST /api/tenant/campaigns/{campaign}/add/images?api_password=TenantSecret
```
**Auth:** Bearer Token
**Body:** `form-data`

| Key | Type | الوصف |
|---|---|---|
| `files[]` | file (multiple) | الصور المراد رفعها للحملة |

> `{campaign}` في المسار = ID الحملة.

---

### 2.3 حذف صور من الحملة
**Endpoint:**
```
POST /api/tenant/campaigns/{campaign}/remove/images?api_password=TenantSecret
```
**Auth:** Bearer Token
**Body (JSON):**
```json
{
  "attachment_ids": [1, 2]
}
```
`attachment_ids`: قائمة IDs الصور (المرفقات) المراد حذفها.

---

### 2.4 عرض كل الحملات
**Endpoint:**
```
GET /api/tenant/campaigns?api_password=TenantSecret
```
**Auth:** Bearer Token
**Body:** لا يوجد

---

### 2.5 عرض تفاصيل حملة معينة
**Endpoint:**
```
GET /api/tenant/campaigns/show/{campaign}?api_password=TenantSecret
```
**Auth:** Bearer Token

---

### 2.6 حذف حملة
**Endpoint:**
```
GET /api/tenant/campaigns/{campaign}/destroy?api_password=TenantSecret
```
**Auth:** Bearer Token
> ملاحظة: العملية دي method فيها `GET` مش `DELETE` كما هو متوقع من الاسم — دي طريقة الباك إند الحالية، خد بالك وقت التنفيذ في الفرونت (مش REST قياسي).

---

### 2.7 إلغاء حملة (Cancel)
**Endpoint:**
```
GET /api/tenant/campaigns/{campaign}/cancel?api_password=TenantSecret
```
**Auth:** Bearer Token

---

### 2.8 عرض الحملات المجدولة (Scheduled)
**Endpoint:**
```
GET /api/tenant/campaigns/scheduled?api_password=TenantSecret
```
**Auth:** Bearer Token

---

### 2.9 عرض حملاتي (اللي أنا أنشأتها)
**Endpoint:**
```
GET /api/tenant/campaigns/my?api_password=TenantSecret
```
**Auth:** Bearer Token

---

### 2.10 عرض حملاتي المجدولة
**Endpoint:**
```
GET /api/tenant/campaigns/my/scheduled?api_password=TenantSecret
```
**Auth:** Bearer Token

---

### 2.11 تعديل حملة
**Endpoint:**
```
POST /api/tenant/campaigns/{campaign}/edite?api_password=TenantSecret
```
**Auth:** غير مسجل في الكولكشن (تأكد من الباك إند)

**Body (JSON):**
```json
{
  "name": "حملة عروض رمضان - معدلة",
  "channel": "whatsapp",
  "starts_at": "2026-09-06 23:00:00",
  "message": null,
  "whatsapp_templete_id": 1,
  "whatsapp_templet_genral": 0,
  "external_id": null,
  "metadata": {
    "phone_number_id": "1168175123041297",
    "mailbox_email": "slem20280@gmail.com",
    "template_params": {
      "header": ["Ramadan Sale"],
      "body": ["the end of the month", "RAMADAN25", "25%"]
    }
  }
}
```
> الحقول زي `external_id` و `mailbox_email` و`phone_number_id` بتتفعل حسب قيمة `channel` (نفس منطق الإنشاء في 2.1).

---

### 2.12 إضافة عملاء للحملة
**Endpoint:**
```
POST /api/tenant/campaigns/{campaign}/add/customers?api_password=TenantSecret
```
**Body:**
```json
{ "customer_ids": [1, 2] }
```

### 2.13 حذف عملاء من الحملة
**Endpoint:**
```
POST /api/tenant/campaigns/{campaign}/remove/customers?api_password=TenantSecret
```
**Body:**
```json
{ "customer_ids": [1, 2] }
```

### 2.14 إضافة مستخدمين (Users) للحملة
**Endpoint:**
```
POST /api/tenant/campaigns/{campaign}/add/users?api_password=TenantSecret
```
**Body:**
```json
{ "users": [1, 2] }
```

### 2.15 حذف مستخدمين (Users) من الحملة
**Endpoint:**
```
POST /api/tenant/campaigns/{campaign}/remove/users?api_password=TenantSecret
```
**Body:**
```json
{ "users": [1, 2] }
```

> ملاحظة: الـ 4 Endpoints دي (2.12 → 2.15) مفيهاش Bearer Token متسجل في الكولكشن — راجع الباك إند.

---

## 3. مجموعة Whatsapp Template Images

### 3.1 رفع صور لقالب واتساب
**Endpoint:**
```
POST /api/tenant/whatsapp/create/template/images?api_password=TenantSecret
```
**Auth:** Bearer Token
**Body:** `form-data`

| Key | Type | إجباري | الوصف |
|---|---|---|---|
| `template_id` | text | ✅ | ID القالب |
| `files[]` | file (multiple) | ✅ | الصور المراد ربطها بالقالب |

---

### 3.2 عرض كل صور القوالب
**Endpoint:**
```
GET /api/tenant/whatsapp/template/images?api_password=TenantSecret
```
**Auth:** Bearer Token

---

### 3.3 عرض صور قالب معين
**Endpoint:**
```
GET /api/tenant/whatsapp/template/{template}/images?api_password=TenantSecret
```
**Auth:** Bearer Token
> `{template}` = ID القالب.

---

### 3.4 تغيير حالة تفعيل صورة القالب
**Endpoint:**
```
POST /api/tenant/whatsapp/change/template/{template}/image/status?api_password=TenantSecret
```
**Auth:** Bearer Token
**Body:** `form-data`

| Key | Type | الوصف |
|---|---|---|
| `is_active` | text (0/1) | تفعيل/تعطيل الصورة |

---

## 4. ملخص جدول كل الـ Endpoints

| # | الاسم | Method | المسار |
|---|---|---|---|
| 1 | إنشاء حملة | POST | `/api/tenant/campaigns/create` |
| 2 | إضافة صور للحملة | POST | `/api/tenant/campaigns/{campaign}/add/images` |
| 3 | حذف صور الحملة | POST | `/api/tenant/campaigns/{campaign}/remove/images` |
| 4 | عرض كل الحملات | GET | `/api/tenant/campaigns` |
| 5 | حذف حملة | GET | `/api/tenant/campaigns/{campaign}/destroy` |
| 6 | تفاصيل حملة | GET | `/api/tenant/campaigns/show/{campaign}` |
| 7 | إلغاء حملة | GET | `/api/tenant/campaigns/{campaign}/cancel` |
| 8 | الحملات المجدولة | GET | `/api/tenant/campaigns/scheduled` |
| 9 | حملاتي | GET | `/api/tenant/campaigns/my` |
| 10 | حملاتي المجدولة | GET | `/api/tenant/campaigns/my/scheduled` |
| 11 | تعديل حملة | POST | `/api/tenant/campaigns/{campaign}/edite` |
| 12 | إضافة عملاء | POST | `/api/tenant/campaigns/{campaign}/add/customers` |
| 13 | حذف عملاء | POST | `/api/tenant/campaigns/{campaign}/remove/customers` |
| 14 | إضافة مستخدمين | POST | `/api/tenant/campaigns/{campaign}/add/users` |
| 15 | حذف مستخدمين | POST | `/api/tenant/campaigns/{campaign}/remove/users` |
| 16 | رفع صور قالب واتساب | POST | `/api/tenant/whatsapp/create/template/images` |
| 17 | عرض كل صور القوالب | GET | `/api/tenant/whatsapp/template/images` |
| 18 | عرض صور قالب معين | GET | `/api/tenant/whatsapp/template/{template}/images` |
| 19 | تغيير حالة صورة القالب | POST | `/api/tenant/whatsapp/change/template/{template}/image/status` |

---

## 5. ملاحظات عامة للفرونت إند

- كل الطلبات بتحتاج تضيف `api_password=TenantSecret` كـ Query Param — اتأكد من القيمة الحقيقية من الباك إند (دي غالبًا placeholder في الكولكشن مش قيمة إنتاج فعلية).
- الكولكشن الأصلي مفيهوش أي أمثلة Responses (Response Examples) — يُفضّل تطلب من الباك إند نماذج فعلية لكل response (success/error) قبل التكامل الكامل، خصوصًا رسائل الأخطاء (Validation Errors) وشكل الـ Pagination في endpoints زي `get campaigns`.
- بعض الـ Endpoints بتستخدم `GET` لعمليات فيها تعديل على البيانات (زي `destroy` و`cancel`) بدل `DELETE`/`PATCH` — تعامل معاها كأنها GET عادي في الطلبات لكن خد بالك إنها مش idempotent بمعنى الـ REST التقليدي.
- بعض الـ Endpoints بدون Bearer Token في الكولكشن (`edite`, `add/remove customers`, `add/remove users`) — لو حصل خطأ 401 عند التنفيذ، جرب تضيف التوكن برضه للتأكد.
