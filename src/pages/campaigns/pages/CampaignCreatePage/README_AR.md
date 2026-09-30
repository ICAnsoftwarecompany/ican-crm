# معالج إنشاء حملات ميتا — الدليل الكامل

> **تحديث التوثيق:** 2026-10-01 02:35 (Africa/Cairo) — إعادة بناء المعالج بالكامل (مسودات متعددة، استهداف جغرافي بأسلوب ميتا، مرحلة الإعلانات، التحقق الموجّه، النشر القابل للاستكمال).

**المسار:** `/campaigns/:platform/create` (ميتا فقط حاليًا) · **الصفحة:** `src/pages/campaigns/pages/CampaignCreatePage/` (تركيب فقط) · **الكود:** `src/features/campaigns/meta-wizard/` · **الواجهة العامة:** `features/campaigns/meta-wizard/index.js`

هذا الملف هو المرجع لكل ما يخص إنشاء الحملة: رحلة المستخدم، كل الاحتمالات التي يدعمها المعالج، شكل البيانات المرسلة، مصادر البيانات (تجريبية/حقيقية)، وطريقة التوسعة.

---

## 1. الفكرة في سطرين

المعالج يقود المستخدم خطوة بخطوة من «ماذا تريد أن تحقق؟» حتى النشر، ويشرح كل جزء أثناء العمل (لوحة الدليل الجانبية)، وينبّه إلى كل بيان ناقص في مكانه، ويحفظ كل شيء تلقائيًا كمسودة، ويسمح بالنشر الآمن الذي يمكن استكماله إذا فشلت خطوة دون إنشاء أي شيء مكرر.

## 2. شكل الشاشة

| الجزء | الوظيفة |
|---|---|
| **قائمة المسودات** (يمين/يسار حسب اللغة، قابلة للطي؛ في الموبايل زر «المسودات» يفتح درج جانبي) | كل المسودات المحفوظة لهذا الحساب الإعلاني: بحث، نسبة التقدم، آخر تعديل، حالة النشر، فتح/نسخ/حذف (مع تأكيد)، «حملة جديدة». مبنية بـ `SubSidebarFrame` + `SubSidebarHeader` من `shared/components/sub-sidebar` كما تشترط قواعد المشروع. |
| **الرأس** | اسم الحملة (أو الاسم المقترح)، الحساب الإعلاني، **عملة الحساب ومنطقته الزمنية**، حالة الحفظ، نسبة الاكتمال، زر حفظ (و`Ctrl/⌘ + S`). |
| **شريط الخطوات** | تنقّل حر بين الخطوات الخمس، مع علامة لكل خطوة: ✓ مكتملة، عدد الأخطاء، ⚠ تحذيرات. |
| **مقدمة الخطوة** | ماذا تقرر هذه الخطوة، وما الذي يجب تجهيزه قبلها. |
| **محتوى الخطوة** | أقسام (بطاقات) بعنوان ووصف لكل جزء. |
| **لوحة الدليل** | (1) شرح الحقل الذي يقف عليه المستخدم، (2) قائمة «ما زال مطلوبًا» في هذه الخطوة — الضغط على أي عنصر ينقل للحقل ويضع المؤشر فيه، (3) نصائح الخطوة. |
| **الشريط السفلي** | السابق / متابعة / نشر، مع عدد العناصر المطلوبة. |

## 3. رحلة المستخدم (5 خطوات)

1. **الهدف** — قوالب بدء سريع (عملاء عبر نموذج فوري، رسائل واتساب، ماسنجر، مكالمات، عملاء على الموقع، زيارات، مبيعات، مشاهدات فيديو، إعجابات صفحة، وعي، تثبيت تطبيق) أو اختيار هدف ميتا مباشرة. اختيار القالب يضبط الهدف + مكان التحويل + هدف الأداء + زر الإعلان تلقائيًا.
2. **الحملة** — الاسم (مع اقتراح تلقائي)، صفحة فيسبوك، الفئة الإعلانية الخاصة (+ دولها)، استراتيجية الميزانية (Advantage على مستوى الحملة أو لكل مجموعة)، الميزانية والمزايدة، حد الإنفاق، الجدولة.
3. **المجموعات الإعلانية** — تبويب لكل مجموعة (إضافة/نسخ/حذف): الاسم، مكان التحويل وهدف الأداء وكل ما يتطلبانه، **المناطق الجغرافية**، الجمهور (Advantage+، العمر، النوع، اللغات، الاهتمامات، الاستبعاد، الجماهير المحفوظة) مع **حجم الجمهور التقديري**، المواضع، الميزانية/الجدولة وجدولة الساعات.
4. **الإعلانات** — لكل مجموعة إعلاناتها (إضافة/نسخ/حذف): الهوية، الشكل (صورة/فيديو/عرض دوّار/منشور موجود)، الوسائط من المكتبة أو من الجهاز، النص بعدة صيغ، الزر، والوجهة (رابط + UTM / نموذج فوري موجود أو جديد / رسالة ترحيب وأسئلة سريعة / رقم هاتف) مع **معاينة** خلاصة وقصة.
5. **المراجعة** — قائمة جاهزية بكل المشكلات (قابلة للضغط)، ملخص كامل بأزرار تعديل، **توجيه العملاء في الـ CRM** (الفريق، الحالة الأولى، الوسوم، ملاحظة)، اختيار «إنشاء موقوف» (موصى به) أو «بدء العرض»، وخطة النشر بالترتيب.

