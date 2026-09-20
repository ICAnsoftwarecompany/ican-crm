# Social Media Architecture

هذا هو المرجع الكامل لمطوّري وحدة **Social Media**. اقرأه قبل إضافة منصة جديدة، قبل إضافة API جديد، وقبل تعديل أي مكوّن مشترك داخل `features/social-media/`.

## 1. هدف Social Media Module

Social Media مسؤول عن **المحتوى العضوي (Organic)**: الحسابات/الصفحات المتصلة، المحتوى المنشور، التفاعل (إعجابات/تعليقات/مشاركات)، والتخطيط المستقبلي للمحتوى. الهدف ليس شاشة Facebook منفصلة، بل **معمارية موحّدة قابلة للتوسع** تدير أكثر من منصة تواصل اجتماعي من نفس الـCRM، حتى لو منصة واحدة فقط (Facebook) لديها API فعلي اليوم.

## 2. مكانه داخل Growth

Social Media عنصر واحد داخل قسم **Growth** بالـSidebar الرئيسي (`src/app/navigation/navigation.config.js`)، بجانب Campaigns وOutreach Campaigns وOpportunity Center:

```js
{
  id: 'social-media',
  labelKey: 'nav.socialMedia',
  icon: Share2,
  path: '/social-media',
  permission: 'social.view',
  activePatterns: ['/social-media', '/social-media/*'],
}
```

Facebook/Instagram/TikTok/Snapchat **ليست** عناصر منفصلة في الـSidebar الرئيسي — طبقًا لقاعدة `SIDEBAR_ARCHITECTURE.md` ("Sidebar vs Page Navigation")، الـSidebar الرئيسي يبقى بسيطًا ("موديول واحد → صفحة واحدة")، والتنقل بين المنصات يحدث داخل تنقّل Social Media الخاص به (انظر القسم التالي) — تمامًا كما لدى Settings وCustomers وProducts وCampaign Center تنقّلها الداخلي الخاص.

## 3. الفرق بين Social Media و Campaigns

هذا أهم فرق معماري في الوحدة كلها — **لا تدمجهما أبدًا**، حتى لو تشاركا نفس Meta Integration ونفس backend endpoints:

| | Social Media | Campaigns |
|---|---|---|
| المسؤولية | Profiles، محتوى عضوي، تفاعل، تعليقات، Planner، تحليلات عضوية | حملات مدفوعة، Ad Sets، إعلانات، ميزانية/إنفاق، نتائج مدفوعة، نماذج Leads |
| الـroute | `/social-media/*` | `/campaigns/*` |
| الفولدر | `features/social-media/`, `pages/social-media/` | `features/campaigns/`, `pages/campaigns/` |
| الـbackend | `getPagePosts`/`getPostEngagement`/`getPostComments` (منشورات عضوية) | Ad accounts/campaigns/ad-sets/ads (إعلانات مدفوعة) |

الوحدتان **تتشاركان** Meta Integration نفسه (`features/meta-integrations`) وبعض الـendpoints (انظر القسم 15) — هذا لا يجعلهما نفس الـUI domain. لا تُنشئ تبعية لأي مكوّن UI في `features/campaigns` من داخل `features/social-media` والعكس، إلا استيراد API/adapter محدد صراحة (كما في `facebookSocialApi.js`).

## 4. Folder Architecture

```text
src/features/social-media/
├── api/
│   └── facebookSocialApi.js          إعادة تصدير صريحة لـ getPagePosts/getPostEngagement/getPostComments من campaigns — ليست تكرارًا
├── adapters/
│   ├── socialAdapterContract.js      JSDoc typedefs فقط (SocialProfile/SocialContent/...)
│   └── facebook/
│       └── facebookAdapter.js        normalizeProfile/Content/ContentList/Engagement/Comments/Pagination
├── config/
│   ├── socialCapabilities.js         SOCIAL_CAPABILITIES enum + SOCIAL_NAV_ITEMS (تنقّل داخلي config-driven)
│   └── socialPlatformsRegistry.js    تعريف كل منصة مرة واحدة (facebook/instagram/tiktok/snapchat)
├── components/                        عرض محايد تجاه المنصة (platform-agnostic)
│   ├── SocialPlatformBadge.jsx
│   ├── SocialProfileCard.jsx
│   ├── SocialProfileHeader.jsx
│   ├── SocialMetricsCards.jsx
│   ├── SocialPlatformUnavailable.jsx
│   ├── content/  (Grid/List/Calendar/Filters/EmptyState)
│   └── details/  (Drawer/MediaPreview/Engagement/Comments)
├── hooks/
│   ├── socialKeys.js                 مفاتيح React Query المركزية
│   ├── useSocialProfiles.js
│   ├── useSocialContent.js           cursor pagination
│   ├── useSocialEngagement.js        lazy
│   └── useSocialComments.js          lazy
├── utils/
│   ├── engagementUtils.js            calculateTotalEngagement/rankContentByEngagement
│   ├── socialFormatters.js
│   └── paginationUtils.js            cursor stack helpers
├── index.js                          الـPublic API — استورد من هنا فقط
└── docs/SOCIAL_MEDIA_ARCHITECTURE_AR.md   (هذا الملف)

src/pages/social-media/
├── SocialMediaPage.jsx                Shell: sub-sidebar + Outlet (يماثل pages/campaigns/CampaignsPage.jsx)
├── components/
│   └── SocialMediaSubSidebar.jsx      تنقّل داخلي config-driven (SOCIAL_NAV_ITEMS + registry)
└── pages/
    ├── SocialOverviewPage.jsx
    ├── SocialProfilesPage.jsx
    ├── SocialContentPage.jsx
    ├── SocialPlannerPage.jsx
    ├── SocialAnalyticsPage.jsx
    └── platforms/
        ├── FacebookPage.jsx            قائمة صفحات Facebook المتصلة
        ├── FacebookProfilePage.jsx     صفحة تفصيلية حقيقية — الـMVP الفعلي
        ├── InstagramPage.jsx           SocialPlatformUnavailable
        ├── TikTokPage.jsx              SocialPlatformUnavailable
        └── SnapchatPage.jsx            SocialPlatformUnavailable
```

