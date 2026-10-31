# Customer Deals 360

Leads Center integration - 2026-10-17 22:16 (Africa/Cairo): `CustomerDealsCount` is used in the main customer table and the modern drawer quick identity header. It shows the server deals count with a customer-deals link, loading and retry states (count is display-only, not falsely sortable using customer IDs). HomeTab uses the full deals section. TimelineTab merges normalized lead logs with `customerDealTimeline` transaction events, sorted by the existing timeline date/user filters. Events use won_at/lost_at then added_at/created_at, never the container creation date or unrelated updated_at; missing dates remain unknown. `CustomerDealTimelineActivity` shows status, value, products and a selected-deal link. Deal events have namespaced association IDs, so they cannot collide with log IDs. Original status-change/audit activities remain; they are separate from transactions. Queries share the existing customer-deals cache. Deal or log errors do not erase the other successfully loaded source. `/LeadsCenter/done` keeps its dedicated minimal drawer.

Done drawer update: 2026-10-17 22:01 (Africa/Cairo). `CustomerSegmentTable` now chooses the dedicated `DoneCustomerDrawer` when `showCustomerDeals` is enabled. It renders supplied base table fields and `CustomerDealsDrawerSection` only, without the full customer drawer/tabs/actions/customer-info query. Other segments still use `CustomerDetailsDrawer`. This supersedes earlier timeline/home placement notes for the done page; standalone customer-deals routes and independent table columns are unchanged.

Placement and table columns update: 2026-10-17 21:51 (Africa/Cairo). The done-customer drawer section is now below tabs and visible only within timeline/home, not above the customer header. Each transaction has a dedicated open icon. `useCustomerDealColumns` fetches deals for loaded done customers using shared query options/cache (60-second freshness, no duplicate query for a customer ID). It adds ordinal columns Deal 1..N, where N is the largest loaded customer transaction count; a customer's nth transaction occupies column n, absent entries are empty. Column text supports search, filtering and sorting; open icons link to `/customers/{customerId}/deals?deal={dealId}`. Pending/error states are per customer. Other customer segments make no additional deals requests. This supersedes the earlier placement note below. Ordering follows the server response; columns are positions, not global deal IDs.

Endpoint correction: 2026-10-17 21:46 (Africa/Cairo). `contractsApi.getById` now uses `GET /api/tenant/deals/contract/{id}` (singular). This supersedes the earlier plural detail endpoint below. List and installment-payment endpoints are unchanged.

Drawer integration: 2026-10-17 21:39 (Africa/Cairo). `CustomerDealsDrawerSection` is exported from `features/customers` and enabled only by `DoneCustomersPage` through `CustomerSegmentTable` and the optional `CustomerDetailsDrawer.showCustomerDeals` flag. Mounted only while the drawer is open with a customer ID. Uses the same customer deals query and shows every deal, status, value, owner, product quantities and contract count. General link goes to `/customers/{customerId}/deals`; each deal links to `?deal={dealId}`. Appears above the drawer tabs, independent of the stored active tab. Other customer drawers remain unchanged.

Contract details update: 2026-10-17 21:36 (Africa/Cairo). Contract number and detail button open the existing public `ContractDrawer` from `features/deals`; it fetches `GET /api/tenant/deals/contracts/{contractId}` via `useDealContract` and `contractsApi.getById`. Only the clicked contract is requested. Existing inline data remains the customer-deals summary; the drawer uses the dedicated contract endpoint and its loading/error/retry states.

Updated: 2026-10-17 21:23 (Africa/Cairo).

Public exports from `features/customers`: `CustomerDealsWorkspace` and
`customerDealsPath(customerId, dealId?)`.

- `useCustomerDeals`: GET `/api/tenant/customers/{customerId}/deals` via `customersApi.getDeals`; query key `['customers', 'deals', String(customerId)]`. Authentication comes from httpClient.
- `customerDealsModel`: normalizes customer, summary and deals; builds reusable URLs.
- `CustomerDealsOverview`: customer contacts and server summary.
- `CustomerDealsWorkspace`: loading/error/empty states, refresh, search by deal name/contract number, status filters and expandable deals.
- `CustomerDealDetails`: owner, stage, value, date, loss reason, products, contracts, plans and installment schedule.

`deal_id` is the deal container; entry `id` is a deal-lead association. Customer ID is not lead ID.
All deals are included, including Lead-Center sales. Extend through separate components and ar/en keys under `customers.deals360`.
The supplied deals array is currently unpaginated. No currency is assumed. This read-only screen creates no duplicate contracts and accepts no payments.
