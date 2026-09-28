# طلبات إنشاء الحملة والـ AdSet لكل نوع

## حالة الربط في الواجهة

الدوال التالية معرفة في `facebook-campaign/api/facebookCampaignApi.js`:

| العملية | Method | Endpoint |
|---|---|---|
| عرض الحملات | GET | `/api/tenant/facebook/campaigns/get` |
| مزامنة الحملات | GET | `/api/tenant/facebook/campaigns/sync` |
| إنشاء حملة | POST | `/api/tenant/facebook/campaigns/create` |
| مجموعات حملة | GET | `/api/tenant/campaigns/{campaign}/adsets` |
| إنشاء Ad Set | POST | `/api/tenant/facebook/adset/create` |
| عرض Ad Sets | GET | `/api/tenant/facebook/adset/get` |
| مزامنة Ad Sets | GET | `/api/tenant/facebook/adset/sync` |
| إعلانات Ad Set | GET | `/api/tenant/facebook/campaigns/adsets/{adSet}/ads` |
| إحصاءات إعلان | GET | `/api/tenant/facebook/campaigns/ads/{ad}/insights` |
| منشورات الصفحة | GET | `/api/tenant/facebook/campaigns/pages/{page}/posts` |
| تفاعل المنشور | GET | `/api/tenant/facebook/campaigns/posts/{post}/engagement` |
| تعليقات المنشور | GET | `/api/tenant/facebook/campaigns/posts/{post}/comments` |

إنشاء وإلغاء دعوات Sub Login يستخدمان `VITE_MAIN_SERVER_URL` طبقًا لمجموعة Postman، بينما عرض الدعوات يتم من سيرفر المستأجر.

## الاستخدام داخل CampaignCreatePage

عند النشر تنفذ الصفحة العمليات بالترتيب:

1. إرسال طلب إنشاء الحملة.
2. استخراج `campaign_id` أو `id` من الاستجابة.
3. إنشاء كل Ad Set مكتمل وربطه بمعرّف الحملة.
4. لا يتم إنشاء Ads لأن مجموعة Postman الحالية لا تحتوي endpoint لإنشاء الإعلان.

الحقول الفارغة لا ترسل إلى API. ميزانية الحملة ترسل في طلب Campaign عندما يكون `budgetLevel = campaign`، بينما ميزانية كل مجموعة ترسل في طلب Ad Set عندما يكون `budgetLevel = adSet`.

يدخل المستخدم الميزانية بعملة الحساب الإعلاني، ثم يحولها الـ Wizard إلى أصغر وحدة للعملة قبل الإرسال إلى Meta. مثال: `50 EGP` ترسل `5000`، و`50.25 EGP` ترسل `5025`. ينطبق ذلك على `budget_amount` و`daily_budget` و`lifetime_budget` و`bid_amount`.

## قواعد عامة

-   **الحملة:** بتبعت `objective`، وبعدها الـ AdSet بيعرف كل حاجة منه.
-   **الـ AdSet:** بتبعت `conversion_location` (مكان التحويل) بدل
    `destination_type` و`optimization_goal`. الـ `optimization_goal`
    اختياري وبياخد الـ default.
-   الـ Wizard يرشح `conversion_location` حسب `objective`، ثم يرشح
    `optimization_goal` حسب الاثنين معًا. تغيير مكان التحويل يمسح هدف
    التحسين القديم ويختار أول قيمة متوافقة، ويمنع النشر إذا كانت مسودة
    قديمة تحتوي تركيبة غير متوافقة.
-   لو الحملة **CBO** (فيها `budget_amount`): متبعتش `daily_budget` ولا
    `bid_strategy` في الـ AdSet.
-   لو الحملة من غير ميزانية: لازم `daily_budget` أو (`end_time` +
    `lifetime_budget`) في الـ AdSet.
-   `bid_amount`: بس لو الحملة (أو الـ AdSet) استخدمت Cap. بأصغر وحدة
    للعملة (50 جنيه = 5000). حملاتك الجديدة هتبقى بدون Cap تلقائيًا فمش
    هتحتاجه.
-   جرّب الأول بـ `"validate_only": true`: بيتحقق من الطلب عند فيسبوك من
    غير ما ينشئ حاجة.
