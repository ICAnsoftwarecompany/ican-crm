# Proposal Module

## Overview
وحدة Proposal في ICAN CRM مسؤولة عن إنشاء عروض الأسعار، تحريرها بصريا، إدارة نسخها، خيارات الأسعار، وبنود كل خيار. الواجهة الحالية مبنية كـ Visual Builder وليست صفحة CRUD تقليدية.

## Goals
- تمكين مستخدم CRM العادي من إنشاء عرض بدون التعامل مع JSON أو IDs داخل الواجهة.
- فصل قائمة العروض عن محرر العرض وعن القوالب.
- استخدام نفس Renderer داخل الـ Canvas والـ Preview.
- حفظ محتوى العرض داخل Proposal Version بصيغة منظمة قابلة للتوسع.

## User Flow
1. المستخدم يفتح `/LeadsCenter/proposals`.
2. يضغط `عرض جديد`.
3. يختار العميل، القالب، المسؤول، العملة، وتاريخ الانتهاء.
4. النظام ينشئ Proposal ثم ينشئ أول Version بمحتوى بصري جاهز.
5. المستخدم ينتقل إلى `/LeadsCenter/proposals/:proposalId/builder`.
6. المستخدم يضيف أقسام وبلوكات ويعدل الخصائص من الواجهة.
7. التغييرات تحفظ تلقائيا في نسخة العرض الحالية.

## Domain Model
- Proposal: بيانات العرض العامة مثل العنوان، العميل داخل metadata، العملة، تاريخ الانتهاء، والمسؤول.
- Proposal Version: المحتوى المرئي والتصميم والإعدادات والإجماليات.
- Proposal Option: خيار سعر مثل Basic أو Premium.
- Proposal Option Item: بند داخل خيار السعر وقد يرتبط بمنتج.
- Proposal Template: قالب بداية لإنشاء العروض.

## Template Architecture
القوالب تظل مصدر بداية. صفحة `CustomerProposalTemplatesPage.jsx` تعرض القوالب وتسمح بالتفعيل، الإيقاف، والنسخ. تعديل بنية القالب التفصيلية متاح عبر APIs ويجب أن يتطور لاحقا إلى Template Builder منفصل.

## Proposal Architecture
الوحدة مقسمة إلى صفحات رفيعة ومكونات مستقلة:
- قائمة العروض.
- Wizard إنشاء عرض.
- Visual Builder.
- Renderer مشترك.
- لوحات خصائص، أسعار، ونسخ.

## Routes
- `/LeadsCenter/proposals`: قائمة العروض.
- `/LeadsCenter/proposals/templates`: القوالب.
- `/LeadsCenter/proposals/:proposalId/builder`: محرر العرض المرئي.

## Folder Structure
```txt
src/pages/customers/pages/proposals/
  CustomerProposalsPage.jsx
  CustomerProposalBuilderPage.jsx
  CustomerProposalTemplatesPage.jsx
  PROPOSAL.md
  components/
    ProposalBuilder.jsx
    ProposalBuilderHeader.jsx
    ProposalBuilderSidebar.jsx
    ProposalCanvas.jsx
    ProposalModal.jsx
    ProposalPreviewDialog.jsx
    ProposalPricingPanel.jsx
    ProposalPropertiesPanel.jsx
    ProposalVersionsPanel.jsx
    ProposalWizard.jsx
    renderer/ProposalRenderer.jsx
  constants/
    proposalBlockTypes.js
    proposalBuilderDefaults.js
  utils/
    proposalBuilderContent.js
    proposalPayloads.js
```

## API Files
- `src/features/proposals/api/proposalsApi.js`
- `src/features/proposals/api/proposalTemplatesApi.js`
- `src/features/proposals/hooks/useProposals.js`
- `src/features/proposals/hooks/useProposalTemplates.js`

## Template APIs
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

## Proposal APIs
- `getProposals`
- `getProposalInfo`
- `createProposal`
- `updateProposal`
- `deleteProposal`

## Version APIs
- `createProposalVersion`
- `getProposalVersions`
- `getProposalVersionInfo`
- `updateProposalVersion`
- `deleteProposalVersion`
- `setCurrentProposalVersion`

## Option APIs
- `getProposalOptions`
- `createProposalOption`
- `reorderProposalOptions`
- `updateProposalOption`
- `setRecommendedProposalOption`
- `deleteProposalOption`

## Item APIs
- `getProposalOptionItems`
- `createProposalOptionItem`
- `reorderProposalOptionItems`
- `updateProposalOptionItem`
- `deleteProposalOptionItem`

## Hooks
- `useProposals`
- `useProposalInfo`
- `useProposalVersions`
- `useProposalVersionInfo`
- `useProposalOptions`
- `useProposalOptionItems`
- `useProposalMutations`
- `useProposalTemplates`
- `useProposalTemplateInfo`
- `useProposalTemplateMutations`

## React Query Keys
المفاتيح موجودة في `src/shared/constants/queryKeys.js` تحت:
- `proposalTemplates`
- `proposals`

## Builder Architecture
الـ Builder ثلاث لوحات:
- اليسار: الأقسام والبلوكات ومكتبة البلوكات.
- الوسط: Canvas يعرض العرض الحقيقي.
- اليمين: خصائص، أسعار، ونسخ.

