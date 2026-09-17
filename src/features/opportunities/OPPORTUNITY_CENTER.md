# Opportunity Center

## Overview

Opportunity Center is a UI-first module that surfaces sales opportunities detected across the CRM — cross-sell, upsell, renewal, reactivation, buying intent, campaign engagement, referrals, and more. This first pass ships with fully static mock data so the whole experience (Overview, Inbox, Table, Drawer, actions) can be reviewed and iterated on before any backend detection engine exists.

The module is intentionally isolated from `/LeadsCenter`: an opportunity is a sales signal about an existing customer or lead, not a person/company record by itself, so it lives at its own route, `/opportunities`, next to `/LeadsCenter` and `/campaigns` in the main sidebar.

## Goals

- Give sales reps and managers one place to see, prioritize, and act on sales opportunities.
- Make the "why" behind every opportunity explicit (`reason_summary` + signals), not just a score.
- Keep `AI Confidence` and `Score` visually and conceptually separate — Score measures the opportunity itself (fit/intent/engagement/timing), AI Confidence measures how sure the AI is about the *source* signal, and only exists when the opportunity came from an AI-detected signal.
- Design the data/API contract now so a real backend can be swapped in later by editing a single file (`api/opportunitiesApi.js`), with zero changes to hooks, components, or pages.

## Domain Model

- **Opportunity**: the core record — type, status, priority, score, estimated value, the customer/lead it belongs to, who it's assigned to, and its next action.
- **Signal**: one piece of evidence that contributed to the opportunity being detected or its score changing (an AI conversation snippet, a segment match, a campaign event, a manual note, a call/meeting report).
- **Timeline Event**: an audit trail entry (detected, signal added, score changed, assigned, status changed, note added) shown in the drawer's activity log.

Full field-by-field shape lives in `mock/opportunitiesMockData.js` and mirrors exactly what `getOpportunities`/`getOpportunityInfo` are expected to return from a real API.

## User Flow

1. User opens `/opportunities`.
2. **Overview** tab shows aggregate stats, potential revenue, top 5 opportunities by score, and source distribution.
3. **Inbox** tab groups opportunities into actionable buckets (High Potential, Needs Review, Needs Attention, AI Suggested, System Detected, Campaign Generated, Watching).
4. **Table** tab shows every opportunity in the shared `DataTable` component with full filtering/sorting/export.
5. Clicking any opportunity row/card anywhere opens the same `OpportunityDrawer`, driven by a single opportunity id.
6. Inside the drawer, the user can Dismiss, Watch, Qualify, Activate, or (re)Assign the opportunity. Every action updates the shared React Query cache immediately, so Overview/Inbox/Table reflect the change without a refetch.

## Folder Structure

```txt
src/features/opportunities/
  api/
    opportunitiesApi.js          # Mock-backed API layer (swap this file only)
  mock/
    opportunitiesMockData.js     # 10 static opportunities covering every status/type/source
  hooks/
    useOpportunities.js          # useOpportunities, useOpportunityInfo, useOpportunityMutations
  store/
    opportunityDrawerStore.js    # Zustand store: which opportunity id is open in the drawer
  utils/
    opportunityFormatters.js     # Labels, currency/date/relative-time formatting, score helpers
  constants/
    opportunityTypes.js          # Types, statuses, priorities, sources, signal types, dismiss reasons
  OPPORTUNITY_CENTER.md

src/pages/opportunities/
  OpportunityCenterPage.jsx      # Tabs: Overview / Inbox / Table + mounts the Drawer once
  components/
    OpportunityOverview.jsx
    OpportunityInbox.jsx
    OpportunitiesTable.jsx
    OpportunityDrawer/
      OpportunityDrawer.jsx
      OpportunityDrawerHeader.jsx
      OpportunityWhySection.jsx
      OpportunitySignalsList.jsx
      OpportunityCustomerCard.jsx
      OpportunityActivityTimeline.jsx
      OpportunityScoreBreakdown.jsx
      OpportunityActionsBar.jsx
      dialogs/
        ActivateOpportunityDialog.jsx
        WatchOpportunityDialog.jsx
        DismissOpportunityDialog.jsx
        AssignOpportunityDialog.jsx
```

## Routes

- `/opportunities` — single page, internal tabs (no nested routing/sidebar, unlike Customers/Settings).

## Reused Components (nothing new built for these)

