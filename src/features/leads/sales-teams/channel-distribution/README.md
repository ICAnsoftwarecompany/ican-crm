# features/leads/sales-teams/channel-distribution — توزيع المحادثات

> **Documentation update:** 2026-10-16 02:40 (Africa/Cairo) — الفولدر اتعمل.

صفحة `/LeadsCenter/teams/channels` (عنصر "توزيع المحادثات" في سايد بار فرق السيلز): مين يستلم المحادثات الجديدة
اللي جاية من **واتساب** و**ماسنجر**. إنستجرام وتيك توك وجيميل وسناب شات ظاهرين "قريبًا" (`CHANNELS`).

| | |
|---|---|
| **الواجهة العامة** | `index.js`: `ChannelDistributionView` |
| **الترجمة** | `salesTeams.channels.*` |
| **الاختبارات** | `utils/channelDistributionModel.test.js` |

## الدوال (`api/channelDistributionApi.js`، JSON)
| الجزء | الطلبات | الـ body |
|---|---|---|
| إعداد القناة (مرة واحدة لكل قناة) | `GET/POST /api/tenant/channel/distribution-settings`، `PUT/DELETE …/{id}` | `{ channel, identifier: null, strategy, fallback_strategy, active }` |
| المستخدمين المستلمين | `GET/POST /api/tenant/channel/assignment-rules`، `PUT/DELETE …/{id}` | إنشاء: `{ channel, identifier, user_id, priority, active }` — تعديل: `{ priority, active }` |

- `strategy`: `round_robin_all` (بالدور على الكل)، `round_robin_online` (بالدور على المتصلين)، `working_hours` (حسب ساعات العمل).
- `fallback_strategy`: `round_robin_all`، `round_robin_online`، `unassigned` (تفضل من غير مسؤول).
- `channel`: `whatsapp`، `messenger`.

## الصفحة
1. **تابات القنوات** وعدد المستخدمين في كل قناة.
2. **إعداد القناة** (`ChannelSettingsCard`): كروت الطرق التلاتة بشرحها، الطريقة البديلة، تفعيل. لو مفيش إعداد: "مش متضبطة" والزرار بيعمل `POST`؛ لو موجود: `PUT` وزرار حذف.
3. **المستخدمين المستلمين** (`ChannelUserRules`): متقسمين حسب الصفحة / الرقم (`identifier`؛ فاضي = كل الصفحات / الأرقام) ومرتبين بالأولوية (1 الأول). لكل مستخدم: تعديل الرقم، سهم لفوق / لتحت، تفعيل / إيقاف، شيل (بتأكيد).
4. **إضافة مستخدم** (`AddChannelRuleDialog`): الصفحة أو الرقم (من ربط ميتا `GET /api/tenant/facebook/get/intgrations`: `facebook_pages` و`whatsapp`)، المستخدم (السيلز الأول، واللي موجود بالفعل مقفول)، **الترتيب الحالي لنفس الصفحة / الرقم بأولوياتهم** عشان تختار، والأرقام الفاضية بضغطة، والأولوية الافتراضية = أول رقم بعد الآخر.

## قواعد الأولوية
- فريدة لكل **قناة + صفحة/رقم** (`priorityTakenBy`)، ومن 1 وطالع، ومستخدم واحد مرة واحدة في نفس النطاق (`validateChannelRule`).
- **التبديل** (سهم لفوق / لتحت) = 3 طلبات: الأول ياخد رقم فاضي مؤقت، التاني ياخد رقم الأول، الأول ياخد رقم التاني (`useChannelRuleActions`).

## الملفات
```
channel-distribution/
├── index.js · README.md
├── api/channelDistributionApi.js
├── hooks/ useChannelDistribution.js (قراءة + mutations) · useChannelRuleActions.js (تفعيل، رقم، تبديل، شيل)
├── components/ ChannelDistributionView · ChannelSettingsCard · ChannelUserRules · ChannelRuleRow · AddChannelRuleDialog
└── utils/channelDistributionModel.js (+ test)
```

## إزاي تزوّد
- **قناة جديدة** (إنستجرام مثلًا): `live: true` في `CHANNELS`، ومصدر الصفحات / الحسابات في `identifierOptions`، و`salesTeams.channels.identifier.<channel>`.
- **طريقة توزيع جديدة**: `STRATEGIES` أو `FALLBACK_STRATEGIES` + `salesTeams.channels.strategies|fallbacks.<value>.{label,description}`.

## ثغرات معروفة
- ساعات العمل (`/api/tenant/channel/user-working-hours`) مش معروضة لسه؛ دالة الحفظ في الكولكشن `GET` ومحتاجة توضيح (E3).
- `index.js` بتاع `features/meta-integrations` بيعمل re-export لـ `messengerMetaApi` اللي متعلّق عليه، فالصفحة بتستورد `useFacebookIntegrations` من ملفه مباشرة.
- لو ميتا مش مربوطة، اختيار الصفحة / الرقم بيبقى "الكل" بس.