## 4. كل احتمالات الإنشاء

### 4.1 الأهداف × أماكن التحويل × أهداف الأداء

المصفوفة معرّفة في `config/metaAdSetCompatibility.js` وهي المصدر الوحيد: الخطوات، التحقق، وبناء البيانات كلها تقرأ منها. الجدول التالي مُولَّد منها مباشرة:

| الهدف | مكان التحويل | destination_type | أهداف الأداء (الافتراضي أولًا) | ما يطلبه المعالج | الأزرار المتاحة |
|---|---|---|---|---|---|
| الوعي `OUTCOME_AWARENESS` | تلقائي `default` | `—` | `REACH`، `IMPRESSIONS`، `AD_RECALL_LIFT`، `THRUPLAY`، `TWO_SECOND_CONTINUOUS_VIDEO_VIEWS` | حد التكرار | `NO_BUTTON` `LEARN_MORE` `CONTACT_US` `SHOP_NOW` |
| الزيارات `OUTCOME_TRAFFIC` | الموقع الإلكتروني `website` | `WEBSITE` | `LANDING_PAGE_VIEWS`، `LINK_CLICKS`، `IMPRESSIONS`، `REACH` | رابط الموقع (إعلان) | `LEARN_MORE` `SHOP_NOW` `SIGN_UP` `BOOK_TRAVEL` `CONTACT_US` `GET_OFFER` `GET_QUOTE` `SUBSCRIBE` `APPLY_NOW` `ORDER_NOW` `DOWNLOAD` `WATCH_MORE` |
| الزيارات `OUTCOME_TRAFFIC` | التطبيق `app` | `APP` | `LINK_CLICKS` | التطبيق + رابط المتجر | `INSTALL_MOBILE_APP` `USE_APP` `PLAY_GAME` `SHOP_NOW` `SIGN_UP` |
| الزيارات `OUTCOME_TRAFFIC` | ماسنجر `messenger` | `MESSENGER` | `LINK_CLICKS` | رسالة ترحيب (اختياري) | `MESSAGE_PAGE` |
| الزيارات `OUTCOME_TRAFFIC` | واتساب `whatsapp` | `WHATSAPP` | `LINK_CLICKS` | رقم واتساب، رسالة ترحيب (اختياري) | `WHATSAPP_MESSAGE` |
| الزيارات `OUTCOME_TRAFFIC` | الملف الشخصي على إنستجرام `instagram_profile` | `INSTAGRAM_PROFILE` | `VISIT_INSTAGRAM_PROFILE` | حساب إنستجرام | `VIEW_INSTAGRAM_PROFILE` |
| الزيارات `OUTCOME_TRAFFIC` | المكالمات `phone_call` | `PHONE_CALL` | `LINK_CLICKS` | رقم هاتف (إعلان) | `CALL_NOW` |
| التفاعل `OUTCOME_ENGAGEMENT` | ماسنجر `messenger` | `MESSENGER` | `CONVERSATIONS`، `LINK_CLICKS` | رسالة ترحيب (اختياري) | `MESSAGE_PAGE` |
| التفاعل `OUTCOME_ENGAGEMENT` | واتساب `whatsapp` | `WHATSAPP` | `CONVERSATIONS`، `LINK_CLICKS` | رقم واتساب، رسالة ترحيب (اختياري) | `WHATSAPP_MESSAGE` |
| التفاعل `OUTCOME_ENGAGEMENT` | رسائل إنستجرام `instagram_direct` | `INSTAGRAM_DIRECT` | `CONVERSATIONS`، `LINK_CLICKS` | حساب إنستجرام، رسالة ترحيب (اختياري) | `INSTAGRAM_MESSAGE` |
| التفاعل `OUTCOME_ENGAGEMENT` | تطبيقات المراسلة `messaging_apps` | `MESSAGING_MESSENGER_WHATSAPP` | `CONVERSATIONS` | رقم واتساب، رسالة ترحيب (اختياري) | `MESSAGE_PAGE` |
| التفاعل `OUTCOME_ENGAGEMENT` | على الإعلان نفسه `post` | `ON_POST` | `POST_ENGAGEMENT`، `IMPRESSIONS`، `REACH` | — | `NO_BUTTON` `LEARN_MORE` `MESSAGE_PAGE` |
| التفاعل `OUTCOME_ENGAGEMENT` | الفيديو `video` | `ON_VIDEO` | `THRUPLAY`، `TWO_SECOND_CONTINUOUS_VIDEO_VIEWS` | — | `NO_BUTTON` `LEARN_MORE` `WATCH_MORE` |
| التفاعل `OUTCOME_ENGAGEMENT` | صفحة فيسبوك `page` | `ON_PAGE` | `PAGE_LIKES` | — | `LIKE_PAGE` |
| التفاعل `OUTCOME_ENGAGEMENT` | مناسبة `event` | `ON_EVENT` | `EVENT_RESPONSES` | معرّف المناسبة | `EVENT_RSVP` |
| التفاعل `OUTCOME_ENGAGEMENT` | المكالمات `phone_call` | `PHONE_CALL` | `QUALITY_CALL` | رقم هاتف (إعلان) | `CALL_NOW` |
| التفاعل `OUTCOME_ENGAGEMENT` | الموقع الإلكتروني `website` | `WEBSITE` | `OFFSITE_CONVERSIONS`، `LANDING_PAGE_VIEWS`، `LINK_CLICKS` | Pixel + حدث، رابط الموقع (إعلان) | `LEARN_MORE` `SHOP_NOW` `SIGN_UP` `BOOK_TRAVEL` `CONTACT_US` `GET_OFFER` `GET_QUOTE` `SUBSCRIBE` `APPLY_NOW` `ORDER_NOW` `DOWNLOAD` `WATCH_MORE` |
| التفاعل `OUTCOME_ENGAGEMENT` | التطبيق `app` | `APP` | `OFFSITE_CONVERSIONS`، `LINK_CLICKS` | التطبيق + رابط المتجر، حدث التطبيق | `INSTALL_MOBILE_APP` `USE_APP` `PLAY_GAME` `SHOP_NOW` `SIGN_UP` |
| العملاء المحتملون `OUTCOME_LEADS` | نموذج فوري `instant_form` | `ON_AD` | `LEAD_GENERATION`، `QUALITY_LEAD` | نموذج فوري (إعلان) | `SIGN_UP` `LEARN_MORE` `APPLY_NOW` `GET_QUOTE` `BOOK_TRAVEL` `SUBSCRIBE` `GET_OFFER` `DOWNLOAD` |
| العملاء المحتملون `OUTCOME_LEADS` | ماسنجر `messenger` | `MESSENGER` | `LEAD_GENERATION`، `CONVERSATIONS` | رسالة ترحيب (اختياري) | `MESSAGE_PAGE` |
| العملاء المحتملون `OUTCOME_LEADS` | رسائل إنستجرام `instagram_direct` | `INSTAGRAM_DIRECT` | `LEAD_GENERATION`، `CONVERSATIONS` | حساب إنستجرام، رسالة ترحيب (اختياري) | `INSTAGRAM_MESSAGE` |
| العملاء المحتملون `OUTCOME_LEADS` | واتساب `whatsapp` | `WHATSAPP` | `CONVERSATIONS` | رقم واتساب، رسالة ترحيب (اختياري) | `WHATSAPP_MESSAGE` |
| العملاء المحتملون `OUTCOME_LEADS` | المكالمات `phone_call` | `PHONE_CALL` | `QUALITY_CALL` | رقم هاتف (إعلان) | `CALL_NOW` |
| العملاء المحتملون `OUTCOME_LEADS` | الموقع الإلكتروني `website` | `WEBSITE` | `OFFSITE_CONVERSIONS`، `LANDING_PAGE_VIEWS`، `LINK_CLICKS`، `IMPRESSIONS`، `REACH` | Pixel + حدث، رابط الموقع (إعلان) | `LEARN_MORE` `SHOP_NOW` `SIGN_UP` `BOOK_TRAVEL` `CONTACT_US` `GET_OFFER` `GET_QUOTE` `SUBSCRIBE` `APPLY_NOW` `ORDER_NOW` `DOWNLOAD` `WATCH_MORE` |
| العملاء المحتملون `OUTCOME_LEADS` | التطبيق `app` | `APP` | `OFFSITE_CONVERSIONS`، `LINK_CLICKS` | التطبيق + رابط المتجر، حدث التطبيق | `INSTALL_MOBILE_APP` `USE_APP` `PLAY_GAME` `SHOP_NOW` `SIGN_UP` |
| المبيعات `OUTCOME_SALES` | الموقع الإلكتروني `website` | `WEBSITE` | `OFFSITE_CONVERSIONS`، `VALUE`، `LANDING_PAGE_VIEWS`، `LINK_CLICKS`، `IMPRESSIONS`، `REACH` | Pixel + حدث، رابط الموقع (إعلان)، مزايدة بالقيمة | `LEARN_MORE` `SHOP_NOW` `SIGN_UP` `BOOK_TRAVEL` `CONTACT_US` `GET_OFFER` `GET_QUOTE` `SUBSCRIBE` `APPLY_NOW` `ORDER_NOW` `DOWNLOAD` `WATCH_MORE` |
| المبيعات `OUTCOME_SALES` | التطبيق `app` | `APP` | `OFFSITE_CONVERSIONS`، `VALUE`، `LINK_CLICKS` | التطبيق + رابط المتجر، حدث التطبيق، مزايدة بالقيمة | `INSTALL_MOBILE_APP` `USE_APP` `PLAY_GAME` `SHOP_NOW` `SIGN_UP` |
| المبيعات `OUTCOME_SALES` | الموقع والتطبيق `website_and_app` | `WEBSITE` | `OFFSITE_CONVERSIONS` | التطبيق + رابط المتجر، Pixel + حدث، رابط الموقع (إعلان) | `SHOP_NOW` `LEARN_MORE` `ORDER_NOW` `SIGN_UP` |
| المبيعات `OUTCOME_SALES` | ماسنجر `messenger` | `MESSENGER` | `CONVERSATIONS`، `OFFSITE_CONVERSIONS` | رسالة ترحيب (اختياري)، Pixel + حدث | `MESSAGE_PAGE` |
| المبيعات `OUTCOME_SALES` | واتساب `whatsapp` | `WHATSAPP` | `CONVERSATIONS`، `OFFSITE_CONVERSIONS` | رقم واتساب، رسالة ترحيب (اختياري)، Pixel + حدث | `WHATSAPP_MESSAGE` |
| المبيعات `OUTCOME_SALES` | تطبيقات المراسلة `messaging_apps` | `MESSAGING_MESSENGER_WHATSAPP` | `CONVERSATIONS` | رقم واتساب، رسالة ترحيب (اختياري) | `MESSAGE_PAGE` |
| المبيعات `OUTCOME_SALES` | المكالمات `phone_call` | `PHONE_CALL` | `QUALITY_CALL` | رقم هاتف (إعلان) | `CALL_NOW` |
| الترويج للتطبيق `OUTCOME_APP_PROMOTION` | التطبيق `app` | `APP` | `APP_INSTALLS`، `OFFSITE_CONVERSIONS`، `VALUE`، `LINK_CLICKS` | التطبيق + رابط المتجر، حدث التطبيق، مزايدة بالقيمة | `INSTALL_MOBILE_APP` `USE_APP` `PLAY_GAME` `SHOP_NOW` `SIGN_UP` |


