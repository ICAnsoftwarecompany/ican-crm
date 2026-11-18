# Customer Management Pages

This folder owns the page layer for Customer Management and Customer Hub. Customer operations
outside the Leads Center, technical support/tickets, service, shipping, subscriptions, and
industry-specific page modules belong here. Page components, layouts, and route composition are
organized by domain; reusable business logic and API implementations remain in `src/features`.

## Structure

- `industry-shipping/`: shipping layout, route definitions, and shipping workspace pages.
- `service/`: service operations, tickets, knowledge, subscriptions, records, contracts, and the
  existing `/customer-management/service/*` route tree.
- `reports/`: Customer Hub reports page shared by service and ticket routes.
- `my-work/`: Customer Management work queue page shared by service and ticket routes.
- `operations-settings/`: Customer Hub operational settings page shared by service and ticket routes.
- `ticket-module/`: ticket list and ticket detail route pages; ticket behavior remains in `src/features/service`.
- `knowledge-base/`: knowledge article list and editor route pages shared by service and ticket routes.
- `CustomerManagementLayout.jsx`: the unified sidebar and shell for `/customer-management/*`.
- `customerManagementRoutes.jsx`: route composition for shipping and ticket
  pages under the unified workspace.
- `<industry-or-domain>/`: add future customer-management or industry pages under a dedicated
  module folder here; do not create a parallel page root under `src/pages/`.

## Routes

- `/customer-management`: Customer Management operations home; it is separate from the dedicated
  `/LeadsCenter` CRM workspace.
- `/customer-management/shipping/*`: shipping overview, shipments, claims, reports, and settings
  (page components live in `industry-shipping/`).
- `/customer-management/tickets/*`: ticket cases, case detail, work queue, reports, knowledge,
  and ticket settings.

The route definitions live in `customerManagementRoutes.jsx`; the unified sidebar and layout live
in `CustomerManagementLayout.jsx`. Sales-team pages live separately in `src/pages/sales-teams/`
under `/LeadsCenter/teams/*`, and `src/pages/LeadsCenter/` owns the dedicated Leads Center CRM.
Neither is routed through `/customer-management`. Do not import their page components here; share
reusable behavior through feature modules. Existing `/LeadsCenter`, `/shipping`, and `/customer-management/service`
routes remain available; service and shipping page implementations live here. Add every new
Customer Management, support, or industry page here and keep its route and sidebar entry together.

Shipping remains a navigation scaffold, and Service/ticket data continues to use its existing
feature implementation. This folder does not introduce backend APIs or claim that those modules
are fully integrated with the CRM customer records.