**قاعدة**: كل شيء خاص بدومين ("ما هو Social Content؟") يعيش في `features/social-media/`. كل شيء خاص بالـroute/الـpage نفسها يعيش في `pages/social-media/` — نفس الفصل المتبع بالفعل في `campaigns`/`automation`/`tasks`/`products`.

## 5. Routing

مسارات مسطّحة على مستوى الجذر (`/social-media/*`)، **وليست** متداخلة تحت `/growth/*` — نفس نمط `/campaigns`/`/opportunities`/`/outreach-campaigns` الموجود بالفعل (القسم الظاهري "Growth" في الـSidebar لا علاقة له ببنية الـURL):

```text
/social-media                     → SocialOverviewPage (index)
/social-media/profiles            → SocialProfilesPage
/social-media/content             → SocialContentPage
/social-media/planner             → SocialPlannerPage
/social-media/analytics           → SocialAnalyticsPage
/social-media/facebook            → FacebookPage (قائمة الصفحات)
/social-media/facebook/:pageId    → FacebookProfilePage (التفاصيل الكاملة)
/social-media/instagram           → InstagramPage (Coming Soon)
/social-media/tiktok              → TikTokPage (Coming Soon)
/social-media/snapchat            → SnapchatPage (Coming Soon)
```

بخلاف Campaign Center (`/campaigns/:platform/...` عبر route param مشترك)، لا يوجد `:platform` param مشترك هنا — الصفحات العابرة للمنصات (Overview/Profiles/Content/Planner/Analytics) لا تحتاج اختيار منصة إطلاقًا، وكل منصة لها مسارها الحرفي الخاص (`/facebook`, `/instagram`, ...). هذا أبسط وكافٍ لشكل الوحدة الحالي — لا حاجة لـSocialMediaContext مثل CampaignCenterContext.

## 6. Platform Registry

`config/socialPlatformsRegistry.js` هو مصدر الحقيقة الوحيد — لا تكتب `if (platform === 'facebook')` في أي مكوّن:

```js
{
  id: 'facebook',
  labelKey: 'socialMedia.platforms.facebook',
  icon: Facebook,
  available: true,                 // ICAN لديه API + Adapter حقيقيين
  moduleKeys: ['social-media', 'social-media.facebook', 'growth'],
  adapter: facebookAdapter,
  capabilities: { profiles: true, contentRead: true, engagementRead: true, commentsRead: true, ... },
}
```

`instagram`/`tiktok`/`snapchat` مسجّلة بنفس الشكل، `available: false`, `adapter: null`, `capabilities: {}`. الدوال العامة: `getSocialPlatforms()`, `getSocialPlatform(id)`, `getVisibleSocialPlatforms(enabledModules)`, `socialPlatformHasCapability(platform, capability)`.

**ثلاث حالات مختلفة تمامًا** يجب ألا تُختصر لقيمة boolean واحدة:

1. **منصة مدعومة من ICAN** (`available` في الـregistry) — هل يوجد Adapter/API حقيقي؟
2. **منصة ضمن باقة الـtenant** (`moduleKeys` مقابل `user.modules`) — انظر القسم 20.
3. **منصة متصلة فعليًا** (بيانات وقت التشغيل من `useSocialProfiles`) — هل ربط المستخدم حسابًا فعلًا؟

## 7. Platform Capabilities

`config/socialCapabilities.js`:

