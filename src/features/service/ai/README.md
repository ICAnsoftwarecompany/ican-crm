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
| AI agent: staff test console (one customer's data, no case, nothing sent) + conversation monitor (handled / handed over, reason, linked case) | `components/AiAgentPanel.jsx`, `AgentChatLog.jsx` (Settings → AI agent) |
| Portal assistant chat (quick questions, always "talk to a person") | `features/portal/components/assistant/PortalAssistant.jsx` (shown when `publicSettings.ai_agent`) |
| Customer health score, at-risk list, advanced analytics | `features/service/health/` (see its README) |
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

## AI agent (spec §45.3)

Engine: `mocks/state/aiAgent.js` (+ test). Tools only, scoped to one customer: `read_records`, `read_schedule`,
`read_cases`, `search_kb` (customer/public, published), `handoff_to_human`. Hand over when the customer asks, on
handoff topics (money / complaint / cancellation — settings), on blocked words, or after two unsure answers. A handover
opens a case with the transcript and an internal note by `author.type = ai`; the conversation keeps `case` +
`handoff_reason`. Auto-replies in WhatsApp stay off unless `auto_reply.enabled` (and never below `min_confidence`).

| Call | Notes |
|---|---|
| `POST /api/portal/assistant/messages { message, conversation_id?, language? }` → conversation | portal token; permission `case` |
| `GET /service/ai/agent/conversations?status=ai|handed_off` (+ `summary`), `GET …/{id}` | staff monitor |
| `POST /service/ai/agent/test { customer_id, message, conversation_id? }` | never opens a case |

Not built: conversation and handoff summaries, sentiment from inbound WhatsApp messages in real time, document
extraction, per-agent AI analytics.
