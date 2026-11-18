# Customer Management Reports

Updated: 2026-11-18 22:10 (Africa/Cairo).

The shared report engine remains in `src/features/service/reports`. Its
available tabs are configured per industry in `industryTemplateConfig.js`. A
separate report workspace is warranted only when a sector needs different
report data or interactions.

Current templates restrict the existing tabs; they do not provide sector-specific metrics or data
sources. See [`../INDUSTRY-TEMPLATES.md`](../INDUSTRY-TEMPLATES.md) before extending this feature.