> ملاحظات: حد التكرار يُطلب فقط مع هدف `REACH`. الـ Pixel يُطلب فقط عند التحسين لـ `OFFSITE_CONVERSIONS` أو `VALUE`. في هدف الوعي يُختار مكان التحويل تلقائيًا ولا يُعرض على المستخدم.

### 4.2 الميزانية والجدولة

| الاختيار | القيم | قواعد يطبقها المعالج |
|---|---|---|
| مستوى الميزانية | الحملة (Advantage) / كل مجموعة | مع ميزانية الحملة تستخدم المجموعات جدول الحملة؛ مع ميزانية المجموعة لكل مجموعة ميزانيتها ويمكنها الاستقلال بجدولها. |
| النوع | يومية / إجمالية | الإجمالية **تفرض** تاريخ نهاية (يُفتح الحقل تلقائيًا). تحذير إذا كانت المدة أقل من 24 ساعة. |
| المزايدة | أعلى حجم · هدف تكلفة النتيجة · حد أقصى للمزايدة · (مع `VALUE`: أعلى قيمة · حد أدنى للعائد ROAS) | مبلغ المزايدة/الـ ROAS إلزامي عند اختيار الاستراتيجية التي تحتاجه، ويُمسح تلقائيًا عند الرجوع لـ «أعلى حجم». |
| حد الإنفاق | اختياري | تحذير إذا كان أقل من الميزانية. |
| البداية/النهاية | الآن / تاريخ — مستمرة / تاريخ | تُدخل بتوقيت **الحساب الإعلاني** وتُرسل بصيغة ISO مع الإزاحة (مثال `2026-10-05T10:00:00+03:00`). رفض البداية في الماضي والنهاية قبل البداية. |
| جدولة الساعات (dayparting) | أيام + من/إلى | متاحة مع الميزانية الإجمالية فقط، وتُرسل `pacing_type: ['day_parting']` و`adset_schedule`. |
| العملة | عملة الحساب الإعلاني | تحويل المبلغ لأصغر وحدة حسب العملة (×100 لمعظم العملات، ×1 للعملات بلا كسور)، وتلميح بالحد الأدنى المقترح لليومية. |

