# Customer Directory

Customer Management's customer list lives here, separate from the Leads Center pages.

- `CustomerDirectoryPage.jsx` is rendered at `/customer-management` and `/customer-management/customers` and delegates industry rendering to `features/customer-management/customer-directory`.
- Data comes from `GET /api/tenant/customers/mine` through the existing `useDoneCustomers` query and pagination.
- Keep page-specific UI in this folder. Shared customer data access remains in `src/features/customers`.
