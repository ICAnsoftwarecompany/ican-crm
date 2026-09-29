# features/service/customer-360 — Service tab of the customer (F1)

`CustomerServiceTab` is the **Service** tab inside the existing customer drawer / page
(`pages/customers/components/CustomerDetailsDrawer`). Customer Service never builds a second customer
profile — it adds a tab to the one that exists.

- Mounted through `pages/customers/components/CustomerDetailsDrawer/tabs/CustomerServiceTabSlot.jsx`,
  which lazy-loads it (keeps Service out of the Leads Center chunk) and adapts the Leads Center row
  (`customer.lead.name/phone`) to `{ id, name, phone }`.
- F1 sections: the customer's cases (open count, list, new case) and contacts.
- Each later phase adds one section here: service records and batches (F3), assets / warranty /
  entitlements / contracts (F3), payment schedules (F4), feedback (F2), portfolio owner (F5).
