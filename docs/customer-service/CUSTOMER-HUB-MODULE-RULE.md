# Customer Hub — Multi-Module Domain Rule

Updated: 2026-11-12 20:38 (Africa/Cairo)

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