```js
export const SOCIAL_CAPABILITIES = Object.freeze({
  PROFILES: 'profiles',
  CONTENT_READ: 'contentRead',
  ENGAGEMENT_READ: 'engagementRead',
  COMMENTS_READ: 'commentsRead',
  CONTENT_CREATE: 'contentCreate',      // false اليوم لكل المنصات
  CONTENT_SCHEDULE: 'contentSchedule',  // false اليوم لكل المنصات
  CONTENT_PUBLISH: 'contentPublish',    // false اليوم لكل المنصات
  PROFILE_INSIGHTS: 'profileInsights',  // false اليوم لكل المنصات
  CONTENT_INSIGHTS: 'contentInsights',  // false اليوم لكل المنصات
})
```

انظر القسم 26 (Capability-Based UI) للقاعدة الكاملة حول كيفية استخدام هذه القيم بدل فحص اسم المنصة.

## 8. Social Profile Contract

`SocialProfile` (في `socialAdapterContract.js`):

```js
{
  id, externalId, platform, name, username, avatarUrl,
  connectionStatus: 'connected'|'disconnected'|'expired'|'error',
  lastSyncAt, followers, contentCount, raw,
}
```

`followers`/`contentCount`/`lastSyncAt` كلها `number|null` أو `string|null` — `null` يعني "غير متاحة من الـAPI الحالي"، وليست صفرًا. `id` هو `${platform}:${externalId}` — معرّف موحّد وفريد عبر كل المنصات، لتفادي تضارب المعرّفات لو ظهر محتوى من منصتين مختلفتين في نفس القائمة مستقبلًا.

## 9. Social Content Contract

`SocialContent`:

```js
{
  id, externalId, profileId, platform,
  contentType: 'post'|'story'|'reel'|'unknown',
  mediaType: 'text'|'image'|'video'|'carousel'|'link'|'unknown',
  message, caption, media: [{url, type}], thumbnail, permalink,
  status: 'draft'|'scheduled'|'published'|'failed',
  createdAt, publishedAt, scheduledAt,
  engagement: { likes, comments, shares, saves },
  metrics: { reach, impressions, views },
  raw,
}
```

`status`/`scheduledAt` موجودان من اليوم الأول رغم أن Facebook الحالي يُرجع `'published'` فقط دائمًا — هذا ما يسمح بإضافة Planner لاحقًا (القسم 42/37) **دون** تغيير شكل الموديل. `metrics.*` كلها `null` دائمًا اليوم — لا API حالي يوفرها (انظر القسم 43).

## 10. Social Engagement Contract

`SocialEngagement = { likes, comments, shares, saves }` — كل حقل `number|null`. مصدرها إما summary داخل استجابة المنشورات (`likes.summary.total_count`، إلخ) أو استجابة `getPostEngagement` المنفصلة (`likes_count`/`comments_count`/`shares_count`). `saves` دائمًا `null` — لا تعيده Facebook API الحالي.

## 11. Social Comments Contract

```js
SocialComment = { id, author: { name, avatarUrl }, text, createdAt, replies: SocialComment[], raw }
```

**تنبيه مهم**: العيّنة المرسلة في المواصفات لم تتضمن مثالًا فعليًا لاستجابة `getPostComments` — mapping التعليقات في `facebookAdapter.normalizeComments` مبني على شكل Facebook Graph API القياسي (`comment.from.name`, `comment.from.picture.data.url`, `comment.message`, `comment.created_time`) بتسامح كامل (كل قراءة عبر optional chaining، fallback إلى `null`)، وليس على مثال حقيقي مؤكد. **يجب التحقق من هذا الـmapping مقابل استجابة فعلية أول مرة تُستخدم في الإنتاج** — إن اختلف الشكل، التعديل محصور في `normalizeComments` فقط، لا في أي مكوّن UI.

## 12. Pagination Contract

`SocialPagination = { hasNext, hasPrevious, nextCursor, previousCursor }` — دائمًا cursor-based، أبدًا أرقام صفحات. انظر القسم 30 للتفاصيل الكاملة.

## 13. Adapter Architecture

```text
Facebook API (raw JSON)
      ↓
facebookAdapter.normalizeContentList()
      ↓
SocialContentList { items: SocialContent[], pagination: SocialPagination }
      ↓
Shared Social Components (SocialContentGrid/List/Calendar/Card/Drawer)
```

Shared components **لا تقرأ `raw` أبدًا** — فقط الحقول الموحّدة. هذا هو الحد الفاصل الذي يجعل إضافة Instagram لاحقًا لا يلمس أي مكوّن عرض. عقد الـAdapter (`socialAdapterContract.js#SocialAdapter`) يفرض ست دوال على أي adapter مستقبلي: `normalizeProfile/normalizeContent/normalizeContentList/normalizeEngagement/normalizeComments/normalizePagination`.

## 14. Facebook Adapter

جدول الـmapping الكامل (`adapters/facebook/facebookAdapter.js`):