### 4.3 الفئات الإعلانية الخاصة

`HOUSING`، `EMPLOYMENT`، `FINANCIAL_PRODUCTS_SERVICES` (بديل `CREDIT` القديم، والمسودات القديمة تُرحَّل تلقائيًا)، `ISSUES_ELECTIONS_POLITICS`.
- دول الفئة (`special_ad_category_country`) إلزامية.
- مع الثلاث الأولى: العمر يُثبَّت 18–65+، النوع «الكل»، Advantage+ audience متوقف، الاستبعاد التفصيلي والجماهير المشابهة والرموز البريدية ممنوعة، وأقل نطاق حول المدن/الدبابيس 25 كم.
- مع السياسة: تحذير بضرورة حساب معتمد وإفصاح «مدفوع بواسطة».

### 4.4 الاستهداف الجغرافي (بأسلوب ميتا)

- **من يُستهدف:** المقيمون أو الموجودون مؤخرًا (افتراضي) · المقيمون · الموجودون مؤخرًا · المسافرون ← `location_types`.
- **تضمين / استبعاد** قبل البحث، أو من زري +/− بجانب كل نتيجة، أو بتحويل أي منطقة مضافة.
- **البحث** (typeahead بالأسهم وEnter) في الدول والمحافظات والمدن والأحياء، ويفهم العربية بدون همزات/تاء مربوطة/«ال»/«محافظة»، والأسماء الإنجليزية والأسماء الدارجة (التجمع، أكتوبر، الساحل…).
- **نطاق** حول المدن (17–80 كم) والدبابيس (1–80 كم) بشريط تمرير.
- **إسقاط دبوس:** إحداثيات أو لصق رابط خرائط جوجل، مع اسم ونطاق.
- **إضافة مجمّعة:** لصق قائمة (سطر أو فاصلة لكل منطقة) ومعاينة ما وُجد وما لم يُوجد قبل الإضافة.
- **فتح على الخريطة** لأي مدينة/دبوس.
- **تنبيهات:** لا توجد منطقة مضمّنة (خطأ)، مكان مُضمَّن ومستبعد معًا (خطأ)، استبعاد خارج أي منطقة مضمّنة (تحذير لأنه بلا تأثير)، منطقة مشمولة بمنطقة أوسع (تحذير)، نطاق خارج الحدود (خطأ).
- **ما يُرسل:** `targeting.geo_locations` (`countries`, `regions`, `cities` مع `radius`/`distance_unit`, `neighborhoods`, `custom_locations`, `location_types`) و`targeting.excluded_geo_locations`، بالإضافة إلى الحقل القديم `countries` للتوافق.

