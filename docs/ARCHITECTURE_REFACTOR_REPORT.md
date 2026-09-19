# ICAN CRM Architecture Stabilization Report

Status: CURRENT audit and incremental stabilization, 2026-09-18. This is **not** a claim that every route, translated string or theme state is fully migrated. The requested full-system visual QA and large-scale page migration remain open.

## 1. Executive Summary

Mapped the source tree and route/domain ownership, established enforceable placement/i18n/theme rules, repaired central language-direction and theme synchronization, localized selected app-shell labels, and restored a working lint command. No business APIs or public route URLs were changed.

## 2. Repository Audit

Before changes: 803 repository files outside build/dependencies in the sampled file inventory; 740 `src` JS/JSX files. `features` covers activities, AI agent, analytics, auth, call-meetings, campaigns, conversations, customers, definitions, integrations, internal-chat, leads, meetings, legacy message campaigns, Meta integrations, notifications, opportunities, outreach, products, proposals, tasks, teams, users and workflow engine. `pages/customers` alone contained 194 files; `shared/components` contained 167. Router is a single registry (`app/router/index.jsx`), navigation is config-driven, APIs live mainly in features, and application state is in three Zustand stores. React Query and realtime support server events; tenant resolution spans services and the dev proxy. Existing tests: one AI permission test file with three tests.

Baseline `npm run build`: PASS with a large-chunk warning; baseline `npm run lint`: FAIL (`eslint` executable missing); baseline `npm test -- --run`: entered Vitest watch mode, three tests passed but needed manual termination. The proper finite test command is `npx vitest run`.

## 3. Architecture Problems Found

| Problem | Location | Risk | Resolution | Status |
| --- | --- | --- | --- | --- |
| Large route-owned domain UI | `pages/customers`, proposals, outreach pages | Hard to discover/reuse | New ownership rules and incremental roadmap | OPEN |
| Shared imports business features | `shared/components/layout/{MainLayout,Header}`, `shared/components/data/PageToolbar` | Inverted boundary | Documented existing app-shell exceptions; guard blocks new examples | OPEN migration |
| Complete duplicate DataTable tree | `shared/components/data-table - Copy` | Divergence/confusion | Canonical table documented; no source imports detected | LEGACY, retained |
| Meetings/calls bridge | `features/activities`, `features/call-meetings` | Ambiguous long-term owner | Adapter-first migration direction documented | OPEN |
| Ads vs messaging campaign names | `features/campaigns`, `features/outreach-campaigns`, `features/MessegeCampaign` | Incorrect model merging | Explicit domains/legacy adapter path documented | CURRENT/LEGACY |
| Meta/integrations overlap | `features/meta-integrations`, `features/integrations` | Duplicate ownership | Ownership review prioritized | OPEN |
| Browser-exposed `VITE_API_PASSWORD` | `services/httpClient.js`, realtime | Cannot be a secret | Security warning documented; backend contract preserved | OPEN backend work |
| No route permission guards | `app/router/PrivateRoute` | Nav hiding mistaken for authorization | Frontend/backend responsibility documented | OPEN |
| ESLint command without tool/config | `package.json` | No reliable lint result | Installed ESLint and hooks plugin; added minimal configuration | FIXED |
| Unreachable alternate reaction rendering | `FloatingChatMessages.jsx` | Dead code/lint error | Removed unreachable branch only | FIXED |

## 4. Architecture Changes

No source folders or business files moved, renamed, or deleted; no domain adapter or route/navigation configuration changed. `README_About_project.md` and root `README.md` were replaced with verified current inventories. Added `docs/ARCHITECTURE.md`, `docs/DEVELOPMENT_ROADMAP.md`, `.eslintrc.cjs`, `scripts/check-architecture.mjs`, `scripts/check-translations.mjs` and package scripts. `shared/components/data-table` is designated canonical; the copy is retained for deliberate cleanup. Existing campaign API adapter remains intact.

## 5. i18n Audit

Inventory: 740 JS/JSX source files, two locale JSON resources. Parsed leaf key parity was 546/546 before and 559/559 after; 13 keys per language added for app shell, 404 and network status. Replaced visible labels in Header, 404 and network status. `App.jsx` now synchronizes document `lang` and `dir` at startup and every i18n language change, including restored language. `npm run check:i18n` checks resource parsing and leaf-key parity. This does **not** prove every key is used, detect duplicate JSON keys, or identify all hardcoded strings. A repository-wide text search found many Arabic/English literals in feature UI; a reliable count of unique user-facing strings was not established. Remaining translations require per-feature review, particularly customer, proposal, conversations and activity interfaces. Backend enum values were not changed.

