/**
 * React Query keys for the whole Service Operations area.
 * Every sub-module adds its keys here under `serviceKeys.all` so one
 * invalidation (e.g. after switching the mock industry template) refreshes
 * everything that belongs to Customer Service — and nothing else.
 */
export const serviceKeys = {
  all: ['service'],
  capabilities: () => [...serviceKeys.all, 'capabilities'],
}
