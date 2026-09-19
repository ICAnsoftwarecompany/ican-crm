# ICAN CRM — Phase 3 Hardening Report

Status: CURRENT, 2026-09-19. This report independently re-verifies the claims in `ARCHITECTURE_REFACTOR_REPORT.md` (Phase 1/2) against the actual repository, closes explicitly-missing guardrails, adds targeted regression tests, and produces the Customer Service readiness map requested before that module is built. **No Customer Service code was written in this phase.**

## 1. Executive Summary

Phase 1 (architecture placement/boundary rules) and Phase 2 (i18n/RTL/theme sync) were already executed before this phase started — evidenced by `docs/ARCHITECTURE.md`, `docs/ARCHITECTURE_REFACTOR_REPORT.md`, `docs/DEVELOPMENT_ROADMAP.md`, `.eslintrc.cjs`, and `scripts/{check-architecture,check-translations}.mjs`. This phase re-ran every available check against the current tree rather than trusting those reports, confirmed the load-bearing claims (dir/lang sync, shared→feature boundary, translation parity, build/lint/test), found and closed two explicitly-requested but missing guardrails (theme audit, hardcoded-text audit), added 40 new regression tests (28→68) for previously-untested architecture-critical pure logic (tenant resolution, navigation visibility, language/theme sync), and produced the Customer Service readiness map. No API contracts, route URLs, or business logic changed. `docs/UI_COMPLIANCE_AUDIT.md` and `docs/UI_COMPLIANCE_REPORT.md`, referenced by this task's mandatory-reading list, **do not exist in this repository** — recorded as fact, not fabricated.

## 2. Phase 1 Revalidation