| Facebook field | Social Content field |
|---|---|
| `id` | `externalId` |
| (envelope) `page_id` | `profileId` (منشورات القائمة لا تحمل `page_id` الخاص بها — يُمرَّر من مستوى الغلاف) |
| `message` | `message` و`caption` |
| `created_time` | `createdAt` و`publishedAt` |
| `permalink_url` | `permalink` |
| `full_picture` | `thumbnail` |
| `attachments.data[]` | `media[]` (`media_type: photo→image, video→video, غير ذلك→unknown`) |
| `likes.summary.total_count` | `engagement.likes` |
| `comments.summary.total_count` | `engagement.comments` |
| `shares.count` | `engagement.shares` |
| — | `status` = `'published'` دائمًا (الـendpoint هذا يُرجع منشورات منشورة فقط) |
| — | `scheduledAt` = `null` دائمًا |
| — | `metrics.*` = `null` دائمًا (لا reach/impressions/views من هذا API) |

`mediaType` يُشتق (`deriveMediaType`): أكثر من مرفق واحد → `carousel`؛ مرفق واحد فيديو/صورة → `video`/`image`؛ نص بدون مرفقات → `text`؛ غير ذلك → `unknown`. هذا اشتقاق من الحقول المُعطاة فعليًا، وليس تخمينًا.

## 15. API Data Flow

```text
Facebook API (backend)
      ↓
facebookCampaignApi.getPagePosts/getPostEngagement/getPostComments   (features/campaigns/facebook-campaign/api)
      ↓  (إعادة تصدير صريحة، بدون تكرار كود)
facebookSocialApi   (features/social-media/api/facebookSocialApi.js)
      ↓
useSocialContent / useSocialEngagement / useSocialComments   (React Query)
      ↓
facebookAdapter.normalize*()
      ↓
Normalized Social Content/Engagement/Comments
      ↓
Shared Social UI (Grid/List/Calendar/Drawer)
```

`facebookSocialApi.js` **لا يستدعي `httpClient` مباشرة ولا يعيد تنفيذ أي endpoint** — فقط `import { facebookCampaignApi } from '../../campaigns/facebook-campaign'` ثم تصدير الثلاث دوال المطلوبة. لا عميل HTTP جديد، لا تكرار Meta integration.

## 16. React Query Strategy

كل جلب بيانات عبر TanStack React Query الموجود بالفعل — لا `useEffect` يدوي. مفاتيح مركزية في `hooks/socialKeys.js`:

```js
socialKeys.all(tenantId)
socialKeys.profiles(tenantId, platform)
socialKeys.content(tenantId, platform, profileId, cursor)
socialKeys.engagement(tenantId, platform, contentId)
socialKeys.comments(tenantId, platform, contentId)
```

**قرار متعمّد**: هذه مفاتيح محلية للـfeature، **وليست** إضافة إلى `shared/constants/queryKeys.js` المشترك. السبب: أقرب سابقة معمارية حقيقية لهذه الوحدة (Facebook داخل Campaign Center، `features/campaigns/facebook-campaign/hooks/useFacebookCampaigns.js#facebookCampaignKeys`) تستخدم بالفعل نفس النمط المحلي (`campaign-center/tenant/platform/resource/filters`) بدل الملف المشترك — ذلك الملف المشترك يخدم كيانات CRUD بسيطة أحادية النطاق (leads، tasks، ...)، بينما وحدة متعددة المنصات بنطاق لكل profile/platform تحتاج الشكل الأغنى الذي توفره السابقة المباشرة، لا السابقة الأبسط.

## 17. Cache Strategy

نفس React Query cache القياسي — لا cache مخصص إضافي. مفتاح المحتوى يتضمن الـcursor نفسه (`socialKeys.content(..., cursor)`)، لذلك كل صفحة cursor تُخزَّن بشكل مستقل، والرجوع لصفحة سابقة (Previous) يُعيد استخدام الـcache الموجود فورًا بدل طلب شبكة جديد.

## 18. Lazy Loading Strategy

- **المنشورات (Posts)**: تُجلب عند دخول صفحة المحتوى — مرة واحدة لكل صفحة/cursor.
- **Engagement التفصيلي**: **Lazy** — `useSocialEngagement({ enabled })`، يُفعَّل فقط عند فتح Content Details Drawer (`enabled: open && Boolean(content)`).
- **Comments**: **Lazy** أكثر — `useSocialComments({ enabled })` لا يُفعَّل إلا بعد أن يوسّع المستخدم قسم Comments داخل الـDrawer فعليًا (`commentsEverOpened` state، ليس مجرد فتح الـDrawer).

**ممنوع صراحة**: 10 منشورات → 10 طلبات engagement → 10 طلبات comments عند التحميل الأول. استجابة قائمة المنشورات تحمل summary جاهز (`likes`/`comments`/`shares`) يكفي لعرض الـGrid/List — هذا ما تستخدمه البطاقات مباشرة دون أي طلب إضافي.

