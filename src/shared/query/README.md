# Shared Query Policy

> Updated: 2026-11-15 21:12 (Africa/Cairo)

`queryPolicy.js` owns centralized React Query defaults, request priorities, and the shared request scheduler for the staff CRM.

## Public API

- `prioritizeQuery(queryFn, priority)` schedules a query function using the `page`, `supporting`, or `background` priority. The scheduler allows up to four participating requests at once and honors React Query cancellation while a request is still queued.
- `queryPolicyOptions(priority, overrides)` applies the matching cache/refetch defaults and stores the selected priority in query metadata. Explicit hook options may override defaults.
- `QUERY_CLIENT_DEFAULTS` supplies the staff `QueryProvider` defaults.
- `getQuerySchedulerSnapshot()` reports queued and in-flight counts for diagnostics.

## How to extend

Every new or modified query hook should use both `prioritizeQuery` and `queryPolicyOptions`. Mark route-critical data `page`, visible secondary-panel data `supporting`, and global counters/presence `background`. Set `enabled` false for inactive routes, closed drawers, or hidden panels. Keep query keys stable and shared for identical data.

The scheduler is opt-in so legacy hooks can migrate gradually. It does not preempt in-flight work and does not apply to mutations, uploads, direct transport calls, or realtime subscriptions. See [the architecture policy](../../../docs/1-ARCHITECTURE.md#query-priority-and-scheduling) and [project instructions](../../../CLAUDE.md).

## Known gaps

- Existing query hooks outside the migrated shell/domain hooks are not automatically scheduled yet; migrate them as they are changed.
- The customer portal has a separate QueryClient and requires a separate adoption pass.