-   **الـ targeting:** لو مبعتش دول/محافظات/مدن، الافتراضي مصر (`EG`).
    لو بعت `cities` أو `regions` مبعتش `countries` معاهم.

------------------------------------------------------------------------

## قواعد الـ Request بتاع الحملة

ضيفها في Request الحملة عندك:

### 1) OUTCOME_LEADS (ليدز)

#### الحملة

``` php
'objective' => ['required', 'string', 'in:OUTCOME_AWARENESS,OUTCOME_TRAFFIC,OUTCOME_ENGAGEMENT,OUTCOME_LEADS,OUTCOME_SALES,OUTCOME_APP_PROMOTION'],
'budget_type' => ['nullable', 'in:daily,lifetime'],
'budget_amount' => ['nullable', 'numeric', 'min:1', 'required_with:budget_type'],
'stop_time' => ['nullable', 'date', 'required_if:budget_type,lifetime'],
'bid_strategy' => ['nullable', 'in:LOWEST_COST_WITHOUT_CAP,LOWEST_COST_WITH_BID_CAP,COST_CAP'],
'special_ad_categories' => ['nullable', 'array'],
```

#### مثال Request للحملة

``` json
{
  "ad_account_id": "act_968599310891700",
  "page_id": "1143370238851368",
  "campaign_name": "حملة ليدز",
  "objective": "OUTCOME_LEADS",
  "budget_type": "daily",
  "budget_amount": 50000
}
```

#### AdSet: فورم جوه فيسبوك

`conversion_location: instant_form`

``` json
{
  "ad_account_id": "act_968599310891700",
  "campaign_id": "CAMPAIGN_ID",
  "page_id": "1143370238851368",
  "adset_name": "ليدز - فورم",
  "conversion_location": "instant_form",
  "age_min": 18,
  "age_max": 45,
  "countries": ["EG"]
}
```

#### AdSet: ليدز من ماسنجر

`conversion_location: messenger`

الـ destination الصح هنا `LEAD_FROM_MESSENGER` مش `MESSENGER`.

``` json
{
  "ad_account_id": "act_968599310891700",
  "campaign_id": "CAMPAIGN_ID",
  "page_id": "1143370238851368",
  "adset_name": "ليدز - ماسنجر",
  "conversion_location": "messenger",
  "countries": ["EG"]
}
```

باقي الـ locations: `instagram_direct`، `phone_call`، `website` (بيحتاج
`pixel_id` و`custom_event_type`).

------------------------------------------------------------------------

### 2) OUTCOME_ENGAGEMENT (تفاعل / رسائل)

#### الحملة

نفس شكل الحملة فوق مع:

``` json
"objective": "OUTCOME_ENGAGEMENT"
```

#### AdSet: رسائل ماسنجر

``` json
{
  "ad_account_id": "act_968599310891700",
  "campaign_id": "CAMPAIGN_ID",
  "page_id": "1143370238851368",
  "adset_name": "تفاعل - رسائل ماسنجر",
  "conversion_location": "messenger",
  "countries": ["EG"]
}
```

#### AdSet: رسائل واتساب

``` json
{
  "ad_account_id": "act_968599310891700",
  "campaign_id": "CAMPAIGN_ID",
  "page_id": "1143370238851368",
  "adset_name": "تفاعل - واتساب",
  "conversion_location": "whatsapp",
  "whatsapp_phone_number": "201000000000",
  "countries": ["EG"]
}
```

#### AdSet: تفاعل على بوست

``` json
{
  "ad_account_id": "act_968599310891700",
  "campaign_id": "CAMPAIGN_ID",
  "page_id": "1143370238851368",
  "adset_name": "تفاعل بوست",
  "conversion_location": "post",
  "countries": ["EG"]
}
```

باقي الـ locations: `instagram_direct`، `page` (لايكات)، `video`
(مشاهدات)، `event`.

------------------------------------------------------------------------

### 3) OUTCOME_TRAFFIC (ترافيك)

#### الحملة

``` json
"objective": "OUTCOME_TRAFFIC"
```

#### AdSet: زيارات الموقع

