# Customer Hub — Multi-Module Domain Rule

Updated: 2026-11-12 (Africa/Cairo)

## Rule CH-001 — Customer Hub is a multi-module platform

**Customer Hub (إدارة العملاء) is a parent platform, not one universal industry-specific module.** It can contain multiple independently configurable business-domain modules. Each domain module may have its own workflows, settings, navigation, screens, forms, case/ticket types, statuses, SLA policies, automation rules, and operational data, appropriate to its business needs.

### Example: Shipping Companies module (شركات الشحن)

A shipping module can manage shipments, tracking, delivery attempts, couriers, returns, proof of delivery, COD and shipping-related customer service. Its ticket experience may have shipment references, delivery exceptions, tracking-related fields, different queues and escalation rules, rather than the generic support-ticket setup.

This is an **example of the rule**, not an approval to implement new pages or backend APIs yet.

### Architectural boundaries

1. Customer Hub is the container and navigation entry point; domain modules are independently enabled/configured per tenant according to subscription, capabilities and permissions.
2. Domain-specific behavior is defined by module configuration, schemas, registries, policies and reusable engines—not scattered hardcoded `if (industry === 'shipping')` branches.
3. Shared foundations remain single-source-of-truth: Customer identity, contacts, conversations, tasks, calendar, teams, assignment, permissions, files and workflow engine. No parallel CRM or duplicate ticket engine per domain.
4. Cases remain a shared engine with **module-scoped** types, forms, statuses/pipelines, queues, SLA, views, and rules. Modules may supply specialized case UI and contextual actions without duplicating the underlying case lifecycle.
5. A domain module owns its business-specific records, screens, operational settings and integrations, while respecting tenant isolation and shared API conventions.
6. Module enable/disable must preserve historical records; modules with existing data become read-only where applicable, rather than deleting records.
7. Domain modules may be combined for one tenant. Cross-module relationships use explicit stable IDs and shared contracts, not copied customer data.
8. Frontend implementations must respect existing `src/features/service` architecture, `createServiceApi(moduleKey)`, service query keys, i18n (ar/en), RTL/LTR, semantic theme tokens and shared UI engines.
9. This rule extends the current **industry templates + capabilities** approach: a template can preconfigure one or more modules, but a module is not merely a label or a visual preset. Module-specific capabilities and operational boundaries are first-class.
10. No existing routes, endpoints, contracts or mock/live flags are changed by this decision alone. Actual module boundaries, API contracts, permission scopes and migrations require a separate implementation plan.

### Future module checklist

For every new domain module, define: identifier and purpose; enabled capabilities; data entities and relationships; screens/navigation; settings; cases and ticket schema; pipelines and SLA; workflows and integrations; permission scopes; mock/live API status; tests; documentation.

### Relationship to existing specification

This rule supersedes any interpretation that Customer Hub is a single uniform experience for every industry. It **does not** supersede the decisions to reuse shared CRM engines, use configuration instead of industry-specific conditionals, or retain a common Case engine. Refer to `docs/customer-service/SERVICE-BRIEF.md` and `docs/4-CUSTOMER-SERVICE.md` for existing foundations.

## Rule CH-002 — Primary industry is the tenant foundation

Each tenant has **one primary industry** chosen at tenant provisioning (for example, `shipping`). This is a foundational business-domain profile, not simply a menu filter. It determines the tenant's initial domain model, primary workflows, default navigation, terminology, onboarding configuration, and baseline capabilities. The tenant can then enable **additional optional modules** such as `service`, `support`, `subscriptions`, and other compatible modules, subject to subscription and permissions.

### Distinguish industry from module

- **Primary industry:** the tenant's business identity and baseline operating experience; exactly one primary industry per tenant at a time.
- **Module:** a separately enabled capability/domain package that can supplement the primary industry. A domain may serve as a primary industry for one tenant and as an optional module for another, where supported by explicit configuration.
- **Shared core:** customer identity, tenant boundaries, teams, permissions, assignment, conversations, and reusable workflow/case engines; never duplicated per industry.
- **Industry profile:** declarative configuration of default modules, business terminology, forms, case types, status pipelines, SLA policies, and navigation. Defaults are overridable only where the module's contract allows.

### Example tenant configurations

| Tenant | Primary industry | Additional modules |
| --- | --- | --- |
| Shipping company | `shipping` | `service`, `support` |
| Technical support provider | `technical_support` | `service`, `subscriptions` |

The examples are illustrative, not a declaration that all modules or APIs are already implemented.

### Provisioning and runtime requirements

1. Persist a stable `primary_industry_key` on the tenant and separate tenant-module enablement records; do not infer industry from the presence of modules.
2. Resolve tenant configuration as: platform defaults → primary-industry defaults → enabled-module settings → permitted tenant overrides. Define explicit conflict resolution and validate dependencies.
3. A primary industry supplies the baseline domain experience, but optional modules must remain independently addressable, configurable, permissioned, and upgradeable.
4. Module availability and cross-module data access must be enforced by the backend, not only by frontend route/menu visibility.
5. Changes to the primary industry are a controlled migration operation, not an ordinary settings toggle. Preserve historical data and record compatibility decisions.
6. Existing `/api/tenant/shipping/*`, `/api/tenant/support/*`, `/api/tenant/service/*`, and `/api/tenant/subscription/*` API families should be mapped to the appropriate domain/module adapters without assuming that the endpoint prefix alone determines the tenant's primary industry.
7. Do not introduce new API endpoints or modify existing contracts solely to document this rule. Tenant industry selection, module catalog, dependency model, and activation APIs must be agreed with backend owners before implementation.

**Interpretation:** CH-002 refines CH-001. Multiple enabled modules are allowed, but they are composed **around a mandatory primary industry** rather than treating every module as an equal tenant foundation.
