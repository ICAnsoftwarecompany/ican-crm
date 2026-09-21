# Wizard إنشاء حملة Meta — دليل الفولدر

آخر تحديث: 2026-09-21 (Phase 1 من إعادة تصميم أوسع — انظر آخر قسم للخطة الكاملة).

هذا الملف بيشرح فولدر `CampaignCreatePage/` بالتفصيل: إيه اللي موجود، ليه اتبنى كده، وإزاي تضيف حاجة جديدة من غير ما تكسر حاجة موجودة. للسياق الأوسع (Campaign Center كله، Platform Registry، الـrouting العام) شوف `src/features/campaigns/docs/CAMPAIGN_CENTER_ARCHITECTURE_AR.md` — الملف ده بيركّز بس على صفحة الإنشاء.

---

## 1. الفكرة العامة

الصفحة دي wizard من 5 مراحل لإنشاء حملة Meta، مصمّمة تقترب من سلوك Meta Ads Manager الحقيقي بدل ما تبقى فورم مسطّح: هدف ODAX كامل، تبديل بين "Advantage" (فيسبوك بيتصرف تلقائيًا) و"يدوي" لكل قسم معقد، ودليل سياقي حي (Guide Panel) جنب كل حقل.

**أهم قاعدة تصميم:** الـwizard كله بيشتغل على **state محلي** (مش نداء API) لحد ما تدوس "Publish Now" بس. يعني تقدر تملأ كل الحقول، تعمل Save Draft، تقفل المتصفح، ترجع تاني — من غير ما أي حاجة تتبعت لـMeta أو للباك إند. ده قرار تصميم متعمّد (مش نقص) عشان الفريق يقدر يبني ويختبر شكل الـUX كامل من غير ما يستنى عقود API جاهزة.

---

## 2. خريطة الفولدر

```text
CampaignCreatePage/
├── index.js                     تصدير barrel: export { CampaignCreatePage }
├── CampaignCreatePage.jsx       المكوّن الرئيسي — يركّب الـshell كله + يستدعي useCampaignWizardState()
├── CreateWizardHeader.jsx       زرار رجوع + اسم المنصة + Save Draft + "تم الحفظ الساعة كذا"
├── CreateWizardStepper.jsx      شريط الـ5 مراحل (Objective → Campaign Setup → Ad Sets → Ads → Review)
├── CreateWizardFooter.jsx       Cancel / Save Draft / Continue أو Publish
│
├── state/                       ← كل الـstate المحلي، بدون أي استدعاء API (غير Publish)
│   ├── initialWizardState.js    الشكل الافتراضي الكامل للـstate (objective, campaign, adSets[], meta)
│   ├── wizardReducer.js         الـreducer النقي + أنواع الأكشن (WIZARD_ACTIONS)
│   ├── wizardReducer.test.js    اختبارات vitest للـreducer (8 حالات)
│   ├── wizardLocalStorage.js    حفظ/تحميل/مسح مسودة localStorage
│   ├── useCampaignWizardState.js  الـhook الرئيسي: reducer + autosave + منطق استكمال المسودة
│   └── wizardStages.js          مصفوفة STAGES (أسماء المراحل الخمس)
│
├── components/                  مكوّنات محلية للـwizard بس (مش shared/ ومش features/)
│   ├── CardOption.jsx           بطاقة اختيار واحدة (تستخدمها مرحلة Objective)
│   ├── ToggleMode.jsx           تبديل "Advantage" مقابل "يدوي" — صفوف radio
│   ├── CampaignBudgetFields.jsx حقول الميزانية/الجدولة/الـBid (قابلة لإعادة الاستخدام على مستوى الحملة أو الـAd Set)
│   ├── GuidePanel.jsx           لوحة الدليل الجانبية الدائمة (مش قابلة للإغلاق)
│   └── guideContent.js          خريطة صغيرة لحقل "الافتراضي" لكل مرحلة (نصوص الدليل نفسها في ملفات الترجمة)
│
└── steps/                       مكوّن واحد لكل مرحلة من الـ5
    ├── ObjectiveStep.jsx        المرحلة 1 — 6 بطاقات هدف (ODAX الكامل)
    ├── CampaignSetupStep.jsx    المرحلة 2 — الاسم، الصفحة، فئة الإعلان الخاصة، تبديل الميزانية
    ├── NotConfiguredStep.jsx    placeholder مشترك (نفس المستخدم في Analytics/Billing) — لمرحلتي Ad Sets وAds حاليًا
    └── ReviewStep.jsx           المرحلة 5 — ملخص قراءة فقط قبل الإرسال
```

