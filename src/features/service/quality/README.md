# quality — Quality reviews & surveys setup (F6, spec §42)

| Piece | Where |
|---|---|
| Reports → **Quality** tab: KPIs (reviews, waiting, quality score, pass rate), review queue, average per criterion, per agent, top root causes, latest reviews, "Run sampling" | `components/QualityWorkspace.jsx` |
| Score a review (0–5 per criterion, weighted total live, pass mark); failing reviews need root cause + corrective action (+ optional preventive) | `components/QualityReviewDrawer.jsx` |
| Case header "Send to quality review" (resolved / closed cases) | `components/SendToQualityButton.jsx` |
| Settings → Quality & surveys: checklists (weighted criteria, weights = 100, pass mark), sampling rules (percent + minimum per agent, request types, only low CSAT), surveys (CSAT / NPS / CES, channel, when, question, low score → open a request) | `settings/resources/qualityResources.js`, `components/CriteriaField.jsx` |
| Math: weighted score, NPS, CES, low-score rule | `mocks/state/qualityScore.js` (+ test) |
| API + hooks | `api/qualityApi.js` |

Surveys results live in `feedback/` (Reports → Customer feedback: CSAT / NPS / CES switch with NPS promoters-passives-
detractors and CES average + % easy). The reports agent table gains a **quality score** column. The portal help page asks
the active NPS / CES question (`GET /api/portal/surveys/active`); an answer at or below the low mark (NPS ≤ 6, CES ≤ 3,
CSAT ≤ 2) runs the survey's action — in the mock it opens a high-priority request (live: Workflow Engine).

## Endpoints (proposed; spec §42 defines tables only)

| Call | Notes |
|---|---|
| `CRUD /service/quality/checklists` | 422 `criteria: weights_100`; delete with reviews → 409 `RESOURCE_IN_USE` |
| `CRUD /service/quality/sampling-rules` | |
| `POST /service/quality/sampling/run` → `{ created }` | idempotent: already-sampled cases count towards each agent's target |
| `GET /service/quality/reviews?status&agent_id`, `POST` (manual `{ subject_id }`, 409 `REVIEW_ALREADY_QUEUED`), `GET|PATCH|DELETE /{id}` | PATCH submits `{ scores, comments, root_cause, corrective_action, preventive_action }` once (409 `REVIEW_DONE`) |
| `GET /service/quality/summary?period` | `{ reviews, pending, average, pass_rate, agents[], criteria[], root_causes[] }` |
| `CRUD /service/feedback/surveys` | `{ type csat|nps|ces, trigger{ event, delay_hours | every_days }, channel, question, low_score_action }` |
| `GET /service/feedback/responses?survey=csat|nps|ces` | `meta.summary` per type |

Not built: sampling on follow-ups / calls (checklists support them), calibration sessions, agent self-view of reviews.
