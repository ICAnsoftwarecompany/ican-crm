# features/campaigns/meta-wizard — Meta campaign wizard

> **Documentation update:** 2026-10-01 02:35 (Africa/Cairo) — folder created.

**Status:** CURRENT (campaign + ad set publishing live; ads, lead forms and media upload wait for backend endpoints) · **Public API:** `index.js` · **Route:** `/campaigns/:platform/create` via `pages/campaigns/pages/CampaignCreatePage` · **Full guide (Arabic):** [README_AR.md](../../../pages/campaigns/pages/CampaignCreatePage/README_AR.md)

## What it owns

The guided Meta campaign builder: Objective → Campaign → Ad sets → Ads → Review, with a drafts side panel, a guide panel that explains the focused field and lists what is still missing, live validation, Meta-style location targeting, and a resumable publish flow.

## Public API

| Export | Use |
|---|---|
| `MetaCampaignWizard` | The whole wizard. Props: `center` (the Campaign Center context: `tenantId`, `accountId`, `accounts`, `integrations`, `platform`). |
| `validateWizard(state, { pages, currency, timezone })` | Pure validator → list of issues (`code`, `severity`, `stage`, `path`). |
| `buildCampaignPayload` / `buildAdSetPayload` / `buildAdPayload` | Pure payload builders (legacy backend keys + full Meta specs). |
| `WIZARD_DATA_SOURCES`, `WIZARD_PUBLISH_CAPABILITIES` | Which assets are mock/live and which publish steps are enabled. |

## Layout

`config/` (Meta matrices, presets, capabilities) · `domain/` (pure logic: geo, validation, payloads, naming, time, contact formats, reach) · `state/` (reducer, drafts store) · `data/` (API contracts, mock↔live adapter, demo catalog) · `publish/` (resumable plan) · `hooks/` · `context/` · `components/` · `steps/`. Tests sit next to the code; `i18nCoverage.test.js` fails if any key the wizard can request is missing in `locales/{ar,en}/campaignWizard.js`.

## How to extend

- New destination/goal: `config/metaAdSetCompatibility.js` (+ requirements), CTAs in `config/metaCallToActions.js`, translations.
- New quick-start template: `config/campaignPresets.js` + `campaignWizard.presets.<id>`.
- Connect a real data source: implement the endpoint listed in the guide (section 8), then set it to `'live'` in `config/wizardCapabilities.js`.
- Enable ad publishing: implement `POST /api/tenant/facebook/ad/create` and set `createAds: true`.

## Known gaps

Ad/lead-form/media endpoints missing; geo/interest/audience/lead-form/media/pixel/app data is demo data until their endpoints exist (demo location keys are not real Meta keys — countries are); drafts are browser-local; no visual test against a live backend yet.
