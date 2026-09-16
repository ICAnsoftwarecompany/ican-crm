# Customer Activity Timeline

## Purpose
A professional customer journey timeline that replaces raw activity cards in the lead/customer activity dialog.

## Architecture
- Container dialog: `LeadActivitiesDialog`.
- Timeline UI reads only normalized activities.
- Backend-specific mapping is isolated in normalization utilities.

## Folder Structure
- `src/pages/customers/components/customers-table/CustomerActivityTimeline/`
- `config/activityTypes.js`
- `config/activitySources.js`
- `utils/normalizeCustomerActivities.js`
- `utils/groupActivitiesByDate.js`
- `utils/formatActivityDate.js`
- `utils/formatActivityDuration.js`
- `utils/getActivityRenderer.js`
- `renderers/StatusChangeActivity.jsx`
- `renderers/NoteActivity.jsx`
- `renderers/InterestedProductsActivity.jsx`
- `renderers/DefaultActivity.jsx`
- `CustomerActivityTimeline.jsx`
- `ActivityDateGroup.jsx`
- `ActivityTimelineItem.jsx`
- `ActivityTimelineNode.jsx`
- `ActivityDetails.jsx`
- `ActivityHeader.jsx`
- `ActivityFilters.jsx`

## Normalized Shape
Each activity is normalized into:
- `id`
- `logId`
- `type`
- `category`
- `importance`
- `title`
- `description`
- `date`
- `user`
- `oldStatus`, `newStatus`
- `oldStatusId`, `newStatusId`
- `responseTimeSeconds`
- `source`
- `action`
- `noteText`
- `products`
- `data`
- `raw` `{ log, activity }`

## Supported Types
Current type mapping in `activityTypes.js` includes:
- `status_change`
- `note`
- `note-to-lead`
- `interested_products`
- `call`
- `meeting`
- `email`
- `whatsapp`
- `task`
- `assigned`
- `proposal`
- `deal`, `deal_won`, `deal_lost`, `lost`
- `lead_created`, `customer_created`
- fallback: `default`

## Type Configuration
`activityTypes.js` centralizes:
- localized label
- category
- icon
- tone
- milestone importance

## Renderers
- `StatusChangeActivity`: visual old/new status transition.
- `NoteActivity`: note-focused rendering.
- `InterestedProductsActivity`: product list with level badges.
- `DefaultActivity`: safe fallback.

## Date Grouping
`groupActivitiesByDate` groups activities into:
- `اليوم`
- `أمس`
- older dates formatted with `Intl`.

## Filters
`ActivityFilters` supports:
- `الكل`
- `الحالات`
- `الملاحظات`
- `المنتجات`
- `التواصل`

## Search
Client-side search over:
- title
- description
- note text
- user name
- status names
- product names/notes/levels

## Source Mapping
`activitySources.js` maps backend source keys to Arabic user-facing labels.
Unknown values are displayed as `مصدر غير معروف`.

## Add New Activity Type
1. Add type in `config/activityTypes.js`.
2. If type needs custom layout, create a renderer in `renderers/`.
3. Update `utils/getActivityRenderer.js` to route to the new renderer.
4. Extend normalization if backend payload needs extra extracted fields.

## Backend Expectations
The normalizer supports both shapes:
- log object that contains nested `activities[]`.
- already-flattened activity objects.

## Known Limitations
- Product name fallback is `Product #id` when only id is provided.
- Relative time text is intentionally lightweight and Arabic-only.

## Future Improvements
- Virtualized timeline for very large data sets.
- Optional advanced filter panel by type/user/date range.
- Integrate global product lookup by id for richer product labels.