### 4.5 الإعلانات

| الجزء | الاحتمالات |
|---|---|
| الشكل | صورة واحدة · فيديو واحد · عرض دوّار (2–10 بطاقات، ترتيب، رابط لكل بطاقة) · منشور موجود. أهداف الفيديو (`THRUPLAY`…) تقصر الاختيار على الفيديو/المنشور. |
| النص | حتى 5 صيغ للنص الأساسي و5 للعنوان + وصف، مع عداد وتنبيه عند تجاوز الطول الموصى به (125 / 40). |
| الزر | قائمة الأزرار المسموحة **لكل وجهة** فقط (`config/metaCallToActions.js`)، ويُصحَّح تلقائيًا عند تغيير الوجهة. |
| الموقع | رابط + رابط معروض + معاملات URL مع زر «إضافة UTM». |
| النموذج الفوري | اختيار نموذج نشط من الصفحة، أو إنشاء نموذج: النوع (عدد أكبر/نية أعلى)، المقدمة، أسئلة جاهزة، أسئلة مخصصة (قصيرة/اختيار من متعدد)، سياسة الخصوصية (إلزامية)، شاشة الإتمام وزرها. |
| المحادثات | رسالة ترحيب + حتى 4 أسئلة سريعة، مع معاينة المحادثة. |
| المكالمات | رقم هاتف دولي (الأرقام المحلية المصرية `01…` تُحوَّل تلقائيًا إلى `+20…`). |
| المعاينة | خلاصة وقصة (تقريبية). |

## 5. المسودات

- حفظ تلقائي بعد 0.9 ثانية من آخر تعديل **حقيقي** فقط؛ فتح الصفحة والخروج لا ينشئ مسودة فارغة. حفظ فوري عند إغلاق التبويب أو التنقل بين المسودات.
- المسودة المفتوحة في الرابط `?draft=<id>` (تبقى بعد إعادة التحميل ويمكن مشاركتها على نفس المتصفح).
- التخزين: `localStorage` بمفتاح `ican-campaign-wizard-drafts:v2:<tenant>:<platform>:<account>` — معزول لكل مستأجر وحساب إعلاني، بحد أقصى 30 مسودة (تُحذف الأقدم).
- **ترحيل** المسودة الوحيدة من النسخة السابقة (`ican-campaign-wizard-draft:…`) تلقائيًا أول مرة، وتحويل حقول قديمة (الدول كنصوص → مناطق، `CREDIT` → `FINANCIAL_PRODUCTS_SERVICES`).
- لنقل المسودات للسيرفر لاحقًا: استبدل دوال `state/wizardDraftsStore.js` (`listDrafts`, `loadDraft`, `saveDraft`, `deleteDraft`, `duplicateDraft`) باستدعاءات API؛ لا شيء آخر يتغير.
- الوسائط المرفوعة من الجهاز تُحفظ كرابط محلي مؤقت ولن تظهر بعد إعادة التحميل إلى أن تُفعَّل واجهة رفع الوسائط.