## 19. Permissions

مفاتيح صلاحيات محجوزة (غير مُفعَّلة إنفاذيًا اليوم — نفس قاعدة "خامل حتى يوجد backend حقيقي" المتبعة في `navigation.config.js` كله):

```text
social.view
social.profiles.view
social.content.view
social.analytics.view
```

`social.view` مربوط بالفعل بعنصر الـSidebar. الباقي جاهز للربط لاحقًا دون أي تغيير بنيوي. مستقبلًا: `social.content.create`, `social.content.publish`, `social.content.schedule`, `social.comments.reply`.

## 20. Package Gating

`isSocialPlatformEnabled(platform, enabledModules)` في الـregistry — تمامًا نفس منطق `isModuleEnabled` في `navigation.utils.js`: إن لم يكن `enabledModules` مصفوفة (الباك إند لم يبدأ بعد بإرسال `user.modules`)، كل منصة تظهر دائمًا. **الواجهة لا تختلق قيدًا لا يرسله الباك إند أبدًا.**

## 21. Error States

كل استعلام (`useSocialProfiles`/`useSocialContent`/`useSocialEngagement`/`useSocialComments`) يُعيد `error` صريحًا، وكل مكوّن عرض (`SocialContentGrid`, `ContentComments`) يتعامل معه بحالة Error مخصصة + زر Retry — يعيد استخدام `common.loadFailed`/`common.checkConnection`/`common.retry` الموجودة بالفعل بدل نصوص جديدة. لا تُعرض رسالة الخطأ الخام للمستخدم إلا كـ`error?.message` احتياطي داخل الوصف، وهي نفس القاعدة المتبعة في بقية المشروع (`ResourceState`).

## 22. Empty States

مفردات موحّدة عبر `SocialContentEmptyState` (`components/content/SocialContentEmptyState.jsx`)، أربعة variants ثابتة:

```text
noIntegration   → "لا يوجد حساب تواصل اجتماعي متصل"
noPages         → "لا توجد صفحات فيسبوك متاحة حاليًا"
noContent       → "لا يوجد محتوى"
noFilterResults → "لا يوجد محتوى مطابق للفلاتر المحددة"
```

بالإضافة إلى `SocialPlatformUnavailable` لمنصة غير مدعومة إطلاقًا (Instagram/TikTok/Snapchat اليوم). لا تُنشئ نصوص Empty State جديدة متفرقة — استخدم أحد هذه الأربعة، أو أضِف variant خامس هنا إن ظهرت حاجة حقيقية جديدة.

## 23. Loading States

Skeletons وليس Spinner كبير فقط (انظر القسم 31 "UX"): `SocialContentGrid` يعرض شبكة `CardSkeleton` بنفس أبعاد التخطيط الحقيقي أثناء التحميل، `ContentComments` يعرض صفوف skeleton أفاتار+نص. يعيد استخدام `shared/components/feedback/Skeleton.jsx` الموجود بالفعل — لا Skeleton engine جديد.

## 24. كيفية إضافة Platform جديدة

```text
1. Register Platform      → أضف entry في socialPlatformsRegistry.js (available: false مبدئيًا)
2. Define capabilities    → حدد capabilities الفعلية المتاحة لهذه المنصة
3. Add API methods        → أنشئ xxxSocialApi.js يستدعي httpClient (أو يعيد تصدير من feature أخرى إن وُجد الendpoint هناك بالفعل)
4. Create Adapter         → adapters/xxx/xxxAdapter.js يطبّق نفس الست دوال (القسم 13/15)
5. Normalize response     → طابق كل حقل بحذر، لا تخترع حقولًا (القسم 11 مثال تحذيري)
6. Add Query integration  → useSocialProfiles/useSocialContent تتفرّع حسب platform (أو hooks مخصصة إن اختلف الشكل جوهريًا)
7. Enable platform        → available: true + adapter: xxxAdapter في الـregistry
```

بمجرد هذه الخطوات، **Shared UI يعمل تلقائيًا** — `SocialContentGrid`/`SocialContentCard`/`SocialContentDrawer`/`SocialProfileCard` لا تحتاج أي تعديل، لأنها تقرأ فقط العقد الموحّد (القسم 8-11)، لا شيء خاص بـFacebook.

## 25. مثال إضافة Instagram

لنفترض وصلت عقود Instagram Graph API الفعلية:

```js
// config/socialPlatformsRegistry.js
{
  id: 'instagram',
  labelKey: 'socialMedia.platforms.instagram',
  icon: Instagram,
  available: true,                          // ← كان false
  moduleKeys: ['social-media.instagram'],
  adapter: instagramAdapter,                // ← جديد
  capabilities: {
    profiles: true, contentRead: true, engagementRead: true, commentsRead: true,
    contentCreate: false, contentSchedule: false, contentPublish: false,
    profileInsights: false, contentInsights: false,
  },
}
```