- `DataTable` (`shared/components/data-table`) for the Opportunities Table, including its built-in advanced filters (`select`/`number`/`date` filter types) and Excel export.
- `AppDrawer` (`shared/components/overlays/AppDrawer`) for the Opportunity Drawer.
- `FormDialog` (`shared/components/overlays/FormDialog`) for all four action dialogs.
- `Button`, `Badge`, `Input`, `Select`, `Avatar` from `shared/components/ui/`.
- `ResourceState`, `PageToolbar` from `shared/components/data/`.
- `useUsers` / `useTeams` from `features/teams/hooks/useTeams` for the Assign/Activate dialogs — no separate mock users/teams list was created since these hooks and their APIs already exist and work.

## API Layer (Mock Today)

`src/features/opportunities/api/opportunitiesApi.js` exposes:

- `getOpportunities(params)` → `{ data: Opportunity[] }`
- `getOpportunityInfo(id)` → `{ data: Opportunity | null }`
- `qualifyOpportunity(id)` → `{ data: { id, status: 'qualified' } }`
- `activateOpportunity(id, payload)` → `{ data: { id, status: 'activated', ...payload } }`
- `watchOpportunity(id, payload)` → `{ data: { id, status: 'watching', watch_until, watch_reason } }`
- `dismissOpportunity(id, payload)` → `{ data: { id, status: 'dismissed', dismiss_reason, dismiss_note } }`
- `assignOpportunity(id, payload)` → `{ data: { id, assigned_user, assigned_team } }`

Every function returns a `Promise` shaped exactly like an axios response body (`{ data }`) with an artificial delay, so swapping the body for `httpClient.get/post(...)` later requires no caller changes.

## Hooks

`src/features/opportunities/hooks/useOpportunities.js`:

- `useOpportunities(params?, options?)` — React Query list, keyed on `QUERY_KEYS.opportunities.list(params)`.
- `useOpportunityInfo(id, options?)` — reads the opportunity from the **same list cache** `useOpportunities` populates (no second network call), so the drawer, table, and inbox are always in sync with a single source of truth.
- `useOpportunityMutations()` — `qualify`, `activate`, `watch`, `dismiss`, `assign`. Each mutation calls the corresponding API function then patches the opportunity directly in the list's React Query cache via `queryClient.setQueryData`, appending a synthetic timeline event. This is what makes every screen update instantly after an action.

## React Query Keys

Added to `src/shared/constants/queryKeys.js` under `opportunities`:

```js
opportunities: {
  all: ['opportunities'],
  list: (filters) => ['opportunities', 'list', filters],
  detail: (id) => ['opportunities', 'detail', id],
},
```

## Score vs AI Confidence

- **Score** (`score.total`, out of 100, broken down into `fit`/`intent`/`engagement`/`timing`) always exists and measures how good the opportunity itself is.
- **AI Confidence** (`ai_confidence`, 0–100 or `null`) only exists when `source.type === 'ai'` and measures how confident the AI model is in the *signal* it detected. The drawer's Score Breakdown section renders these as two visually distinct blocks — a progress-bar group for Score components, and a separate boxed callout for AI Confidence (or an explicit "not applicable" note when the source isn't AI) — so they can never be read as the same number.

## Inbox Grouping Logic

All groups are computed client-side from the same opportunity list (no separate API):

| Group | Rule |
|---|---|
| High Potential | `score.total >= 80` |
| Needs Review | `status === 'reviewing'` |
| Needs Attention | `next_action.due_at` is in the past and status isn't `activated`/`dismissed`/`expired` |
| AI Suggested | `source.type === 'ai'` |
| System Detected | `source.type === 'system_rule'` |
| Campaign Generated | `source.type === 'campaign'` |
| Watching | `status === 'watching'` |

Dismissed/expired opportunities are excluded from every Inbox group.

## Known Scope Limits (by design, this pass)

- No workflow/automation builder — Qualify/Activate/Watch/Dismiss change status directly in mock state.
- No real detection engine — all 10 opportunities are static fixtures covering every type/status/source combination.
- No dynamic segment engine.
- No real Proposal Builder or Tasks linking yet — the customer profile link is functional (`/lead/:id`), but Proposal/Task actions were intentionally left out of the Actions Bar for this pass.
- No complex bulk actions or opportunity merge.
- No dedicated module settings page.

## Backend Enhancements Required

This section lists exactly what the backend needs to implement to replace the mock layer, based 1:1 on the shapes already used by the frontend.

### Endpoints