## 6. التحقق والتوجيه

`domain/validateWizard.js` يفحص الحالة كاملة في كل تغيير ويُرجع قائمة مشكلات، لكل منها: `code` (ترجمته في `campaignWizard.issues.<code>`)، `severity` (`error` يمنع النشر، `warning` يُعرض ولا يمنع، `info` نصيحة)، `stage`، و`path` للحقل.
- الخطأ يظهر تحت الحقل بعد مغادرته أو عند محاولة «متابعة/نشر» — وليس أثناء الكتابة في نموذج فارغ.
- «متابعة» مع أخطاء في الخطوة: رسالة + الانتقال لأول خطأ. التنقل الحر بين الخطوات متاح دائمًا.
- أخطاء الإعلانات تكون **تحذيرات** طالما واجهة إنشاء الإعلانات غير مفعّلة، وتصبح أخطاء تلقائيًا عند تفعيلها.

## 7. النشر

الترتيب: الحملة ← كل مجموعة ← (نموذج فوري جديد) ← كل إعلان — `publish/publishPlan.js`.
- كل خطوة ناجحة تحفظ المعرّف القادم من ميتا داخل المسودة فورًا؛ عند الفشل يظهر السبب (رسائل التحقق من الخادم بالتفصيل) وزر «استكمال النشر» الذي **يتخطى ما أُنشئ** — لا حملات مكررة.
- كل طلب يحمل `client_request_id` ثابت (`draftId`، `draftId:adSetId`، `draftId:adSetId:adId`) ليستطيع الخادم منع التكرار أيضًا (idempotency).
- الحالة الافتراضية **`PAUSED`**، والمستخدم يختار `ACTIVE` صراحةً في المراجعة.
- طالما `createAds = false`: تُنشر الحملة والمجموعات، وتبقى الإعلانات في المسودة بحالة «بانتظار الربط» (الحالة `partial`)، ويمكن استكمالها لاحقًا من نفس المسودة.
- بعد النشر تظهر في المسودة لافتة «تم نشر هذه المسودة» وزر «نسخ كحملة جديدة».

## 8. مصادر البيانات: تجريبية الآن، حقيقية لاحقًا

كل البيانات تمر عبر `data/metaAssetsSource.js` الذي يُرجع دائمًا `{ items, isMock }`؛ الواجهة تعرض شارة **«بيانات تجريبية»** عند `isMock` فقط. للتحويل إلى البيانات الحقيقية غيّر القيمة في `config/wizardCapabilities.js` إلى `'live'` — دون أي تعديل في المكونات.

| المصدر (`WIZARD_DATA_SOURCES`) | الحالي | الطلب المنتظر من الخادم | الاستجابة المتوقعة (يُحوَّل في `metaAssetsSource`) |
|---|---|---|---|
| `geoLocations` | mock (دول عربية وأوروبية، 27 محافظة، ~45 مدينة وأحياء مصرية، مدن الخليج) | `GET /api/tenant/facebook/targeting/search?type=adgeolocation&q=&ad_account_id=` | `data: [{ key, name, type, country_code, country_name, region, region_id, supports_city, latitude, longitude }]` (نفس Targeting Search في ميتا) |
| `interests` | mock | `GET …/targeting/search?type=adinterest&q=` | `data: [{ id, name, type, path, audience_size_upper_bound }]` |
| `languages` | mock | `GET …/targeting/locales` | `data: [{ key, name }]` |
| `customAudiences` | mock | `GET …/audiences?ad_account_id=` | `data: [{ id, name, subtype, approximate_count_upper_bound }]` |
| `reachEstimate` | تقدير محلي | `POST …/targeting/reach-estimate` `{ ad_account_id, targeting, optimization_goal }` | `{ users_lower_bound, users_upper_bound }` |
| `leadForms` | mock | `GET …/lead-forms?page_id=` | `data: [{ id, name, status, is_optimized_for_quality, questions: [{type}], leads_count, created_time }]` |
| `mediaLibrary` | mock (تدرجات لونية بدل صور) | `GET …/media?ad_account_id=` | `data: [{ hash|id, type, name, width, height, url|thumbnail_url, length }]` |
| `pixels` | mock | `GET …/pixels?ad_account_id=` | `data: [{ id, name, last_fired_time }]` |
| `apps` | mock | `GET …/apps?ad_account_id=` | `data: [{ id, name, object_store_urls }]` |
| `instagramAccounts` | من تكامل الصفحات (`instagram_business_account`) أو mock | — | — |
| `whatsappNumbers` | من التكامل (`integrations.whatsapp`) أو mock | — | — |
| `pagePosts` | live (`GET …/campaigns/pages/{pageId}/posts`) مع رجوع لـ mock عند الفشل | موجود | — |

