# Customer Management Features

Updated: 2026-11-18 22:10 (Africa/Cairo).

Customer-management-specific workflows are grouped here by capability. Shared
components consume the active industry's configuration; dedicated industry
components are added only when behavior or layout genuinely differs. Page
routes remain in `src/pages/customer-management`.

- `tickets/`: shared service-case engine configured with industry terminology.
- `reports/`: shared reports engine configured with the views enabled by industry.
- `customer-directory/`: shared customer table configured with industry-specific columns.
- `industryTemplateConfig.js`: single source for industry-specific presentation options.
- `industryTemplates.js`: active template query and fallback resolution.
- [`INDUSTRY-TEMPLATES.md`](INDUSTRY-TEMPLATES.md): runtime flow, config contract, extension guide, and known gaps.

When adding an industry, add its configuration to `industryTemplateConfig.js` and follow
`INDUSTRY-TEMPLATES.md`. Create a dedicated workspace only when the shared component cannot
represent a real workflow or presentation difference through configuration.