---

## 3. طبقة الـstate — إزاي الـwizard بيفتكر بياناتك

### الشكل (`initialWizardState.js`)

الـstate شكله واحد شجري كامل من أول يوم، حتى إن Phase 1 مش بيستخدم كل حقوله:

```js
{
  objective: 'OUTCOME_LEADS',
  campaign: { name, pageId, specialAdCategories, budgetLevel, budgetType, budgetAmount, schedule, bidStrategy, bidAmount },
  adSets: [{ id, name, budgetType, ..., audience: {...}, placements: {...}, ads: [] }],
  meta: { lastSavedAt, currentStage, focusedField, isDraft, activeAdSetId, activeAdIdByAdSet },
}
```

**ليه الشكل ده متكامل من الأول؟** عشان لما Phase 2/3 يضيفوا مراحل Ad Sets/Ads الحقيقية، مسودات المستخدمين المحفوظة في `localStorage` تفضل شغالة من غير أي migration. الحقول اللي Phase 1 مش بيعرضها في أي فورم (زي `adSets[].audience`) موجودة بس مش متلمّسة.

### الـreducer (`wizardReducer.js`)

`useReducer` مش `useState` + دمج سطحي — لأن فيه تداخل حقيقي (`adSets[].ads[]`) مش ممكن تستهدفه بأمان بدمج سطحي. الأكشنز المُنفّذة فعليًا دلوقتي بس (Phase 1):

| الأكشن | بيعمل إيه |
|---|---|
| `SET_OBJECTIVE` | يغيّر `state.objective` |
| `UPDATE_CAMPAIGN` | يدمج patch جزئي في `state.campaign` |
| `SET_STAGE` | يغيّر `state.meta.currentStage` (المرحلة الحالية) |
| `SET_FOCUSED_FIELD` | يغيّر `state.meta.focusedField` (بيحرّك الدليل الجانبي) |
| `SET_LAST_SAVED` | يسجّل توقيت آخر حفظ |
| `LOAD_DRAFT` | يستبدل الـstate كله بمسودة محفوظة |
| `CLEAR_DRAFT` | يرجّع الـstate للقيم الافتراضية |

أكشنز التعامل مع Ad Sets/Ads (زي `ADD_AD_SET`, `UPDATE_AD`) **لسه مش موجودة عمدًا** — هتتضاف في Phase 2/3 لما يبقى فيه فورم فعلي بينادي عليها. مفيش كود ميت.

### الحفظ المحلي (`wizardLocalStorage.js` + `useCampaignWizardState.js`)

- المسودة بتتحفظ في `localStorage` تحت مفتاح مرتبط بالـ tenant + platform + account:
  `ican-campaign-wizard-draft:{tenantId}:{platformId}:{accountId}`
  (كده لو أكتر من tenant أو حساب إعلاني بيستخدموا نفس المتصفح، كل واحد يشوف مسودته بس).
- **Autosave تلقائي** كل ما الـstate يتغيّر (بعد تأخير 800ms)، من غير ما تدوس أي زرار.
- زرار **"Save Draft"** بيعمل نفس الحفظ فورًا (`saveDraftNow`) + يحدّث "تم الحفظ الساعة كذا" في الهيدر.
- **مهم جدًا:** ده **تخزين محلي حقيقي دلوقتي** — قبل كده، زرار Save Draft كان بينادي نفس API الإنشاء الحقيقي (يعني كان بيعمل حملة فعلية على Meta!). دلوقتي الحفظ محلي بالكامل، ومفيش نداء شبكة نهائي غير لحظة "Publish Now".
- لما تفتح الصفحة ولقى مسودة محفوظة، بيظهر banner فوق: **"عندك مسودة محفوظة من كذا. عايز تكمل عليها؟"** مع زرارين "استكمال المسودة" / "ابدأ من جديد" — الـautosave بيتوقف مؤقتًا لحد ما تختار، عشان مسودة قديمة متتكتبش فوق مسودة تانية من غير قصد.

---

## 4. المراحل الخمس بالتفصيل

### المرحلة 1 — الهدف (`steps/ObjectiveStep.jsx`)

6 بطاقات (مكوّن `CardOption`) لأهداف Meta الستة (ODAX): الوعي بالعلامة، الزيارات، التفاعل، الليدات، ترويج التطبيق، المبيعات. اختيار واحد بس. الـhover/focus على أي بطاقة بيحرّك الدليل الجانبي يوريك "استخدمه امتى".

