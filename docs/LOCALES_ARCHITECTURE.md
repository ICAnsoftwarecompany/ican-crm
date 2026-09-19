# Locale Architecture

Permanent developer reference for translations in ICAN CRM. Read this before adding or
changing any user-facing copy.

## Directory structure

```text
src/locales/
├── index.js              # resources registry consumed by src/i18n.js
├── en/
│   ├── index.js           # imports every en/*.js module, exports the assembled tree
│   ├── app.js              # app shell: name, 404, network-status chrome
│   ├── nav.js               # global navigation (section headers, top-level nav items)
│   ├── actions.js           # generic verbs: save, cancel, delete, edit, ...
│   ├── auth.js               # login screen
│   ├── status.js              # shared lead/customer status labels
│   ├── common.js               # generic cross-cutting strings (loading, retry, am/pm, ...)
│   ├── dataTable.js              # shared DataTable engine (toolbar, filters, export, ...)
│   ├── leads.js                    # legacy/adjacent leads surface
│   ├── customers.js                 # Customers / Leads Center (table, drawer, follow-up, nav, ...)
│   ├── proposals.js                  # Proposal builder/renderer/wizard/templates
│   ├── activities.js                  # activities.status/priority/type/duration (shared across calls/meetings)
│   ├── conversations.js                # Conversations feature
│   ├── dashboard.js                     # Dashboard
│   ├── opportunities.js                  # Opportunities feature
│   ├── outreachCampaigns.js               # Outreach campaigns (WhatsApp/Messenger/Gmail)
│   ├── workflow.js                         # Workflow engine (builder, nodes, execution, ...)
│   ├── visualFlow.js                        # Shared Visual Flow canvas
│   └── visualFlowDemo.js                     # Visual Flow demo/playground page
└── ar/
    └── (same 19 modules, symmetrical 1:1 with en/)
```

Each file exports one JS object literal (`export default { ... }`) holding exactly the
subtree for its top-level translation key. `en/customers.js` and `ar/customers.js` both
own the `customers.*` key; nothing else is allowed to define `customers.*`.

## How translation keys map to files

The file name **is** the top-level i18next key. `src/locales/en/customers.js`'s default
export becomes `resources.en.common.customers`, which is exactly what
`t('customers.title')` resolves through. There is no indirection to look up — if you're
looking for `customers.nav.allLeads`, open `customers.js`.

```text
t('customers.table.name')       → src/locales/{ar,en}/customers.js  → table.name
t('proposals.builder.saveState.saved') → proposals.js → builder.saveState.saved
t('dataTable.noResults')        → dataTable.js → noResults
t('actions.save')               → actions.js → save
```

## The i18next runtime namespace did not change

The app still uses a single i18next namespace, `common` (see `defaultNS: 'common'` in
`src/i18n.js`), exactly as before the modularization. `useTranslation()` and `t(...)`
calls are unchanged — you never write `useTranslation('customers')`. File separation is
purely a *resource organization* concern; do not introduce real i18next namespaces
without a demonstrated reason.

```jsx
const { t } = useTranslation()

<Button>{t('common.actions.save')}</Button>  // wrong: no such key, see below
<Button>{t('actions.save')}</Button>          // correct: actions.js owns this key
```

## Adding a translation to an existing domain

1. Find the file: `src/locales/en/<domain>.js` and `src/locales/ar/<domain>.js`.
2. Add the same key path to both files, English and Arabic text respectively.
3. Use `t('<domain>.<path>')` in the component.
4. Run `npm run check:i18n` — it fails on any AR/EN key mismatch, empty value, or a
   module file that isn't registered in that language's `index.js`.

## Adding a new feature's translations

When a new business feature owns user-facing copy (e.g. `features/tickets`):

```text
features/tickets
        ↓
src/locales/ar/tickets.js
src/locales/en/tickets.js
        ↓
import tickets from './tickets.js'  (added to both ar/index.js and en/index.js)
        ↓
t('tickets.*')
```

Workflow:

```text
Create feature code
        ↓
Does it own UI copy?
        ↓ yes
Create src/locales/{ar,en}/<feature>.js with export default {...}
        ↓
Register the import + key in src/locales/{ar,en}/index.js
        ↓
Use t('<feature>.*') in components
        ↓
npm run check:i18n        (parity + module registration)
npm run check:hardcoded-text  (advisory: no leftover literals)
npm run lint
        ↓
Verify AR/EN + RTL/LTR visually
```

Do not put new feature copy into `common.js`. `common.js` is reserved for genuinely
generic, cross-cutting strings (see below).

## AR/EN module symmetry

Every module file that exists in `en/` must have an identically-named counterpart in
`ar/`, and vice versa. `npm run check:i18n` enforces this: it reads the file list on
disk for both languages, diffs it, and fails if a module exists on one side only or is
missing from `index.js`.

## `common.js` / `actions.js` / `status.js` — what belongs where

These three are the only truly cross-cutting, non-feature-owned files:

- `actions.js` — generic verbs used across many features: `save`, `cancel`, `delete`,
  `edit`, `search`, `filter`, `export`, `import`, `confirm`, `close`, `back`, `next`,
  `submit`, `logout`.
