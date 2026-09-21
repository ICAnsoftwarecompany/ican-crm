# Appearance Settings (Brand Color Customization)

## Overview

Tenant admins can customize two brand colors — **Brand primary** (navy: sidebar,
header, primary buttons) and **Brand accent** (teal: links, focus rings, CTAs, AI
surfaces) — from `/settings/appearance`. Every other brand-family CSS variable
(`--brand-primary-l`, `--brand-accent-soft`, `--ai-color`, `--ai-bg`,
`--ai-border`) is derived automatically from those two picks by one pure
function. Changes apply live across the whole app (no reload) as the picker
moves; a separate **Save** action persists them.

**Key properties:**
- Two color pickers, nothing else directly exposed (see Scope decisions below).
- Live, app-wide preview: `document.documentElement.style` is updated on every
  change, so any element reading `var(--brand-*)`/`var(--ai-*)` — in the
  Settings page's own preview card, in the Settings sidebar's active-item
  highlight, or in a `<Button>` on any other page — updates instantly.
- Reset restores the hex values shipped in `src/index.css` and clears the saved
  customization.
- Save persists to `localStorage` only (see Persistence limitation below).

---

## Step 0 prerequisite: tailwind.config.js

`tailwind.config.js`'s `theme.extend.colors` previously pointed at literal hex
strings (`brand.primary: '#162847'`, etc.). A hex string baked into a compiled
Tailwind class can't be overridden at runtime — only a CSS custom property can.
This was fixed by repointing every brand/surface/status/ai color token to
`var(--token-name)`, and adding the `zIndex` scale, exactly as specified for
this task. `src/index.css`'s `:root`/`.dark` custom properties (the actual
source of truth) were left untouched — they were already correct.

The task brief also referenced "nine named type-scale utility classes" said to
belong in `src/index.css`, but did not include their definitions, and the
appearance feature itself doesn't depend on them. They were not fabricated;
this is a follow-up if the original audit's type-scale work is still wanted.

---

## Where things live

```
src/features/branding/
├── api/brandingApi.js         # load/save/clear localStorage, DEFAULT_BRAND_TOKENS
├── utils/deriveBrandTokens.js # pure hex/HSL math, deriveBrandTokens()
├── hooks/useAppearanceSettings.js  # composes themeStore + toasts for the page
└── index.js                   # public surface

src/store/themeStore.js        # brandPrimary/brandAccent state + applyBrandTokens()
src/app/providers/ThemeProvider.jsx  # calls applyBrandTokens() on mount + on change

src/pages/settings/pages/appearance/AppearanceSettingsPage.jsx  # thin composition layer
src/pages/settings/constants/settingsNavigation.js   # new "Appearance" nav entry
src/app/router/index.jsx       # route: /settings/appearance

src/locales/{ar,en}/branding.js  # branding.appearance.* translation keys
```

The page itself contains no derivation or persistence logic — it reads
`brandPrimary`/`brandAccent`/handlers from `useAppearanceSettings()` and
renders form fields + a live preview built from real components (`Button`,
`StatusBadge`, an AI-card styled with `bg-ai`/`text-ai`).

### State & persistence flow

- `brandPrimary`/`brandAccent` live in `themeStore` (extending the existing
  store rather than adding a second one, per architecture policy) and are
  **excluded** from zustand's own `persist` blob (`partialize`) — dragging a
  picker must never silently persist.
- `setBrandPrimary`/`setBrandAccent` update the store and immediately call
  `applyBrandTokens()`, which derives the dependent tokens and writes all
  seven CSS custom properties onto `document.documentElement.style`.
- `saveBrandTokens()` (store action) writes the current `{brandPrimary,
  brandAccent}` to `localStorage` via `features/branding/api/brandingApi.js`'s
  `saveBrandTokens()` — the only function that will need to change when a real
  backend exists.
- `resetBrandTokens()` restores the shipped defaults, clears the saved
  `localStorage` entry, and re-applies.