**ملاحظة:** الهدف مينفعش يتغيّر بعد إنشاء الحملة على الحقيقة — الصفحة بتوضّح كده في نص تحت البطاقات.

### المرحلة 2 — إعداد الحملة (`steps/CampaignSetupStep.jsx`)

- اسم الحملة.
- **صفحة فيسبوك** — ملاحظة مهمة: الحقل ده موجود هنا **مؤقتًا بس**. في التصميم المستهدف، اختيار الصفحة المفروض يبقى على مستوى كل إعلان (Ad) في مرحلة "الإعلانات" (Phase 3)، لكن مرحلة الإعلانات لسه مش موجودة، ومرحلة النشر محتاجة `page_id` عشان تقدر تنادي الـAPI الحقيقي. لما مرحلة Ads تتبني، الحقل ده هينتقل لمكانه الصح وهيتشال من هنا.
- **فئة الإعلان الخاصة** (بدون / ائتمان / وظائف / إسكان) — اختيار واحدة منهم هيقفل حقول استهداف معيّنة لاحقًا (لما مرحلة الجمهور تتبني في Phase 2)، لأن ده مطلوب قانونيًا في أماكن كتير.
- **تبديل الميزانية** (أهم قرار في المرحلة دي): "ميزانية واحدة للحملة كلها" (موصى به، فيسبوك بيوزّع تلقائيًا) مقابل "ميزانية منفصلة لكل Ad Set" (تحكم كامل، مفيد لاختبار A/B عادل). لو اخترت "ميزانية الحملة"، حقول الميزانية/الجدولة/الـBid Strategy (`components/CampaignBudgetFields.jsx`) بتظهر هنا فورًا. لو اخترت "لكل Ad Set"، بتختفي من هنا وتظهر بعدين جوه كل مجموعة إعلانية (لما Phase 2 يتبني).

### المرحلتين 3 و4 — Ad Sets / Ads

لسه `NotConfiguredStep` (نفس الـplaceholder المستخدم في Analytics وBilling) — مفيش عقد API حقيقي لسه، والفورم الكامل (جمهور Advantage+/يدوي، مواضع، N إعلانات لكل مجموعة، Lead Form Builder الكامل) موثّق كـPhase 2/3 قادمة، مش مبني حاليًا.

### المرحلة 5 — المراجعة (`steps/ReviewStep.jsx`)

ملخص قراءة فقط (اسم الحملة، الصفحة، الهدف، مستوى الميزانية) قبل الإرسال. الشجرة القابلة للطي وقائمة التحقق التفصيلية (✅/⚠️/❌) موثّقة كـPhase 4 قادمة.

---

## 5. لوحة الدليل (`components/GuidePanel.jsx` + `guideContent.js`)

- عمود جانبي **ثابت الظهور** (مش Drawer قابل للإغلاق زي `AppDrawer`) — دايمًا موجود جنب الفورم.
- بيقرأ `state.meta.focusedField` (بيتحدد من `onFocus`/`onMouseEnter` على أي حقل أو بطاقة) ويعرض عنوان + شرح مربوطين بيه من ملف الترجمة (`campaigns.create.guide.<fieldId>.title` / `.body`).
- لو مفيش حقل مُركّز عليه، بيعرض "التلميح الافتراضي" للمرحلة الحالية (معرّف في `guideContent.js` → `STAGE_DEFAULT_GUIDE_FIELD`).
- **مفيش خريطة JS كبيرة للنصوص** — `guideContent.js` بيحمل بس تعريف "الحقل الافتراضي" لكل مرحلة؛ النصوص نفسها (عنوان + شرح) موجودة في `src/locales/{ar,en}/campaigns.js` تحت `create.guide.*`، عشان ملف الترجمة يفضل هو المصدر الوحيد للنصوص، مش نسختين لازم تتزامنوا يدويًا.

**إزاي تضيف guide لحقل جديد:**
1. في المكوّن، نادِ `onFocusField('stage.fieldName')` عند focus/hover الحقل.
2. ضيف `campaigns.create.guide.stage.fieldName.title` و`.body` في الترجمتين (ar وen) — لازم الاتنين بنفس الـpath بالظبط (`npm run check:i18n` بيتأكد من كده).

---

## 6. النشر — إيه اللي بيتبعت فعليًا لـMeta دلوقتي

