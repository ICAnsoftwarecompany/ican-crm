# Proposal في ICAN CRM

هذا الملف يشرح جزء الـ Proposal الموجود داخل قسم العملاء، والهدف منه أن يكون مرجع سريع عند التطوير أو التعديل لاحقا.

## مكان الصفحة

صفحة إنشاء وإدارة العروض موجودة هنا:

`src/pages/customers/pages/proposals/CustomerProposalBuilderPage.jsx`

المسار داخل التطبيق:

`/customers/proposals`

تم ربطها من:

`src/app/router/index.jsx`

وتظهر في sidebar العملاء من:

`src/pages/customers/constants/customerNavigation.js`

## الفكرة العامة

جزء الـ Proposal مقسوم إلى جزئين:

1. قوالب العروض `Proposal Templates`
2. العروض الفعلية `Proposals`

القوالب تستخدم لتجهيز شكل أو هيكل العرض، أما الـ Proposal فهو العرض الفعلي الذي يتم إنشاؤه للعميل أو الشركة، وله نسخ وخيارات تسعير وبنود.

## ملفات الـ API

### قوالب العروض

الملف:

`src/features/proposals/api/proposalTemplatesApi.js`

المسار الأساسي:

`/api/tenant/proposal/template`

أهم الدوال:

- `getTemplates`
- `getTemplateInfo`
- `createTemplate`
- `updateTemplate`
- `deleteTemplate`
- `duplicateTemplate`
- `activateTemplate`
- `deactivateTemplate`
- `createTemplateVersion`
- `updateVersionBuilder`
- `setCurrentVersion`
- `duplicateVersion`
- `createVersionSection`
- `reorderVersionSections`
- `updateSection`
- `deleteSection`
- `toggleSectionVisibility`
- `createSectionBlock`
- `reorderSectionBlocks`
- `updateBlock`
- `deleteBlock`
- `toggleBlockVisibility`

### العروض الفعلية

الملف:

`src/features/proposals/api/proposalsApi.js`

المسار الأساسي:

`/api/tenant/proposals`

الدوال الموجودة:

- `getProposals(params)`
- `getProposalInfo(proposalId, params)`
- `createProposal(payload)`
- `updateProposal(proposalId, payload)`
- `deleteProposal(proposalId)`
- `createProposalVersion(proposalId, payload)`
- `getProposalVersions(proposalId, params)`
- `getProposalVersionInfo(proposalId, versionId, params)`
- `updateProposalVersion(proposalId, versionId, payload)`
- `deleteProposalVersion(proposalId, versionId)`
- `setCurrentProposalVersion(proposalId, versionId)`
- `getProposalOptions(proposalId, params)`
- `createProposalOption(proposalId, payload)`
- `reorderProposalOptions(proposalId, payload)`
- `updateProposalOption(proposalId, optionId, payload)`
- `setRecommendedProposalOption(proposalId, optionId, payload)`
- `deleteProposalOption(proposalId, optionId)`
- `getProposalOptionItems(proposalId, optionId, params)`
- `createProposalOptionItem(proposalId, optionId, payload)`
- `reorderProposalOptionItems(proposalId, optionId, payload)`
- `updateProposalOptionItem(proposalId, optionId, itemId, payload)`
- `deleteProposalOptionItem(proposalId, optionId, itemId)`

ملاحظة: `httpClient` يضيف `api_password` تلقائيا، لذلك لا يتم كتابته داخل الدوال.

## ملفات الـ Hooks

### Hooks القوالب

الملف:

`src/features/proposals/hooks/useProposalTemplates.js`

أهم الـ hooks:

- `useProposalTemplates`
- `useProposalTemplateInfo`
- `useProposalTemplateMutations`

### Hooks العروض

الملف:

`src/features/proposals/hooks/useProposals.js`

أهم الـ hooks:

- `useProposals`
- `useProposalInfo`
- `useProposalVersions`
- `useProposalVersionInfo`
- `useProposalOptions`
- `useProposalOptionItems`
- `useProposalMutations`

كل الدوال يتم تصديرها من:

`src/features/proposals/index.js`

وبالتالي يمكن استيرادها هكذا:

```js
import {
  useProposals,
  useProposalMutations,
  useProposalTemplates,
} from '../../../features/proposals'
```

## Query Keys

تم إضافة مفاتيح React Query في:

`src/shared/constants/queryKeys.js`

المفتاح الخاص بالعروض:

```js
proposals: {
  all: ['proposals'],
  list: (filters) => ['proposals', 'list', filters],
  detail: (proposalId) => ['proposals', 'detail', proposalId],
  versions: (proposalId, filters) => ['proposals', proposalId, 'versions', filters],
  version: (proposalId, versionId) => ['proposals', proposalId, 'version', versionId],
  options: (proposalId, filters) => ['proposals', proposalId, 'options', filters],
  optionItems: (proposalId, optionId, filters) => ['proposals', proposalId, 'options', optionId, 'items', filters],
}
```

