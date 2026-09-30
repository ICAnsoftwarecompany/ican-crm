# portfolios — Customer Portfolios (F5, spec §12.5)

A portfolio is a group of customers held by named staff ("Alexandria premium", 800 customers across 4 people). Cases
and follow-ups can route to the **portfolio owner** (see `follow-ups` `assignment.type = portfolio_owner`).

| Piece | Where |
|---|---|
| Settings → Follow-ups → Portfolios | `components/PortfoliosPanel.jsx` (cards + selected portfolio's members) |
| Create / edit (name, owners, criteria) | `components/PortfolioDialog.jsx` |
| Members: add, change owner, remove, rebalance | `components/PortfolioMembers.jsx` |
| API + hooks | `api/portfoliosApi.js` |
| Mock | `mocks/handlers/followUpsHandlers.js` (portfolio section) + test |

## Endpoints

| Call | Status |
|---|---|
| `CRUD /api/tenant/portfolios` (delete → 409 `PORTFOLIO_HAS_MEMBERS` while it has customers) | spec §51 |
| `GET /api/tenant/portfolios/{id}/members?search&owner_id` | proposed |
| `POST /api/tenant/portfolios/{id}/members { customer_ids[], owner_user_id? }` → least-loaded owner by default; 409 `CUSTOMER_IN_PORTFOLIO` | proposed |
| `PATCH /api/tenant/portfolios/{id}/members/{customerId} { owner_user_id }` | proposed |
| `DELETE /api/tenant/portfolios/{id}/members/{customerId}` | proposed |
| `POST /api/tenant/portfolios/{id}/distribute` → even the load across owners, returns `moved` | proposed |

Rules: one portfolio per customer; owners must be listed on the portfolio. `criteria` (city, tier, min value) is
descriptive in this phase — automatic membership by criteria is a server job and not built. Not built: team scoping
(`team_id`), portfolio owner on the customer drawer, `portfolio` record scope in permissions.