**"Publish Now"** هو النداء الشبكي الوحيد في الصفحة كلها، وبينادي نفس الـmutation الموجودة أصلاً (`useFacebookCampaignMutations().create` من `features/campaigns/facebook-campaign`)، بس البيانات جاية من الـstate الجديد بدل الـform القديم المسطّح:

```js
mutations.create.mutateAsync({
  ad_account_id: context.accountId,
  campaign_name: state.campaign.name,
  page_id: state.campaign.pageId,
  objective: state.objective,
})
```

**مهم:** أي بيانات تجمّعها الـwizard عن Ad Sets/Ads/Lead Forms (لما Phase 2/3 يتبنوا) هتتحفظ في المسودة المحلية بس — **مفيش عقد API حقيقي لإرسالها لـMeta لحد دلوقتي**. نص المراجعة (`campaigns.create.review.note`) بيوضّح ده صراحة عشان محدش يفتكر إن "تم النشر بنجاح" معناها إن الـAd Sets والإعلانات اتبنت فعليًا على Meta.

---

## 7. الترجمة

كل نصوص الصفحة في `src/locales/{ar,en}/campaigns.js` تحت مفتاح `create.*` (مفيش ملف ترجمة منفصل للـwizard — القاعدة في المشروع إن كل namespace علوي له ملف واحد بس، وده جزء من `campaigns.*`). القواعد المهمة:

- كل مفتاح جديد لازم يتضاف في الملفين (ar وen) بنفس الـpath بالظبط.
- القيم الخام من Meta (زي `OUTCOME_LEADS`, `daily`, `highest_volume`) **مبتتترجمش نفسها** — بس الـlabel المعروض جنبها. القيمة الخام بتفضل زي ما هي في الـstate/الـpayload.
- شغّل `npm run check:i18n` بعد أي إضافة — بيفشل لو فيه مفتاح ناقص في لغة أو فاضي.

---

## 8. إزاي تضيف مرحلة جديدة (لما يجيلك عقد API)

1. اعمل مكوّن جديد في `steps/` بنفس شكل الموجودين (بياخد `t`, الجزء اللي يخصه من الـstate، ودوال تحديث من `useCampaignWizardState`).
2. لو محتاج حقول تتكرر، اعمل مكوّن مشترك في `components/` (زي `CampaignBudgetFields.jsx`) بدل تكرار الكود.
3. لو الأكشن محتاج تحديث جزء جديد في الـstate (زي `adSets`)، ضيف action type جديد في `wizardReducer.js` + دالة bound جديدة في `useCampaignWizardState.js` — ماتلمسش الأكشنز الموجودة.
4. استبدل `NotConfiguredStep` بالمكوّن الجديد في `CampaignCreatePage.jsx` بس — الـshell (Header/Stepper/Footer/GuidePanel) ثابت ومش محتاج تعديل.
5. ضيف الترجمات (ar + en) + محتوى الدليل لأي حقل جديد.
6. لو فيه منطق نقي (زي حساب أهداف تحسين حسب الهدف)، حطه في ملف جديد جوه `state/` مع اختبار vitest بسيط، زي `wizardReducer.test.js`.
7. شغّل `npm run lint && npm run check:i18n && npm run check:architecture && npx vitest run && npm run build` وتأكد بصريًا من AR/RTL وEN/LTR ووضعي الفاتح/الغامق.

---

## 9. خطة المراحل القادمة (مش مبنية لسه)

- **Phase 2 — مرحلة Ad Sets الحقيقية:** تبويبات ديناميكية لإضافة/حذف أكتر من Ad Set، جمهور (Advantage+ / يدوي / جمهور مخصص من CRM tags / جمهور شبيه)، مواضع (Advantage+ / يدوي).
- **Phase 3 — مرحلة Ads الحقيقية:** تبويبات ديناميكية لإضافة/حذف أكتر من إعلان لكل مجموعة، رفع ميديا محلي، Lead Form Builder كامل (فورم موجود أو جديد بـ4 أقسام: مقدمة/نوع الفورم/الأسئلة/شاشة الشكر).
- **Phase 4 — إعادة بناء المراجعة:** شجرة قابلة للطي (حملة ← مجموعات ← إعلانات)، قائمة تحقق (✅/⚠️/❌)، وزرار "جدولة" (هيبقى معطّل لحد ما عقد الجدولة الحقيقي يتأكد من الباك إند).

للتفاصيل الكاملة عن القرارات دي والأسباب وراها، شوف تحديث "Campaign Builder" في `src/features/campaigns/docs/CAMPAIGN_CENTER_ARCHITECTURE_AR.md`.
