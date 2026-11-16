# Customer Management Industry Architecture Audit

Date: 2026-11-16  (Africa/Cairo)
Status: discovery report only; no Customer Management code was changed for this audit.

## Scope and limitation

This audit interprets Customer Management as the CRM Leads Center and its customer/lead workflows (`src/features/customers`, `src/features/leads`, and `src/pages/LeadsCenter`). It is distinct from the Customer Hub / Service Operations domain in `src/features/service`.

The checked-out repository is the frontend. No Laravel backend source, PHP files, migrations, or database schema are present here. Therefore backend tables, foreign keys, tenant industry storage, authorization rules, distribution execution, and live endpoint behavior cannot be independently verified. The frontend documents and API modules describe contracts but are not a substitute for backend inspection. No backend assumptions are proposed as facts.

## Executive summary

The application already has useful shared CRM capabilities and a separate, more mature industry-configuration pattern inside Customer Hub / Service Operations. However, the CRM Leads Center itself is still lead-centric and has no discovered industry engine, tenant industry resolver, industry package registry, or industry-specific adapter boundary.

Customer-related page composition is concentrated in `src/pages/LeadsCenter` (193 files). Its main `CustomersPage.jsx` is 1,502 lines and composes customer APIs, lead actions, deals, activities, conversations, products, users, and shared table/pipeline UI. `src/features/customers` contains 54 files with useful feature slices, but many core customer screens, the details drawer, table behavior, and proposal workflows still live under `pages/LeadsCenter`. The customer feature folder currently has no `README.md`.

The `/shipping` area is only a frontend navigation scaffold and placeholders; its own README explicitly says it has no live API or backend authorization. Shipping-specific customer-management rules cannot be identified from this repository. The existing Service domain includes an industry capability/terminology model and mock shipping templates, but it is a separate business context and must not be treated as the CRM shipping implementation.

## Current frontend structure

### Customer and lead ownership

- `features/customers/api/customersApi.js` owns tenant customer endpoints such as `/api/tenant/customers/data`, `/info/{id}`, `/create`, `/update/{id}`, `/lost`, `/mine`, `/retargeting`, deleted-customer operations, and customer deals.
- `features/customers/hooks/useCustomers.js` owns list/segment query hooks; `features/customers/lead-create` owns the lead creation drawer and payload model; `features/customers/lead-transfer` owns manual transfer/review; `features/customers/pipeline` owns the customer pipeline view and status movement; `features/customers/customer-deals` owns the customer deals workspace/timeline.
- `features/leads` owns lead actions, status changes, follow-ups, interests, sales-team assignment, and close/won/lost behavior. `features/definitions` owns tenant-defined statuses and tags.
- The documented model is `Customer` with a nested `Lead`; most person/status/source fields are read through `customer.lead.*`, and business actions use `lead_id` (`docs/2-SALES.md`, Domain model). This is an established contract that must not be flattened or renamed without a backend migration plan.
- Lead creation serializes `attributes` as a key/value object, but the inspected code does not establish a complete industry-aware field-definition engine for CRM customer records.

### Routes and UI composition

- `src/app/router/index.jsx` routes `/LeadsCenter` and its sub-pages through `CustomersLayout`.
- `src/pages/LeadsCenter/constants/customerNavigation.js` defines all/new/follow-up/inactive/done/retargeting/activity, segments, teams/distribution, duplicates, customization, import/export, trash, reports, automation, AI and settings navigation.
- `src/pages/LeadsCenter/CustomersPage.jsx` currently owns substantial orchestration and drawer wiring rather than acting as a thin route composition layer.
- Customer details/timeline, table columns, bulk actions, status board, import/export, customer 360, and proposal builder are spread across `src/pages/LeadsCenter` and its subfolders. Several feature slices are already extracted, so migration can proceed incrementally.
- Shared engines already available include DataTable, sub-sidebar, calendar, pipeline board, overlays, and workflow engine. These should be reused rather than forked for an industry.

### Industry-related implementation found

- `features/shipping` and `pages/customer-management/shipping` currently provide navigation and placeholder pages only; no shipment/claim API or business rules are connected.
- `features/service/core/capabilities` provides a Service-specific capabilities manifest, feature checks, and terminology resolution. `features/service/mocks/templates` includes a mock `shipping` template. `features/service/setup` contains template setup/versioning.
- The Service README explicitly says its sub-modules must not branch directly on industry and should use capabilities/terminology. This is useful architectural precedent, but it covers service cases/operations and mock/demo configuration, not CRM customer/lead APIs.
- No CRM `industry_key`, industry-to-module registry, tenant customer-management configuration API, or shipping CRM adapter was found in the inspected frontend paths.

## Risks and gaps

