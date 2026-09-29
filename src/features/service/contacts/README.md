# features/service/contacts — Contacts & relationships (F1)

People with a lasting relationship to a **Customer** (the master record; there is no Account entity):
a guardian's children, a company's employees, a traveler's companions. Relationships
(`guardian_of`, `manager_of`, `spouse_of`, `employee_of`, tenant-extensible) will also drive portal
access in F5 (e.g. a guardian sees their children's records).

Not to be confused with **Participants** (people on one service record, e.g. a shipment recipient) —
those arrive with service records in F3.

| Path | Role |
|---|---|
| `api/contactsApi.js` | `GET/POST /api/tenant/customers/{id}/contacts`, `GET /api/tenant/contacts/setup`; hooks `useCustomerContacts`, `useContactsSetup`, `useCreateContact`. |
| `components/CustomerContactsPanel.jsx` | List with role, primary star, phone/email (LTR), relationships; "Add contact". `compact` for side panels. |
| `components/ContactFormDialog.jsx` | Name, phone, email, role, optional relation to an existing contact. |

Create payload: `{ name, phone?, email?, role_key, relation?: { from_contact_id, relation_type } }` —
read as "*from contact* is *relation_type* the new contact".

Used by: case detail (side panel), customer drawer Service tab.
Tests: `../mocks/handlers/contactsHandlers.test.js`.
