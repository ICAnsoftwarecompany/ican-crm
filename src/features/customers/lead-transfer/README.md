# Customer Import and Export

Updated: 2026-10-17 22:48 (Africa/Cairo).

Public `CustomerTransferWorkspace` composes `/LeadsCenter/import-export`. It has Import and Export tabs; UI strings are under `customers.transfer`.

- Import: CSV/XLS/XLSX first sheet parsed with SheetJS, supporting `name/phone/email/company/source/note` headings (Arabic aliases for the four contact fields). Text phones preserve leading zeroes; numeric Excel cells depend on the file's stored formatting. Rows can be reviewed/edited before saving; name and phone are required. The existing create endpoint is used per row with lead-only defaults and the current tenant/user. No invented upload endpoint.
- Retry: saved rows are skipped; failed rows retain errors and can be edited. Each row gets saved/failed state. A request that reached the server but lost its response cannot be made idempotent by this frontend; inspect the server before retrying ambiguous network failures.
- Manual: opens the same LeadCreateDrawer; successful submitted rows immediately appear in the review table while the drawer stays open. On desktop the drawer uses the shell push offset so review stays beside it; narrow screens use the standard overlay. Review is current-session only and does not invent customer IDs or imply unsaved drafts are saved.
- Export: fetches all cursor/paginated customer pages through `/api/tenant/customers/data` and downloads Excel or CSV. Detects repeated cursors/pages. Export fields are explicit in the workspace. Exported files contain customer contact information, not authentication tokens.

`CustomerReviewTable` is presentation; `customerTransfer` owns parsing and complete-list fetching. Backend remains responsible for authorization, validation and distribution. User identity and API password are supplied through the existing authenticated transport.
