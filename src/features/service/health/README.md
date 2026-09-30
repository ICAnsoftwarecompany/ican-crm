# health — Customer health score & advanced analytics (F7, spec §45.2, §46.3)

| Piece | Where |
|---|---|
| Health card (score, band, top factors) on the customer drawer Services tab | `components/HealthScoreCard.jsx` |
| At-risk list (lowest scores + biggest reason) on Operations Center and Reports → Advanced | `components/AtRiskCustomers.jsx` |
| Reports → **Advanced**: backlog aging, repeat contact, self-service deflection, AI-agent resolution, workload per agent, follow-up outcomes, at-risk customers | `components/AdvancedReport.jsx` |
| Score math | `mocks/state/healthScore.js` (+ test) |

Score = 75 ± factors, clamped 0–100: open requests, upset open requests (AI sentiment), CSAT average, last NPS,
overdue installments, past-due/suspended subscription, activity in 90 days, follow-up issues. Bands: healthy ≥ 70,
watch 40–69, at risk < 40. It is a **signal**: rules (Workflow Engine) or people act on it; nothing changes by itself.

Endpoints (proposed): `GET /service/customers/{id}/health`, `GET /service/health?band&limit` (+ `meta.counts`),
`GET /service/reports/advanced?period`. Live: computed by a nightly job into a read model (spec §46.1), not on read.