- On boot, the store reads `loadBrandTokens()` once for its initial state, and
  `ThemeProvider` calls `applyBrandTokens()` on mount (and again whenever
  `isDark`/`brandPrimary`/`brandAccent` change) — mirroring exactly how it
  already syncs the `.dark` class.

---

## Derivation formulas

All in `features/branding/utils/deriveBrandTokens.js`, pure (hex in, hex out,
no I/O). Each dependent token keeps the source color's hue and saturation and
only changes its HSL lightness:

| Token | Formula |
|---|---|
| `--brand-primary-l` | `primary` lightness **+12 points** (clamped to 100%) |
| `--brand-accent-soft` | `accent` at **92% lightness** (light theme) / **15% lightness** (dark theme) |
| `--ai-color` | = `accent` (identity, matches the existing alias relationship) |
| `--ai-bg` | = `--brand-accent-soft` |
| `--ai-border` | `accent` at **70% lightness** |

`--ai-text` is intentionally **not** derived — it wasn't listed as a dependent
token in scope, and its light/dark contrast pairing works fine independent of
the picked accent.

Note: these formulas reproduce the *shape* of the shipped `src/index.css`
values (verified by re-running the formula against the shipped defaults —
`#162847`/`#00C2CB`), but are not byte-identical to the original hand-tuned
constants (which also varied saturation, not just lightness, in a way that
isn't uniform between light/dark). A single clean formula that has to work for
*any* tenant-picked color can't simultaneously reproduce one specific
hand-tuned pair exactly — the formula was chosen to stay simple, pure, and
literal to the "accent at ~92%/~15%/~70% lightness" wording in the brief,
rather than reverse-engineered pixel-for-pixel from the old constants.

---

## Live-apply: what actually responds today

Setting `--brand-primary`/`--brand-accent`/etc. as CSS custom properties makes
every consumer of `var(--brand-*)` (directly, or via the now-fixed Tailwind
`brand-*`/`ai-*` color tokens) update live. Auditing the codebase found the
named Tailwind classes (`bg-brand-primary`, `text-brand-accent`, …) were
effectively unused — most of the app hardcodes the brand hex directly (e.g.
`bg-[#162847]`), which cannot respond to a runtime variable change no matter
what `tailwind.config.js` says. Fixing all ~138 occurrences app-wide is out of
scope for this task. Two touch points were fixed because the task's own
validation step names them directly:

- **`shared/components/ui/Button.jsx`** — the `primary`/`accent` variants (and
  the shared focus ring) were switched from hardcoded hex to
  `bg-brand-primary`/`bg-brand-accent`/`ring-brand-accent`. This is the single
  most reused component, so this one change makes *every* primary/accent
  button in the app (not just the Settings preview) respond live.
- **`pages/settings/layout/SettingsSidebar.jsx`** — the active-item accent bar
  and icon color were switched from hardcoded `#00C2CB`/`#00A8B0` to
  `bg-brand-accent`/`text-brand-accent`. This is the sidebar directly adjacent
  to this feature, so it's the most natural, low-risk place to prove the
  live-update behavior without touching the semantic `--shell-active` token
  that the *main* app sidebar's active-item highlight actually uses (that
  token is explicitly out of scope — see below).

Everything else that hardcodes the brand hex directly (most pages/components)
will not visually update until it's migrated to the `var()`-backed tokens in a
future pass — this is a pre-existing gap this task surfaced, not a regression.

---

## Scope decisions (deliberately not built)

- **Font family.** Not exposed. Cairo + DM Sans were chosen because both have
  complete, well-hinted Arabic *and* Latin glyph coverage at every weight in
  use; a free-text or any-Google-Font picker risks a tenant landing on a face
  with poor Arabic coverage, breaking the UI for every Arabic-reading user
  with no easy way to notice. If wanted later: a **fixed list of 2–3
  pre-vetted pairings**, each manually checked for Arabic quality — never free
  text.