- `status.js` — shared lead/customer status vocabulary (`new`, `contacted`, `qualified`,
  `won`, `lost`, `active`, `inactive`) used by multiple features' status displays.
- `common.js` — everything else genuinely generic: loading/error/empty states, retry,
  language/theme toggles, am/pm.

If a string is feature-specific wording (even if it looks similar to a generic action),
it belongs in that feature's own file, not here. Do not turn these three files into a
dumping ground — most new copy belongs in a feature-owned module.

## `dataTable.js` and other shared-component modules

Reusable engines/components with enough translation content to justify a dedicated file
get one: `dataTable.js` today. `visualFlow.js`/`visualFlowDemo.js` are the shared Visual
Flow canvas and its demo page respectively — kept separate because they are separate
top-level keys (`visualFlow.*` vs `visualFlowDemo.*`) with independent lifecycles.
Small, one-off shared components without much copy should reuse `actions.js`/`common.js`
keys rather than getting their own file.

## Sub-modularization

None of the current domains are large enough to need splitting further (the largest,
`customers.js` and `workflow.js`, are a few hundred lines each — normal file size). If a
domain grows enough to become unwieldy, the pattern to follow is:

```text
src/locales/en/customers/
├── index.js
├── table.js
├── details.js
├── followUp.js
└── status.js
```

with `en/index.js` importing `customers/index.js` the same way it imports any other
module today, and the public key path (`customers.*`) staying unchanged. Only do this
when a single domain file is genuinely hard to navigate — do not pre-split.

## Dynamic backend data vs. translated UI

Never translate:

- API endpoints, route paths, backend enum values, database values, permission
  identifiers, workflow/node IDs, event names, integration/provider IDs.
- User-entered business data: customer/lead names, notes, messages, task titles,
  proposal content, product names, custom statuses, campaign message content, chat
  messages.

Always translate the application chrome around that data (labels, actions, empty
states, validation, toasts), using a controlled mapping for enum presentation
(`t(\`proposals.page.status.${status}\`, { defaultValue: status })`-style fallback to
the raw value for anything unrecognized).

## RTL / LTR

The app syncs `document.lang`/`dir` globally from the active i18next language (see
`shared/utils/documentLanguage.js`). Individual components should not hardcode
`dir="rtl"`/`dir="ltr"` unless there is a deliberate, documented business reason.

Known deliberate exception: `src/pages/customers/pages/proposals/components/renderer/ProposalRenderer.jsx`'s
root `<article dir="rtl">` — the rendered proposal is a customer-facing business
document, and the CRM operator's UI language is a separate concern from the document's
language. This was a product decision, not a bug; see
`docs/TRANSLATION_MIGRATION_AUDIT.md` for the review note. Do not change it without an
explicit product decision or real document-language metadata.

Mixed-direction values (email, phone, URL, ID, invoice number, coordinates, money
amounts) inside RTL layouts should keep `dir="ltr"` on that specific span, not on the
whole screen.

## Validation / toasts / accessibility / placeholders

All application-owned copy in these categories must be translated:

- Form validation messages (React Hook Form / Zod / manual).
- `toast.success/error/warning/info` calls.
- `window.confirm`/`alert` text.
- `placeholder=`, `aria-label=`, `title=`, `alt=` attributes on application-owned
  elements.

User-entered content and backend error payloads are exempt; map *known* backend error
codes to localized messages where the architecture already supports it, and use a
localized generic fallback for unknown ones.

## Scanner / check commands

```bash
npm run check:i18n            # hard gate: AR/EN leaf-key parity + module registration
npm run check:hardcoded-text  # advisory: raw Arabic-script + conservative English UI literals
npm run check:architecture    # hard gate: shared/ must not import features/
npm run lint
npx vitest run                # includes src/locales/locales.test.js (resource-load regression)
npm run build
npm run check:all             # lint + check:i18n + check:architecture + vitest + build
```

`check:i18n` dynamically imports each language's `index.js`, flattens every leaf key,
and fails on: any AR-only or EN-only key, any empty/non-string leaf value, any module
file on disk not registered in `index.js`, or any `index.js` entry with no matching
file. It no longer depends on the old monolithic `common.json` layout.

`src/locales/locales.test.js` is a focused regression test asserting both languages'
resources assemble without error, every module file is registered on both languages,
nested keys survive composition, and AR/EN leaf-key sets match — this protects against
creating `tickets.js` but forgetting to import it in `ar/index.js` (or vice versa).

## Definition of Done for a translation change

- [ ] Key added to both `{ar,en}/<domain>.js`, same path, non-empty string on both sides.
- [ ] No new hardcoded application UI string (checked in the diff, not just the scanner).
- [ ] `t(...)` used in the component, no raw literal.
- [ ] RTL verified (or inherited correctly — no new forced `dir=`).
- [ ] LTR verified.
- [ ] Validation/toasts/placeholders/accessibility text localized if touched.
- [ ] `npm run check:i18n` passes.
- [ ] `npm run check:hardcoded-text` reviewed (advisory, but don't grow the count silently).
- [ ] `npm run lint`, `npx vitest run`, `npm run build` pass.
