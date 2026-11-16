# Customer Management Pages

This folder owns the page layer for Customer Management and Customer Hub. Customer operations
outside the Leads Center, technical support/tickets, service, shipping, teams, subscriptions, and
industry-specific page modules belong here. Page components, layouts, and route composition are
organized by domain; reusable business logic and API implementations remain in `src/features`.

## Structure

- `teams/`: sales teams, users, distribution rules, and team reports. Lead selection/manual
  distribution remains in the Leads Center area.
- `shipping/`: shipping layout, route definitions, and shipping workspace pages.
- `service/`: service operations pages, tickets, knowledge, reports, work, settings, subscriptions,
  records, contracts, and the existing `/service/*` route tree.
- `CustomerManagementLayout.jsx`: the unified sidebar and shell for `/customer-management/*`.
- `customerManagementRoutes.jsx`: route composition for the team, shipping, and ticket
  pages under the unified workspace.
- `<industry-or-domain>/`: add future customer-management or industry pages under a dedicated
  module folder here; do not create a parallel page root under `src/pages/`.

## Routes

- `/customer-management`: compatibility entry that redirects to `/LeadsCenter`, the dedicated
  Leads Center workspace.
- `/customer-management/teams/*`: sales teams, users, distribution rules, and team reports.
- `/customer-management/shipping/*`: shipping overview, shipments, claims, reports, and settings.
- `/customer-management/tickets/*`: ticket cases, case detail, work queue, reports, knowledge,
  and ticket settings.

The route definitions live in `customerManagementRoutes.jsx`; the unified sidebar and layout live
in `CustomerManagementLayout.jsx`. `src/pages/LeadsCenter/` is a separate, dedicated area for
Leads Center CRM pages and prospective-customer workflows. Do not import its page components here;
share reusable behavior through feature modules. Existing `/LeadsCenter`, `/shipping`, and `/service`
routes remain available; service and shipping page implementations live here. Add every new
Customer Management, support, or industry page here and keep its route and sidebar entry together.

Shipping remains a navigation scaffold, and Service/ticket data continues to use its existing
feature implementation. This folder does not introduce backend APIs or claim that those modules
are fully integrated with the CRM customer records.