| Method | Path (suggested) | Purpose |
|---|---|---|
| GET | `/api/tenant/opportunities` | List opportunities (supports `status`, `type`, `priority`, `source`, `search`, pagination params) |
| GET | `/api/tenant/opportunities/{id}` | Single opportunity with `signals` and `timeline` populated |
| PATCH | `/api/tenant/opportunities/{id}/qualify` | Move an opportunity to `qualified` |
| PATCH | `/api/tenant/opportunities/{id}/activate` | Move to `activated`, accepts the Activate payload below |
| PATCH | `/api/tenant/opportunities/{id}/watch` | Move to `watching`, accepts `watch_until` + `reason` |
| PATCH | `/api/tenant/opportunities/{id}/dismiss` | Move to `dismissed`, accepts `reason` (enum) + optional `note` |
| POST | `/api/tenant/opportunities/{id}/assign` | Update `assigned_user` / `assigned_team` without changing status |

### Response Shape — `GET /api/tenant/opportunities` and `GET /api/tenant/opportunities/{id}`

```json
{
  "data": {
    "id": "opp_001",
    "title": "string",
    "type": "new_sale | cross_sell | upsell | expansion | renewal | reactivation | buying_intent | campaign_engagement | referral | other",
    "status": "new | reviewing | watching | qualified | activated | dismissed | expired",
    "priority": "high | medium | low",
    "product": { "id": "string", "name": "string" },
    "customer": {
      "id": "string",
      "name": "string",
      "industry": "string",
      "employees_count": 0,
      "current_products": ["string"]
    },
    "lead_id": "string | null",
    "score": { "total": 0, "fit": 0, "intent": 0, "engagement": 0, "timing": 0 },
    "ai_confidence": "number | null",
    "estimated_value": 0,
    "currency": "EGP",
    "source": { "type": "ai | system_rule | segment | campaign | conversation | call | meeting | customer_service | manual | other", "label": "string" },
    "reason_summary": "string",
    "assigned_user": { "id": "string", "name": "string" } ,
    "assigned_team": { "id": "string", "name": "string" },
    "next_action": { "label": "string", "due_at": "ISO8601" } ,
    "watch_until": "ISO8601 | null",
    "detected_at": "ISO8601",
    "updated_at": "ISO8601",
    "signals": [
      {
        "id": "string",
        "type": "ai_conversation | segment_match | campaign_event | manual_note | call_report | meeting_report",
        "label": "string",
        "reason": "string",
        "evidence": "string | null",
        "score_contribution": 0,
        "confidence": "number | null",
        "detected_at": "ISO8601"
      }
    ],
    "timeline": [
      {
        "id": "string",
        "type": "detected | signal_added | score_changed | assigned | status_changed | note_added",
        "label": "string",
        "meta": {},
        "actor": { "id": "string", "name": "string" },
        "at": "ISO8601"
      }
    ]
  }
}
```

### Request Payload — Activate

```json
{
  "estimated_value": 35000,
  "assigned_user": { "id": "user_9", "name": "أحمد محمد" },
  "assigned_team": { "id": "team_2", "name": "Enterprise Sales" },
  "next_action": { "label": "Call Customer", "due_at": "2026-09-19T11:00:00" }
}
```

### Request Payload — Watch

```json
{ "watch_until": "2026-10-05", "reason": "string | null" }
```

### Request Payload — Dismiss

```json
{
  "reason": "not_relevant | wrong_recommendation | already_purchased | no_need | bad_timing | no_budget | duplicate | customer_not_eligible | wrong_product | other",
  "note": "string | null"
}
```

### Request Payload — Assign

```json
{
  "assigned_user": { "id": "string", "name": "string" } ,
  "assigned_team": { "id": "string", "name": "string" }
}
```

### Other backend work

- A detection engine that actually creates/updates opportunities and their `signals` (AI conversations, segment rules, campaign events, manual notes, call/meeting reports) — today these are hand-written fixtures.
- Score computation service for `fit`/`intent`/`engagement`/`timing` plus the `ai_confidence` value for AI-sourced opportunities.
- `expired` status automation (e.g. auto-expire opportunities with no activity for N days, as modeled by `opp_010` in the mock data).
- Realtime push for new/updated opportunities, following the same pattern as `features/notifications` and `realtime/`, so Overview/Inbox/Table update live instead of only reflecting actions taken in the current tab.
- Real filtering/sorting/pagination on `GET /api/tenant/opportunities` once opportunity volume grows beyond what client-side `DataTable` filtering can comfortably handle.

## Future Roadmap

- Server-side detection engine replacing the static mock list.
- Real-time updates for new opportunities (reuse `features/notifications` + `realtime/` patterns).
- Bulk actions (assign team, watch, dismiss) from the Table's selected rows.
- Functional links from the drawer into Proposal Builder ("turn this opportunity into a proposal") and Tasks ("create a follow-up task").
- Saved Inbox views / custom grouping rules per user.
- Permission-based visibility of actions and data (who can Activate/Dismiss vs just view).
