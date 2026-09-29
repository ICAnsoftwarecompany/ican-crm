# features/service/contracts — Contracts (F3)

Spec §27. Contracts are a **shared module** (Sales, Service, Billing use them); the Customer Hub gives it
its first screens: `/service/contracts` and `/service/contracts/:contractId` (Services hub tab).
Contract types are a settings resource (`settings/resources/contractResources.js`, `/contract-types`).

| Path | Role |
|---|---|
| `api/contractsApi.js` | `GET/POST /contracts`, `GET/PATCH /contracts/{id}`, `POST /contracts/{id}/send|sign|activate|terminate|cancel|renew|amendments`, `POST …/amendments/{id}/sign`. |
| `components/ContractsWorkspace.jsx` | Status filter + search + DataTable; new draft. |
| `components/ContractCreateDialog.jsx`, `ContractLinesField.jsx` | Draft with lines (catalog item, qty, unit price, discount). |
| `components/ContractDetailView.jsx` | Lines with fulfillment state, parties, versions, signatures, handoff link. |
| `components/ContractActions.jsx` | Lifecycle buttons per status (`CONTRACT_ACTIONS`); sign / terminate dialogs. |
| `components/ContractAmendments.jsx` | Amendments after signing (add lines / new end date) and signing them. |

Rules (server-enforced, mirrored by the mock):
- Before signing: editing a *sent* contract creates a new version and returns it to draft.
- The signed version is an **immutable snapshot** → `PATCH` answers 409 `CONTRACT_LOCKED`; changes go through amendments.
- Fully signed (customer + company) → `ContractSigned` → the handoff processor runs (see `../handoffs`).
- A signed amendment applies **only the difference** (new lines are handed off; nothing is duplicated).
- Renewal = a new contract with `parent_contract_id`; termination suspends/cancels linked services, never deletes.
- Document builder / PDF (spec §28, generalising the proposals builder) is not in F3.