``` json
{
  "ad_account_id": "act_968599310891700",
  "campaign_id": "CAMPAIGN_ID",
  "page_id": "1143370238851368",
  "adset_name": "ترافيك - موقع",
  "conversion_location": "website",
  "optimization_goal": "LANDING_PAGE_VIEWS",
  "countries": ["EG"]
}
```

باقي الـ locations: `messenger`، `whatsapp` (بيحتاج
`whatsapp_phone_number`).

------------------------------------------------------------------------

### 4) OUTCOME_SALES (مبيعات)

#### الحملة

``` json
"objective": "OUTCOME_SALES"
```

#### AdSet: مبيعات على الموقع (بيحتاج Pixel)

``` json
{
  "ad_account_id": "act_968599310891700",
  "campaign_id": "CAMPAIGN_ID",
  "page_id": "1143370238851368",
  "adset_name": "مبيعات - موقع",
  "conversion_location": "website",
  "optimization_goal": "OFFSITE_CONVERSIONS",
  "pixel_id": "PIXEL_ID_الحقيقي",
  "custom_event_type": "PURCHASE",
  "countries": ["EG"]
}
```

#### AdSet: مبيعات عن طريق ماسنجر

``` json
{
  "ad_account_id": "act_968599310891700",
  "campaign_id": "CAMPAIGN_ID",
  "page_id": "1143370238851368",
  "adset_name": "مبيعات - ماسنجر",
  "conversion_location": "messenger",
  "countries": ["EG"]
}
```

باقي الـ locations: `whatsapp`، `phone_call`.

------------------------------------------------------------------------

### 5) OUTCOME_AWARENESS (وعي)

#### الحملة

``` json
"objective": "OUTCOME_AWARENESS"
```

#### AdSet: وصول

``` json
{
  "ad_account_id": "act_968599310891700",
  "campaign_id": "CAMPAIGN_ID",
  "page_id": "1143370238851368",
  "adset_name": "وعي - وصول",
  "conversion_location": "default",
  "optimization_goal": "REACH",
  "frequency_max": 3,
  "frequency_interval_days": 7,
  "countries": ["EG"]
}
```

------------------------------------------------------------------------

### 6) OUTCOME_APP_PROMOTION (ترويج تطبيق)

#### AdSet: تثبيتات التطبيق

``` json
{
  "ad_account_id": "act_968599310891700",
  "campaign_id": "CAMPAIGN_ID",
  "page_id": "1143370238851368",
  "adset_name": "تطبيق - تثبيتات",
  "conversion_location": "app",
  "application_id": "APP_ID",
  "object_store_url": "https://play.google.com/store/apps/details?id=com.example",
  "countries": ["EG"]
}
```

------------------------------------------------------------------------

## ميزانية الـ AdSet

ضيف في أي AdSet عند الحاجة:

``` json
"daily_budget": 50000
```

------------------------------------------------------------------------

## Targeting متقدم

اختياري في أي AdSet.

قيم `cities` و`interest_ids` و`locales` لازم تتجاب من **Targeting Search
API**:

-   `search?type=adgeolocation`
-   `search?type=adinterest`

القيم الموجودة في المثال وهمية.

``` json
{
  "age_min": 18,
  "age_max": 35,
  "genders": [1, 2],
  "locales": [6],
  "cities": [
    {
      "key": "CITY_KEY_الحقيقي",
      "radius": 25,
      "distance_unit": "kilometer"
    }
  ],
  "location_types": ["home", "recent"],
  "interest_ids": ["INTEREST_ID_الحقيقي"],
  "custom_audience_ids": ["AUDIENCE_ID_الحقيقي"],
  "use_advantage_placements": false,
  "publisher_platforms": ["facebook", "instagram"],
  "facebook_positions": ["feed", "video_feeds"],
  "instagram_positions": ["stream"],
  "device_platforms": ["mobile", "desktop"]
}
```

------------------------------------------------------------------------

## لو فيسبوك رفض Combination

1.  جرّب بـ `"validate_only": true`.
2.  الرد بيقولك المتاح لكل `conversion_location` في رسالة الخطأ.
3.  عدّل `config/facebook_ads.php` بس، من غير ما تلمس الكود.