```js
// api/instagramSocialApi.js
import httpClient from '../../../services/httpClient'
export const instagramSocialApi = {
  getProfilePosts: (profileId, params) => httpClient.get(`/api/tenant/instagram/${profileId}/media`, { params }).then((r) => r.data),
  // ...
}
```

```js
// adapters/instagram/instagramAdapter.js — يطبّق نفس الست دوال بحقول Instagram الفعلية
export const instagramAdapter = { normalizeProfile, normalizeContent, normalizeContentList, normalizeEngagement, normalizeComments, normalizePagination }
```

`useSocialProfiles`/`useSocialContent` تحتاج تفرعًا إضافيًا لـ`platform === 'instagram'` (نفس نمط `wantsFacebook` الموجود اليوم)، ثم `pages/social-media/pages/platforms/InstagramPage.jsx` يستبدل `<SocialPlatformUnavailable platform="instagram" />` بصفحة حقيقية تُعيد استخدام نفس `SocialProfileHeader`/`SocialContentGrid`/`SocialContentDrawer` الموجودة — **لا نسخ لصفحة Facebook**.

## 26. مثال إضافة TikTok

نفس الخطوات تمامًا (القسم 24)، مع فرق واحد يستحق التنويه: TikTok لا يملك مفهوم "صفحة" بنفس شكل Facebook (حساب واحد لكل مستخدم غالبًا) — هذا لا يكسر `SocialProfile` (يبقى `SocialProfile` واحدًا لكل حساب)، لكنه قد يعني أن `FacebookPage.jsx`-المكافئ (`TikTokPage.jsx`) ينتقل مباشرة لصفحة التفاصيل بدل عرض قائمة اختيار، حسب تصميم UX عند وصول الـintegration الفعلي. القرار محلي لتلك الصفحة فقط، ولا يغيّر العقد الموحّد.

## 27. كيفية إضافة API جديدة للمنصة

- ضع الدالة داخل `features/social-media/api/xxxSocialApi.js` (أو أعد تصدير دالة موجودة فعليًا في feature أخرى، كما فعل `facebookSocialApi.js` — **لا تُكرِّر تنفيذًا موجودًا**).
- لا تُغيّر عقد/شكل استجابة API موجود بدون ضرورة قصوى موثّقة.
- مرّر الاستجابة الخام لدالة `normalize*` في الـAdapter المناسب — لا معالجة بيانات API داخل مكوّنات React مباشرة أبدًا.

## 28. كيفية إضافة Capability جديدة

أضف مفتاحًا جديدًا في `SOCIAL_CAPABILITIES` (`config/socialCapabilities.js`)، ثم فعّله/عطّله لكل منصة في `capabilities: {}` الخاصة بها داخل الـregistry. أي مكوّن يحتاج إخفاء/إظهار جزء بناءً عليها يستخدم `socialPlatformHasCapability(platform, SOCIAL_CAPABILITIES.X)` — لا فحص اسم منصة مباشر أبدًا (القسم 26 من متطلبات المستخدم الأصلية → القسم "Capability-Based UI" هنا).

## 29. كيفية إضافة Content Type جديد

أضف القيمة الجديدة إلى تعداد `mediaType` في `socialAdapterContract.js` (JSDoc فقط، توثيقي)، أضف ترجمتها تحت `socialMedia.mediaType.<type>` في اللغتين، وحدّث `deriveMediaType`/ما يعادلها في أي Adapter يحتاج التعرّف على النوع الجديد. `SocialContentCard`/`ContentMediaPreview` يتعاملان بالفعل مع نوع غير معروف بأمان (`unknown` fallback) — لن ينكسر شيء أثناء الانتظار قبل ربط النوع الجديد بكل Adapter.

## 30. كيفية استخدام Social Content Components في Module آخر

كل مكوّنات `features/social-media/components/*` (باستثناء الصفحات نفسها) مُصدَّرة من `index.js` العام ومحايدة تجاه أين تُستخدم — مثال: عرض آخر منشورات صفحة معيّنة داخل تبويب "Social" في تفاصيل عميل مستقبلًا:

```jsx
import { useSocialContent, SocialContentGrid, SocialContentDrawer } from '@/features/social-media'

function CustomerSocialTab({ facebookPageId, tenantId }) {
  const contentQuery = useSocialContent({ tenantId, profileId: facebookPageId, enabled: Boolean(facebookPageId) })
  const [openContent, setOpenContent] = useState(null)
  return (
    <>
      <SocialContentGrid items={contentQuery.items} isLoading={contentQuery.isLoading} error={contentQuery.error} onRetry={contentQuery.refetch} onOpen={setOpenContent} pagination={contentQuery.pagination} onNext={contentQuery.goNext} onPrevious={contentQuery.goPrevious} />
      <SocialContentDrawer content={openContent} tenantId={tenantId} open={Boolean(openContent)} onClose={() => setOpenContent(null)} />
    </>
  )
}
```

