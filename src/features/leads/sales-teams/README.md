# features/leads/sales-teams — فرق السيلز وتوزيع الليدز

> **Documentation update:** 2026-10-16 02:40 (Africa/Cairo) — صفحتين جداد: [مستخدمين السيلز](sales-users/README.md) و[توزيع المحادثات](channel-distribution/README.md).
> 2026-10-16 00:45 (Africa/Cairo) — شروط القاعدة من حملات / إعلانات / نماذج ميتا والـ CRM (`utils/ruleSources.js`)، وفريق سريع واختيار موظف في صفحة القاعدة.
> 2026-10-16 00:10 (Africa/Cairo) — بقى قسم لوحده بسايد بار خاص (الفرق، قواعد التوزيع، قاعدة جديدة، التقارير)، وإضافة القاعدة بقت صفحة خطوات في [`rule-builder/`](rule-builder/README.md).
> 2026-10-15 23:40 (Africa/Cairo) — الفولدر اتعمل.

القسم اللي بيتعرف فيه **مين في فريق السيلز** و**الليد الجديد يروح لمين**. له **سايد بار خاص** (مش سايد بار مركز العملاء):

| عنصر السايد بار | المسار | الصفحة |
|---|---|---|
| الفرق | `/LeadsCenter/teams` | `TeamsView`: 3 أرقام، فلاتر، كروت الفرق، إنشاء / تعديل فريق (نافذة) |
| قواعد التوزيع | `/LeadsCenter/teams/rules` | `RulesView`: شرح التوزيع، فلاتر، القواعد بالأولوية، تفعيل / إيقاف، تعديل ← صفحة الخطوات |
| مستخدمين السيلز | `/LeadsCenter/teams/users` | `SalesUsersView`: الأولوية الفريدة، المدير، الدور، النوع، الحالة — [README](sales-users/README.md) |
| ↳ قاعدة توزيع جديدة | `/LeadsCenter/teams/rules/new` | `RuleBuilder` — صفحة خطوات بشرح كل خطوة ([README](rule-builder/README.md)) |
| توزيع المحادثات | `/LeadsCenter/teams/channels` | `ChannelDistributionView`: طريقة توزيع كل قناة (واتساب، ماسنجر) والمستخدمين المستلمين بالأولوية — [README](channel-distribution/README.md) |
| التقارير والإحصائيات | `/LeadsCenter/teams/reports` | `SalesTeamsReportView` على `ReportsPage` |
| (الفوتر) مركز العملاء المحتملين | `/LeadsCenter` | رجوع |

تعديل قاعدة: `/LeadsCenter/teams/rules/{id}/edit`. `/LeadsCenter/assignments` بيحوّل على `/LeadsCenter/teams/rules`، وعنصر "توزيع العملاء المحتملين" في سايد بار مركز العملاء بيفتح نفس الصفحة.

| | |
|---|---|
| **صفحات الراوت** | `pages/sales-teams/` (`SalesTeamsLayout` + `salesTeamsNavigation.js` + `SalesTeamsPages.jsx`) — [README](../../../pages/sales-teams/README.md) |
| **الواجهة العامة** | `index.js`: `TeamsView`، `RulesView`، `RuleBuilder`، `SalesTeamsReportView`، `SALES_TEAMS_ROUTES`، `newRuleForTeam`، `ASSIGN_TYPES`، `RULE_SOURCES`، `TEAM_TYPES`، `buildRulePayload`، `normalizeRule` (وكلهم من `features/leads`) |
| **الترجمة** | موديول `salesTeams` في `locales/{ar,en}/salesTeams.js` |
| **الاختبارات** | `utils/salesTeamsModel.test.js`، `utils/ruleSources.test.js`، `rule-builder/utils/ruleBuilder.test.js`، `reports/salesTeamsReportModel.test.js` |

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
- زرار "قاعدة توزيع" في الكارت بيفتح صفحة القاعدة الجديدة والفريق متختار (`?team=`).
- فلاتر: بحث (اسم الفريق / القائد / عضو)، النوع، الحالة.
- **الإنشاء**: طلب واحد فيه النوع والأعضاء.
- **التعديل**: `update` (الاسم، القائد، نشط)، وبعده `attach-members` / `detach-members` **بالفرق بس** بين الأعضاء القدام والجداد.
- **القائد مش عضو**: بيظهر في قائمة الأعضاء متعلم ومقفول، ولو اتختار قائد بيتشال من الأعضاء.
- **النوع بيتحدد عند الإنشاء بس**، لأن `update` مفيهوش `type` (سؤال للباك E3).

## قواعد التوزيع
كل قاعدة بتتعرض كده: **الأولوية · الاسم** ثم **الشروط ← طريقة التوزيع ← المستلم**، ومفتاح نشط / غير نشط وزرار تعديل (بيفتح صفحة الخطوات).
الإنشاء والتعديل نفسهم في [`rule-builder/`](rule-builder/README.md).