| Claim (from `ARCHITECTURE_REFACTOR_REPORT.md`) | Evidence checked | Current status | Action taken |
|---|---|---|---|
| `shared` does not import business features (except 3 documented app-shell exceptions) | Ran `npm run check:architecture` | **PASS** — confirmed, including against all code added since (workflow-engine, outreach-campaigns, visual-flow) | None needed |
| Router preserves existing URLs (`/LeadsCenter`, `/lead/:customerId`, `/activities`, `/campaigns`, `/outreach-campaigns`) | Read `src/app/router/index.jsx` | **CONFIRMED** — all present, plus `/automation` and `/playground/visual-flow` added later in the same spirit (new routes, no renames) | None needed |
| Navigation is config-driven, hidden nav ≠ authorization | Read `src/app/navigation/navigation.config.js`, `navigation.utils.js` | **CONFIRMED** — `isModuleEnabled`/`hasNavigationPermission` return `true` when no backend data exists (verified by new unit tests, see §11) | Added regression tests; no behavior change |
| `MessegeCampaign` (legacy) still imported, cannot be removed | `grep` for importers | **CONFIRMED** — `features/outreach-campaigns` wraps it as documented; zero other consumers found | Classified explicitly below (§6) |
| Meta/integrations ownership overlap is real and unresolved | Read `features/integrations`, `features/meta-integrations` | **CONFIRMED**, still open | Left as-is — no safe migration identified this phase |
| `data-table - Copy` has no source imports, retained as legacy | `grep -rl "data-table - Copy" src` | **CONFIRMED** — zero imports found | Left in place (deletion is a separate, deliberate cleanup decision, not this phase's call) |
| `VITE_API_PASSWORD` is browser-exposed, not a real secret | Read `services/httpClient.js`, `.env.example` | **CONFIRMED** | See §13 |
| Baseline `npm run build` PASS, `npm run lint` FAIL→FIXED, `npx vitest run` PASS (1 file/3 tests) | Re-ran all three | **Build PASS, Lint PASS, Tests PASS (now 9 files/68 tests)** | Added tests (§11) |

**Correction found**: the refactor report's own file-count baseline (740 `src` JS/JSX files, `features` listing 23 domains) is now stale relative to the current tree (774 files, 24 `features` domains including `outreach-campaigns` and `workflow-engine` built after that report). This is expected drift, not an error in the original report — recorded here so the next phase doesn't cite stale numbers as current.

## 3. Phase 2 Revalidation

| Claim | Evidence checked | Current status | Action taken |
|---|---|---|---|
| `App.jsx` syncs `document.lang`/`dir` at startup and on every language change | Read `src/App.jsx` | **CONFIRMED** — `useEffect` calls sync on mount and subscribes to `i18n.on('languageChanged', ...)` | Extracted the pure mapping into `shared/utils/documentLanguage.js` and added tests (previously untestable inline logic) |
| Sidebar no longer duplicates the dir-sync side effect | `grep "documentElement" Sidebar.jsx` | **CONFIRMED** — zero matches; Sidebar's language toggle now only calls `i18n.changeLanguage()` | None needed |
| Translation parity was 559/559 | Ran `npm run check:i18n` | **672/672** now (grew from work done after that report; parity still holds) | None needed — see §7 for full current counts |
| Theme tokens exist for shell surfaces (`--surface`, `--border`, `--text`, etc.) | Read `src/index.css` | **CONFIRMED** present and used in Sidebar/Header/NetworkStatusIndicator | None needed |
| ">2,000 hex color occurrences... global correction cannot be claimed" (theme), "many hardcoded strings... reliable count not established" (i18n) | No tooling existed to produce a real number | **Both now have real, current numbers** — see §7/§8/§9 | **Built `scripts/check-theme.mjs` and `scripts/check-hardcoded-text.mjs`** (did not exist before this phase) |
| Full 4-combination visual QA (AR/EN × Light/Dark) was NOT_VERIFIED | No browser session available with real tenant credentials in this phase either | **Still NOT_VERIFIED for the full authenticated app.** `CODE_VERIFIED` for the mechanisms (dir sync, theme class toggle) via the new unit tests | Documented honestly in §21, not upgraded without evidence |

## 4. Architecture Findings

- **Confirmed, not new**: the Leads/Customers model is genuinely mixed — `features/leads/` and `features/customers/` are separate feature folders with separate APIs (`leadsApi.saveAction/updateTag/getLogs`, `customersApi.createCustomers/updateCustomer/getCustomers`), yet the actual customer record nests a `lead` sub-object (`customer.lead.name`, `.phone`, `.email`, `.status_type_id`) throughout the UI (`CustomersTableColumns.jsx` and elsewhere). This is neither cleanly "separate entities" nor cleanly "one entity with lifecycle states" — it is the mixed/inconsistent case the task explicitly asks to flag. **Marked `ARCHITECTURAL_DECISION_REQUIRED`** — a real backend/product decision is needed before Customer Service work assumes a clean "Customer" entity to attach tickets to.
- **Confirmed, already resolved in code+docs this cycle**: `opportunities` is overloaded. The implemented `/opportunities` route is "Opportunity Center" (AI/system/campaign-detected growth signals, **mock backend only** — `features/opportunities/api/opportunitiesApi.js` has zero `httpClient` calls). A traditional qualified sales-pipeline "Opportunity" entity does not exist in code. `ARCHITECTURE.md` §"Domain boundaries" and `shared/components/layout/SIDEBAR_ARCHITECTURE.md` §"Opportunity Center vs Opportunities" both already state this distinction explicitly and consistently. No further action needed beyond confirming the two docs agree (they do).
- **Confirmed accurate**: Advertising campaigns (`features/campaigns`, `features/meta-integrations`, page `pages/campaigns/CampaignsPage.jsx`, route `/campaigns`) and Outreach/messaging campaigns (`features/outreach-campaigns`, route `/outreach-campaigns`) are correctly kept as separate domains in code, routes, navigation labels, and documentation (`ARCHITECTURE.md`, `OUTREACH_CAMPAIGNS_ARCHITECTURE_AR.md`, `SIDEBAR_ARCHITECTURE.md`). No naming collision found in current navigation config.
- **Confirmed accurate**: Activities is the canonical activity abstraction; `features/call-meetings` is a real, actively-consumed bridge layer (7 external importers found), not dead code. Ownership matches `ARCHITECTURE.md`'s description.
- **No new architecture violations found** in code added since the last report (outreach-campaigns, workflow-engine, visual-flow) — `check:architecture` passes against all of it, and each was independently built to keep `shared/components/visual-flow` fully domain-agnostic (verified by design and by the passing boundary check).

## 5. Architecture Fixes

- Extracted `resolveDocumentLanguageAttributes`/`syncDocumentLanguage` from an inline `App.jsx` closure into `src/shared/utils/documentLanguage.js` — same behavior, now independently unit-tested. This is the only source-code architecture change in this phase; it is a pure extraction (no behavior change, verified by build+tests).
- No files moved, renamed, or deleted. No domain merges. No API or route changes.

## 6. Remaining Legacy Architecture

| Item | Classification | Why it remains |
|---|---|---|
| `features/MessegeCampaign` | **ADAPTER** (wrapped by `features/outreach-campaigns`, per that feature's own documented design) | Actively imported by the canonical outreach hooks; not safe or useful to remove — the outreach feature's domain layer depends on it exactly as `ARCHITECTURE.md` describes |
| `shared/components/data-table - Copy` | **LEGACY** | Zero source imports found (confirmed again this phase); deletion is a deliberate one-line PR for a future pass, not bundled into a hardening phase |
| `features/meta-integrations` vs `features/integrations` overlap | **MIGRATION_TARGET** (no safe migration identified yet) | Both are actively used (Meta OAuth/connection flows vs generic integration listing); consolidating requires a scoped follow-up, not a hardening-phase side effect |
| Large legacy pages (`pages/customers/` = 194 files, `pages/customers/pages/proposals/`) | **HIGH_RISK_LEGACY** | Still route-owned with substantial business logic; no safe, isolated extraction identified this phase without broader test coverage first (see §18 P1) |

## 7. i18n Findings

- **Current key counts**: `ar=672, en=672` (verified via `npm run check:i18n`, which re-parses both JSON resources and checks leaf-key parity + non-empty string values). Up from 559/559 recorded in the prior report, entirely from feature work done since (Outreach Campaigns, Workflow Engine, VisualFlow, Automation Center all added their own namespaces this cycle).
- **Parity: PASS.** No AR-only or EN-only keys, no empty/non-string values.
- **Hardcoded-text reality check (new)**: built `scripts/check-hardcoded-text.mjs` — it found **3,440 lines across 349 files** containing raw Arabic-script literals outside `src/locales/`. This is the first real number this project has had for this (the prior report explicitly said "a reliable count... was not established"). It is deliberately a triage input, not a violations list — it will include intentional `t(key, 'fallback')` defaults alongside genuine hardcoded strings. Heaviest concentrations: `features/call-meetings/*` (several files >80 hits each), `pages/customers/components/CustomersTableColumns.jsx` (79), `pages/customers/CustomersPage.jsx` (62), `features/opportunities/constants/opportunityTypes.js` (51 — mostly legitimate mock/label data, low priority), `shared/components/data-table/DataTable.jsx` (41 — a shared component, higher priority to fix since it affects every table).

## 8. RTL/LTR Findings

- Root-level sync (`document.lang`/`dir`) reconfirmed correct and now unit-tested (§3, §11).
- `ARCHITECTURE.md` already documents that "many feature screens contain forced `dir=\"rtl\"` or physical positioning" — spot-checked and still true; not re-audited screen-by-screen this phase (would require the visual QA pass explicitly marked NOT_VERIFIED in §21, not a code-only exercise).
- No regression found: none of the code added this session (Outreach Campaigns, Workflow Engine, VisualFlow) hardcodes `dir="rtl"` at the root of its own pages (the Outreach Campaigns pages had this bug and it was fixed in-session before this phase started).

## 9. Light/Dark Findings

- Theme store/provider mechanism reconfirmed correct and now unit-tested (§11): `initTheme()` toggles the `dark` class based on persisted `isDark`, in both directions (dark→light restore also verified, addressing a real regression class — "only ever adds dark, never removes it" is a common bug this test now guards against).
- **New theme audit** (`scripts/check-theme.mjs`) found **533 suspect literal-color occurrences** (`bg-white`: 517, `#fff`/`#ffffff`: 11, `#000`/`#000000`: 5) across 716 scanned files — concentrated in `features/activities/*` and `features/call-meetings/*`. This is advisory (exit code 0 always) because the codebase legitimately uses literal colors for brand/status/chart purposes that this heuristic cannot distinguish from an accidental light-only surface — every hit needs human triage, not automatic "fixing."

## 10. Automated Guardrails

| Script | Purpose | Gate type | Status this phase |
|---|---|---|---|
| `npm run lint` | ESLint (`react-hooks` rules + a few safety rules) | **Hard gate** | Verified PASS |
| `npm run check:i18n` | AR/EN key parity + non-empty values | **Hard gate** | Verified PASS (672/672) |
| `npm run check:architecture` | Blocks new `shared → features` imports | **Hard gate** | Verified PASS |
| `npx vitest run` | Unit tests | **Hard gate** | Verified PASS (68/68) |
| `npm run check:theme` | **NEW** — literal light-only color scan | Advisory (exit 0) | Built and run this phase |
| `npm run check:hardcoded-text` | **NEW** — raw Arabic-literal scan outside `locales/` | Advisory (exit 0) | Built and run this phase |
| `npm run check:all` | **NEW** — convenience: lint + i18n + architecture + tests + build in one command | Hard gate (composite) | Added this phase |

Circular-dependency detection (requested in the source task) was **not** added: no existing lightweight tool is already a project dependency, and hand-rolling a dependency-graph analyzer is explicitly discouraged by the task's own instructions ("do not create a custom dependency-analysis framework if existing tooling can do it simply"). Recorded as a P2 recommendation (§18) — e.g. `madge --circular src` as a future devDependency, not built here.

## 11. Tests

Added 5 new test files (40 new tests, 28→68 total), each targeting a priority named in the source task:

- `src/services/tenantResolver.test.js` (13 tests) — hostname parsing, ignored subdomains, dev-host `.nip.io` pattern, `resolveTenantId` field-priority fallback, `requireTenantId` throw behavior.
- `src/shared/utils/documentLanguage.test.js` (5 tests) — the extracted language→`{lang,dir}` resolver and its DOM side effect.
- `src/store/themeStore.test.js` (4 tests) — dark-class toggle in both directions (the "restore light mode" case is the one most bug-prone in naive implementations).
- `src/app/navigation/navigation.utils.test.js` (18 tests) — module/permission gating (explicitly proving no restriction is fabricated when backend data is absent), active-route pattern specificity scoring, section-emptying behavior.
- (Pre-existing, unchanged) `src/features/ai-agent/services/agentPermissions.test.js` (3 tests) and the 4 VisualFlow test files added earlier this session (25 tests: registry, graph utils, flow validation, serialization).

Not added, deliberately: activity/campaign *adapter* tests and DataTable/Workflow-Engine deeper behavior tests named as candidates in the source task — these need either component-rendering infrastructure beyond what a quick jsdom pragma covers, or fixture data not available in this pass. Recorded as P1/P2 in §18.

## 12. Build & Bundle

`npm run build`: **PASS**, 2560 modules, in 26–30s across repeated runs this phase. Output: `index.css` 116.63 kB (gzip 19.21 kB), single `index.js` chunk **2,735.58 kB (gzip 757.40 kB)** — Vite's default 500 kB chunk-size warning fires. No circular-import warnings, no duplicate-dependency warnings emitted by Vite. `dist/` is git-tracked; restored to its committed state after every build performed in this phase (`git checkout -- dist/ && git clean -f dist/`).

Bundle size is a known, already-documented (§15 of the refactor report) item. Root cause is a fully synchronous router (`src/app/router/index.jsx` statically imports every page, including heavy areas like the Workflow Builder/VisualFlow canvas, Proposal Builder, and Analytics) plus `@xyflow/react` added this session. **Not fixed in this phase** — route-level lazy loading of heavy screens (Workflow Builder, VisualFlow demo, Proposal Builder, Analytics, Customer workspace) is a real, safe, high-value improvement but touches every route entry and deserves its own focused pass with route-equivalence verification, which this hardening phase's "small safe changes" discipline argues against bundling in. Recorded as **P1** in §18.

## 13. Security & Configuration

- **`VITE_API_PASSWORD` status**: confirmed **PUBLIC_APPLICATION_IDENTIFIER in practice, not a working secret** — it is a `VITE_*` variable (compiled into the browser bundle, visible to anyone via dev tools/network tab) and is sent as a literal `?api_password=...` query parameter on every single `httpClient` request (`src/services/httpClient.js`) and on the realtime broadcasting-auth endpoint (`src/realtime/echo.js`). `.env.example` ships the literal placeholder value `TenantSecret` (not a real credential — safe to keep in the tracked example file). Renaming it to something like `VITE_API_APP_KEY` to stop implying it is secret, and moving real request authorization fully onto the Bearer token + a backend-issued, rotatable, non-secret app identifier, is a **backend-coordinated change** — not made in this phase, per the task's explicit instruction not to break the API contract.
- **Query-parameter credential exposure**: confirmed real — `api_password` travels in the URL query string on every API and realtime-auth call, meaning it can appear in server access logs, browser history, and any HTTP proxy/monitoring layer that logs full URLs. `src/realtime/echo.js` already masks it before writing to the *console* (`maskValue()`), which reduces accidental local log leakage but does not change what actually goes out over the wire. Classified as **ARCHITECTURAL_RISK** (real, but consistent with the "it's a public identifier, not a secret" finding above — the risk is about URL logging hygiene, not credential theft).
- **Auth token storage**: `src/store/authStore.js` persists `{token, user}` via Zustand's `persist` middleware, which defaults to `localStorage`. This is a common SPA pattern but is a real **ARCHITECTURAL_RISK** (not a `CONFIRMED_VULNERABILITY` — it requires a separate XSS bug to exploit, and none was found this phase) given the multi-tenant subdomain architecture, where a script-injection bug on one tenant's page could read that tenant's token. **HARDENING_RECOMMENDATION**: evaluate httpOnly-cookie-based session handling with the backend team; not implementable frontend-only.
- **`.env` hygiene**: confirmed correct — `.gitignore` excludes `.env`, `.env.local`, `.env.*.local`; only `.env.example` (placeholder values only) is tracked. No real secrets found in the repository.
- No secret values are printed anywhere in this report.

## 14. Documentation Reconciliation

- **Created**: `docs/PHASE_3_HARDENING_REPORT.md` (this file), `docs/FEATURE_DEVELOPMENT_CHECKLIST.md`.
- **Created**: `scripts/check-theme.mjs`, `scripts/check-hardcoded-text.mjs`.
- **Modified**: `package.json` (added `check:theme`, `check:hardcoded-text`, `check:all` scripts), `src/App.jsx` (delegated to extracted util, no behavior change).
- **Created (code, not docs)**: `src/shared/utils/documentLanguage.js` + its test; 4 other new test files (§11).
- **Not modified**: `docs/ARCHITECTURE.md`, `docs/ARCHITECTURE_REFACTOR_REPORT.md`, `docs/DEVELOPMENT_ROADMAP.md`, `README.md`, `README_About_project.md` — every claim in them checked this phase held up against current code (§2, §3), so no correction was warranted. Rewriting an accurate document for style is explicitly out of scope for this phase.
- **Confirmed absent, not fabricated**: `docs/UI_COMPLIANCE_AUDIT.md`, `docs/UI_COMPLIANCE_REPORT.md` — do not exist anywhere in this repository.

## 15. API Compatibility

**No API contracts changed.** No endpoint URL, request payload shape, HTTP method, or query-parameter contract (including the `api_password` mechanism discussed in §13) was modified.

## 16. Route Compatibility

**No route URLs changed, renamed, or removed.** All routes present before this phase remain; the only routes that exist beyond the original baseline (`/outreach-campaigns`, `/automation`, `/playground/visual-flow`) were added earlier this session as net-new features, not modifications to existing URLs.

## 17. Breaking Changes

**None.** The only source-code change in this phase (`App.jsx` delegating to `shared/utils/documentLanguage.js`) is a behavior-preserving extraction, verified by an unchanged build output shape and passing tests.

## 18. Remaining Technical Debt

**P0 — must fix before expansion**
- Leads/Customers data model ambiguity (§4) — **ARCHITECTURAL_DECISION_REQUIRED** before Customer Service can assume a clean "Customer" entity to attach tickets/history to.

**P1 — should fix soon**
- Route-level code splitting for heavy screens (Workflow Builder/VisualFlow/Proposal Builder/Analytics) — bundle is 2.7 MB single-chunk (§12).
- `features/meta-integrations` vs `features/integrations` ownership overlap (§6) — needs a scoped, tested consolidation plan.
- Full 4-combination (AR/EN × Light/Dark) authenticated visual QA — still NOT_VERIFIED at the whole-app level (§21).
- `pages/customers/` (194 files) and the proposal builder remain large, route-owned legacy surfaces (§6) — extraction plan needed, not a blind rewrite.

**P2 — improvement**
- Theme audit findings (533 occurrences, §9) and hardcoded-text findings (3,440 lines, §7) — both now have real numbers; systematic per-feature cleanup is future work, prioritized by the "top files" lists in §7/§9.
- Add `madge --circular` (or equivalent) as a lightweight circular-dependency CI check (§10).
- Extend automated tests to activity/campaign adapters and DataTable/Workflow-Engine deeper behavior (§11).
- `shared/components/data-table - Copy` deletion (§6) — zero-risk but not bundled into this phase.

**P3 — optional cleanup**
- Rename `VITE_API_PASSWORD` → a name that doesn't imply secrecy (§13), once backend coordination exists.
- Reduce `console.log` debugging statements found in some API files during this session's earlier work (e.g. `customersApi.js` logs every response) — cosmetic, not a security or correctness issue, but worth a quiet cleanup pass.

## 19. Customer Service Readiness

| Capability | Existing reusable domain | New domain required | Notes |
|---|---|---|---|
| Customer identity & history | `features/customers`, `features/leads` | — | **Blocked on the P0 model decision in §4** — a ticket needs to know unambiguously what it's attached to |
| Agent ↔ customer communication | `features/conversations` (WhatsApp/Messenger/Gmail already implemented, real APIs) | — | Directly reusable; this is the most mature existing domain for this purpose |
| Follow-up / internal work items | `features/tasks` | — | Directly reusable (`tasksApi` is a real, complete backend already, per this session's Workflow Engine audit) |
| Automation (assignment rules, SLA timers, escalation triggers) | `src/features/workflow-engine` (+ `shared/components/visual-flow`) | Possibly new **Customer Service module definitions** (triggers/actions), not a new engine | The engine is explicitly designed for this — a `customerServiceFlowDefinitions.js` registering `ticket.created`/`ticket.sla_breached`/etc. is the documented extension path; **do not build a second automation system** |
| Team/agent assignment | `features/teams`, `features/users` | — | Directly reusable |
| Notifications | *(none — confirmed no Notifications feature exists anywhere in the codebase, verified this session while building Workflow Engine)* | **New: Notifications** | This gap blocks more than Customer Service alone (Workflow Engine's `notification.send` action is already `backendSupport: false` for the same reason) |
| Calendar / meeting scheduling for support calls | `features/call-meetings` | — | Reusable bridge layer already exists and is actively consumed |
| Support ticket record itself | *(none)* | **New: Tickets domain** | No ticket/case entity, status machine, or API exists anywhere in this codebase today |
| SLA policy & breach tracking | *(none)* | **New: SLA** (likely a sub-concept of Tickets, not standalone) | No timer/SLA infrastructure exists |
| Knowledge Base | *(none)* | **New: Knowledge Base** | No article/content-management domain exists |
| Queues | *(none, but `features/leads` has an assignment-*rules* concept — `leadAssignmentApi` — that is conceptually adjacent)* | **New, or extend lead-assignment concept** | Worth evaluating whether ticket-queue routing can reuse the lead-distribution pattern rather than inventing a third assignment mechanism |
| Customer Service Analytics | `features/analytics` (exists; scope not audited this phase) | Possibly extend | Not deeply inspected this phase — flag for the Customer Service kickoff, not resolved here |

**Bottom line**: Customer Service should be built as a genuinely new **Tickets** (+ SLA, + Knowledge Base, + Queues) domain that *consumes* Customers/Conversations/Tasks/Teams/Users/Workflow-Engine/Call-Meetings rather than duplicating any of them — exactly the model `ARCHITECTURE.md` already states in one sentence ("Customer Service is a navigation area, not a copy of Customers, Tasks, Conversations, or Activities"). The one blocking prerequisite is the Leads/Customers model decision (§4, P0).

## 20. Final Validation

| Check | Result |
|---|---|
| Build | **PASS** (2560 modules, 26–30s, no errors) |
| Lint | **PASS** (zero errors/warnings, whole `src`) |
| Tests | **PASS** (68/68, 9 files) |
| Translation parity | **PASS** (672/672, no empty values) |
| Architecture check | **PASS** (no new `shared → features` imports) |
| i18n hardcoded-text audit | **NOT_AVAILABLE before this phase → NOW AVAILABLE (advisory)**: 3,440 flagged lines |
| Theme audit | **NOT_AVAILABLE before this phase → NOW AVAILABLE (advisory)**: 533 flagged occurrences |

## 21. UI Compliance Matrix

| Combination | Status | Basis |
|---|---|---|
| Arabic + Light | **CODE_VERIFIED** | dir/lang sync mechanism unit-tested; theme-token usage confirmed in shell components; full-app visual pass not performed this phase |
| Arabic + Dark | **CODE_VERIFIED** | Same as above; dark-class toggle unit-tested in both directions |
| English + Light | **CODE_VERIFIED** | Same mechanism, language-independent |
| English + Dark | **CODE_VERIFIED** | Same mechanism, language-independent |
| Desktop | **CODE_VERIFIED** (VISUALLY_VERIFIED for Outreach Campaigns / Workflow Engine / VisualFlow screens specifically, via Playwright earlier this session) | |
| Mobile | **NOT_VERIFIED** this phase | No mobile-viewport browser pass performed in Phase 3 |

Per the task's own instruction, code inspection is not being reported as visual verification — the matrix above says exactly what was and wasn't done, and does not claim `VISUALLY_VERIFIED` for combinations that weren't actually opened in a browser this phase.

## 22. Final Readiness Decision

- **Architecture baseline**: `READY_WITH_KNOWN_DEBT` — boundary rules exist, are automatically enforced, and hold against the entire current tree; the Leads/Customers model ambiguity (P0) is the one blocking item before Customer Service specifically.
- **i18n baseline**: `READY_WITH_KNOWN_DEBT` — parity is enforced and passing (672/672); a large, now-quantified (3,440 lines) backlog of hardcoded strings remains outside the enforced surface.
- **RTL/LTR baseline**: `READY_WITH_KNOWN_DEBT` — the root sync mechanism is correct and tested; per-screen forced-`dir` issues are known to exist (per Phase 1/2's own finding) and were not re-audited screen-by-screen this phase.
- **Theme baseline**: `READY_WITH_KNOWN_DEBT` — the toggle/persistence mechanism is correct and tested; 533 quantified literal-color occurrences remain untriaged.
- **Testing baseline**: `READY_WITH_KNOWN_DEBT` — went from 1 file/3 tests to 9 files/68 tests covering genuinely architecture-critical pure logic; component-level and adapter-level coverage remains thin by design (this phase targeted high-leverage pure logic, not broad coverage).
- **Security baseline**: `READY_WITH_KNOWN_DEBT` — no confirmed vulnerability found; two real, already-understood architectural risks (browser-exposed `api_password`, localStorage-persisted auth token) are documented and require backend coordination to change, not frontend rework.
- **Customer Service architecture readiness**: `NOT_READY` until the P0 Leads/Customers decision is made — everything else in the readiness map (§19) is either directly reusable today or has a clear, non-duplicative extension path.