لا حاجة لاستيراد أي شيء من `pages/social-media/`.

## 31. العلاقة المستقبلية مع Campaigns

انظر القسم 41 من متطلبات المستخدم (Future Relationship): `Content → Campaign → Leads Generated → Opportunities → Sales`. لا Attribution منفَّذ اليوم — لا backend له. عندما يصل: طبقة Attribution منفصلة تربط `SocialContent.id`/`profileId` بحملة مدفوعة معينة (عبر معرّف مشترك يوفّره الباك إند)، **دون** أن تعرف مكوّنات Social Media أي شيء عن Campaigns مباشرة — الربط يحدث في طبقة بيانات منفصلة، ليس بـimport متبادل بين الوحدتين.

## 32. العلاقة المستقبلية مع Lead Generation

محتوى يحقق تفاعلًا عاليًا (`rankContentByEngagement`) قد يُشير لاحقًا لفرصة Lead Generation حقيقية (رسالة Messenger من نفس المنشور، تعليق يطلب تواصلًا). الجسر الطبيعي: ربط `SocialComment`/`SocialContent` بمحادثة Messenger موجودة بالفعل في `features/conversations` عبر معرّف مستخدم Facebook مشترك — لم يُنفَّذ اليوم، لكن `SocialComment.author` (اسم + صورة) جاهز كنقطة انطلاق لأي ربط مستقبلي.

## 33. العلاقة المستقبلية مع Opportunity Center

نفس فكرة القسم 32: محتوى بتفاعل مرتفع + تعليقات ذات نية شراء يمكن أن يصبح إشارة (`Signal`) جديدة في `features/opportunities` (انظر `OPPORTUNITY_CENTER.md` — `signalTypes` يتضمن بالفعل مفهوم إشارات من مصادر متعددة). لا تنفيذ اليوم — القاعدة نفسها: لا تُغلق الـArchitecture أمام هذا، لا تنفّذه بدون Backend حقيقي.

## 34. العلاقة المستقبلية مع Workflow Engine

بمجرد وجود Publishing API حقيقي (القسم 36)، عقدة Workflow جديدة ("انشر منشورًا اجتماعيًا") تصبح ممكنة عبر نفس `createNodeRegistry` الذي يستخدمه `features/workflow-engine` اليوم (`shared/components/visual-flow`) — Social Media توفّر تعريف العقدة (`properties`, `validate`) والـWorkflow Engine يوفّر المحرّك، بنفس نمط أي دومين آخر يُسجَّل فيه اليوم (Leads، Tasks، ...). لا شيء من هذا موجود اليوم.

## 35. العلاقة المستقبلية مع Calendar

`SocialContentCalendar` (القسم الحالي) **يُستخدم بالفعل اليوم** — لكنه محرّك تقويم محلي داخل صفحة Content فقط (عبر `createEventSourceRegistry` محلي، مصدر واحد `social-content`)، وليس مسجَّلًا داخل `calendarSourceRegistry` العام (`features/calendar/constants/calendarSources.js`) الذي يغذّي صفحة `/calendar` الرئيسية. القرار متعمَّد: لا يُفترض أن كل مستخدم يريد رؤية منشوراته الاجتماعية مختلطة مع Tasks/Meetings/Calls في نفس التقويم الرئيسي. إن ظهرت حاجة حقيقية لذلك مستقبلًا، التسجيل في السجل العام تغيير من سطر واحد (`calendarSourceRegistry.register({...})`) — لا تغيير بنيوي.

## 36. Future Publishing Architecture

```text
Create Content → Draft → Approval → Schedule → Publish → Monitor → Analytics
```

`SocialContent.status` يدعم بالفعل `'draft'|'scheduled'|'published'|'failed'` من اليوم الأول (القسم 9) تحديدًا لهذا السبب. عند وصول Publishing API حقيقي: `SOCIAL_CAPABILITIES.CONTENT_CREATE`/`CONTENT_PUBLISH` تتحول لـ`true` لتلك المنصة فقط، وتظهر أزرار/نماذج الإنشاء بناءً على الـcapability — **لا إعادة هيكلة** لأي مكوّن حالي.

## 37. Future Scheduling Architecture

`SocialContent.scheduledAt` موجود بالفعل (`null` دائمًا اليوم). `SOCIAL_CAPABILITIES.CONTENT_SCHEDULE` جاهز كمفتاح. `SocialContentCalendar` بالفعل يقرأ `scheduledAt` كـfallback عند غياب `publishedAt` (`contentToCalendarEvent`) — جاهز لعرض محتوى مجدول بمجرد وجوده، بدون تعديل.