قدرات النشر (`WIZARD_PUBLISH_CAPABILITIES`):

| القدرة | الحالي | الطلب |
|---|---|---|
| `createCampaign` | ✅ | `POST /api/tenant/facebook/campaigns/create` (موجود) |
| `createAdSets` | ✅ | `POST /api/tenant/facebook/adset/create` (موجود) |
| `createAds` | ❌ | `POST /api/tenant/facebook/ad/create` — يستقبل `buildAdPayload` ويرجّع `{ id }` |
| `createLeadForms` | ❌ | `POST /api/tenant/facebook/lead-forms/create` — يستقبل `buildLeadFormPayload` ويرجّع `{ id }` |
| `uploadMedia` | ❌ | `POST /api/tenant/facebook/media/upload` (multipart) — يرجّع `{ hash }` للصور أو `{ video_id }` |

## 9. عقد البيانات المرسلة للخادم

المفاتيح التي يقبلها الخادم اليوم **لم تتغير** (`campaign_name`, `page_id`, `objective`, `budget_type`, `budget_amount`, `stop_time`, `bid_strategy`, `bid_amount`, `special_ad_categories`, `adset_name`, `conversion_location`, `optimization_goal`, `countries`, `age_min`, `age_max`, `pixel_id`, `custom_event_type`, `whatsapp_phone_number`, `application_id`, `object_store_url`, `frequency_max`, `frequency_interval_days`, `daily_budget`, `lifetime_budget`, `start_time`, `end_time`). أُضيفت بجانبها مفاتيح ميتا الكاملة ليستخدمها الخادم متى شاء:

- **الحملة:** `client_request_id`, `status`, `buying_type`, `special_ad_category_country`, `budget_level`, `daily_budget`/`lifetime_budget`, `bid_constraints` (ROAS)، `start_time`, `spend_cap`, `crm_lead_routing: { team_id, tag_ids, status_id, note }`.
- **المجموعة:** `client_request_id`, `status`, `destination_type`, `billing_event`, `promoted_object`, `targeting` (كامل: الجغرافيا، العمر، النوع، اللغات، `flexible_spec`، `exclusions`، الجماهير، المواضع، `targeting_automation`)، `instagram_actor_id`, `frequency_control_specs`, `pacing_type`, `adset_schedule`.
- **الإعلان:** `client_request_id`, `adset_id`, `name`, `status`, `creative: { page_id, instagram_actor_id, format, existing_post_id, primary_texts[], headlines[], description, media, carousel_cards[], call_to_action: { type, link, lead_gen_form_id, phone_number, whatsapp_number }, display_link, url_tags, page_welcome_message }` — عقد CRM مبسّط، ويحوّله الخادم إلى `object_story_spec`/`asset_feed_spec`.

> الأوقات بصيغة ISO مع إزاحة المنطقة الزمنية للحساب، والمبالغ بأصغر وحدة للعملة.

## 10. هيكل الملفات

```
src/pages/campaigns/pages/CampaignCreatePage/
  CampaignCreatePage.jsx      ← تركيب فقط: فحوص الاتصال والحساب ثم <MetaCampaignWizard />
  README_AR.md                ← هذا الملف
src/features/campaigns/meta-wizard/
  MetaCampaignWizard.jsx      ← الغلاف: التخطيط، التنقل، التحقق، النشر
  index.js                    ← الواجهة العامة
  README.md                   ← ملخص قصير (قاعدة المشروع)
  config/                     ← الأهداف، مصفوفة التحويل، الأزرار، المواضع، الفئات الخاصة، الأحداث، القوالب، مصادر البيانات
  domain/                     ← منطق خالص + اختبارات: الجغرافيا، التحقق، بناء البيانات، التسمية، الوقت، الهاتف/الروابط، تقدير الوصول
  state/                      ← الحالة الأولية، الـ reducer، مخزن المسودات + اختبارات
  data/                       ← الربط مع الخادم (metaWizardApi) والمحوّل (metaAssetsSource) والبيانات التجريبية (mock/)
  publish/                    ← خطة النشر القابلة للاستكمال
  hooks/                      ← useCampaignWizard (مسودات + حفظ)، useWizardAssets (React Query)، usePublishCampaign
  context/                    ← MetaWizardContext + useWizardField (ربط الحقل بالدليل والتحقق)
  components/                 ← fields · layout · geo · audience · budget · ads · review · publish
  steps/                      ← الخطوات الخمس
src/locales/{ar,en}/campaignWizard.js  ← كل نصوص المعالج
```

