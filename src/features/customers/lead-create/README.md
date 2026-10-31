# Lead Creation Drawer

Updated: 2026-10-17 22:48 (Africa/Cairo).

Public `LeadCreateDrawer` (`open`, `onClose`, `onCreated(response, submittedCustomers)`) is used by the main Leads Center and import/manual review. It posts JSON to `/api/tenant/customers/create` through httpClient, using the current tenant resolver/user, not example IDs. Type is always `lead`; campaign/form/ad and lead IDs start null. Owner, automatic distribution, status, tag, source, link type/date, attributes, interested products/levels/notes and the main note are editable. Definitions/products/users supply dropdown data.

`leadCreateModel` owns defaults and request shape; `LeadExtraFields` owns attribute/interest editors. A successful save invalidates customer and lead queries, reports the submitted row for review, clears the form and focuses name without closing the drawer. Failed saves retain input. Pending saves block resubmission and closing. Backend validation messages are displayed. Do not assume an ID if the API does not return one. The legacy NewCustomerDialog remains for compatibility but CustomersPage no longer uses it.