- **Semantic tokens** (`text`, `text-muted`, `surface`, `surface-2`, `border`,
  `status-*`). Not exposed, and no "advanced" escape hatch was added either.
  These carry the contrast relationships that keep the app legible and
  internally consistent; letting a tenant repaint them individually would
  reintroduce exactly the inconsistency the token system exists to prevent.
- **Spacing / radius.** Skipped entirely — no product reason to expose these
  here.
- **Text size / density.** Not built. If a compact/comfortable toggle is
  wanted later, the simplest safe mechanism is scaling the root `<html>`
  font-size — the type scale is rem-based, so this proportionally scales
  every `text-*` class at once.

---

## Persistence: current limitation and proposed backend contract

`saveBrandTokens(tokens)` in `features/branding/api/brandingApi.js` writes to
`localStorage` under the namespaced key `ican-crm:brand-tokens` today. **This
does not sync the brand to other devices or other users at the same tenant** —
the Settings page's own copy says this explicitly (`persistenceNote` in both
locales), and nothing in the UI claims broader rollout.

Proposed backend contract for closing this gap (frontend work stops at the
`brandingApi.js` boundary — only this file should need to change):

```
GET  /api/tenant/branding
     → { brandPrimary: '#162847', brandAccent: '#00C2CB' }
     (404 or empty body = tenant has no customization → use shipped defaults)

PUT  /api/tenant/branding
     body: { brandPrimary: '#162847', brandAccent: '#00C2CB' }
     → 200 with the saved record
     (validate both as 6-digit hex; tenant-scoped by the authenticated session,
     same as every other tenant-scoped endpoint)
```

`loadBrandTokens()`/`saveBrandTokens()`/`clearBrandTokens()` would become
async (`fetch` via `services/httpClient`) instead of synchronous
`localStorage` calls; `themeStore`'s initial read would move into an
`initBranding()` effect (similar to how auth/tenant state already
bootstraps) instead of running at module-eval time.

---

## Validation

All four commands requested were run against the full working tree and pass:

```
npm run lint             → clean, no errors/warnings
npm run check:i18n       → PASS — ar=2699 keys, en=2699 keys, parity + module registration OK
npm run check:architecture → PASS (existing app-shell composition excepted)
npm run build             → succeeds (pre-existing chunk-size warning only, unrelated to this change)
```

### Manual verification (headless Chromium against the dev server)

Verified both **ar/RTL** and **en/LTR**, and both **light** and **dark** mode:

- Pickers reflect the current value on load (`#162847` / `#00C2CB` on a clean
  browser).
- Moving the accent picker updates, without reload: the live preview's accent
  button, the AI-suggestion card (`--ai-bg`/`--ai-border`/`--ai-color`), *and*
  the Settings sidebar's active-item highlight for "Appearance" (confirmed via
  computed `background-color`, not just visually) — while the `StatusBadge`
  preview correctly does **not** change, matching the semantic-token scope
  decision.
- Moving the primary picker updates the live preview's primary button and
  `--brand-primary-l` (derived, +12 lightness points) app-wide.
- **Reset** restores both CSS variables and the picker inputs to the shipped
  defaults and clears `localStorage`.
- **Save** then reload keeps the customized colors (`localStorage` round-trip
  confirmed).
- A reload with an unsaved, in-progress picker change (no Save click) reverts
  to the shipped defaults — confirming the draft state never leaks into
  persistence.
- RTL layout mirrors correctly (main sidebar and Settings sidebar on the
  reading-start side, preview panel column order flips via CSS grid, no
  hardcoded `dir=`); Arabic and English copy both render from
  `branding.appearance.*` with no hardcoded strings in the new page.
- No console errors in either language/theme combination (only expected
  `404`s from unrelated demo data/avatar requests in the auth-bypassed test
  harness, not from this feature).

Not verified: real cross-device/cross-user sync (out of scope — see
Persistence above) and the ~138 pre-existing hardcoded-hex call sites outside
`Button`/`SettingsSidebar` (pre-existing gap, not a regression from this
change).
