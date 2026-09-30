# features/service/feedback — CSAT (F2)

The server sends the survey when a case is resolved and stores responses (portal/API
`POST /feedback/responses`). The frontend lists and shows them.

| Path | Role |
|---|---|
| `api/feedbackApi.js` | `GET /service/feedback/responses?score=&period=&page=` (+ `meta.summary`). |
| `components/FeedbackList.jsx` | Reports → "Customer feedback" tab: score filter, pagination, case link, comment. |
| `components/CsatScore.jsx` | "4/5 ★" chip (number + icon, tone is secondary). |
| `components/CaseCsatCard.jsx` | Case side panel: `case.csat = { score, comment, responded_at } | null`. |

Comments are customer content: render with `dir="auto"`, never through `t()`.
F6: the list switches between CSAT, NPS (0–10, promoters − detractors) and CES (1–7, average ease + % easy) via
`?survey=`; `components/SurveySummary.jsx` renders NPS/CES. NPS/CES answers belong to a customer (no case). Survey
definitions and quality reviews live in `quality/`.