**الشروط** (أي شرط فاضي = أي قيمة، ولو كلهم فاضيين القاعدة بتمسك كل الليدز):
- `source`: فيسبوك، ماسنجر، واتساب، نموذج ليد، الموقع، جوجل، ترشيح، يدوي، أخرى (`RULE_SOURCES`). لو القاعدة المتخزنة فيها قيمة تانية بتفضل ظاهرة.
- `campaign_id`, `ad_id`, `form_id`: من حملات ميتا (مركز الحملات) والـ CRM، وإعلانات الحملة المختارة من مجموعاتها الإعلانية، ونماذج الليد — التفاصيل في [rule-builder/README](rule-builder/README.md#مصادر-الحملات-والإعلانات-والنماذج-hooksuseruleconditionoptionsjs--utilsrulesourcesjs).
  تغيير الحملة بيفضّي الإعلان.
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
├── constants/salesTeamsRoutes.js  مسارات القسم
├── components/
│   ├── TeamsView.jsx · TeamsSection.jsx · TeamCard.jsx · TeamDialog.jsx · TeamMembersPicker.jsx
│   ├── RulesView.jsx · RulesSection.jsx · RuleCard.jsx · RulesGuide.jsx
│   └── AssignTypePicker.jsx       كروت طرق التوزيع (بيستخدمها rule-builder) + ASSIGN_TYPE_ICONS
├── hooks/
│   ├── useSalesTeamsData.js      الفرق + المستخدمين + القواعد → نماذج عرض وأرقام
│   ├── useTeamEditor.js          إنشاء / تعديل فريق (create أو update + attach/detach)
│   ├── useRuleToggle.js          تفعيل / إيقاف قاعدة من الكارت
│   └── useRuleConditionOptions.js  خيارات الحملات / الإعلانات / النماذج + أسماءهم
├── rule-builder/                 صفحة إنشاء / تعديل قاعدة خطوة بخطوة (README خاص)
├── sales-users/                  مستخدمين السيلز (README خاص)
├── channel-distribution/         توزيع المحادثات حسب القناة (README خاص)
├── reports/                      salesTeamsReportModel.js (+ test) · useSalesTeamsReport.js · SalesTeamsReportView.jsx
└── utils/
    ├── teamModel.js              قراءة الفريق بأي شكل، payloads، فرق الأعضاء، الفلاتر
    ├── ruleModel.js              قراءة القاعدة، payload، التحقق، الترتيب، التحذيرات
    ├── ruleSources.js            دمج حملات / إعلانات / نماذج ميتا والـ CRM لخيارات الشروط (+ test)
    └── salesTeamsModel.test.js
```

## التقارير (`reports/`)
أرقام: فرق نشطة (ومتوسط حجم الفريق)، قواعد نشطة (ومنها لكل الليدز)، مستخدمين بدون فريق، "محتاج مراجعة" (قواعد بتحذير + فرق نشطة بدون قاعدة).
رسوم: حجم الفرق (أعضاء + قائد)، القواعد النشطة حسب طريقة التوزيع / المصدر / الفريق، الفرق حسب النوع. التوزيع الفعلي للليدز على الموظفين في تقارير مركز العملاء.

## إزاي تزوّد
- **مصدر ليد جديد**: ضيفه في `RULE_SOURCES` وترجمته في `salesTeams.sources.*` (ar + en).
- **نوع فريق جديد**: `TEAM_TYPES` + `salesTeams.teamTypes.<type>.label|hint`.
- **طريقة توزيع جديدة**: `ASSIGN_TYPES` + `ASSIGN_TYPE_TARGET` + أيقونة في `ASSIGN_TYPE_ICONS` + `salesTeams.assignTypes.<type>` + `salesTeams.builder.method.when.<type>`.
- **صفحة جديدة في القسم**: راوت تحت `LeadsCenter/teams` في `app/router/index.jsx`، مسار في `constants/salesTeamsRoutes.js`، وعنصر في `pages/sales-teams/salesTeamsNavigation.js`.
- **شرط جديد** (منطقة، اهتمام...): `CONDITION_KEYS` و`EMPTY_RULE_FORM` و`buildRulePayload`، وحقل في `rule-builder/components/steps/ConditionsStep.jsx` — بعد ما الباك يدعمه.

## ثغرات معروفة
- مفيش حذف قاعدة ولا حذف فريق (مفيش endpoints).
- نوع الفريق مش بيتعدل، وشيل القائد في التعديل مش بيتبعت (`toFormData` بيشيل `null`) — E3.
- اتجاه الأولوية ومعنى "أول قاعدة مطابقة" مش متأكدين منهم — E3.
- الصفحة مبتعرضش التوزيع الفعلي (مين استلم كام ليد)؛ ده في تقارير مركز العملاء (`/LeadsCenter/reports` → حسب المسؤول).
- الصلاحيات على الباك؛ الصفحة متاحة لأي حد بيشوف مركز العملاء.
