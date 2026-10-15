# features/leads/sales-teams — فرق السيلز وتوزيع الليدز

> **Documentation update:** 2026-10-15 23:40 (Africa/Cairo) — الفولدر اتعمل، وبقى صفحة `/LeadsCenter/teams` و`/LeadsCenter/assignments`.

الصفحة اللي بيتعرف فيها **مين في فريق السيلز** و**الليد الجديد يروح لمين**. فيها تابين:
**الفرق** و**قواعد التوزيع**، وفوقهم 4 أرقام (الفرق، القواعد، المستخدمين، المستخدمين اللي ملهمش فريق).

| | |
|---|---|
| **المسارات** | `/LeadsCenter/teams` (تاب الفرق) و`/LeadsCenter/assignments` (نفس الصفحة على تاب القواعد). التاب في `?tab=teams\|rules`. |
| **الصفحات** | `pages/customers/pages/CustomerTeamsPage.jsx` و`CustomerAssignmentsPage.jsx` — سطر واحد كل واحدة. |
| **الواجهة العامة** | `index.js`: `SalesTeamsWorkspace` (ومن `features/leads`)، `ASSIGN_TYPES`، `RULE_SOURCES`، `TEAM_TYPES`، `buildRulePayload`، `normalizeRule` |
| **الترجمة** | موديول `salesTeams` في `locales/{ar,en}/salesTeams.js` |
| **الاختبارات** | `utils/salesTeamsModel.test.js` (الـ payloads، فرق الأعضاء، الفلاتر، التحذيرات) |

## الدوال المستخدمة

### الفرق (`features/teams/api/teamsApi.js`)
| الإجراء | المسار | الـ body |
|---|---|---|
| قراءة | `GET /api/tenant/teams/get` | — |
| إنشاء | `POST /api/tenant/teams/create` | JSON `{ name, team_leader_id, active, type, members: [ids] }` |
| تعديل | `POST /api/tenant/teams/update/{teamId}` | FormData `name`, `team_leader_id`, `active` |
| إضافة أعضاء | `POST /api/tenant/teams/attach-members/{teamId}` | JSON `{ members: [ids] }` |
| شيل أعضاء | `POST /api/tenant/teams/detach-members/{teamId}` | JSON `{ members: [ids] }` |

`type` واحد من: `general`, `sales`, `support`, `collections`, `onboarding`, `operations` (الافتراضي في الفورم `sales`).
`active` بيتبعت `1` / `0`.

### قواعد التوزيع (`features/leads/api/leadAssignmentApi.js`)
| الإجراء | المسار |
|---|---|
| قراءة | `GET /api/tenant/lead-assignment/rules` |
| إنشاء | `POST /api/tenant/lead-assignment/create/rule` |
| تعديل / تفعيل / إيقاف | `POST /api/tenant/lead-assignment/update/rule/{id}` |

الـ body (JSON) هو نفس مثال الباك بالظبط:
```json
{ "name": "Facebook Ramadan Leads", "campaign_id": 1, "ad_id": null, "form_id": null, "source": "facebook",
  "assign_type": "round_robin", "team_id": 2, "user_id": null, "priority": 10, "active": true }
```

## الفرق
- كارت لكل فريق: النوع، نشط / غير نشط، القائد، صور الأعضاء، وعدد قواعد التوزيع النشطة اللي بتوجّه ليه.
- زرار "قاعدة توزيع" في الكارت بيفتح قاعدة جديدة والفريق متختار.
- فلاتر: بحث (اسم الفريق / القائد / عضو)، النوع، الحالة.
- **الإنشاء**: طلب واحد فيه النوع والأعضاء.
- **التعديل**: `update` (الاسم، القائد، نشط)، وبعده `attach-members` / `detach-members` **بالفرق بس** بين الأعضاء القدام والجداد.
- **القائد مش عضو**: بيظهر في قائمة الأعضاء متعلم ومقفول، ولو اتختار قائد بيتشال من الأعضاء.
- **النوع بيتحدد عند الإنشاء بس**، لأن `update` مفيهوش `type` (سؤال للباك E3).

## قواعد التوزيع
كل قاعدة بتتعرض كده: **الأولوية · الاسم** ثم **الشروط ← طريقة التوزيع ← المستلم**، ومفتاح نشط / غير نشط وزرار تعديل.