## 6. RTL/LTR Audit

The root document now receives Arabic/RTL and English/LTR even when language comes from local storage; Sidebar no longer duplicates this side effect. Core shell uses logical `start/end`, but many feature screens contain forced `dir="rtl"` or physical positioning. No full interaction matrix was run; proposal builder and other fixed-RTL views remain known risks.

## 7. Dark Mode Audit

Reviewed root theme store/provider, CSS tokens, Sidebar, Header and network indicator. Added shell surface/hover/active tokens for both themes; converted major shell backgrounds, borders and foregrounds to semantic variables. ThemeProvider now synchronizes the root dark class with persisted state changes, including restoring light. A source search returned more than 2,000 occurrences of hex colors in JSX (including intentional brand/status colors), so global correction cannot be claimed. Network bars and other nested controls, dialogs, DataTable, calendar, workflow canvas, proposal builder and integrations still need visual contrast/state inspection.

## 8. Documentation

Created `docs/ARCHITECTURE.md`, `docs/DEVELOPMENT_ROADMAP.md`, this report; updated/replaced `README_About_project.md` and `README.md` to distinguish CURRENT, PARTIAL, LEGACY and PLANNED. Existing feature-specific docs remain as historical/contextual material, not guaranteed current production truth.

## 9. Legacy Code

`data-table - Copy` retained because it is a full historical tree; no imports from `src` detected, but deletion was outside this safe stabilization pass. `MessegeCampaign` is actively imported by outreach hooks and cannot be removed. Existing customer/proposal route implementations and separate Meta integration layers remain until consumer-by-consumer migration and regression tests.

## 10. Breaking Changes

No intentional API, route or component export breaking changes. The documented stricter standards apply to new work; the new dependency check explicitly exempts existing app-shell composition. ESLint now performs basic syntax-safety checks but does not enforce all React or accessibility rules.

## 11. API Compatibility

Tenant URL, bearer token, `api_password`, realtime and endpoint payload contracts were preserved. The browser-exposed password risk was not silently masked or changed.

## 12. Route Compatibility

No URLs were renamed or removed. The same router tree remains; 404 text is now localized.

## 13. Validation Results

| Check | Result | Detail |
| --- | --- | --- |
| `npm run build` | PASS | 2356 modules transformed; 2,497.11 kB JS output with large-chunk warning |
| `npm run lint` | PASS | Minimal ESLint config; no comprehensive semantic lint rules yet |
| `npx vitest run` | PASS | 1 file / 3 AI permission tests |
| `npm run check:i18n` | PASS | 559/559 parsed leaf keys |
| `npm run check:architecture` | PASS | No new shared -> features import outside listed app-shell exceptions |

## 14. Translation / Theme Matrix

| Language | Direction | Light | Dark |
| --- | --- | --- | --- |
| Arabic | RTL | Code path inspected; visual NOT VERIFIED | Code path inspected; visual NOT VERIFIED |
| English | LTR | Code path inspected; visual NOT VERIFIED | Code path inspected; visual NOT VERIFIED |

Desktop/tablet/mobile authenticated route matrix: NOT VERIFIED. No credentials or backend fixture were supplied for representative end-to-end browser inspection. Do not interpret build success as visual QA.

## 15. Remaining Technical Debt

Large route components and duplicate table tree; shared app-shell/domain coupling; incomplete per-screen i18n/RTL/dark coverage; client-visible `api_password` contract and persisted token security; incomplete permission/feature-flag route enforcement; only one test file; 2.5 MB-class bundle; workflow backend not connected. `npm install` reported 16 dependency audit advisories (3 low, 6 moderate, 6 high, 1 critical); no automated security update was applied because dependency changes need compatibility review.

## 16. Recommended Next Steps

Prioritize backend credential/authorization contract, representative four-combination browser QA, customer/proposal/outreach translations and dark states, app-shell ownership migration, activity and campaign adapter tests, then route lazy loading and duplicate table cleanup. Use the permanent [roadmap](DEVELOPMENT_ROADMAP.md) for sequencing.

## 17. Architecture Compliance Checklist

New work must use the correct domain owner, avoid shared-to-feature imports and duplicate engines, preserve tenant/API/route behavior, include Arabic/English labels with RTL/LTR, pass light/dark/responsive checks, account for authorization, handle loading/empty/error states, and pass build/lint/relevant tests. This policy is mandatory even while older screens remain transitional.
