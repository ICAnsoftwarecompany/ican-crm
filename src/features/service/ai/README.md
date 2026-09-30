# ai — AI layer (F7, spec §45)

**Rule (spec §45.1):** AI gives *signals, suggestions, classifications and summaries*; **rules and people decide**.
Nothing in this module changes a case by itself — every suggestion needs a click, and accept / dismiss is sent back as
feedback (acceptance rates show in settings).

| Piece | Where |
|---|---|
| Signals on a case (`ai_signals`: sentiment, urgency, sensitive topics) | `components/AiSignalChips.jsx` (case header) |
| Case assistant: triage suggestion (type + priority + confidence + reasons), summary, possible duplicates (close as duplicate), who could take it | `components/AiCasePanel.jsx`, `AiSummary.jsx`, `AiDuplicates.jsx` (case detail side panel) |
| Draft reply grounded on published KB (same language only), never auto-sent; blocked topics give no draft | `components/AiDraftReplyButton.jsx` (case composer) |
| Triage while creating a case | `components/AiTriageHint.jsx` (case create dialog) |
| Settings → AI: feature switches, tone, reply language, auto-reply (off by default, min confidence, max per conversation), handoff topics, blocked words, monthly limit + usage | `components/AiSettingsPanel.jsx`, `AiUsageCard.jsx` |
| AI agent (portal chat + test console) and customer health score | F7b — see `agent/` notes below when added |
| API + hooks | `api/aiApi.js` |
| Demo engine | `mocks/state/aiEngine.js` (+ test): deterministic Arabic/English keyword logic, so screens and tests are stable. The live server calls the model (provider is open in the spec). |

## Endpoints (all proposed — spec §45 has no API list)

| Call | Notes |
|---|---|
| `GET|PUT /service/ai/settings`, `GET /service/ai/usage` | usage = month, used, limit, counts per feature, acceptance % |
| `POST /service/ai/triage { subject, description }` | `{ type_id, priority, confidence, reasons[], signals }` |
| `GET /service/cases/{id}/ai/insights` | `{ triage (+ differs), features }` |
| `POST /service/cases/{id}/ai/summary` | keyed facts `{ ask, customer_messages, replies, notes, last_customer_message, last_reply, waiting_on, signals, generated_at }`, stored as `ai_summary` |
| `POST /service/cases/{id}/ai/suggest-reply { language }` | `{ body, confidence, sources[{ id, title, version }], blocked, topic? }` |
| `GET /service/cases/{id}/ai/duplicates`, `GET …/ai/assignment` | ranked suggestions with reasons |
| `POST /service/cases/{id}/ai/feedback { feature, accepted }` | |
| `POST /service/cases/{id}/mark-duplicate { of_case_id, version }` | closes with resolution `duplicate`, links both cases |

Errors: 403 `FEATURE_DISABLED` (feature off), 429 `AI_LIMIT_REACHED` (monthly limit). Case lists and details carry
`ai_signals` (the mock computes them on read; the server stores them when a message arrives).

Not built: conversation and handoff summaries, sentiment from inbound WhatsApp messages in real time, document
extraction, per-agent AI analytics.
