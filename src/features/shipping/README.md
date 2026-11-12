# Shipping domain module

Updated: 2026-11-13 00:19 (Africa/Cairo).

Owns shipping navigation and future shipment/claim UI, not the shared Customer or Case engine.

Public API: `navigation/shippingNavigation.js` exports `getShippingNavigation(t)`; `components/ShippingWorkspacePlaceholder.jsx` exports the temporary navigation-first page.

Extend with `api/`, `hooks/`, and dedicated components only after validating the existing Laravel shipping endpoints and response shapes. Never invent shipment records or copy customer data. Reports must use the shared reports engine once real data is available.

Known gaps: all shipping routes currently show a translated placeholder. No live API wiring, tenant entitlement API, or backend route authorization has been implemented. The shell is for sidebar review only.