## 11. كيف أضيف…؟

- **وجهة أو هدف أداء جديد:** أضفه في `MATRIX` و`CONVERSION_LOCATIONS` (`config/metaAdSetCompatibility.js`)، ومتطلباته في `getAdSetRequirements`، وأزراره في `metaCallToActions.js`، وترجمته في `locations`/`goals`/`ctas`. اختبار `i18nCoverage.test.js` يفشل إذا نسيت ترجمة.
- **قالب بدء سريع:** سطر في `config/campaignPresets.js` + `presets.<id>` في الترجمة. اختبار في `metaConfig.test.js` يتأكد أن القالب تركيبة صحيحة.
- **قاعدة تحقق:** أضفها في `validateWizard.js` بـ `code` جديد و`path` الحقل، ثم ترجمة `issues.<code>`.
- **شرح حقل في الدليل:** مرّر `guideKey` للحقل وأضف `guide.fields.<guideKey>.title/body`.
- **ربط بيانات حقيقية:** نفّذ الطلب في الخادم، ثم غيّر مصدره إلى `'live'` في `config/wizardCapabilities.js` (والتحويل موجود في `metaAssetsSource.js`).

## 12. الاختبارات

`npx vitest run src/features/campaigns/meta-wizard` — 56 اختبارًا: مصفوفة ميتا والقوالب والعملات، البحث الجغرافي بالعربية والإنجليزية والإضافة المجمعة والإحداثيات وتحليل التضمين/الاستبعاد وبناء `geo_locations`، الـ reducer، مخزن المسودات والترحيل، قواعد التحقق، بناء البيانات بالمنطقة الزمنية، خطة النشر (الإعلانات المعلقة، الاستكمال بعد الفشل دون تكرار، إنشاء النموذج قبل الإعلان)، وتغطية الترجمة لكل مفتاح يطلبه المعالج.

## 13. ما تم إصلاحه مقارنة بالنسخة السابقة

| المشكلة القديمة | الآن |
|---|---|
| إعادة الضغط بعد فشل مجموعة تنشئ حملة مكررة | نشر قابل للاستكمال + `client_request_id` |
| لا حالة `PAUSED` صريحة | موقوف افتراضيًا واختيار صريح للتفعيل |
| وقت بداية الحملة لا يُرسل | يُرسل للحملة وتورثه المجموعات |
| الميزانية الإجمالية مع «بلا نهاية» تُخفي الحقل المطلوب، وتاريخ نهاية قديم يُرسل | الإجمالية تفتح تاريخ النهاية تلقائيًا، و«مستمرة» تمسحه |
| التواريخ بدون منطقة زمنية | ISO مع إزاحة منطقة الحساب |
| مبلغ المزايدة يُحذف بصمت | إلزامي مع استراتيجيته |
| تغيير الهدف يترك وجهة غير متوافقة | تُصحَّح تلقائيًا |
| «الوعي» يطلب اختيار «افتراضي» يدويًا | تلقائي ومخفي |
| نافذة «استكمال مسودة» لمسودة فارغة | حفظ بعد أول تعديل حقيقي فقط + قائمة مسودات |
| الدول كنص حر، والعمر `0` عند المسح | بحث مناطق احترافي + قوائم عمر |
| لا قيود للفئات الخاصة | تُطبق كلها |
| ضرب ×100 لكل العملات، ولا عرض للعملة | حسب العملة + عرضها |
| أخطاء كرسائل عابرة فقط | تحت الحقل + في الدليل + في الخطوات + في المراجعة |
| خطوة الإعلانات فارغة ولا اختيار لنموذج | مرحلة إعلانات كاملة جاهزة للربط |
| مجموعة واحدة فقط | عدد غير محدود مع نسخ/حذف |
| لا ربط بالـ CRM | توجيه العملاء لفريق/حالة/وسوم |

## 14. فجوات معروفة

- إنشاء الإعلانات والنماذج ورفع الوسائط ينتظر واجهات الخادم (الجدول في القسم 8).
- البيانات التجريبية للمناطق مفاتيحها ليست مفاتيح ميتا الحقيقية؛ لا تُنشر حملة حقيقية بمدن/محافظات قبل تفعيل `geoLocations: 'live'` (الدول تعمل لأنها رموز ISO حقيقية).
- المسودات محلية في المتصفح (لا تنتقل بين الأجهزة أو المستخدمين).
- المعاينة تقريبية، ولا يوجد اختبار A/B أو Reach & Frequency أو كتالوج منتجات (Advantage+ catalog).
- مصفوفة ميتا تتغير مع إصدارات Graph API؛ راجع `config/` عند ترقية الإصدار في الخادم.
- لم يُختبر المعالج بصريًا على بيئة متصلة بخادم حقيقي (لا يوجد تسجيل دخول في بيئة التطوير هذه).