1. **Backend is not available here.** We cannot confirm where industry is stored, how a tenant's industry is returned, which tables are shared, whether shipping has custom customer columns, or what permissions and endpoint contracts exist.
2. **Domain coupling.** Leads Center page code combines customer list rendering with lead lifecycle, deals, activities, chat integrations, tasks, and proposals. Industry branching added in this state would likely spread conditionals across page components.
3. **Lead/customer identity contract.** Customer IDs and lead IDs are distinct in the documented model. A generic core must preserve both identities and existing `lead_id` action contracts.
4. **No CRM industry module boundary.** Existing CRM status/tag configuration is tenant-defined, but there is no verified industry-level configuration layer for modules, fields, terminology, workflows, or module permissions.
5. **Page-layer concentration.** The customer area is largely implemented under `pages/LeadsCenter`; large changes there risk broad regressions. The 1,502-line main page is a clear extraction candidate, but should not be rewritten wholesale.
6. **Do not reuse Service mock data as production configuration.** The Service industry template system is isolated and partly mock-backed. Reusing its concepts is reasonable; sharing its business objects, endpoints, or mock state with Leads Center is not established.
7. **Documentation divergence.** `src/locales/en/settings.js` describes Customer Management as relying on mock data, while the inspected Leads Center customer API calls live tenant endpoints. Feature-status copy should be reconciled before it is used to infer backend readiness.

## Recommended target architecture

Adopt the requested hybrid: **Shared Customer Core + Industry Packages + Tenant Configuration**.

```text
Customer Management
├── Shared core: customer/lead identity contracts, common UI/actions, query/API adapters
├── Capability modules: leads, contacts, profile, activities/timeline, distribution, tasks, notes/files
├── Industry packages: shipping first; later real-estate, manufacturing, services, etc.
└── Tenant configuration: selected industry, enabled modules, fields, labels, workflow and permissions
```

Rules for the target:

- Shared core owns behavior truly common across industries; industry-specific rules belong in packages/adapters, not `if (industry === ...)` branches in shared components.
- Industry packages implement explicit contracts and declare capabilities, terminology, field schemas, workflow definitions, and UI extensions. They do not duplicate customer identity, common timeline, or shared widgets.
- Tenant configuration is resolved once through an explicit tenant configuration contract. Components consume a normalized manifest rather than reading tenant/industry identifiers independently.
- Backend authorization remains authoritative. Frontend module visibility is not a security boundary.
- Preserve current routes, payloads, IDs, and query keys during early migration. Introduce adapters around the existing API before changing domain types.
- Keep CRM Customer Management and Customer Hub / Service Operations as separate bounded contexts. Share generic infrastructure only through stable contracts.

## Suggested migration plan

### Phase 0: backend contract discovery (blocking before backend-dependent implementation)

Obtain the backend repository or authoritative backend documents and verify:

- tenant industry/configuration source and response shape;
- existing customer, lead, contact, status, tag, activity, and custom-field tables and relationships;
- which shipping rules currently live in controllers/services/models and how they are scoped;
- existing APIs, request validation, authorization/permissions, module entitlements, and distribution behavior;
- migration constraints, data volume, and compatibility requirements.

Deliverable: an endpoint/schema/ownership matrix and a signed-off shared-vs-shipping rules inventory. Do not invent endpoints or database changes before this phase.

### Phase 1: frontend baseline and contracts

- Record representative current user journeys and API payloads for create, list, details, status, distribution, activities, timeline, and deletion/restore.
- Document stable `Customer`, `Lead`, and `IndustryManifest` contracts, including the separate customer and lead IDs.
- Identify query keys/realtime consumers and route compatibility requirements.
- Add a CRM Customer Management feature README and ownership map before moving existing files.

### Phase 2: establish the industry engine boundary

- Add a small industry registry/resolver behind an explicit configuration API contract; normalize unknown/missing configuration with a backward-compatible default only after product/backend agreement.
- Define interfaces for capabilities, terminology, field schema, workflow, module UI extensions, and permissions metadata.
- Keep the engine generic and dependency-free from specific industries; add contract-level tests.

### Phase 3: extract shared customer core incrementally

- Start with low-risk pure logic and API adapters, then extract customer table/drawer sections and timeline composition from `pages/LeadsCenter` into feature-owned modules.
- Keep route pages thin and retain existing URL/payload semantics through adapters.
- Migrate one user journey at a time; compare old/new outputs before removing compatibility paths.

### Phase 4: isolate Shipping Package

- Only after Phase 0 confirms real shipping rules and APIs, move those rules behind shipping adapters/package contracts.
- Keep common identity, activities, timeline, and UI in shared modules; place shipment-specific fields and transitions in Shipping.
- Replace `/shipping` placeholders with API-backed screens only from confirmed contracts; do not treat the current scaffold or Service mock template as proof of production behavior.

### Phase 5: tenant configuration and rollout

- Connect the verified tenant manifest, capability gates, dynamic fields, terminology, workflows, and permissions metadata.
- Roll out behind tenant-level configuration/feature flags, monitor API compatibility, and retain a rollback path.
- Add contract/integration tests for the active industry and regression coverage for generic tenants.

## Work performed for this report

- Inspected CRM customer/lead feature and page file inventories, route composition, API modules, customer payload model, sales-domain documentation, and shipping scaffold.
- Checked the repository for backend PHP/migration/schema files; none are present in this checkout.
- Compared CRM Customer Management with the separate Service industry-capability/template implementation.
- Created this audit report. No Customer Management code, backend contract, database schema, or API was changed or invented.

## Readiness decision

**Ready for architecture review; not ready for backend-dependent migration.** The next concrete dependency is access to the Laravel backend or authoritative schema/API/authorization documentation. After Phase 0 is complete and the target contracts are approved, implementation can start with feature ownership and customer/lead adapters while preserving current routes and behavior.