## 38. Future Analytics Architecture

عند توفر Insights API حقيقي (Reach/Impressions/Engagement Rate الحقيقي): `SocialMetrics.reach/impressions/views` (القسم 9) تُملأ بدل `null`، `SOCIAL_CAPABILITIES.CONTENT_INSIGHTS`/`PROFILE_INSIGHTS` تتحول لـ`true`، وصفحة `SocialAnalyticsPage` تعرض تلك المقاييس الحقيقية بدل رسالة النطاق الحالية (القسم 43 أدناه). **لا تُضِف أي من هذه المقاييس قبل وجود API فعلي يوفّرها** — هذا مبدأ غير قابل للتفاوض في هذه الوحدة.

## 39. Do / Don't Rules

**✅ افعل:**
- استخدم الـAdapter دائمًا — لا مكوّن يقرأ استجابة Facebook الخام مباشرة.
- استخدم `capabilities.x` بدل `platform === 'facebook'`.
- اعرض `—` أو أخفِ الحقل عند `null` — أبدًا صفر وهمي.
- استخدم Lazy queries لـEngagement/Comments (`enabled`).
- استخدم cursor pagination (`after`/`before`) — أبدًا أرقام صفحات.
- أعد استخدام `httpClient`, `facebookCampaignApi`, `DataTable`, `Calendar`, `AppDrawer`, `ResourceState`, `EmptyState`, `Skeleton` الموجودة.

**❌ لا تفعل** (مطابقة لقسم "Do Not" في المواصفات الأصلية):
```text
❌ صفحة Facebook تحتوي كل المنطق داخلها مباشرة
❌ نداء API مباشر داخل بطاقة عرض (Card)
❌ تكرار httpClient
❌ تكرار DataTable
❌ تكرار Calendar
❌ شروط `platform === 'facebook'` متكررة في عشرات الملفات
❌ بيانات وهمية لـInstagram/TikTok/Snapchat
❌ تحليلات وهمية (Reach/Impressions/Engagement Rate بدون API حقيقي)
❌ pagination بأرقام صفحات لـFacebook cursor API
❌ جلب Comments لكل منشور عند تحميل الصفحة
❌ جلب Engagement لكل منشور بلا داعٍ
❌ عرض Metric غير متاحة كصفر
❌ إعادة كتابة Meta integration الموجود
❌ كسر Campaigns
❌ كسر الـSidebar الحالي
```

## 40. Testing Checklist

- [ ] `npm run build` بدون أخطاء.
- [ ] `npm run lint` نظيف.
- [ ] `npm run check:i18n` يمرّ (تطابق مفاتيح عربي/إنجليزي).
- [ ] `npm run check:architecture` يمرّ.
- [ ] `npx vitest run` بدون تراجعات.
- [ ] لا console warnings عند فتح `/social-media` وأي صفحة فرعية.
- [ ] عربي RTL: التخطيط، الأيقونات المعكوسة منطقيًا، اتجاه الأرقام/التواريخ (`dir="ltr"` محليًا داخل نص RTL).
- [ ] إنجليزي LTR.
- [ ] Desktop (3-4 أعمدة Grid)، Tablet (2)، Mobile (1) — والـSidebar الفرعي يتحول لـAppDrawer على الموبايل.
- [ ] تحميل منشورات Facebook فعليًا (صفحة متصلة حقيقية).
- [ ] زر Next يجلب صفحة تالية عبر `after` cursor.
- [ ] زر Previous يعود دون طلب شبكة جديد (من الـstack/cache).
- [ ] فتح Content Details Drawer يعرض الوسائط والنص وبيانات النشر.
- [ ] Engagement يتحدّث عند فتح الـDrawer (طلب فعلي لـ`getPostEngagement`).
- [ ] توسيع قسم Comments يُشغّل طلب `getPostComments` لأول مرة فقط (Network tab: لا طلبات متكررة عند الطي/التوسيع لاحقًا).
- [ ] Empty State يظهر بشكل صحيح لكل حالة (لا تكامل، لا صفحات، لا محتوى، لا نتائج فلاتر).
- [ ] خطأ API يعرض حالة خطأ + زر إعادة محاولة يعمل فعليًا.
- [ ] لا نمط N+1 في تبويب Network (عدد الطلبات لا يتناسب خطيًا مع عدد المنشورات المعروضة).
- [ ] Campaigns (`/campaigns/*`) تعمل تمامًا كما كانت قبل هذا التغيير.
- [ ] صلاحيات/عرض الـSidebar الرئيسي لم تتأثر لأي عنصر آخر غير `social-media`.
- [ ] إضافة منصة تجريبية جديدة للـregistry (بدون adapter حقيقي) لا تتطلب أي تعديل في `SocialContentGrid`/`SocialContentCard`/`SocialContentDrawer`/`SocialProfileCard`.
