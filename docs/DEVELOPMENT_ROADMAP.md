# ICAN CRM Engineering Roadmap (CURRENT policy)

Architecture compliance, translation/RTL support and dark-mode support are mandatory project-wide requirements. They are part of initial implementation, not optional polish.

## Every change

Before implementation: inspect related domains, existing shared UI/APIs/adapters and ownership; check routes, nav modules/permissions and tenant scope; name translation keys; plan both directions and both themes. During implementation: preserve API contracts and URLs, reuse the existing engine/components and i18next/theme infrastructure, avoid cross-feature copies and generic `shared -> features` imports. Before completion: follow the [Definition of Done](ARCHITECTURE.md#definition-of-done-mandatory), run build, lint, parity/dependency checks and relevant tests; report untested combinations honestly.

## Priorities

1. Stabilize auth/tenant security contract with backend: replace browser-exposed `VITE_API_PASSWORD` if it is intended as a credential, and review persisted access tokens. Do not silently change requests.
2. Migrate app-shell composition out of generic `shared` and add route-level permission/module metadata backed by real user entitlements. Preserve existing URLs.
3. Move large customer/proposal/outreach route implementations into domain workspaces incrementally. Add tests around adapters and critical interactions.
4. Resolve duplicate DataTable copy after independent consumer verification; consolidate call/meeting ownership and Meta integration overlap with tested adapters.
5. Audit visible strings and directional positioning feature by feature; verify Arabic/English and light/dark on actual authenticated representative routes. Add semantic tokens where hardcoded surfaces fail.
6. Add backend workflow persistence/execution only after a defined API contract. Customer Service tickets/SLA/inbox should consume existing Customers, Tasks, Activities, Conversations and shared UI, not replicate them.

Status convention in documentation: **CURRENT** = verified code in use, **PARTIAL** = UI/API pieces but missing integration, **LEGACY** = maintained compatibility path, **PLANNED** = not implemented, **DEPRECATED** = scheduled for removal after consumer migration. Every roadmap item is PLANNED until code and checks prove otherwise.
