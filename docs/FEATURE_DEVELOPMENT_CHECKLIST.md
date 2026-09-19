# ICAN CRM — Feature Development Checklist

Status: **CURRENT**. This is the canonical pre-flight/in-flight/pre-merge checklist for every future feature, whether built by a human or an AI coding agent. It operationalizes the [Definition of Done](ARCHITECTURE.md#definition-of-done-mandatory) in `ARCHITECTURE.md` and the priorities in `DEVELOPMENT_ROADMAP.md` — read this file for "what to check right now," read those two for "why."

If you find this checklist missing something a real feature needed, **update this file**, don't create a second one.

---

## Source-of-truth hierarchy

When documentation and code disagree, or two documents disagree with each other, resolve in this order:

1. **Current working code / backend contract** — the repository is the ultimate source of truth, not any report about it.
2. `docs/ARCHITECTURE.md`
3. `docs/DEVELOPMENT_ROADMAP.md`
4. Feature-specific current documentation (e.g. a feature's own `*_ARCHITECTURE_AR.md`)
5. `README_About_project.md`
6. Historical reports (`docs/*_REPORT.md`, `docs/PHASE_*.md`)
7. Legacy/older design docs

**Historical documentation must never override current code.** A report describes what was true when it was written; the repository describes what's true now.

### Document status convention

Every doc that describes implementation state should say which of these it is, explicitly, near the top:

- **CURRENT** — verified code in use.
- **PARTIAL** — some UI/API pieces exist but integration is incomplete.
- **LEGACY** — a maintained compatibility path, not the canonical way to do new work.
- **PLANNED** — not implemented yet.
- **DEPRECATED** — scheduled for removal once consumers migrate off it.

---

## Before coding

Answer these before writing code, not after:

- [ ] **What domain owns this feature?** (`features/<domain>` — check `ARCHITECTURE.md` §"Domain boundaries" for known collision-prone areas: activities/call-meetings, campaigns/outreach-campaigns/MessegeCampaign, integrations/meta-integrations, leads/customers, opportunities.)
- [ ] **Does something similar already exist?** Search `features/`, `shared/components/`, and this repo's own docs before writing a new implementation.
- [ ] **Can shared infrastructure be reused?** DataTable (`shared/components/data-table`, NOT the `- Copy` legacy tree), overlays (`AppModal`/`AppDrawer`/`FormDialog`/`ConfirmDialog`), VisualFlow (`shared/components/visual-flow`) for any node/graph UI, Workflow Engine (`features/workflow-engine`) for any trigger/condition/action automation.
- [ ] **Does it affect routes?** If yes: preserve existing URLs; add new ones following `app/router/index.jsx`'s existing pattern (flat page vs. nested layout).
- [ ] **Does it affect navigation?** Add via `app/navigation/navigation.config.js` only — never hardcode a new item into `Sidebar.jsx`/`Header.jsx` directly.
- [ ] **Does it require a module entitlement?** Use the `module` field on the nav item/section — remember this is UX-only until a real tenant-modules backend exists (see `navigation.utils.js`'s `isModuleEnabled`).
- [ ] **Does it require a permission?** Use the `permission` field — same caveat: it's inert until the backend exposes a real permissions list. **Never fabricate a restriction the backend doesn't enforce.**
- [ ] **Does it affect tenancy?** Check `services/tenantResolver.js` — do not invent a second tenant-resolution mechanism.
- [ ] **Which APIs already exist?** Check the owning feature's `api/*.js` before writing a new endpoint wrapper.
- [ ] **Which translation namespace owns it?** Pick (or create) one `t('domain.*')` namespace, living in matching `src/locales/ar/<domain>.js` and `en/<domain>.js` module files (see `docs/LOCALES_ARCHITECTURE.md`) — don't scatter keys across unrelated namespaces, and don't dump new copy into `common.js`.
- [ ] **Does it support RTL/LTR?** Plan logical properties (`start`/`end`, `ms`/`me`, `ps`/`pe`) from the start, not as a fix-up pass.
- [ ] **Which theme tokens does it use?** `--surface`, `--surface-2`, `--border`, `--text`, `--text-muted` (see `src/index.css`) — not literal `bg-white`/`#fff`/`#000`.

---

## During development

- [ ] Follow the architecture: `features/<domain>` owns business logic, `pages/` composes routes, `shared/` stays domain-agnostic (`shared` must never import from `features`, except the three documented `MainLayout`/`Header`/`PageToolbar` app-shell exceptions — `npm run check:architecture` enforces this).
- [ ] Use canonical APIs — don't create a parallel API wrapper for a domain that already has one.
- [ ] Use existing shared infrastructure — no new DataTable/Calendar/VisualFlow/dialog/drawer implementations without checking `shared/components/` first.
- [ ] No unnecessary duplication — if two features need the same thing, that's a signal it belongs in `shared/` (if domain-agnostic) or as a cross-feature public-API import (if domain-specific).
- [ ] Use i18n for every user-facing string — Arabic **and** English, added together, in the same commit.
- [ ] RTL **and** LTR considered together, not RTL-first-then-forgotten.
- [ ] Light **and** Dark considered together, using semantic tokens.
- [ ] Responsive — desktop, tablet, and mobile layouts, not just desktop.
- [ ] Loading state, empty state, error state — all three, not just the happy path. Reuse `shared/components/data/ResourceState.jsx` and `shared/components/feedback/EmptyState.jsx`/`Skeleton.jsx` where the surface fits that pattern.
- [ ] Permissions considered (even if currently a no-op — see "Before coding").
- [ ] Tenant awareness considered where the feature touches tenant-scoped data.

---

## Before merge / completion

```text
[ ] Correct domain ownership
[ ] No architecture boundary violation           → npm run check:architecture
[ ] No unnecessary duplicate component
[ ] Locale module created/updated (ar/<domain>.js + en/<domain>.js, registered in index.js)
[ ] AR translation added
[ ] EN translation added
[ ] Translation parity + module registration      → npm run check:i18n
[ ] RTL verified
[ ] LTR verified
[ ] Light verified
[ ] Dark verified
[ ] Mobile checked
[ ] Desktop checked
[ ] Loading state handled
[ ] Empty state handled
[ ] Error state handled
[ ] Permissions considered
[ ] Tenant isolation considered
[ ] Build passes                                  → npm run build
[ ] Lint passes                                   → npm run lint
[ ] Relevant tests pass                           → npx vitest run
[ ] Advisory checks reviewed (not blocking, but read the output)
      → npm run check:theme
      → npm run check:hardcoded-text
[ ] Documentation updated when architecture changed
```

Convenience: `npm run check:all` runs lint + i18n parity + architecture + tests + build in one command (does not include the two advisory scripts — run those separately and read their output, since they're triage input, not pass/fail gates).

---

## Adding a brand-new module (e.g. the eventual Customer Service)

1. Inspect related domains and existing APIs — do not assume none exist.
2. Choose ownership under `features/<new-domain>`.
3. Prefer **consuming** existing domains over duplicating them. Before writing a new store/API/UI for something, check whether Customers, Conversations, Activities, Tasks, Teams, Users, or Workflow Engine already covers it (see `docs/PHASE_3_HARDENING_REPORT.md` §19 for the concrete Customer Service readiness map — the same reasoning applies to any future module).
4. Implement API + hooks inside the feature; compose its route page under `pages/`.
5. Add navigation + module/permission metadata (inert placeholders are fine and expected today).
6. Provide both translations from the start.
7. Test RTL/LTR and light/dark.
8. Cover loading/empty/error and tenant behavior.
9. If the module needs automation (triggers/conditions/actions), register definitions with the existing `features/workflow-engine` registry — **do not build a second automation engine.**
10. If the module needs a visual graph/node UI, use `shared/components/visual-flow` — **do not build a second canvas.**

---

## Anti-patterns (do not do these)

- Building a module-specific workflow/automation engine instead of registering definitions with `features/workflow-engine`.
- Building a module-specific node/graph canvas instead of using `shared/components/visual-flow`.
- A new `shared/` component that imports from `features/` (the architecture check will fail the build).
- Treating a hidden navigation item as if it were real authorization — it isn't, until the backend enforces it too.
- Renaming a backend enum value to "look nicer" in the UI — translate the **label**, never change the value sent to/received from the backend.
- Copying `shared/components/data-table - Copy` as a starting point for anything — it is legacy and unimported; use `shared/components/data-table`.
- Adding a translation key to only one language file "to fix it later."
- Assuming `VITE_API_PASSWORD` can be hidden by moving it around in the frontend — anything `VITE_*` is public in the shipped bundle, full stop.