## تدفق إنشاء Proposal

الصفحة الحالية تنفذ التدفق التالي:

1. جلب القوالب من `useProposalTemplates`.
2. جلب العروض من `useProposals`.
3. إنشاء عرض جديد من نموذج `إنشاء Proposal`.
4. عند اختيار عرض يتم جلب:
   - تفاصيل العرض من `useProposalInfo`
   - نسخه من `useProposalVersions`
   - خياراته من `useProposalOptions`
5. عند اختيار خيار يتم جلب بنوده من `useProposalOptionItems`.

## بيانات إنشاء Proposal

النموذج يرسل إلى `createProposal`:

```json
{
  "title": "Website Development Proposal",
  "description": "Proposal for designing and developing a new company website.",
  "template_id": 3,
  "assigned_to": 1,
  "currency": "usd",
  "expires_at": "2026-09-30",
  "metadata": {
    "client_name": "Example Company",
    "priority": "high",
    "notes": "Custom development proposal"
  }
}
```

## Proposal Versions

كل Proposal يمكن أن يحتوي على أكثر من version.

استخدامات النسخ في الصفحة:

- إنشاء نسخة جديدة.
- تعديل نسخة موجودة.
- حذف نسخة.
- تعيين نسخة كحالية.
- عرض تفاصيل النسخة المختارة.

مثال payload:

```json
{
  "name": "Version 1",
  "change_note": "Initial proposal version with updated pricing.",
  "template_id": 2,
  "content": {
    "title": "Website Development Proposal",
    "sections": []
  },
  "settings": {
    "show_logo": true,
    "show_signature": true,
    "page_size": "A4"
  },
  "design": {
    "primary_color": "#2563EB",
    "font_family": "Arial",
    "font_size": 14
  },
  "subtotal": 10000,
  "discount": 500,
  "tax": 1425,
  "total": 10925,
  "is_current": true
}
```

## Proposal Options

الـ Options تمثل باقات أو اختيارات تسعير داخل العرض.

الصفحة تدعم:

- إنشاء option.
- تعديل option.
- حذف option.
- ترتيب options.
- تعيين option كموصى به.

مثال:

```json
{
  "name": "Premium Package",
  "description": "Complete package including design, development, and ongoing support.",
  "sort_order": 1,
  "is_recommended": true,
  "is_active": true,
  "subtotal": 15000,
  "discount": 1000,
  "tax": 2100,
  "total": 16100
}
```

## Proposal Option Items

الـ Items هي البنود الموجودة داخل كل option، مثل منتج أو خدمة أو بند تكلفة.

الصفحة تدعم:

- جلب البنود.
- إنشاء بند.
- تعديل بند.
- حذف بند.
- ترتيب البنود.

مثال:

```json
{
  "product_id": 1,
  "description": "Professional website development service.",
  "quantity": 2,
  "unit_price": 5000,
  "discount": 500,
  "tax": 1350,
  "sort_order": 0,
  "is_optional": false,
  "metadata": {
    "sku": "WEB-001",
    "category": "Development"
  }
}
```

## الترتيب Reorder

دوال الترتيب تستخدم helper داخل `proposalsApi.js` اسمه:

`normalizeOrderPayload`

لو تم تمرير Array مباشرة، يتم تحويلها إلى:

```json
{
  "options": []
}
```

أو:

```json
{
  "items": []
}
```

داخل الصفحة يتم بناء payload بالشكل:

```json
[
  { "id": 3, "sort_order": 0 },
  { "id": 1, "sort_order": 1 }
]
```

## ملاحظات مهمة للتطوير

- لا تضف `api_password` يدويا داخل دوال الـ API، لأن `httpClient` يضيفه تلقائيا.
- أي عملية إنشاء أو تعديل أو حذف تستخدم `useProposalMutations`.
- بعد أي mutation يتم عمل invalidate للـ query keys المناسبة، لذلك البيانات تتحدث تلقائيا.
- حقول `metadata`, `content`, `settings`, `design` يتم إدخالها كـ JSON textarea داخل الصفحة.
- لو الـ JSON غير صحيح، يتم إيقاف الإرسال وعرض رسالة خطأ.
- عند إضافة UI متقدم لاحقا، الأفضل فصل الصفحة إلى مكونات:
  - `ProposalForm`
  - `ProposalList`
  - `ProposalVersionsPanel`
  - `ProposalOptionsPanel`
  - `ProposalOptionItemsPanel`

## اقتراح التطوير القادم

الصفحة الحالية عملية وتستخدم كل الدوال، لكن أفضل خطوة لاحقة هي تحويلها إلى Builder بصري:

- معاينة مباشرة للعرض.
- Drag and drop للـ sections والـ items.
- اختيار منتجات من قائمة المنتجات بدلا من كتابة `product_id`.
- ربط العرض بعميل من جدول العملاء.
- زر تصدير أو إرسال العرض للعميل عبر Gmail أو WhatsApp.