## Builder State
يتم حفظ محتوى العرض داخل `version.content` بالشكل:
```js
{
  schema_version: 1,
  title,
  settings,
  design,
  customer,
  sections: [
    {
      id,
      title,
      description,
      is_visible,
      blocks: [{ id, type, name, data, styles, is_visible }]
    }
  ]
}
```

## Section Architecture
القسم يحتوي اسم، وصف، حالة ظهور، وترتيب. يمكن إضافة وحذف وإعادة ترتيب الأقسام من اليسار.

## Block Architecture
كل block له:
- `type`: نوع البلوك.
- `data`: البيانات الخاصة به.
- `styles`: خصائص العرض.
- `is_visible`: التحكم في ظهوره.

## Block Registry
الأنواع معرفة في `constants/proposalBlockTypes.js`:
- Basic: cover, heading, text, image, button, divider, spacer.
- Business: customer_info, company_info, products, pricing.
- Proposal: terms, signature, page_break, video, custom, link.

## Block Data Contracts
- `cover`: eyebrow, title, subtitle, image_url.
- `heading`: text, level.
- `text`: content.
- `image`: url, caption.
- `button/link`: label, url.
- `spacer`: height.
- `customer_info`: show_email, show_phone, show_company.
- `company_info`: name, email, phone, address.
- `pricing/products`: title.
- `terms`: content.
- `signature`: signer_name, signer_title, line_label.

## Properties Panels
الخصائص منظمة حسب نوع البلوك، ولا تظهر JSON للمستخدم. أي نوع block جديد يحتاج حقول مناسبة داخل `ProposalPropertiesPanel.jsx`.

## Drag And Drop
تم استخدام `@dnd-kit` لإعادة ترتيب الأقسام والبلوكات. المرحلة الحالية تدعم إعادة الترتيب داخل قائمة الأقسام وداخل بلوكات القسم المحدد.

## Autosave
عند تعديل المحتوى، يتم تشغيل حفظ تلقائي مؤجل 900ms على `updateProposalVersion`. يوجد زر `حفظ الآن` للحفظ اليدوي.

## Pricing
لوحة الأسعار تستخدم:
- create option.
- delete option.
- create item.
- get option items.
وتعرض خيارات السعر داخل Renderer من نفس بيانات API.

## Versions
لوحة النسخ تعرض النسخ، تعيين النسخة الحالية، حذف النسخة، وإنشاء نسخة جديدة من المحتوى الحالي.

## Responsive Preview
المعاينة تستخدم `ProposalRenderer` داخل modal. لاحقا يمكن إضافة أوضاع Mobile وA4 وDesktop.

## Renderer Architecture
`ProposalRenderer.jsx` هو مصدر الحقيقة لعرض proposal. أي تغيير في شكل block يجب أن يتم هنا حتى يظهر في الـ Canvas والـ Preview بنفس الطريقة.

## Error Handling
الأخطاء تعرض عبر `sonner/toast`. يجب عدم إظهار stack trace للمستخدم داخل صفحات proposal.

## Loading States
القائمة، القوالب، والـ Builder تعرض حالات تحميل واضحة. في حال عدم وجود Proposal يظهر تنبيه مختصر.

## Empty States
قائمة العروض تعرض Empty State مع زر البدء. داخل Renderer توجد حالات فارغة للصور والأسعار والمنتجات.

## RTL/LTR
الصفحات تعمل `dir="rtl"`. القيم المالية تعرض `dir="ltr"` لتجنب كسر الأرقام والعملات.

## Accessibility
الأزرار الأيقونية لها `aria-label`. العناصر القابلة للنقر داخل Renderer تستخدم keyboard handlers عند وضع التحرير.

## Known API Issues
- Postman كان يحتوي على مسار حذف بند بسلوك PUT في مثال قديم، بينما الواجهة تستخدم DELETE كما هو منطقي مع API.
- إنشاء Proposal لا يحتوي على `customer_id` صريح في المثال، لذلك يتم حفظ بيانات العميل داخل `metadata`.
- إن لم يرجع الخادم ID بعد الإنشاء، لا يمكن فتح الـ Builder تلقائيا.

## Development Rules
- لا تعرض JSON editor للمستخدم العادي.
- أضف block جديد عبر Registry ثم Renderer ثم Properties.
- لا تضع منطق API داخل المكونات؛ استخدم hooks.
- اجعل صفحات route رفيعة قدر الإمكان.
- حافظ على Renderer مشترك بين التحرير والمعاينة.

## How To Add A Block
1. أضف النوع في `proposalBlockTypes.js`.
2. أضف default data في `createDefaultBlock`.
3. أضف طريقة العرض في `ProposalRenderer`.
4. أضف حقول التعديل في `ProposalPropertiesPanel`.

## How To Add Properties Panel
أضف شرطا حسب `block.type` داخل `BlockFields` واستخدم حقول منظمة مثل Input, Select, Toggle, Textarea.

## How To Add API Mutation
1. أضف الدالة في `proposalsApi.js`.
2. أضف mutation في `useProposalMutations`.
3. اعمل invalidate للمفاتيح المناسبة.
4. استخدم mutation داخل panel أو wizard.

## Future Roadmap
- Template Builder بصري كامل.
- Drag block بين الأقسام.
- أوضاع Preview: A4, Mobile, Web.
- Share/Public proposal link.
- PDF export.
- توقيع إلكتروني حقيقي.
- Activity timeline للعرض.
- Comments داخل الـ Builder.
- صلاحيات تحرير القوالب والعروض.
