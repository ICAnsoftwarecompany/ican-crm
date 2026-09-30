# features/service — Customer Hub (Service Operations)

User-facing name: **Customer Hub / إدارة العملاء**; the code keeps the technical name `service`.

Everything business-related for Customer Service lives here. Start with
[docs/4-CUSTOMER-SERVICE.md](../../../docs/4-CUSTOMER-SERVICE.md) (phases, rules, phase log).

## Map

| Folder | What | Phase | README |
|---|---|---|---|
| `index.js` | Public surface — the only import path for pages and other features | F0 | — |
| `core/` | Transport (mock/live), capabilities & terminology, service-wide UI, constants, utils (`localizeLabel`, `serviceErrors`) | F0 | [core/README.md](core/README.md) |
| `mocks/` | Demo backend: axios adapter, router, in-memory db, industry templates, handlers | F0 | [mocks/README.md](mocks/README.md) |
| `cases/` | Cases: workspace (views, list, board), detail, create, transitions, conversation → case. Queues/types are edited in `settings/` | F1 ✅ | [cases/README.md](cases/README.md) |
| `my-work/` | My Work read model + Service Center counters | F1 ✅ | [my-work/README.md](my-work/README.md) |
| `contacts/` | Contacts & relationships under a customer | F1 ✅ | [contacts/README.md](contacts/README.md) |
| `customer-360/` | Service tab in the customer drawer | F1 ✅ | [customer-360/README.md](customer-360/README.md) |
| `settings/` | Generic settings framework + resource definitions (case types, queues, SLA, calendars, escalation, replies, macros, KB categories) | F2 ✅ | [settings/README.md](settings/README.md) |
| `sla/` | SLA badge and panel (server-computed) | F2 ✅ | [sla/README.md](sla/README.md) |
| `replies/` | Saved reply picker, macro menu | F2 ✅ | [replies/README.md](replies/README.md) |
| `knowledge/` | Knowledge base + suggested articles | F2 ✅ | [knowledge/README.md](knowledge/README.md) |
| `feedback/` | CSAT list, score, case card | F2 ✅ | [feedback/README.md](feedback/README.md) |
| `reports/` | Reports dashboard | F2 ✅ | [reports/README.md](reports/README.md) |
| `saved-views/` | Saved views per entity | F2 ✅ | [saved-views/README.md](saved-views/README.md) |
| `catalog/` | Capability registry UI, item types editor field, catalog items' service config | F3 ✅ | [catalog/README.md](catalog/README.md) |
| `pipelines/` | Pipeline editor (statuses + transitions) | F3 ✅ | [pipelines/README.md](pipelines/README.md) |
| `records/` | Service records (participants, components, entries, documents, timeline) + batches | F3 ✅ | [records/README.md](records/README.md) |
| `assets/` | Assets & warranty | F3 ✅ | [assets/README.md](assets/README.md) |
| `entitlements/` | Entitlements, ledger, case coverage | F3 ✅ | [entitlements/README.md](entitlements/README.md) |
| `contracts/` | Contracts: versions, signatures, amendments | F3 ✅ | [contracts/README.md](contracts/README.md) |
| `handoffs/` | Sales → Service handoff inbox | F3 ✅ | [handoffs/README.md](handoffs/README.md) |
| `setup/` | Setup wizard (industry templates) | F3 ✅ | [setup/README.md](setup/README.md) |
| `billing/` | Payment plans, preview, schedules, payments, collections | F4 | `billing/README.md` |
| `subscriptions/` | Subscription lifecycle | F4 | `subscriptions/README.md` |
| `scheduling/` | Resources, reservations, slots | F4 | `scheduling/README.md` |
| `work-orders/` | Work orders & field visits | F4 | `work-orders/README.md` |
| `deliveries/` | Courier dispatch, proof of delivery, COD remittances | F4 | `deliveries/README.md` |
| `portal-admin/` | Portal accounts, policies, request catalog, branding | F5 | `portal-admin/README.md` |
| `imports/` | CSV import wizard, dry run, error file | F5 | `imports/README.md` |
| `follow-ups/` | Follow-up programs, workspace, manual enroll | F5 | `follow-ups/README.md` |
| `portfolios/` | Customer portfolios and owners | F5 | `portfolios/README.md` |
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
