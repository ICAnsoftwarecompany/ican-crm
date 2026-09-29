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
NPS/CES and quality reviews arrive in F6.
