# Support module boundary

Updated: 2026-11-13 00:19 (Africa/Cairo).

Owns the future support-specific adapter and UI composition for tickets, queues, knowledge and SLA. The existing case/ticket implementation remains in `features/service/cases` and `features/service/settings`; do not duplicate it.

Public API: none yet. Current navigation reuses existing `/service/cases`, `/service/knowledge`, `/service/settings` routes. Extend this module only when real support-specific behavior is needed. Known gaps: backend support capability and permission mapping not yet available.
