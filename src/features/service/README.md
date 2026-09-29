# features/service — Customer Service (Service Operations)

Everything business-related for Customer Service lives here. Start with
[docs/4-CUSTOMER-SERVICE.md](../../../docs/4-CUSTOMER-SERVICE.md) (phases, rules, phase log).

## Map

| Folder | What | Phase | README |
|---|---|---|---|
| `index.js` | Public surface — the only import path for pages and other features | F0 | — |
| `core/` | Transport (mock/live), capabilities & terminology, service-wide UI, constants, utils (`localizeLabel`, `serviceErrors`) | F0 | [core/README.md](core/README.md) |
| `mocks/` | Demo backend: axios adapter, router, in-memory db, industry templates, handlers | F0 | [mocks/README.md](mocks/README.md) |
| `cases/` | Cases: workspace (views, list, board), detail, create, transitions, conversation → case. Queues live in case setup until F2 | F1 ✅ | [cases/README.md](cases/README.md) |
| `my-work/` | My Work read model + Service Center counters | F1 ✅ | [my-work/README.md](my-work/README.md) |
| `contacts/` | Contacts & relationships under a customer | F1 ✅ | [contacts/README.md](contacts/README.md) |
| `customer-360/` | Service tab in the customer drawer | F1 ✅ | [customer-360/README.md](customer-360/README.md) |
| `sla/`, `replies/`, `knowledge/`, `feedback/`, `reports/`, `settings/` | Operations (MVP-1) | F2 | added with the code |
| `records/`, `assets/`, `entitlements/`, `contracts/`, `handoffs/` | Service context | F3 | added with the code |
| `billing/`, `scheduling/`, `work-orders/` | Billing & scheduling | F4 | added with the code |
| `portal/`, `imports/`, `follow-ups/`, `portfolios/` | Portal & growth (MVP-2) | F5 | added with the code |
| `quality/`, `templates/` | Knowledge & quality | F6 | added with the code |
| `ai/` | AI | F7 | added with the code |

The authoritative list (with mock/live state) is `core/constants/serviceModules.js`.

## Rules inside this folder

- Sub-modules import each other through relative paths only when the relationship is real
  (e.g. `cases` uses `sla`). Anything used by pages goes through `index.js`.
- Reuse the app's engines: `shared/components/data-table`, `pipeline-board`, `calendar`, `overlays`,
  `features/conversations` (via its `index.js`), `features/tasks`, `features/workflow-engine`.
  Never build a second table, board, dialog or workflow engine here.
- Every API module uses `createServiceApi('<moduleKey>')` — never `httpClient` directly.
- No industry branching. Read `hasFeature()` and `term()` from `core/capabilities`.
- Copy in `src/locales/{ar,en}/service/*`; colors from CSS variables / `sla-*` / `priority-*` tokens.
  `npm run check:service` enforces both.
- Components < ~300 lines; split into hooks + subcomponents.

## Adding a sub-module

Follow [docs/4-CUSTOMER-SERVICE.md → Adding a sub-module](../../../docs/4-CUSTOMER-SERVICE.md#adding-a-sub-module),
create its own `README.md`, and add a row to the table above.
