# Customer Directory Feature

Updated: 2026-11-18 22:10 (Africa/Cairo).

`shared/` contains the reusable customer table and workspace shell. The active
template supplies the visible column IDs from `industryTemplateConfig.js`; add a
separate workspace only if an industry needs a genuinely different workflow.

The route page remains in `src/pages/customer-management/customer-directory`
and supplies the existing paginated customer query. The industry config only selects columns that
already exist in the shared table; it does not define new customer fields or change the API.

See [`../INDUSTRY-TEMPLATES.md`](../INDUSTRY-TEMPLATES.md) for the full config contract and extension checklist.