**الشروط** (أي شرط فاضي = أي قيمة، ولو كلهم فاضيين القاعدة بتمسك كل الليدز):
- `source`: فيسبوك، ماسنجر، واتساب، نموذج ليد، الموقع، جوجل، ترشيح، يدوي، أخرى (`RULE_SOURCES`). لو القاعدة المتخزنة فيها قيمة تانية بتفضل ظاهرة.
- `campaign_id`, `ad_id`, `form_id`: من حملات وإعلانات ونماذج الـ CRM (`features/campaigns` → `useCampaignLists`، `useAdsLists`).
  الإعلانات بتتفلتر على الحملة المختارة لو الإعلان فيه `campaign_id`، وتغيير الحملة بيفضّي الإعلان.
  الكروت بتعرض الأسماء من نفس القوايم بدل `#id`.

**طرق التوزيع (`assign_type`)**:
| القيمة | المعنى | المستلم المطلوب |
|---|---|---|
| `round_robin` | بالدور على أعضاء الفريق بالتساوي | `team_id` |
| `team` | للفريق كله وأي عضو يستلم | `team_id` |
| `team_leader` | لقائد الفريق وهو يوزع | `team_id` |
| `user` | لموظف محدد مباشرة | `user_id` |

الـ payload بيبعت المستلم اللي الطريقة محتاجاه بس، والتاني `null`.

**التفعيل والإيقاف من الكارت** بيبعت القاعدة كاملة على `update/rule/{id}` مع `active` الجديدة (عشان لو التعديل بيستبدل كل الحقول).

**تحذيرات على الكارت** (`ruleWarnings`): مفيش فريق / موظف، الفريق غير نشط، `team_leader` والفريق من غير قائد، الفريق فاضي، الموظف مش في قائمة المستخدمين.

**الترتيب**: الأولوية الأكبر الأول (`sortRules`) — ومستني تأكيد الباك (E3).

صندوق "إزاي توزيع الليدز بيشتغل؟" فوق القواعد بيشرح الخطوات والـ 4 طرق، وبيوضح إن التوزيع نفسه على السيرفر.

## الملفات
```
sales-teams/
├── index.js
├── components/
│   ├── SalesTeamsWorkspace.jsx   الهيدر + الأرقام + التابات + الحوارات
│   ├── TeamsSection.jsx · TeamCard.jsx
│   ├── TeamDialog.jsx · TeamMembersPicker.jsx
│   ├── RulesSection.jsx · RuleCard.jsx · RulesGuide.jsx
│   ├── RuleDialog.jsx · RuleConditionFields.jsx · AssignTypePicker.jsx
├── hooks/
│   ├── useSalesTeamsData.js      الفرق + المستخدمين + القواعد → نماذج عرض وأرقام
│   ├── useTeamEditor.js          إنشاء / تعديل فريق (create أو update + attach/detach)
│   ├── useRuleEditor.js          إنشاء / تعديل قاعدة + التفعيل من الكارت
│   └── useRuleConditionOptions.js  خيارات الحملات / الإعلانات / النماذج + أسماءهم
└── utils/
    ├── teamModel.js              قراءة الفريق بأي شكل، payloads، فرق الأعضاء، الفلاتر
    ├── ruleModel.js              قراءة القاعدة، payload، التحقق، الترتيب، التحذيرات
    └── salesTeamsModel.test.js
```

## إزاي تزوّد
- **مصدر ليد جديد**: ضيفه في `RULE_SOURCES` وترجمته في `salesTeams.sources.*` (ar + en).
- **نوع فريق جديد**: `TEAM_TYPES` + `salesTeams.teamTypes.<type>.label|hint`.
- **طريقة توزيع جديدة**: `ASSIGN_TYPES` + `ASSIGN_TYPE_TARGET` + أيقونة في `ASSIGN_TYPE_ICONS` + `salesTeams.assignTypes.<type>`.
- **شرط جديد** (منطقة، اهتمام...): `CONDITION_KEYS` و`EMPTY_RULE_FORM` و`buildRulePayload`، وحقل في `RuleConditionFields` — بعد ما الباك يدعمه.

## ثغرات معروفة
- مفيش حذف قاعدة ولا حذف فريق (مفيش endpoints).
- نوع الفريق مش بيتعدل، وشيل القائد في التعديل مش بيتبعت (`toFormData` بيشيل `null`) — E3.
- اتجاه الأولوية ومعنى "أول قاعدة مطابقة" مش متأكدين منهم — E3.
- الصفحة مبتعرضش التوزيع الفعلي (مين استلم كام ليد)؛ ده في تقارير مركز العملاء (`/LeadsCenter/reports` → حسب المسؤول).
- الصلاحيات على الباك؛ الصفحة متاحة لأي حد بيشوف مركز العملاء.
